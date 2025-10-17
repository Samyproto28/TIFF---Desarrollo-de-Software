<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Provincia extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The table associated with the model.
     */
    protected $table = 'provincias';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'nombre',
        'codigo',
        'observaciones',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * The attributes that should be hidden for serialization.
     */
    protected $hidden = [
        'deleted_at',
    ];

    /**
     * Relación: Una provincia tiene muchos candidatos
     */
    public function candidatos(): HasMany
    {
        return $this->hasMany(Candidato::class);
    }

    /**
     * Relación: Una provincia tiene muchos telegramas
     */
    public function telegramas(): HasMany
    {
        return $this->hasMany(Telegrama::class);
    }

    /**
     * Scope: Obtener provincias ordenadas alfabéticamente
     */
    public function scopeOrdenadas($query)
    {
        return $query->orderBy('nombre');
    }

    /**
     * Accessor: Nombre completo con código
     */
    public function getNombreCompletoAttribute(): string
    {
        return $this->codigo ? "{$this->nombre} ({$this->codigo})" : $this->nombre;
    }

    /**
     * Obtener estadísticas de telegramas por provincia
     */
    public function getEstadisticasTelegramas(): array
    {
        return [
            'total_telegramas' => $this->telegramas()->count(),
            'telegramas_validados' => $this->telegramas()->where('estado', 'validado')->count(),
            'telegramas_pendientes' => $this->telegramas()->where('estado', 'pendiente')->count(),
            'telegramas_rechazados' => $this->telegramas()->where('estado', 'rechazado')->count(),
            'total_votos' => $this->telegramas()->sum('total_votos'),
            'total_electores' => $this->telegramas()->sum('total_electores'),
        ];
    }
}
