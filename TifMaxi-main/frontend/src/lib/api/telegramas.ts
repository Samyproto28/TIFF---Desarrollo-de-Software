import { apiClient } from './client';
import { 
  Telegrama, 
  CreateTelegramaRequest, 
  UpdateTelegramaRequest, 
  TelegramaFilters,
  PaginatedResponse,
  GeneralStats,
  ExportFilters 
} from '@/types';

export const telegramasService = {
  async getTelegramas(filters?: TelegramaFilters): Promise<PaginatedResponse<Telegrama>> {
    return apiClient.get<PaginatedResponse<Telegrama>>('/telegramas', filters);
  },

  async getTelegrama(id: number): Promise<Telegrama> {
    return apiClient.get<Telegrama>(`/telegramas/${id}`);
  },

  async createTelegrama(data: CreateTelegramaRequest): Promise<Telegrama> {
    return apiClient.post<Telegrama>('/telegramas', data);
  },

  async updateTelegrama(id: number, data: UpdateTelegramaRequest): Promise<Telegrama> {
    return apiClient.put<Telegrama>(`/telegramas/${id}`, data);
  },

  async deleteTelegrama(id: number): Promise<void> {
    return apiClient.delete<void>(`/telegramas/${id}`);
  },

  async validateTelegrama(id: number): Promise<Telegrama> {
    return apiClient.post<Telegrama>(`/telegramas/${id}/validar`);
  },

  async rejectTelegrama(id: number, motivo: string): Promise<Telegrama> {
    return apiClient.post<Telegrama>(`/telegramas/${id}/rechazar`, { motivo_rechazo: motivo });
  },

  async getTelegramaResumen(id: number): Promise<any> {
    return apiClient.get(`/telegramas/${id}/resumen`);
  },

  async getGeneralStats(): Promise<GeneralStats> {
    return apiClient.get<GeneralStats>('/telegramas/stats/general');
  },

  async importFile(file: File, format: 'csv' | 'json'): Promise<any> {
    return apiClient.upload('/telegramas/import/file', file, { format });
  },

  async exportCSV(filters?: ExportFilters): Promise<void> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    
    const filename = `telegramas_${new Date().toISOString().split('T')[0]}.csv`;
    await apiClient.download(`/telegramas/export/csv?${params.toString()}`, filename);
  },

  async exportJSON(filters?: ExportFilters): Promise<void> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    
    const filename = `telegramas_${new Date().toISOString().split('T')[0]}.json`;
    await apiClient.download(`/telegramas/export/json?${params.toString()}`, filename);
  },
};