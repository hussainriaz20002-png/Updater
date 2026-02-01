// import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AnimatedTabBarIcon from "../../components/TabBarIcon";
import { useTheme } from "../../context/ThemeContext";

export default function TabsLayout() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: isDark ? "#888" : "#999",
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: isDark ? "#333" : "#e0e0e0",
          height: (Platform.OS === "ios" ? 60 : 65) + insets.bottom, // Slightly taller for premium feel
          paddingBottom: insets.bottom + 10,
          paddingTop: 10,
          borderTopWidth: 0.5,
          elevation: 0, // Remove default shadow for custom feel
          shadowOpacity: 0.05,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: -4 },
        },
        tabBarShowLabel: false, // Remove labels for cleaner premium look
      }}
    >
      <Tabs.Screen
        name="Home"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabBarIcon
              focused={focused}
              name={focused ? "home" : "home-outline"}
              color={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="Column"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabBarIcon
              focused={focused}
              name={focused ? "document-text" : "document-text-outline"}
              color={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="Chat"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabBarIcon
              focused={focused}
              name={focused ? "chatbubbles" : "chatbubbles-outline"}
              color={color}
              size={24}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="Profile"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabBarIcon
              focused={focused}
              name={focused ? "person" : "person-outline"}
              color={color}
              size={24}
            />
          ),
        }}
      />
    </Tabs>
  );
}
