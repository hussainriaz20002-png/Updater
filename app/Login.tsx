import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { useTheme } from "../context/ThemeContext";

import { ActivityIndicator, Alert } from "react-native";
import { useAuth } from "../context/AuthContext";

const LoginScreen = () => {
  const { colors, isDark } = useTheme();
  const { signIn, error, resetError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localLoading, setLocalLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }

    // Clear previous errors
    resetError();
    setLocalLoading(true);

    try {
      await signIn(email, password);
      // Assuming role is stored or we just navigate to Home for now
      // If role logic is needed it should probably be fetched from a database
      // But for now keeping the mock role or assuming user is already set up
      // If previous login set a role, it might still be there.
      // Let's just navigate to Home on success.
      router.replace("/(tabs)/Home");
    } catch (e: any) {
      // Error is handled in context and exposed via error prop, but we can also catch here if needed
      // context sets 'error' state which we can display
      Alert.alert("Login Failed", e.message || "Something went wrong.");
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        {/* Header / Back Button */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[
              styles.backBtn,
              { backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "white" },
            ]}
            onPress={() => router.back()}
          >
            <Ionicons
              name="arrow-back"
              size={moderateScale(24)}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.mainContent}>
          {/* Welcome Text */}
          <View style={styles.textContainer}>
            <Text style={[styles.welcomeText, { color: colors.text }]}>
              Welcome Back!
            </Text>
            <Text style={[styles.subText, { color: isDark ? "#aaa" : "#666" }]}>
              Sign in to continue your journey
            </Text>
          </View>

          {/* Card */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.card,
                shadowColor: isDark ? "#000" : "#ccc",
              },
            ]}
          >
            {/* Error Message */}
            {/* Error Message Removed - using Alert instead */}

            {/* Email Input */}
            <Text style={[styles.label, { color: colors.text }]}>
              Email Address
            </Text>
            <View
              style={[
                styles.inputContainer,
                {
                  borderColor: isDark ? "#444" : "#e0e0e0",
                  backgroundColor: isDark ? "#1a1a1a" : "#f9f9f9",
                },
              ]}
            >
              <Ionicons
                name="mail-outline"
                size={moderateScale(20)}
                color={colors.primary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="user@example.com"
                placeholderTextColor={isDark ? "#666" : "#aaa"}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Password Input */}
            <Text style={[styles.label, { color: colors.text }]}>Password</Text>
            <View
              style={[
                styles.inputContainer,
                {
                  borderColor: isDark ? "#444" : "#e0e0e0",
                  backgroundColor: isDark ? "#1a1a1a" : "#f9f9f9",
                },
              ]}
            >
              <Ionicons
                name="lock-closed-outline"
                size={moderateScale(20)}
                color={colors.primary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="********"
                placeholderTextColor={isDark ? "#666" : "#aaa"}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            {/* Forgot Password */}
            <TouchableOpacity
              style={styles.forgotBtn}
              onPress={() => router.push("/ForgotPassword")}
            >
              <Text style={[styles.forgotText, { color: colors.primary }]}>
                Forgot Password?
              </Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={[
                styles.loginBtn,
                {
                  backgroundColor: colors.primary,
                  opacity: localLoading ? 0.7 : 1,
                },
              ]}
              activeOpacity={0.8}
              onPress={handleLogin}
              disabled={localLoading}
            >
              {localLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginText}>Login</Text>
              )}
            </TouchableOpacity>

            {/* Footer */}
            <View style={styles.footer}>
              <Text
                style={[styles.footerText, { color: isDark ? "#aaa" : "#666" }]}
              >
                Don’t have an account?{" "}
              </Text>
              <TouchableOpacity onPress={() => router.replace("/SignUpScreen")}>
                <Text style={[styles.signupText, { color: colors.primary }]}>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(50),
    marginBottom: verticalScale(20),
  },
  backBtn: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(12),
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: scale(24),
  },
  textContainer: {
    marginBottom: verticalScale(30),
  },
  welcomeText: {
    fontSize: moderateScale(28),
    fontWeight: "800",
    marginBottom: verticalScale(8),
    letterSpacing: 0.5,
  },
  subText: {
    fontSize: moderateScale(16),
    lineHeight: moderateScale(22),
  },
  card: {
    borderRadius: moderateScale(24),
    padding: moderateScale(24),
    elevation: 8,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    marginBottom: verticalScale(30),
  },
  label: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    marginBottom: verticalScale(8),
    marginLeft: scale(4),
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: moderateScale(16),
    marginBottom: verticalScale(20),
    height: verticalScale(52),
    paddingHorizontal: scale(15),
  },
  inputIcon: {
    marginRight: scale(10),
  },
  input: {
    flex: 1,
    fontSize: moderateScale(16),
    height: "100%",
  },
  forgotBtn: {
    alignSelf: "flex-end",
    marginBottom: verticalScale(24),
  },
  forgotText: {
    fontSize: moderateScale(14),
    fontWeight: "600",
  },
  loginBtn: {
    borderRadius: moderateScale(16),
    paddingVertical: verticalScale(16),
    alignItems: "center",
    marginBottom: verticalScale(24),
    shadowColor: "#3A7BD5",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  loginText: {
    color: "#fff",
    fontSize: moderateScale(18),
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    fontSize: moderateScale(14),
  },
  signupText: {
    fontSize: moderateScale(14),
    fontWeight: "bold",
    marginLeft: scale(4),
  },
});
