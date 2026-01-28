import Ionicons from "@react-native-vector-icons/ionicons";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useReels } from "../context/ReelContext";
import { useTheme } from "../context/ThemeContext";

export default function UploadReels({ route }: any) {
  const navigation = useNavigation<any>();
  const { selected } = route.params || {};
  const [caption, setCaption] = useState("");
  const { isDark, colors } = useTheme();
  const { addReel } = useReels();

  const handleShare = () => {
    if (!selected?.uri) return;

    const newReel = { uri: selected.uri, caption };
    addReel(newReel);

    // Go back to main Reels screen
    navigation.navigate("Main", {
      screen: "Reels",
      params: { newReel },
    });
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
    >
      {/* Back Button */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Ionicons
          name="arrow-back"
          size={26}
          color={colors.text}
        />
      </TouchableOpacity>

      {/* Preview */}
      {selected?.uri && (
        <Image source={{ uri: selected.uri }} style={styles.preview} />
      )}

      {/* Caption Input */}
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.card,
            color: colors.text,
            borderColor: isDark ? "#444" : "#ccc",
          },
        ]}
        placeholder="Write a caption and add hashtags..."
        placeholderTextColor={isDark ? "#aaa" : "#888"}
        value={caption}
        onChangeText={setCaption}
        multiline
      />

      {/* Share Button */}
      <TouchableOpacity
        style={[styles.shareBtn, { backgroundColor: colors.primary }]}
        onPress={handleShare}
      >
        <Text style={{ color: "#FFFFFF", fontWeight: "600", fontSize: 16 }}>
          Share
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  backButton: {
    position: "absolute",
    top: 15,
    left: 15,
    zIndex: 10,
    borderRadius: 25,
    padding: 6,
  },
  preview: {
    width: "100%",
    height: 200,
    marginTop: 50,
    marginBottom: 15,
    borderRadius: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    minHeight: 100,
    textAlignVertical: "top",
  },
  shareBtn: {
    marginTop: 20,
    width: "100%",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
});
