import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import CommentSection from "../components/CommentSection";
import DefaultAvatar from "../components/DefaultAvatar";
import { db } from "../config/firebase";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { toggleLike } from "../utils/columnUtils";

// Calculate reading time
const calculateReadingTime = (text: string) => {
  if (!text) return "1 min read";
  const wordsPerMinute = 200;
  const words = text.split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
};

export default function ArticleDetail() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { userData } = useAuth();
  const params = useLocalSearchParams();

  // Likes and comments state
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showComments, setShowComments] = useState(false);

  // Constants
  // Parsing param safely
  let article: any = params.article;
  if (typeof article === "string") {
    try {
      article = JSON.parse(article);
    } catch (e) {
      console.error("Error parsing article", e);
      article = {};
    }
  }

  // Animations
  const contentAnim = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  // Header Animation Interpolations
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const titleScale = contentAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1],
  });

  const contentTranslateY = contentAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [40, 0],
  });

  useEffect(() => {
    // Advanced Entry Animation
    Animated.timing(contentAnim, {
      toValue: 1,
      duration: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  // Real-time Listeners for Likes
  useEffect(() => {
    if (!article.id) return;
    const userId = userData?.uid || userData?.email || "guest"; // using UID mostly

    // Listen to the specific article document for likes updates
    const articleRef = doc(db, "articles", article.id);
    const unsubscribe = onSnapshot(articleRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const likes = data.likes || [];
        setLikeCount(likes.length);
        setLiked(likes.includes(userId));
      }
    });

    return () => unsubscribe();
  }, [article.id, userData]);

  // Fetch dynamic author image
  // Optimization: If current user is the author, use their data immediately to prevent flash
  const isSelf =
    userData &&
    (userData.uid === article.authorId || userData.name === article.author);

  const initialImage =
    isSelf && userData?.photoURL ? userData.photoURL : article.authorImage;

  const [authorImage, setAuthorImage] = useState(initialImage);
  useEffect(() => {
    const fetchAuthor = async () => {
      try {
        // 1. Try with authorId (New Articles)
        if (article.authorId) {
          const userDoc = await getDoc(doc(db, "users", article.authorId));
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.photoURL) {
              setAuthorImage(data.photoURL);
            }
          }
        }
        // 2. Fallback: Try with Author Name (Old Articles)
        else if (article.author) {
          // Optimization: If current user is the author, use their data immediately
          if (
            userData &&
            userData.name === article.author &&
            userData.photoURL
          ) {
            setAuthorImage(userData.photoURL);
            return;
          }

          // Otherwise query by name
          const q = query(
            collection(db, "users"),
            where("name", "==", article.author),
            limit(1),
          );
          const snapshot = await getDocs(q);
          if (!snapshot.empty) {
            const data = snapshot.docs[0].data();
            if (data.photoURL) {
              setAuthorImage(data.photoURL);
            }
          }
        }
      } catch (e) {
        console.log("Error fetching author details", e);
      }
    };

    fetchAuthor();
  }, [article.authorId, article.author, userData]);

  const handleLikeToggle = async () => {
    const userId = userData?.uid || userData?.email || "guest";
    // Optimistic Update (Visual) - disabled because we have realtime listener which is fast enough
    // But for instant feedback we can toggle local state, though listener will correct it.

    // Just call the util
    try {
      await toggleLike(article.id, userId);
    } catch (error) {
      console.error(error);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Read "${article.title}" by ${article.author}. \n\nCheck it out!`,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const readingTime = calculateReadingTime(article.column || "");

  const isUrdu = article.language === "urdu";
  const textAlign = isUrdu ? "right" : "left";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Dynamic Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[
            styles.backBtn,
            {
              backgroundColor: isDark
                ? "rgba(0,0,0,0.3)"
                : "rgba(255,255,255,0.8)",
            },
          ]}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <Animated.View
          style={{ opacity: headerOpacity, flex: 1, alignItems: "center" }}
        >
          <Text
            style={[styles.miniHeaderTitle, { color: colors.text }]}
            numberOfLines={1}
          >
            {article.author}
          </Text>
        </Animated.View>

        <View style={styles.headerRight} />
      </View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
        scrollEventThrottle={16}
      >
        {/* 1. Author Info Section */}
        <Animated.View
          style={[
            styles.authorSection,
            {
              opacity: contentAnim,
              transform: [{ translateY: contentTranslateY }],
              flexDirection: isUrdu ? "row-reverse" : "row", // Reverse for Urdu
            },
          ]}
        >
          <DefaultAvatar
            name={article.author}
            size={moderateScale(56)}
            source={authorImage}
          />
          <View
            style={[
              styles.authorTextContainer,
              {
                marginRight: isUrdu ? scale(16) : 0,
                marginLeft: isUrdu ? 0 : scale(16),
              },
            ]}
          >
            <Text
              style={[
                styles.authorName,
                { color: colors.text, textAlign: textAlign },
              ]}
            >
              {article.author}
            </Text>
            <View
              style={[
                styles.metaRow,
                { flexDirection: isUrdu ? "row-reverse" : "row" },
              ]}
            >
              <Text style={[styles.dateText, { color: colors.secondaryText }]}>
                {article.date || "Recent"}
              </Text>
              <View
                style={[styles.dot, { backgroundColor: colors.secondaryText }]}
              />
              <Text style={[styles.dateText, { color: colors.primary }]}>
                {readingTime}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* 2. Title Section */}
        <Animated.Text
          style={[
            styles.articleTitle,
            {
              color: colors.text,
              opacity: contentAnim,
              transform: [{ scale: titleScale }],
              textAlign: textAlign,
            },
          ]}
        >
          {article.title}
        </Animated.Text>

        {/* Divider */}
        <View
          style={[
            styles.divider,
            {
              backgroundColor: isDark ? "#333" : "#eee",
              marginVertical: verticalScale(20),
              alignSelf: isUrdu ? "flex-end" : "flex-start", // Align divider too
            },
          ]}
        />

        {/* 3. Content Section */}
        <Animated.Text
          style={[
            styles.articleContent,
            {
              color: colors.text,
              lineHeight: moderateScale(30),
              opacity: contentAnim,
              transform: [{ translateY: contentTranslateY }],
              textAlign: textAlign,
            },
          ]}
        >
          {article.column}
        </Animated.Text>

        {/* 4. Inline Interaction Bar */}
        <Animated.View
          style={[
            styles.inlineActions,
            {
              borderTopColor: isDark ? "#333" : "#eee",
              borderBottomColor: isDark ? "#333" : "#eee",
              opacity: contentAnim,
              transform: [{ translateY: contentTranslateY }], // Moves up with content
            },
          ]}
        >
          {/* Like Interaction */}
          <View style={styles.interactionGroup}>
            <TouchableOpacity
              style={[
                styles.interactionBtn,
                liked && styles.activeInteraction,
                { backgroundColor: isDark ? "#2A2A2A" : "#F5F7FA" },
              ]}
              onPress={handleLikeToggle}
              activeOpacity={0.7}
            >
              <Animated.View
                style={{ transform: [{ scale: liked ? 1.1 : 1 }] }}
              >
                <Ionicons
                  name={liked ? "heart" : "heart-outline"}
                  size={22}
                  color={liked ? "#FF4B4B" : colors.text}
                />
              </Animated.View>
              <Text
                style={[
                  styles.interactionText,
                  { color: liked ? "#FF4B4B" : colors.text },
                ]}
              >
                {likeCount}
              </Text>
            </TouchableOpacity>

            {/* Comment Interaction */}
            <TouchableOpacity
              style={[
                styles.interactionBtn,
                { backgroundColor: isDark ? "#2A2A2A" : "#F5F7FA" },
              ]}
              onPress={() => setShowComments(!showComments)}
            >
              <Ionicons
                name="chatbubble-outline"
                size={20}
                color={colors.text}
              />
              <Text style={[styles.interactionText, { color: colors.text }]}>
                Comments
              </Text>
            </TouchableOpacity>
          </View>

          {/* Share Button */}
          <TouchableOpacity
            style={[
              styles.shareBtn,
              { backgroundColor: isDark ? "#2A2A2A" : "#F5F7FA" },
            ]}
            onPress={handleShare}
          >
            <Ionicons name="share-outline" size={20} color={colors.text} />
          </TouchableOpacity>
        </Animated.View>

        {/* Spacing for bottom */}
        <View style={{ height: verticalScale(60) }} />
      </Animated.ScrollView>

      {/* Comment Section Modal/Sheet */}
      {showComments && (
        <View
          style={[
            styles.commentsContainer,
            {
              backgroundColor: colors.background,
              shadowColor: isDark ? "#fff" : "#000",
            },
          ]}
        >
          <View
            style={[
              styles.commentHeader,
              { borderBottomColor: isDark ? "#333" : "#eee" },
            ]}
          >
            <Text style={[styles.commentTitle, { color: colors.text }]}>
              Comments
            </Text>
            <TouchableOpacity
              onPress={() => setShowComments(false)}
              hitSlop={15}
            >
              <Ionicons
                name="close-circle"
                size={28}
                color={colors.secondaryText || "#888"}
              />
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1 }}>
            <CommentSection
              articleId={article.id || ""}
              userId={userData?.uid || "guest"}
              userName={userData?.name || "Guest"}
              userImage={userData?.photoURL} // Pass user image
              articleAuthor={article.author}
            />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: verticalScale(40),
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(10),
  },
  miniHeaderTitle: {
    fontSize: moderateScale(16),
    fontWeight: "700",
    opacity: 0, // Controlled by Animated.View
  },
  backBtn: {
    padding: 8,
    borderRadius: 20,
  },
  headerRight: {
    width: 40,
    alignItems: "flex-end",
  },
  scrollContent: {
    paddingHorizontal: scale(24),
    paddingTop: verticalScale(90), // Space for absolute header
  },
  authorSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(24),
  },
  authorTextContainer: {
    marginLeft: scale(16),
  },
  authorName: {
    fontSize: moderateScale(18),
    fontWeight: "800",
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    fontSize: moderateScale(13),
    fontWeight: "600",
    opacity: 0.7,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 8,
    opacity: 0.5,
  },
  articleTitle: {
    fontSize: moderateScale(32),
    fontWeight: "900", // Heavy
    marginBottom: verticalScale(10),
    lineHeight: moderateScale(40),
    letterSpacing: -0.8,
  },
  divider: {
    height: 1,
    width: "15%",
  },
  articleContent: {
    fontSize: moderateScale(19),
    fontWeight: "400",
    letterSpacing: 0.3,
    fontFamily: "System",
  },
  inlineActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: verticalScale(50),
    paddingVertical: verticalScale(24),
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  interactionGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(16),
  },
  interactionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(12),
    borderRadius: 30,
  },
  activeInteraction: {
    // Optional additional styling for active state
  },
  interactionText: {
    fontSize: moderateScale(15),
    fontWeight: "700",
  },
  shareBtn: {
    padding: 12,
    borderRadius: 30,
  },
  commentsContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "85%", // Taller sheet for better reading
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    elevation: 80,
    zIndex: 200,
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.2,
    shadowRadius: 30,
    padding: scale(24),
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: verticalScale(20),
    borderBottomWidth: 1,
    marginBottom: verticalScale(10),
  },
  commentTitle: {
    fontSize: moderateScale(22),
    fontWeight: "800",
  },
});
