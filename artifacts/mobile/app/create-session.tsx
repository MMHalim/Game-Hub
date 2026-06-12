import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
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
import { useGame } from "@/context/GameContext";
import { CELEBRITIES } from "@/data/celebrities";
import { useColors } from "@/hooks/useColors";

interface PlayerSetup {
  name: string;
  celebrityId: string;
  showPicker: boolean;
}

export default function CreateSessionScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { createSession } = useGame();

  const [players, setPlayers] = useState<PlayerSetup[]>([
    { name: user?.name ?? "", celebrityId: CELEBRITIES[0].id, showPicker: false },
    { name: "", celebrityId: CELEBRITIES[1].id, showPicker: false },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addPlayer = () => {
    if (players.length >= 8) return;
    const nextCeleb = CELEBRITIES[players.length % CELEBRITIES.length];
    setPlayers((prev) => [...prev, { name: "", celebrityId: nextCeleb.id, showPicker: false }]);
  };

  const removePlayer = (idx: number) => {
    if (players.length <= 2) return;
    setPlayers((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateName = (idx: number, name: string) => {
    setPlayers((prev) => prev.map((p, i) => (i === idx ? { ...p, name } : p)));
  };

  const togglePicker = (idx: number) => {
    setPlayers((prev) =>
      prev.map((p, i) => ({ ...p, showPicker: i === idx ? !p.showPicker : false }))
    );
  };

  const selectCelebrity = (idx: number, celebId: string) => {
    setPlayers((prev) =>
      prev.map((p, i) =>
        i === idx ? { ...p, celebrityId: celebId, showPicker: false } : p
      )
    );
  };

  const handleCreate = async () => {
    setError("");
    const filled = players.filter((p) => p.name.trim());
    if (filled.length < 2) {
      setError("Add at least 2 players with names.");
      return;
    }
    setLoading(true);
    try {
      const session = await createSession(
        user?.name ?? "Host",
        filled.map((p) => ({ name: p.name.trim(), celebrityId: p.celebrityId }))
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.push(`/lobby/${session.id}`);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={[styles.header, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 16), borderBottomColor: colors.border }]}>
          <Pressable onPress={() => router.back()}>
            <Feather name="arrow-left" size={22} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Create Game</Text>
          <View style={{ width: 22 }} />
        </View>

        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
            PLAYERS ({players.length}/8)
          </Text>

          {players.map((player, idx) => {
            const selectedCeleb = CELEBRITIES.find((c) => c.id === player.celebrityId)!;
            return (
              <View key={idx} style={[styles.playerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.playerRow}>
                  <View style={[styles.playerNum, { backgroundColor: colors.primary }]}>
                    <Text style={styles.playerNumText}>{idx + 1}</Text>
                  </View>
                  <TextInput
                    style={[styles.nameInput, { color: colors.foreground, borderColor: colors.border }]}
                    value={player.name}
                    onChangeText={(t) => updateName(idx, t)}
                    placeholder={`Player ${idx + 1} name`}
                    placeholderTextColor={colors.mutedForeground}
                  />
                  {players.length > 2 && (
                    <Pressable onPress={() => removePlayer(idx)}>
                      <Feather name="x" size={18} color={colors.mutedForeground} />
                    </Pressable>
                  )}
                </View>

                <Pressable
                  style={[styles.celebPicker, { backgroundColor: colors.muted, borderColor: colors.border }]}
                  onPress={() => togglePicker(idx)}
                >
                  <Text style={styles.celebEmoji}>{selectedCeleb.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.celebName, { color: colors.foreground }]}>
                      {selectedCeleb.name}
                    </Text>
                    <Text style={[styles.celebRole, { color: colors.mutedForeground }]}>
                      {selectedCeleb.role}
                    </Text>
                  </View>
                  <Feather
                    name={player.showPicker ? "chevron-up" : "chevron-down"}
                    size={16}
                    color={colors.mutedForeground}
                  />
                </Pressable>

                {player.showPicker && (
                  <View style={[styles.pickerDropdown, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.pickerSection, { color: colors.mutedForeground }]}>
                      EGYPTIAN
                    </Text>
                    {CELEBRITIES.filter((c) => c.nationality === "egyptian").map((celeb) => (
                      <Pressable
                        key={celeb.id}
                        style={({ pressed }) => [
                          styles.pickerItem,
                          { backgroundColor: celeb.id === player.celebrityId ? colors.primary + "22" : pressed ? colors.muted : "transparent" },
                        ]}
                        onPress={() => selectCelebrity(idx, celeb.id)}
                      >
                        <Text style={styles.pickerEmoji}>{celeb.emoji}</Text>
                        <Text style={[styles.pickerName, { color: colors.foreground }]}>
                          {celeb.name}
                        </Text>
                        {celeb.id === player.celebrityId && (
                          <Feather name="check" size={14} color={colors.primary} />
                        )}
                      </Pressable>
                    ))}
                    <Text style={[styles.pickerSection, { color: colors.mutedForeground }]}>
                      INTERNATIONAL
                    </Text>
                    {CELEBRITIES.filter((c) => c.nationality === "international").map((celeb) => (
                      <Pressable
                        key={celeb.id}
                        style={({ pressed }) => [
                          styles.pickerItem,
                          { backgroundColor: celeb.id === player.celebrityId ? colors.primary + "22" : pressed ? colors.muted : "transparent" },
                        ]}
                        onPress={() => selectCelebrity(idx, celeb.id)}
                      >
                        <Text style={styles.pickerEmoji}>{celeb.emoji}</Text>
                        <Text style={[styles.pickerName, { color: colors.foreground }]}>
                          {celeb.name}
                        </Text>
                        {celeb.id === player.celebrityId && (
                          <Feather name="check" size={14} color={colors.primary} />
                        )}
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            );
          })}

          {players.length < 8 && (
            <Pressable
              style={[styles.addPlayerBtn, { borderColor: colors.primary + "66" }]}
              onPress={addPlayer}
            >
              <Feather name="user-plus" size={18} color={colors.primary} />
              <Text style={[styles.addPlayerText, { color: colors.primary }]}>Add Player</Text>
            </Pressable>
          )}

          {error ? (
            <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text>
          ) : null}

          <Pressable
            style={({ pressed }) => [
              styles.createBtn,
              { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
            ]}
            onPress={handleCreate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.createBtnText}>Create Session</Text>
                <Feather name="arrow-right" size={18} color="#fff" />
              </>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 17, fontWeight: "700", fontFamily: "Inter_700Bold" },
  scroll: { paddingHorizontal: 20, paddingTop: 20 },
  sectionTitle: { fontSize: 11, fontWeight: "600", fontFamily: "Inter_600SemiBold", letterSpacing: 0.8, marginBottom: 12 },
  playerCard: { borderRadius: 16, borderWidth: 1, padding: 14, marginBottom: 12 },
  playerRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  playerNum: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  playerNumText: { color: "#fff", fontSize: 13, fontWeight: "700", fontFamily: "Inter_700Bold" },
  nameInput: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular", borderBottomWidth: 1, paddingBottom: 4 },
  celebPicker: { flexDirection: "row", alignItems: "center", padding: 10, borderRadius: 10, borderWidth: 1, gap: 10 },
  celebEmoji: { fontSize: 22 },
  celebName: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  celebRole: { fontSize: 11, fontFamily: "Inter_400Regular" },
  pickerDropdown: {
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  pickerSection: {
    fontSize: 10,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.8,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 4,
  },
  pickerItem: { flexDirection: "row", alignItems: "center", padding: 12, gap: 10 },
  pickerEmoji: { fontSize: 18 },
  pickerName: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  addPlayerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 2,
    borderStyle: "dashed",
    gap: 8,
    marginBottom: 20,
  },
  addPlayerText: { fontSize: 15, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  error: { textAlign: "center", marginBottom: 12, fontSize: 13, fontFamily: "Inter_400Regular" },
  createBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 54,
    borderRadius: 14,
    gap: 8,
  },
  createBtnText: { color: "#fff", fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
});
