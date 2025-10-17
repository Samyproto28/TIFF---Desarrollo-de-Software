<?php

namespace App\Http\Requests;

use App\Models\Telegrama;
use App\Services\TelegramaValidationService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTelegramaRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'id_mesa' => 'required|string|max:50|unique:telegramas,id_mesa',
            'provincia_id' => 'required|integer|exists:provincias,id',
            'circuito_escuela' => 'required|string|max:255',
            'total_electores' => 'required|integer|min:1',
            'total_votos' => 'required|integer|min:0',
            'votos_blanco' => 'nullable|integer|min:0',
            'votos_nulos' => 'nullable|integer|min:0',
            'votos_impugnados' => 'nullable|integer|min:0',
            'estado' => ['nullable', Rule::in(Telegrama::ESTADOS)],
            'motivo_rechazo' => 'nullable|string',

            // Candidatos con sus votos
            'candidatos' => 'nullable|array',
            'candidatos.*.candidato_id' => 'required|integer|exists:candidatos,id',
            'candidatos.*.votos' => 'required|integer|min:0',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'id_mesa.required' => 'El ID de mesa es obligatorio.',
            'id_mesa.unique' => 'Ya existe un telegrama con este ID de mesa.',
            'provincia_id.required' => 'La provincia es obligatoria.',
            'provincia_id.exists' => 'La provincia seleccionada no existe.',
            'circuito_escuela.required' => 'El circuito/escuela es obligatorio.',
            'total_electores.required' => 'El total de electores es obligatorio.',
            'total_electores.min' => 'El total de electores debe ser al menos 1.',
            'total_votos.required' => 'El total de votos es obligatorio.',
            'total_votos.min' => 'El total de votos no puede ser negativo.',
            'candidatos.*.candidato_id.required' => 'El ID del candidato es obligatorio.',
            'candidatos.*.candidato_id.exists' => 'El candidato seleccionado no existe.',
            'candidatos.*.votos.required' => 'Los votos del candidato son obligatorios.',
            'candidatos.*.votos.min' => 'Los votos no pueden ser negativos.',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            // Validación 1: total_votos <= total_electores
            if ($this->total_votos > $this->total_electores) {
                $validator->errors()->add(
                    'total_votos',
                    "El total de votos ({$this->total_votos}) no puede exceder el total de electores ({$this->total_electores})."
                );
            }

            // Validación 2: suma de votos = total_votos
            $votosBlanco = $this->votos_blanco ?? 0;
            $votosNulos = $this->votos_nulos ?? 0;
            $votosImpugnados = $this->votos_impugnados ?? 0;

            $votosCandidatos = 0;
            if ($this->has('candidatos') && is_array($this->candidatos)) {
                foreach ($this->candidatos as $candidato) {
                    $votosCandidatos += $candidato['votos'] ?? 0;
                }
            }

            $sumaVotos = $votosCandidatos + $votosBlanco + $votosNulos + $votosImpugnados;

            if ($sumaVotos !== $this->total_votos) {
                $validator->errors()->add(
                    'total_votos',
                    "La suma de votos de candidatos ({$votosCandidatos}) + blancos ({$votosBlanco}) + nulos ({$votosNulos}) + impugnados ({$votosImpugnados}) = {$sumaVotos} no coincide con el total de votos declarado ({$this->total_votos})."
                );
            }

            // Validación 3: Candidatos únicos (no se puede votar dos veces al mismo candidato)
            if ($this->has('candidatos') && is_array($this->candidatos)) {
                $candidatosIds = array_column($this->candidatos, 'candidato_id');
                $candidatosDuplicados = array_filter(array_count_values($candidatosIds), fn($count) => $count > 1);

                if (!empty($candidatosDuplicados)) {
                    $validator->errors()->add(
                        'candidatos',
                        'Hay candidatos duplicados en el telegrama: ' . implode(', ', array_keys($candidatosDuplicados))
                    );
                }
            }

            // Validación 4: Si el estado es rechazado, debe haber motivo
            if ($this->estado === Telegrama::ESTADO_RECHAZADO && empty($this->motivo_rechazo)) {
                $validator->errors()->add(
                    'motivo_rechazo',
                    'Debe especificar un motivo de rechazo cuando el estado es "rechazado".'
                );
            }
        });
    }

    /**
     * Get validated data with defaults
     */
    public function validated($key = null, $default = null): array
    {
        $validated = parent::validated();

        // Establecer valores por defecto
        $validated['votos_blanco'] = $validated['votos_blanco'] ?? 0;
        $validated['votos_nulos'] = $validated['votos_nulos'] ?? 0;
        $validated['votos_impugnados'] = $validated['votos_impugnados'] ?? 0;
        $validated['estado'] = $validated['estado'] ?? Telegrama::ESTADO_PENDIENTE;

        return $validated;
    }
}
