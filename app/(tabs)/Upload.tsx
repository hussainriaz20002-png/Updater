import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { useTheme } from "../../context/ThemeContext";

const UploadScreen = () => {
  const { colors, isDark } = useTheme();

  const pickVideo = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["videos"],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const selectedUri = result.assets[0].uri;
      router.push({
        pathname: "/UploadReels",
        params: { selected: JSON.stringify({ uri: selectedUri }) },
      });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Upload Reel</Text>
      </View>

      <View style={styles.content}>
        <View style={[
          styles.uploadCard,
          {
            backgroundColor: colors.card,
            shadowColor: isDark ? "#000" : "#ccc",
          }
        ]}>
          <View style={[styles.iconContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F0F5FF' }]}>
            <Ionicons name="cloud-upload-outline" size={moderateScale(60)} color={colors.primary} />
          </View>

          <Text style={[styles.title, { color: colors.text }]}>
            Upload a New Reel
          </Text>
          <Text style={[styles.subtitle, { color: isDark ? "#aaa" : "#666" }]}>
            Choose a video from your gallery to share with your audience
          </Text>

          <TouchableOpacity
            style={[styles.uploadButton, { backgroundColor: colors.primary }]}
            activeOpacity={0.8}
            onPress={pickVideo}
          >
            <Ionicons name="images-outline" size={moderateScale(20)} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.buttonText}>
              Pick from Gallery
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default UploadScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: verticalScale(50),
    paddingBottom: verticalScale(20),
    paddingHorizontal: scale(20),
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: moderateScale(20),
    fontWeight: "700",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(80),
  },
  uploadCard: {
    borderRadius: moderateScale(24),
    padding: moderateScale(30),
    alignItems: 'center',
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  iconContainer: {
    width: moderateScale(120),
    height: moderateScale(120),
    borderRadius: moderateScale(60),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(24),
  },
  title: {
    fontSize: moderateScale(22),
    fontWeight: "800",
    marginBottom: verticalScale(10),
    textAlign: "center",
  },
  subtitle: {
    fontSize: moderateScale(15),
    lineHeight: moderateScale(22),
    textAlign: "center",
    marginBottom: verticalScale(30),
    paddingHorizontal: scale(10),
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(30),
    paddingVertical: verticalScale(16),
    borderRadius: moderateScale(30),
    elevation: 4,
    shadowColor: "#3A7BD5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonText: {
    fontSize: moderateScale(16),
    fontWeight: "700",
    color: "#fff",
  },
});
