'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { User, LoginResponse } from '@/types/api';
import { apiClient } from '@/lib/api-client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: { username_or_email: string; password: string }) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = Cookies.get('auth_token');
      
      if (savedToken) {
        setToken(savedToken);
        try {
          // Set token in API client
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
          
          // Fetch user profile
          const response = await apiClient.get('/api/user/me');
          if (response.data.success) {
            setUser(response.data.data);
          }
        } catch (error) {
          // Token is invalid, remove it
          Cookies.remove('auth_token');
          setToken(null);
          delete apiClient.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials: { username_or_email: string; password: string }) => {
    try {
      const response = await apiClient.post<LoginResponse>('/api/auth/login', credentials);
      
      if (response.data.success && response.data.data) {
        const { user, token } = response.data.data;
        
        // Save token to cookies
        Cookies.set('auth_token', token, { expires: 1 }); // 1 day
        
        // Set token in API client headers
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        setUser(user);
        setToken(token);
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const logout = () => {
    Cookies.remove('auth_token');
    setUser(null);
    setToken(null);
    delete apiClient.defaults.headers.common['Authorization'];
  };

  const value = {
    user,
    token,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};