import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { addDoc, collection } from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Easing,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { db } from "../config/firebase";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const { width } = Dimensions.get("window");

export default function UploadArticle() {
  const router = useRouter();
  const theme = useTheme();
  const { userData } = useAuth();
  const insets = useSafeAreaInsets();
  const [language, setLanguage] = useState("english");
  const [title, setTitle] = useState("");
  const [column, setColumn] = useState("");
  const [loading, setLoading] = useState(false);

  const maxWords = 2000;
  const wordCount = column.trim().split(/\s+/).filter(Boolean).length;

  // Animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;
  const footerAnim = useRef(new Animated.Value(0)).current;

  // Staggered Entry Animation
  useEffect(() => {
    Animated.stagger(150, [
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(contentAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(footerAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start();
  }, []);

  const translateY = contentAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [50, 0],
  });

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
  };

  const handleUpload = async () => {
    if (!title.trim() || !column.trim()) {
      Alert.alert("Missing Info", "Please add both title and column text.");
      return;
    }

    if (wordCount > maxWords) {
      Alert.alert(
        "Word Limit Exceeded",
        `Please reduce your column to ${maxWords} words.`,
      );
      return;
    }

    setLoading(true);

    const newArticle = {
      author: userData?.name || "Unknown Author",
      authorId: userData?.uid, // Save UID for dynamic lookup
      authorImage: userData?.photoURL || null,
      title,
      column,
      language,
      date: new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      createdAt: new Date(),
      likes: [],
      comments: [],
    };

    try {
      await addDoc(collection(db, "articles"), newArticle);
      Alert.alert("Success", "Column uploaded successfully!");
      setTitle("");
      setColumn("");
      router.back();
    } catch (error) {
      console.log("Error saving article:", error);
      Alert.alert("Error", "Something went wrong while uploading.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: theme.colors.background }}
    >
      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerAnim,
            transform: [
              {
                translateY: headerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0],
                }),
              },
            ],
            paddingTop: verticalScale(20) + insets.top,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={[
            styles.backButton,
            {
              backgroundColor: theme.isDark
                ? "rgba(255,255,255,0.1)"
                : "#f5f5f5",
            },
          ]}
        >
          <Ionicons
            name="close"
            size={moderateScale(24)}
            color={theme.colors.text}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          New Column
        </Text>
        <TouchableOpacity
          // Optional: Draft save or just placeholder for balance
          style={{ width: 40 }}
        />
      </Animated.View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{ opacity: contentAnim, transform: [{ translateY }] }}
        >
          {/* Language Toggle */}
          <View style={styles.segmentContainer}>
            <TouchableOpacity
              onPress={() => setLanguage("english")}
              style={[
                styles.segmentButton,
                language === "english" && {
                  backgroundColor: theme.colors.primary,
                },
              ]}
            >
              <Text
                style={[
                  styles.segmentText,
                  language === "english"
                    ? { color: "#fff", fontWeight: "700" }
                    : { color: theme.colors.secondaryText },
                ]}
              >
                English
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setLanguage("urdu")}
              style={[
                styles.segmentButton,
                language === "urdu" && {
                  backgroundColor: theme.colors.primary,
                },
              ]}
            >
              <Text
                style={[
                  styles.segmentText,
                  language === "urdu"
                    ? { color: "#fff", fontWeight: "700" }
                    : { color: theme.colors.secondaryText },
                ]}
              >
                Urdu
              </Text>
            </TouchableOpacity>
          </View>

          {/* Title Input */}
          <View style={styles.inputGroup}>
            <Text
              style={[
                styles.label,
                {
                  color: theme.colors.secondaryText,
                  textAlign: language === "urdu" ? "right" : "left",
                },
              ]}
            >
              {language === "urdu" ? "عنوان" : "TITLE"}
            </Text>
            <TextInput
              style={[
                styles.titleInput,
                {
                  color: theme.colors.text,
                  textAlign: language === "urdu" ? "right" : "left",
                },
              ]}
              placeholder={
                language === "urdu" ? "عنوان" : "Enter a catchy title..."
              }
              placeholderTextColor={theme.isDark ? "#555" : "#ccc"}
              multiline
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Content Input */}
          <View style={styles.inputGroup}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text
                style={[
                  styles.label,
                  {
                    color: theme.colors.secondaryText,
                    textAlign: language === "urdu" ? "right" : "left",
                  },
                ]}
              >
                {language === "urdu" ? "کالم" : "STORY"}
              </Text>
              <Text
                style={[
                  styles.wordCount,
                  {
                    color:
                      wordCount > maxWords ? "#FF3B30" : theme.colors.primary,
                  },
                ]}
              >
                {wordCount} / {maxWords}
              </Text>
            </View>

            <TextInput
              style={[
                styles.contentInput,
                {
                  color: theme.colors.text,
                  textAlign: language === "urdu" ? "right" : "left",
                  lineHeight: moderateScale(24),
                },
              ]}
              placeholder={
                language === "urdu" ? "یہاں لکھیں..." : "Tell your story..."
              }
              placeholderTextColor={theme.isDark ? "#555" : "#ccc"}
              multiline
              textAlignVertical="top"
              scrollEnabled={false}
              value={column}
              onChangeText={setColumn}
            />
          </View>

          <View style={{ height: verticalScale(100) }} />
        </Animated.View>
      </ScrollView>

      {/* Floating Action Bar */}
      <Animated.View
        style={[
          styles.actionBar,
          {
            opacity: footerAnim,
            transform: [
              {
                translateY: footerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [100, 0],
                }),
              },
            ],
            paddingBottom: verticalScale(20) + insets.bottom,
            backgroundColor: theme.colors.background,
            borderTopColor: theme.isDark ? "#333" : "#f0f0f0",
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.publishButton,
            {
              backgroundColor: theme.colors.primary,
              opacity: wordCount > maxWords ? 0.5 : 1,
            },
          ]}
          onPress={handleUpload}
          disabled={wordCount > maxWords || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.publishText}>Publish Now</Text>
              <Ionicons
                name="arrow-up-circle"
                size={24}
                color="#fff"
                style={{ marginLeft: 8 }}
              />
            </>
          )}
        </TouchableOpacity>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(10),
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: moderateScale(16),
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingHorizontal: scale(24),
    paddingTop: verticalScale(10),
  },

  // Segment Control
  segmentContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: moderateScale(12),
    padding: 4,
    marginBottom: verticalScale(30),
  },
  segmentButton: {
    flex: 1,
    paddingVertical: verticalScale(8),
    alignItems: "center",
    borderRadius: moderateScale(8),
  },
  segmentText: {
    fontSize: moderateScale(14),
    fontWeight: "600",
  },

  // Inputs
  inputGroup: {
    marginBottom: verticalScale(30),
  },
  label: {
    fontSize: moderateScale(12),
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: verticalScale(10),
    opacity: 0.6,
  },
  titleInput: {
    fontSize: moderateScale(28),
    fontWeight: "800",
    paddingVertical: verticalScale(10),
  },
  contentInput: {
    fontSize: moderateScale(18),
    minHeight: verticalScale(200),
    // No padding horizontal to align with label perfectly
  },
  wordCount: {
    fontSize: moderateScale(12),
    fontWeight: "700",
  },

  // Action Bar
  actionBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(20),
    borderTopWidth: 1,
  },
  publishButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: verticalScale(16),
    borderRadius: moderateScale(16),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  publishText: {
    color: "#fff",
    fontSize: moderateScale(16),
    fontWeight: "700",
  },
});
