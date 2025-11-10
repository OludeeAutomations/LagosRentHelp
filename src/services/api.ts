import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL is not defined in environment variables");
}

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false, // ❌ Turn off cookies
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
const setAccessToken = (token: string) =>
  localStorage.setItem("accessToken", token);
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
  (config: AxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

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
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export { api, setAccessToken, removeTokens };
