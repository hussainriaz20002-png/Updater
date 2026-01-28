import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
                    height: (Platform.OS === 'ios' ? 55 : 60) + insets.bottom,
                    paddingBottom: insets.bottom + 5,
                    paddingTop: 5,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: "500",
                    paddingBottom: 5
                },
            }}
        >
            <Tabs.Screen
                name="Home"
                options={{
                    tabBarLabel: "Home",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="Column"
                options={{
                    tabBarLabel: "Column",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="document-text-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="Upload"
                options={{
                    tabBarLabel: "Upload",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="add-circle-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="Reels"
                options={{
                    tabBarLabel: "Reels",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="play-circle-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="Profile"
                options={{
                    tabBarLabel: "Profile",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person-outline" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
