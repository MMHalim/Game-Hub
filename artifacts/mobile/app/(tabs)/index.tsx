import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
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

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { isTrialActive, trialDaysLeft, isSubscribed, canPlay } = useSubscription();

  const firstName = user?.name.split(" ")[0] ?? "Player";

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
            <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
              Welcome back,
            </Text>
            <Text style={[styles.name, { color: colors.foreground }]}>
              {firstName} 👋
            </Text>
          </View>
          <View style={[styles.crownBadge, { backgroundColor: colors.gold + "22" }]}>
            <Feather name="award" size={22} color={colors.gold} />
          </View>
        </View>

        {/* Subscription Banner */}
        {!isSubscribed && (
          <Pressable
            style={[
              styles.subBanner,
              {
                backgroundColor: isTrialActive
                  ? colors.primary + "22"
                  : colors.destructive + "22",
                borderColor: isTrialActive
                  ? colors.primary + "44"
                  : colors.destructive + "44",
              },
            ]}
            onPress={() => router.push("/subscription")}
          >
            <Feather
              name={isTrialActive ? "clock" : "lock"}
              size={16}
              color={isTrialActive ? colors.primary : colors.destructive}
            />
            <Text
              style={[
                styles.subBannerText,
                { color: isTrialActive ? colors.primary : colors.destructive },
              ]}
            >
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
            <Text style={[styles.subBannerText, { color: colors.success }]}>
              Active subscription
            </Text>
          </View>
        )}

        {/* Hero Section */}
        <LinearGradient
          colors={[colors.primary, "#4C1D95"]}
          style={styles.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Party Time!</Text>
            <Text style={styles.heroSub}>
              Make your friends laugh with celebrity quotes.{"\n"}
              The funniest player wins the crown.
            </Text>
          </View>
          <View style={styles.heroDecor}>
            <Feather name="mic" size={60} color="#ffffff33" />
          </View>
        </LinearGradient>

        {/* CTA Buttons */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Start a Game
        </Text>

        <View style={styles.ctaGrid}>
          <Pressable
            style={({ pressed }) => [
              styles.ctaCard,
              styles.ctaCardCreate,
              { backgroundColor: colors.primary, opacity: pressed ? 0.9 : 1 },
            ]}
            onPress={() => {
              if (!canPlay) {
                router.push("/subscription");
                return;
              }
              router.push("/create-session");
            }}
          >
            <View style={styles.ctaIcon}>
              <Feather name="plus-circle" size={28} color="#fff" />
            </View>
            <Text style={styles.ctaTitle}>Create Game</Text>
            <Text style={styles.ctaSub}>
              Set up players &{"\n"}pick celebrities
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.ctaCard,
              { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, opacity: pressed ? 0.9 : 1 },
            ]}
            onPress={() => {
              if (!canPlay) {
                router.push("/subscription");
                return;
              }
              router.push("/join-session");
            }}
          >
            <View style={styles.ctaIcon}>
              <Feather name="log-in" size={28} color={colors.primary} />
            </View>
            <Text style={[styles.ctaTitle, { color: colors.foreground }]}>Join Game</Text>
            <Text style={[styles.ctaSub, { color: colors.mutedForeground }]}>
              Enter a session{"\n"}code to join
            </Text>
          </Pressable>
        </View>

        {/* How to play */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          How to Play
        </Text>

        {[
          { icon: "users" as const, step: "1", text: "Create a session with 2-8 players" },
          { icon: "star" as const, step: "2", text: "Each player gets a celebrity to imitate" },
          { icon: "mic" as const, step: "3", text: "Use celebrity quotes to make everyone laugh" },
          { icon: "bar-chart-2" as const, step: "4", text: "Laughter intensity is measured by microphone" },
          { icon: "award" as const, step: "5", text: "Highest score wins the crown!" },
        ].map(({ icon, step, text }) => (
          <View
            key={step}
            style={[styles.howStep, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={[styles.stepNum, { backgroundColor: colors.primary + "22" }]}>
              <Text style={[styles.stepNumText, { color: colors.primary }]}>{step}</Text>
            </View>
            <Feather name={icon} size={18} color={colors.primary} style={{ marginRight: 4 }} />
            <Text style={[styles.howText, { color: colors.foreground }]}>{text}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  greeting: { fontSize: 13, fontFamily: "Inter_400Regular" },
  name: { fontSize: 24, fontWeight: "700", fontFamily: "Inter_700Bold" },
  crownBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  subBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  subBannerText: { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium" },
  hero: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 28,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },
  heroContent: { flex: 1 },
  heroTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#fff",
    fontFamily: "Inter_700Bold",
    marginBottom: 8,
  },
  heroSub: {
    fontSize: 13,
    color: "#ffffff99",
    fontFamily: "Inter_400Regular",
    lineHeight: 19,
  },
  heroDecor: { marginLeft: 8 },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    marginBottom: 12,
  },
  ctaGrid: { flexDirection: "row", gap: 12, marginBottom: 28 },
  ctaCard: {
    flex: 1,
    borderRadius: 18,
    padding: 18,
    minHeight: 150,
  },
  ctaCardCreate: {},
  ctaIcon: { marginBottom: 12 },
  ctaTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    fontFamily: "Inter_700Bold",
    marginBottom: 4,
  },
  ctaSub: {
    fontSize: 12,
    color: "#ffffff99",
    fontFamily: "Inter_400Regular",
    lineHeight: 17,
  },
  howStep: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
    marginBottom: 8,
  },
  stepNum: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumText: {
    fontSize: 12,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  howText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular" },
});
