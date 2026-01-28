import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../context/ThemeContext";

export default function ReadArticles() {
  const [articles, setArticles] = useState<any[]>([]);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { journalist } = route.params || {};
  const theme = useTheme();

  useEffect(() => {
    const fetchArticles = async () => {
      const stored = await AsyncStorage.getItem("articles");
      if (stored) {
        const parsed = JSON.parse(stored);

        //  Filter by journalist name
        const filtered = parsed.filter(
          (a: any) => a.author === journalist?.name
        );

        // Add dummy date/time if missing
        const withDummyDate = filtered.map((a: any) => ({
          ...a,
          date: a?.date && a.date.trim() !== "" ? a.date : "27 Oct 2025",
          time: a?.time && a.time.trim() !== "" ? a.time : "10:45 AM",
        }));

        setArticles(withDummyDate);
      } else {
        setArticles([]);
      }
    };

    const unsubscribe = navigation.addListener("focus", fetchArticles);
    return unsubscribe;
  }, [navigation, journalist]);

  const renderItem = ({ item }: any) => {
    const preview = item.column.split(" ").slice(0, 20).join(" ") + "...";
    return (
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: theme.isDark ? "#1e1e1e" : "#f8f8f8",
            borderColor: theme.isDark ? "#333" : "#ddd",
          },
        ]}
        onPress={() => navigation.navigate("ArticleDetail", { article: item })}
      >
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {item.title}
        </Text>
        <View
          style={[
            styles.line,
            { backgroundColor: theme.colors.primary },
          ]}
        />
        <Text style={[styles.preview, { color: theme.colors.text }]}>
          {preview}
        </Text>
        <Text
          style={[
            styles.date,
            { color: theme.isDark ? "#aaa" : "#666" },
          ]}
        >
          Uploaded on {item.date} at {item.time}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <Text style={[styles.heading, { color: theme.colors.text }]}>
        {journalist?.name}’s Columns
      </Text>

      {articles.length === 0 ? (
        <Text style={[styles.noArticles, { color: theme.colors.text }]}>
          No columns yet.
        </Text>
      ) : (
        <FlatList
          data={articles}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  heading: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
  },
  card: {
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
  },
  line: {
    height: 2,
    width: "25%",
    marginBottom: 6,
  },
  preview: {
    fontSize: 14,
  },
  date: {
    fontSize: 12,
    marginTop: 6,
  },
  noArticles: {
    textAlign: "center",
    marginTop: 30,
    fontSize: 14,
  },
});
