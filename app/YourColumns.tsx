import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { collection, deleteDoc, doc, getDocs, where } from "firebase/firestore";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { db } from "../config/firebase";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import useFetch from "../hooks/useFetch";

const { width } = Dimensions.get("window");

// Animated Card Component
const ArticleCard = ({
  item,
  index,
  isDark,
  colors,
  onPress,
  onDelete,
  isDeleting,
}: any) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 600,
      delay: index * 100, // Staggered Effect
      useNativeDriver: true,
      easing: Easing.out(Easing.back(1.5)),
    }).start();
  }, []);

  const onPressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [50, 0],
  });

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const preview = item.column
    ? item.column.split(/\s+/).slice(0, 20).join(" ") + "..."
    : "No content preview.";

  const likeCount = item.likes?.length || 0;
  const commentCount = item.comments?.length || 0;

  return (
    <Animated.View
      style={{
        opacity,
        transform: [{ translateY }, { scale: scaleValue }],
        marginBottom: verticalScale(20),
      }}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={[
          styles.card,
          {
            backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF",
            shadowColor: isDark ? "#000" : "#8890a0",
            borderColor: isDark ? "#333" : "transparent",
            borderWidth: isDark ? 1 : 0,
          },
        ]}
      >
        {/* Status Line / Decoration */}
        <View
          style={[styles.accentLine, { backgroundColor: colors.primary }]}
        />

        <View style={styles.cardContent}>
          {/* Header: Date & Status */}
          <View style={styles.cardHeader}>
            <Text style={[styles.dateText, { color: colors.secondaryText }]}>
              {item.date || "Unknown Date"}
            </Text>
            {isDeleting === item.id && (
              <ActivityIndicator size="small" color="#FF3B30" />
            )}
          </View>

          {/* Title */}
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            {item.title}
          </Text>

          {/* Preview */}
          <Text
            style={[styles.cardPreview, { color: isDark ? "#A0A0A0" : "#555" }]}
            numberOfLines={2}
          >
            {preview}
          </Text>

          {/* Footer: Stats & Actions */}
          <View style={styles.cardFooter}>
            <View style={styles.statsContainer}>
              <View style={styles.statBadge}>
                <Ionicons
                  name="heart-outline"
                  size={14}
                  color={colors.primary}
                />
                <Text
                  style={[styles.statText, { color: colors.secondaryText }]}
                >
                  {likeCount}
                </Text>
              </View>
              <View style={styles.statBadge}>
                <Ionicons
                  name="chatbubble-outline"
                  size={14}
                  color={colors.primary}
                />
                <Text
                  style={[styles.statText, { color: colors.secondaryText }]}
                >
                  {commentCount}
                </Text>
              </View>
            </View>

            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: "rgba(255, 59, 48, 0.1)" },
                ]}
                onPress={onDelete}
                disabled={isDeleting === item.id}
              >
                <Ionicons name="trash-outline" size={18} color="#FF3B30" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: colors.primary + "15" },
                ]}
                onPress={onPress}
              >
                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color={colors.primary}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function YourColumns() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { userData } = useAuth();
  const [isDeleting, setIsDeleting] = useState("");

  const name = userData?.name || "";

  // Memoize constraints
  const constraints = useMemo(() => {
    return name ? [where("author", "==", name)] : [];
  }, [name]);

  // Use the hook
  const { data: columns, loading } = useFetch<any>(
    "articles",
    constraints,
    true,
  );

  // Handle column deletion
  const handleDeleteColumn = async (columnId: string) => {
    setIsDeleting(columnId);
    try {
      Alert.alert("Delete Column", "This cannot be undone. Are you sure?", [
        { text: "Cancel", style: "cancel", onPress: () => setIsDeleting("") },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              // 1. Delete all comments in subcollection
              const commentsRef = collection(
                db,
                "articles",
                columnId,
                "comments",
              );
              const commentsSnapshot = await getDocs(commentsRef);

              const deletePromises = commentsSnapshot.docs.map((doc) =>
                deleteDoc(doc.ref),
              );
              await Promise.all(deletePromises);

              // 2. Delete the article itself
              await deleteDoc(doc(db, "articles", columnId));
              setIsDeleting("");
            } catch (err) {
              console.error("Error deleting column details:", err);
              Alert.alert("Error", "Failed to delete column completely.");
              setIsDeleting("");
            }
          },
        },
      ]);
    } catch (error) {
      console.error("Error deleting column:", error);
      Alert.alert("Error", "Failed to delete column");
      setIsDeleting("");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View>
          <Text style={[styles.eyebrow, { color: colors.primary }]}>
            DASHBOARD
          </Text>
          <Text style={[styles.heading, { color: colors.text }]}>
            Your Columns
          </Text>
        </View>

        {/* Add New Button (Quick Action) */}
        <TouchableOpacity
          style={[
            styles.addButton,
            { backgroundColor: colors.primary, shadowColor: colors.primary },
          ]}
          onPress={() => router.push("/UploadColumns")}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Stats Summary (Optional, simple count for now) */}
      {!loading && columns.length > 0 && (
        <View style={styles.summaryContainer}>
          <Text style={[styles.summaryText, { color: colors.secondaryText }]}>
            You have published{" "}
            <Text style={{ fontWeight: "700", color: colors.text }}>
              {columns.length}
            </Text>{" "}
            columns so far.
          </Text>
        </View>
      )}

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : columns.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <View
            style={[
              styles.emptyIconCircle,
              { backgroundColor: isDark ? "#333" : "#F0F5FF" },
            ]}
          >
            <Ionicons
              name="create-outline"
              size={moderateScale(40)}
              color={colors.primary}
            />
          </View>
          <Text style={[styles.noArticlesTitle, { color: colors.text }]}>
            No Columns Yet
          </Text>
          <Text style={[styles.noArticlesSub, { color: colors.secondaryText }]}>
            Share your voice with the world. Tap the + button to write your
            first column.
          </Text>
        </View>
      ) : (
        <FlashList
          data={columns}
          keyExtractor={(item: any) => item.id || Math.random().toString()}
          contentContainerStyle={{
            paddingHorizontal: scale(20),
            paddingBottom: verticalScale(100),
          }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <ArticleCard
              item={item}
              index={index}
              isDark={isDark}
              colors={colors}
              isDeleting={isDeleting}
              onPress={() =>
                router.push({
                  pathname: "/ColumnDetails",
                  params: {
                    article: JSON.stringify({
                      ...item,
                      authorImage: userData?.photoURL,
                    }),
                  },
                })
              }
              onDelete={() => handleDeleteColumn(item.id)}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(50), // Safe area
    paddingBottom: verticalScale(20),
  },
  eyebrow: {
    fontSize: moderateScale(12),
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  heading: {
    fontSize: moderateScale(30),
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  addButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  summaryContainer: {
    paddingHorizontal: scale(20),
    marginBottom: verticalScale(15),
  },
  summaryText: {
    fontSize: moderateScale(14),
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  // Card Styles
  card: {
    borderRadius: moderateScale(20),
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 4,
    overflow: "hidden", // for accent line
  },
  accentLine: {
    width: 6,
    height: "100%",
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
  },
  cardContent: {
    padding: moderateScale(20),
    paddingLeft: moderateScale(26), // Make room for accent line
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(10),
  },
  dateText: {
    fontSize: moderateScale(11),
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontSize: moderateScale(18),
    fontWeight: "700",
    marginBottom: verticalScale(8),
    lineHeight: moderateScale(26),
  },
  cardPreview: {
    fontSize: moderateScale(14),
    lineHeight: moderateScale(22),
    marginBottom: verticalScale(20),
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statsContainer: {
    flexDirection: "row",
    gap: scale(15),
  },
  statBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statText: {
    fontSize: moderateScale(13),
    fontWeight: "600",
  },
  actionsContainer: {
    flexDirection: "row",
    gap: scale(10),
  },
  actionButton: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    justifyContent: "center",
    alignItems: "center",
  },

  // Empty State
  emptyStateContainer: {
    alignItems: "center",
    marginTop: verticalScale(60),
    paddingHorizontal: scale(40),
  },
  emptyIconCircle: {
    width: moderateScale(80),
    height: moderateScale(80),
    borderRadius: moderateScale(40),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: verticalScale(20),
  },
  noArticlesTitle: {
    fontSize: moderateScale(20),
    fontWeight: "700",
    marginBottom: verticalScale(10),
    textAlign: "center",
  },
  noArticlesSub: {
    fontSize: moderateScale(14),
    textAlign: "center",
    lineHeight: moderateScale(22),
    opacity: 0.7,
  },
});
