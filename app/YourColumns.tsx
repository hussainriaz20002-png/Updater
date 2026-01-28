import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../context/ThemeContext";

export default function YourColumns() {
  const navigation = useNavigation<any>();
  const { colors, isDark } = useTheme();

  // Dummy logged-in columnist (replace with real one later)
  const loggedInUser = {
    id: "2",
    name: "Hamid Mir",
    role: "columnist",
  };

  // Dummy uploaded columns (temporary data)
  const dummyColumns = [
    {
      id: "c1",
      title: "Pakistan’s Political Future",
      author: "Hamid Mir",
      column:
        "Pakistan’s political situation has always been unpredictable. Recent developments show that...",
      date: "27 Oct 2025",
      time: "10:45 AM",
    },
    {
      id: "c2",
      title: "Media Freedom in Danger",
      author: "Hamid Mir",
      column:
        "In recent years, the freedom of press in Pakistan has been questioned by many journalists...",
      date: "30 Oct 2025",
      time: "9:20 PM",
    },
  ];

  const [columns, setColumns] = useState(dummyColumns);

  const renderItem = ({ item }: any) => {
    const preview = item.column.split(" ").slice(0, 20).join(" ") + "...";
    return (
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: isDark ? "#1e1e1e" : "#f8f8f8",
            borderColor: isDark ? "#333" : "#ddd",
          },
        ]}
        onPress={() => navigation.navigate("ArticleDetail", { article: item })}
      >
        <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
        <View style={[styles.line, { backgroundColor: colors.primary }]} />
        <Text style={[styles.preview, { color: colors.text }]}>{preview}</Text>
        <Text style={[styles.date, { color: isDark ? "#aaa" : "#666" }]}>
          Uploaded on {item.date} at {item.time}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.heading, { color: colors.text }]}>
        My Uploaded Columns
      </Text>

      {columns.length === 0 ? (
        <Text style={[styles.noArticles, { color: colors.text }]}>
          No columns uploaded yet.
        </Text>
      ) : (
        <FlatList
          data={columns}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
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
    marginBottom: 20,
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
