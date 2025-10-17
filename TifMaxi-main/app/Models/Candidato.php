<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;

class Candidato extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The table associated with the model.
     */
    protected $table = 'candidatos';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'nombre_completo',
        'cargo',
        'provincia_id',
        'lista_alianza',
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
     * Valores permitidos para el campo cargo
     */
    public const CARGO_DIPUTADO = 'Diputado';
    public const CARGO_SENADOR = 'Senador';

    public const CARGOS = [
        self::CARGO_DIPUTADO,
        self::CARGO_SENADOR,
    ];

    /**
     * Relación: Un candidato pertenece a una provincia
     */
    public function provincia(): BelongsTo
    {
        return $this->belongsTo(Provincia::class);
    }

    /**
     * Relación: Un candidato aparece en muchos telegramas (con sus votos)
     * La tabla pivot incluye el campo 'votos'
     */
    public function telegramas(): BelongsToMany
    {
        return $this->belongsToMany(Telegrama::class, 'candidato_telegrama')
                    ->withPivot('votos')
                    ->withTimestamps();
    }

    /**
     * Scope: Filtrar por cargo
     */
    public function scopeCargo($query, string $cargo)
    {
        return $query->where('cargo', $cargo);
    }

    /**
     * Scope: Filtrar por provincia
     */
    public function scopePorProvincia($query, int $provinciaId)
    {
        return $query->where('provincia_id', $provinciaId);
    }

    /**
     * Scope: Filtrar diputados
     */
    public function scopeDiputados($query)
    {
        return $query->where('cargo', self::CARGO_DIPUTADO);
    }

    /**
     * Scope: Filtrar senadores
     */
    public function scopeSenadores($query)
    {
        return $query->where('cargo', self::CARGO_SENADOR);
    }

    /**
     * Obtener el total de votos acumulados para este candidato
     */
    public function getTotalVotos(): int
    {
        return (int) DB::table('candidato_telegrama')
            ->where('candidato_id', $this->id)
            ->sum('votos');
    }

    /**
     * Obtener el total de votos para este candidato en telegramas validados
     */
    public function getTotalVotosValidados(): int
    {
        return (int) $this->telegramas()
            ->where('estado', 'validado')
            ->sum('candidato_telegrama.votos');
    }

    /**
     * Obtener estadísticas detalladas del candidato
     */
    public function getEstadisticas(): array
    {
        return [
            'total_votos' => $this->getTotalVotos(),
            'votos_validados' => $this->getTotalVotosValidados(),
            'total_telegramas' => $this->telegramas()->count(),
            'telegramas_validados' => $this->telegramas()->where('estado', 'validado')->count(),
            'porcentaje_votos' => $this->getPorcentajeVotos(),
        ];
    }

    /**
     * Calcular el porcentaje de votos del candidato sobre el total
     */
    public function getPorcentajeVotos(): float
    {
        $totalVotosCandidato = $this->getTotalVotosValidados();

        if ($totalVotosCandidato === 0) {
            return 0.0;
        }

        // Total de votos de todos los candidatos del mismo cargo y provincia
        $totalVotosGeneral = DB::table('candidato_telegrama')
            ->join('candidatos', 'candidato_telegrama.candidato_id', '=', 'candidatos.id')
            ->join('telegramas', 'candidato_telegrama.telegrama_id', '=', 'telegramas.id')
            ->where('candidatos.cargo', $this->cargo)
            ->where('candidatos.provincia_id', $this->provincia_id)
            ->where('telegramas.estado', 'validado')
            ->sum('candidato_telegrama.votos');

        if ($totalVotosGeneral === 0) {
            return 0.0;
        }

        return round(($totalVotosCandidato / $totalVotosGeneral) * 100, 2);
    }

    /**
     * Accessor: Información completa del candidato
     */
    public function getDescripcionCompletaAttribute(): string
    {
        return "{$this->nombre_completo} - {$this->cargo}" .
               ($this->lista_alianza ? " ({$this->lista_alianza})" : '');
    }
}
