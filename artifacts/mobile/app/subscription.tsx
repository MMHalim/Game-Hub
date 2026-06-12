import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSubscription, SubscriptionPlan, PLAN_PRICES } from "@/context/SubscriptionContext";
import { useColors } from "@/hooks/useColors";

const PLANS: { id: SubscriptionPlan; title: string; price: string; period: string; perMonth: string; popular?: boolean }[] = [
  { id: "weekly", title: "Weekly", price: "$15", period: "per week", perMonth: "$60/mo" },
  { id: "monthly", title: "Monthly", price: "$39", period: "per month", perMonth: "$39/mo", popular: true },
  { id: "yearly", title: "Yearly", price: "$199", period: "per year", perMonth: "$16.60/mo" },
];

const FEATURES = [
  "Unlimited game sessions",
  "All celebrity packs",
  "Real-time microphone scoring",
  "No ads — ever",
  "Session history & stats",
];

export default function SubscriptionScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isSubscribed, isTrialActive, trialDaysLeft, plan: currentPlan, subscribe } = useSubscription();
  const [selected, setSelected] = useState<SubscriptionPlan>("monthly");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      await subscribe(selected);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "Subscribed!",
        `Welcome to LaughRoyale ${selected.charAt(0).toUpperCase() + selected.slice(1)}! Enjoy unlimited play.`,
        [{ text: "Let's Play!", onPress: () => router.back() }]
      );
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={colors.gradientBg} style={styles.gradient}>
      <ScrollView
        contentContainerStyle={[styles.scroll, {
          paddingTop: insets.top + (Platform.OS === "web" ? 67 : 24),
          paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 40),
        }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topRow}>
          <Pressable onPress={() => router.back()}>
            <Feather name="x" size={22} color={colors.mutedForeground} />
          </Pressable>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <LinearGradient colors={["#F59E0B", "#D97706"]} style={styles.crownCircle}>
            <Feather name="award" size={36} color="#fff" />
          </LinearGradient>
          <Text style={[styles.title, { color: colors.foreground }]}>LaughRoyale Pro</Text>
          {isTrialActive ? (
            <View style={[styles.trialBadge, { backgroundColor: colors.success + "22", borderColor: colors.success + "44" }]}>
              <Feather name="clock" size={13} color={colors.success} />
              <Text style={[styles.trialBadgeText, { color: colors.success }]}>
                {trialDaysLeft} day{trialDaysLeft !== 1 ? "s" : ""} left in free trial
              </Text>
            </View>
          ) : !isSubscribed ? (
            <View style={[styles.trialBadge, { backgroundColor: colors.destructive + "22", borderColor: colors.destructive + "44" }]}>
              <Feather name="lock" size={13} color={colors.destructive} />
              <Text style={[styles.trialBadgeText, { color: colors.destructive }]}>Trial expired</Text>
            </View>
          ) : (
            <View style={[styles.trialBadge, { backgroundColor: colors.success + "22", borderColor: colors.success + "44" }]}>
              <Feather name="check-circle" size={13} color={colors.success} />
              <Text style={[styles.trialBadgeText, { color: colors.success }]}>
                {currentPlan?.charAt(0).toUpperCase()}{currentPlan?.slice(1)} plan active
              </Text>
            </View>
          )}
        </View>

        {/* Features */}
        <View style={[styles.featuresCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {FEATURES.map((f) => (
            <View key={f} style={styles.featureRow}>
              <View style={[styles.checkCircle, { backgroundColor: colors.primary + "22" }]}>
                <Feather name="check" size={12} color={colors.primary} />
              </View>
              <Text style={[styles.featureText, { color: colors.foreground }]}>{f}</Text>
            </View>
          ))}
        </View>

        {/* Plan Selector */}
        <Text style={[styles.plansTitle, { color: colors.foreground }]}>Choose Your Plan</Text>
        {PLANS.map((plan) => (
          <Pressable
            key={plan.id}
            style={[styles.planCard, {
              backgroundColor: selected === plan.id ? colors.primary + "22" : colors.card,
              borderColor: selected === plan.id ? colors.primary : colors.border,
              borderWidth: selected === plan.id ? 2 : 1,
            }]}
            onPress={() => { setSelected(plan.id); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
          >
            {plan.popular && (
              <View style={[styles.popularBadge, { backgroundColor: colors.gold }]}>
                <Text style={styles.popularText}>BEST VALUE</Text>
              </View>
            )}
            <View style={styles.planLeft}>
              <View style={[styles.radio, { borderColor: selected === plan.id ? colors.primary : colors.border }]}>
                {selected === plan.id && <View style={[styles.radioDot, { backgroundColor: colors.primary }]} />}
              </View>
              <View>
                <Text style={[styles.planTitle, { color: colors.foreground }]}>{plan.title}</Text>
                <Text style={[styles.planPerMonth, { color: colors.mutedForeground }]}>{plan.perMonth}</Text>
              </View>
            </View>
            <View style={styles.planRight}>
              <Text style={[styles.planPrice, { color: colors.foreground }]}>{plan.price}</Text>
              <Text style={[styles.planPeriod, { color: colors.mutedForeground }]}>{plan.period}</Text>
            </View>
          </Pressable>
        ))}

        {/* Subscribe Button */}
        {!isSubscribed && (
          <Pressable
            style={({ pressed }) => [styles.subBtn, { opacity: pressed ? 0.85 : 1 }]}
            onPress={handleSubscribe}
            disabled={loading}
          >
            <LinearGradient
              colors={[colors.primary, "#4C1D95"]}
              style={styles.subBtnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Feather name="unlock" size={18} color="#fff" />
                  <Text style={styles.subBtnText}>
                    Subscribe {PLANS.find((p) => p.id === selected)?.price}{" / "}{selected}
                  </Text>
                </>
              )}
            </LinearGradient>
          </Pressable>
        )}

        <Text style={[styles.disclaimer, { color: colors.mutedForeground }]}>
          Cancel anytime. Subscription renews automatically unless cancelled.
          This is a demo implementation — no real payment is processed.
        </Text>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  scroll: { paddingHorizontal: 20, gap: 16 },
  topRow: { alignItems: "flex-end" },
  header: { alignItems: "center", gap: 10, paddingVertical: 8 },
  crownCircle: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 28, fontWeight: "800", fontFamily: "Inter_700Bold" },
  trialBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  trialBadgeText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  featuresCard: { borderRadius: 18, borderWidth: 1, padding: 18, gap: 12 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  checkCircle: { width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  featureText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  plansTitle: { fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold" },
  planCard: { borderRadius: 16, padding: 18, flexDirection: "row", alignItems: "center", justifyContent: "space-between", position: "relative", overflow: "hidden" },
  popularBadge: { position: "absolute", top: 0, right: 0, paddingHorizontal: 10, paddingVertical: 4, borderBottomLeftRadius: 10 },
  popularText: { fontSize: 10, fontWeight: "700", color: "#000", fontFamily: "Inter_700Bold" },
  planLeft: { flexDirection: "row", alignItems: "center", gap: 14 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  planTitle: { fontSize: 16, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  planPerMonth: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  planRight: { alignItems: "flex-end" },
  planPrice: { fontSize: 20, fontWeight: "800", fontFamily: "Inter_700Bold" },
  planPeriod: { fontSize: 11, fontFamily: "Inter_400Regular" },
  subBtn: { borderRadius: 16, overflow: "hidden" },
  subBtnGradient: { flexDirection: "row", alignItems: "center", justifyContent: "center", height: 56, gap: 10 },
  subBtnText: { fontSize: 16, fontWeight: "700", color: "#fff", fontFamily: "Inter_700Bold" },
  disclaimer: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 16 },
});
