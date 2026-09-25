import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import {
  clearClientAuthState,
  isAdminAuthArea,
  isIntentionalLogout,
} from "@/features/auth/lib/logout-client";
import { getStoredNetwork } from "@/lib/client-storage";
import {
  parseApiError,
  type ApiError,
  type ProblemDetails,
} from "@/lib/api-error";
import { playSound } from "@/lib/sounds";

const http = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 30_000,
});

http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== "undefined") {
    config.headers.set("x-network", getStoredNetwork());
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ProblemDetails>) => {
    const apiError: ApiError = parseApiError(error);
    const suppressAuthSideEffects =
      isIntentionalLogout() && apiError.status === 401;

    if (!suppressAuthSideEffects) {
      playSound("error");
    }

    if (
      typeof window !== "undefined" &&
      apiError.status === 401 &&
      !window.location.pathname.startsWith("/login") &&
      !isAdminAuthArea() &&
      !isIntentionalLogout()
    ) {
      void clearClientAuthState({ reason: "unauthorized" });
    }

    return Promise.reject(apiError);
  },
);

export default http;
export type { ApiError };
