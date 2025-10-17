<?php

namespace App\Http\Controllers;

use App\Http\Requests\ImportTelegramaRequest;
use App\Http\Requests\StoreTelegramaRequest;
use App\Http\Requests\UpdateTelegramaRequest;
use App\Models\Telegrama;
use App\Services\TelegramaImportService;
use App\Services\TelegramaValidationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class TelegramaController extends Controller
{
    protected TelegramaValidationService $validationService;
    protected TelegramaImportService $importService;

    public function __construct(
        TelegramaValidationService $validationService,
        TelegramaImportService $importService
    ) {
        $this->validationService = $validationService;
        $this->importService = $importService;
    }

    /**
     * Display a listing of telegramas.
     *
     * GET /api/telegramas
     */
    public function index(Request $request): JsonResponse
    {
        $query = Telegrama::with(['provincia', 'candidatos']);

        // Filtros
        if ($request->has('id_mesa')) {
            $query->where('id_mesa', 'like', '%' . $request->id_mesa . '%');
        }

        if ($request->has('provincia_id')) {
            $query->where('provincia_id', $request->provincia_id);
        }

        if ($request->has('estado')) {
            $query->where('estado', $request->estado);
        }

        if ($request->has('circuito_escuela')) {
            $query->where('circuito_escuela', 'like', '%' . $request->circuito_escuela . '%');
        }

        if ($request->has('fecha_desde')) {
            $query->where('fecha_carga', '>=', $request->fecha_desde);
        }

        if ($request->has('fecha_hasta')) {
            $query->where('fecha_carga', '<=', $request->fecha_hasta);
        }

        // Ordenamiento
        $sortBy = $request->input('sort_by', 'fecha_carga');
        $sortOrder = $request->input('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Paginación
        if ($request->boolean('paginate', true)) {
            $telegramas = $query->paginate($request->input('per_page', 15));
        } else {
            $telegramas = $query->get();
        }

        return response()->json([
            'success' => true,
            'data' => $telegramas,
        ]);
    }

    /**
     * Store a newly created telegrama.
     *
     * POST /api/telegramas
     */
    public function store(StoreTelegramaRequest $request): JsonResponse
    {
        try {
            DB::beginTransaction();

            // Crear telegrama
            $telegrama = Telegrama::create([
                'id_mesa' => $request->id_mesa,
                'provincia_id' => $request->provincia_id,
                'circuito_escuela' => $request->circuito_escuela,
                'total_electores' => $request->total_electores,
                'total_votos' => $request->total_votos,
                'votos_blanco' => $request->votos_blanco ?? 0,
                'votos_nulos' => $request->votos_nulos ?? 0,
                'votos_impugnados' => $request->votos_impugnados ?? 0,
                'usuario_carga_id' => auth()->id(),
                'fecha_carga' => now(),
                'estado' => $request->estado ?? Telegrama::ESTADO_PENDIENTE,
                'motivo_rechazo' => $request->motivo_rechazo,
            ]);

            // Asociar candidatos con sus votos
            if ($request->has('candidatos') && is_array($request->candidatos)) {
                $votosPorCandidato = [];
                foreach ($request->candidatos as $candidato) {
                    $votosPorCandidato[$candidato['candidato_id']] = ['votos' => $candidato['votos']];
                }
                $telegrama->candidatos()->sync($votosPorCandidato);
            }

            DB::commit();

            // Validar telegrama
            $validacion = $this->validationService->validarTelegrama($telegrama->fresh(['candidatos', 'provincia']));

            return response()->json([
                'success' => true,
                'message' => 'Telegrama creado exitosamente.',
                'data' => $telegrama->fresh(['candidatos', 'provincia']),
                'validacion' => $validacion,
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al crear telegrama', ['error' => $e->getMessage()]);

            return response()->json([
                'success' => false,
                'message' => 'Error al crear el telegrama: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified telegrama.
     *
     * GET /api/telegramas/{id}
     */
    public function show(Telegrama $telegrama, Request $request): JsonResponse
    {
        $telegrama->load(['provincia', 'candidatos', 'usuarioCarga', 'usuarioValidacion']);

        $response = [
            'success' => true,
            'data' => $telegrama,
        ];

        // Incluir validación si se solicita
        if ($request->boolean('with_validacion')) {
            $response['validacion'] = $this->validationService->validarTelegrama($telegrama);
        }

        // Incluir resumen si se solicita
        if ($request->boolean('with_resumen')) {
            $response['resumen'] = $telegrama->getResumen();
        }

        return response()->json($response);
    }

    /**
     * Update the specified telegrama.
     *
     * PUT/PATCH /api/telegramas/{id}
     */
    public function update(UpdateTelegramaRequest $request, Telegrama $telegrama): JsonResponse
    {
        try {
            DB::beginTransaction();

            // Actualizar campos básicos
            $telegrama->update($request->only([
                'id_mesa',
                'provincia_id',
                'circuito_escuela',
                'total_electores',
                'total_votos',
                'votos_blanco',
                'votos_nulos',
                'votos_impugnados',
                'estado',
                'motivo_rechazo',
            ]));

            // Actualizar candidatos si se envían
            if ($request->has('candidatos') && is_array($request->candidatos)) {
                $votosPorCandidato = [];
                foreach ($request->candidatos as $candidato) {
                    $votosPorCandidato[$candidato['candidato_id']] = ['votos' => $candidato['votos']];
                }
                $telegrama->candidatos()->sync($votosPorCandidato);
            }

            DB::commit();

            // Validar telegrama actualizado
            $validacion = $this->validationService->validarTelegrama($telegrama->fresh(['candidatos', 'provincia']));

            return response()->json([
                'success' => true,
                'message' => 'Telegrama actualizado exitosamente.',
                'data' => $telegrama->fresh(['candidatos', 'provincia']),
                'validacion' => $validacion,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al actualizar telegrama', ['error' => $e->getMessage()]);

            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar el telegrama: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified telegrama.
     *
     * DELETE /api/telegramas/{id}
     */
    public function destroy(Telegrama $telegrama): JsonResponse
    {
        $telegrama->delete();

        return response()->json([
            'success' => true,
            'message' => 'Telegrama eliminado exitosamente.',
        ]);
    }

    /**
     * Validar un telegrama.
     *
     * POST /api/telegramas/{id}/validar
     */
    public function validar(Telegrama $telegrama): JsonResponse
    {
        $validacion = $this->validationService->validarTelegrama($telegrama);

        if (!$validacion['valido']) {
            return response()->json([
                'success' => false,
                'message' => 'El telegrama no pasó las validaciones.',
                'validacion' => $validacion,
            ], 422);
        }

        // Marcar como validado
        $telegrama->validar(auth()->id());

        return response()->json([
            'success' => true,
            'message' => 'Telegrama validado exitosamente.',
            'data' => $telegrama->fresh(),
            'validacion' => $validacion,
        ]);
    }

    /**
     * Rechazar un telegrama.
     *
     * POST /api/telegramas/{id}/rechazar
     */
    public function rechazar(Request $request, Telegrama $telegrama): JsonResponse
    {
        $request->validate([
            'motivo' => 'required|string|max:500',
        ]);

        $telegrama->rechazar($request->motivo, auth()->id());

        return response()->json([
            'success' => true,
            'message' => 'Telegrama rechazado.',
            'data' => $telegrama->fresh(),
        ]);
    }

    /**
     * Importar telegramas desde archivo CSV o JSON.
     *
     * POST /api/telegramas/import
     */
    public function import(ImportTelegramaRequest $request): JsonResponse
    {
        try {
            $resultado = null;

            if ($request->hasFile('archivo')) {
                // Importar desde archivo
                $archivo = $request->file('archivo');
                $rutaTemporal = $archivo->store('temp');
                $rutaCompleta = Storage::path($rutaTemporal);

                if ($request->tipo === 'csv') {
                    $resultado = $this->importService->importarDesdeCSV($rutaCompleta, auth()->id());
                } else {
                    $resultado = $this->importService->importarDesdeJSON($rutaCompleta, auth()->id());
                }

                // Eliminar archivo temporal
                Storage::delete($rutaTemporal);
            } elseif ($request->has('datos')) {
                // Importar desde JSON string
                $resultado = $this->importService->importarDesdeJSONString($request->datos, auth()->id());
            }

            return response()->json([
                'success' => true,
                'message' => "Importación completada. {$resultado['exitosos']} telegramas importados, {$resultado['fallidos']} fallidos.",
                'data' => $resultado,
            ]);
        } catch (\Exception $e) {
            Log::error('Error en importación de telegramas', ['error' => $e->getMessage()]);

            return response()->json([
                'success' => false,
                'message' => 'Error en la importación: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Exportar telegramas a CSV.
     *
     * GET /api/telegramas/export/csv
     */
    public function exportCSV(Request $request): JsonResponse
    {
        try {
            $filtros = $request->only(['provincia_id', 'estado', 'fecha_desde', 'fecha_hasta']);
            $rutaArchivo = $this->importService->exportarCSV($filtros);

            return response()->json([
                'success' => true,
                'message' => 'Exportación completada.',
                'archivo' => basename($rutaArchivo),
                'ruta' => $rutaArchivo,
            ]);
        } catch (\Exception $e) {
            Log::error('Error en exportación CSV', ['error' => $e->getMessage()]);

            return response()->json([
                'success' => false,
                'message' => 'Error en la exportación: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Exportar telegramas a JSON.
     *
     * GET /api/telegramas/export/json
     */
    public function exportJSON(Request $request): JsonResponse
    {
        try {
            $filtros = $request->only(['provincia_id', 'estado', 'fecha_desde', 'fecha_hasta']);
            $rutaArchivo = $this->importService->exportarJSON($filtros);

            return response()->json([
                'success' => true,
                'message' => 'Exportación completada.',
                'archivo' => basename($rutaArchivo),
                'ruta' => $rutaArchivo,
            ]);
        } catch (\Exception $e) {
            Log::error('Error en exportación JSON', ['error' => $e->getMessage()]);

            return response()->json([
                'success' => false,
                'message' => 'Error en la exportación: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Obtener estadísticas generales.
     *
     * GET /api/telegramas/estadisticas
     */
    public function estadisticas(Request $request): JsonResponse
    {
        $query = Telegrama::query();

        // Aplicar filtros
        if ($request->has('provincia_id')) {
            $query->where('provincia_id', $request->provincia_id);
        }

        if ($request->has('fecha_desde')) {
            $query->where('fecha_carga', '>=', $request->fecha_desde);
        }

        if ($request->has('fecha_hasta')) {
            $query->where('fecha_carga', '<=', $request->fecha_hasta);
        }

        $estadisticas = [
            'total_telegramas' => $query->count(),
            'telegramas_validados' => (clone $query)->where('estado', Telegrama::ESTADO_VALIDADO)->count(),
            'telegramas_pendientes' => (clone $query)->where('estado', Telegrama::ESTADO_PENDIENTE)->count(),
            'telegramas_rechazados' => (clone $query)->where('estado', Telegrama::ESTADO_RECHAZADO)->count(),
            'total_electores' => $query->sum('total_electores'),
            'total_votos' => $query->sum('total_votos'),
            'total_votos_blanco' => $query->sum('votos_blanco'),
            'total_votos_nulos' => $query->sum('votos_nulos'),
            'total_votos_impugnados' => $query->sum('votos_impugnados'),
        ];

        // Calcular porcentaje de participación promedio
        $totalElectores = $estadisticas['total_electores'];
        $totalVotos = $estadisticas['total_votos'];

        $estadisticas['porcentaje_participacion'] = $totalElectores > 0
            ? round(($totalVotos / $totalElectores) * 100, 2)
            : 0;

        return response()->json([
            'success' => true,
            'data' => $estadisticas,
        ]);
    }

    /**
     * Obtener resumen de un telegrama.
     *
     * GET /api/telegramas/{id}/resumen
     */
    public function resumen(Telegrama $telegrama): JsonResponse
    {
        $resumen = $telegrama->getResumen();

        return response()->json([
            'success' => true,
            'data' => $resumen,
        ]);
    }
}
