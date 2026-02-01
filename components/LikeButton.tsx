import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { useTheme } from "../context/ThemeContext";

interface LikeButtonProps {
  articleId: string;
  articleTitle?: string;
  userId: string;
  initialLiked: boolean;
  initialLikeCount: number;
  onLikeChange?: (liked: boolean, count: number) => void;
}

export default function LikeButton({
  articleId,
  articleTitle,
  userId,
  initialLiked,
  initialLikeCount,
  onLikeChange,
}: LikeButtonProps) {
  const { colors, isDark } = useTheme();
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    setLiked(initialLiked);
    setLikeCount(initialLikeCount);
  }, [initialLiked, initialLikeCount]);

  const handleLike = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const newLiked = !liked;
      const newCount = newLiked ? likeCount + 1 : likeCount - 1;
      setLiked(newLiked);
      setLikeCount(newCount);

      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.4,
          friction: 4,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          useNativeDriver: true,
        }),
      ]).start();

      if (onLikeChange) {
        onLikeChange(newLiked, newCount);
      }
    } catch (error) {
      console.error("Error liking:", error);
      setLiked(!liked);
      setLikeCount(liked ? likeCount - 1 : likeCount + 1);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: liked
            ? isDark
              ? "#331111"
              : "#FFF5F5"
            : isDark
              ? "#222"
              : "#f8f9fa",
          borderColor: liked ? colors.primary : "transparent",
        },
      ]}
      activeOpacity={0.7}
      onPress={handleLike}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Ionicons
          name={liked ? "heart" : "heart-outline"}
          size={moderateScale(20)} // Slightly smaller for premium look
          color={liked ? colors.primary : colors.text}
        />
      </Animated.View>

      <Text
        style={[
          styles.count,
          {
            color: liked ? colors.primary : colors.text,
            fontWeight: liked ? "700" : "500",
          },
        ]}
      >
        {likeCount > 0 ? likeCount : "Like"}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(20),
    borderWidth: 1,
    minWidth: scale(80),
    justifyContent: "center",
  },
  count: {
    fontSize: moderateScale(14),
    marginLeft: scale(8),
    letterSpacing: 0.5,
  },
});
