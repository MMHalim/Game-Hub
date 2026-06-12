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

export default function RegisterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    setError("");
    if (!name.trim() || !email.trim() || !password || !confirm) {
      setError("Please fill in all fields.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(tabs)");
    } catch (e: any) {
      setError(e.message);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#0D0B1E", "#1A0F3C", "#0D0B1E"]} style={styles.gradient}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 20), paddingBottom: insets.bottom + 40 },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <Pressable style={styles.back} onPress={() => router.back()}>
            <Feather name="arrow-left" size={22} color="#9B99B8" />
          </Pressable>

          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={[styles.sub, { color: "#9B99B8" }]}>
              3-day free trial, then choose your plan
            </Text>
          </View>

          <View style={[styles.card, { backgroundColor: "#1A1635", borderColor: "#2D2A4A" }]}>
            {[
              { label: "Name", value: name, setter: setName, placeholder: "Your display name", icon: "user" as const },
              { label: "Email", value: email, setter: setEmail, placeholder: "you@example.com", icon: "mail" as const, keyboard: "email-address" as const, cap: "none" as const },
              { label: "Password", value: password, setter: setPassword, placeholder: "Min. 6 characters", icon: "lock" as const, secure: true },
              { label: "Confirm Password", value: confirm, setter: setConfirm, placeholder: "Repeat password", icon: "lock" as const, secure: true },
            ].map(({ label, value, setter, placeholder, icon, keyboard, cap, secure }) => (
              <View style={styles.field} key={label}>
                <Text style={[styles.label, { color: "#9B99B8" }]}>{label}</Text>
                <View style={[styles.inputWrap, { backgroundColor: "#2D2A4A", borderColor: "#3D3A6A" }]}>
                  <Feather name={icon} size={16} color="#9B99B8" />
                  <TextInput
                    style={[styles.input, { color: "#F8F7FF" }]}
                    value={value}
                    onChangeText={setter}
                    placeholder={placeholder}
                    placeholderTextColor="#6B6880"
                    keyboardType={keyboard}
                    autoCapitalize={cap ?? "words"}
                    secureTextEntry={secure}
                  />
                </View>
              </View>
            ))}

            {error ? (
              <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text>
            ) : null}

            <View style={[styles.trialBanner, { backgroundColor: colors.success + "22", borderColor: colors.success + "44" }]}>
              <Feather name="gift" size={14} color={colors.success} />
              <Text style={[styles.trialText, { color: colors.success }]}>
                Free 3-day trial included — no payment required now
              </Text>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.primaryBtn,
                { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
              ]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryBtnText}>Create Account</Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  scroll: { paddingHorizontal: 24 },
  back: { marginBottom: 20 },
  header: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: "800", color: "#F8F7FF", fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  sub: { fontSize: 14, marginTop: 6, fontFamily: "Inter_400Regular" },
  card: { borderRadius: 24, padding: 24, borderWidth: 1 },
  field: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: "600", fontFamily: "Inter_600SemiBold", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 },
  inputWrap: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, gap: 10 },
  input: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  error: { fontSize: 13, marginBottom: 12, fontFamily: "Inter_400Regular", textAlign: "center" },
  trialBanner: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 16 },
  trialText: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular" },
  primaryBtn: { height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
});
