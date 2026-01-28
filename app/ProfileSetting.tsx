import AsyncStorage from "@react-native-async-storage/async-storage";
import Slider from "@react-native-community/slider";
import Ionicons from "@react-native-vector-icons/ionicons";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  BackHandler,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../context/ThemeContext";

const ProfileSettingsScreen = () => {
  const navigation = useNavigation<any>();
  const theme = useTheme();

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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Profile Settings
        </Text>
      </View>

      {/* Preferences */}
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Preferences
      </Text>
      <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
        {/* Dark Mode */}
        <View style={styles.optionRow}>
          <View style={styles.optionLeft}>
            <Ionicons name="moon" size={20} color={theme.colors.primary} style={styles.icon} />
            <Text style={[styles.optionText, { color: theme.colors.text }]}>Dark Mode</Text>
          </View>
          <Switch
            value={theme.isDark}
            onValueChange={theme.toggleTheme}
            trackColor={{ false: "#ccc", true: theme.colors.primary }}
            thumbColor={"#fff"}
          />
        </View>

        {/* Notifications */}
        <View style={styles.optionRow}>
          <View style={styles.optionLeft}>
            <Ionicons name="notifications" size={20} color={theme.colors.primary} style={styles.icon} />
            <Text style={[styles.optionText, { color: theme.colors.text }]}>
              Notifications
            </Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: "#ccc", true: theme.colors.primary }}
            thumbColor={"#fff"}
          />
        </View>

        {/* Breaking News Alert */}
        <View style={styles.optionRow}>
          <View style={styles.optionLeft}>
            <Ionicons name="alert-circle" size={20} color={theme.colors.primary} style={styles.icon} />
            <Text style={[styles.optionText, { color: theme.colors.text }]}>
              Breaking News Alert
            </Text>
          </View>
          <Switch
            value={breakingAlert}
            onValueChange={setBreakingAlert}
            trackColor={{ false: "#ccc", true: theme.colors.primary }}
            thumbColor={"#fff"}
          />
        </View>
      </View>

      {/* Daily Time Limit */}
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Daily Time Limit
      </Text>
      <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
        <View style={styles.optionRow}>
          <View style={styles.optionLeft}>
            <Ionicons name="time" size={20} color={theme.colors.primary} style={styles.icon} />
            <Text style={[styles.optionText, { color: theme.colors.text }]}>
              Set Daily Limit
            </Text>
          </View>
          <Switch
            value={dailyLimitEnabled}
            onValueChange={handleToggle}
            trackColor={{ false: "#ccc", true: theme.colors.primary }}
            thumbColor={"#fff"}
          />
        </View>

        {dailyLimitEnabled && (
          <>
            <Slider
              style={{ width: "100%", height: 40 }}
              minimumValue={5}
              maximumValue={120}
              step={5}
              value={dailyLimit}
              minimumTrackTintColor={theme.colors.primary}
              maximumTrackTintColor="#ddd"
              thumbTintColor={theme.colors.primary}
              onValueChange={handleLimitChange}
            />
            <Text style={[styles.timeLabel, { color: theme.colors.subText }]}>
              {dailyLimit} min
            </Text>
          </>
        )}
      </View>

      {/* Saved */}
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Saved
      </Text>
      <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
        <TouchableOpacity
          style={styles.optionRow}
          onPress={() => navigation.navigate("SavedArticles")}
        >
          <View style={styles.optionLeft}>
            <Ionicons name="bookmark" size={20} color={theme.colors.primary} style={styles.icon} />
            <Text style={[styles.optionText, { color: theme.colors.text }]}>
              View Saved Articles
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Account */}
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Account
      </Text>
      <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.subHeading, { color: theme.colors.text }]}>
          Account Status
        </Text>
        <TouchableOpacity style={[styles.logoutBtn, { backgroundColor: theme.colors.primary }]}>
          <Ionicons name="log-out" size={18} color="#fff" style={styles.icon} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  headerTitle: { fontSize: 18, fontWeight: "bold", marginLeft: 10 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 8, marginTop: 16 },
  card: {
    borderRadius: 10,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  optionLeft: { flexDirection: "row", alignItems: "center" },
  optionText: { fontSize: 15 },
  icon: { marginRight: 10 },
  timeLabel: { textAlign: "center", marginTop: 10, fontSize: 14, fontWeight: "600" },
  subHeading: { fontSize: 14, fontWeight: "bold", marginBottom: 12 },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  logoutText: { fontSize: 15, fontWeight: "bold", color: "#fff" },
});

export default ProfileSettingsScreen;
