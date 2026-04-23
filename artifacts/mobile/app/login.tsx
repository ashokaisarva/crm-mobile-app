import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Icon } from "@/components/Icon";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login, isLoggedIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isLoggedIn) {
      router.replace("/(tabs)");
    }
  }, [isLoggedIn]);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setError("");
    setLoading(true);
    const result = await login(email.trim(), password);
    setLoading(false);
    if (!result.success) {
      setError(result.error ?? "Login failed.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Brand */}
        <View style={styles.brandRow}>
          <View style={[styles.logoBox, { backgroundColor: colors.primary }]}>
            <Icon name="briefcase" size={28} color="#fff" />
          </View>
        </View>
        <Text style={[styles.brandName, { color: colors.foreground }]}>
          SalesCRM
        </Text>
        <Text style={[styles.tagline, { color: colors.mutedForeground }]}>
          Your pipeline, always in reach
        </Text>

        {/* Card */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>
            Welcome back
          </Text>
          <Text style={[styles.cardSub, { color: colors.mutedForeground }]}>
            Sign in to your account
          </Text>

          {/* Email */}
          <Text style={[styles.label, { color: colors.foreground }]}>
            Email
          </Text>
          <View
            style={[
              styles.inputWrapper,
              { borderColor: colors.border, backgroundColor: colors.muted },
            ]}
          >
            <Icon
              name="mail"
              size={16}
              color={colors.mutedForeground}
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              placeholder="you@company.com"
              placeholderTextColor={colors.mutedForeground}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              returnKeyType="next"
            />
          </View>

          {/* Password */}
          <Text style={[styles.label, { color: colors.foreground }]}>
            Password
          </Text>
          <View
            style={[
              styles.inputWrapper,
              { borderColor: colors.border, backgroundColor: colors.muted },
            ]}
          >
            <Icon
              name="lock"
              size={16}
              color={colors.mutedForeground}
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              placeholder="Enter password"
              placeholderTextColor={colors.mutedForeground}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
            <TouchableOpacity
              onPress={() => setShowPass((v) => !v)}
              style={styles.eyeBtn}
            >
              <Icon
                name={showPass ? "eye-off" : "eye"}
                size={16}
                color={colors.mutedForeground}
              />
            </TouchableOpacity>
          </View>

          {/* Error */}
          {!!error && (
            <View
              style={[
                styles.errorBox,
                { backgroundColor: "#fee2e2", borderColor: "#fca5a5" },
              ]}
            >
              <Icon
                name="alert-circle"
                size={14}
                color={colors.destructive}
              />
              <Text style={[styles.errorText, { color: colors.destructive }]}>
                {error}
              </Text>
            </View>
          )}

          {/* Login Button */}
          <TouchableOpacity
            style={[
              styles.loginBtn,
              { backgroundColor: colors.primary },
              loading && styles.loginBtnDisabled,
            ]}
            onPress={handleLogin}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Text style={styles.loginBtnText}>Sign In</Text>
                <Icon name="arrow-right" size={18} color="#fff" />
              </>
            )}
          </TouchableOpacity>

          {/* Hint */}
          <View style={styles.hintRow}>
            <Icon name="info" size={13} color={colors.mutedForeground} />
            <Text style={[styles.hintText, { color: colors.mutedForeground }]}>
              Use your CRM account credentials to sign in
            </Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={[styles.footer, { color: colors.mutedForeground }]}>
          SalesCRM v1.0.0
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 24,
  },
  brandRow: {
    marginBottom: 14,
  },
  logoBox: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  brandName: {
    fontSize: 28,
    fontFamily: "Poppins_700Bold",
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    marginBottom: 36,
    textAlign: "center",
  },
  card: {
    width: "100%",
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 22,
    fontFamily: "Poppins_700Bold",
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    marginBottom: 24,
  },
  label: {
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 12,
    height: 50,
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Poppins_400Regular",
  },
  eyeBtn: { padding: 4 },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 13,
    fontFamily: "Poppins_500Medium",
    flex: 1,
  },
  loginBtn: {
    height: 52,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 4,
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  loginBtnDisabled: { opacity: 0.7 },
  loginBtnText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
  },
  hintRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 16,
  },
  hintText: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
    flex: 1,
  },
  footer: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
  },
});
