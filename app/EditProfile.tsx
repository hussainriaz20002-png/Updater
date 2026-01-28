import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { useTheme } from "../context/ThemeContext";

const EditProfile = () => {
  const { colors, isDark } = useTheme();

  // Use useLocalSearchParams from expo-router
  const params = useLocalSearchParams();
  const initialName = params.name as string || "";
  const initialBio = params.bio as string || "";
  const initialImage = params.profileImage as string || "https://via.placeholder.com/120";


  const [name, setName] = useState(initialName);
  const [bio, setBio] = useState(initialBio);
  const [imageUri, setImageUri] = useState(initialImage);
  const [modalVisible, setModalVisible] = useState(false);

  //  Pick image from camera or gallery
  const pickImage = async (source: "camera" | "gallery") => {
    try {
      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      };

      let result;
      if (source === "camera") {
        // Request camera permissions first
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          alert('Sorry, we need camera permissions to make this work!');
          return;
        }
        result = await ImagePicker.launchCameraAsync(options);
      } else {
        result = await ImagePicker.launchImageLibraryAsync(options);
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Image picker error:", error);
    } finally {
      setModalVisible(false);
    }
  };

  //  Save data
  const handleSave = async () => {
    try {
      await AsyncStorage.setItem("user_name", name);
      await AsyncStorage.setItem("user_bio", bio);
      if (imageUri) await AsyncStorage.setItem("user_image", imageUri);
      router.back();
    } catch (error) {
      console.log("Error saving profile:", error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            hitSlop={10}
          >
            <Ionicons name="arrow-back" size={moderateScale(24)} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Edit Profile</Text>
          <TouchableOpacity onPress={handleSave}>
            <Text style={[styles.headerSave, { color: colors.primary }]}>Done</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Picture */}
        <View style={styles.avatarContainer}>
          <View style={[styles.avatarWrapper, { borderColor: colors.card, shadowColor: colors.primary }]}>
            <Image
              source={{ uri: imageUri }}
              style={[styles.avatar, { backgroundColor: isDark ? '#333' : '#eee' }]}
            />
            <TouchableOpacity onPress={() => setModalVisible(true)} style={[styles.cameraBadge, { backgroundColor: colors.primary, borderColor: colors.background }]}>
              <Ionicons name="camera" size={moderateScale(16)} color="#fff" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Text style={[styles.changePicText, { color: colors.primary }]}>
              Change Profile Picture
            </Text>
          </TouchableOpacity>
        </View>

        {/* Input Fields Container */}
        <View style={styles.formSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Public Information</Text>
          <View style={[
            styles.card,
            {
              backgroundColor: colors.card,
              shadowColor: isDark ? "#000" : "#ccc"
            }
          ]}>
            <Text style={[styles.label, { color: colors.text }]}>Full Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              style={[
                styles.input,
                {
                  color: colors.text,
                  borderColor: isDark ? '#444' : '#e0e0e0',
                  backgroundColor: isDark ? '#333' : '#f9f9f9',
                },
              ]}
              placeholder="Enter your name"
              placeholderTextColor={isDark ? "#666" : "#aaa"}
            />

            <Text style={[styles.label, { color: colors.text }]}>Bio</Text>
            <TextInput
              value={bio}
              onChangeText={setBio}
              style={[
                styles.input,
                styles.textArea,
                {
                  color: colors.text,
                  borderColor: isDark ? '#444' : '#e0e0e0',
                  backgroundColor: isDark ? '#333' : '#f9f9f9',
                },
              ]}
              multiline
              placeholder="Write something about yourself"
              placeholderTextColor={isDark ? "#666" : "#aaa"}
              textAlignVertical="top"
            />
          </View>
        </View>
      </ScrollView>

      {/* Bottom Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={[styles.bottomSheet, { backgroundColor: isDark ? '#222' : '#fff' }]}>
            <View style={[styles.dragHandle, { backgroundColor: isDark ? '#444' : '#ddd' }]} />
            <Text style={[styles.modalTitle, { color: colors.text }]}>Change Profile Picture</Text>

            <TouchableOpacity
              style={[styles.modalButton, { borderBottomColor: isDark ? '#333' : '#eee' }]}
              onPress={() => pickImage("camera")}
            >
              <Ionicons name="camera-outline" size={moderateScale(20)} color={colors.text} style={{ marginRight: scale(10) }} />
              <Text style={[styles.modalText, { color: colors.text }]}>Take Photo</Text>
            </TouchableOpacity>


            <TouchableOpacity
              style={[styles.modalButton, { borderBottomColor: isDark ? '#333' : '#eee' }]}
              onPress={() => pickImage("gallery")}
            >
              <Ionicons name="images-outline" size={moderateScale(20)} color={colors.text} style={{ marginRight: scale(10) }} />
              <Text style={[styles.modalText, { color: colors.text }]}>Choose from Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={[styles.modalText, { color: "#FF3B30", fontWeight: '600' }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: verticalScale(40),
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(15),
  },
  backButton: {
    padding: 5
  },
  title: {
    fontSize: moderateScale(18),
    fontWeight: "700",
  },
  headerSave: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    padding: 5
  },
  avatarContainer: {
    alignItems: "center",
    marginVertical: verticalScale(30),
  },
  avatarWrapper: {
    position: 'relative',
    borderRadius: moderateScale(60),
    borderWidth: 2,
    padding: 3,
    elevation: 5,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5
  },
  avatar: {
    width: moderateScale(110),
    height: moderateScale(110),
    borderRadius: moderateScale(55),
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    padding: moderateScale(8),
    borderRadius: moderateScale(20),
    borderWidth: 3,
  },
  changePicText: {
    marginTop: verticalScale(12),
    fontSize: moderateScale(14),
    fontWeight: '600',
  },
  formSection: {
    paddingHorizontal: scale(20),
    marginBottom: verticalScale(30)
  },
  sectionTitle: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    marginBottom: verticalScale(10),
    marginLeft: scale(4),
    opacity: 0.7,
    textTransform: 'uppercase'
  },
  card: {
    padding: moderateScale(16),
    borderRadius: moderateScale(16),
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  label: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    marginBottom: verticalScale(8),
    marginLeft: scale(4)
  },
  input: {
    borderWidth: 1,
    borderRadius: moderateScale(12),
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
    fontSize: moderateScale(16),
    marginBottom: verticalScale(20),
  },
  textArea: {
    height: verticalScale(100),
    paddingTop: verticalScale(12)
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  bottomSheet: {
    padding: moderateScale(20),
    borderTopLeftRadius: moderateScale(24),
    borderTopRightRadius: moderateScale(24),
    paddingBottom: verticalScale(40)
  },
  dragHandle: {
    width: scale(40),
    height: verticalScale(4),
    borderRadius: moderateScale(2),
    alignSelf: 'center',
    marginBottom: verticalScale(20)
  },
  modalTitle: {
    fontSize: moderateScale(16),
    fontWeight: "700",
    textAlign: "center",
    marginBottom: verticalScale(20),
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(16),
    borderBottomWidth: 1,
  },
  modalText: {
    fontSize: moderateScale(16),
  },
  cancelButton: {
    borderBottomWidth: 0,
    marginTop: verticalScale(10),
    justifyContent: 'center'
  },
});
