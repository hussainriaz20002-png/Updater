import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { useSavedArticles } from "../context/SavedArticlesContext";
import { useTheme } from "../context/ThemeContext";

const SavedArticles = () => {
  const { savedArticles, removeArticle } = useSavedArticles();
  const router = useRouter();
  const { isDark, colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={10}
        >
          <Ionicons
            name="arrow-back"
            size={moderateScale(24)}
            color={colors.text}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Saved News
        </Text>
        <View style={{ width: scale(24) }} />
      </View>

      <FlashList
        data={savedArticles}
        keyExtractor={(item: any) => item.url}
        // estimatedItemSize={moderateScale(280)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: verticalScale(20) }}
        renderItem={({ item }: { item: any }) => (
          <TouchableOpacity
            style={[
              styles.card,
              {
                backgroundColor: colors.card,
                shadowColor: colors.primary,
              },
            ]}
            activeOpacity={0.9}
            onPress={() =>
              router.push({
                pathname: "/DeepDive",
                params: {
                  urlToImage: item.urlToImage,
                  title: item.title,
                  description: item.description,
                  content: item.content,
                  url: item.url,
                },
              })
            }
          >
            {item.urlToImage && (
              <Image
                source={{ uri: item.urlToImage }}
                style={styles.image}
                resizeMode="cover"
              />
            )}
            <View style={styles.textContainer}>
              <Text
                style={[styles.title, { color: colors.text }]}
                numberOfLines={2}
              >
                {item.title}
              </Text>
              <Text
                style={[styles.desc, { color: isDark ? "#aaa" : "#555" }]}
                numberOfLines={3}
              >
                {item.description}
              </Text>
              <View style={styles.row}>
                <Text style={[styles.source, { color: colors.primary }]}>
                  {item.source || "Unknown Source"}
                </Text>
                <TouchableOpacity
                  onPress={() => removeArticle(item.url)}
                  hitSlop={10}
                >
                  <Ionicons
                    name="trash-outline"
                    size={moderateScale(20)}
                    color={isDark ? "#ff6b6b" : "red"}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="bookmark-outline"
              size={moderateScale(60)}
              color={isDark ? "#333" : "#eee"}
            />
            <Text style={[styles.empty, { color: colors.text }]}>
              No saved articles yet.
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: scale(16) },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: verticalScale(40),
    paddingBottom: verticalScale(15),
    marginBottom: verticalScale(10),
  },
  backButton: { padding: 5 },
  headerTitle: { fontSize: moderateScale(20), fontWeight: "700" },

  card: {
    borderRadius: moderateScale(16),
    marginBottom: verticalScale(16),
    overflow: "hidden",
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  image: { width: "100%", height: verticalScale(180) },
  textContainer: { padding: moderateScale(16) },
  title: {
    fontSize: moderateScale(16),
    fontWeight: "700",
    marginBottom: verticalScale(4),
    lineHeight: moderateScale(22),
  },
  desc: {
    fontSize: moderateScale(14),
    marginVertical: verticalScale(8),
    lineHeight: moderateScale(20),
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: verticalScale(8),
  },
  source: { fontSize: moderateScale(12), fontWeight: "600" },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: verticalScale(100),
  },
  empty: {
    textAlign: "center",
    marginTop: verticalScale(16),
    fontSize: moderateScale(16),
    opacity: 0.7,
  },
});

export default SavedArticles;
