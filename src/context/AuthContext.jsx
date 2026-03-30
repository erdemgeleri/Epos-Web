import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, clearToken, getToken, setToken } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  const refreshUser = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      return;
    }
    const me = await api.me();
    setUser(me);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (getToken()) {
          const me = await api.me();
          if (!cancelled) {
            setUser(me);
          }
        }
      } catch {
        clearToken();
        if (!cancelled) {
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setReady(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(
    async (email, password) => {
      const res = await api.login({ email, password });
      setToken(res.token);
      const me = await api.me();
      setUser(me);
      return me;
    },
    [],
  );

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      ready,
      isAuthenticated: !!user,
      login,
      logout,
      refreshUser,
    }),
    [user, ready, login, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
