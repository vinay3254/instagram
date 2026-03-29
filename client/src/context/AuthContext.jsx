import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api, { getStoredSession, setStoredSession } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => getStoredSession());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      const stored = getStoredSession();

      if (!stored?.accessToken) {
        if (mounted) setLoading(false);
        return;
      }

      try {
        const { data } = await api.get("/auth/me");
        const nextSession = { ...stored, user: data.user };
        setStoredSession(nextSession);
        if (mounted) setSession(nextSession);
      } catch (error) {
        setStoredSession(null);
        if (mounted) setSession(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    bootstrap();

    const handleSessionUpdate = (event) => setSession(event.detail);
    const handleLogout = () => setSession(null);

    window.addEventListener("auth:session", handleSessionUpdate);
    window.addEventListener("auth:logout", handleLogout);

    return () => {
      mounted = false;
      window.removeEventListener("auth:session", handleSessionUpdate);
      window.removeEventListener("auth:logout", handleLogout);
    };
  }, []);

  const login = async (payload) => {
    const { data } = await api.post("/auth/login", payload);
    const nextSession = {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user: data.user,
    };

    setStoredSession(nextSession);
    setSession(nextSession);

    return data.user;
  };

  const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    const nextSession = {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user: data.user,
    };

    setStoredSession(nextSession);
    setSession(nextSession);

    return data.user;
  };

  const logout = async () => {
    const refreshToken = session?.refreshToken;

    try {
      if (refreshToken) {
        await api.post("/auth/logout", { refreshToken });
      }
    } catch (error) {
      void error;
    } finally {
      setStoredSession(null);
      setSession(null);
    }
  };

  const refreshProfile = async () => {
    const { data } = await api.get("/auth/me");
    const nextSession = { ...getStoredSession(), user: data.user };
    setStoredSession(nextSession);
    setSession(nextSession);
    return data.user;
  };

  const value = useMemo(
    () => ({
      user: session?.user || null,
      accessToken: session?.accessToken || null,
      refreshToken: session?.refreshToken || null,
      loading,
      login,
      register,
      logout,
      refreshProfile,
      isAuthenticated: Boolean(session?.accessToken),
    }),
    [loading, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
