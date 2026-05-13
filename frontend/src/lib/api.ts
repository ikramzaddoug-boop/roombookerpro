// Mock Axios layer — calls structured but never hit a real backend.
import axios from "axios";
import { mockSalles, mockEquipment, mockReservations, mockUsers } from "./mockData";

export const api = axios.create({
  baseURL: "/api",
  timeout: 5000,
});

// Intercepts and resolves with mock data instead of real network calls.
api.interceptors.request.use((config) => {
  // attach mock JWT
  const token = typeof window !== "undefined" ? localStorage.getItem("salle_token") : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const wait = (ms = 250) => new Promise((r) => setTimeout(r, ms));

export const mockApi = {
  async getSalles() { await wait(); return mockSalles; },
  async getEquipment() { await wait(); return mockEquipment; },
  async getReservations() { await wait(); return mockReservations; },
  async getUsers() { await wait(); return mockUsers; },
};
