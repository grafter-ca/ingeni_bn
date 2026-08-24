import React, { createContext, useReducer, useCallback, useMemo, useEffect, useContext } from "react";
import { authService } from "../services/auth.service";
import { authReducer, initialAuthState } from "../reducers/userReducer";
import type { LoginPayload, RegisterPayloadProps, UserRole } from "../types/api";

// --- Types for Actions ---
interface AuthActions {
  login: (payload: LoginPayload, token?: string) => Promise<void>;
  register: (payload: RegisterPayloadProps) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  vendor: {
    create: (name: string, slug: string) => Promise<any>;
    switch: (orgId: string) => Promise<void>;
  };
  admin: {
    listUsers: (query?: any) => Promise<any>;
    setRole: (userId: string, role: UserRole) => Promise<void>;
  };
}

const AuthStateContext = createContext(initialAuthState);
const AuthActionsContext = createContext<AuthActions | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);
  const { data: session, isPending } = authService.useSession();

  // Sync Session with Reducer
  useEffect(() => {
    if (isPending) return;
    if (session?.user) {
      dispatch({ 
        type: "LOGIN_SUCCESS", 
        payload: { ...session.user, role: (session.user.role as UserRole) || 'user' } 
      });
    } else {
      dispatch({ type: "LOGOUT" });
    }
  }, [session, isPending]);

  // --- Namespace: Core Auth ---
  const login = useCallback(async (payload: LoginPayload, token?: string) => {
    dispatch({ type: "LOGIN_START" });
    const { error } = await authService.signIn(payload, token);
    if (error) dispatch({ type: "LOGIN_ERROR", payload: error.message || "Login Failed" });
  }, []);

const register = useCallback(async (payload: RegisterPayloadProps) => {
    dispatch({ type: "LOGIN_START" });
    const response = await authService.signUp(payload);
    
    if (response?.error) {
      dispatch({ type: "LOGIN_ERROR", payload: response.error.message || "Registration Failed" });
      throw new Error(response.error.message || "Registration Failed");
    }
  }, []);

  const logout = useCallback(async () => {
    await authService.signOut();
  }, []);

  const updateProfile = useCallback(async (data: any) => {
    const { error } = await authService.updateUser(data);
    if (error) throw new Error(error.message);
  }, []);

  // --- Namespace: Vendor (Open for Extension) ---
  const vendorActions = useMemo(() => ({
    create: async (name: string, slug: string) => {
      const { data, error } = await authService.createOrganization(name, slug);
      if (error) throw new Error(error.message);
      return data;
    },
    switch: async (orgId: string) => {
      const { error } = await authService.setActiveOrg(orgId);
      if (error) throw new Error(error.message);
    }
  }), []);

  // --- Namespace: Admin (Open for Extension) ---
  const adminActions = useMemo(() => ({
    listUsers: async (query?: any) => {
      const { data, error } = await authService.adminListUsers(query);
      if (error) throw new Error(error.message);
      return data; // Returns { users: [], total: number }
    },
    setRole: async (userId: string, role: UserRole) => {
      const { error } = await authService.adminSetRole(userId, role);
      if (error) throw new Error(error.message);
    }
  }), []);

  // --- Final Composition (O/C Principle) ---
  const actions = useMemo(() => ({
    login,
    register,
    logout,
    updateProfile,
    vendor: vendorActions,
    admin: adminActions,
  }), [login, register, logout, updateProfile, vendorActions, adminActions]);

  return (
    <AuthStateContext.Provider value={{ ...state, isLoading: isPending || state.isLoading }}>
      <AuthActionsContext.Provider value={actions}>
        {children}
      </AuthActionsContext.Provider>
    </AuthStateContext.Provider>
  );
};

export const useAuthState = () => useContext(AuthStateContext);
export const useAuthActions = () => {
  const context = useContext(AuthActionsContext);
  if (!context) throw new Error("useAuthActions must be used within AuthProvider");
  return context;
};