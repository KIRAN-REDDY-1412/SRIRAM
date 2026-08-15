'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  demoLogin: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('resqai_token');
    const storedUser = localStorage.getItem('resqai_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse cached user data');
      }
      
      // Verify token freshness with backend
      api.me()
        .then((res) => {
          setUser(res.user);
          localStorage.setItem('resqai_user', JSON.stringify(res.user));
        })
        .catch(() => {
          // Token expired or invalid
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const data = await api.login(email, password);
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('resqai_token', data.token);
    localStorage.setItem('resqai_user', JSON.stringify(data.user));
  };

  const register = async (formData: any) => {
    const data = await api.register(formData);
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('resqai_token', data.token);
    localStorage.setItem('resqai_user', JSON.stringify(data.user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('resqai_token');
    localStorage.removeItem('resqai_user');
  };

  const demoLogin = async (role: UserRole) => {
    const emailMap: Record<UserRole, string> = {
      victim: 'victim@example.com',
      volunteer: 'volunteer@example.com',
      admin: 'admin@example.com',
    };
    await login(emailMap[role], 'password123');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, demoLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
