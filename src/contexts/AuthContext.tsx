import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { AuthState, User, LoginFormData, RegisterFormData } from "../types";
import { authAPI } from "../services/api";

interface AuthContextType extends AuthState {
  login: (formData: LoginFormData) => Promise<void>;
  register: (formData: RegisterFormData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  updateProfile: (profileData: {
    username: string;
    email: string;
    bio?: string;
  }) => Promise<void>;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: true,
  error: null,
  token: localStorage.getItem("token"),
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<AuthState>(initialState);

  // Check if user is already logged in
  useEffect(() => {
    const loadUser = async () => {
      try {
        if (!state.token) {
          setState((prev) => ({ ...initialState, loading: false }));
          return;
        }

        const response = await authAPI.getCurrentUser();
        const userData = response.data.user;

        setState((prev) => ({
          ...prev,
          isAuthenticated: true,
          user: userData,
          loading: false,
        }));
      } catch (error) {
        localStorage.removeItem("token");
        setState((prev) => ({
          ...initialState,
          loading: false,
          token: null,
        }));
      }
    };

    loadUser();
    // Only run this effect when the token changes
  }, []);

  // Login function
  const login = async (formData: LoginFormData) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const response = await authAPI.login(formData);
      const { token, user } = response.data;

      // Save token to local storage
      localStorage.setItem("token", token);

      setState((prev) => ({
        ...prev,
        isAuthenticated: true,
        loading: false,
        user,
        token,
        error: null,
      }));
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error.response?.data?.message || "Login failed",
      }));
      throw error;
    }
  };

  // Register function
  const register = async (formData: RegisterFormData) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const userData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      };

      const response = await authAPI.register(userData);
      const { token, user } = response.data;

      // Save token to local storage
      localStorage.setItem("token", token);

      setState((prev) => ({
        ...prev,
        isAuthenticated: true,
        loading: false,
        user,
        token,
        error: null,
      }));
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error.response?.data?.message || "Registration failed",
      }));
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    setState((prev) => ({
      ...initialState,
      loading: false,
      token: null,
    }));
  };

  // Clear error
  const clearError = () => {
    setState((prev) => ({ ...prev, error: null }));
  };

  // Update profile function
  const updateProfile = async (profileData: {
    username: string;
    email: string;
    bio?: string;
  }) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const response = await authAPI.updateProfile(profileData);
      const updatedUser = response.data.user;

      setState((prev) => ({
        ...prev,
        user: updatedUser,
        loading: false,
        error: null,
      }));
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error.response?.data?.message || "Failed to update profile",
      }));
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        clearError,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
