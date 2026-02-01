import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

interface TabBarIconProps {
  focused: boolean;
  name: React.ComponentProps<typeof Ionicons>["name"];
  color: string;
  size: number;
}

const AnimatedTabBarIcon: React.FC<TabBarIconProps> = ({
  focused,
  name,
  color,
  size,
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  useEffect(() => {
    if (focused) {
      scale.value = withSpring(1.2, { damping: 10, stiffness: 100 });
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      scale.value = withSpring(1, { damping: 10, stiffness: 100 });
      opacity.value = withTiming(0.8, { duration: 200 }); // Slight fade for inactive
    }
  }, [focused]);

  return (
    <Animated.View style={animatedStyle}>
      <Ionicons name={name} size={size} color={color} />
    </Animated.View>
  );
};

export default AnimatedTabBarIcon;
