import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AudioMeter } from "@/components/AudioMeter";
import { TimerRing } from "@/components/TimerRing";
import { useGame, GameSession } from "@/context/GameContext";
import { getCelebrityById, Celebrity } from "@/data/celebrities";
import { useAudioLevel } from "@/hooks/useAudioLevel";
import { useColors } from "@/hooks/useColors";

type Phase = "countdown" | "active" | "turnEnd" | "finished";

const TURN_DURATION = 60;
const COUNTDOWN_DURATION = 3;

export default function GameScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { loadSession, submitTurnScore, activeSession } = useGame();
  const { level, startRecording, stopRecording, getAverageScore } = useAudioLevel();

  const [session, setSession] = useState<GameSession | null>(activeSession);
  const [loading, setLoading] = useState(!activeSession);
  const [phase, setPhase] = useState<Phase>("countdown");
  const [timeLeft, setTimeLeft] = useState(COUNTDOWN_DURATION);
  const [currentScore, setCurrentScore] = useState(0);
  const [quoteIndex, setQuoteIndex] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scoreAnimRef = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!id) return;
    if (activeSession?.id === id) {
      setSession(activeSession);
      setLoading(false);
    } else {
      loadSession(id).then((s) => { setSession(s); setLoading(false); });
    }
  }, [id]);

  const currentPlayer = session?.players[session.currentTurnIndex];
  const celebrity: Celebrity | undefined = currentPlayer ? getCelebrityById(currentPlayer.celebrityId) : undefined;

  const clearTimer = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  };

  const startCountdown = useCallback(() => {
    setPhase("countdown");
    setTimeLeft(COUNTDOWN_DURATION);
    clearTimer();
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearTimer(); beginTurn(); return 0; }
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        return t - 1;
      });
    }, 1000);
  }, []);

  const beginTurn = useCallback(async () => {
    setPhase("active");
    setTimeLeft(TURN_DURATION);
    setCurrentScore(0);
    setQuoteIndex(0);
    await startRecording();
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearTimer(); endTurn(); return 0; }
        if (t <= 10) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        return t - 1;
      });
    }, 1000);
  }, [startRecording]);

  const endTurn = useCallback(async () => {
    clearTimer();
    const avgScore = getAverageScore();
    const finalScore = Math.round(avgScore * 10) / 10;
    setCurrentScore(finalScore);
    await stopRecording();
    Animated.sequence([
      Animated.timing(scoreAnimRef, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(scoreAnimRef, { toValue: 0.9, duration: 150, useNativeDriver: true }),
      Animated.timing(scoreAnimRef, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setPhase("turnEnd");
  }, [getAverageScore, stopRecording, scoreAnimRef]);

  useEffect(() => {
    if (phase === "active") setCurrentScore(getAverageScore());
  }, [level, phase]);

  const handleNextTurn = useCallback(async () => {
    if (!session) return;
    try {
      const updated = await submitTurnScore(session.id, currentScore);
      setSession(updated);
      if (updated.status === "finished") {
        router.replace(`/results/${session.id}`);
      } else {
        startCountdown();
      }
    } catch (e) { console.error(e); }
  }, [session, currentScore, submitTurnScore, startCountdown]);

  useEffect(() => {
    if (!loading && session) startCountdown();
    return () => { clearTimer(); stopRecording(); };
  }, [loading]);

  if (loading || !session || !currentPlayer || !celebrity) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  const totalTurns = session.players.length;
  const currentTurnNum = session.currentTurnIndex + 1;
  const quotes = celebrity.quotes;

  return (
    <LinearGradient colors={colors.gradientBg2} style={styles.gradient}>
      <View style={[styles.container, {
        paddingTop: insets.top + (Platform.OS === "web" ? 67 : 16),
        paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 24),
      }]}>

        {/* Top Bar */}
        <View style={styles.topBar}>
          <Text style={[styles.turnCounter, { color: colors.mutedForeground }]}>
            Turn {currentTurnNum}/{totalTurns}
          </Text>
          <View style={[styles.scoreChip, { backgroundColor: colors.gold + "22" }]}>
            <Feather name="mic" size={12} color={colors.gold} />
            <Text style={[styles.scoreChipText, { color: colors.gold }]}>{Math.round(currentScore)}</Text>
          </View>
        </View>

        {/* COUNTDOWN */}
        {phase === "countdown" && (
          <View style={styles.phaseContainer}>
            <View style={[styles.playerNameCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.nowPlayingLabel, { color: colors.mutedForeground }]}>NOW PLAYING</Text>
              <Text style={[styles.bigPlayerName, { color: colors.foreground }]}>{currentPlayer.name}</Text>
              <Text style={[styles.asLabel, { color: colors.mutedForeground }]}>AS</Text>
              <Text style={[styles.bigCelebName, { color: colors.foreground }]}>{celebrity.emoji} {celebrity.name}</Text>
              <Text style={[styles.celebRole, { color: colors.mutedForeground }]}>{celebrity.role}</Text>
            </View>
            <View style={styles.countdownWrap}>
              <Text style={[styles.countdownNum, { color: colors.primary }]}>{timeLeft}</Text>
              <Text style={[styles.countdownSub, { color: colors.mutedForeground }]}>Get ready!</Text>
            </View>
          </View>
        )}

        {/* ACTIVE TURN */}
        {phase === "active" && (
          <View style={styles.phaseContainer}>
            <View style={styles.activeHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.activePlayerName, { color: colors.foreground }]}>{currentPlayer.name}</Text>
                <Text style={[styles.activeCelebName, { color: colors.mutedForeground }]}>{celebrity.emoji} {celebrity.name}</Text>
              </View>
              <TimerRing timeLeft={timeLeft} totalTime={TURN_DURATION} size={90} />
            </View>

            <View style={[styles.quoteCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.quoteLabel, { color: colors.mutedForeground }]}>YOUR LINE</Text>
              <Text style={[styles.quoteText, { color: colors.foreground }]}>"{quotes[quoteIndex % quotes.length]}"</Text>
              <View style={styles.quoteNav}>
                <Pressable
                  style={({ pressed }) => [styles.quoteNavBtn, { backgroundColor: colors.muted, opacity: pressed ? 0.7 : 1 }]}
                  onPress={() => setQuoteIndex((i) => Math.max(0, i - 1))}
                >
                  <Feather name="chevron-left" size={16} color={colors.mutedForeground} />
                </Pressable>
                <Text style={[styles.quoteCounter, { color: colors.mutedForeground }]}>
                  {(quoteIndex % quotes.length) + 1} / {quotes.length}
                </Text>
                <Pressable
                  style={({ pressed }) => [styles.quoteNavBtn, { backgroundColor: colors.muted, opacity: pressed ? 0.7 : 1 }]}
                  onPress={() => setQuoteIndex((i) => i + 1)}
                >
                  <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
                </Pressable>
              </View>
            </View>

            <View style={styles.meterSection}>
              <Text style={[styles.meterLabel, { color: colors.mutedForeground }]}>LAUGHTER DETECTOR</Text>
              <View style={[styles.meterWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <AudioMeter level={level} height={70} barCount={18} />
                <Text style={[styles.meterLevel, { color: level > 60 ? colors.gold : level > 30 ? colors.primary : colors.mutedForeground }]}>
                  {level > 70 ? "HILARIOUS! 🔥" : level > 50 ? "They're laughing!" : level > 20 ? "Keep going..." : "Make them laugh!"}
                </Text>
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [styles.endTurnBtn, { borderColor: colors.border, opacity: pressed ? 0.8 : 1 }]}
              onPress={endTurn}
            >
              <Text style={[styles.endTurnText, { color: colors.mutedForeground }]}>End Turn Early</Text>
            </Pressable>
          </View>
        )}

        {/* TURN END */}
        {phase === "turnEnd" && (
          <View style={styles.phaseContainer}>
            <View style={[styles.turnResultCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.turnResultTitle, { color: colors.mutedForeground }]}>Turn Complete!</Text>
              <Text style={[styles.turnResultPlayer, { color: colors.foreground }]}>{currentPlayer.name}</Text>

              <Animated.View style={{ transform: [{ scale: scoreAnimRef }] }}>
                <View style={[styles.bigScoreCircle, { borderColor: colors.gold }]}>
                  <Text style={[styles.bigScoreValue, { color: colors.gold }]}>{Math.round(currentScore)}</Text>
                  <Text style={[styles.bigScoreLabel, { color: colors.mutedForeground }]}>pts</Text>
                </View>
              </Animated.View>

              <Text style={[styles.scoreDesc, { color: colors.mutedForeground }]}>
                {currentScore > 60 ? "Incredible! The room was roaring!" : currentScore > 35 ? "Nice work! Got some good laughs!" : currentScore > 15 ? "Not bad! A few chuckles." : "Tough crowd... try harder next time!"}
              </Text>

              {currentTurnNum < totalTurns ? (
                <Pressable
                  style={({ pressed }) => [styles.nextBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }]}
                  onPress={handleNextTurn}
                >
                  <Text style={styles.nextBtnText}>Next: {session.players[session.currentTurnIndex + 1]?.name}</Text>
                  <Feather name="arrow-right" size={18} color="#fff" />
                </Pressable>
              ) : (
                <Pressable
                  style={({ pressed }) => [styles.nextBtn, { backgroundColor: colors.gold, opacity: pressed ? 0.85 : 1 }]}
                  onPress={handleNextTurn}
                >
                  <Feather name="award" size={18} color="#000" />
                  <Text style={[styles.nextBtnText, { color: "#000" }]}>See Results!</Text>
                </Pressable>
              )}
            </View>

            {session.currentTurnIndex > 0 && (
              <View style={styles.miniScores}>
                <Text style={[styles.miniScoresTitle, { color: colors.mutedForeground }]}>Scores so far</Text>
                {session.players.slice(0, session.currentTurnIndex).map((p) => (
                  <View key={p.id} style={styles.miniScoreRow}>
                    <Text style={[styles.miniScoreName, { color: colors.foreground }]}>{p.name}</Text>
                    <Text style={[styles.miniScoreValue, { color: colors.gold }]}>{Math.round(p.score)} pts</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  container: { flex: 1, paddingHorizontal: 20 },
  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  turnCounter: { fontSize: 13, fontFamily: "Inter_500Medium" },
  scoreChip: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  scoreChipText: { fontSize: 14, fontWeight: "700", fontFamily: "Inter_700Bold" },
  phaseContainer: { flex: 1, gap: 16 },
  playerNameCard: { borderRadius: 20, padding: 28, alignItems: "center", gap: 4 },
  nowPlayingLabel: { fontSize: 11, fontWeight: "700", fontFamily: "Inter_700Bold", letterSpacing: 1.5 },
  bigPlayerName: { fontSize: 36, fontWeight: "800", fontFamily: "Inter_700Bold" },
  asLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  bigCelebName: { fontSize: 24, fontWeight: "700", fontFamily: "Inter_700Bold" },
  celebRole: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 4 },
  countdownWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  countdownNum: { fontSize: 96, fontWeight: "800", fontFamily: "Inter_700Bold" },
  countdownSub: { fontSize: 18, fontFamily: "Inter_400Regular" },
  activeHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  activePlayerName: { fontSize: 22, fontWeight: "700", fontFamily: "Inter_700Bold" },
  activeCelebName: { fontSize: 14, fontFamily: "Inter_400Regular", marginTop: 4 },
  quoteCard: { borderRadius: 18, borderWidth: 1, padding: 20 },
  quoteLabel: { fontSize: 10, fontWeight: "700", fontFamily: "Inter_700Bold", letterSpacing: 1.5, marginBottom: 10 },
  quoteText: { fontSize: 18, fontFamily: "Inter_600SemiBold", lineHeight: 26, marginBottom: 16 },
  quoteNav: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  quoteNavBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  quoteCounter: { fontSize: 12, fontFamily: "Inter_400Regular" },
  meterSection: { flex: 1 },
  meterLabel: { fontSize: 10, fontWeight: "700", fontFamily: "Inter_700Bold", letterSpacing: 1.5, marginBottom: 10 },
  meterWrap: { borderRadius: 18, borderWidth: 1, padding: 20, alignItems: "center", gap: 12 },
  meterLevel: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  endTurnBtn: { alignItems: "center", padding: 14, borderRadius: 12, borderWidth: 1 },
  endTurnText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  turnResultCard: { borderRadius: 22, borderWidth: 1, padding: 28, alignItems: "center", gap: 12 },
  turnResultTitle: { fontSize: 16, fontFamily: "Inter_400Regular" },
  turnResultPlayer: { fontSize: 28, fontWeight: "800", fontFamily: "Inter_700Bold" },
  bigScoreCircle: { width: 120, height: 120, borderRadius: 60, borderWidth: 3, alignItems: "center", justifyContent: "center", marginVertical: 8 },
  bigScoreValue: { fontSize: 42, fontWeight: "800", fontFamily: "Inter_700Bold" },
  bigScoreLabel: { fontSize: 14, fontFamily: "Inter_400Regular" },
  scoreDesc: { fontSize: 14, textAlign: "center", fontFamily: "Inter_400Regular", lineHeight: 20 },
  nextBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14, marginTop: 4 },
  nextBtnText: { fontSize: 16, fontWeight: "700", color: "#fff", fontFamily: "Inter_700Bold" },
  miniScores: { gap: 8 },
  miniScoresTitle: { fontSize: 11, fontWeight: "600", fontFamily: "Inter_600SemiBold", letterSpacing: 0.8 },
  miniScoreRow: { flexDirection: "row", justifyContent: "space-between" },
  miniScoreName: { fontSize: 14, fontFamily: "Inter_400Regular" },
  miniScoreValue: { fontSize: 14, fontWeight: "700", fontFamily: "Inter_700Bold" },
});
