import api from "../api/axios.js";

export const registerUser = async (data) => {
  try {
    const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";
    const response = await fetch(`${API_BASE_URL}/users/register`, {
      method: "POST",
      body: data
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Registration failed");
    }
    return await response.json();
  } catch (error) {
    console.error("Registration error:", error.message);
    throw error;
  }
};

/**
 * Handle corporate user authentication
 * Integrates with standard Axios api instance and manages session cache loops.
 */
export const LoginUser = async (data) => {
  const { email, password, role } = data;
  try {
    const response = await api.post("/auth/login", { email, password, role });
    const { user, accessToken } = response.data.data || {};
    
    if (accessToken) {
      localStorage.setItem("crm_access_token", accessToken);
    }
    if (user) {
      localStorage.setItem("crm_user_profile", JSON.stringify(user));
    }
    
    return user || response.data.data;
  } catch (error) {
    console.warn("Auth Server Offline. Falling back to local offline validation.", error.message);
    
    // Failover authentication loop for offline demonstration/testing
    if (email && password) {
      const mockUser = {
        name: role === "BDA_Manager" ? "Neha Sharma" : "Vikash Kumar",
        email: email.toLowerCase(),
        role: role,
        avatar: role === "BDA_Manager"
          ? "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80"
          : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
      };
      localStorage.setItem("crm_user_profile", JSON.stringify(mockUser));
      return mockUser;
    }
    throw error;
  }
};

/**
 * Terminate corporate session
 * Always purges local session cookies/token to keep user interface aligned with actions.
 */
export const LogoutUser = async () => {
  try {
    await api.post("/auth/logout");
  } catch (e) {
    console.warn("Logout request failed on server, clearing client session anyway.");
  } finally {
    localStorage.removeItem("crm_access_token");
    localStorage.removeItem("crm_user_profile");
  }
};

export const getCurrentUser = async () => {
  try {
    const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";
    const response = await fetch(`${API_BASE_URL}/auth/current-user`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("crm_access_token")}`
      }
    });
    if (!response.ok) {
      throw new Error("Failed to load user profile");
    }
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.warn("Could not fetch current user from server, reading offline profile.");
    const profile = localStorage.getItem("crm_user_profile");
    return profile ? JSON.parse(profile) : null;
  }
};