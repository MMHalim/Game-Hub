import colors from "@/constants/colors";
import { useTheme } from "@/context/ThemeContext";

/**
 * Returns the design tokens for the current color scheme.
 * Theme preference (light / dark / system) is stored in ThemeContext
 * and persisted to AsyncStorage so the user's choice survives restarts.
 */
export function useColors() {
  const { resolved } = useTheme();
  const palette = resolved === "dark" ? colors.dark : colors.light;
  return { ...palette, radius: colors.radius };
}
