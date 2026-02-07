import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const HomeHeader = () => {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: colors.card,
          shadowColor: isDark ? "#000" : "#ccc",
          borderBottomWidth: isDark ? 0 : 1,
          borderBottomColor: "rgba(0,0,0,0.05)",
          paddingTop: insets.top + verticalScale(10), // Adjust dynamic padding
        },
      ]}
    >
      <View style={styles.brandContainer}>
        {/* Optional: Add a small logo icon here if available */}
        <Text style={[styles.logo, { color: colors.text }]}>Updater</Text>
        <Text style={[styles.dot, { color: colors.primary }]}>.</Text>
      </View>

      <View style={styles.actionsContainer}>
        {/* Chat button removed from here as it is now a tab */}

        {/* Stock Market Icon */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push("/StockMarket")}
          style={[styles.iconButton]}
        >
          <Ionicons
            name="trending-up"
            size={moderateScale(24)}
            color={colors.text}
          />
        </TouchableOpacity>

        {!user && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push("/SignUpScreen")}
            style={[styles.signUpButton, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.signUpText}>Sign Up</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(7),
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  brandContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  logo: {
    fontSize: moderateScale(26),
    fontWeight: "800",
    fontFamily: "Itim",
    letterSpacing: -0.5,
  },
  dot: {
    fontSize: moderateScale(30),
    fontWeight: "bold",
    lineHeight: moderateScale(30),
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(12),
  },
  iconButton: {
    padding: moderateScale(8),
  },
  signUpButton: {
    paddingVertical: verticalScale(8),
    paddingHorizontal: scale(16),
    borderRadius: moderateScale(20),
    shadowColor: "#3A7BD5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  signUpText: {
    color: "white",
    fontSize: moderateScale(14),
    fontWeight: "700",
  },
});

export default HomeHeader;
