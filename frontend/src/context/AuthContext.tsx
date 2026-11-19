import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import type { User } from '../types/stocknova';
import { authService, extractApiError, getStoredToken, setStoredToken } from '../services/api';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  authError: string;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState('');

  const refreshUser = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      setAuthError('');
      setLoading(false);
      return;
    }
    setAuthError('');
    try {
      const profile = await authService.me();
      setUser(profile);
      localStorage.setItem('stocknova_role', profile.role.toLowerCase());
    } catch (error) {
      setUser(null);
      if (axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403)) {
        setStoredToken(null);
        localStorage.removeItem('stocknova_role');
      } else {
        setAuthError(extractApiError(error, 'No se pudo verificar la sesión.'));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authService.login(email, password);
    setStoredToken(res.access_token);
    setUser(res.user);
    setAuthError('');
    localStorage.setItem('stocknova_role', res.user.role.toLowerCase());
    return res.user;
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const res = await authService.register(name, email, password);
    setStoredToken(res.access_token);
    setUser(res.user);
    setAuthError('');
    localStorage.setItem('stocknova_role', res.user.role.toLowerCase());
    return res.user;
  }, []);

  const logout = useCallback(() => {
    setStoredToken(null);
    setUser(null);
    setAuthError('');
    localStorage.removeItem('stocknova_role');
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authError,
        isAuthenticated: Boolean(user),
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe utilizarse dentro de AuthProvider.');
  }
  return ctx;
}
