import Ionicons from "@react-native-vector-icons/ionicons";
import { useIsFocused, useRoute } from "@react-navigation/native";
import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Modal from "react-native-modal";
import Video, { VideoRef } from "react-native-video";
import { useTheme } from "../../context/ThemeContext";

const { height, width } = Dimensions.get("window");

export default function Reels() {
  const route = useRoute<any>();
  const isFocused = useIsFocused();
  const { newReel } = route.params || {};
  const { isDark, colors } = useTheme();

  const flatListRef = useRef<FlatList<any>>(null);

  const [reels, setReels] = useState<any[]>([
    { uri: "https://www.w3schools.com/html/mov_bbb.mp4", caption: "Old Reel 1" },
    { uri: "https://www.w3schools.com/html/movie.mp4", caption: "Old Reel 2" },
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [pausedReels, setPausedReels] = useState<{ [key: number]: boolean }>({});
  const [likedReels, setLikedReels] = useState<{ [key: number]: boolean }>({});
  const [likeCounts, setLikeCounts] = useState<{ [key: number]: number }>({});
  const [shareCounts, setShareCounts] = useState<{ [key: number]: number }>({});
  const [showHeart, setShowHeart] = useState<{ [key: number]: boolean }>({});
  const [comments, setComments] = useState<{ [key: number]: any[] }>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const videoRefs = useRef<{ [key: number]: VideoRef | null }>({});

  // ✅ Add new reel if available
  useEffect(() => {
    if (newReel) {
      setReels((prev) => {
        const alreadyExists = prev.find((r) => r.uri === newReel.uri);
        if (alreadyExists) return prev;
        return [newReel, ...prev];
      });

      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ index: 0, animated: true });
        setCurrentIndex(0);
      }, 300);
    }
  }, [newReel]);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const newIndex = viewableItems[0].index;
      setCurrentIndex(newIndex);
      setPausedReels({});
      if (videoRefs.current[newIndex]) {
        videoRefs.current[newIndex]?.seek(0);
      }
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 90,
  }).current;

  //  Tap, double tap, pause, like
  const togglePause = (index: number) => {
    setPausedReels((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const toggleLike = (index: number) => {
    setLikedReels((prev) => {
      const alreadyLiked = prev[index] || false;
      setLikeCounts((counts) => ({
        ...counts,
        [index]: alreadyLiked
          ? Math.max((counts[index] || 1) - 1, 0)
          : (counts[index] || 0) + 1,
      }));
      return { ...prev, [index]: !alreadyLiked };
    });
  };

  const handleDoubleTap = (index: number) => {
    toggleLike(index);
    setShowHeart((prev) => ({ ...prev, [index]: true }));
    setTimeout(() => setShowHeart((prev) => ({ ...prev, [index]: false })), 800);
  };

  let lastTap: number | null = null;
  const handleTap = (index: number) => {
    const now = Date.now();
    if (lastTap && now - lastTap < 300) {
      handleDoubleTap(index);
      lastTap = null;
    } else {
      lastTap = now;
      setTimeout(() => {
        if (lastTap) {
          togglePause(index);
          lastTap = null;
        }
      }, 300);
    }
  };

  //  Comment logic
  const addComment = () => {
    if (!commentText.trim()) return;
    setComments((prev) => {
      const reelComments = prev[currentIndex] || [];
      if (replyingTo) {
        return {
          ...prev,
          [currentIndex]: reelComments.map((c) =>
            c.id === replyingTo
              ? {
                ...c,
                replies: [
                  ...c.replies,
                  { id: Date.now().toString(), text: commentText, time: new Date() },
                ],
              }
              : c
          ),
        };
      } else {
        return {
          ...prev,
          [currentIndex]: [
            ...reelComments,
            {
              id: Date.now().toString(),
              text: commentText,
              time: new Date(),
              likes: 0,
              liked: false,
              replies: [],
            },
          ],
        };
      }
    });
    setReplyingTo(null);
    setCommentText("");
  };

  const toggleLikeComment = (id: string) => {
    setComments((prev) => ({
      ...prev,
      [currentIndex]: prev[currentIndex].map((c) =>
        c.id === id ? { ...c, liked: !c.liked, likes: c.liked ? c.likes - 1 : c.likes + 1 } : c
      ),
    }));
  };

  // ✅ Share
  const handleShare = async (index: number, uri: string) => {
    try {
      await Share.share({ message: `${uri}\n\nShared via Updater` });
      setShareCounts((prev) => ({ ...prev, [index]: (prev[index] || 0) + 1 }));
    } catch (error) {
      console.log("Error sharing:", error);
    }
  };

  return (
    <>
      <FlatList
        ref={flatListRef}
        data={reels}
        keyExtractor={(_, index) => index.toString()}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={height} //  this ensures full-screen snap
        snapToAlignment="start"
        removeClippedSubviews={true}
        renderItem={({ item, index }) => {
          const isPaused = pausedReels[index] || false;
          const isLiked = likedReels[index] || false;
          const likeCount = likeCounts[index] || 0;
          const reelComments = comments[index] || [];
          const shareCount = shareCounts[index] || 0;

          return (
            <View
              style={[
                styles.container,
                { backgroundColor: isDark ? "#000" : "#fff" },
              ]}
            >
              <Video
                ref={(ref) => {
                  videoRefs.current[index] = ref;
                }}
                source={{ uri: item.uri }}
                style={styles.video}
                resizeMode="cover"
                repeat
                paused={!isFocused || currentIndex !== index || isPaused}
                muted={!isFocused || currentIndex !== index}
              />

              <Pressable style={styles.fullscreenPress} onPress={() => handleTap(index)}>
                {isPaused && (
                  <Ionicons name="play-circle" size={70} color="#fff" style={styles.playIcon} />
                )}
                {showHeart[index] && (
                  <Ionicons name="heart" size={120} color="#FF2D55" style={styles.heartIcon} />
                )}
              </Pressable>

              {/* Overlay */}
              <View style={styles.overlay}>
                <View style={styles.leftSide}>
                  <View style={styles.userRow}>
                    <Image
                      source={{ uri: "https://via.placeholder.com/40" }}
                      style={[styles.profilePicSmall, { borderColor: "#fff" }]}
                    />
                    <Text style={[styles.username, { color: "#fff" }]}>@dummy_user</Text>
                    <TouchableOpacity
                      style={[
                        styles.followBtn,
                        { backgroundColor: colors.primary },
                      ]}
                    >
                      <Text style={styles.followText}>Follow</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={[styles.caption, { color: "#fff" }]}>{item.caption}</Text>
                </View>

                <View style={styles.rightSide}>
                  <TouchableOpacity style={styles.iconBtn} onPress={() => toggleLike(index)}>
                    <Ionicons
                      name={isLiked ? "heart" : "heart-outline"}
                      size={28}
                      color={isLiked ? "#FF2D55" : "#fff"}
                    />
                    <Text style={[styles.iconText, { color: "#fff" }]}>{likeCount}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.iconBtn} onPress={() => setModalVisible(true)}>
                    <Ionicons name="chatbubble-outline" size={28} color="#fff" />
                    <Text style={[styles.iconText, { color: "#fff" }]}>
                      {reelComments.length}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.iconBtn}
                    onPress={() => handleShare(index, item.uri)}
                  >
                    <Ionicons name="paper-plane-outline" size={28} color="#fff" />
                    <Text style={[styles.iconText, { color: "#fff" }]}>{shareCount}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        }}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />

      {/* Comment Modal */}
      <Modal
        isVisible={modalVisible}
        onBackdropPress={() => setModalVisible(false)}
        style={styles.modal}
      >
        <View style={[styles.bottomSheet, { backgroundColor: colors.background }]}>
          <View style={[styles.dragHandle, { backgroundColor: isDark ? "#444" : "#ccc" }]} />
          <Text style={[styles.modalTitle, { color: colors.text }]}>Comments</Text>

          <FlatList
            data={comments[currentIndex] || []}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.commentItem}>
                <Text style={[styles.commentText, { color: colors.text }]}>
                  <Text style={{ fontWeight: "600" }}>user123 </Text>
                  {item.text}
                </Text>
                <View style={styles.commentMeta}>
                  <Text style={[styles.commentTime, { color: isDark ? "#aaa" : "#888" }]}>
                    {moment(item.time).fromNow()}
                  </Text>
                  <TouchableOpacity onPress={() => toggleLikeComment(item.id)}>
                    <Text style={[styles.commentLike, { color: colors.text }]}>
                      {item.liked ? "♥" : "♡"} {item.likes}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setReplyingTo(item.id)}>
                    <Text style={[styles.commentReply, { color: colors.primary }]}>Reply</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={80}
          >
            <View>
              {replyingTo && (
                <Text style={[styles.replyingToText, { color: colors.primary }]}>
                  Replying to...
                </Text>
              )}
              <View
                style={[
                  styles.inputRow,
                  { borderColor: isDark ? "#444" : "#eee" },
                ]}
              >
                <TextInput
                  style={[
                    styles.input,
                    {
                      borderColor: isDark ? "#555" : "#ddd",
                      color: colors.text,
                      backgroundColor: isDark ? "#1A1A1A" : "#fff",
                    },
                  ]}
                  placeholder="Add a comment..."
                  placeholderTextColor={isDark ? "#aaa" : "#888"}
                  value={commentText}
                  onChangeText={setCommentText}
                />
                <TouchableOpacity onPress={addComment}>
                  <Text style={[styles.postBtn, { color: colors.primary }]}>Post</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { width, height },
  video: { width: "100%", height: "100%", position: "absolute" },
  fullscreenPress: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  playIcon: { opacity: 0.8 },
  heartIcon: { opacity: 0.9 },
  overlay: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
  },
  leftSide: {
    position: "absolute",
    bottom: 100,
    left: 15,
    maxWidth: width * 0.65,
  },
  userRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  profilePicSmall: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    marginRight: 8,
  },
  username: { fontWeight: "bold", fontSize: 15, marginRight: 10 },
  followBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginLeft: 10,
  },
  followText: { color: "#fff", fontWeight: "600", fontSize: 12 },
  caption: { fontSize: 14, marginTop: 5 },
  rightSide: { position: "absolute", bottom: 220, right: 15, alignItems: "center" },
  iconBtn: { marginBottom: 25, alignItems: "center" },
  iconText: { fontSize: 12, marginTop: 2 },
  modal: { justifyContent: "flex-end", margin: 0 },
  bottomSheet: {
    height: "70%",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  dragHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 10,
  },
  modalTitle: { fontSize: 16, fontWeight: "700", marginBottom: 10 },
  commentItem: { marginBottom: 15 },
  commentText: { fontSize: 15 },
  commentMeta: { flexDirection: "row", alignItems: "center", marginTop: 3 },
  commentTime: { fontSize: 12, marginRight: 15 },
  commentLike: { fontSize: 12, marginRight: 15 },
  commentReply: { fontSize: 12 },
  replyingToText: { fontSize: 12, marginLeft: 10, marginBottom: 5 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
  },
  postBtn: { fontWeight: "600" },
});
