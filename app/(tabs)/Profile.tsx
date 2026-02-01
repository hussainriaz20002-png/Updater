import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Slider from "@react-native-community/slider";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  BackHandler,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import DefaultAvatar from "../../components/DefaultAvatar";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

const ProfileScreen = () => {
  const router = useRouter();
  const { isDark, colors, toggleTheme } = useTheme();
  const { userData, logout } = useAuth();
  const insets = useSafeAreaInsets();

  // Profile State - Derived directly from userData now
  const name = userData?.name || "User";
  const bio = userData?.bio || "No bio yet...";
  const profileImage = userData?.photoURL; // undefined falls back to DefaultAvatar inside component if logic exists, or we handle here

  // Settings State
  const [dailyLimitEnabled, setDailyLimitEnabled] = useState(false);
  const [dailyLimit, setDailyLimit] = useState(30);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load Settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedLimit = await AsyncStorage.getItem("dailyLimit");
        const storedEnabled = await AsyncStorage.getItem("dailyLimitEnabled");
        const storedStartTime = await AsyncStorage.getItem("dailyStartTime");
        const storedDate = await AsyncStorage.getItem("dailyDate");

        const today = new Date().toDateString();

        if (storedDate && storedDate !== today) {
          await AsyncStorage.multiRemove(["dailyStartTime", "dailyDate"]);
          await AsyncStorage.setItem("dailyLimitEnabled", "false");
          setDailyLimitEnabled(false);
          return;
        }

        if (storedLimit) setDailyLimit(Number(storedLimit));
        if (storedEnabled === "true") {
          setDailyLimitEnabled(true);
          if (storedStartTime) {
            const elapsed = Date.now() - Number(storedStartTime);
            const remaining = Number(storedLimit) * 60 * 1000 - elapsed;
            if (remaining > 0) startTimer(remaining);
          }
        }
      } catch (error) {
        console.log("Error loading settings:", error);
      }
    };
    loadSettings();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Timer Logic
  const startTimer = (durationMs: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      Alert.alert(
        "Daily Limit Reached",
        "Your daily time limit has been reached. The app will now close.",
        [{ text: "OK", onPress: () => BackHandler.exitApp() }],
        { cancelable: false },
      );
    }, durationMs);
  };

  const handleToggleLimit = async (value: boolean) => {
    setDailyLimitEnabled(value);
    if (value) {
      const startTime = Date.now();
      const today = new Date().toDateString();
      await AsyncStorage.setItem("dailyStartTime", startTime.toString());
      await AsyncStorage.setItem("dailyLimitEnabled", "true");
      await AsyncStorage.setItem("dailyLimit", dailyLimit.toString());
      await AsyncStorage.setItem("dailyDate", today);
      startTimer(dailyLimit * 60 * 1000);
    } else {
      if (timerRef.current) clearTimeout(timerRef.current);
      await AsyncStorage.multiRemove(["dailyStartTime", "dailyDate"]);
      await AsyncStorage.setItem("dailyLimitEnabled", "false");
    }
  };

  const handleLimitChange = async (value: number) => {
    setDailyLimit(value);
    await AsyncStorage.setItem("dailyLimit", value.toString());
  };

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/");
        },
      },
    ]);
  };

  const SettingItem = ({
    icon,
    label,
    value,
    onToggle,
    onPress,
    rightElement,
    destructive = false,
  }: any) => (
    <TouchableOpacity
      style={[
        styles.settingItem,
        {
          backgroundColor: colors.card,
          borderColor: isDark ? "#333" : "#f0f0f0",
        },
      ]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingLeft}>
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: destructive
                ? "rgba(255,59,48,0.1)"
                : isDark
                  ? "#333"
                  : "#f5f5f5",
            },
          ]}
        >
          <Ionicons
            name={icon}
            size={moderateScale(20)}
            color={destructive ? "#FF3B30" : colors.primary}
          />
        </View>
        <Text
          style={[
            styles.settingLabel,
            { color: destructive ? "#FF3B30" : colors.text },
          ]}
        >
          {label}
        </Text>
      </View>

      {rightElement ||
        (onToggle !== undefined && (
          <Switch
            value={value}
            onValueChange={onToggle}
            trackColor={{ false: "#e0e0e0", true: colors.primary }}
            thumbColor={"#fff"}
          />
        )) ||
        (onPress && (
          <Ionicons
            name="chevron-forward"
            size={moderateScale(20)}
            color={colors.secondaryText || "#999"}
          />
        ))}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + verticalScale(20) },
        ]}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarWrapper}>
            <DefaultAvatar
              name={name}
              size={moderateScale(100)}
              source={profileImage} // Pass the image URL
            />
            <TouchableOpacity
              style={[styles.editBadge, { backgroundColor: colors.primary }]}
              onPress={() =>
                router.push({
                  pathname: "/EditProfile",
                  params: { name, bio, profileImage },
                })
              }
            >
              <Ionicons name="pencil" size={moderateScale(14)} color="#fff" />
            </TouchableOpacity>
          </View>

          <Text style={[styles.name, { color: colors.text }]}>{name}</Text>
          <Text
            style={[
              styles.bio,
              { color: colors.secondaryText || (isDark ? "#aaa" : "#666") },
            ]}
          >
            {bio}
          </Text>
        </View>

        {/* Content Section */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Content
        </Text>
        <SettingItem
          icon="bookmark-outline"
          label="Saved News"
          onPress={() => router.push("/SavedArticles")}
        />

        {/* Preferences Section */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Preferences
        </Text>
        <SettingItem
          icon="moon-outline"
          label="Dark Mode"
          value={isDark}
          onToggle={toggleTheme}
        />
        <SettingItem
          icon="timer-outline"
          label="Daily Time Limit"
          value={dailyLimitEnabled}
          onToggle={handleToggleLimit}
        />

        {dailyLimitEnabled && (
          <View
            style={[
              styles.sliderContainer,
              {
                backgroundColor: colors.card,
                borderColor: isDark ? "#333" : "#f0f0f0",
              },
            ]}
          >
            <View style={styles.sliderHeader}>
              <Text style={[styles.sliderLabel, { color: colors.text }]}>
                Limit Duration
              </Text>
              <Text style={[styles.limitValue, { color: colors.primary }]}>
                {dailyLimit} min
              </Text>
            </View>
            <Slider
              style={{ width: "100%", height: 40 }}
              minimumValue={5}
              maximumValue={120}
              step={5}
              value={dailyLimit}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={isDark ? "#444" : "#ddd"}
              thumbTintColor={colors.primary}
              onValueChange={handleLimitChange}
            />
          </View>
        )}

        {/* Actions Section */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Account
        </Text>
        <SettingItem
          icon="log-out-outline"
          label="Log Out"
          onPress={handleLogout}
          destructive
        />

        <View style={{ height: verticalScale(40) }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: scale(20),
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: verticalScale(30),
  },
  avatarWrapper: {
    marginBottom: verticalScale(16),
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(16),
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff", // Adaptive bg color in component
  },
  name: {
    fontSize: moderateScale(24),
    fontWeight: "800",
    marginBottom: verticalScale(4),
    letterSpacing: 0.5,
  },
  bio: {
    fontSize: moderateScale(14),
    textAlign: "center",
    lineHeight: moderateScale(20),
    paddingHorizontal: scale(20),
  },
  sectionTitle: {
    fontSize: moderateScale(14),
    fontWeight: "700",
    opacity: 0.6,
    marginBottom: verticalScale(12),
    marginTop: verticalScale(8),
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: moderateScale(16),
    borderRadius: moderateScale(16),
    marginBottom: verticalScale(12),
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: moderateScale(38),
    height: moderateScale(38),
    borderRadius: moderateScale(12),
    justifyContent: "center",
    alignItems: "center",
    marginRight: scale(14),
  },
  settingLabel: {
    fontSize: moderateScale(16),
    fontWeight: "600",
  },
  sliderContainer: {
    padding: moderateScale(16),
    borderRadius: moderateScale(16),
    marginTop: verticalScale(-4),
    marginBottom: verticalScale(12),
    borderWidth: 1,
  },
  sliderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(4),
  },
  sliderLabel: {
    fontSize: moderateScale(14),
    fontWeight: "500",
  },
  limitValue: {
    fontSize: moderateScale(16),
    fontWeight: "700",
  },
});

export default ProfileScreen;
