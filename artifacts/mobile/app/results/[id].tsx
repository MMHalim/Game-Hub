import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PlayerCard } from "@/components/PlayerCard";
import { useGame, GameSession, GamePlayer } from "@/context/GameContext";
import { getCelebrityById } from "@/data/celebrities";
import { useColors } from "@/hooks/useColors";

export default function ResultsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { loadSession, activeSession, resetGame } = useGame();
  const [session, setSession] = useState<GameSession | null>(activeSession);

  const crownAnim = useRef(new Animated.Value(0)).current;
  const staggerAnims = useRef(Array.from({ length: 10 }, () => new Animated.Value(0))).current;

  useEffect(() => {
    if (activeSession?.id === id) {
      setSession(activeSession);
    } else if (id) {
      loadSession(id).then(setSession);
    }
  }, [id]);

  useEffect(() => {
    if (!session) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    Animated.sequence([
      Animated.timing(crownAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.stagger(
        100,
        staggerAnims.map((a) =>
          Animated.spring(a, { toValue: 1, useNativeDriver: true, damping: 12 })
        )
      ),
    ]).start();
  }, [session]);

  if (!session) {
    return (
      <View style={[styles.loading, { backgroundColor: "#0D0B1E" }]}>
        <Text style={{ color: "#fff" }}>Loading results...</Text>
      </View>
    );
  }

  const sorted = [...session.players].sort((a, b) => b.score - a.score);
  const winner = sorted[0];

  const handlePlayAgain = () => {
    resetGame();
    router.replace("/(tabs)");
  };

  return (
    <LinearGradient colors={["#0D0B1E", "#1A0F3C", "#0D0B1E"]} style={styles.gradient}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: insets.top + (Platform.OS === "web" ? 67 : 24),
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 40),
          },
        ]}
      >
        {/* Winner Spotlight */}
        <Animated.View
          style={[
            styles.winnerSection,
            {
              opacity: crownAnim,
              transform: [{ scale: crownAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }],
            },
          ]}
        >
          <LinearGradient
            colors={["#F59E0B", "#D97706"]}
            style={styles.crownCircle}
          >
            <Feather name="award" size={44} color="#fff" />
          </LinearGradient>
          <Text style={styles.winnerLabel}>WINNER</Text>
          <Text style={styles.winnerName}>{winner.name}</Text>
          <Text style={styles.winnerCeleb}>
            {getCelebrityById(winner.celebrityId)?.emoji}{" "}
            {getCelebrityById(winner.celebrityId)?.name}
          </Text>
          <View style={styles.winnerScoreBadge}>
            <Feather name="mic" size={16} color="#F59E0B" />
            <Text style={styles.winnerScore}>{Math.round(winner.score)} pts</Text>
          </View>
        </Animated.View>

        {/* Podium */}
        {sorted.length >= 3 && (
          <View style={styles.podium}>
            {[sorted[1], sorted[0], sorted[2]].map((player, idx) => {
              const height = idx === 1 ? 80 : idx === 0 ? 60 : 45;
              const podiumColors: Record<number, string[]> = {
                1: ["#C0C0C0", "#A0A0A0"],
                0: ["#F59E0B", "#D97706"],
                2: ["#CD7F32", "#A0522D"],
              };
              return (
                <View key={player.id} style={styles.podiumItem}>
                  <Text style={styles.podiumName} numberOfLines={1}>{player.name}</Text>
                  <Text style={styles.podiumScore}>{Math.round(player.score)}</Text>
                  <LinearGradient
                    colors={podiumColors[idx]}
                    style={[styles.podiumBar, { height }]}
                  >
                    <Text style={styles.podiumRank}>{idx === 0 ? "1" : idx === 1 ? "2" : "3"}</Text>
                  </LinearGradient>
                </View>
              );
            })}
          </View>
        )}

        {/* Full Scoreboard */}
        <Text style={styles.scoreboardTitle}>Full Scoreboard</Text>
        {sorted.map((player, i) => (
          <Animated.View
            key={player.id}
            style={{
              opacity: staggerAnims[i],
              transform: [
                {
                  translateX: staggerAnims[i].interpolate({
                    inputRange: [0, 1],
                    outputRange: [40, 0],
                  }),
                },
              ],
            }}
          >
            <PlayerCard
              name={player.name}
              celebrity={getCelebrityById(player.celebrityId)}
              score={player.score}
              rank={i}
              showScore
            />
          </Animated.View>
        ))}

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [styles.playAgainBtn, { opacity: pressed ? 0.85 : 1 }]}
            onPress={handlePlayAgain}
          >
            <LinearGradient
              colors={[colors.primary, "#4C1D95"]}
              style={styles.playAgainGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Feather name="refresh-cw" size={18} color="#fff" />
              <Text style={styles.playAgainText}>Play Again</Text>
            </LinearGradient>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.homeBtn,
              { borderColor: "#3D3A6A", opacity: pressed ? 0.8 : 1 },
            ]}
            onPress={() => { resetGame(); router.replace("/(tabs)"); }}
          >
            <Feather name="home" size={18} color="#9B99B8" />
            <Text style={[styles.homeText, { color: "#9B99B8" }]}>Home</Text>
          </Pressable>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  scroll: { paddingHorizontal: 20, gap: 12 },
  winnerSection: { alignItems: "center", paddingVertical: 16, gap: 8 },
  crownCircle: { width: 96, height: 96, borderRadius: 48, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  winnerLabel: { fontSize: 11, fontWeight: "700", fontFamily: "Inter_700Bold", color: "#F59E0B", letterSpacing: 2 },
  winnerName: { fontSize: 38, fontWeight: "800", color: "#F8F7FF", fontFamily: "Inter_700Bold" },
  winnerCeleb: { fontSize: 16, color: "#9B99B8", fontFamily: "Inter_400Regular" },
  winnerScoreBadge: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#F59E0B22", paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, marginTop: 4 },
  winnerScore: { fontSize: 18, fontWeight: "700", color: "#F59E0B", fontFamily: "Inter_700Bold" },
  podium: { flexDirection: "row", alignItems: "flex-end", justifyContent: "center", gap: 8, marginVertical: 8 },
  podiumItem: { alignItems: "center", width: 90 },
  podiumName: { fontSize: 11, color: "#F8F7FF", fontFamily: "Inter_500Medium", marginBottom: 4, textAlign: "center" },
  podiumScore: { fontSize: 13, fontWeight: "700", color: "#F59E0B", fontFamily: "Inter_700Bold", marginBottom: 4 },
  podiumBar: { width: "100%", borderRadius: 8, alignItems: "center", justifyContent: "center" },
  podiumRank: { fontSize: 18, fontWeight: "800", color: "#fff", fontFamily: "Inter_700Bold" },
  scoreboardTitle: { fontSize: 14, fontWeight: "700", fontFamily: "Inter_700Bold", color: "#9B99B8", letterSpacing: 0.8, textTransform: "uppercase" },
  actions: { gap: 12, marginTop: 8 },
  playAgainBtn: { borderRadius: 16, overflow: "hidden" },
  playAgainGradient: { flexDirection: "row", alignItems: "center", justifyContent: "center", height: 54, gap: 10 },
  playAgainText: { color: "#fff", fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
  homeBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", height: 48, borderRadius: 14, borderWidth: 1, gap: 8 },
  homeText: { fontSize: 15, fontFamily: "Inter_500Medium" },
});
