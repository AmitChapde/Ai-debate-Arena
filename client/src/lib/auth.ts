import { api } from "./api";

export interface User {
  _id: string;
  name: string;
  email: string;
}

interface AuthResponse {
  user: User;
}

export function registerUser(data: {
  name: string;
  email: string;
  password: string;
}) {
  return api.post<AuthResponse>("/auth/register", data);
}

export function loginUser(data: {
  email: string;
  password: string;
}) {
  return api.post<AuthResponse>("/auth/login", data);
}

export function getCurrentUser() {
  return api.get<AuthResponse>("/auth/me");
}

export function logoutUser() {
  return api.post<unknown>("/auth/logout");
}
