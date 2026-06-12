import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useColorScheme } from "react-native";

export type ThemePreference = "system" | "light" | "dark";
export type ResolvedScheme = "light" | "dark";

interface ThemeState {
  preference: ThemePreference;
  resolved: ResolvedScheme;
  setPreference: (pref: ThemePreference) => Promise<void>;
}

const THEME_KEY = "lr_theme_preference";

const ThemeContext = createContext<ThemeState>({
  preference: "dark",
  resolved: "dark",
  setPreference: async () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>("dark");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((val) => {
      if (val === "light" || val === "dark" || val === "system") {
        setPreferenceState(val);
      }
      setReady(true);
    });
  }, []);

  const setPreference = useCallback(async (pref: ThemePreference) => {
    setPreferenceState(pref);
    await AsyncStorage.setItem(THEME_KEY, pref);
  }, []);

  const resolved: ResolvedScheme =
    preference === "system"
      ? systemScheme === "light"
        ? "light"
        : "dark"
      : preference;

  return (
    <ThemeContext.Provider value={{ preference, resolved, setPreference }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
