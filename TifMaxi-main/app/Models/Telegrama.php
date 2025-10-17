<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Telegrama extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The table associated with the model.
     */
    protected $table = 'telegramas';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'id_mesa',
        'provincia_id',
        'circuito_escuela',
        'total_electores',
        'votos_blanco',
        'votos_nulos',
        'votos_impugnados',
        'total_votos',
        'fecha_carga',
        'usuario_carga_id',
        'fecha_validacion',
        'usuario_validacion_id',
        'estado',
        'motivo_rechazo',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'total_electores' => 'integer',
        'votos_blanco' => 'integer',
        'votos_nulos' => 'integer',
        'votos_impugnados' => 'integer',
        'total_votos' => 'integer',
        'fecha_carga' => 'datetime',
        'fecha_validacion' => 'datetime',
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
     * Estados posibles del telegrama
     */
    public const ESTADO_PENDIENTE = 'pendiente';
    public const ESTADO_VALIDADO = 'validado';
    public const ESTADO_RECHAZADO = 'rechazado';

    public const ESTADOS = [
        self::ESTADO_PENDIENTE,
        self::ESTADO_VALIDADO,
        self::ESTADO_RECHAZADO,
    ];

    /**
     * Boot del modelo para establecer valores por defecto
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($telegrama) {
            if (!$telegrama->fecha_carga) {
                $telegrama->fecha_carga = now();
            }
            if (!$telegrama->estado) {
                $telegrama->estado = self::ESTADO_PENDIENTE;
            }
        });
    }

    /**
     * Relación: Un telegrama pertenece a una provincia
     */
    public function provincia(): BelongsTo
    {
        return $this->belongsTo(Provincia::class);
    }

    /**
     * Relación: Usuario que cargó el telegrama
     */
    public function usuarioCarga(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_carga_id');
    }

    /**
     * Relación: Usuario que validó el telegrama
     */
    public function usuarioValidacion(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_validacion_id');
    }

    /**
     * Relación: Un telegrama tiene muchos candidatos (con sus votos)
     * La tabla pivot incluye el campo 'votos'
     */
    public function candidatos(): BelongsToMany
    {
        return $this->belongsToMany(Candidato::class, 'candidato_telegrama')
                    ->withPivot('votos')
                    ->withTimestamps();
    }

    /**
     * Scope: Filtrar por estado
     */
    public function scopeEstado($query, string $estado)
    {
        return $query->where('estado', $estado);
    }

    /**
     * Scope: Telegramas validados
     */
    public function scopeValidados($query)
    {
        return $query->where('estado', self::ESTADO_VALIDADO);
    }

    /**
     * Scope: Telegramas pendientes
     */
    public function scopePendientes($query)
    {
        return $query->where('estado', self::ESTADO_PENDIENTE);
    }

    /**
     * Scope: Telegramas rechazados
     */
    public function scopeRechazados($query)
    {
        return $query->where('estado', self::ESTADO_RECHAZADO);
    }

    /**
     * Scope: Filtrar por provincia
     */
    public function scopePorProvincia($query, int $provinciaId)
    {
        return $query->where('provincia_id', $provinciaId);
    }

    /**
     * Scope: Filtrar por rango de fechas
     */
    public function scopePorRangoFechas($query, $fechaInicio, $fechaFin)
    {
        return $query->whereBetween('fecha_carga', [$fechaInicio, $fechaFin]);
    }

    /**
     * Calcular el total de votos de candidatos
     */
    public function getTotalVotosCandidatos(): int
    {
        return (int) $this->candidatos()->sum('candidato_telegrama.votos');
    }

    /**
     * Validar que la suma de votos sea correcta
     */
    public function validarSumaVotos(): bool
    {
        $sumaVotos = $this->getTotalVotosCandidatos() +
                     $this->votos_blanco +
                     $this->votos_nulos +
                     $this->votos_impugnados;

        return $sumaVotos === $this->total_votos;
    }

    /**
     * Validar que el total de votos no exceda el total de electores
     */
    public function validarTotalVotos(): bool
    {
        return $this->total_votos <= $this->total_electores;
    }

    /**
     * Validación completa del telegrama
     */
    public function esValido(): array
    {
        $errores = [];

        if (!$this->validarSumaVotos()) {
            $errores[] = 'La suma de votos de candidatos, blancos, nulos e impugnados no coincide con el total de votos.';
        }

        if (!$this->validarTotalVotos()) {
            $errores[] = 'El total de votos excede el total de electores habilitados.';
        }

        return [
            'valido' => empty($errores),
            'errores' => $errores,
        ];
    }

    /**
     * Calcular el porcentaje de participación
     */
    public function getPorcentajeParticipacion(): float
    {
        if ($this->total_electores === 0) {
            return 0.0;
        }

        return round(($this->total_votos / $this->total_electores) * 100, 2);
    }

    /**
     * Marcar telegrama como validado
     */
    public function validar(?int $usuarioId = null): bool
    {
        $validacion = $this->esValido();

        if (!$validacion['valido']) {
            return false;
        }

        $this->estado = self::ESTADO_VALIDADO;
        $this->fecha_validacion = now();
        $this->usuario_validacion_id = $usuarioId;
        $this->motivo_rechazo = null;

        return $this->save();
    }

    /**
     * Rechazar telegrama
     */
    public function rechazar(string $motivo, ?int $usuarioId = null): bool
    {
        $this->estado = self::ESTADO_RECHAZADO;
        $this->fecha_validacion = now();
        $this->usuario_validacion_id = $usuarioId;
        $this->motivo_rechazo = $motivo;

        return $this->save();
    }

    /**
     * Obtener resumen del telegrama
     */
    public function getResumen(): array
    {
        return [
            'id_mesa' => $this->id_mesa,
            'provincia' => $this->provincia->nombre,
            'circuito_escuela' => $this->circuito_escuela,
            'total_electores' => $this->total_electores,
            'total_votos' => $this->total_votos,
            'votos_candidatos' => $this->getTotalVotosCandidatos(),
            'votos_blanco' => $this->votos_blanco,
            'votos_nulos' => $this->votos_nulos,
            'votos_impugnados' => $this->votos_impugnados,
            'porcentaje_participacion' => $this->getPorcentajeParticipacion(),
            'estado' => $this->estado,
            'fecha_carga' => $this->fecha_carga?->format('d/m/Y H:i:s'),
            'validacion' => $this->esValido(),
        ];
    }
}
