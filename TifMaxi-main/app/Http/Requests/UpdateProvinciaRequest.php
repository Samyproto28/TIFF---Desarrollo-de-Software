<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProvinciaRequest extends FormRequest
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
        $provinciaId = $this->route('provincia');

        return [
            'nombre' => [
                'sometimes',
                'required',
                'string',
                'max:100',
                Rule::unique('provincias', 'nombre')->ignore($provinciaId),
            ],
            'codigo' => [
                'nullable',
                'string',
                'max:10',
                Rule::unique('provincias', 'codigo')->ignore($provinciaId),
            ],
            'observaciones' => 'nullable|string',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre de la provincia es obligatorio.',
            'nombre.unique' => 'Ya existe una provincia con ese nombre.',
            'codigo.unique' => 'Ya existe una provincia con ese código.',
        ];
    }
}
