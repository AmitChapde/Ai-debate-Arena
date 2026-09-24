const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,

    credentials: "include",

    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const result = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Something went wrong");
  }

  return result.data as T;
}

export const api = {
  get<T>(endpoint: string) {
    return apiRequest<T>(endpoint);
  },

  post<T>(endpoint: string, body?: unknown) {
    return apiRequest<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  patch<T>(endpoint: string, body?: unknown) {
    return apiRequest<T>(endpoint, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  delete<T>(endpoint: string) {
    return apiRequest<T>(endpoint, {
      method: "DELETE",
    });
  },
};
