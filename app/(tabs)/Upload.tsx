import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../../context/ThemeContext";

const UploadScreen = () => {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();

  const [media, setMedia] = useState<any[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    requestPermission();
  }, []);

  const requestPermission = async () => {
    if (Platform.OS === "android") {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
        {
          title: "Gallery Permission",
          message: "App needs access to your gallery",
          buttonPositive: "OK",
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        loadMedia();
      }
    } else {
      loadMedia();
    }
  };

  const loadMedia = async () => {
    try {
      const result = await CameraRoll.getPhotos({
        first: 50,
        assetType: "Videos",
      });
      setMedia(result.edges);
    } catch (err) {
      console.log(err);
    }
  };

  const toggleSelect = (uri: string) => {
    setSelected((prev) => (prev === uri ? null : uri));
  };

  const renderItem = ({ item }: { item: any }) => {
    const node = item.node.image;
    const type = item.node.type;
    const isSelected = selected === node.uri;

    return (
      <TouchableOpacity
        onPress={() => toggleSelect(node.uri)}
        style={styles.mediaBox}
      >
        <Image source={{ uri: node.uri }} style={styles.media} />

        {type?.startsWith("video") && (
          <View style={styles.playIconContainer}>
            <Text style={styles.playIcon}>▶</Text>
          </View>
        )}

        {isSelected && (
          <View
            style={[
              styles.tickCircle,
              { backgroundColor: colors.primary },
            ]}
          >
            <Text style={styles.tickText}>✔</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const handleNext = () => {
    if (!selected) {
      Alert.alert("Selection Required", "Please select a reel before proceeding.");
      return;
    }
    navigation.navigate("UploadReels", { selected: { uri: selected } });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { backgroundColor: colors.card },
        ]}
      >
        <Text style={[styles.headerTitle, { color: colors.text }]}>New Reel</Text>
        <TouchableOpacity
          style={[styles.nextButton, { backgroundColor: colors.primary }]}
          onPress={handleNext}
        >
          <Text style={[styles.nextText, { color: colors.background }]}>Next</Text>
        </TouchableOpacity>
      </View>

      {/* Gallery */}
      <FlatList
        data={media}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        numColumns={3}
        contentContainerStyle={styles.galleryGrid}
      />
    </View>
  );
};

export default UploadScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  headerTitle: { fontSize: 18, fontWeight: "600" },
  nextButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
  },
  nextText: { fontWeight: "600" },
  galleryGrid: { paddingVertical: 8 },
  mediaBox: { flex: 1, margin: 1, position: "relative" },
  media: { width: 120, height: 120 },
  playIconContainer: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  playIcon: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  tickCircle: {
    position: "absolute",
    top: 5,
    right: 5,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  tickText: { color: "white", fontWeight: "bold", fontSize: 14 },
});
