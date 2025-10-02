import { AuthProvider } from '@refinedev/core';
import { LoginCredentials, LoginResponse, User } from '@/types';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001/v1';

export const authProvider: AuthProvider = {
  login: async ({ email, password }: LoginCredentials) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data: { success: boolean; data: LoginResponse; message?: string } = await response.json();

      if (data.success && data.data) {
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        
        return {
          success: true,
          redirectTo: '/',
        };
      }

      return {
        success: false,
        error: {
          message: data.message || 'Login failed',
          name: 'LoginError',
        },
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: {
          message: 'Network error',
          name: 'NetworkError',
        },
      };
    }
  },

  logout: async () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    return {
      success: true,
      redirectTo: '/login',
    };
  },

  check: async () => {
    const token = localStorage.getItem('accessToken');
    
    if (token) {
      return {
        authenticated: true,
      };
    }

    return {
      authenticated: false,
      redirectTo: '/login',
    };
  },

  getPermissions: async () => {
    const user = localStorage.getItem('user');
    if (user) {
      const parsedUser: User = JSON.parse(user);
      return parsedUser.role;
    }
    return null;
  },

  getIdentity: async () => {
    const user = localStorage.getItem('user');
    if (user) {
      return JSON.parse(user);
    }
    return null;
  },

  onError: async (error) => {
    console.error('Auth error:', error);
    
    if (error.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      return {
        logout: true,
        redirectTo: '/login',
      };
    }
    
    return {};
  },
};
