import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { User, UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  demoLogin: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('rb_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      const res = await api.getMe();
      setUser(res.user);
      setProfile(res.profile);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setUser(null);
      setProfile(null);
      localStorage.removeItem('rb_token');
      setToken(null);
    }
  };

  useEffect(() => {
    if (token) {
      refreshUser().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }

    const handleUnauthorized = () => {
      setUser(null);
      setProfile(null);
      setToken(null);
    };

    window.addEventListener('rb_unauthorized', handleUnauthorized);
    return () => window.removeEventListener('rb_unauthorized', handleUnauthorized);
  }, [token]);

  const login = async (credentials: any) => {
    const res = await api.login(credentials);
    localStorage.setItem('rb_token', res.token);
    setToken(res.token);
    setUser(res.user);
    await refreshUser();
  };

  const register = async (data: any) => {
    const res = await api.register(data);
    localStorage.setItem('rb_token', res.token);
    setToken(res.token);
    setUser(res.user);
    await refreshUser();
  };

  const demoLogin = async () => {
    const res = await api.demoLogin();
    localStorage.setItem('rb_token', res.token);
    setToken(res.token);
    setUser(res.user);
    await refreshUser();
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (err) {
      // ignore
    } finally {
      localStorage.removeItem('rb_token');
      setToken(null);
      setUser(null);
      setProfile(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        demoLogin,
        logout,
        refreshUser
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
