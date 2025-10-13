/**
 * User type for Google OAuth authentication
 */
export interface User {
  id: string;
  email: string;
  name: string;
  picture: string;
}

/**
 * Authentication context type
 */
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}