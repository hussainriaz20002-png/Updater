import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Appearance } from "react-native";

const ThemeContext = createContext<any>(null);
const THEME_STORAGE_KEY = "@user_theme_preference";

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemTheme = Appearance.getColorScheme(); // light/dark system default
  const [isDark, setIsDark] = useState(systemTheme === "dark");

  // Load saved theme on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme !== null) {
          setIsDark(savedTheme === "dark");
        }
      } catch (error) {
        console.error("Error loading theme preference:", error);
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    try {
      const newMode = !isDark;
      setIsDark(newMode);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode ? "dark" : "light");
    } catch (error) {
      console.error("Error saving theme preference:", error);
    }
  };

  const theme = {
    isDark,
    colors: {
      background: isDark ? "#000" : "#fff",
      text: isDark ? "#fff" : "#000",
      subText: isDark ? "#fff" : "#555",
      card: isDark ? "#1e1e1e" : "#f9f9f9",
      primary: "#007BFF",
    },
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
