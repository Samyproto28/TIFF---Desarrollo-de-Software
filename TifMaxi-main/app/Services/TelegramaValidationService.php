<?php

namespace App\Services;

use App\Models\Telegrama;
use Illuminate\Support\Facades\DB;

class TelegramaValidationService
{
    /**
     * Validar un telegrama completo
     *
     * @param Telegrama $telegrama
     * @return array
     */
    public function validarTelegrama(Telegrama $telegrama): array
    {
        $errores = [];
        $warnings = [];

        // Validación 1: Suma de votos
        $validacionSuma = $this->validarSumaVotos($telegrama);
        if (!$validacionSuma['valido']) {
            $errores[] = $validacionSuma['mensaje'];
        }

        // Validación 2: Total de votos vs electores
        $validacionTotal = $this->validarTotalVotosVsElectores($telegrama);
        if (!$validacionTotal['valido']) {
            $errores[] = $validacionTotal['mensaje'];
        }

        // Validación 3: ID mesa único
        $validacionMesa = $this->validarIdMesaUnico($telegrama);
        if (!$validacionMesa['valido']) {
            $errores[] = $validacionMesa['mensaje'];
        }

        // Validación 4: Provincia existe y es válida
        if (!$telegrama->provincia_id || !$telegrama->provincia) {
            $errores[] = 'La provincia especificada no existe.';
        }

        // Warning 1: Participación muy baja o muy alta
        $validacionParticipacion = $this->validarParticipacion($telegrama);
        if (!$validacionParticipacion['valido']) {
            $warnings[] = $validacionParticipacion['mensaje'];
        }

        // Warning 2: Votos blancos/nulos/impugnados muy altos
        $validacionVotosEspeciales = $this->validarVotosEspeciales($telegrama);
        if (!$validacionVotosEspeciales['valido']) {
            $warnings[] = $validacionVotosEspeciales['mensaje'];
        }

        // Warning 3: Candidatos sin votos
        $validacionCandidatosSinVotos = $this->validarCandidatosSinVotos($telegrama);
        if (!$validacionCandidatosSinVotos['valido']) {
            $warnings[] = $validacionCandidatosSinVotos['mensaje'];
        }

        return [
            'valido' => empty($errores),
            'errores' => $errores,
            'warnings' => $warnings,
            'detalles' => $this->obtenerDetallesValidacion($telegrama),
        ];
    }

    /**
     * Validar que la suma de votos sea correcta
     * suma(votos_candidatos) + blanco + nulos + impugnados = total_votos
     */
    protected function validarSumaVotos(Telegrama $telegrama): array
    {
        $votosCandidatos = $telegrama->getTotalVotosCandidatos();
        $sumaCalculada = $votosCandidatos +
                         $telegrama->votos_blanco +
                         $telegrama->votos_nulos +
                         $telegrama->votos_impugnados;

        $valido = $sumaCalculada === $telegrama->total_votos;

        return [
            'valido' => $valido,
            'mensaje' => $valido
                ? 'La suma de votos es correcta.'
                : "La suma de votos ({$sumaCalculada}) no coincide con el total declarado ({$telegrama->total_votos}). " .
                  "Candidatos: {$votosCandidatos}, Blanco: {$telegrama->votos_blanco}, " .
                  "Nulos: {$telegrama->votos_nulos}, Impugnados: {$telegrama->votos_impugnados}",
            'suma_calculada' => $sumaCalculada,
            'total_declarado' => $telegrama->total_votos,
        ];
    }

    /**
     * Validar que total_votos <= total_electores
     */
    protected function validarTotalVotosVsElectores(Telegrama $telegrama): array
    {
        $valido = $telegrama->total_votos <= $telegrama->total_electores;

        return [
            'valido' => $valido,
            'mensaje' => $valido
                ? 'El total de votos no excede el padrón electoral.'
                : "El total de votos ({$telegrama->total_votos}) excede el total de electores habilitados ({$telegrama->total_electores}).",
            'total_votos' => $telegrama->total_votos,
            'total_electores' => $telegrama->total_electores,
        ];
    }

    /**
     * Validar que el ID de mesa sea único
     */
    protected function validarIdMesaUnico(Telegrama $telegrama): array
    {
        $query = Telegrama::where('id_mesa', $telegrama->id_mesa);

        // Si estamos actualizando, excluir el telegrama actual
        if ($telegrama->exists) {
            $query->where('id', '!=', $telegrama->id);
        }

        $existe = $query->exists();

        return [
            'valido' => !$existe,
            'mensaje' => $existe
                ? "Ya existe un telegrama con el ID de mesa '{$telegrama->id_mesa}'."
                : 'El ID de mesa es único.',
        ];
    }

    /**
     * Validar porcentaje de participación (warning si es muy bajo o muy alto)
     */
    protected function validarParticipacion(Telegrama $telegrama): array
    {
        if ($telegrama->total_electores === 0) {
            return [
                'valido' => false,
                'mensaje' => 'El total de electores no puede ser cero.',
            ];
        }

        $porcentaje = $telegrama->getPorcentajeParticipacion();

        if ($porcentaje < 30) {
            return [
                'valido' => false,
                'mensaje' => "Participación muy baja ({$porcentaje}%). Verifique los datos.",
            ];
        }

        if ($porcentaje > 100) {
            return [
                'valido' => false,
                'mensaje' => "Participación imposible ({$porcentaje}%). Los votos exceden el padrón.",
            ];
        }

        return [
            'valido' => true,
            'mensaje' => "Participación: {$porcentaje}%",
        ];
    }

    /**
     * Validar que los votos especiales no sean excesivos
     */
    protected function validarVotosEspeciales(Telegrama $telegrama): array
    {
        if ($telegrama->total_votos === 0) {
            return ['valido' => true, 'mensaje' => 'No hay votos para validar.'];
        }

        $totalEspeciales = $telegrama->votos_blanco + $telegrama->votos_nulos + $telegrama->votos_impugnados;
        $porcentajeEspeciales = round(($totalEspeciales / $telegrama->total_votos) * 100, 2);

        // Warning si los votos especiales superan el 30%
        if ($porcentajeEspeciales > 30) {
            return [
                'valido' => false,
                'mensaje' => "Los votos blancos, nulos e impugnados representan el {$porcentajeEspeciales}% del total. " .
                            "Verifique que sea correcto.",
            ];
        }

        return [
            'valido' => true,
            'mensaje' => "Votos especiales: {$porcentajeEspeciales}%",
        ];
    }

    /**
     * Detectar candidatos sin votos (puede ser válido pero es un warning)
     */
    protected function validarCandidatosSinVotos(Telegrama $telegrama): array
    {
        $candidatosSinVotos = $telegrama->candidatos()
            ->wherePivot('votos', 0)
            ->count();

        if ($candidatosSinVotos > 0) {
            return [
                'valido' => false,
                'mensaje' => "Hay {$candidatosSinVotos} candidato(s) sin votos en este telegrama.",
            ];
        }

        return [
            'valido' => true,
            'mensaje' => 'Todos los candidatos tienen votos registrados.',
        ];
    }

    /**
     * Obtener detalles completos de la validación
     */
    protected function obtenerDetallesValidacion(Telegrama $telegrama): array
    {
        return [
            'id_mesa' => $telegrama->id_mesa,
            'provincia' => $telegrama->provincia?->nombre,
            'total_electores' => $telegrama->total_electores,
            'total_votos' => $telegrama->total_votos,
            'votos_candidatos' => $telegrama->getTotalVotosCandidatos(),
            'votos_blanco' => $telegrama->votos_blanco,
            'votos_nulos' => $telegrama->votos_nulos,
            'votos_impugnados' => $telegrama->votos_impugnados,
            'porcentaje_participacion' => $telegrama->getPorcentajeParticipacion(),
            'candidatos_count' => $telegrama->candidatos()->count(),
        ];
    }

    /**
     * Validar datos antes de crear/actualizar telegrama
     */
    public function validarDatos(array $datos): array
    {
        $errores = [];

        // Validar campos requeridos
        $camposRequeridos = ['id_mesa', 'provincia_id', 'circuito_escuela', 'total_electores', 'total_votos'];
        foreach ($camposRequeridos as $campo) {
            if (!isset($datos[$campo]) || $datos[$campo] === null || $datos[$campo] === '') {
                $errores[] = "El campo '{$campo}' es requerido.";
            }
        }

        // Validar tipos numéricos
        $camposNumericos = ['total_electores', 'total_votos', 'votos_blanco', 'votos_nulos', 'votos_impugnados'];
        foreach ($camposNumericos as $campo) {
            if (isset($datos[$campo]) && (!is_numeric($datos[$campo]) || $datos[$campo] < 0)) {
                $errores[] = "El campo '{$campo}' debe ser un número entero positivo.";
            }
        }

        // Validar votos de candidatos si están presentes
        if (isset($datos['candidatos']) && is_array($datos['candidatos'])) {
            foreach ($datos['candidatos'] as $index => $candidato) {
                if (!isset($candidato['candidato_id'])) {
                    $errores[] = "El candidato en la posición {$index} no tiene 'candidato_id'.";
                }
                if (!isset($candidato['votos']) || !is_numeric($candidato['votos']) || $candidato['votos'] < 0) {
                    $errores[] = "El candidato en la posición {$index} tiene votos inválidos.";
                }
            }
        }

        return [
            'valido' => empty($errores),
            'errores' => $errores,
        ];
    }

    /**
     * Validar lote de telegramas (para importación)
     */
    public function validarLote(array $telegramas): array
    {
        $resultados = [];
        $erroresGenerales = [];

        // Validar IDs de mesa únicos dentro del lote
        $idsMesa = array_column($telegramas, 'id_mesa');
        $idsDuplicados = array_filter(array_count_values($idsMesa), fn($count) => $count > 1);

        if (!empty($idsDuplicados)) {
            $erroresGenerales[] = 'IDs de mesa duplicados en el lote: ' . implode(', ', array_keys($idsDuplicados));
        }

        foreach ($telegramas as $index => $datostelegrama) {
            $validacion = $this->validarDatos($datostelegrama);
            $resultados[] = [
                'indice' => $index,
                'id_mesa' => $datostelegrama['id_mesa'] ?? 'N/A',
                'valido' => $validacion['valido'],
                'errores' => $validacion['errores'],
            ];
        }

        $totalValidos = count(array_filter($resultados, fn($r) => $r['valido']));
        $totalInvalidos = count($resultados) - $totalValidos;

        return [
            'valido' => empty($erroresGenerales) && $totalInvalidos === 0,
            'total' => count($telegramas),
            'validos' => $totalValidos,
            'invalidos' => $totalInvalidos,
            'errores_generales' => $erroresGenerales,
            'resultados' => $resultados,
        ];
    }
}
