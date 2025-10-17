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
        Schema::create('candidatos', function (Blueprint $table) {
            $table->id();
            $table->string('nombre_completo', 200);
            $table->enum('cargo', ['Diputado', 'Senador']);
            $table->foreignId('provincia_id')
                  ->constrained('provincias')
                  ->cascadeOnUpdate()
                  ->restrictOnDelete(); // No permitir eliminar provincia si tiene candidatos
            $table->string('lista_alianza', 150)->nullable();
            $table->text('observaciones')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Índices para optimizar búsquedas
            $table->index('nombre_completo');
            $table->index('cargo');
            $table->index(['provincia_id', 'cargo']); // Búsqueda compuesta por provincia y cargo
            $table->index('lista_alianza');

            // Constraint único: Un candidato no puede repetirse para el mismo cargo en la misma provincia
            $table->unique(['nombre_completo', 'cargo', 'provincia_id'], 'candidato_cargo_provincia_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('candidatos');
    }
};
