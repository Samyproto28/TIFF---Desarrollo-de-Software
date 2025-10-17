<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCandidatoRequest;
use App\Http\Requests\UpdateCandidatoRequest;
use App\Models\Candidato;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CandidatoController extends Controller
{
    /**
     * Display a listing of candidatos.
     *
     * GET /api/candidatos
     */
    public function index(Request $request): JsonResponse
    {
        $query = Candidato::with('provincia');

        // Filtros
        if ($request->has('nombre')) {
            $query->where('nombre_completo', 'like', '%' . $request->nombre . '%');
        }

        if ($request->has('cargo')) {
            $query->where('cargo', $request->cargo);
        }

        if ($request->has('provincia_id')) {
            $query->where('provincia_id', $request->provincia_id);
        }

        if ($request->has('lista_alianza')) {
            $query->where('lista_alianza', 'like', '%' . $request->lista_alianza . '%');
        }

        // Ordenamiento
        $sortBy = $request->input('sort_by', 'nombre_completo');
        $sortOrder = $request->input('sort_order', 'asc');
        $query->orderBy($sortBy, $sortOrder);

        // Paginación
        if ($request->boolean('paginate', true)) {
            $candidatos = $query->paginate($request->input('per_page', 15));
        } else {
            $candidatos = $query->get();
        }

        return response()->json([
            'success' => true,
            'data' => $candidatos,
        ]);
    }

    /**
     * Store a newly created candidato.
     *
     * POST /api/candidatos
     */
    public function store(StoreCandidatoRequest $request): JsonResponse
    {
        $candidato = Candidato::create($request->validated());
        $candidato->load('provincia');

        return response()->json([
            'success' => true,
            'message' => 'Candidato creado exitosamente.',
            'data' => $candidato,
        ], 201);
    }

    /**
     * Display the specified candidato.
     *
     * GET /api/candidatos/{id}
     */
    public function show(Candidato $candidato, Request $request): JsonResponse
    {
        $candidato->load('provincia');

        // Cargar relaciones opcionales
        if ($request->boolean('with_telegramas')) {
            $candidato->load('telegramas');
        }

        if ($request->boolean('with_estadisticas')) {
            $candidato->estadisticas = $candidato->getEstadisticas();
        }

        return response()->json([
            'success' => true,
            'data' => $candidato,
        ]);
    }

    /**
     * Update the specified candidato.
     *
     * PUT/PATCH /api/candidatos/{id}
     */
    public function update(UpdateCandidatoRequest $request, Candidato $candidato): JsonResponse
    {
        $candidato->update($request->validated());
        $candidato->load('provincia');

        return response()->json([
            'success' => true,
            'message' => 'Candidato actualizado exitosamente.',
            'data' => $candidato,
        ]);
    }

    /**
     * Remove the specified candidato.
     *
     * DELETE /api/candidatos/{id}
     */
    public function destroy(Candidato $candidato): JsonResponse
    {
        // Verificar si tiene votos registrados
        if ($candidato->telegramas()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'No se puede eliminar el candidato porque tiene votos registrados en telegramas.',
            ], 409);
        }

        $candidato->delete();

        return response()->json([
            'success' => true,
            'message' => 'Candidato eliminado exitosamente.',
        ]);
    }

    /**
     * Get estadísticas del candidato.
     *
     * GET /api/candidatos/{id}/estadisticas
     */
    public function estadisticas(Candidato $candidato): JsonResponse
    {
        $estadisticas = $candidato->getEstadisticas();

        return response()->json([
            'success' => true,
            'data' => $estadisticas,
        ]);
    }

    /**
     * Get votos del candidato por telegrama.
     *
     * GET /api/candidatos/{id}/votos
     */
    public function votos(Candidato $candidato, Request $request): JsonResponse
    {
        $query = $candidato->telegramas()->with('provincia');

        // Filtro por estado
        if ($request->has('estado')) {
            $query->where('estado', $request->estado);
        }

        $telegramas = $query->get()->map(function ($telegrama) {
            return [
                'telegrama_id' => $telegrama->id,
                'id_mesa' => $telegrama->id_mesa,
                'provincia' => $telegrama->provincia->nombre,
                'circuito_escuela' => $telegrama->circuito_escuela,
                'votos' => $telegrama->pivot->votos,
                'estado' => $telegrama->estado,
                'fecha_carga' => $telegrama->fecha_carga,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $telegramas,
        ]);
    }

    /**
     * Get ranking de candidatos por cargo.
     *
     * GET /api/candidatos/ranking
     */
    public function ranking(Request $request): JsonResponse
    {
        $request->validate([
            'cargo' => 'required|in:Diputado,Senador',
            'provincia_id' => 'nullable|exists:provincias,id',
            'limit' => 'nullable|integer|min:1|max:100',
        ]);

        $query = Candidato::with('provincia')
            ->where('cargo', $request->cargo);

        if ($request->has('provincia_id')) {
            $query->where('provincia_id', $request->provincia_id);
        }

        $candidatos = $query->get()->map(function ($candidato) {
            return [
                'id' => $candidato->id,
                'nombre_completo' => $candidato->nombre_completo,
                'cargo' => $candidato->cargo,
                'provincia' => $candidato->provincia->nombre,
                'lista_alianza' => $candidato->lista_alianza,
                'total_votos' => $candidato->getTotalVotosValidados(),
                'porcentaje' => $candidato->getPorcentajeVotos(),
            ];
        })->sortByDesc('total_votos')->take($request->input('limit', 10))->values();

        return response()->json([
            'success' => true,
            'data' => $candidatos,
        ]);
    }
}
