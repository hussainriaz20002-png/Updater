import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
// @ts-ignore  
import HamidMirImage from "../assets/images/HamidMir.png";
import { useTheme } from "../context/ThemeContext";

import { useLocalSearchParams, useRouter } from "expo-router";

export default function ArticleDetail() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const params = useLocalSearchParams();

  let article: any = params.article;
  if (typeof article === 'string') {
    try {
      article = JSON.parse(article);
    } catch (e) {
      console.error("Error parsing article", e);
      article = {};
    }
  }

  const handleDelete = async () => {
    Alert.alert(
      "Delete Column",
      "Are you sure you want to delete this column? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const storedArticles = await AsyncStorage.getItem("articles");
              if (storedArticles) {
                let articles = JSON.parse(storedArticles);
                // Filter out the article. Attempting to match by ID if available, otherwise strict equality or title/content
                // Assuming article object structure is unique enough. 
                // Best practice: use a unique ID. Fallback to title + date match.

                const newArticles = articles.filter((a: any) => {
                  if (article.id && a.id) return a.id !== article.id;
                  // Fallback comparison
                  return a.title !== article.title || a.column !== article.column;
                });

                await AsyncStorage.setItem("articles", JSON.stringify(newArticles));
                router.back();
              }
            } catch (error) {
              console.error("Error deleting article:", error);
              Alert.alert("Error", "Failed to delete the column.");
            }
          },
        },
      ]
    );
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name="arrow-back"
            size={moderateScale(24)}
            color={colors.text}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Read Column
        </Text>
        <View style={{ flex: 1 }} />
        <TouchableOpacity
          onPress={handleDelete}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name="trash-outline"
            size={moderateScale(24)}
            color={isDark ? "#ff6b6b" : "#ff4444"}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: isDark ? "#333" : "#eee",
              shadowColor: colors.primary,
              shadowOpacity: isDark ? 0.3 : 0.1,
            },
          ]}
        >
          {/* Title */}
          <Text style={[styles.title, { color: colors.text }]}>
            {article.title}
          </Text>

          {/* Author Info */}
          <View style={styles.authorRow}>
            <Image source={HamidMirImage} style={styles.authorImage} />
            <View style={{ marginLeft: scale(10) }}>
              <Text style={[styles.authorName, { color: colors.text }]}>
                {article.author}
              </Text>
              <Text style={[styles.dateText, { color: colors.secondaryText || colors.text }]}>
                {article.date && article.date.trim() !== ""
                  ? article.date
                  : new Date().toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
              </Text>
            </View>
          </View>

          {/* Article Content */}
          <Text
            style={[
              styles.columnText,
              { color: colors.text },
            ]}
          >
            {article.column}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: scale(18),
    paddingTop: verticalScale(20),
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(20),
    marginTop: verticalScale(10),
  },
  headerTitle: {
    fontSize: moderateScale(22),
    fontWeight: "700",
    marginLeft: scale(10),
  },
  scrollContent: {
    paddingBottom: verticalScale(40),
  },
  card: {
    borderRadius: moderateScale(16),
    padding: moderateScale(20),
    marginBottom: verticalScale(15),
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: moderateScale(20),
    fontWeight: "700",
    textAlign: "right", // Urdu alignment
    marginBottom: verticalScale(15),
    lineHeight: moderateScale(28),
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(25),
  },
  authorImage: {
    width: moderateScale(50),
    height: moderateScale(50),
    borderRadius: moderateScale(25),
  },
  authorName: {
    fontSize: moderateScale(16),
    fontWeight: "600",
  },
  dateText: {
    fontSize: moderateScale(13),
    opacity: 0.7,
    marginTop: verticalScale(2),
  },
  columnText: {
    fontSize: moderateScale(16),
    lineHeight: moderateScale(28),
    textAlign: "right",
    letterSpacing: 0.5,
  },
});
