import { Ionicons } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import React from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import AnimatedTabBarIcon from "./TabBarIcon";

const CustomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {/* Split Background Layer */}
      <View
        style={[
          styles.backgroundLayer,
          { height: (Platform.OS === "ios" ? 60 : 65) + insets.bottom },
        ]}
      >
        <View
          style={[
            styles.backgroundSide,
            {
              backgroundColor: colors.card,
              borderTopColor: isDark ? "#333" : "#e0e0e0",
              borderTopWidth: 0.5,
              borderTopRightRadius: 20,
            },
          ]}
        />
        <View style={styles.backgroundCenter} />
        <View
          style={[
            styles.backgroundSide,
            {
              backgroundColor: colors.card,
              borderTopColor: isDark ? "#333" : "#e0e0e0",
              borderTopWidth: 0.5,
              borderTopLeftRadius: 20,
            },
          ]}
        />
      </View>

      {/* Buttons Layer */}
      <View
        style={[
          styles.buttonsContainer,
          {
            height: (Platform.OS === "ios" ? 60 : 65) + insets.bottom,
            paddingBottom: insets.bottom,
          },
        ]}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            });
          };

          // Center Button (Upload)
          if (index === 2) {
            return (
              <View
                key={route.key}
                style={styles.centerButtonContainer}
                pointerEvents="box-none"
              >
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={onPress}
                  onLongPress={onLongPress}
                  style={[
                    styles.uploadButton,
                    {
                      backgroundColor: colors.primary,
                      shadowColor: colors.primary,
                    },
                  ]}
                >
                  <Ionicons name="add" size={32} color="#fff" />
                </TouchableOpacity>
              </View>
            );
          }

          // Standard Buttons
          let iconName: React.ComponentProps<typeof Ionicons>["name"] = "home";
          if (route.name === "Home")
            iconName = isFocused ? "home" : "home-outline";
          else if (route.name === "Column")
            iconName = isFocused ? "document-text" : "document-text-outline";
          else if (route.name === "Reels")
            iconName = isFocused ? "play-circle" : "play-circle-outline";
          else if (route.name === "Profile")
            iconName = isFocused ? "person" : "person-outline";

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarButtonTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabButton}
            >
              <AnimatedTabBarIcon
                focused={isFocused}
                name={iconName}
                color={isFocused ? colors.primary : isDark ? "#888" : "#999"}
                size={24}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 0,
  },
  backgroundLayer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
  },
  backgroundSide: {
    flex: 2,
  },
  backgroundCenter: {
    flex: 1, // Determines gap width
  },
  buttonsContainer: {
    flexDirection: "row",
    alignItems: "center", // Align items vertically
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  centerButtonContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  uploadButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 50, // Floating height
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
});

export default CustomTabBar;
