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
import type { LoginPayload, RegisterPayloadProps } from "../types/api";
import { authReducer, initialAuthState } from "../reducers/userReducer";
import { authClient } from "../libs/auth-client";

type AuthContextActions = {
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayloadProps) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
};

const AuthStateContext = createContext<AuthState | null>(null);
const AuthActionsContext = createContext<AuthContextActions | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  // 1. Rehydrate Session (Check if user is already logged in)
  useEffect(() => {
    const checkSession = async () => {
      try {
        dispatch({ type: "LOGIN_START" });
        const { data: session } = await authClient.getSession();

        if (session?.user) {
          dispatch({
            type: "LOGIN_SUCCESS",
            payload: {
              id: session.user.id,
              name: session.user.name,
              email: session.user.email,
              role: (session.user as any).role, // Ensure your backend includes role in the session payload
            },
          });
        } else {
          dispatch({ type: "LOGOUT" });
        }
      } catch (error) {
        console.error("Auth hydration failed:", error);
        dispatch({ type: "LOGOUT" });
      }
    };

    checkSession();
  }, []);

  // 2. Login Logic
  const login = useCallback(async (payload: LoginPayload) => {
    dispatch({ type: "LOGIN_START" });

    const { data, error } = await authClient.signIn.email({
      email: payload.email,
      password: payload.password,
    });

    if (error) {
      dispatch({
        type: "LOGIN_ERROR",
        payload: error.message || "Login failed. Please check your credentials.",
      });
    } else if (data?.user) {
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
        },
      });
    }
  }, []);

  // 3. Register Logic (Mapped to Prisma Schema)
  const register = useCallback(async (payload: RegisterPayloadProps) => {
    dispatch({ type: "LOGIN_START" });

    const { data, error } = await authClient.signUp.email({
      email: payload.email,
      password: payload.password,
      name: payload.name,
      image: payload.image ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${payload.name}`,
      ...{
        phone: payload.phone,
        country: payload.country,
      }
    });

    if (error) {
      dispatch({
        type: "LOGIN_ERROR",
        payload: error.message || "Registration failed. Try again.",
      });
    } else if (data?.user) {
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
        },
      });
    }
  }, []);

  // 4. Logout Logic
  const logout = useCallback(async () => {
    try {
      await authClient.signOut();
      dispatch({ type: "LOGOUT" });
    } catch (error) {
      console.error("Logout failed:", error);
    }
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

// Hooks
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