import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Slider from "@react-native-community/slider";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  BackHandler,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { useTheme } from "../context/ThemeContext";

const ProfileSettingsScreen = () => {
  const router = useRouter(); // Use expo-router
  const theme = useTheme();
  const { isDark, colors } = theme;

  const [notifications, setNotifications] = useState(true);
  const [breakingAlert, setBreakingAlert] = useState(true);
  const [dailyLimitEnabled, setDailyLimitEnabled] = useState(false);
  const [dailyLimit, setDailyLimit] = useState(30);

  //  timer reference
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load saved settings and restore timer
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedLimit = await AsyncStorage.getItem("dailyLimit");
        const storedEnabled = await AsyncStorage.getItem("dailyLimitEnabled");
        const storedStartTime = await AsyncStorage.getItem("dailyStartTime");
        const storedDate = await AsyncStorage.getItem("dailyDate");

        const today = new Date().toDateString();

        // If a new day started, reset everything
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

            if (remaining <= 0) {
              showLimitReachedAlert();
            } else {
              startTimer(remaining);
            }
          }
        }
      } catch (error) {
        console.log("Error loading settings:", error);
      }
    };

    loadSettings();
  }, []);

  // Show alert and close app
  const showLimitReachedAlert = async () => {
    Alert.alert(
      "Daily Limit Reached",
      "Your daily time limit has been reached. The app will now close.",
      [
        {
          text: "OK",
          onPress: async () => {
            await AsyncStorage.removeItem("dailyStartTime");
            await AsyncStorage.setItem("dailyLimitEnabled", "false");
            setDailyLimitEnabled(false);
            BackHandler.exitApp();
          },
        },
      ],
      { cancelable: false }
    );
  };

  // Start timer
  const startTimer = (durationMs: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      showLimitReachedAlert();
    }, durationMs);
  };

  // Handle toggle change
  const handleToggle = async (value: boolean) => {
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

  // Handle slider value change
  const handleLimitChange = async (value: number) => {
    setDailyLimit(value);
    await AsyncStorage.setItem("dailyLimit", value.toString());
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={10}
        >
          <Ionicons name="arrow-back" size={moderateScale(24)} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Settings
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: verticalScale(40) }}>

        {/* Account */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Account
        </Text>
        <View style={[
          styles.card,
          {
            backgroundColor: theme.colors.card,
            shadowColor: isDark ? "#000" : "#ccc"
          }
        ]}>
          <TouchableOpacity style={[styles.logoutBtn, { backgroundColor: theme.colors.primary }]} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={moderateScale(20)} color="#fff" style={styles.btnIcon} />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>


        {/* App Settings */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          App Preferences
        </Text>
        <View style={[styles.card, { backgroundColor: theme.colors.card, shadowColor: isDark ? "#000" : "#ccc" }]}>

          {/* Dark Mode */}
          <View style={[styles.optionRow, styles.separator, { borderBottomColor: isDark ? '#333' : '#f0f0f0' }]}>
            <View style={styles.optionLeft}>
              <View style={[styles.iconContainer, { backgroundColor: isDark ? '#333' : '#f0f0f0' }]}>
                <Ionicons name="moon" size={moderateScale(18)} color={theme.colors.primary} />
              </View>
              <Text style={[styles.optionText, { color: theme.colors.text }]}>Dark Mode</Text>
            </View>
            <Switch
              value={theme.isDark}
              onValueChange={theme.toggleTheme}
              trackColor={{ false: "#e0e0e0", true: theme.colors.primary }}
              thumbColor={"#fff"}
            />
          </View>

          {/* Notifications */}
          <View style={[styles.optionRow, styles.separator, { borderBottomColor: isDark ? '#333' : '#f0f0f0' }]}>
            <View style={styles.optionLeft}>
              <View style={[styles.iconContainer, { backgroundColor: isDark ? '#333' : '#f0f0f0' }]}>
                <Ionicons name="notifications" size={moderateScale(18)} color={theme.colors.primary} />
              </View>
              <Text style={[styles.optionText, { color: theme.colors.text }]}>
                Notifications
              </Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: "#e0e0e0", true: theme.colors.primary }}
              thumbColor={"#fff"}
            />
          </View>

          {/* Breaking News Alert */}
          <View style={styles.optionRow}>
            <View style={styles.optionLeft}>
              <View style={[styles.iconContainer, { backgroundColor: isDark ? '#333' : '#f0f0f0' }]}>
                <Ionicons name="alert-circle" size={moderateScale(18)} color={theme.colors.primary} />
              </View>
              <Text style={[styles.optionText, { color: theme.colors.text }]}>
                Breaking News
              </Text>
            </View>
            <Switch
              value={breakingAlert}
              onValueChange={setBreakingAlert}
              trackColor={{ false: "#e0e0e0", true: theme.colors.primary }}
              thumbColor={"#fff"}
            />
          </View>
        </View>

        {/* Digital Wellbeing */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Digital Wellbeing
        </Text>
        <View style={[styles.card, { backgroundColor: theme.colors.card, shadowColor: isDark ? "#000" : "#ccc" }]}>
          <View style={styles.optionRow}>
            <View style={styles.optionLeft}>
              <View style={[styles.iconContainer, { backgroundColor: isDark ? '#333' : '#f0f0f0' }]}>
                <Ionicons name="timer" size={moderateScale(18)} color={theme.colors.primary} />
              </View>
              <Text style={[styles.optionText, { color: theme.colors.text }]}>
                Daily Time Limit
              </Text>
            </View>
            <Switch
              value={dailyLimitEnabled}
              onValueChange={handleToggle}
              trackColor={{ false: "#e0e0e0", true: theme.colors.primary }}
              thumbColor={"#fff"}
            />
          </View>

          {dailyLimitEnabled && (
            <View style={styles.sliderContainer}>
              <View style={styles.sliderLabels}>
                <Text style={[styles.sliderLabel, { color: theme.colors.subText }]}>5 min</Text>
                <Text style={[styles.currentLimit, { color: theme.colors.primary }]}>{dailyLimit} min</Text>
                <Text style={[styles.sliderLabel, { color: theme.colors.subText }]}>120 min</Text>
              </View>
              <Slider
                style={{ width: "100%", height: verticalScale(40) }}
                minimumValue={5}
                maximumValue={120}
                step={5}
                value={dailyLimit}
                minimumTrackTintColor={theme.colors.primary}
                maximumTrackTintColor={isDark ? "#444" : "#ddd"}
                thumbTintColor={theme.colors.primary}
                onValueChange={handleLimitChange}
              />
            </View>
          )}
        </View>

        {/* Content */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Content
        </Text>
        <View style={[styles.card, { backgroundColor: theme.colors.card, shadowColor: isDark ? "#000" : "#ccc" }]}>
          <TouchableOpacity
            style={styles.optionRow}
            onPress={() => router.push("/SavedArticles")}
          >
            <View style={styles.optionLeft}>
              <View style={[styles.iconContainer, { backgroundColor: isDark ? '#333' : '#f0f0f0' }]}>
                <Ionicons name="bookmark" size={moderateScale(18)} color={theme.colors.primary} />
              </View>
              <Text style={[styles.optionText, { color: theme.colors.text }]}>
                Saved Articles
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={moderateScale(20)} color={isDark ? "#666" : "#aaa"} />
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: scale(16) },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: verticalScale(40),
    paddingBottom: verticalScale(15),
    marginBottom: verticalScale(10)
  },
  backButton: { padding: 5, marginRight: scale(10) },
  headerTitle: { fontSize: moderateScale(20), fontWeight: "700" },
  sectionTitle: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    marginBottom: verticalScale(8),
    marginTop: verticalScale(16),
    marginLeft: scale(4),
    opacity: 0.8
  },
  card: {
    borderRadius: moderateScale(16),
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(8),
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: verticalScale(12),
  },
  separator: {
    borderBottomWidth: 1,
  },
  optionLeft: { flexDirection: "row", alignItems: "center" },
  iconContainer: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12)
  },
  optionText: { fontSize: moderateScale(16), fontWeight: '500' },
  sliderContainer: {
    marginTop: verticalScale(5),
    paddingTop: verticalScale(10),
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)'
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(-5)
  },
  sliderLabel: { fontSize: moderateScale(12) },
  currentLimit: { fontSize: moderateScale(14), fontWeight: 'bold' },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(12),
    marginVertical: verticalScale(8),
  },
  btnIcon: { marginRight: scale(8) },
  logoutText: { fontSize: moderateScale(16), fontWeight: "bold", color: "#fff" },
});

export default ProfileSettingsScreen;
