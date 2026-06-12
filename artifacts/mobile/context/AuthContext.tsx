import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: number;
  provider?: "email" | "facebook" | "instagram" | "guest";
  avatarUrl?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginWithSocial: (
    provider: "facebook" | "instagram",
    socialId: string,
    name: string,
    email?: string,
    avatarUrl?: string
  ) => Promise<void>;
  loginAsGuest: (name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

const USERS_KEY = "lr_users";
const CURRENT_USER_KEY = "lr_current_user";
const SOCIAL_MAP_KEY = "lr_social_map";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(CURRENT_USER_KEY).then((raw) => {
      if (raw) setUser(JSON.parse(raw));
      setIsLoading(false);
    });
  }, []);

  const saveUser = async (u: User) => {
    setUser(u);
    await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(u));
  };

  const login = useCallback(async (email: string, password: string) => {
    const raw = await AsyncStorage.getItem(USERS_KEY);
    const users: Record<string, { user: User; password: string }> = raw
      ? JSON.parse(raw)
      : {};
    const entry = users[email.toLowerCase()];
    if (!entry) throw new Error("No account found with this email.");
    if (entry.password !== password) throw new Error("Incorrect password.");
    await saveUser(entry.user);
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const raw = await AsyncStorage.getItem(USERS_KEY);
      const users: Record<string, { user: User; password: string }> = raw
        ? JSON.parse(raw)
        : {};
      const key = email.toLowerCase();
      if (users[key])
        throw new Error("An account with this email already exists.");
      const newUser: User = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 6),
        name,
        email: email.toLowerCase(),
        createdAt: Date.now(),
        provider: "email",
      };
      users[key] = { user: newUser, password };
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
      await saveUser(newUser);
    },
    []
  );

  const loginWithSocial = useCallback(
    async (
      provider: "facebook" | "instagram",
      socialId: string,
      name: string,
      email?: string,
      avatarUrl?: string
    ) => {
      const mapKey = `${provider}_${socialId}`;
      const rawMap = await AsyncStorage.getItem(SOCIAL_MAP_KEY);
      const socialMap: Record<string, string> = rawMap
        ? JSON.parse(rawMap)
        : {};

      if (socialMap[mapKey]) {
        const rawUsers = await AsyncStorage.getItem(USERS_KEY);
        const users: Record<string, { user: User; password: string }> =
          rawUsers ? JSON.parse(rawUsers) : {};
        const existingEntry = Object.values(users).find(
          (e) => e.user.id === socialMap[mapKey]
        );
        if (existingEntry) {
          await saveUser(existingEntry.user);
          return;
        }
      }

      const newUser: User = {
        id: `${provider}_${socialId}`,
        name,
        email: email ?? "",
        createdAt: Date.now(),
        provider,
        avatarUrl,
      };

      const rawUsers = await AsyncStorage.getItem(USERS_KEY);
      const users: Record<string, { user: User; password: string }> = rawUsers
        ? JSON.parse(rawUsers)
        : {};
      users[newUser.id] = { user: newUser, password: "" };
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));

      socialMap[mapKey] = newUser.id;
      await AsyncStorage.setItem(SOCIAL_MAP_KEY, JSON.stringify(socialMap));

      await saveUser(newUser);
    },
    []
  );

  const loginAsGuest = useCallback(async (name: string) => {
    const guestUser: User = {
      id: "guest_" + Date.now().toString(),
      name,
      email: "",
      createdAt: Date.now(),
      provider: "guest",
    };
    await saveUser(guestUser);
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem(CURRENT_USER_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, register, loginWithSocial, loginAsGuest, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
