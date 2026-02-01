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

import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, setDoc } from "firebase/firestore";
import { ActivityIndicator, Alert } from "react-native";
import { db } from "../config/firebase";
import { useAuth } from "../context/AuthContext";

const SignUpJournalist = () => {
  const { colors, isDark } = useTheme();
  const { signUp, error, resetError, refreshUserData } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localLoading, setLocalLoading] = useState(false);
  // const [newsContent, setNewsContent] = useState(""); // Not used in UI yet?

  const handleSignUp = async () => {
    if (!email || !password || !fullName) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    resetError();
    setLocalLoading(true);

    try {
      const { user } = await signUp(email, password);
      // Save role as 'journalist' locally
      await AsyncStorage.setItem("userRole", "journalist");
      await AsyncStorage.setItem("userName", fullName);

      // Store in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: fullName,
        email: email,
        role: "journalist",
        bio: "",
        photoURL: "", // Empty string to use local default avatar
        createdAt: new Date(),
      });

      // Force refresh of user data to ensure context is updated before navigation
      await refreshUserData();

      router.replace("/(tabs)/Home");
    } catch (e: any) {
      Alert.alert("Sign Up Failed", e.message || "Something went wrong.");
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
        {/* Back Button */}
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
          <View style={styles.textContainer}>
            <Text style={[styles.welcomeText, { color: colors.text }]}>
              Create Account
            </Text>
            <Text style={[styles.subText, { color: isDark ? "#aaa" : "#666" }]}>
              Sign up as a Columnist and start writing
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

            {/* Full Name Input */}
            <Text style={[styles.label, { color: colors.text }]}>
              Full Name
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
                name="person-outline"
                size={moderateScale(20)}
                color={colors.primary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="John Doe"
                placeholderTextColor={isDark ? "#666" : "#aaa"}
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

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
                placeholder="journalist@example.com"
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

            {/* Sign Up Button */}
            <TouchableOpacity
              style={[
                styles.button,
                {
                  backgroundColor: colors.primary,
                  opacity: localLoading ? 0.7 : 1,
                },
              ]}
              activeOpacity={0.8}
              onPress={handleSignUp}
              disabled={localLoading}
            >
              {localLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Sign Up</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignUpJournalist;

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
    paddingBottom: verticalScale(40),
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
  button: {
    borderRadius: moderateScale(16),
    paddingVertical: verticalScale(16),
    alignItems: "center",
    marginTop: verticalScale(10),
    shadowColor: "#3A7BD5",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: moderateScale(18),
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
