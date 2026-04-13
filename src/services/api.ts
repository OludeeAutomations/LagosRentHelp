import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";
export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || window.location.origin || "http://localhost:5000";

if (!import.meta.env.VITE_API_BASE_URL) {
  console.warn(
    "VITE_API_BASE_URL is not defined. Falling back to default local API base URL (http://localhost:5000)."
  );
}

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
});

const getAccessToken = () => {
  try {
    const persisted = JSON.parse(localStorage.getItem("auth-storage") || "{}");
    return persisted?.state?.accessToken || null;
  } catch {
    return null;
  }
};
const setAccessToken = (token: string) => {
  localStorage.setItem("accessToken", token);
  // Dispatch event so authStore can update its state and persistence
  window.dispatchEvent(
    new CustomEvent("auth-token-refresh", { detail: token })
  );
};

const removeTokens = () => {
  localStorage.removeItem("accessToken");
  window.dispatchEvent(new Event("auth-logout"));
};

let isRefreshing = false;
let refreshSubscribers: {
  resolve: (token: string) => void;
  reject: (err: any) => void;
}[] = [];

function subscribeTokenRefresh(
  resolveCb: (token: string) => void,
  rejectCb: (err: any) => void
) {
  refreshSubscribers.push({ resolve: resolveCb, reject: rejectCb });
}

function onTokenRefreshed(newToken: string) {
  refreshSubscribers.forEach(({ resolve }) => resolve(newToken));
  refreshSubscribers = [];
}

function onRefreshFailed(error: any) {
  refreshSubscribers.forEach(({ reject }) => reject(error));
  refreshSubscribers = [];
}

async function refreshAccessToken(): Promise<string> {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/auth/refresh`,
      {},
      { withCredentials: true }
    );

    const newToken = response.data?.accessToken;
    if (!newToken) throw new Error("No access token in refresh response");

    setAccessToken(newToken);
    return newToken;
  } catch (error) {
    removeTokens();
    throw error;
  }
}

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (config.data instanceof FormData) {
      if (config.headers) {
        if (typeof config.headers.set === "function") {
          config.headers.delete("Content-Type");
        } else {
          delete config.headers["Content-Type"];
        }
      }
    }

    const token = getAccessToken();
    if (token) {
      if (!config.headers) {
        config.headers = new axios.AxiosHeaders();
      }
      config.headers.set("Authorization", `Bearer ${token}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// utils/api.ts - Update the interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest: any = error.config || {};

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh(
            (token) => {
              if (!originalRequest.headers) originalRequest.headers = {};
              originalRequest.headers["Authorization"] = `Bearer ${token}`;
              resolve(api(originalRequest));
            },
            (err) => reject(err)
          );
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();
        onTokenRefreshed(newToken);

        if (!originalRequest.headers) originalRequest.headers = {};
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        onRefreshFailed(refreshError);
        removeTokens();

        // ✅ Show login modal using Zustand
        const modalStore = await import("../stores/modalStore").then((module) =>
          module.useLoginModalStore.getState()
        );
        modalStore.openLoginModal(
          "Your session has expired. Please login again to continue.",
          () => api(originalRequest) // Retry the original request after login
        );

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
export { api, setAccessToken, removeTokens };
