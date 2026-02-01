import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { moderateScale } from "react-native-size-matters";
import { useTheme } from "../context/ThemeContext";

const Dot = ({ delay }: { delay: number }) => {
  const { colors, isDark } = useTheme();
  const opacity = useSharedValue(0.3);
  const translateY = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 400 }),
          withTiming(0.3, { duration: 400 }),
        ),
        -1,
        true,
      ),
    );
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-4, { duration: 400 }),
          withTiming(0, { duration: 400 }),
        ),
        -1,
        true,
      ),
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
      backgroundColor: isDark ? "#888" : "#555",
    };
  });

  return <Animated.View style={[styles.dot, animatedStyle]} />;
};

const TypingIndicator = () => {
  const { isDark, colors } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? "#333" : "#f0f0f0",
          borderBottomLeftRadius: 2, // Match otherMessage style in Chat.tsx
        },
      ]}
    >
      <Dot delay={0} />
      <Dot delay={200} />
      <Dot delay={400} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(12),
    borderRadius: moderateScale(16),
    marginBottom: moderateScale(12),
    marginLeft: moderateScale(16), // Match list padding
    gap: 4,
    width: moderateScale(60),
    justifyContent: "center",
  },
  dot: {
    width: moderateScale(6),
    height: moderateScale(6),
    borderRadius: moderateScale(3),
  },
});

export default TypingIndicator;
