<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('telegramas', function (Blueprint $table) {
            $table->id();
            $table->string('id_mesa', 50)->unique(); // ID único de la mesa electoral
            $table->foreignId('provincia_id')
                  ->constrained('provincias')
                  ->cascadeOnUpdate()
                  ->restrictOnDelete();
            $table->string('circuito_escuela', 255); // Nombre del circuito/escuela (texto libre)
            $table->unsignedInteger('total_electores'); // Total de electores habilitados en la mesa
            $table->unsignedInteger('votos_blanco')->default(0);
            $table->unsignedInteger('votos_nulos')->default(0);
            $table->unsignedInteger('votos_impugnados')->default(0);
            $table->unsignedInteger('total_votos')->default(0); // Total de votos emitidos

            // Auditoría
            $table->timestamp('fecha_carga')->nullable(); // Fecha/hora de carga del telegrama
            $table->foreignId('usuario_carga_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('fecha_validacion')->nullable(); // Fecha/hora de validación
            $table->foreignId('usuario_validacion_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('estado', ['pendiente', 'validado', 'rechazado'])->default('pendiente');
            $table->text('motivo_rechazo')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Índices para optimizar búsquedas y reportes
            $table->index('id_mesa');
            $table->index('provincia_id');
            $table->index('estado');
            $table->index('fecha_carga');
            $table->index(['provincia_id', 'estado']); // Búsqueda compuesta

            // Constraint: total_votos no puede exceder total_electores
            // Nota: MySQL no soporta CHECK constraints complejos en todas las versiones,
            // por lo que la validación principal se hace en la capa de aplicación
            // Para PostgreSQL o MySQL 8.0.16+ se puede usar:
            // $table->check('total_votos <= total_electores');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('telegramas');
    }
};
