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
        Schema::create('provincias', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 100)->unique();
            $table->string('codigo', 10)->unique()->nullable(); // Código ISO o interno (ej: "BA", "CABA")
            $table->text('observaciones')->nullable();
            $table->timestamps();
            $table->softDeletes(); // Borrado lógico para mantener integridad referencial

            // Índices para optimizar búsquedas
            $table->index('nombre');
            $table->index('codigo');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('provincias');
    }
};
