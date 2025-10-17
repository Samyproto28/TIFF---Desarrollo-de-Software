// Tipos para el Sistema Electoral - Entidades del Backend

export interface Provincia {
    id: number;
    nombre: string;
    codigo: string | null;
    observaciones: string | null;
    created_at: string;
    updated_at: string;
}

export interface Candidato {
    id: number;
    nombre_completo: string;
    cargo: 'Diputado' | 'Senador';
    provincia_id: number;
    provincia?: Provincia;
    lista_alianza: string | null;
    observaciones: string | null;
    created_at: string;
    updated_at: string;
}

export interface Telegrama {
    id: number;
    id_mesa: string;
    provincia_id: number;
    provincia?: Provincia;
    circuito_escuela: string;
    total_electores: number;
    total_votos: number;
    votos_blanco: number;
    votos_nulos: number;
    votos_impugnados: number;
    estado: 'pendiente' | 'validado' | 'rechazado';
    fecha_carga: string | null;
    fecha_validacion: string | null;
    motivo_rechazo: string | null;
    candidatos?: CandidatoTelegrama[];
    created_at: string;
    updated_at: string;
}

export interface CandidatoTelegrama {
    id: number;
    nombre_completo: string;
    cargo: string;
    pivot: {
        votos: number;
    };
}

export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data: T;
}

export interface PaginatedResponse<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

// Tipos para estadísticas
export interface EstadisticasGenerales {
    total_telegramas: number;
    telegramas_validados: number;
    telegramas_pendientes: number;
    telegramas_rechazados: number;
    total_electores: number;
    total_votos: number;
    total_votos_blanco: number;
    total_votos_nulos: number;
    total_votos_impugnados: number;
    porcentaje_participacion: number;
}

export interface RankingCandidato {
    id: number;
    nombre_completo: string;
    cargo: string;
    provincia: string;
    lista_alianza: string | null;
    total_votos: number;
    porcentaje: number;
}

export interface ValidacionTelegrama {
    valido: boolean;
    errores: string[];
    warnings: string[];
    detalles?: {
        id_mesa: string;
        provincia: string;
        total_electores: number;
        total_votos: number;
        votos_candidatos: number;
        votos_blanco: number;
        votos_nulos: number;
        votos_impugnados: number;
        porcentaje_participacion: number;
        candidatos_count: number;
    };
}

export interface ResultadoImportacion {
    exitosos: number;
    fallidos: number;
    errores: Array<{
        indice: number;
        id_mesa: string;
        error: string;
    }>;
    telegramas_creados: Telegrama[];
}

// Tipos para formularios
export interface CandidatoForm {
    nombre_completo: string;
    cargo: 'Diputado' | 'Senador';
    provincia_id: number;
    lista_alianza: string | null;
    observaciones: string | null;
}

export interface ProvinciaForm {
    nombre: string;
    codigo: string | null;
    observaciones: string | null;
}

export interface TelegramaForm {
    id_mesa: string;
    provincia_id: number;
    circuito_escuela: string;
    total_electores: number;
    total_votos: number;
    votos_blanco: number;
    votos_nulos: number;
    votos_impugnados: number;
    candidatos: Array<{
        candidato_id: number;
        votos: number;
    }>;
}

// Tipos para filtros
export interface FiltrosTelegrama {
    provincia_id?: number;
    estado?: 'pendiente' | 'validado' | 'rechazado';
    fecha_desde?: string;
    fecha_hasta?: string;
    search?: string;
    page?: number;
    per_page?: number;
}

export interface FiltrosCandidato {
    provincia_id?: number;
    cargo?: 'Diputado' | 'Senador';
    search?: string;
    page?: number;
    per_page?: number;
}

// Tipos para errores de validación
export interface ValidationError {
    message: string;
    errors: Record<string, string[]>;
}
