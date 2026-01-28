import Ionicons from "@react-native-vector-icons/ionicons";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSavedArticles } from '../context/SavedArticlesContext';
import { useTheme } from "../context/ThemeContext";

const SavedArticles = () => {
  const { savedArticles, removeArticle } = useSavedArticles();
  const navigation = useNavigation<any>();
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <Text style={[styles.header, { color: theme.colors.text }]}>
        Saved Articles
      </Text>

      <FlatList
        data={savedArticles}
        keyExtractor={(item) => item.url}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.card,
              { backgroundColor: theme.colors.card },
            ]}
            onPress={() =>
              navigation.navigate("DeepDive", {
                urlToImage: item.urlToImage,
                title: item.title,
                description: item.description,
                content: item.content,
                url: item.url,
              })
            }
          >
            {item.urlToImage && (
              <Image source={{ uri: item.urlToImage }} style={styles.image} />
            )}
            <View style={styles.textContainer}>
              <Text style={[styles.title, { color: theme.colors.text }]}>
                {item.title}
              </Text>
              <Text
                style={[
                  styles.desc,
                  { color: theme.isDark ? "#aaa" : "#555" },
                ]}
              >
                {item.description}
              </Text>
              <View style={styles.row}>
                <Text style={[styles.source, { color: theme.colors.primary }]}>
                  {item.source}
                </Text>
                <TouchableOpacity onPress={() => removeArticle(item.url)}>
                  <Ionicons
                    name="trash-outline"
                    size={22}
                    color={theme.isDark ? "#ff6b6b" : "red"}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: theme.colors.text }]}>
            No saved articles yet.
          </Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  header: { fontSize: 22, fontWeight: "700", marginBottom: 10 },
  card: {
    borderRadius: 12,
    marginBottom: 15,
    overflow: "hidden",
  },
  image: { width: "100%", height: 180 },
  textContainer: { padding: 10 },
  title: { fontSize: 16, fontWeight: "700" },
  desc: { marginVertical: 5 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  source: { color: "#007BFF" },
  empty: { textAlign: "center", marginTop: 30 },
});

export default SavedArticles;
