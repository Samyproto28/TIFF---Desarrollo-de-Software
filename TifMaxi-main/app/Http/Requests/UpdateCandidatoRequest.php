<?php

namespace App\Http\Requests;

use App\Models\Candidato;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCandidatoRequest extends FormRequest
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
            'nombre_completo' => 'sometimes|required|string|max:200',
            'cargo' => ['sometimes', 'required', Rule::in(Candidato::CARGOS)],
            'provincia_id' => 'sometimes|required|integer|exists:provincias,id',
            'lista_alianza' => 'nullable|string|max:150',
            'observaciones' => 'nullable|string',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'nombre_completo.required' => 'El nombre completo del candidato es obligatorio.',
            'cargo.required' => 'El cargo es obligatorio.',
            'cargo.in' => 'El cargo debe ser Diputado o Senador.',
            'provincia_id.required' => 'La provincia es obligatoria.',
            'provincia_id.exists' => 'La provincia seleccionada no existe.',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $candidatoId = $this->route('candidato');

            // Validar que no exista el mismo candidato para el mismo cargo en la misma provincia (excluyendo el actual)
            $nombreCompleto = $this->nombre_completo ?? $this->route('candidato')->nombre_completo;
            $cargo = $this->cargo ?? $this->route('candidato')->cargo;
            $provinciaId = $this->provincia_id ?? $this->route('candidato')->provincia_id;

            $existe = \App\Models\Candidato::where('nombre_completo', $nombreCompleto)
                ->where('cargo', $cargo)
                ->where('provincia_id', $provinciaId)
                ->where('id', '!=', $candidatoId)
                ->exists();

            if ($existe) {
                $validator->errors()->add(
                    'nombre_completo',
                    'Ya existe un candidato con ese nombre para el cargo seleccionado en esta provincia.'
                );
            }
        });
    }
}
