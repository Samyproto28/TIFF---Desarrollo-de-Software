export interface Auth {
    user: User;
}

export type AppPageProps<T extends Record<string, unknown> = Record<string, unknown>> = T & {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
};

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
}

// Tipos para páginas específicas del sistema electoral
export interface DashboardPageProps {
    estadisticas: EstadisticasGenerales;
    rankingCandidatos: RankingCandidato[];
}

export interface ProvinciasIndexPageProps {
    provincias: PaginatedResponse<Provincia>;
}

export interface ProvinciasCreatePageProps {
    // Sin props adicionales para creación
}

export interface ProvinciasEditPageProps {
    provincia: Provincia;
}

export interface ProvinciasShowPageProps {
    provincia: Provincia;
    candidatos: PaginatedResponse<Candidato>;
    telegramas: PaginatedResponse<Telegrama>;
    estadisticas: EstadisticasGenerales;
}

export interface CandidatosIndexPageProps {
    candidatos: PaginatedResponse<Candidato>;
    provincias: Provincia[];
    filtros: FiltrosCandidato;
}

export interface CandidatosCreatePageProps {
    provincias: Provincia[];
}

export interface CandidatosEditPageProps {
    candidato: Candidato;
    provincias: Provincia[];
}

export interface CandidatosShowPageProps {
    candidato: Candidato;
    estadisticas: {
        total_votos: number;
        total_votos_validados: number;
        porcentaje: number;
    };
    votos: Array<{
        telegrama_id: number;
        id_mesa: string;
        votos: number;
        estado: string;
    }>;
}

export interface TelegramasIndexPageProps {
    telegramas: PaginatedResponse<Telegrama>;
    provincias: Provincia[];
    filtros: FiltrosTelegrama;
}

export interface TelegramasCreatePageProps {
    provincias: Provincia[];
    candidatos: Candidato[];
}

export interface TelegramasEditPageProps {
    telegrama: Telegrama;
    provincias: Provincia[];
    candidatos: Candidato[];
}

export interface TelegramasShowPageProps {
    telegrama: Telegrama;
    validacion: ValidacionTelegrama;
}

export interface TelegramasImportPageProps {
    provincias: Provincia[];
    candidatos: Candidato[];
}
