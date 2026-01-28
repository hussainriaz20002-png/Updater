import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FlashList } from "@shopify/flash-list";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { useReels } from "../../context/ReelContext";
import { useTheme } from "../../context/ThemeContext";

const ProfileScreen = () => {
  const router = useRouter();
  const { isDark, colors } = useTheme();
  const { userReels } = useReels();

  const [name, setName] = useState("User_Name");
  const [bio, setBio] = useState("Bio....");
  const [profileImage, setProfileImage] = useState("https://via.placeholder.com/120");

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

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [])
  );

  const renderReel = ({ item }: any) => (
    <TouchableOpacity
      style={styles.reelBox}
      activeOpacity={0.8}
      onPress={() =>
        router.push({ pathname: "/(tabs)/Reels", params: { fromProfile: "true", selectedReelUri: item.uri } })
      }
    >
      <Image source={{ uri: item.uri }} style={styles.reelThumbnail} resizeMode="cover" />
      <View style={styles.reelOverlay}>
        <Ionicons name="play-outline" size={moderateScale(16)} color="#fff" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Header */}
      <View style={styles.header}>
        <View style={{ width: scale(24) }} />
        <Text style={[styles.title, { color: colors.text }]}>Profile</Text>
        <TouchableOpacity
          style={styles.menuIcon}
          hitSlop={10}
          onPress={() => router.push("/ProfileSetting")}
        >
          <Ionicons name="settings-outline" size={moderateScale(24)} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1 }}>
        <FlashList
          ListHeaderComponent={
            <View style={styles.profileInfo}>
              {/* Avatar */}
              <View style={[
                styles.avatarContainer,
                {
                  shadowColor: colors.primary,
                  borderColor: colors.card
                }
              ]}>
                <Image
                  source={{ uri: profileImage }}
                  style={styles.avatar}
                />
                <TouchableOpacity
                  style={[styles.editBadge, { backgroundColor: colors.primary }]}
                  onPress={() => router.push({ pathname: "/EditProfile", params: { name, bio, profileImage } })}
                >
                  <Ionicons name="pencil" size={moderateScale(12)} color="#fff" />
                </TouchableOpacity>
              </View>

              <Text style={[styles.username, { color: colors.text }]}>{name}</Text>
              <Text style={[styles.bio, { color: isDark ? "#aaa" : "#666" }]}>{bio}</Text>

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: colors.text }]}>{userReels.length}</Text>
                  <Text style={[styles.statLabel, { color: isDark ? "#888" : "#999" }]}>Reels</Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: isDark ? '#333' : '#eee' }]} />
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: colors.text }]}>120</Text>
                  <Text style={[styles.statLabel, { color: isDark ? "#888" : "#999" }]}>Followers</Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: isDark ? '#333' : '#eee' }]} />
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: colors.text }]}>45</Text>
                  <Text style={[styles.statLabel, { color: isDark ? "#888" : "#999" }]}>Following</Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.editBtn, { backgroundColor: colors.primary }]}
                activeOpacity={0.8}
                onPress={() => router.push({ pathname: "/EditProfile", params: { name, bio, profileImage } })}
              >
                <Text style={styles.editText}>Edit Profile</Text>
              </TouchableOpacity>

              {/* Tab Indicator */}
              <View style={styles.tabRow}>
                <View style={[styles.activeTab, { borderBottomColor: colors.text }]}>
                  <Ionicons name="grid-outline" size={moderateScale(24)} color={colors.text} />
                </View>
                <View style={styles.inactiveTab}>
                  <Ionicons name="bookmark-outline" size={moderateScale(24)} color={isDark ? "#555" : "#ccc"} />
                </View>
              </View>
            </View>
          }
          data={userReels}
          renderItem={renderReel}
          keyExtractor={(_, i) => i.toString()}
          numColumns={3}
          estimatedItemSize={moderateScale(120)}
          contentContainerStyle={styles.reelGrid}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="videocam-outline" size={moderateScale(40)} color={isDark ? "#333" : "#eee"} />
              <Text style={[styles.noReels, { color: isDark ? "#aaa" : "#777" }]}>
                No reels yet
              </Text>
            </View>
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: verticalScale(40),
    paddingBottom: verticalScale(10),
    paddingHorizontal: scale(20),
  },
  title: {
    fontSize: moderateScale(18),
    fontWeight: "700",
    letterSpacing: 0.5
  },
  menuIcon: {
    padding: 5
  },
  profileInfo: {
    alignItems: 'center',
    paddingTop: verticalScale(10),
  },
  avatarContainer: {
    marginBottom: verticalScale(16),
    elevation: 5,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    borderWidth: 2,
    borderRadius: moderateScale(60),
    padding: 2,
  },
  avatar: {
    width: moderateScale(100),
    height: moderateScale(100),
    borderRadius: moderateScale(50),
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: moderateScale(30),
    height: moderateScale(30),
    borderRadius: moderateScale(15),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff'
  },
  username: {
    fontSize: moderateScale(20),
    fontWeight: "700",
    marginBottom: verticalScale(4)
  },
  bio: {
    fontSize: moderateScale(14),
    textAlign: "center",
    marginBottom: verticalScale(20),
    paddingHorizontal: scale(40),
    lineHeight: moderateScale(20)
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(24),
    width: '100%'
  },
  statItem: {
    alignItems: 'center',
    width: scale(80),
  },
  statValue: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    marginBottom: verticalScale(2)
  },
  statLabel: {
    fontSize: moderateScale(12),
  },
  statDivider: {
    width: 1,
    height: verticalScale(24)
  },
  editBtn: {
    borderRadius: moderateScale(24),
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(30),
    alignItems: "center",
    alignSelf: "center",
    shadowColor: "#3A7BD5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: verticalScale(20),
  },
  editText: {
    fontSize: moderateScale(14),
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.5,
  },
  tabRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    marginTop: verticalScale(10)
  },
  activeTab: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: verticalScale(10),
    borderBottomWidth: 2,
  },
  inactiveTab: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: verticalScale(10),
  },
  reelGrid: {
    paddingTop: 2
  },
  reelBox: {
    flex: 1,
    aspectRatio: 0.8,
    margin: 1,
    position: 'relative'
  },
  reelThumbnail: {
    width: "100%",
    height: "100%",
  },
  reelOverlay: {
    position: 'absolute',
    bottom: 5,
    left: 5,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: verticalScale(40),
    opacity: 0.7
  },
  noReels: {
    textAlign: "center",
    marginTop: verticalScale(10),
    fontSize: moderateScale(14)
  },
});

export default ProfileScreen;
