import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "@react-native-vector-icons/ionicons";
import { useNavigation, useRoute, useTheme } from "@react-navigation/native";
import React, { useState } from "react";
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";

const EditProfile = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { colors } = useTheme();

  const { name: initialName, bio: initialBio, profileImage: initialImage } =
    route.params || {
      name: "",
      bio: "",
      profileImage: "https://via.placeholder.com/120",
    };

  const [name, setName] = useState(initialName);
  const [bio, setBio] = useState(initialBio);
  const [imageUri, setImageUri] = useState(initialImage);
  const [modalVisible, setModalVisible] = useState(false);

  //  Pick image from camera or gallery
  const pickImage = async (source: "camera" | "gallery") => {
    try {
      const options: any = {
        mediaType: "photo",
        maxWidth: 500,
        maxHeight: 500,
        quality: 0.7,
      };

      let result;
      if (source === "camera") {
        result = await launchCamera(options);
      } else {
        result = await launchImageLibrary(options);
      }

      if (result?.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        if (uri) {
          setImageUri(uri);
        }
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
      navigation.goBack();
    } catch (error) {
      console.log("Error saving profile:", error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Edit Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Profile Picture */}
      <View style={styles.avatarContainer}>
        <Image
          source={{ uri: imageUri }}
          style={[styles.avatar, { backgroundColor: colors.border }]}
        />
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Text style={[styles.changePicText, { color: colors.primary }]}>
            change profile picture
          </Text>
        </TouchableOpacity>
      </View>

      {/* Input Fields */}
      <View style={styles.form}>
        <Text style={[styles.label, { color: colors.text }]}>Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          style={[
            styles.input,
            {
              color: colors.text,
              borderColor: colors.border,
              backgroundColor: colors.card,
            },
          ]}
          placeholder="Enter your name"
          placeholderTextColor={colors.border}
        />

        <Text style={[styles.label, { color: colors.text }]}>Bio</Text>
        <TextInput
          value={bio}
          onChangeText={setBio}
          style={[
            styles.input,
            {
              height: 80,
              color: colors.text,
              borderColor: colors.border,
              backgroundColor: colors.card,
            },
          ]}
          multiline
          placeholder="Write something about yourself"
          placeholderTextColor={colors.border}
        />
      </View>

      {/* Save Button */}
      <TouchableOpacity
        style={[styles.saveBtn, { backgroundColor: colors.primary }]}
        onPress={handleSave}
      >
        <Text style={styles.saveText}>Save</Text>
      </TouchableOpacity>

      {/* Bottom Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheet}>
            <Text style={styles.modalTitle}>Change Profile Picture</Text>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => pickImage("gallery")}
            >
              <Text style={styles.modalText}>Choose from Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={[styles.modalText, { color: "red" }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 15,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  avatarContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  changePicText: {
    marginTop: 8,
    fontSize: 14,
  },
  form: {
    marginVertical: 20,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    marginBottom: 15,
  },
  saveBtn: {
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 30,
  },
  saveText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  bottomSheet: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 10,
  },
  modalButton: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  modalText: {
    fontSize: 16,
    textAlign: "center",
    color: "#007BFF",
  },
  cancelButton: {
    borderBottomWidth: 0,
    marginTop: 5,
  },
});
