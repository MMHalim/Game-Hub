import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as SystemUI from "expo-system-ui";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider } from "@/context/AuthContext";
import { GameProvider } from "@/context/GameContext";
import { SubscriptionProvider } from "@/context/SubscriptionContext";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import colors from "@/constants/colors";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function ThemeSync() {
  const { resolved } = useTheme();
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(
      resolved === "dark" ? colors.dark.background : colors.light.background
    );
  }, [resolved]);
  return null;
}

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="create-session"
        options={{ presentation: "card", headerShown: false }}
      />
      <Stack.Screen
        name="join-session"
        options={{ presentation: "card", headerShown: false }}
      />
      <Stack.Screen name="lobby/[id]" options={{ headerShown: false }} />
      <Stack.Screen
        name="game/[id]"
        options={{ headerShown: false, gestureEnabled: false }}
      />
      <Stack.Screen
        name="results/[id]"
        options={{ headerShown: false, gestureEnabled: false }}
      />
      <Stack.Screen
        name="subscription"
        options={{ presentation: "modal", headerShown: false }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <ErrorBoundary>
          <QueryClientProvider client={queryClient}>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <KeyboardProvider>
                <AuthProvider>
                  <GameProvider>
                    <SubscriptionProvider>
                      <ThemeSync />
                      <RootLayoutNav />
                    </SubscriptionProvider>
                  </GameProvider>
                </AuthProvider>
              </KeyboardProvider>
            </GestureHandlerRootView>
          </QueryClientProvider>
        </ErrorBoundary>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
