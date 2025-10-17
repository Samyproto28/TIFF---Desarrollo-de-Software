<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProvinciaRequest;
use App\Http\Requests\UpdateProvinciaRequest;
use App\Models\Provincia;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProvinciaController extends Controller
{
    /**
     * Display a listing of provincias.
     *
     * GET /api/provincias
     */
    public function index(Request $request)
    {
        $query = Provincia::query();

        // Filtros opcionales
        if ($request->has('nombre')) {
            $query->where('nombre', 'like', '%' . $request->nombre . '%');
        }

        if ($request->has('codigo')) {
            $query->where('codigo', $request->codigo);
        }

        // Ordenamiento
        $query->ordenadas();

        // Paginación o todo
        if ($request->boolean('paginate', true)) {
            $provincias = $query->paginate($request->input('per_page', 15));
        } else {
            $provincias = $query->get();
        }

        // Si es petición API, retornar JSON
        if ($request->wantsJson() || $request->is('api/*')) {
            return response()->json([
                'success' => true,
                'data' => $provincias,
            ]);
        }

        // Si es web, retornar Inertia
        return Inertia::render('Provincias/Index', [
            'provincias' => $provincias,
        ]);
    }

    /**
     * Store a newly created provincia.
     *
     * POST /api/provincias
     */
    public function store(StoreProvinciaRequest $request)
    {
        $provincia = Provincia::create($request->validated());

        // Si es petición API, retornar JSON
        if ($request->wantsJson() || $request->is('api/*')) {
            return response()->json([
                'success' => true,
                'message' => 'Provincia creada exitosamente.',
                'data' => $provincia,
            ], 201);
        }

        // Si es web, redirigir con mensaje de éxito
        return redirect()->route('provincias.index')
            ->with('success', 'Provincia creada exitosamente.');
    }

    /**
     * Display the specified provincia.
     *
     * GET /api/provincias/{id}
     */
    public function show(Provincia $provincia, Request $request)
    {
        // Cargar relaciones opcionales
        if ($request->boolean('with_candidatos')) {
            $provincia->load('candidatos');
        }

        if ($request->boolean('with_telegramas')) {
            $provincia->load('telegramas');
        }

        if ($request->boolean('with_estadisticas')) {
            $provincia->estadisticas = $provincia->getEstadisticasTelegramas();
        }

        // Si es petición API, retornar JSON
        if ($request->wantsJson() || $request->is('api/*')) {
            return response()->json([
                'success' => true,
                'data' => $provincia,
            ]);
        }

        // Si es web, cargar datos completos y retornar Inertia
        $candidatos = $provincia->candidatos()->paginate(10);
        $telegramas = $provincia->telegramas()->paginate(10);
        $estadisticas = $provincia->getEstadisticasTelegramas();

        return Inertia::render('Provincias/Show', [
            'provincia' => $provincia,
            'candidatos' => $candidatos,
            'telegramas' => $telegramas,
            'estadisticas' => $estadisticas,
        ]);
    }

    /**
     * Update the specified provincia.
     *
     * PUT/PATCH /api/provincias/{id}
     */
    public function update(UpdateProvinciaRequest $request, Provincia $provincia)
    {
        $provincia->update($request->validated());

        // Si es petición API, retornar JSON
        if ($request->wantsJson() || $request->is('api/*')) {
            return response()->json([
                'success' => true,
                'message' => 'Provincia actualizada exitosamente.',
                'data' => $provincia->fresh(),
            ]);
        }

        // Si es web, redirigir con mensaje de éxito
        return redirect()->route('provincias.index')
            ->with('success', 'Provincia actualizada exitosamente.');
    }

    /**
     * Show the form for creating a new provincia.
     */
    public function create()
    {
        return Inertia::render('Provincias/Create');
    }

    /**
     * Show the form for editing the specified provincia.
     */
    public function edit(Provincia $provincia)
    {
        return Inertia::render('Provincias/Edit', [
            'provincia' => $provincia,
        ]);
    }

    /**
     * Remove the specified provincia.
     *
     * DELETE /api/provincias/{id}
     */
    public function destroy(Provincia $provincia): JsonResponse
    {
        // Verificar si tiene relaciones dependientes
        if ($provincia->candidatos()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'No se puede eliminar la provincia porque tiene candidatos asociados.',
            ], 409);
        }

        if ($provincia->telegramas()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'No se puede eliminar la provincia porque tiene telegramas asociados.',
            ], 409);
        }

        $provincia->delete();

        return response()->json([
            'success' => true,
            'message' => 'Provincia eliminada exitosamente.',
        ]);
    }

    /**
     * Get estadísticas de telegramas por provincia.
     *
     * GET /api/provincias/{id}/estadisticas
     */
    public function estadisticas(Provincia $provincia): JsonResponse
    {
        $estadisticas = $provincia->getEstadisticasTelegramas();

        return response()->json([
            'success' => true,
            'data' => $estadisticas,
        ]);
    }

    /**
     * Get candidatos de una provincia.
     *
     * GET /api/provincias/{id}/candidatos
     */
    public function candidatos(Provincia $provincia, Request $request): JsonResponse
    {
        $query = $provincia->candidatos();

        // Filtro por cargo
        if ($request->has('cargo')) {
            $query->where('cargo', $request->cargo);
        }

        $candidatos = $query->get();

        return response()->json([
            'success' => true,
            'data' => $candidatos,
        ]);
    }

    /**
     * Get telegramas de una provincia.
     *
     * GET /api/provincias/{id}/telegramas
     */
    public function telegramas(Provincia $provincia, Request $request): JsonResponse
    {
        $query = $provincia->telegramas();

        // Filtro por estado
        if ($request->has('estado')) {
            $query->where('estado', $request->estado);
        }

        // Paginación
        $telegramas = $query->paginate($request->input('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $telegramas,
        ]);
    }
}
