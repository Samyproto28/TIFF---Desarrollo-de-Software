'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { authService } from '@/lib/api';

export function useAuth(requireAuth = true) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, setLoading, logout } = useAuthStore();

  useEffect(() => {
    const checkAuth = async () => {
      if (requireAuth && !isAuthenticated && !isLoading) {
        // Try to get current user if we have a token
        try {
          setLoading(true);
          const currentUser = await authService.me();
          useAuthStore.getState().login(currentUser, useAuthStore.getState().token || '');
        } catch (error) {
          // Token is invalid or expired
          logout();
          router.push('/login');
        } finally {
          setLoading(false);
        }
      }
    };

    checkAuth();
  }, [requireAuth, isAuthenticated, isLoading, router, setLoading, logout]);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      // Even if logout fails on server, clear local state
      console.error('Logout error:', error);
    } finally {
      logout();
      router.push('/login');
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    logout: handleLogout,
  };
}