<?php

namespace App\Http\Requests;

use App\Models\Telegrama;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTelegramaRequest extends FormRequest
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
        $telegramaId = $this->route('telegrama');

        return [
            'id_mesa' => [
                'sometimes',
                'required',
                'string',
                'max:50',
                Rule::unique('telegramas', 'id_mesa')->ignore($telegramaId),
            ],
            'provincia_id' => 'sometimes|required|integer|exists:provincias,id',
            'circuito_escuela' => 'sometimes|required|string|max:255',
            'total_electores' => 'sometimes|required|integer|min:1',
            'total_votos' => 'sometimes|required|integer|min:0',
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
            $telegrama = $this->route('telegrama');

            // Obtener valores actuales o nuevos
            $totalElectores = $this->total_electores ?? $telegrama->total_electores;
            $totalVotos = $this->total_votos ?? $telegrama->total_votos;
            $votosBlanco = $this->votos_blanco ?? $telegrama->votos_blanco;
            $votosNulos = $this->votos_nulos ?? $telegrama->votos_nulos;
            $votosImpugnados = $this->votos_impugnados ?? $telegrama->votos_impugnados;

            // Validación 1: total_votos <= total_electores
            if ($totalVotos > $totalElectores) {
                $validator->errors()->add(
                    'total_votos',
                    "El total de votos ({$totalVotos}) no puede exceder el total de electores ({$totalElectores})."
                );
            }

            // Validación 2: suma de votos = total_votos
            $votosCandidatos = 0;
            if ($this->has('candidatos') && is_array($this->candidatos)) {
                foreach ($this->candidatos as $candidato) {
                    $votosCandidatos += $candidato['votos'] ?? 0;
                }
            } else {
                // Si no se envían candidatos, usar los actuales
                $votosCandidatos = $telegrama->getTotalVotosCandidatos();
            }

            $sumaVotos = $votosCandidatos + $votosBlanco + $votosNulos + $votosImpugnados;

            if ($sumaVotos !== $totalVotos) {
                $validator->errors()->add(
                    'total_votos',
                    "La suma de votos de candidatos ({$votosCandidatos}) + blancos ({$votosBlanco}) + nulos ({$votosNulos}) + impugnados ({$votosImpugnados}) = {$sumaVotos} no coincide con el total de votos declarado ({$totalVotos})."
                );
            }

            // Validación 3: Candidatos únicos
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
            $estado = $this->estado ?? $telegrama->estado;
            $motivoRechazo = $this->motivo_rechazo ?? $telegrama->motivo_rechazo;

            if ($estado === Telegrama::ESTADO_RECHAZADO && empty($motivoRechazo)) {
                $validator->errors()->add(
                    'motivo_rechazo',
                    'Debe especificar un motivo de rechazo cuando el estado es "rechazado".'
                );
            }
        });
    }
}
