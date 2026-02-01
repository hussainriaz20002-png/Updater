import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function ForgotPassword() {
  const { colors, isDark } = useTheme();
  const { resetPassword, error, resetError } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address.");
      return;
    }

    resetError();
    setLoading(true);

    try {
      await resetPassword(email);
      Alert.alert(
        "Check your email",
        "A password reset link has been sent to your email address.",
        [{ text: "OK", onPress: () => router.back() }],
      );
    } catch (e: any) {
      Alert.alert("Failed", error || e.message || "Could not send reset link.");
    } finally {
      setLoading(false);
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
          {/* Title Section */}
          <View style={styles.textContainer}>
            <Text style={[styles.titleText, { color: colors.text }]}>
              Forgot Password?
            </Text>
            <Text style={[styles.subText, { color: isDark ? "#aaa" : "#666" }]}>
              Don't worry! It happens. Please enter the address associated with
              your account.
            </Text>
          </View>

          {/* Form Card */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.card,
                shadowColor: isDark ? "#000" : "#ccc",
              },
            ]}
          >
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

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitBtn,
                {
                  backgroundColor: colors.primary,
                  opacity: loading ? 0.7 : 1,
                },
              ]}
              activeOpacity={0.8}
              onPress={handleReset}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitText}>Send Reset Link</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(50),
    marginBottom: verticalScale(10),
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
    marginBottom: verticalScale(20),
  },
  titleText: {
    fontSize: moderateScale(28),
    fontWeight: "800",
    marginBottom: verticalScale(10),
    letterSpacing: 0.5,
  },
  subText: {
    fontSize: moderateScale(16),
    lineHeight: moderateScale(24),
  },
  card: {
    borderRadius: moderateScale(24),
    padding: moderateScale(24),
    elevation: 8,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
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
  submitBtn: {
    borderRadius: moderateScale(16),
    paddingVertical: verticalScale(16),
    alignItems: "center",
    shadowColor: "#3A7BD5",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  submitText: {
    color: "#fff",
    fontSize: moderateScale(18),
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
