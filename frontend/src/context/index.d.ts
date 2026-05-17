import type { ReactNode } from 'react';
import type { AuthUser } from '../types/user';

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpPayload {
  name: string;
  email: string;
  password: string;
  acceptedTerms: boolean;
  acceptedPrivacy: boolean;
  acceptedAiProcessing: boolean;
}

export interface AuthContextValue {
  user: AuthUser | null;
  status: 'loading' | 'anonymous' | 'authenticated';
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  signIn: (credentials: SignInCredentials) => Promise<unknown>;
  signUp: (payload: SignUpPayload) => Promise<unknown>;
  signOut: () => Promise<void>;
}

export function AuthProvider({ children }: { children: ReactNode }): JSX.Element;
export function useAuth(): AuthContextValue;
