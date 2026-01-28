import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { useTheme } from "../context/ThemeContext";

const SignUpScreen = () => {
  const { colors, isDark } = useTheme();

  const RoleCard = ({
    title,
    icon,
    route,
    description
  }: {
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
    route: any;
    description: string;
  }) => (
    <TouchableOpacity
      style={[
        styles.optionCard,
        {
          backgroundColor: colors.card,
          shadowColor: isDark ? "#000" : "#ccc",
          borderColor: isDark ? 'transparent' : 'rgba(0,0,0,0.05)',
          borderWidth: 1
        }
      ]}
      activeOpacity={0.9}
      onPress={() => router.push(route)}
    >
      <View style={[styles.iconContainer, { backgroundColor: isDark ? 'rgba(58, 123, 213, 0.15)' : 'rgba(58, 123, 213, 0.1)' }]}>
        <Ionicons name={icon} size={moderateScale(32)} color={colors.primary} />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.optionTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.optionDescription, { color: isDark ? '#aaa' : '#666' }]}>{description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={moderateScale(24)} color={isDark ? '#555' : '#ccc'} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'white' }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={moderateScale(24)} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={[styles.heading, { color: colors.text }]}>
            Join Updater
          </Text>
          <Text style={[styles.subHeading, { color: isDark ? '#aaa' : '#666' }]}>
            Choose how you want to get started
          </Text>
        </View>

        <View style={styles.optionsContainer}>
          <RoleCard
            title="As a Columnist"
            icon="newspaper-outline"
            route="/SignUpJournalist"
            description="Write articles, share insights, and build your audience."
          />

          <RoleCard
            title="As a User"
            icon="person-outline"
            route="/SignUpUser"
            description="Read columns, follow writers, and stay updated."
          />
        </View>

        {/* Login Link */}
        <TouchableOpacity
          style={styles.loginContainer}
          onPress={() => router.push("/Login")}
          activeOpacity={0.8}
        >
          <Text style={[styles.loginText, { color: isDark ? '#aaa' : '#666' }]}>
            Already have an account?{" "}
            <Text style={[styles.loginLink, { color: colors.primary }]}>Login</Text>
          </Text>
        </TouchableOpacity>

      </View>
    </View>
  );
};

export default SignUpScreen;

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
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flex: 1,
    paddingHorizontal: scale(24),
  },
  titleContainer: {
    marginBottom: verticalScale(40),
    marginTop: verticalScale(20),
  },
  heading: {
    fontSize: moderateScale(32),
    fontWeight: "800",
    marginBottom: verticalScale(8),
    letterSpacing: 0.5,
  },
  subHeading: {
    fontSize: moderateScale(16),
    lineHeight: moderateScale(24),
  },
  optionsContainer: {
    gap: verticalScale(20),
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: moderateScale(20),
    borderRadius: moderateScale(20),
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  iconContainer: {
    width: moderateScale(60),
    height: moderateScale(60),
    borderRadius: moderateScale(18),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(16),
  },
  textContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: moderateScale(18),
    fontWeight: "700",
    marginBottom: verticalScale(4),
  },
  optionDescription: {
    fontSize: moderateScale(13),
    lineHeight: moderateScale(18),
  },
  loginContainer: {
    marginTop: 'auto',
    marginBottom: verticalScale(40),
    alignItems: 'center',
    paddingVertical: verticalScale(10),
  },
  loginText: {
    fontSize: moderateScale(14),
  },
  loginLink: {
    fontWeight: "700",
  },
});
