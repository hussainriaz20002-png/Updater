import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "@react-native-vector-icons/ionicons";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useReels } from "../../context/ReelContext";
import { useTheme } from "../../context/ThemeContext";

const ProfileScreen = () => {
  const navigation = useNavigation<any>();
  const { isDark, colors } = useTheme();
  const { userReels } = useReels();
  const isFocused = useIsFocused();

  const [name, setName] = useState("User_Name");
  const [bio, setBio] = useState("Bio....");
  const [profileImage, setProfileImage] = useState("https://via.placeholder.com/120");

  // Load profile info from AsyncStorage
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const storedName = await AsyncStorage.getItem("user_name");
        const storedBio = await AsyncStorage.getItem("user_bio");
        const storedImage = await AsyncStorage.getItem("user_image");
        if (storedName) setName(storedName);
        if (storedBio) setBio(storedBio);
        if (storedImage) setProfileImage(storedImage);
      } catch (error) {
        console.log("Error loading profile:", error);
      }
    };
    if (isFocused) loadProfile();
  }, [isFocused]);

  const renderReel = ({ item }: any) => (
    <TouchableOpacity
      style={styles.reelBox}
      onPress={() =>
        navigation.navigate("Reels", { fromProfile: true, selectedReel: item })
      }
    >
      <Image source={{ uri: item.uri }} style={styles.reelThumbnail} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Profile</Text>
        <TouchableOpacity
          style={styles.menuIcon}
          onPress={() => navigation.navigate("ProfileSetting")}
        >
          <Ionicons name="ellipsis-vertical" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <Image
          source={{ uri: profileImage }}
          style={styles.avatar}
        />
      </View>

      <Text style={[styles.username, { color: colors.text }]}>{name}</Text>
      <Text style={[styles.bio, { color: isDark ? "#aaa" : "#666" }]}>{bio}</Text>

      <TouchableOpacity
        style={[styles.editBtn, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate("EditProfile", { name, bio, profileImage })}
      >
        <Text style={styles.editText}>Edit profile</Text>
      </TouchableOpacity>

      {/* Reels Grid */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Reels</Text>
      {userReels.length === 0 ? (
        <Text style={[styles.noReels, { color: isDark ? "#aaa" : "#777" }]}>
          No reels uploaded yet.
        </Text>
      ) : (
        <FlatList
          data={userReels}
          renderItem={renderReel}
          keyExtractor={(_, i) => i.toString()}
          numColumns={3}
          contentContainerStyle={styles.reelGrid}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
    marginBottom: 15,
  },
  title: { fontSize: 18, fontWeight: "bold" },
  menuIcon: { position: "absolute", right: 0 },
  avatarContainer: { alignItems: "center", marginVertical: 20 },
  avatar: { width: 80, height: 80, borderRadius: 60, backgroundColor: "#ccc" },
  username: { fontSize: 16, fontWeight: "bold", textAlign: "center" },
  bio: { fontSize: 14, textAlign: "center", marginBottom: 20 },
  editBtn: {
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: "center",
    alignSelf: "center",
    width: "60%",
  },
  editText: { fontSize: 14, fontWeight: "bold", color: "#fff" },
  sectionTitle: { marginTop: 20, fontSize: 16, fontWeight: "600" },
  noReels: { textAlign: "center", marginTop: 10 },
  reelGrid: { marginTop: 10 },
  reelBox: { flex: 1 / 3, aspectRatio: 1, margin: 2 },
  reelThumbnail: { width: "100%", height: "100%" },
});

export default ProfileScreen;
