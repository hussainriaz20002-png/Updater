import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "@react-native-vector-icons/ionicons";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../context/ThemeContext";

export default function UploadArticle() {
  const navigation = useNavigation<any>();
  const theme = useTheme();
  const [language, setLanguage] = useState("english");
  const [title, setTitle] = useState("");
  const [column, setColumn] = useState("");

  const maxWords = 2000;
  const wordCount = column.trim().split(/\s+/).filter(Boolean).length;

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
  };

  const handleColumnChange = (text: string) => {
    const words = text.trim().split(/\s+/);
    if (words.length <= maxWords) {
      setColumn(text);
    }
  };

  // ✅ Handle Upload
  const handleUpload = async () => {
    if (!title.trim() || !column.trim()) {
      Alert.alert("Missing Info", "Please add both title and column text.");
      return;
    }

    const newArticle = {
      id: Date.now().toString(),
      author: "Hamid Mir",
      title,
      column,
      language,
    };

    try {
      const stored = await AsyncStorage.getItem("articles");
      const articles = stored ? JSON.parse(stored) : [];

      articles.push(newArticle);

      await AsyncStorage.setItem("articles", JSON.stringify(articles));

      Alert.alert("Success", "Column uploaded successfully!");
      setTitle("");
      setColumn("");
      navigation.goBack();
    } catch (error) {
      console.log("Error saving article:", error);
      Alert.alert("Error", "Something went wrong while uploading.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          New Column
        </Text>
      </View>

      {/* Select a Language */}
      <View style={styles.languageSection}>
        <Text style={[styles.selectLangText, { color: theme.colors.text }]}>
          Select Language
        </Text>

        <View style={styles.languageOptions}>
          {/* English */}
          <TouchableOpacity
            style={styles.languageRow}
            onPress={() => handleLanguageChange("english")}
          >
            <View
              style={[
                styles.radioOuter,
                {
                  borderColor:
                    language === "english"
                      ? theme.colors.primary
                      : theme.colors.text,
                },
              ]}
            >
              {language === "english" && (
                <View
                  style={[styles.radioInner, { backgroundColor: theme.colors.primary }]}
                />
              )}
            </View>
            <Text style={[styles.languageLabel, { color: theme.colors.text }]}>
              English
            </Text>
          </TouchableOpacity>

          {/* Urdu */}
          <TouchableOpacity
            style={styles.languageRow}
            onPress={() => handleLanguageChange("urdu")}
          >
            <View
              style={[
                styles.radioOuter,
                {
                  borderColor:
                    language === "urdu"
                      ? theme.colors.primary
                      : theme.colors.text,
                },
              ]}
            >
              {language === "urdu" && (
                <View
                  style={[styles.radioInner, { backgroundColor: theme.colors.primary }]}
                />
              )}
            </View>
            <Text style={[styles.languageLabel, { color: theme.colors.text }]}>
              Urdu
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Title input */}
      <TextInput
        style={[
          styles.input,
          {
            borderColor: theme.colors.card,
            color: theme.colors.text,
            backgroundColor: theme.isDark ? "#121212" : "#f9f9f9",
            textAlign: language === "urdu" ? "right" : "left",
            writingDirection: language === "urdu" ? "rtl" : "ltr",
          },
        ]}
        placeholder={language === "urdu" ? "عنوان شامل کریں" : "Add a Title"}
        placeholderTextColor={theme.isDark ? "#aaa" : "#888"}
        keyboardType="default"
        value={title}
        onChangeText={setTitle}
      />

      {/* Column input */}
      <TextInput
        style={[
          styles.columnInput,
          {
            borderColor: theme.colors.card,
            color: theme.colors.text,
            backgroundColor: theme.isDark ? "#121212" : "#f9f9f9",
            textAlign: language === "urdu" ? "right" : "left",
            writingDirection: language === "urdu" ? "rtl" : "ltr",
          },
        ]}
        placeholder={language === "urdu" ? "کالم لکھیں" : "Write Column"}
        placeholderTextColor={theme.isDark ? "#aaa" : "#888"}
        multiline
        textAlignVertical="top"
        keyboardType="default"
        value={column}
        onChangeText={handleColumnChange}
      />

      {/* Word count */}
      <Text style={[styles.wordCount, { color: theme.colors.text }]}>
        {wordCount}/{maxWords}
      </Text>

      {/* Upload button */}
      <TouchableOpacity
        style={[
          styles.uploadButton,
          { backgroundColor: theme.colors.primary },
        ]}
        onPress={handleUpload}
      >
        <Text style={styles.uploadButtonText}>Upload Column</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 10,
  },
  // Language Section
  languageSection: {
    marginBottom: 25,
  },
  selectLangText: {
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 10,
    marginLeft: 15,
    marginTop: 15,
  },
  languageOptions: {
    alignItems: "flex-start",
    marginLeft: 20,
  },
  languageRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  languageLabel: {
    fontSize: 15,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    marginBottom: 15,
  },
  columnInput: {
    borderWidth: 1,
    borderRadius: 10,
    height: 200,
    padding: 10,
    fontSize: 16,
  },
  wordCount: {
    textAlign: "right",
    fontSize: 13,
    marginTop: 5,
  },
  uploadButton: {
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 25,
  },
  uploadButtonText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    fontWeight: "600",
  },
});
