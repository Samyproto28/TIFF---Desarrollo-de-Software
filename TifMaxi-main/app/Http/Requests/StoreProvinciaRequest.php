<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProvinciaRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Ajustar según tu sistema de autorización
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'nombre' => 'required|string|max:100|unique:provincias,nombre',
            'codigo' => 'nullable|string|max:10|unique:provincias,codigo',
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
