import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authService, userService } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize auth state from localStorage
    const initializeAuth = async () => {
      const storedToken = authService.getToken();
      const storedUser = authService.getUser();
      
      if (storedToken) {
        setToken(storedToken);
        setUser(storedUser);
        
        // If we have a token but no user data, try to fetch user profile
        if (!storedUser) {
          try {
            const response = await userService.getProfile();
            const userData = response.data;
            localStorage.setItem('auth_user', JSON.stringify(userData));
            setUser(userData);
          } catch (error) {
            // Token might be invalid, clear it
            console.warn('Token validation failed:', error);
            authService.logout();
            setToken(null);
            setUser(null);
          }
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const value = useMemo(() => ({
    token,
    user,
    isLoading,
    isAuthenticated: Boolean(token),
    setAuth: ({ token: t, user: u }) => {
      if (t) {
        localStorage.setItem('auth_token', t);
        setToken(t);
      } else {
        localStorage.removeItem('auth_token');
        setToken(null);
      }
      
      if (u) {
        localStorage.setItem('auth_user', JSON.stringify(u));
        setUser(u);
      } else {
        localStorage.removeItem('auth_user');
        setUser(null);
      }
    },
    logout: () => {
      authService.logout();
      setToken(null);
      setUser(null);
    }
  }), [token, user, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}


