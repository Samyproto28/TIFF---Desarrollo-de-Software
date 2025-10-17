<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ImportTelegramaRequest extends FormRequest
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
            'archivo' => 'required_without:datos|file|mimes:csv,json,txt|max:10240', // 10MB máximo
            'datos' => 'required_without:archivo|json',
            'tipo' => ['required', Rule::in(['csv', 'json'])],
            'auto_validar' => 'nullable|boolean', // Si es true, auto-valida telegramas correctos
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'archivo.required_without' => 'Debe proporcionar un archivo o datos JSON.',
            'archivo.file' => 'El archivo proporcionado no es válido.',
            'archivo.mimes' => 'El archivo debe ser CSV o JSON.',
            'archivo.max' => 'El archivo no debe exceder los 10MB.',
            'datos.required_without' => 'Debe proporcionar datos JSON o un archivo.',
            'datos.json' => 'Los datos deben estar en formato JSON válido.',
            'tipo.required' => 'Debe especificar el tipo de importación (csv o json).',
            'tipo.in' => 'El tipo debe ser csv o json.',
        ];
    }
}
