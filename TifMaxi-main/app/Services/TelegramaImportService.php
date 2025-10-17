<?php

namespace App\Services;

use App\Models\Candidato;
use App\Models\Provincia;
use App\Models\Telegrama;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class TelegramaImportService
{
    protected TelegramaValidationService $validationService;

    public function __construct(TelegramaValidationService $validationService)
    {
        $this->validationService = $validationService;
    }

    /**
     * Importar telegramas desde array de datos (CSV/JSON parseado)
     *
     * @param array $datos
     * @param int|null $usuarioId
     * @return array
     */
    public function importarTelegramas(array $datos, ?int $usuarioId = null): array
    {
        $resultados = [
            'exitosos' => 0,
            'fallidos' => 0,
            'errores' => [],
            'telegramas_creados' => [],
        ];

        // Validar lote completo primero
        $validacionLote = $this->validationService->validarLote($datos);

        if (!$validacionLote['valido']) {
            return [
                'exitosos' => 0,
                'fallidos' => count($datos),
                'errores' => $validacionLote['errores_generales'],
                'detalles_validacion' => $validacionLote,
            ];
        }

        // Procesar cada telegrama en una transacción
        foreach ($datos as $index => $datosTelegrama) {
            try {
                DB::beginTransaction();

                $telegrama = $this->crearTelegrama($datosTelegrama, $usuarioId);

                DB::commit();

                $resultados['exitosos']++;
                $resultados['telegramas_creados'][] = [
                    'id' => $telegrama->id,
                    'id_mesa' => $telegrama->id_mesa,
                    'estado' => $telegrama->estado,
                ];
            } catch (\Exception $e) {
                DB::rollBack();

                $resultados['fallidos']++;
                $resultados['errores'][] = [
                    'indice' => $index,
                    'id_mesa' => $datosTelegrama['id_mesa'] ?? 'N/A',
                    'error' => $e->getMessage(),
                ];

                Log::error('Error al importar telegrama', [
                    'indice' => $index,
                    'datos' => $datosTelegrama,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return $resultados;
    }

    /**
     * Crear un telegrama individual con sus votos
     *
     * @param array $datos
     * @param int|null $usuarioId
     * @return Telegrama
     */
    public function crearTelegrama(array $datos, ?int $usuarioId = null): Telegrama
    {
        // Validar datos básicos
        $validacion = $this->validationService->validarDatos($datos);

        if (!$validacion['valido']) {
            throw new \InvalidArgumentException('Datos inválidos: ' . implode(', ', $validacion['errores']));
        }

        // Crear telegrama
        $telegrama = Telegrama::create([
            'id_mesa' => $datos['id_mesa'],
            'provincia_id' => $datos['provincia_id'],
            'circuito_escuela' => $datos['circuito_escuela'],
            'total_electores' => $datos['total_electores'],
            'votos_blanco' => $datos['votos_blanco'] ?? 0,
            'votos_nulos' => $datos['votos_nulos'] ?? 0,
            'votos_impugnados' => $datos['votos_impugnados'] ?? 0,
            'total_votos' => $datos['total_votos'],
            'usuario_carga_id' => $usuarioId,
            'fecha_carga' => now(),
            'estado' => Telegrama::ESTADO_PENDIENTE,
        ]);

        // Asociar candidatos con sus votos
        if (isset($datos['candidatos']) && is_array($datos['candidatos'])) {
            $this->asociarCandidatos($telegrama, $datos['candidatos']);
        }

        // Validar telegrama completo
        $validacionCompleta = $this->validationService->validarTelegrama($telegrama);

        if ($validacionCompleta['valido']) {
            // Auto-validar si pasa todas las validaciones
            $telegrama->validar($usuarioId);
        } else {
            // Marcar como pendiente con observaciones
            Log::warning('Telegrama creado pero con errores de validación', [
                'id_mesa' => $telegrama->id_mesa,
                'errores' => $validacionCompleta['errores'],
            ]);
        }

        return $telegrama->fresh(['candidatos', 'provincia']);
    }

    /**
     * Asociar candidatos al telegrama con sus votos
     *
     * @param Telegrama $telegrama
     * @param array $candidatos Array de ['candidato_id' => X, 'votos' => Y]
     */
    protected function asociarCandidatos(Telegrama $telegrama, array $candidatos): void
    {
        $votosPorCandidato = [];

        foreach ($candidatos as $candidato) {
            $candidatoId = $candidato['candidato_id'];
            $votos = $candidato['votos'] ?? 0;

            // Validar que el candidato existe
            if (!Candidato::find($candidatoId)) {
                throw new \InvalidArgumentException("El candidato con ID {$candidatoId} no existe.");
            }

            $votosPorCandidato[$candidatoId] = ['votos' => $votos];
        }

        // Sincronizar candidatos con sus votos
        $telegrama->candidatos()->sync($votosPorCandidato);
    }

    /**
     * Importar desde CSV
     *
     * @param string $rutaArchivo
     * @param int|null $usuarioId
     * @return array
     */
    public function importarDesdeCSV(string $rutaArchivo, ?int $usuarioId = null): array
    {
        if (!file_exists($rutaArchivo)) {
            throw new \InvalidArgumentException("El archivo no existe: {$rutaArchivo}");
        }

        $datos = $this->parsearCSV($rutaArchivo);

        return $this->importarTelegramas($datos, $usuarioId);
    }

    /**
     * Parsear archivo CSV
     *
     * Formato esperado del CSV:
     * id_mesa,provincia_id,circuito_escuela,total_electores,total_votos,votos_blanco,votos_nulos,votos_impugnados,candidatos
     *
     * El campo 'candidatos' debe ser un JSON string: [{"candidato_id":1,"votos":100},{"candidato_id":2,"votos":50}]
     *
     * @param string $rutaArchivo
     * @return array
     */
    protected function parsearCSV(string $rutaArchivo): array
    {
        $datos = [];
        $handle = fopen($rutaArchivo, 'r');

        if ($handle === false) {
            throw new \RuntimeException("No se pudo abrir el archivo CSV: {$rutaArchivo}");
        }

        // Leer encabezados
        $encabezados = fgetcsv($handle);

        if ($encabezados === false) {
            fclose($handle);
            throw new \RuntimeException("El archivo CSV está vacío o no tiene encabezados.");
        }

        // Leer filas
        $linea = 1;
        while (($fila = fgetcsv($handle)) !== false) {
            $linea++;

            if (count($fila) !== count($encabezados)) {
                Log::warning("Fila {$linea} del CSV tiene un número incorrecto de columnas. Saltando.");
                continue;
            }

            $registro = array_combine($encabezados, $fila);

            // Parsear candidatos si vienen como JSON
            if (isset($registro['candidatos']) && is_string($registro['candidatos'])) {
                $candidatos = json_decode($registro['candidatos'], true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    $registro['candidatos'] = $candidatos;
                } else {
                    Log::warning("Error al parsear JSON de candidatos en línea {$linea}: " . json_last_error_msg());
                    $registro['candidatos'] = [];
                }
            }

            // Convertir tipos numéricos
            $registro['provincia_id'] = (int) $registro['provincia_id'];
            $registro['total_electores'] = (int) $registro['total_electores'];
            $registro['total_votos'] = (int) $registro['total_votos'];
            $registro['votos_blanco'] = (int) ($registro['votos_blanco'] ?? 0);
            $registro['votos_nulos'] = (int) ($registro['votos_nulos'] ?? 0);
            $registro['votos_impugnados'] = (int) ($registro['votos_impugnados'] ?? 0);

            $datos[] = $registro;
        }

        fclose($handle);

        return $datos;
    }

    /**
     * Importar desde JSON
     *
     * @param string $rutaArchivo
     * @param int|null $usuarioId
     * @return array
     */
    public function importarDesdeJSON(string $rutaArchivo, ?int $usuarioId = null): array
    {
        if (!file_exists($rutaArchivo)) {
            throw new \InvalidArgumentException("El archivo no existe: {$rutaArchivo}");
        }

        $contenido = file_get_contents($rutaArchivo);
        $datos = json_decode($contenido, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \RuntimeException("Error al parsear JSON: " . json_last_error_msg());
        }

        if (!is_array($datos)) {
            throw new \InvalidArgumentException("El JSON debe contener un array de telegramas.");
        }

        return $this->importarTelegramas($datos, $usuarioId);
    }

    /**
     * Importar desde string JSON
     *
     * @param string $jsonString
     * @param int|null $usuarioId
     * @return array
     */
    public function importarDesdeJSONString(string $jsonString, ?int $usuarioId = null): array
    {
        $datos = json_decode($jsonString, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \RuntimeException("Error al parsear JSON: " . json_last_error_msg());
        }

        if (!is_array($datos)) {
            throw new \InvalidArgumentException("El JSON debe contener un array de telegramas.");
        }

        return $this->importarTelegramas($datos, $usuarioId);
    }

    /**
     * Exportar telegramas a CSV
     *
     * @param array $filtros
     * @return string Ruta del archivo generado
     */
    public function exportarCSV(array $filtros = []): string
    {
        $query = Telegrama::with(['provincia', 'candidatos']);

        // Aplicar filtros
        if (isset($filtros['provincia_id'])) {
            $query->where('provincia_id', $filtros['provincia_id']);
        }

        if (isset($filtros['estado'])) {
            $query->where('estado', $filtros['estado']);
        }

        if (isset($filtros['fecha_desde'])) {
            $query->where('fecha_carga', '>=', $filtros['fecha_desde']);
        }

        if (isset($filtros['fecha_hasta'])) {
            $query->where('fecha_carga', '<=', $filtros['fecha_hasta']);
        }

        $telegramas = $query->get();

        // Crear archivo temporal
        $rutaArchivo = storage_path('app/exports/telegramas_' . date('Y-m-d_His') . '.csv');
        $directorio = dirname($rutaArchivo);

        if (!is_dir($directorio)) {
            mkdir($directorio, 0755, true);
        }

        $handle = fopen($rutaArchivo, 'w');

        // Escribir encabezados
        fputcsv($handle, [
            'id_mesa',
            'provincia',
            'circuito_escuela',
            'total_electores',
            'total_votos',
            'votos_blanco',
            'votos_nulos',
            'votos_impugnados',
            'estado',
            'fecha_carga',
            'candidatos',
        ]);

        // Escribir datos
        foreach ($telegramas as $telegrama) {
            $candidatos = $telegrama->candidatos->map(function ($candidato) {
                return [
                    'candidato_id' => $candidato->id,
                    'nombre' => $candidato->nombre_completo,
                    'votos' => $candidato->pivot->votos,
                ];
            })->toArray();

            fputcsv($handle, [
                $telegrama->id_mesa,
                $telegrama->provincia->nombre,
                $telegrama->circuito_escuela,
                $telegrama->total_electores,
                $telegrama->total_votos,
                $telegrama->votos_blanco,
                $telegrama->votos_nulos,
                $telegrama->votos_impugnados,
                $telegrama->estado,
                $telegrama->fecha_carga?->format('Y-m-d H:i:s'),
                json_encode($candidatos),
            ]);
        }

        fclose($handle);

        return $rutaArchivo;
    }

    /**
     * Exportar telegramas a JSON
     *
     * @param array $filtros
     * @return string Ruta del archivo generado
     */
    public function exportarJSON(array $filtros = []): string
    {
        $query = Telegrama::with(['provincia', 'candidatos']);

        // Aplicar filtros (igual que en exportarCSV)
        if (isset($filtros['provincia_id'])) {
            $query->where('provincia_id', $filtros['provincia_id']);
        }

        if (isset($filtros['estado'])) {
            $query->where('estado', $filtros['estado']);
        }

        if (isset($filtros['fecha_desde'])) {
            $query->where('fecha_carga', '>=', $filtros['fecha_desde']);
        }

        if (isset($filtros['fecha_hasta'])) {
            $query->where('fecha_carga', '<=', $filtros['fecha_hasta']);
        }

        $telegramas = $query->get();

        $datos = $telegramas->map(function ($telegrama) {
            return [
                'id_mesa' => $telegrama->id_mesa,
                'provincia' => $telegrama->provincia->nombre,
                'provincia_id' => $telegrama->provincia_id,
                'circuito_escuela' => $telegrama->circuito_escuela,
                'total_electores' => $telegrama->total_electores,
                'total_votos' => $telegrama->total_votos,
                'votos_blanco' => $telegrama->votos_blanco,
                'votos_nulos' => $telegrama->votos_nulos,
                'votos_impugnados' => $telegrama->votos_impugnados,
                'estado' => $telegrama->estado,
                'fecha_carga' => $telegrama->fecha_carga?->format('Y-m-d H:i:s'),
                'candidatos' => $telegrama->candidatos->map(function ($candidato) {
                    return [
                        'candidato_id' => $candidato->id,
                        'nombre_completo' => $candidato->nombre_completo,
                        'cargo' => $candidato->cargo,
                        'votos' => $candidato->pivot->votos,
                    ];
                })->toArray(),
            ];
        })->toArray();

        // Crear archivo
        $rutaArchivo = storage_path('app/exports/telegramas_' . date('Y-m-d_His') . '.json');
        $directorio = dirname($rutaArchivo);

        if (!is_dir($directorio)) {
            mkdir($directorio, 0755, true);
        }

        file_put_contents($rutaArchivo, json_encode($datos, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        return $rutaArchivo;
    }
}
