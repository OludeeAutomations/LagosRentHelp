const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ApiErrorData {
  error: string;
  code?: string;
  details?: unknown;
}

export class ApiError extends Error {
  status: number;
  data: ApiErrorData;

  constructor(message: string, status: number, data: ApiErrorData) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

const handleResponse = async <T>(
  response: Response
): Promise<ApiResponse<T>> => {
  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data.error || "An error occurred",
      response.status,
      data
    );
  }

  return data;
};

const getAuthHeaders = (): HeadersInit => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const api = {
  get: <T>(endpoint: string): Promise<ApiResponse<T>> =>
    fetch(`${API_BASE_URL}${endpoint}`, {
      headers: getAuthHeaders(),
    }).then(handleResponse<T>),

  post: <T>(
    endpoint: string,
    data?: unknown,
    extra?: { headers?: Record<string, string> }
  ): Promise<ApiResponse<T>> => {
    const isFormData = data instanceof FormData;

    // Start with auth headers
    const headers: Record<string, string> = getAuthHeaders();

    if (isFormData) {
      // Remove any Content-Type so browser sets multipart boundary automatically
      delete headers["Content-Type"];
    } else {
      headers["Content-Type"] = "application/json";
    }

    return fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: { ...headers, ...(extra?.headers || {}) },
      body: isFormData
        ? (data as FormData)
        : data
        ? JSON.stringify(data)
        : undefined,
    }).then(handleResponse<T>);
  },

  put: <T>(
    endpoint: string,
    data?: unknown,
    config?: { headers: { "Content-Type": string } } | { headers?: undefined }
  ): Promise<ApiResponse<T>> =>
    fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    }).then(handleResponse<T>),

  patch: <T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> =>
    fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    }).then(handleResponse<T>),

  delete: <T>(endpoint: string): Promise<ApiResponse<T>> =>
    fetch(`${API_BASE_URL}${endpoint}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    }).then(handleResponse<T>),
};
