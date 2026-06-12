import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGame, GameSession } from "@/context/GameContext";
import { getCelebrityById } from "@/data/celebrities";
import { PlayerCard } from "@/components/PlayerCard";
import { useColors } from "@/hooks/useColors";

export default function LobbyScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { loadSession, startGame, activeSession } = useGame();
  const [session, setSession] = useState<GameSession | null>(activeSession);
  const [loading, setLoading] = useState(!activeSession);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (!id) return;
    if (activeSession?.id === id) {
      setSession(activeSession);
      setLoading(false);
      return;
    }
    loadSession(id).then((s) => {
      setSession(s);
      setLoading(false);
    });
  }, [id, activeSession]);

  const handleShare = async () => {
    if (!session) return;
    try {
      await Share.share({
        message: `Join my LaughRoyale game! Session code: ${session.code}`,
      });
    } catch {}
  };

  const handleStart = async () => {
    if (!session) return;
    setStarting(true);
    try {
      await startGame(session.id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace(`/game/${session.id}`);
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!session) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.foreground }}>Session not found</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: colors.primary }}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 16), borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Lobby</Text>
        <Pressable onPress={handleShare}>
          <Feather name="share-2" size={20} color={colors.primary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 30 }]}>
        {/* Code Display */}
        <LinearGradient
          colors={[colors.primary, "#4C1D95"]}
          style={styles.codeBanner}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.codeLabel}>SESSION CODE</Text>
          <Text style={styles.code}>{session.code}</Text>
          <Text style={styles.codeHint}>Share this code so others can join</Text>
        </LinearGradient>

        {/* Game Info */}
        <View style={styles.infoRow}>
          <View style={[styles.infoChip, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="users" size={14} color={colors.primary} />
            <Text style={[styles.infoChipText, { color: colors.foreground }]}>
              {session.players.length} players
            </Text>
          </View>
          <View style={[styles.infoChip, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="clock" size={14} color={colors.primary} />
            <Text style={[styles.infoChipText, { color: colors.foreground }]}>
              60s per turn
            </Text>
          </View>
          <View style={[styles.infoChip, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="mic" size={14} color={colors.primary} />
            <Text style={[styles.infoChipText, { color: colors.foreground }]}>
              Mic scoring
            </Text>
          </View>
        </View>

        {/* Players */}
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
          PLAYERS
        </Text>
        {session.players.map((player, i) => (
          <PlayerCard
            key={player.id}
            name={player.name}
            celebrity={getCelebrityById(player.celebrityId)}
            isActive={false}
          />
        ))}

        {/* Start Button */}
        <Pressable
          style={({ pressed }) => [
            styles.startBtn,
            { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
          ]}
          onPress={handleStart}
          disabled={starting}
        >
          {starting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Feather name="play" size={22} color="#fff" />
              <Text style={styles.startBtnText}>Start Game!</Text>
            </>
          )}
        </Pressable>

        <Text style={[styles.hint, { color: colors.mutedForeground }]}>
          Make sure everyone is in the same room before starting
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1 },
  headerTitle: { fontSize: 17, fontWeight: "700", fontFamily: "Inter_700Bold" },
  scroll: { paddingHorizontal: 20, paddingTop: 20, gap: 8 },
  codeBanner: { borderRadius: 20, padding: 24, alignItems: "center", marginBottom: 16 },
  codeLabel: { fontSize: 11, fontWeight: "700", fontFamily: "Inter_700Bold", color: "#ffffff99", letterSpacing: 1.5, marginBottom: 8 },
  code: { fontSize: 42, fontWeight: "800", color: "#fff", fontFamily: "Inter_700Bold", letterSpacing: 8 },
  codeHint: { fontSize: 12, color: "#ffffff77", marginTop: 8, fontFamily: "Inter_400Regular" },
  infoRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  infoChip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  infoChipText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  sectionTitle: { fontSize: 11, fontWeight: "600", fontFamily: "Inter_600SemiBold", letterSpacing: 0.8, marginTop: 8, marginBottom: 8 },
  startBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", height: 58, borderRadius: 16, gap: 10, marginTop: 24 },
  startBtnText: { color: "#fff", fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold" },
  hint: { textAlign: "center", fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 8 },
});
