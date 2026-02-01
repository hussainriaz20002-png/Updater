import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { db } from "../config/firebase";
import { useTheme } from "../context/ThemeContext";
import {
  addComment,
  Comment,
  deleteComment,
  formatRelativeTime,
} from "../utils/columnUtils";
import DefaultAvatar from "./DefaultAvatar";

interface CommentSectionProps {
  articleId: string;
  userId: string;
  userName: string;
  articleAuthor: string;
}

export default function CommentSection({
  articleId,
  userId,
  userName,
  articleAuthor,
}: CommentSectionProps) {
  const { colors, isDark } = useTheme();
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingComments, setLoadingComments] = useState(true);

  // Real-time listener for comments
  useEffect(() => {
    if (!articleId) return;

    const commentsRef = collection(db, "articles", articleId, "comments");
    const q = query(commentsRef, orderBy("timestamp", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedComments = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Comment[];
      setComments(fetchedComments);
      setLoadingComments(false);
    });

    return () => unsubscribe();
  }, [articleId]);

  const handleAddComment = async () => {
    if (!commentText.trim()) return;

    setIsSubmitting(true);
    try {
      await addComment(articleId, userId, userName, commentText);
      setCommentText("");
      Keyboard.dismiss();
    } catch (error) {
      console.error("Error adding comment:", error);
      Alert.alert("Error", "Failed to add comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    Alert.alert("Delete", "Delete this comment?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteComment(articleId, commentId, userId);
            // No need to update state manually, listener handles it
          } catch (error) {
            Alert.alert("Error", "Failed to delete.");
          }
        },
      },
    ]);
  };

  const renderComment = ({ item }: { item: Comment }) => {
    // Only the comment creator can delete their own comment
    // (Requested: "everyone can delete their comments")
    const canDelete = item.userId === userId;

    return (
      <View style={styles.commentRow}>
        <DefaultAvatar name={item.userName} size={moderateScale(32)} />
        <View style={styles.commentContent}>
          <View
            style={[
              styles.bubble,
              { backgroundColor: isDark ? "#2A2A2A" : "#F5F7FA" },
            ]}
          >
            <View style={styles.bubbleHeader}>
              <Text style={[styles.commentUser, { color: colors.text }]}>
                {item.userName}
              </Text>
              <Text
                style={[
                  styles.commentTime,
                  { color: isDark ? "#888" : "#999" },
                ]}
              >
                {formatRelativeTime(item.timestamp)}
              </Text>
            </View>
            <Text
              style={[styles.commentText, { color: isDark ? "#ddd" : "#333" }]}
            >
              {item.text}
            </Text>
          </View>

          {canDelete && (
            <TouchableOpacity
              onPress={() => handleDeleteComment(item.id)}
              style={styles.deleteAction}
            >
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Input Area (Sticky Top) */}
      <View
        style={[
          styles.inputWrapper,
          {
            borderColor: isDark ? "#444" : "#e0e0e0",
            backgroundColor: isDark ? "#222" : "#fff",
          },
        ]}
      >
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder="Add a comment..."
          placeholderTextColor={isDark ? "#666" : "#999"}
          value={commentText}
          onChangeText={setCommentText}
          multiline
        />
        <TouchableOpacity
          style={[
            styles.sendBtn,
            {
              backgroundColor: commentText.trim()
                ? colors.primary
                : isDark
                  ? "#333"
                  : "#f0f0f0",
            },
          ]}
          disabled={!commentText.trim() || isSubmitting}
          onPress={handleAddComment}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons
              name="arrow-up"
              size={18}
              color={commentText.trim() ? "#fff" : "#aaa"}
            />
          )}
        </TouchableOpacity>
      </View>

      {/* Comments List (Scrollable) */}
      <View style={styles.listContainer}>
        {loadingComments ? (
          <View style={{ marginTop: 20 }}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : comments.length === 0 ? (
          <View style={{ alignItems: "center", marginTop: 20 }}>
            <Text
              style={[styles.emptyText, { color: isDark ? "#555" : "#aaa" }]}
            >
              No comments yet.
            </Text>
            <Text style={{ fontSize: 12, color: isDark ? "#444" : "#ccc" }}>
              Be the first to share your thoughts!
            </Text>
          </View>
        ) : (
          <FlashList
            data={comments}
            renderItem={renderComment}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // Take up remaining space
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(15),
    borderWidth: 1,
    borderRadius: moderateScale(25),
    paddingHorizontal: scale(6),
    paddingVertical: verticalScale(4),
  },
  input: {
    flex: 1,
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(10),
    fontSize: moderateScale(14),
    maxHeight: verticalScale(80),
  },
  sendBtn: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 4,
  },
  listContainer: {
    flex: 1, // Fill remaining space for scrolling
  },
  commentRow: {
    flexDirection: "row",
    marginBottom: verticalScale(16),
  },
  commentContent: {
    flex: 1,
    marginLeft: scale(10),
  },
  bubble: {
    padding: moderateScale(12),
    borderRadius: moderateScale(16),
    borderTopLeftRadius: 4,
  },
  bubbleHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: verticalScale(4),
  },
  commentUser: {
    fontSize: moderateScale(13),
    fontWeight: "700",
  },
  commentTime: {
    fontSize: moderateScale(10),
  },
  commentText: {
    fontSize: moderateScale(14),
    lineHeight: moderateScale(20),
  },
  deleteAction: {
    marginTop: verticalScale(4),
    marginLeft: 4,
    alignSelf: "flex-start",
  },
  deleteText: {
    fontSize: moderateScale(11),
    color: "#ff4444",
    fontWeight: "600",
  },
  emptyText: {
    textAlign: "center",
    fontSize: moderateScale(14),
    fontWeight: "600",
    marginBottom: 4,
  },
});
