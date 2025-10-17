import { apiClient } from './client';
import { 
  Candidato, 
  CreateCandidatoRequest, 
  UpdateCandidatoRequest, 
  CandidatoFilters,
  PaginatedResponse,
  CandidatoStats 
} from '@/types';

export const candidatosService = {
  async getCandidatos(filters?: CandidatoFilters): Promise<PaginatedResponse<Candidato>> {
    return apiClient.get<PaginatedResponse<Candidato>>('/candidatos', filters);
  },

  async getCandidato(id: number): Promise<Candidato> {
    return apiClient.get<Candidato>(`/candidatos/${id}`);
  },

  async createCandidato(data: CreateCandidatoRequest): Promise<Candidato> {
    return apiClient.post<Candidato>('/candidatos', data);
  },

  async updateCandidato(id: number, data: UpdateCandidatoRequest): Promise<Candidato> {
    return apiClient.put<Candidato>(`/candidatos/${id}`, data);
  },

  async deleteCandidato(id: number): Promise<void> {
    return apiClient.delete<void>(`/candidatos/${id}`);
  },

  async getCandidatoStats(id: number): Promise<CandidatoStats> {
    return apiClient.get<CandidatoStats>(`/candidatos/${id}/estadisticas`);
  },

  async getCandidatoVotos(id: number, filters?: any): Promise<any> {
    return apiClient.get(`/candidatos/${id}/votos`, filters);
  },

  async getRankingByCargo(cargo: 'Diputado' | 'Senador'): Promise<any> {
    return apiClient.get(`/candidatos/ranking/${cargo}`);
  },
};