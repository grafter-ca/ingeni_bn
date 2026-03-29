import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import type { AuthState } from "../types";
import type { LoginPayload, RegisterPayload } from "../types/api";
import { authReducer, initialAuthState } from "../reducers/userReducer";
import { authService } from "../services/authService";

type AuthContextActions = {
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  clearError: () => void;
};

const AuthStateContext = createContext<AuthState | null>(null);
const AuthActionsContext = createContext<AuthContextActions | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  // useEffect — rehydrate token + user from localStorage
  useEffect(() => {
    const token = localStorage.getItem("ingeni_token");
    if (token) {
      authService
        .getProfile(token)
        .then((apiUser) => {
          dispatch({
            type: "LOGIN_SUCCESS",
            payload: {
              id: String(apiUser.id),
              name: apiUser.name,
              email: apiUser.email,
            },
          });
        })
        .catch(() => {
          localStorage.removeItem("ingeni_token");
        });
    }
  }, []);

  // useCallback — login with real API
  const login = useCallback(async (payload: LoginPayload) => {
    dispatch({ type: "LOGIN_START" });
    try {
      const tokens = await authService.login(payload);
      localStorage.setItem("ingeni_token", tokens.access_token);

      const apiUser = await authService.getProfile(tokens.access_token);
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: {
          id: String(apiUser.id),
          name: apiUser.name,
          email: apiUser.email,
        },
      });
    } catch (err) {
      dispatch({
        type: "LOGIN_ERROR",
        payload: err instanceof Error ? err.message : "Login failed",
      });
    }
  }, []);

  // useCallback — register with real API
  const register = useCallback(async (payload: RegisterPayload) => {
    dispatch({ type: "LOGIN_START" });
    try {
      await authService.register({
        ...payload,
        avatar: payload.avatar ?? "https://picsum.photos/800",
      });
      // Auto-login after register
      const tokens = await authService.login({
        email: payload.email,
        password: payload.password,
      });
      localStorage.setItem("ingeni_token", tokens.access_token);
      const apiUser = await authService.getProfile(tokens.access_token);
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: {
          id: String(apiUser.id),
          name: apiUser.name,
          email: apiUser.email,
        },
      });
    } catch (err) {
      dispatch({
        type: "LOGIN_ERROR",
        payload: err instanceof Error ? err.message : "Registration failed",
      });
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("ingeni_token");
    dispatch({ type: "LOGOUT" });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" });
  }, []);

  const actions = useMemo(
    () => ({ login, register, logout, clearError }),
    [login, register, logout, clearError]
  );

  return (
    <AuthStateContext.Provider value={state}>
      <AuthActionsContext.Provider value={actions}>
        {children}
      </AuthActionsContext.Provider>
    </AuthStateContext.Provider>
  );
};

export const useAuthState = () => {
  const ctx = useContext(AuthStateContext);
  if (!ctx) throw new Error("useAuthState must be used within AuthProvider");
  return ctx;
};

export const useAuthActions = () => {
  const ctx = useContext(AuthActionsContext);
  if (!ctx) throw new Error("useAuthActions must be used within AuthProvider");
  return ctx;
};

export const useAuth = () => ({ ...useAuthState(), ...useAuthActions() });