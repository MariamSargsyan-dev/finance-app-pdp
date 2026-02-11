import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';

export interface MeResponse {
  id: string;
  email: string;
  onboardingCompleted: boolean;
  accountsCount: number;
  categoriesCount: number;
  transactionsCount: number;
}

interface User {
  id: string;
  email: string;
  onboardingCompleted: boolean;
  accountsCount?: number;
  categoriesCount?: number;
  transactionsCount?: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const normalizeMe = (data: MeResponse): User => ({
    id: data.id,
    email: data.email,
    onboardingCompleted: data.onboardingCompleted === true,
    accountsCount: data.accountsCount,
    categoriesCount: data.categoriesCount,
    transactionsCount: data.transactionsCount,
  });

  const refreshMe = async () => {
    try {
      const userData = await api.getMe();
      const user = normalizeMe(userData);
      setUser(user);
      return user;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        try {
          const userData = await api.getMe();
          setUser(normalizeMe(userData));
        } catch (error) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  useEffect(() => {
    const onFocus = async () => {
      if (!localStorage.getItem('accessToken')) return;
      try {
        const userData = await api.getMe();
        setUser(normalizeMe(userData));
      } catch {
      }
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.login(email, password);
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    const me = await api.getMe();
    setUser(normalizeMe(me));
  };

  const register = async (email: string, password: string) => {
    const response = await api.register(email, password);
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    const me = await api.getMe();
    setUser(normalizeMe(me));
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
