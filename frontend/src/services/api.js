import axios from "axios";

const API_BASE_URL = "/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add authorization header to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (username, password) => {
    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);
    return api.post("/auth/login", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  getCurrentUser: () => api.get("/auth/me"),
  completeOnboarding: (data) => api.post("/auth/onboarding", data),
};

// Food APIs
export const foodAPI = {
  logFood: (data) => api.post("/log-food", data),
  getSummary: (date) => api.get(date ? `/summary?date=${date}` : "/summary"),
  getEntries: (date) => api.get(date ? `/entries?date=${date}` : "/entries"),
  clearEntries: () => api.delete("/entries"),
};

// Profile APIs
export const profileAPI = {
  updateProfile: (data) => api.put("/profile", data),
};

// Analytics APIs
export const analyticsAPI = {
  getWeeklyProgress: (date) => {
    let url = "/analytics/weekly-progress";
    if (date) url += `?date=${date}`;
    return api.get(url);
  },
};

export default api;
