import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
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
import { useGame } from "@/context/GameContext";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";

export default function JoinSessionScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { joinSession } = useGame();
  const { user } = useAuth();

  const [code, setCode] = useState("");
  const [playerName, setPlayerName] = useState(user?.name ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleJoin = async () => {
    setError("");
    if (code.trim().length < 4) {
      setError("Enter a valid session code.");
      return;
    }
    if (!playerName.trim()) {
      setError("Enter your player name.");
      return;
    }
    setLoading(true);
    try {
      const session = await joinSession(code.trim(), playerName.trim());
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.push(`/lobby/${session.id}`);
    } catch (e: any) {
      setError(e.message);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={[styles.header, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 16), borderBottomColor: colors.border }]}>
          <Pressable onPress={() => router.back()}>
            <Feather name="arrow-left" size={22} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Join Game</Text>
          <View style={{ width: 22 }} />
        </View>

        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.iconWrap, { backgroundColor: colors.primary + "22" }]}>
            <Feather name="log-in" size={36} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.foreground }]}>Enter Session Code</Text>
          <Text style={[styles.sub, { color: colors.mutedForeground }]}>
            Ask the game host for their 6-character session code
          </Text>

          <View style={[styles.codeWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TextInput
              style={[styles.codeInput, { color: colors.foreground }]}
              value={code}
              onChangeText={(t) => setCode(t.toUpperCase().slice(0, 8))}
              placeholder="e.g. ABC123"
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="characters"
              autoFocus
              maxLength={8}
            />
          </View>

          <View style={[styles.field, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="user" size={16} color={colors.mutedForeground} />
            <TextInput
              style={[styles.nameInput, { color: colors.foreground }]}
              value={playerName}
              onChangeText={setPlayerName}
              placeholder="Your player name"
              placeholderTextColor={colors.mutedForeground}
            />
          </View>

          {error ? (
            <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text>
          ) : null}

          <Pressable
            style={({ pressed }) => [
              styles.joinBtn,
              { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
            ]}
            onPress={handleJoin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.joinBtnText}>Join Game</Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1 },
  headerTitle: { fontSize: 17, fontWeight: "700", fontFamily: "Inter_700Bold" },
  scroll: { paddingHorizontal: 24, paddingTop: 32, alignItems: "center" },
  iconWrap: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center", marginBottom: 20 },
  title: { fontSize: 24, fontWeight: "700", fontFamily: "Inter_700Bold", textAlign: "center", marginBottom: 8 },
  sub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", marginBottom: 32, lineHeight: 20 },
  codeWrap: { borderWidth: 2, borderRadius: 16, width: "100%", marginBottom: 16, overflow: "hidden" },
  codeInput: { fontSize: 32, fontWeight: "800", fontFamily: "Inter_700Bold", textAlign: "center", padding: 20, letterSpacing: 8 },
  field: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, gap: 10, width: "100%", marginBottom: 20 },
  nameInput: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  error: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", marginBottom: 12 },
  joinBtn: { height: 54, borderRadius: 14, alignItems: "center", justifyContent: "center", width: "100%" },
  joinBtnText: { color: "#fff", fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
});
