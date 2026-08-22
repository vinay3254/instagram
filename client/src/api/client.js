import axios from "axios";

const STORAGE_KEY = "curated-auth";
const LEGACY_STORAGE_KEY = "instagram-auth";
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

let refreshPromise = null;

export function getStoredSession() {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY) || window.localStorage.getItem(LEGACY_STORAGE_KEY);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    return null;
  }
}

export function setStoredSession(session) {
  if (!session) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

api.interceptors.request.use((config) => {
  const session = getStoredSession();

  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};

    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/register") ||
      originalRequest.url?.includes("/auth/refresh")
    ) {
      throw error;
    }

    const session = getStoredSession();

    if (!session?.refreshToken) {
      setStoredSession(null);
      window.dispatchEvent(new Event("auth:logout"));
      throw error;
    }

    originalRequest._retry = true;

    if (!refreshPromise) {
      refreshPromise = axios
        .post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken: session.refreshToken,
        })
        .then(({ data }) => {
          const nextSession = {
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            user: data.user,
          };

          setStoredSession(nextSession);
          window.dispatchEvent(new CustomEvent("auth:session", { detail: nextSession }));

          return nextSession.accessToken;
        })
        .catch((refreshError) => {
          setStoredSession(null);
          window.dispatchEvent(new Event("auth:logout"));
          throw refreshError;
        })
        .finally(() => {
          refreshPromise = null;
        });
    }

    const accessToken = await refreshPromise;
    originalRequest.headers = originalRequest.headers || {};
    originalRequest.headers.Authorization = `Bearer ${accessToken}`;

    return api(originalRequest);
  },
);

export default api;
