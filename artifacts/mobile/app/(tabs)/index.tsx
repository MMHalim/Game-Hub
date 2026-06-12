import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
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
import { useAuth } from "@/context/AuthContext";
import { useSubscription } from "@/context/SubscriptionContext";
import { useColors } from "@/hooks/useColors";

const HOW_TO_STEPS = [
  { icon: "users" as const, step: "1", text: "Create a session with 2–8 players" },
  { icon: "star" as const, step: "2", text: "Each player gets a celebrity to imitate" },
  { icon: "mic" as const, step: "3", text: "Use celebrity quotes to make everyone laugh" },
  { icon: "bar-chart-2" as const, step: "4", text: "Laughter intensity is measured by microphone" },
  { icon: "award" as const, step: "5", text: "Highest score wins the crown!" },
];

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { isTrialActive, trialDaysLeft, isSubscribed, canPlay } = useSubscription();

  const firstName = user?.name.split(" ")[0] ?? "Player";

  // ── Crown badge pulse (looping) ──
  const crownPulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(crownPulse, { toValue: 1.18, duration: 800, useNativeDriver: true }),
        Animated.timing(crownPulse, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  // ── Mic icon gentle sway in hero ──
  const micSway = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(micSway, { toValue: 1, duration: 1800, useNativeDriver: true }),
        Animated.timing(micSway, { toValue: 0, duration: 1800, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  // ── CTA cards entrance ──
  const ctaScale = useRef(new Animated.Value(0.88)).current;
  const ctaOpacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.spring(ctaScale, { toValue: 1, useNativeDriver: true, damping: 12, stiffness: 140 }),
      Animated.timing(ctaOpacity, { toValue: 1, duration: 400, delay: 120, useNativeDriver: true }),
    ]).start();
  }, []);

  // ── Staggered How-to-Play entrance ──
  const stepAnims = useRef(HOW_TO_STEPS.map(() => new Animated.Value(0))).current;
  useEffect(() => {
    Animated.stagger(
      70,
      stepAnims.map((a) =>
        Animated.spring(a, { toValue: 1, useNativeDriver: true, damping: 14, stiffness: 160 })
      )
    ).start();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: insets.top + (Platform.OS === "web" ? 67 : 16),
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 100),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.mutedForeground }]}>Welcome back,</Text>
            <Text style={[styles.name, { color: colors.foreground }]}>{firstName} 👋</Text>
          </View>
          <Animated.View
            style={[styles.crownBadge, { backgroundColor: colors.gold + "22", transform: [{ scale: crownPulse }] }]}
          >
            <Feather name="award" size={22} color={colors.gold} />
          </Animated.View>
        </View>

        {/* Subscription Banner */}
        {!isSubscribed && (
          <Pressable
            style={[styles.subBanner, {
              backgroundColor: isTrialActive ? colors.primary + "22" : colors.destructive + "22",
              borderColor: isTrialActive ? colors.primary + "44" : colors.destructive + "44",
            }]}
            onPress={() => router.push("/subscription")}
          >
            <Feather
              name={isTrialActive ? "clock" : "lock"}
              size={16}
              color={isTrialActive ? colors.primary : colors.destructive}
            />
            <Text style={[styles.subBannerText, { color: isTrialActive ? colors.primary : colors.destructive }]}>
              {isTrialActive
                ? `Free trial: ${trialDaysLeft} day${trialDaysLeft !== 1 ? "s" : ""} remaining`
                : "Trial expired — subscribe to keep playing"}
            </Text>
            <Feather name="chevron-right" size={14} color={isTrialActive ? colors.primary : colors.destructive} />
          </Pressable>
        )}

        {isSubscribed && (
          <View style={[styles.subBanner, { backgroundColor: colors.success + "22", borderColor: colors.success + "44" }]}>
            <Feather name="check-circle" size={16} color={colors.success} />
            <Text style={[styles.subBannerText, { color: colors.success }]}>Active subscription</Text>
          </View>
        )}

        {/* Hero */}
        <LinearGradient
          colors={[colors.primary, "#4C1D95"]}
          style={styles.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Party Time! 🎉</Text>
            <Text style={styles.heroSub}>
              Make your friends laugh with celebrity quotes.{"\n"}
              The funniest player wins the crown.
            </Text>
          </View>
          <Animated.View style={[styles.heroDecor, {
            transform: [
              { rotate: micSway.interpolate({ inputRange: [0, 1], outputRange: ["-12deg", "12deg"] }) },
            ],
          }]}>
            <Feather name="mic" size={58} color="#ffffff33" />
          </Animated.View>
        </LinearGradient>

        {/* CTA */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Start a Game</Text>
        <Animated.View style={[styles.ctaGrid, { opacity: ctaOpacity, transform: [{ scale: ctaScale }] }]}>
          <Pressable
            style={({ pressed }) => [
              styles.ctaCard,
              { backgroundColor: colors.primary, opacity: pressed ? 0.9 : 1 },
            ]}
            onPress={() => { if (!canPlay) { router.push("/subscription"); return; } router.push("/create-session"); }}
          >
            <View style={styles.ctaIcon}>
              <Feather name="plus-circle" size={28} color="#fff" />
            </View>
            <Text style={styles.ctaTitle}>Create Game</Text>
            <Text style={styles.ctaSub}>Set up players &{"\n"}pick celebrities</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.ctaCard,
              { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, opacity: pressed ? 0.9 : 1 },
            ]}
            onPress={() => { if (!canPlay) { router.push("/subscription"); return; } router.push("/join-session"); }}
          >
            <View style={styles.ctaIcon}>
              <Feather name="log-in" size={28} color={colors.primary} />
            </View>
            <Text style={[styles.ctaTitle, { color: colors.foreground }]}>Join Game</Text>
            <Text style={[styles.ctaSub, { color: colors.mutedForeground }]}>Enter a session{"\n"}code to join</Text>
          </Pressable>
        </Animated.View>

        {/* How to Play */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>How to Play</Text>
        {HOW_TO_STEPS.map(({ icon, step, text }, i) => (
          <Animated.View
            key={step}
            style={{
              opacity: stepAnims[i],
              transform: [
                {
                  translateX: stepAnims[i].interpolate({
                    inputRange: [0, 1],
                    outputRange: [-28, 0],
                  }),
                },
              ],
            }}
          >
            <View style={[styles.howStep, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.stepNum, { backgroundColor: colors.primary + "22" }]}>
                <Text style={[styles.stepNumText, { color: colors.primary }]}>{step}</Text>
              </View>
              <Feather name={icon} size={18} color={colors.primary} style={{ marginRight: 4 }} />
              <Text style={[styles.howText, { color: colors.foreground }]}>{text}</Text>
            </View>
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  greeting: { fontSize: 13, fontFamily: "Inter_400Regular" },
  name: { fontSize: 24, fontWeight: "700", fontFamily: "Inter_700Bold" },
  crownBadge: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  subBanner: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 16 },
  subBannerText: { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium" },
  hero: { borderRadius: 20, padding: 24, marginBottom: 28, flexDirection: "row", alignItems: "center", overflow: "hidden" },
  heroContent: { flex: 1 },
  heroTitle: { fontSize: 26, fontWeight: "800", color: "#fff", fontFamily: "Inter_700Bold", marginBottom: 8 },
  heroSub: { fontSize: 13, color: "#ffffff99", fontFamily: "Inter_400Regular", lineHeight: 19 },
  heroDecor: { marginLeft: 8 },
  sectionTitle: { fontSize: 17, fontWeight: "700", fontFamily: "Inter_700Bold", marginBottom: 12 },
  ctaGrid: { flexDirection: "row", gap: 12, marginBottom: 28 },
  ctaCard: { flex: 1, borderRadius: 18, padding: 18, minHeight: 150 },
  ctaIcon: { marginBottom: 12 },
  ctaTitle: { fontSize: 16, fontWeight: "700", color: "#fff", fontFamily: "Inter_700Bold", marginBottom: 4 },
  ctaSub: { fontSize: 12, color: "#ffffff99", fontFamily: "Inter_400Regular", lineHeight: 17 },
  howStep: { flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 12, borderWidth: 1, gap: 10, marginBottom: 8 },
  stepNum: { width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  stepNumText: { fontSize: 12, fontWeight: "700", fontFamily: "Inter_700Bold" },
  howText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular" },
});
