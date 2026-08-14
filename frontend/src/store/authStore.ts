import { create } from 'zustand';
import api from '../services/api';
import type { AuthState } from '../types';

export const useAuthStore = create<AuthState>((set) => {
  // Initialize from localStorage
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  return {
    user,
    token,
    isAuthenticated: !!token,

    login: async (username: string, password: string) => {
      try {
        const response = await api.post('/auth/login', { username, password });
        const { token, user } = response.data;

        // Save to localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        set({
          user,
          token,
          isAuthenticated: true,
        });
      } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Login failed');
      }
    },

    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({
        user: null,
        token: null,
        isAuthenticated: false,
      });
    },
  };
});
