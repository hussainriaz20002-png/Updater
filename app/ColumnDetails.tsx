import Ionicons from "@react-native-vector-icons/ionicons";
import { useNavigation, useRoute } from "@react-navigation/native";
import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
// @ts-ignore  
import HamidMirImage from "../assets/images/HamidMir.png";
import { useTheme } from "../context/ThemeContext";

export default function ArticleDetail() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { colors, isDarkMode } = useTheme();
  const { article } = route.params;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons
            name="arrow-back"
            size={22}
            color={colors.text}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Read Column
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: isDarkMode ? "#333" : "#eee",
              shadowOpacity: isDarkMode ? 0 : 0.1,
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
            <View style={{ marginLeft: 10 }}>
              <Text style={[styles.authorName, { color: colors.text }]}>
                {article.author}
              </Text>
              <Text style={[styles.dateText, { color: colors.secondaryText }]}>
                {article.date
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
    paddingHorizontal: 18,
    paddingTop: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginLeft: 10,
  },
  card: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "right", // Urdu alignment
    marginBottom: 10,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  authorImage: {
    width: 45,
    height: 45,
    borderRadius: 22,
  },
  authorName: {
    fontSize: 14,
    fontWeight: "600",
  },
  dateText: {
    fontSize: 12,
  },
  columnText: {
    fontSize: 15,
    lineHeight: 26,
    textAlign: "right",
  },
});
