import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
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
import { useTheme, ThemePreference } from "@/context/ThemeContext";
import { useColors } from "@/hooks/useColors";

const THEME_OPTIONS: { key: ThemePreference; icon: "sun" | "smartphone" | "moon"; label: string }[] = [
  { key: "light", icon: "sun", label: "Light" },
  { key: "system", icon: "smartphone", label: "Auto" },
  { key: "dark", icon: "moon", label: "Dark" },
];

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { isSubscribed, isTrialActive, trialDaysLeft, plan } = useSubscription();
  const { preference, setPreference } = useTheme();

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  const isGuest = !user?.email;

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
        <Text style={[styles.pageTitle, { color: colors.foreground }]}>Profile</Text>

        {/* Avatar + Name */}
        <View style={[styles.avatarCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>
              {user?.name.charAt(0).toUpperCase() ?? "?"}
            </Text>
          </View>
          <View style={styles.avatarInfo}>
            <Text style={[styles.userName, { color: colors.foreground }]}>{user?.name}</Text>
            <Text style={[styles.userEmail, { color: colors.mutedForeground }]}>
              {isGuest ? "Guest player" : user?.email}
            </Text>
          </View>
        </View>

        {/* Subscription Status */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Subscription</Text>
        <Pressable
          style={[styles.subCard, {
            backgroundColor: colors.card,
            borderColor: isSubscribed ? colors.success + "66" : colors.border,
            borderWidth: isSubscribed ? 2 : 1,
          }]}
          onPress={() => router.push("/subscription")}
        >
          <View style={[styles.subIconWrap, {
            backgroundColor: isSubscribed ? colors.success + "22" : colors.primary + "22",
          }]}>
            <Feather
              name={isSubscribed ? "check-circle" : "crown" as any}
              size={22}
              color={isSubscribed ? colors.success : colors.primary}
            />
          </View>
          <View style={styles.subInfo}>
            <Text style={[styles.subTitle, { color: colors.foreground }]}>
              {isSubscribed
                ? `${plan?.charAt(0).toUpperCase()}${plan?.slice(1)} Plan`
                : isTrialActive
                ? "Free Trial"
                : "No Subscription"}
            </Text>
            <Text style={[styles.subSub, { color: colors.mutedForeground }]}>
              {isSubscribed
                ? "Full access to all features"
                : isTrialActive
                ? `${trialDaysLeft} day${trialDaysLeft !== 1 ? "s" : ""} remaining`
                : "Subscribe to continue playing"}
            </Text>
          </View>
          <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
        </Pressable>

        {/* Appearance */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Appearance</Text>
        <View style={[styles.themeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {THEME_OPTIONS.map(({ key, icon, label }) => (
            <Pressable
              key={key}
              style={[
                styles.themeOption,
                preference === key && { backgroundColor: colors.primary },
              ]}
              onPress={() => setPreference(key)}
            >
              <Feather
                name={icon}
                size={16}
                color={preference === key ? "#fff" : colors.mutedForeground}
              />
              <Text style={[
                styles.themeLabel,
                { color: preference === key ? "#fff" : colors.mutedForeground },
              ]}>
                {label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Account Settings */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Account</Text>
        <View style={[styles.settingsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {[
            { icon: "info" as const, label: "About LaughRoyale", onPress: () => {} },
            { icon: "help-circle" as const, label: "How to Play", onPress: () => router.push("/(tabs)") },
            { icon: "star" as const, label: "Rate the App", onPress: () => {} },
            { icon: "share-2" as const, label: "Share with Friends", onPress: () => {} },
          ].map(({ icon, label, onPress }, i, arr) => (
            <Pressable
              key={label}
              style={({ pressed }) => [
                styles.settingsRow,
                { borderBottomWidth: i < arr.length - 1 ? 1 : 0, borderBottomColor: colors.border },
                pressed && { backgroundColor: colors.muted },
              ]}
              onPress={onPress}
            >
              <Feather name={icon} size={18} color={colors.primary} />
              <Text style={[styles.settingsLabel, { color: colors.foreground }]}>{label}</Text>
              <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
            </Pressable>
          ))}
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.logoutBtn,
            { backgroundColor: colors.destructive + "15", borderColor: colors.destructive + "44", opacity: pressed ? 0.8 : 1 },
          ]}
          onPress={handleLogout}
        >
          <Feather name="log-out" size={18} color={colors.destructive} />
          <Text style={[styles.logoutText, { color: colors.destructive }]}>Sign Out</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20 },
  pageTitle: { fontSize: 28, fontWeight: "800", fontFamily: "Inter_700Bold", marginBottom: 20 },
  avatarCard: { flexDirection: "row", alignItems: "center", padding: 18, borderRadius: 18, borderWidth: 1, marginBottom: 28, gap: 14 },
  avatar: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 24, fontWeight: "700", color: "#fff", fontFamily: "Inter_700Bold" },
  avatarInfo: { flex: 1 },
  userName: { fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold" },
  userEmail: { fontSize: 13, marginTop: 2, fontFamily: "Inter_400Regular" },
  sectionTitle: { fontSize: 12, fontWeight: "600", fontFamily: "Inter_600SemiBold", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 },
  subCard: { flexDirection: "row", alignItems: "center", padding: 16, borderRadius: 16, gap: 12, marginBottom: 28 },
  subIconWrap: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  subInfo: { flex: 1 },
  subTitle: { fontSize: 15, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  subSub: { fontSize: 12, marginTop: 2, fontFamily: "Inter_400Regular" },

  themeCard: { flexDirection: "row", borderRadius: 16, borderWidth: 1, padding: 4, marginBottom: 28, gap: 4 },
  themeOption: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 12, borderRadius: 12, gap: 4 },
  themeLabel: { fontSize: 11, fontWeight: "600", fontFamily: "Inter_600SemiBold" },

  settingsCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden", marginBottom: 24 },
  settingsRow: { flexDirection: "row", alignItems: "center", padding: 16, gap: 12 },
  settingsLabel: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", padding: 16, borderRadius: 14, borderWidth: 1, gap: 8, marginBottom: 20 },
  logoutText: { fontSize: 15, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
});
