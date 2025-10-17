import { apiClient } from './client';
import { 
  Provincia, 
  CreateProvinciaRequest, 
  UpdateProvinciaRequest, 
  ProvinciaFilters,
  PaginatedResponse,
  ProvinciaStats 
} from '@/types';

export const provinciasService = {
  async getProvincias(filters?: ProvinciaFilters): Promise<PaginatedResponse<Provincia>> {
    return apiClient.get<PaginatedResponse<Provincia>>('/provincias', filters);
  },

  async getProvincia(id: number): Promise<Provincia> {
    return apiClient.get<Provincia>(`/provincias/${id}`);
  },

  async createProvincia(data: CreateProvinciaRequest): Promise<Provincia> {
    return apiClient.post<Provincia>('/provincias', data);
  },

  async updateProvincia(id: number, data: UpdateProvinciaRequest): Promise<Provincia> {
    return apiClient.put<Provincia>(`/provincias/${id}`, data);
  },

  async deleteProvincia(id: number): Promise<void> {
    return apiClient.delete<void>(`/provincias/${id}`);
  },

  async getProvinciaStats(id: number): Promise<ProvinciaStats> {
    return apiClient.get<ProvinciaStats>(`/provincias/${id}/estadisticas`);
  },

  async getProvinciaCandidatos(id: number, filters?: any): Promise<any> {
    return apiClient.get(`/provincias/${id}/candidatos`, filters);
  },

  async getProvinciaTelegramas(id: number, filters?: any): Promise<any> {
    return apiClient.get(`/provincias/${id}/telegramas`, filters);
  },
};