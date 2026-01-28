// ThemeContext.tsx
import React, { createContext, useContext, useState } from "react";
import { Appearance } from "react-native";

const ThemeContext = createContext<any>(null);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemTheme = Appearance.getColorScheme(); // light/dark system default
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => setIsDark(!isDark);

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

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
