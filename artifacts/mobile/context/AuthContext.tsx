import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { loginApi } from "@/services/api";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
  role: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: AuthUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [storedToken, storedUser] = await Promise.all([
          AsyncStorage.getItem(TOKEN_KEY),
          AsyncStorage.getItem(USER_KEY),
        ]);
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const data = await loginApi(email.trim(), password);

      if (!data.success) {
        return { success: false, error: data.message || "Login failed." };
      }

      const authUser: AuthUser = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        avatar: data.user.avatar,
        role: data.user.crm_role_type === 1 ? "Admin" : "User",
      };

      await Promise.all([
        AsyncStorage.setItem(TOKEN_KEY, data.token),
        AsyncStorage.setItem(USER_KEY, JSON.stringify(authUser)),
      ]);

      setToken(data.token);
      setUser(authUser);
      return { success: true };
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { message?: string; error?: string }; status?: number };
        message?: string;
        code?: string;
      };
      let message = "Network error. Please check your connection.";
      if (axiosError?.response?.data?.message) {
        message = axiosError.response.data.message;
      } else if (axiosError?.response?.data?.error) {
        message = axiosError.response.data.error;
      } else if (axiosError?.code === "ECONNABORTED") {
        message = "Request timed out. Please try again.";
      } else if (axiosError?.message) {
        message = axiosError.message;
      }
      return { success: false, error: message };
    }
  }, []);

  const logout = useCallback(async () => {
    await Promise.all([
      AsyncStorage.removeItem(TOKEN_KEY),
      AsyncStorage.removeItem(USER_KEY),
    ]);
    setToken(null);
    setUser(null);
  }, []);

  if (!hydrated) return null;

  return (
    <AuthContext.Provider value={{ isLoggedIn: !!user, user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
