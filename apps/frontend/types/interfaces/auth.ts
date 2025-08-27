import { UserRole } from "@/types";

export interface User {
  id: string;
  names: string;
  surnames: string;
  email: string;
  phone: string;
  password: string;
  dateOfBirth: Date;
  isAuthenticated: boolean;
  token: string;

  role?: UserRole;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAdmin: () => boolean;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}
