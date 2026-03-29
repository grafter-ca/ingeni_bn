import type { AuthState, AuthAction } from "../types";

// Open for extension (new action types) closed for modification
export const initialAuthState: AuthState = {
  user: null,
  isLoading: false,
  error: null,
};

export const authReducer = (
  state: AuthState,
  action: AuthAction
): AuthState => {
  switch (action.type) {
    case "LOGIN_START":
      return { ...state, isLoading: true, error: null };
    case "LOGIN_SUCCESS":
      return { ...state, isLoading: false, user: action.payload, error: null };
    case "LOGIN_ERROR":
      return { ...state, isLoading: false, error: action.payload };
    case "LOGOUT":
      return { ...initialAuthState };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    default:
      return state;
  }
};