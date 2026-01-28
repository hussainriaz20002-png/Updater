import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FlashList } from "@shopify/flash-list";
import { useFocusEffect, useRouter } from "expo-router";
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

export default function YourColumns() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [columns, setColumns] = useState<any[]>([]);

  // Dummy logged-in columnist (replace with real auth logic later)
  const loggedInUser = "Hamid Mir";

  useFocusEffect(
    useCallback(() => {
      const fetchColumns = async () => {
        try {
          const stored = await AsyncStorage.getItem("articles");
          if (stored) {
            const parsed = JSON.parse(stored);
            // Filter by logged-in user
            const userColumns = parsed.filter((a: any) => a.author === loggedInUser);

            // Add dummy date/time if missing for consistency
            const processed = userColumns.map((a: any) => ({
              ...a,
              date: a.date || "27 Oct 2025",
              time: a.time || "10:45 AM",
            }));
            setColumns(processed.reverse()); // Show newest first
          } else {
            setColumns([]);
          }
        } catch (error) {
          console.error("Error fetching columns", error);
        }
      };

      fetchColumns();
    }, [])
  );

  const renderItem = ({ item }: { item: any }) => {
    const preview = item.column ? item.column.split(" ").slice(0, 18).join(" ") + "..." : "";
    return (
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            shadowColor: colors.primary,
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
          <Text style={[styles.readMore, { color: colors.primary }]}>View Details</Text>
          <Ionicons name="arrow-forward" size={14} color={colors.primary} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Header */}
      <View style={styles.headerContainer}>
        {/* Back Button added for consistency if navigated from somewhere else, though usually this might be a tab or top level */}
        <Text style={[styles.heading, { color: colors.text }]}>
          My Uploaded Columns
        </Text>
      </View>

      {columns.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={moderateScale(50)} color={isDark ? "#333" : "#eee"} />
          <Text style={[styles.noArticles, { color: colors.text }]}>
            No columns uploaded yet.
          </Text>
        </View>
      ) : (
        <FlashList
          data={columns}
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
    paddingTop: verticalScale(40),
    paddingBottom: verticalScale(15),
    marginBottom: verticalScale(10),
  },
  heading: {
    fontSize: moderateScale(24),
    fontWeight: "700",
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
    marginTop: verticalScale(50)
  },
  noArticles: {
    textAlign: "center",
    marginTop: verticalScale(16),
    fontSize: moderateScale(16),
    opacity: 0.6
  },
});
