import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FlashList } from "@shopify/flash-list";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { useTheme } from "../context/ThemeContext";

export default function ReadArticles() {
  const [articles, setArticles] = useState<any[]>([]);
  const router = useRouter();
  const params = useLocalSearchParams();
  const { colors, isDark } = useTheme();

  // params can be arrays or strings, handled securely
  const journalistName = Array.isArray(params.journalistName) ? params.journalistName[0] : params.journalistName;

  useFocusEffect(
    useCallback(() => {
      const fetchArticles = async () => {
        const stored = await AsyncStorage.getItem("articles");
        if (stored) {
          const parsed = JSON.parse(stored);

          //  Filter by journalist name
          const filtered = parsed.filter(
            (a: any) => a.author === journalistName
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

      fetchArticles();
    }, [journalistName]));

  const renderItem = ({ item }: { item: any }) => {
    const preview = item.column.split(" ").slice(0, 20).join(" ") + "...";
    return (
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            shadowColor: colors.primary, // Premium shadow
          },
        ]}
        activeOpacity={0.9}
        onPress={() => router.push({
          pathname: "/ColumnDetails",
          params: { article: JSON.stringify(item) }
        })}
      >
        <Text style={[styles.title, { color: colors.text }]}>
          {item.title}
        </Text>

        <View style={styles.metaRow}>
          <Ionicons name="time-outline" size={moderateScale(12)} color={colors.primary} style={{ marginRight: 4 }} />
          <Text
            style={[
              styles.date,
              { color: isDark ? "#aaa" : "#666" },
            ]}
          >
            {item.date} • {item.time}
          </Text>
        </View>

        <View
          style={[
            styles.line,
            { backgroundColor: colors.primary },
          ]}
        />
        <Text style={[styles.preview, { color: isDark ? "#ccc" : "#444" }]}>
          {preview}
        </Text>

        <View style={styles.readMoreRow}>
          <Text style={[styles.readMore, { color: colors.primary }]}>Read Full Article</Text>
          <Ionicons name="arrow-forward" size={14} color={colors.primary} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={10}
        >
          <Ionicons name="arrow-back" size={moderateScale(24)} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.heading, { color: colors.text }]} numberOfLines={1}>
          {journalistName ? `${journalistName}'s Columns` : "Columns"}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {articles.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={moderateScale(50)} color={isDark ? "#333" : "#eee"} />
          <Text style={[styles.noArticles, { color: colors.text }]}>
            No columns found for this journalist.
          </Text>
        </View>
      ) : (
        <FlashList
          data={articles}
          keyExtractor={(item: any) => item.id || Math.random().toString()}
          estimatedItemSize={moderateScale(150)}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: verticalScale(40) }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: scale(16),
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: verticalScale(40),
    paddingBottom: verticalScale(15),
    marginBottom: verticalScale(10)
  },
  backButton: { padding: 5 },
  heading: {
    fontSize: moderateScale(20),
    fontWeight: "700",
    maxWidth: '80%',
    textAlign: 'center'
  },
  card: {
    borderRadius: moderateScale(16),
    padding: moderateScale(20),
    marginBottom: verticalScale(16),
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: moderateScale(18),
    fontWeight: "700",
    marginBottom: verticalScale(8),
    lineHeight: moderateScale(24)
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(12)
  },
  line: {
    height: 1,
    width: "15%",
    marginBottom: verticalScale(12),
    opacity: 0.5
  },
  preview: {
    fontSize: moderateScale(14),
    lineHeight: moderateScale(22),
    marginBottom: verticalScale(16)
  },
  date: {
    fontSize: moderateScale(12),
    fontWeight: '500'
  },
  readMoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  readMore: {
    fontSize: moderateScale(13),
    fontWeight: '700',
    marginRight: scale(4)
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: verticalScale(100)
  },
  noArticles: {
    textAlign: "center",
    marginTop: verticalScale(16),
    fontSize: moderateScale(16),
    opacity: 0.6
  },
});
