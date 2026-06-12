import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login, loginAsGuest } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [guestName, setGuestName] = useState("");
  const [showGuest, setShowGuest] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(tabs)");
    } catch (e: any) {
      setError(e.message);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    if (!guestName.trim()) {
      setError("Enter your name to continue.");
      return;
    }
    setLoading(true);
    try {
      await loginAsGuest(guestName.trim());
      router.replace("/(tabs)");
    } catch {
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#0D0B1E", "#1A0F3C", "#0D0B1E"]}
      style={styles.gradient}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 40), paddingBottom: insets.bottom + 40 },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logo}>
            <View style={[styles.crownWrap, { backgroundColor: colors.primary + "33" }]}>
              <Feather name="award" size={44} color={colors.gold} />
            </View>
            <Text style={styles.appName}>LaughRoyale</Text>
            <Text style={[styles.tagline, { color: colors.secondary.toString() === "#1E1B38" ? "#9B99B8" : colors.mutedForeground }]}>
              Make them laugh. Win the crown.
            </Text>
          </View>

          <View style={styles.card}>
            {!showGuest ? (
              <>
                <Text style={[styles.cardTitle, { color: "#F8F7FF" }]}>Sign In</Text>

                <View style={styles.field}>
                  <Text style={[styles.label, { color: "#9B99B8" }]}>Email</Text>
                  <View style={[styles.inputWrap, { backgroundColor: "#2D2A4A", borderColor: "#3D3A6A" }]}>
                    <Feather name="mail" size={16} color="#9B99B8" />
                    <TextInput
                      style={[styles.input, { color: "#F8F7FF" }]}
                      value={email}
                      onChangeText={setEmail}
                      placeholder="you@example.com"
                      placeholderTextColor="#6B6880"
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                  </View>
                </View>

                <View style={styles.field}>
                  <Text style={[styles.label, { color: "#9B99B8" }]}>Password</Text>
                  <View style={[styles.inputWrap, { backgroundColor: "#2D2A4A", borderColor: "#3D3A6A" }]}>
                    <Feather name="lock" size={16} color="#9B99B8" />
                    <TextInput
                      style={[styles.input, { color: "#F8F7FF" }]}
                      value={password}
                      onChangeText={setPassword}
                      placeholder="••••••••"
                      placeholderTextColor="#6B6880"
                      secureTextEntry={!showPassword}
                    />
                    <Pressable onPress={() => setShowPassword(!showPassword)}>
                      <Feather name={showPassword ? "eye-off" : "eye"} size={16} color="#9B99B8" />
                    </Pressable>
                  </View>
                </View>

                {error ? (
                  <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text>
                ) : null}

                <Pressable
                  style={({ pressed }) => [
                    styles.primaryBtn,
                    { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
                  ]}
                  onPress={handleLogin}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.primaryBtnText}>Sign In</Text>
                  )}
                </Pressable>

                <Pressable
                  style={styles.linkBtn}
                  onPress={() => router.push("/(auth)/register")}
                >
                  <Text style={[styles.linkText, { color: "#9B99B8" }]}>
                    No account?{" "}
                    <Text style={{ color: colors.accent as string }}>Create one</Text>
                  </Text>
                </Pressable>

                <View style={styles.divider}>
                  <View style={[styles.divLine, { backgroundColor: "#2D2A4A" }]} />
                  <Text style={[styles.divText, { color: "#6B6880" }]}>or</Text>
                  <View style={[styles.divLine, { backgroundColor: "#2D2A4A" }]} />
                </View>

                <Pressable
                  style={({ pressed }) => [
                    styles.guestBtn,
                    { borderColor: "#3D3A6A", opacity: pressed ? 0.8 : 1 },
                  ]}
                  onPress={() => setShowGuest(true)}
                >
                  <Feather name="user" size={16} color="#9B99B8" />
                  <Text style={[styles.guestText, { color: "#9B99B8" }]}>
                    Continue as Guest
                  </Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text style={[styles.cardTitle, { color: "#F8F7FF" }]}>Quick Play</Text>
                <Text style={[styles.guestSub, { color: "#9B99B8" }]}>
                  No account needed — just enter your name
                </Text>

                <View style={styles.field}>
                  <Text style={[styles.label, { color: "#9B99B8" }]}>Your Name</Text>
                  <View style={[styles.inputWrap, { backgroundColor: "#2D2A4A", borderColor: "#3D3A6A" }]}>
                    <Feather name="user" size={16} color="#9B99B8" />
                    <TextInput
                      style={[styles.input, { color: "#F8F7FF" }]}
                      value={guestName}
                      onChangeText={setGuestName}
                      placeholder="Enter your name"
                      placeholderTextColor="#6B6880"
                      autoFocus
                    />
                  </View>
                </View>

                {error ? (
                  <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text>
                ) : null}

                <Pressable
                  style={({ pressed }) => [
                    styles.primaryBtn,
                    { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
                  ]}
                  onPress={handleGuest}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.primaryBtnText}>Let's Play</Text>
                  )}
                </Pressable>

                <Pressable
                  style={styles.linkBtn}
                  onPress={() => { setShowGuest(false); setError(""); }}
                >
                  <Text style={[styles.linkText, { color: colors.accent as string }]}>
                    Back to Sign In
                  </Text>
                </Pressable>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  scroll: { paddingHorizontal: 24 },
  logo: { alignItems: "center", marginBottom: 36 },
  crownWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  appName: {
    fontSize: 34,
    fontWeight: "800",
    color: "#F8F7FF",
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 14,
    marginTop: 6,
    fontFamily: "Inter_400Regular",
  },
  card: {
    backgroundColor: "#1A1635",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "#2D2A4A",
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    marginBottom: 20,
  },
  guestSub: {
    fontSize: 13,
    marginTop: -14,
    marginBottom: 20,
    fontFamily: "Inter_400Regular",
  },
  field: { marginBottom: 16 },
  label: {
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  error: {
    fontSize: 13,
    marginBottom: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  primaryBtn: {
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  linkBtn: { alignItems: "center", marginTop: 16 },
  linkText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 20,
  },
  divLine: { flex: 1, height: 1 },
  divText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  guestBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  guestText: { fontSize: 15, fontFamily: "Inter_500Medium" },
});
