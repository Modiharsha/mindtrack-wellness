import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (payload: any) => Promise<void>;
  logout: () => void;
  switchUserRoleForDemo: (role: UserRole, emailOverride?: string) => Promise<void>;
  submitConsent: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('mindtrack_token'));
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      if (!localStorage.getItem('mindtrack_token')) {
        setUser(null);
        setLoading(false);
        return;
      }
      const data = await api.getMe();
      setUser(data.user);
    } catch (err) {
      console.error('Failed to load user profile:', err);
      localStorage.removeItem('mindtrack_token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await api.login({ email, password });
    localStorage.setItem('mindtrack_token', data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const signup = async (payload: any) => {
    const data = await api.signup(payload);
    localStorage.setItem('mindtrack_token', data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('mindtrack_token');
    setToken(null);
    setUser(null);
  };

  const submitConsent = async () => {
    await api.submitConsent();
    await refreshUser();
  };

  // Demo Switcher for fast review/testing
  const switchUserRoleForDemo = async (role: UserRole, emailOverride?: string) => {
    let email = emailOverride;
    if (!email) {
      if (role === 'ADMIN') email = 'admin@mindtrack.edu';
      else if (role === 'COUNSELOR') email = 'dr.sarah@mindtrack.edu';
      else email = 'alex.rivera@mindtrack.edu';
    }
    await login(email, 'Password@123');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        signup,
        logout,
        switchUserRoleForDemo,
        submitConsent,
        refreshUser,
      }}
    >
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
