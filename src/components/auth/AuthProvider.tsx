import React, { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { GoogleKeepApiService } from '../../services';
import type { User, AuthContextType } from '../../types';
import { AuthContext } from '../../contexts/AuthContext';

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Authentication Provider Component
 * Manages Google OAuth authentication state and provides auth context
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Google Keep API service
  const apiService = new GoogleKeepApiService({
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
    discoveryDoc: 'https://keep.googleapis.com/$discovery/rest?version=v1',
    scope: 'https://www.googleapis.com/auth/keep'
  });

  useEffect(() => {
    initializeAuth();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      await apiService.initialize();
      
      // Check if user is already authenticated
      if (apiService.isAuthenticated()) {
        const currentUser = apiService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setIsAuthenticated(true);
        }
      }
    } catch (error) {
      console.error('Failed to initialize authentication:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const authenticatedUser = await apiService.authenticate();
      setUser(authenticatedUser);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await apiService.signOut();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    login,
    logout
  };

  if (isLoading) {
    return (
      <div className="auth-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Initializing...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

