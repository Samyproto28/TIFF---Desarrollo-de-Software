// Base types
export interface BaseEntity {
  id: number;
  created_at: string;
  updated_at: string;
}

// Auth types
export interface User extends BaseEntity {
  name: string;
  email: string;
  email_verified_at?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

// Provincia types
export interface Provincia extends BaseEntity {
  nombre: string;
  codigo: string;
  activo: boolean;
}

export interface CreateProvinciaRequest {
  nombre: string;
  codigo: string;
  activo?: boolean;
}

export interface UpdateProvinciaRequest extends Partial<CreateProvinciaRequest> {}

// Candidato types
export type Cargo = 'Diputado' | 'Senador';

export interface Candidato extends BaseEntity {
  nombre_completo: string;
  cargo: Cargo;
  provincia_id: number;
  lista_alianza: string;
  observaciones?: string;
  activo: boolean;
  provincia?: Provincia;
}

export interface CreateCandidatoRequest {
  nombre_completo: string;
  cargo: Cargo;
  provincia_id: number;
  lista_alianza: string;
  observaciones?: string;
  activo?: boolean;
}

export interface UpdateCandidatoRequest extends Partial<CreateCandidatoRequest> {}

// Telegrama types
export type TelegramaEstado = 'pendiente' | 'validado' | 'rechazado';

export interface Telegrama extends BaseEntity {
  id_mesa: string;
  provincia_id: number;
  circuito_escuela: string;
  total_electores: number;
  total_votos: number;
  votos_blanco: number;
  votos_nulos: number;
  votos_impugnados: number;
  estado: TelegramaEstado;
  motivo_rechazo?: string;
  fecha_carga: string;
  usuario_carga_id?: number;
  fecha_validacion?: string;
  usuario_validacion_id?: number;
  provincia?: Provincia;
  candidatos?: CandidatoTelegrama[];
}

export interface CandidatoTelegrama {
  id: number;
  candidato_id: number;
  telegrama_id: number;
  votos: number;
  candidato?: Candidato;
}

export interface CreateTelegramaRequest {
  id_mesa: string;
  provincia_id: number;
  circuito_escuela: string;
  total_electores: number;
  votos_blanco: number;
  votos_nulos: number;
  votos_impugnados: number;
  candidatos: {
    candidato_id: number;
    votos: number;
  }[];
}

export interface UpdateTelegramaRequest extends Partial<CreateTelegramaRequest> {}

// Import/Export types
export interface ImportRequest {
  file: File;
  format: 'csv' | 'json';
}

export interface ImportResult {
  total: number;
  successful: number;
  failed: number;
  errors: {
    row: number;
    field: string;
    message: string;
  }[];
}

export interface ExportFilters {
  provincia_id?: number;
  estado?: TelegramaEstado;
  fecha_desde?: string;
  fecha_hasta?: string;
  circuito_escuela?: string;
  id_mesa?: string;
}

// Statistics types
export interface GeneralStats {
  total_telegramas: number;
  telegramas_pendientes: number;
  telegramas_validados: number;
  telegramas_rechazados: number;
  total_electores: number;
  total_votos: number;
  votos_blanco: number;
  votos_nulos: number;
  votos_impugnados: number;
  porcentaje_participacion: number;
}

export interface ProvinciaStats {
  provincia: Provincia;
  total_telegramas: number;
  telegramas_pendientes: number;
  telegramas_validados: number;
  telegramas_rechazados: number;
  total_electores: number;
  total_votos: number;
  votos_blanco: number;
  votos_nulos: number;
  votos_impugnados: number;
  porcentaje_participacion: number;
}

export interface CandidatoStats {
  candidato: Candidato;
  total_votos: number;
  total_votos_validados: number;
  porcentaje_votos: number;
  porcentaje_votos_validados: number;
  ranking_cargo: number;
  es_mas_votado: boolean;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

// Filter types
export interface FilterParams {
  page?: number;
  per_page?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface ProvinciaFilters extends FilterParams {
  nombre?: string;
  codigo?: string;
  activo?: boolean;
}

export interface CandidatoFilters extends FilterParams {
  nombre?: string;
  cargo?: Cargo;
  provincia_id?: number;
  lista_alianza?: string;
  activo?: boolean;
}

export interface TelegramaFilters extends FilterParams {
  provincia_id?: number;
  estado?: TelegramaEstado;
  fecha_desde?: string;
  fecha_hasta?: string;
  circuito_escuela?: string;
  id_mesa?: string;
}