import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { setAccessTokenProvider, setUnauthorizedHandler } from '../services/apiClient.js';
import * as authService from '../services/authService.js';

const ACCESS_TOKEN_KEY = 'cvision.accessToken';
const REFRESH_TOKEN_KEY = 'cvision.refreshToken';

const AuthContext = createContext(null);

function readStoredSession() {
  return {
    accessToken: window.localStorage.getItem(ACCESS_TOKEN_KEY),
    refreshToken: window.localStorage.getItem(REFRESH_TOKEN_KEY),
  };
}

function persistSession({ accessToken, refreshToken }) {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

function clearStoredSession() {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => readStoredSession());
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState(session.accessToken ? 'loading' : 'anonymous');

  const clearSession = useCallback(() => {
    clearStoredSession();
    setAccessTokenProvider(() => null);
    setSession({ accessToken: null, refreshToken: null });
    setUser(null);
    setStatus('anonymous');
  }, []);

  useEffect(() => {
    setAccessTokenProvider(() => session.accessToken);
  }, [session.accessToken]);

  useEffect(() => {
    setUnauthorizedHandler(clearSession);
  }, [clearSession]);

  useEffect(() => {
    let ignore = false;

    async function bootstrap() {
      if (!session.accessToken) {
        setStatus('anonymous');
        return;
      }

      try {
        const currentUser = await authService.getMe();

        if (!ignore) {
          setUser(currentUser);
          setStatus('authenticated');
        }
      } catch {
        if (!ignore) {
          clearSession();
        }
      }
    }

    bootstrap();

    return () => {
      ignore = true;
    };
  }, [clearSession, session.accessToken]);

  const saveSession = useCallback((authPayload) => {
    const nextSession = {
      accessToken: authPayload.accessToken,
      refreshToken: authPayload.refreshToken,
    };

    persistSession(nextSession);
    setAccessTokenProvider(() => nextSession.accessToken);
    setSession(nextSession);
    setUser(authPayload.user);
    setStatus('authenticated');
  }, []);

  const signIn = useCallback(
    async (credentials) => {
      const authPayload = await authService.login(credentials);
      saveSession(authPayload);
      return authPayload;
    },
    [saveSession],
  );

  const signUp = useCallback(
    async (payload) => {
      const registration = await authService.register(payload);

      if (registration.verificationToken) {
        await authService.verifyEmail(registration.verificationToken);
        const authPayload = await authService.login({
          email: payload.email,
          password: payload.password,
        });
        saveSession(authPayload);
      }

      return registration;
    },
    [saveSession],
  );

  const signOut = useCallback(async () => {
    const token = session.refreshToken;
    clearSession();

    if (token) {
      await authService.logout(token).catch(() => {});
    }
  }, [clearSession, session.refreshToken]);

  const value = useMemo(
    () => ({
      user,
      status,
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      isAuthenticated: status === 'authenticated',
      signIn,
      signUp,
      signOut,
    }),
    [session.accessToken, session.refreshToken, signIn, signOut, signUp, status, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
