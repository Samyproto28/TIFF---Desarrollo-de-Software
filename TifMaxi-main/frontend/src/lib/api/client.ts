import { ApiResponse, PaginatedResponse } from '@/types';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1') {
    this.baseURL = baseURL;
    // Load token from cookies on initialization
    if (typeof window !== 'undefined') {
      this.token = this.getTokenFromCookies();
    }
  }

  private getTokenFromCookies(): string | null {
    if (typeof document === 'undefined') return null;

    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'auth_token') {
        return decodeURIComponent(value);
      }
    }
    return null;
  }

  private setTokenCookie(token: string) {
    if (typeof document === 'undefined') return;

    // Set cookie with security flags
    const isProduction = process.env.NODE_ENV === 'production';
    const secure = isProduction ? 'secure;' : '';
    document.cookie = `auth_token=${encodeURIComponent(token)}; path=/; ${secure} samesite=strict; max-age=86400`;
  }

  private removeTokenCookie() {
    if (typeof document === 'undefined') return;

    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=strict';
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Merge existing headers
    if (options.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        if (typeof value === 'string') {
          headers[key] = value;
        }
      });
    }

    // Add authorization header if token exists
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      
      // Handle 401 Unauthorized - token expired or invalid
      if (response.status === 401) {
        this.logout();
        throw new Error('Sesión expirada. Por favor inicie sesión nuevamente.');
      }

      // Handle other HTTP errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      // Parse response
      const data = await response.json();
      
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error de conexión al servidor');
    }
  }

  // Authentication methods
  setToken(token: string) {
    this.token = token;
    this.setTokenCookie(token);
  }

  removeToken() {
    this.token = null;
    this.removeTokenCookie();
  }

  getToken(): string | null {
    return this.token;
  }

  hasToken(): boolean {
    return !!this.token;
  }

  logout() {
    this.removeToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  // HTTP methods
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    let finalEndpoint = endpoint;

    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      const paramString = searchParams.toString();
      if (paramString) {
        finalEndpoint += `?${paramString}`;
      }
    }

    return this.request<T>(finalEndpoint, {
      method: 'GET',
    });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  // File upload method
  async upload<T>(endpoint: string, file: File, additionalData?: Record<string, any>): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    const headers: Record<string, string> = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error al subir archivo');
    }
  }

  // Download file method
  async download(endpoint: string, filename?: string): Promise<void> {
    const headers: Record<string, string> = {
      'Accept': 'application/json, text/csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        headers,
      });

      if (!response.ok) {
        throw new Error(`Error al descargar archivo: ${response.statusText}`);
      }

      // Get filename from Content-Disposition header if not provided
      const contentDisposition = response.headers.get('Content-Disposition');
      let downloadFilename = filename;
      
      if (!downloadFilename && contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch) {
          downloadFilename = filenameMatch[1];
        }
      }

      if (!downloadFilename) {
        downloadFilename = 'download';
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = downloadFilename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error al descargar archivo');
    }
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Export types for use in components
export type { ApiResponse, PaginatedResponse };