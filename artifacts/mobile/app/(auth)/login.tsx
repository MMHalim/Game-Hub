import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Facebook from "expo-auth-session/providers/facebook";
import * as AuthSession from "expo-auth-session";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

WebBrowser.maybeCompleteAuthSession();

const FB_APP_ID = process.env.EXPO_PUBLIC_FACEBOOK_APP_ID ?? "";
const IG_CLIENT_ID = process.env.EXPO_PUBLIC_INSTAGRAM_CLIENT_ID ?? "";

type SocialProvider = "facebook" | "instagram" | null;

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login, loginAsGuest, loginWithSocial } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [guestName, setGuestName] = useState("");
  const [showGuest, setShowGuest] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<SocialProvider>(null);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [fbRequest, fbResponse, fbPromptAsync] = Facebook.useAuthRequest({
    clientId: FB_APP_ID || "placeholder",
    scopes: ["public_profile", "email"],
  });

  const igRedirectUri = AuthSession.makeRedirectUri({ scheme: "mobile", path: "auth" });
  const [igRequest, igResponse, igPromptAsync] = AuthSession.useAuthRequest(
    {
      clientId: IG_CLIENT_ID || "placeholder",
      scopes: ["user_profile", "user_media"],
      redirectUri: igRedirectUri,
      responseType: AuthSession.ResponseType.Code,
      usePKCE: false,
    },
    { authorizationEndpoint: "https://api.instagram.com/oauth/authorize" }
  );

  useEffect(() => {
    if (!fbResponse) return;
    if (fbResponse.type === "success") {
      const token = fbResponse.authentication?.accessToken;
      if (token) handleFacebookToken(token);
    } else if (fbResponse.type === "error") {
      setSocialLoading(null);
      setError("Facebook login failed. Please try again.");
    }
  }, [fbResponse]);

  useEffect(() => {
    if (!igResponse) return;
    if (igResponse.type === "success") {
      const code = igResponse.params?.code;
      if (code) handleInstagramCode(code);
    } else if (igResponse.type === "error") {
      setSocialLoading(null);
      setError("Instagram login was cancelled or failed.");
    }
  }, [igResponse]);

  const handleFacebookToken = async (token: string) => {
    setSocialLoading("facebook");
    setError("");
    try {
      const res = await fetch(
        `https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${token}`
      );
      const profile = await res.json();
      if (profile.error) throw new Error(profile.error.message);
      await loginWithSocial("facebook", profile.id, profile.name, profile.email, profile.picture?.data?.url);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(tabs)");
    } catch (e: any) {
      setError(e.message ?? "Facebook login failed.");
    } finally {
      setSocialLoading(null);
    }
  };

  const handleInstagramCode = async (code: string) => {
    setSocialLoading("instagram");
    setError("");
    try {
      const apiBase = process.env.EXPO_PUBLIC_DOMAIN ? `https://${process.env.EXPO_PUBLIC_DOMAIN}` : "";
      const res = await fetch(`${apiBase}/api/auth/instagram/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, redirect_uri: igRedirectUri }),
      });
      const profile = await res.json();
      if (!res.ok) throw new Error(profile.message ?? "Instagram token exchange failed");
      await loginWithSocial("instagram", profile.id, profile.name, undefined, profile.avatarUrl);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(tabs)");
    } catch (e: any) {
      setError(e.message ?? "Instagram login failed.");
    } finally {
      setSocialLoading(null);
    }
  };

  const handleFacebook = async () => {
    setError("");
    if (!FB_APP_ID) {
      Alert.alert("Facebook Login — Setup Required", "Add EXPO_PUBLIC_FACEBOOK_APP_ID to your secrets and register your app at developers.facebook.com.", [{ text: "OK" }]);
      return;
    }
    setSocialLoading("facebook");
    await fbPromptAsync();
  };

  const handleInstagram = async () => {
    setError("");
    if (!IG_CLIENT_ID) {
      Alert.alert("Instagram Login — Setup Required", "Add EXPO_PUBLIC_INSTAGRAM_CLIENT_ID and INSTAGRAM_CLIENT_SECRET via the Instagram Basic Display API at developers.facebook.com.", [{ text: "OK" }]);
      return;
    }
    setSocialLoading("instagram");
    await igPromptAsync();
  };

  const handleLogin = async () => {
    setError("");
    if (!email.trim() || !password.trim()) { setError("Please fill in all fields."); return; }
    setLoading(true);
    try {
      await login(email.trim(), password);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(tabs)");
    } catch (e: any) {
      setError(e.message);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    if (!guestName.trim()) { setError("Enter your name to continue."); return; }
    setLoading(true);
    try {
      await loginAsGuest(guestName.trim());
      router.replace("/(tabs)");
    } catch {} finally {
      setLoading(false);
    }
  };

  const isSocialLoading = socialLoading !== null;

  return (
    <LinearGradient colors={colors.gradientBg} style={styles.gradient}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={[styles.scroll, {
            paddingTop: insets.top + (Platform.OS === "web" ? 67 : 40),
            paddingBottom: insets.bottom + 40,
          }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={styles.logo}>
            <View style={[styles.crownWrap, { backgroundColor: colors.primary + "33" }]}>
              <Feather name="award" size={40} color={colors.gold} />
            </View>
            <Text style={[styles.appName, { color: colors.foreground }]}>LaughRoyale</Text>
            <Text style={[styles.tagline, { color: colors.mutedForeground }]}>Make them laugh. Win the crown.</Text>
          </View>

          {!showGuest ? (
            <>
              {/* Social Buttons */}
              <View style={styles.socialSection}>
                <Pressable
                  style={({ pressed }) => [styles.socialBtn, { backgroundColor: "#1877F2", opacity: pressed || isSocialLoading ? 0.85 : 1 }]}
                  onPress={handleFacebook}
                  disabled={isSocialLoading}
                >
                  {socialLoading === "facebook" ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.fIcon}>f</Text>
                  )}
                  <Text style={styles.socialBtnText}>Continue with Facebook</Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [styles.socialBtnOuter, { opacity: pressed || isSocialLoading ? 0.85 : 1 }]}
                  onPress={handleInstagram}
                  disabled={isSocialLoading}
                >
                  <LinearGradient
                    colors={["#833AB4", "#FD1D1D", "#FCAF45"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.socialBtn}
                  >
                    {socialLoading === "instagram" ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <View style={styles.igIcon}>
                        <View style={styles.igIconInner} />
                        <View style={styles.igDot} />
                      </View>
                    )}
                    <Text style={styles.socialBtnText}>Continue with Instagram</Text>
                  </LinearGradient>
                </Pressable>
              </View>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={[styles.divLine, { backgroundColor: colors.border }]} />
                <Text style={[styles.divText, { color: colors.mutedForeground }]}>or continue with email</Text>
                <View style={[styles.divLine, { backgroundColor: colors.border }]} />
              </View>

              {/* Email Form */}
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.cardTitle, { color: colors.foreground }]}>Sign In</Text>

                <View style={styles.field}>
                  <Text style={[styles.label, { color: colors.mutedForeground }]}>Email</Text>
                  <View style={[styles.inputWrap, { backgroundColor: colors.muted, borderColor: colors.input }]}>
                    <Feather name="mail" size={16} color={colors.mutedForeground} />
                    <TextInput
                      style={[styles.input, { color: colors.foreground }]}
                      value={email}
                      onChangeText={setEmail}
                      placeholder="you@example.com"
                      placeholderTextColor={colors.mutedForeground}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                  </View>
                </View>

                <View style={styles.field}>
                  <Text style={[styles.label, { color: colors.mutedForeground }]}>Password</Text>
                  <View style={[styles.inputWrap, { backgroundColor: colors.muted, borderColor: colors.input }]}>
                    <Feather name="lock" size={16} color={colors.mutedForeground} />
                    <TextInput
                      style={[styles.input, { color: colors.foreground }]}
                      value={password}
                      onChangeText={setPassword}
                      placeholder="••••••••"
                      placeholderTextColor={colors.mutedForeground}
                      secureTextEntry={!showPassword}
                    />
                    <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn} hitSlop={8}>
                      <Feather name={showPassword ? "eye-off" : "eye"} size={16} color={colors.mutedForeground} />
                    </Pressable>
                  </View>
                </View>

                {error ? <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text> : null}

                <Pressable
                  style={({ pressed }) => [styles.primaryBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }]}
                  onPress={handleLogin}
                  disabled={loading || isSocialLoading}
                >
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Sign In</Text>}
                </Pressable>

                <Pressable style={styles.linkBtn} onPress={() => router.push("/(auth)/register")}>
                  <Text style={[styles.linkText, { color: colors.mutedForeground }]}>
                    No account?{" "}
                    <Text style={{ color: colors.primary }}>Create one</Text>
                  </Text>
                </Pressable>
              </View>

              {/* Guest */}
              <Pressable
                style={({ pressed }) => [styles.guestBtn, { borderColor: colors.border, opacity: pressed ? 0.8 : 1 }]}
                onPress={() => { setShowGuest(true); setError(""); }}
                disabled={isSocialLoading}
              >
                <Feather name="user" size={16} color={colors.mutedForeground} />
                <Text style={[styles.guestText, { color: colors.mutedForeground }]}>Continue as Guest</Text>
              </Pressable>
            </>
          ) : (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>Quick Play</Text>
              <Text style={[styles.guestSub, { color: colors.mutedForeground }]}>No account needed — just enter your name</Text>

              <View style={styles.field}>
                <Text style={[styles.label, { color: colors.mutedForeground }]}>Your Name</Text>
                <View style={[styles.inputWrap, { backgroundColor: colors.muted, borderColor: colors.input }]}>
                  <Feather name="user" size={16} color={colors.mutedForeground} />
                  <TextInput
                    style={[styles.input, { color: colors.foreground }]}
                    value={guestName}
                    onChangeText={setGuestName}
                    placeholder="Enter your name"
                    placeholderTextColor={colors.mutedForeground}
                    autoFocus
                  />
                </View>
              </View>

              {error ? <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text> : null}

              <Pressable
                style={({ pressed }) => [styles.primaryBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }]}
                onPress={handleGuest}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Let's Play!</Text>}
              </Pressable>

              <Pressable style={styles.linkBtn} onPress={() => { setShowGuest(false); setError(""); }}>
                <Text style={[styles.linkText, { color: colors.primary }]}>← Back to Sign In</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  scroll: { paddingHorizontal: 24 },
  logo: { alignItems: "center", marginBottom: 28 },
  crownWrap: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center", marginBottom: 14 },
  appName: { fontSize: 32, fontWeight: "800", fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  tagline: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 6 },
  socialSection: { gap: 10, marginBottom: 20 },
  socialBtnOuter: { borderRadius: 14, overflow: "hidden" },
  socialBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", height: 50, borderRadius: 14, gap: 10, paddingHorizontal: 16 },
  fIcon: { width: 22, height: 22, fontSize: 18, fontWeight: "900", color: "#fff", textAlign: "center", lineHeight: 22 },
  igIcon: { width: 20, height: 20, borderRadius: 6, borderWidth: 2, borderColor: "#fff", alignItems: "center", justifyContent: "center", position: "relative" },
  igIconInner: { width: 8, height: 8, borderRadius: 4, borderWidth: 2, borderColor: "#fff" },
  igDot: { position: "absolute", top: 1, right: 1, width: 3, height: 3, borderRadius: 1.5, backgroundColor: "#fff" },
  socialBtnText: { color: "#fff", fontSize: 15, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  divider: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 20 },
  divLine: { flex: 1, height: 1 },
  divText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  card: { borderRadius: 22, padding: 22, borderWidth: 1, marginBottom: 14 },
  cardTitle: { fontSize: 20, fontWeight: "700", fontFamily: "Inter_700Bold", marginBottom: 16 },
  guestSub: { fontSize: 13, marginTop: -10, marginBottom: 16, fontFamily: "Inter_400Regular" },
  field: { marginBottom: 14 },
  label: { fontSize: 11, fontWeight: "600", fontFamily: "Inter_600SemiBold", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 },
  inputWrap: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 12, paddingLeft: 14, paddingRight: 10, paddingVertical: 12, gap: 10 },
  input: { flex: 1, minWidth: 0, fontSize: 15, fontFamily: "Inter_400Regular" },
  eyeBtn: { padding: 4 },
  error: { fontSize: 13, marginBottom: 10, fontFamily: "Inter_400Regular", textAlign: "center" },
  primaryBtn: { height: 50, borderRadius: 13, alignItems: "center", justifyContent: "center", marginTop: 4 },
  primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
  linkBtn: { alignItems: "center", marginTop: 14 },
  linkText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  guestBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", height: 46, borderRadius: 13, borderWidth: 1, gap: 8 },
  guestText: { fontSize: 14, fontFamily: "Inter_500Medium" },
});
