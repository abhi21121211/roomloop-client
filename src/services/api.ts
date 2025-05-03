import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add interceptor to add authorization token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (userData: { username: string; email: string; password: string }) =>
    api.post("/auth/register", userData),

  login: (credentials: { login: string; password: string }) =>
    api.post("/auth/login", credentials),

  getCurrentUser: () => api.get("/auth/me"),
};

// Rooms API calls
export const roomsAPI = {
  createRoom: (roomData: any) => api.post("/rooms", roomData),

  getPublicRooms: () => api.get("/rooms/public"),

  getAllRooms: () => api.get("/rooms/all"),

  getUserRooms: () => api.get("/rooms/user"),

  getRoomById: (roomId: string) => api.get(`/rooms/${roomId}`),

  joinRoom: (roomId: string) => api.post(`/rooms/${roomId}/join`),

  inviteUsers: (roomId: string, usernames: string[]) =>
    api.post(`/rooms/${roomId}/invite`, { usernames }),

  // Messages in a room
  getRoomMessages: (roomId: string) => api.get(`/rooms/${roomId}/messages`),

  sendMessage: (roomId: string, content: string) =>
    api.post(`/rooms/${roomId}/messages`, { content }),

  // Reactions in a room
  getRoomReactions: (roomId: string) => api.get(`/rooms/${roomId}/reactions`),

  sendReaction: (roomId: string, emoji: string) =>
    api.post(`/rooms/${roomId}/reactions`, { emoji }),
};

export default api;
