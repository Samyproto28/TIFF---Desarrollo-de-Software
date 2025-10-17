// Helper para hacer peticiones a la API del sistema electoral

import { router } from '@inertiajs/vue3';

export const api = {
    /**
     * Realizar petición GET
     */
    async get<T>(url: string, params?: Record<string, any>): Promise<T> {
        const searchParams = params ? new URLSearchParams(params).toString() : '';
        const fullUrl = searchParams ? `${url}?${searchParams}` : url;
        
        const response = await fetch(fullUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return response.json();
    },
    
    /**
     * Realizar petición POST
     */
    async post<T>(url: string, data: any): Promise<T> {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
            body: JSON.stringify(data),
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
        }
        
        return response.json();
    },
    
    /**
     * Realizar petición PUT
     */
    async put<T>(url: string, data: any): Promise<T> {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
            body: JSON.stringify(data),
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
        }
        
        return response.json();
    },
    
    /**
     * Realizar petición DELETE
     */
    async delete<T>(url: string): Promise<T> {
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
        }
        
        return response.json();
    },
    
    /**
     * Subir archivo (para importación)
     */
    async uploadFile<T>(url: string, file: File, additionalData?: Record<string, any>): Promise<T> {
        const formData = new FormData();
        formData.append('archivo', file);
        
        if (additionalData) {
            Object.entries(additionalData).forEach(([key, value]) => {
                formData.append(key, String(value));
            });
        }
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
            body: formData,
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
        }
        
        return response.json();
    },
    
    /**
     * Descargar archivo
     */
    async downloadFile(url: string, filename?: string): Promise<void> {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename || 'download';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
    }
};

/**
 * Helper para navegación con Inertia
 */
export const navigate = {
    /**
     * Navegar a una página
     */
    to(url: string, options?: any) {
        router.visit(url, options);
    },
    
    /**
     * Navegar hacia atrás
     */
    back() {
        router.back();
    },
    
    /**
     * Recargar página actual
     */
    reload() {
        router.reload();
    },
    
    /**
     * Reemplazar página actual
     */
    replace(url: string, options?: any) {
        router.visit(url, { ...options, replace: true });
    },
};

/**
 * Helper para formatear fechas
 */
export const formatDate = (date: string | Date): string => {
    const d = new Date(date);
    return d.toLocaleDateString('es-AR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

/**
 * Helper para formatear números
 */
export const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('es-AR').format(num);
};

/**
 * Helper para formatear porcentajes
 */
export const formatPercentage = (num: number, decimals: number = 1): string => {
    return `${num.toFixed(decimals)}%`;
};

/**
 * Helper para validar email
 */
export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Helper para generar IDs únicos
 */
export const generateId = (): string => {
    return Math.random().toString(36).substr(2, 9);
};
