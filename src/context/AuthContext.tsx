import React, { createContext, useReducer, useCallback, useMemo, useEffect, useContext } from "react";
import { authService } from "../services/auth.service";
import { authReducer, initialAuthState } from "../reducers/userReducer";
import type { LoginPayload, RegisterPayloadProps } from "../types/api";

// --- Context Definitions ---
const AuthStateContext = createContext(initialAuthState);
const AuthActionsContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  // 1. Initial Session Check (Rehydration)
  useEffect(() => {
    let isMounted = true;
    
    const initSession = async () => {
      dispatch({ type: "LOGIN_START" }); // Set loading: true
      try {
        const { data, error } = await authService.getSession();
        
        if (isMounted) {
          if (data?.user && !error) {
            dispatch({ type: "LOGIN_SUCCESS", payload: data.user as any });
          } else {
            dispatch({ type: "LOGOUT" });
          }
        }
      } catch (err) {
        if (isMounted) dispatch({ type: "LOGOUT" });
      }
    };

    initSession();
    return () => { isMounted = false; };
  }, []);

  // 2. Optimized Actions
  const login = useCallback(async (payload: LoginPayload, token?: string) => {
    dispatch({ type: "LOGIN_START" });
    const { data, error } = await authService.signIn(payload, token);
    
    if (error) {
      dispatch({ type: "LOGIN_ERROR", payload: error.message || "Login failed" });
    } else if (data?.user) {
      dispatch({ type: "LOGIN_SUCCESS", payload: data.user as any });
    }
  }, []);

  const register = useCallback(async (payload: RegisterPayloadProps) => {
    dispatch({ type: "LOGIN_START" });
    const { data, error } = await authService.signUp(payload);
    
    if (error) {
      dispatch({ type: "LOGIN_ERROR", payload: error.message || "Registration failed" });
    } else if (data?.user) {
      dispatch({ type: "LOGIN_SUCCESS", payload: data.user as any });
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.signOut();
      dispatch({ type: "LOGOUT" });
    } catch (error) {
      console.error("Logout failed", error);
    }
  }, []);

  const actions = useMemo(() => ({ login, register, logout }), [login, register, logout]);

  return (
    <AuthStateContext.Provider value={state}>
      <AuthActionsContext.Provider value={actions}>
        {children}
      </AuthActionsContext.Provider>
    </AuthStateContext.Provider>
  );
};

// --- Custom Hooks for easy usage ---
export const useAuthState = () => useContext(AuthStateContext);
export const useAuthActions = () => useContext(AuthActionsContext);