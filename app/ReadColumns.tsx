import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { useLocalSearchParams, useRouter } from "expo-router";
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import React, { useEffect, useMemo, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { db } from "../config/firebase";
import { useTheme } from "../context/ThemeContext";
import useFetch from "../hooks/useFetch";

// Calculate reading time
const calculateReadingTime = (text: string) => {
  const wordsPerMinute = 200;
  const words = text.split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
};

const ColumnCard = ({ item, isDark, colors, router, index }: any) => {
  // Animation for Fade In & Scale
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const translateY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 600,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const readingTime = calculateReadingTime(item.column || "");
  const preview = item.column.split(" ").slice(0, 35).join(" ") + "...";

  return (
    <Animated.View
      style={[
        styles.cardContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY }, { scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            shadowColor: isDark ? "#000" : "#8890a0",
            shadowOpacity: isDark ? 0.3 : 0.15,
            borderColor: isDark ? "#333" : "transparent",
            borderWidth: isDark ? 1 : 0,
          },
        ]}
        activeOpacity={0.92}
        onPress={() =>
          router.push({
            pathname: "/ColumnDetails",
            params: { article: JSON.stringify(item) },
          })
        }
      >
        <View style={styles.cardInner}>
          {/* Top Meta: Date on left, Time on right */}
          <View style={styles.metaRow}>
            <Text style={[styles.dateText, { color: colors.secondaryText }]}>
              {item.date}
            </Text>
            <View style={styles.readingTimeBadge}>
              <Ionicons name="time-outline" size={12} color={colors.primary} />
              <Text style={[styles.readingTimeText, { color: colors.primary }]}>
                {readingTime}
              </Text>
            </View>
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: colors.text }]}>
            {item.title}
          </Text>

          {/* Divider */}
          <View
            style={[
              styles.divider,
              { backgroundColor: isDark ? "#444" : "#eee" },
            ]}
          />

          {/* Preview Text */}
          <Text style={[styles.preview, { color: isDark ? "#aaa" : "#555" }]}>
            {preview}
          </Text>

          {/* Read More Indicator */}
          <View style={styles.readMoreRow}>
            <Text style={[styles.readMoreText, { color: colors.text }]}>
              Read Full Column
            </Text>
            <Ionicons name="arrow-forward" size={16} color={colors.text} />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function ReadArticles() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { colors, isDark } = useTheme();

  const journalistName = Array.isArray(params.journalistName)
    ? params.journalistName[0]
    : params.journalistName;

  // Define params as a memo to avoid infinite refetching loop in useFetch
  const queryConstraints = useMemo(
    () => [where("author", "==", journalistName)],
    [journalistName],
  );

  const { data: articles, loading } = useFetch<any>(
    "articles",
    queryConstraints,
    true,
  );

  // Fetch author details once for the whole list (since filtered by journalistName)
  const [authorImage, setAuthorImage] = React.useState<string | null>(null);

  useEffect(() => {
    const fetchAuthorImage = async () => {
      if (!journalistName) return;
      try {
        const q = query(
          collection(db, "users"),
          where("name", "==", journalistName),
          limit(1),
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const userData = snapshot.docs[0].data();
          if (userData.photoURL) {
            setAuthorImage(userData.photoURL);
          }
        }
      } catch (e) {
        console.log("Error fetching author for header", e);
      }
    };
    fetchAuthorImage();
  }, [journalistName]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Premium Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[
            styles.backButton,
            { backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "#f0f0f0" },
          ]}
          hitSlop={10}
        >
          <Ionicons
            name="arrow-back"
            size={moderateScale(22)}
            color={colors.text}
          />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={[styles.headerEyebrow, { color: colors.primary }]}>
            COLUMNIST
          </Text>
          <Text
            style={[styles.headerTitle, { color: colors.text }]}
            numberOfLines={1}
          >
            {journalistName}
          </Text>
        </View>

        {/* Placeholder for balance */}
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : articles.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons
            name="newspaper-outline"
            size={moderateScale(64)}
            color={isDark ? "#444" : "#ddd"}
          />
          <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
            No columns published yet.
          </Text>
        </View>
      ) : (
        <FlashList
          data={articles}
          keyExtractor={(item: any) => item.id || Math.random().toString()}
          renderItem={({ item, index }) => (
            <ColumnCard
              item={{ ...item, authorImage: authorImage || item.authorImage }} // Injected fresh image
              index={index}
              isDark={isDark}
              colors={colors}
              router={router}
            />
          )}
          contentContainerStyle={{
            paddingHorizontal: scale(20),
            paddingBottom: verticalScale(50),
          }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(50),
    paddingBottom: verticalScale(20),
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerContent: {
    alignItems: "center",
    flex: 1,
  },
  headerEyebrow: {
    fontSize: moderateScale(10),
    fontWeight: "800",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: moderateScale(20),
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  cardContainer: {
    marginBottom: verticalScale(20),
  },
  card: {
    borderRadius: moderateScale(24),
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 8,
    marginHorizontal: 2, // avoid clipping shadow
  },
  cardInner: {
    padding: moderateScale(24),
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: verticalScale(14),
  },
  dateText: {
    fontSize: moderateScale(12),
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    opacity: 0.7,
  },
  readingTimeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.03)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  readingTimeText: {
    fontSize: moderateScale(11),
    fontWeight: "700",
  },
  title: {
    fontSize: moderateScale(22),
    fontWeight: "800",
    marginBottom: verticalScale(12),
    lineHeight: moderateScale(30),
    letterSpacing: -0.5,
  },
  divider: {
    height: 1,
    width: 40,
    marginBottom: verticalScale(12),
  },
  preview: {
    fontSize: moderateScale(16),
    lineHeight: moderateScale(24),
    marginBottom: verticalScale(20),
    fontWeight: "400",
    letterSpacing: 0.1,
  },
  readMoreRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 6,
    opacity: 0.9,
  },
  readMoreText: {
    fontSize: moderateScale(13),
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: verticalScale(100),
  },
  emptyText: {
    marginTop: verticalScale(16),
    fontSize: moderateScale(16),
    fontWeight: "500",
  },
});
