<?php

use App\Http\Controllers\CandidatoController;
use App\Http\Controllers\ProvinciaController;
use App\Http\Controllers\TelegramaController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Rutas públicas (sin autenticación)
Route::prefix('v1')->group(function () {
    // Health check
    Route::get('/health', function () {
        return response()->json([
            'status' => 'ok',
            'timestamp' => now()->toIso8601String(),
        ]);
    });

    // Provincias
    Route::apiResource('provincias', ProvinciaController::class);
    Route::get('provincias/{provincia}/estadisticas', [ProvinciaController::class, 'estadisticas']);
    Route::get('provincias/{provincia}/candidatos', [ProvinciaController::class, 'candidatos']);
    Route::get('provincias/{provincia}/telegramas', [ProvinciaController::class, 'telegramas']);

    // Candidatos
    Route::apiResource('candidatos', CandidatoController::class);
    Route::get('candidatos/{candidato}/estadisticas', [CandidatoController::class, 'estadisticas']);
    Route::get('candidatos/{candidato}/votos', [CandidatoController::class, 'votos']);
    Route::get('candidatos/ranking/list', [CandidatoController::class, 'ranking']); // Debe ir antes del resource

    // Telegramas
    Route::apiResource('telegramas', TelegramaController::class);
    Route::post('telegramas/{telegrama}/validar', [TelegramaController::class, 'validar']);
    Route::post('telegramas/{telegrama}/rechazar', [TelegramaController::class, 'rechazar']);
    Route::get('telegramas/{telegrama}/resumen', [TelegramaController::class, 'resumen']);

    // Importación/Exportación de Telegramas
    Route::post('telegramas/import/file', [TelegramaController::class, 'import']); // Debe ir antes del resource
    Route::get('telegramas/export/csv', [TelegramaController::class, 'exportCSV']);
    Route::get('telegramas/export/json', [TelegramaController::class, 'exportJSON']);

    // Estadísticas generales
    Route::get('telegramas/stats/general', [TelegramaController::class, 'estadisticas']); // Debe ir antes del resource
});

// Ejemplo de rutas protegidas con autenticación (descomentar si usas Sanctum o Passport)
/*
Route::middleware('auth:sanctum')->prefix('v1')->group(function () {
    // Usuario autenticado
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Rutas protegidas adicionales aquí
});
*/
