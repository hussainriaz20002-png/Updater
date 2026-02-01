import React from "react";
import { Image, StyleSheet } from "react-native";

const defaultAvatarImage = require("../assets/images/DEFAULTAVATAR.png");

interface DefaultAvatarProps {
  name?: string;
  size?: number;
  source?: string | null;
}

export default function DefaultAvatar({
  name,
  size = 50,
  source,
}: DefaultAvatarProps) {
  // Check if source is a valid non-empty string
  const hasValidSource =
    source && typeof source === "string" && source.trim().length > 0;

  return (
    <Image
      source={hasValidSource ? { uri: source } : defaultAvatarImage}
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
      resizeMode="cover"
    />
  );
}

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: "#f0f0f0",
  },
});
