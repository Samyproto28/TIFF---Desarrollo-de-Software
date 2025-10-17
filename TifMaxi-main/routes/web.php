<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\ProvinciaController;
use App\Http\Controllers\CandidatoController;
use App\Http\Controllers\TelegramaController;

// Dashboard
Route::get('/', function () {
    return Inertia::render('Dashboard');
})->name('dashboard');

// Provincias (resource routes con Inertia)
Route::resource('provincias', ProvinciaController::class)
    ->except(['destroy']);

Route::delete('provincias/{provincia}', [ProvinciaController::class, 'destroy'])
    ->name('provincias.destroy');

// Candidatos
Route::resource('candidatos', CandidatoController::class)
    ->except(['destroy']);

Route::delete('candidatos/{candidato}', [CandidatoController::class, 'destroy'])
    ->name('candidatos.destroy');

// Telegramas
Route::resource('telegramas', TelegramaController::class)
    ->except(['destroy']);

Route::delete('telegramas/{telegrama}', [TelegramaController::class, 'destroy'])
    ->name('telegramas.destroy');

Route::get('telegramas/{telegrama}/validar', [TelegramaController::class, 'validar'])
    ->name('telegramas.validar');

Route::get('telegramas/{telegrama}/rechazar', [TelegramaController::class, 'rechazar'])
    ->name('telegramas.rechazar');

// Importación
Route::get('telegramas/import', function () {
    return Inertia::render('Telegramas/Import');
})->name('telegramas.import');
