<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Tabla pivot para la relación muchos a muchos entre Telegramas y Candidatos
     */
    public function up(): void
    {
        Schema::create('candidato_telegrama', function (Blueprint $table) {
            $table->id();
            $table->foreignId('telegrama_id')
                  ->constrained('telegramas')
                  ->cascadeOnDelete() // Si se elimina el telegrama, se eliminan sus votos
                  ->cascadeOnUpdate();
            $table->foreignId('candidato_id')
                  ->constrained('candidatos')
                  ->cascadeOnUpdate()
                  ->restrictOnDelete(); // No permitir eliminar candidato si tiene votos
            $table->unsignedInteger('votos')->default(0); // Cantidad de votos para este candidato en este telegrama
            $table->timestamps();

            // Índices para optimizar consultas
            $table->index('telegrama_id');
            $table->index('candidato_id');
            $table->index('votos'); // Para ordenar por cantidad de votos

            // Constraint único: Un candidato solo puede aparecer una vez por telegrama
            $table->unique(['telegrama_id', 'candidato_id'], 'telegrama_candidato_unique');

            // Índice compuesto para consultas de agregación
            $table->index(['candidato_id', 'votos']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('candidato_telegrama');
    }
};
