import { defineStore } from 'pinia';
import { api } from '@/lib/api';
import type {
  Provincia,
  Candidato,
  EstadisticasGenerales,
  RankingCandidato,
  CandidatoForm,
  ProvinciaForm
} from '@/types/api';

interface ElectoralState {
  provincias: Provincia[];
  candidatos: Candidato[];
  estadisticas: EstadisticasGenerales | null;
  rankingCandidatos: RankingCandidato[];
  loading: boolean;
  error: string | null;
  lastUpdated: {
    provincias: Date | null;
    candidatos: Date | null;
    estadisticas: Date | null;
    ranking: Date | null;
  };
}

export const useElectoralStore = defineStore('electoral', {
  state: (): ElectoralState => ({
    provincias: [],
    candidatos: [],
    estadisticas: null,
    rankingCandidatos: [],
    loading: false,
    error: null,
    lastUpdated: {
      provincias: null,
      candidatos: null,
      estadisticas: null,
      ranking: null,
    },
  }),

  getters: {
    getCandidatosByProvincia: (state) => (provinciaId: number) => {
      return state.candidatos.filter((c: Candidato) => c.provincia_id === provinciaId);
    },
    
    getProvinciaById: (state) => (id: number) => {
      return state.provincias.find((p: Provincia) => p.id === id);
    },
    
    getCandidatoById: (state) => (id: number) => {
      return state.candidatos.find((c: Candidato) => c.id === id);
    },
    
    getCandidatosByCargo: (state) => (cargo: 'Diputado' | 'Senador') => {
      return state.candidatos.filter((c: Candidato) => c.cargo === cargo);
    },
    
    getProvinciasWithCandidatos: (state) => {
      return state.provincias.filter((provincia: Provincia) =>
        state.candidatos.some((candidato: Candidato) => candidato.provincia_id === provincia.id)
      );
    },
    
    getTotalCandidatos: (state) => {
      return state.candidatos.length;
    },
    
    getTotalProvincias: (state) => {
      return state.provincias.length;
    },
    
    getCandidatosByProvinciaAndCargo: (state) => (provinciaId: number, cargo: 'Diputado' | 'Senador') => {
      return state.candidatos.filter((c: Candidato) =>
        c.provincia_id === provinciaId && c.cargo === cargo
      );
    },
    
    getRankingByCargo: (state) => (cargo: 'Diputado' | 'Senador') => {
      return state.rankingCandidatos
        .filter((c: RankingCandidato) => c.cargo === cargo)
        .sort((a: RankingCandidato, b: RankingCandidato) => b.total_votos - a.total_votos);
    },
    
    getRankingByProvincia: (state) => (provinciaId: number) => {
      return state.rankingCandidatos
        .filter((c: RankingCandidato) => {
          // Handle both possible property names
          return (c as any).provincia_id === provinciaId || (c as any).provincia === provinciaId;
        })
        .sort((a: RankingCandidato, b: RankingCandidato) => b.total_votos - a.total_votos);
    },
    
    isDataStale: (state) => (dataType: keyof ElectoralState['lastUpdated'], maxAgeMinutes = 30) => {
      const lastUpdate = state.lastUpdated[dataType];
      if (!lastUpdate) return true;
      
      const now = new Date();
      const diffMinutes = (now.getTime() - lastUpdate.getTime()) / (1000 * 60);
      return diffMinutes > maxAgeMinutes;
    },
  },

  actions: {
    async loadProvincias(force = false) {
      // Skip if not forced and data is not stale
      if (!force && !this.isDataStale('provincias')) {
        return this.provincias;
      }
      
      this.loading = true;
      this.error = null;
      
      try {
        const response = await api.get('/api/v1/provincias') as { data: Provincia[] };
        this.provincias = response.data;
        this.lastUpdated.provincias = new Date();
        return response.data;
      } catch (error: any) {
        this.error = error.message || 'Error loading provincias';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async loadCandidatos(provinciaId?: number, force = false) {
      // Skip if not forced and data is not stale
      if (!force && !this.isDataStale('candidatos')) {
        return this.candidatos;
      }
      
      this.loading = true;
      this.error = null;
      
      try {
        let url = '/api/v1/candidatos';
        if (provinciaId) {
          url = `/api/v1/provincias/${provinciaId}/candidatos`;
        }
        
        const response = await api.get(url) as { data: Candidato[] };
        
        if (provinciaId) {
          // Replace candidates for specific province
          this.candidatos = this.candidatos.filter((c: Candidato) => c.provincia_id !== provinciaId);
          this.candidatos.push(...response.data);
        } else {
          this.candidatos = response.data;
        }
        
        this.lastUpdated.candidatos = new Date();
        return response.data;
      } catch (error: any) {
        this.error = error.message || 'Error loading candidatos';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async loadEstadisticas(force = false) {
      // Skip if not forced and data is not stale
      if (!force && !this.isDataStale('estadisticas')) {
        return this.estadisticas;
      }
      
      this.loading = true;
      this.error = null;
      
      try {
        const response = await api.get('/api/v1/telegramas/stats/general') as { data: EstadisticasGenerales };
        this.estadisticas = response.data;
        this.lastUpdated.estadisticas = new Date();
        return response.data;
      } catch (error: any) {
        this.error = error.message || 'Error loading estadisticas';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async loadRankingCandidatos(force = false) {
      // Skip if not forced and data is not stale
      if (!force && !this.isDataStale('ranking')) {
        return this.rankingCandidatos;
      }
      
      this.loading = true;
      this.error = null;
      
      try {
        const response = await api.get('/api/v1/candidatos/ranking') as { data: RankingCandidato[] };
        this.rankingCandidatos = response.data;
        this.lastUpdated.ranking = new Date();
        return response.data;
      } catch (error: any) {
        this.error = error.message || 'Error loading ranking';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async refreshData() {
      try {
        await Promise.all([
          this.loadProvincias(true),
          this.loadCandidatos(undefined, true),
          this.loadEstadisticas(true),
          this.loadRankingCandidatos(true),
        ]);
      } catch (error) {
        console.error('Error refreshing data:', error);
        throw error;
      }
    },

    async createCandidato(candidatoData: CandidatoForm) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await api.post('/api/v1/candidatos', candidatoData) as { data: Candidato };
        this.candidatos.push(response.data);
        this.lastUpdated.candidatos = new Date();
        return response.data;
      } catch (error: any) {
        this.error = error.message || 'Error creating candidato';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateCandidato(id: number, candidatoData: Partial<CandidatoForm>) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await api.put(`/api/v1/candidatos/${id}`, candidatoData) as { data: Candidato };
        
        // Update candidato in store
        const index = this.candidatos.findIndex((c: Candidato) => c.id === id);
        if (index > -1) {
          this.candidatos[index] = response.data;
        }
        
        this.lastUpdated.candidatos = new Date();
        return response.data;
      } catch (error: any) {
        this.error = error.message || 'Error updating candidato';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteCandidato(id: number) {
      this.loading = true;
      this.error = null;
      
      try {
        await api.delete(`/api/v1/candidatos/${id}`);
        
        // Remove candidato from store
        this.candidatos = this.candidatos.filter((c: Candidato) => c.id !== id);
        this.lastUpdated.candidatos = new Date();
      } catch (error: any) {
        this.error = error.message || 'Error deleting candidato';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createProvincia(provinciaData: ProvinciaForm) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await api.post('/api/v1/provincias', provinciaData) as { data: Provincia };
        this.provincias.push(response.data);
        this.lastUpdated.provincias = new Date();
        return response.data;
      } catch (error: any) {
        this.error = error.message || 'Error creating provincia';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateProvincia(id: number, provinciaData: Partial<ProvinciaForm>) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await api.put(`/api/v1/provincias/${id}`, provinciaData) as { data: Provincia };
        
        // Update provincia in store
        const index = this.provincias.findIndex((p: Provincia) => p.id === id);
        if (index > -1) {
          this.provincias[index] = response.data;
        }
        
        this.lastUpdated.provincias = new Date();
        return response.data;
      } catch (error: any) {
        this.error = error.message || 'Error updating provincia';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteProvincia(id: number) {
      this.loading = true;
      this.error = null;
      
      try {
        await api.delete(`/api/v1/provincias/${id}`);
        
        // Remove provincia from store
        this.provincias = this.provincias.filter((p: Provincia) => p.id !== id);
        this.lastUpdated.provincias = new Date();
      } catch (error: any) {
        this.error = error.message || 'Error deleting provincia';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Search functionality
    searchCandidatos(query: string) {
      if (!query.trim()) return this.candidatos;
      
      const lowerQuery = query.toLowerCase();
      return this.candidatos.filter((candidato: Candidato) =>
        candidato.nombre_completo.toLowerCase().includes(lowerQuery) ||
        candidato.lista_alianza?.toLowerCase().includes(lowerQuery) ||
        candidato.provincia?.nombre.toLowerCase().includes(lowerQuery)
      );
    },

    searchProvincias(query: string) {
      if (!query.trim()) return this.provincias;
      
      const lowerQuery = query.toLowerCase();
      return this.provincias.filter((provincia: Provincia) =>
        provincia.nombre.toLowerCase().includes(lowerQuery) ||
        provincia.codigo?.toLowerCase().includes(lowerQuery)
      );
    },

    // Filter functionality
    filterCandidatos(filters: {
      provincia_id?: number;
      cargo?: 'Diputado' | 'Senador';
      search?: string;
    }) {
      let candidatos = [...this.candidatos];
      
      if (filters.provincia_id) {
        candidatos = candidatos.filter(c => c.provincia_id === filters.provincia_id);
      }
      
      if (filters.cargo) {
        candidatos = candidatos.filter(c => c.cargo === filters.cargo);
      }
      
      if (filters.search) {
        candidatos = this.searchCandidatos(filters.search);
      }
      
      return candidatos;
    },

    // Clear error
    clearError() {
      this.error = null;
    },

    // Initialize store
    async initialize() {
      try {
        await this.loadProvincias();
        await this.loadCandidatos();
        await this.loadEstadisticas();
        await this.loadRankingCandidatos();
      } catch (error) {
        console.error('Error initializing electoral store:', error);
      }
    },
  },
});