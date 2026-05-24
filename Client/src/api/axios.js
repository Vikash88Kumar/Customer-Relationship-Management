import axios from "axios"

// Vite requires VITE_ prefix to expose environment variables to client-side bundles.
// Self-heal the base URL by auto-appending "/api/v1" if not already present.
let resolvedBase = 
  import.meta.env.VITE_BACKEND_URI || 
  import.meta.env.VITE_API_URL || 
  import.meta.env.BACKEND_URI || 
  "http://localhost:5000/api/v1";

if (resolvedBase && !resolvedBase.endsWith("/api/v1") && !resolvedBase.endsWith("/api/v1/")) {
  resolvedBase = resolvedBase.endsWith("/") ? `${resolvedBase}api/v1` : `${resolvedBase}/api/v1`;
}

const api = axios.create({
    baseURL: resolvedBase,
    withCredentials: true
});

// Request interceptor to automatically attach Bearer token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("crm_access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;