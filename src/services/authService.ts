import { apiClient } from "./api";
import type {
  ApiUser,
  LoginPayload,
  RegisterPayload,
  AuthTokens,
} from "../types/api";

// Single Responsibility: only handles auth API calls
export const authService = {
  login: (payload: LoginPayload): Promise<AuthTokens> =>
    apiClient<AuthTokens>("/auth/login", { method: "POST", body: payload }),

  register: (payload: RegisterPayload): Promise<ApiUser> =>
    apiClient<ApiUser>("/users", { method: "POST", body: payload }),

  getProfile: (token: string): Promise<ApiUser> =>
    apiClient<ApiUser>("/auth/profile", { token }),

  refreshToken: (refreshToken: string): Promise<AuthTokens> =>
    apiClient<AuthTokens>("/auth/refresh-token", {
      method: "POST",
      body: { refreshToken },
    }),
};