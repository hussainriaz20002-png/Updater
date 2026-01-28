import { Ionicons } from "@expo/vector-icons";
import { useRouter } from 'expo-router';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Modal from "react-native-modal";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { useSavedArticles } from "../context/SavedArticlesContext";
import { useTheme } from "../context/ThemeContext";

const Articles = (props: {
  urlToImage: string;
  title: string;
  description: string;
  author: string;
  publishedAt: string;
  source: string;
  content?: string;
  url: string;
}) => {
  const router = useRouter();
  const theme = useTheme();
  const { colors, isDark } = theme;

  // Like states
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  // Share state
  const [shareCount, setShareCount] = useState(0);

  // Comment states
  const [comments, setComments] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  //save states
  const { addArticle, removeArticle, savedArticles } = useSavedArticles();
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const exists = savedArticles.some((a: { url: string; }) => a.url === props.url);
    setIsSaved(exists);
  }, [savedArticles]);

  const toggleSave = () => {
    if (isSaved) {
      removeArticle(props.url);
    } else {
      addArticle({
        urlToImage: props.urlToImage,
        title: props.title,
        description: props.description,
        author: props.author,
        publishedAt: props.publishedAt,
        source: props.source,
        url: props.url
      });
    }
    setIsSaved(!isSaved);
  };


  const toggleLike = () => {
    let newLiked = !liked;
    setLiked(newLiked);
    setLikeCount(newLiked ? likeCount + 1 : likeCount - 1);
  };

  const addComment = () => {
    if (commentText.trim().length === 0) return;
    if (replyingTo) {
      setComments(comments.map(c =>
        c.id === replyingTo
          ? { ...c, replies: [...c.replies, { id: Date.now().toString(), text: commentText.trim(), time: new Date() }] }
          : c
      ));
      setReplyingTo(null);
    } else {
      const newComment = {
        id: Date.now().toString(),
        text: commentText.trim(),
        time: new Date(),
        likes: 0,
        liked: false,
        replies: []
      };
      setComments([...comments, newComment]);
    }
    setCommentText("");
  };

  const toggleLikeComment = (id: string) => {
    setComments(comments.map(c =>
      c.id === id ? { ...c, liked: !c.liked, likes: c.liked ? c.likes - 1 : c.likes + 1 } : c
    ));
  };

  // Share functionality
  const onShare = async () => {
    try {
      const result = await Share.share({
        message: `${props.title}\n\n${props.description}\n\nRead more: ${props.url} \n\nShared via Updater`,
      });
      if (result.action === Share.sharedAction) {
        setShareCount(prev => prev + 1);
      }
    } catch (error: any) {
      console.error(error.message);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() =>
        router.push({
          pathname: "/DeepDive",
          params: {
            urlToImage: props.urlToImage,
            title: props.title,
            description: props.description,
            content: props.content,
            url: props.url,
          }
        })
      }
    >
      <View style={[styles.card, {
        backgroundColor: colors.card,
        shadowColor: isDark ? "#000" : "#ccc",
      }]}>
        {/* Image */}
        {props.urlToImage ? (
          <Image source={{ uri: props.urlToImage }} style={styles.image} />
        ) : null}

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.metaRow}>
            <Text style={[styles.sourceTag, { color: colors.primary, backgroundColor: isDark ? 'rgba(58, 123, 213, 0.1)' : '#E3F2FD' }]}>
              {props.source || "News"}
            </Text>
            <Text style={[styles.dateText, { color: isDark ? "#aaa" : "#888" }]}>
              {moment(String(props.publishedAt)).startOf('hour').fromNow()}
            </Text>
          </View>

          <Text style={[styles.title, { color: colors.text }]} numberOfLines={3}>{props.title}</Text>
          <Text style={[styles.description, { color: isDark ? "#bbb" : "#555" }]} numberOfLines={3}>
            {props.description}
          </Text>

          <View style={styles.authorRow}>
            <Ionicons name="person-circle-outline" size={moderateScale(16)} color={colors.text} style={{ opacity: 0.6, marginRight: 4 }} />
            <Text style={[styles.authorText, { color: colors.text }]}>{props.author || "Unknown"}</Text>
          </View>

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: isDark ? '#333' : '#eee' }]} />

          {/* Actions */}
          <View style={styles.iconRow}>
            <View style={styles.leftIcons}>
              {/* Like */}
              <TouchableOpacity style={styles.iconBtn} onPress={toggleLike} hitSlop={10}>
                <Ionicons
                  name={liked ? "heart" : "heart-outline"}
                  size={moderateScale(22)}
                  color={liked ? "#E91E63" : colors.text}
                />
                <Text style={[styles.actionText, { color: colors.text }]}>{likeCount > 0 ? likeCount : ''}</Text>
              </TouchableOpacity>

              {/* Comment */}
              <TouchableOpacity style={styles.iconBtn} onPress={() => setModalVisible(true)} hitSlop={10}>
                <Ionicons name="chatbubble-outline" size={moderateScale(22)} color={colors.text} />
                <Text style={[styles.actionText, { color: colors.text }]}>{comments.length > 0 ? comments.length : ''}</Text>
              </TouchableOpacity>

              {/* Share */}
              <TouchableOpacity style={styles.iconBtn} onPress={onShare} hitSlop={10}>
                <Ionicons name="paper-plane-outline" size={moderateScale(22)} color={colors.text} />
                <Text style={[styles.actionText, { color: colors.text }]}>{shareCount > 0 ? shareCount : ''}</Text>
              </TouchableOpacity>

              {/* Reading Time (Simulated) */}
              <View style={[styles.iconBtn, { marginLeft: scale(10) }]}>
                <Ionicons name="time-outline" size={moderateScale(18)} color={isDark ? "#888" : "#aaa"} />
                <Text style={[styles.actionText, { color: isDark ? "#888" : "#aaa", fontSize: moderateScale(12) }]}>4 min read</Text>
              </View>
            </View>

            {/* Save */}
            <TouchableOpacity onPress={toggleSave} hitSlop={10}>
              <Ionicons
                name={isSaved ? "bookmark" : "bookmark-outline"}
                size={moderateScale(22)}
                color={isSaved ? colors.primary : colors.text}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Comments Modal */}
      <Modal
        isVisible={modalVisible}
        onBackdropPress={() => setModalVisible(false)}
        onSwipeComplete={() => setModalVisible(false)}
        swipeDirection="down"
        style={styles.modal}
        avoidKeyboard
      >
        <View style={[styles.bottomSheet, { backgroundColor: colors.background }]}>
          <View style={[styles.dragHandle, { backgroundColor: isDark ? '#444' : '#ddd' }]} />
          <Text style={[styles.modalTitle, { color: colors.text }]}>Comments</Text>

          <FlatList
            data={comments}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.commentItem}>
                <View style={[styles.avatarPlaceholder, { backgroundColor: isDark ? '#333' : '#eee' }]}>
                  <Text style={{ color: colors.text, fontWeight: 'bold' }}>U</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.commentText, { color: colors.text }]}>
                    <Text style={{ fontWeight: "700" }}>user123 </Text>
                    {item.text}
                  </Text>
                  <View style={styles.commentMeta}>
                    <Text style={[styles.commentTime, { color: isDark ? '#888' : '#999' }]}>
                      {moment(item.time).fromNow()}
                    </Text>
                    <TouchableOpacity onPress={() => toggleLikeComment(item.id)} style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 15 }}>
                      <Text style={[styles.commentLike, { color: isDark ? '#888' : '#999' }]}>
                        {item.liked ? "♥" : "♡"} {item.likes}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setReplyingTo(item.id)} style={{ marginLeft: 15 }}>
                      <Text style={[styles.commentReply, { color: colors.primary }]}>Reply</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <View style={{ alignItems: 'center', marginTop: 50 }}>
                <Text style={{ color: isDark ? '#666' : '#999' }}>No comments yet. Be the first!</Text>
              </View>
            }
          />

          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <View>
              {replyingTo && (
                <View style={styles.replyingContainer}>
                  <Text style={[styles.replyingToText, { color: colors.primary }]}>
                    Replying to user...
                  </Text>
                  <TouchableOpacity onPress={() => setReplyingTo(null)}>
                    <Ionicons name="close-circle" size={16} color={colors.text} />
                  </TouchableOpacity>
                </View>
              )}
              <View style={[styles.inputRow, { borderColor: isDark ? '#333' : '#eee', borderTopWidth: 1 }]}>
                <TextInput
                  style={[styles.input, { color: colors.text, backgroundColor: isDark ? '#222' : '#f5f5f5' }]}
                  placeholder="Add a comment..."
                  placeholderTextColor={isDark ? "#888" : "#aaa"}
                  value={commentText}
                  onChangeText={setCommentText}
                />
                <TouchableOpacity onPress={addComment} disabled={!commentText.trim()}>
                  <Text style={[styles.postBtn, { color: commentText.trim() ? colors.primary : (isDark ? '#444' : '#ccc') }]}>Post</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </TouchableOpacity>
  )
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: scale(15),
    marginVertical: verticalScale(10),
    borderRadius: moderateScale(16),
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: verticalScale(200),
  },
  content: {
    padding: moderateScale(16),
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  sourceTag: {
    fontSize: moderateScale(11),
    fontWeight: '700',
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(6),
    overflow: 'hidden',
  },
  dateText: {
    fontSize: moderateScale(12),
  },
  title: {
    fontSize: moderateScale(18),
    fontWeight: '800',
    marginBottom: verticalScale(6),
    lineHeight: moderateScale(24),
  },
  description: {
    fontSize: moderateScale(14),
    lineHeight: moderateScale(20),
    marginBottom: verticalScale(10),
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  authorText: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    opacity: 0.8,
  },
  divider: {
    height: 1,
    width: '100%',
    marginBottom: verticalScale(12),
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: scale(16),
  },
  actionText: {
    marginLeft: scale(4),
    fontSize: moderateScale(13),
    fontWeight: '600',
  },

  // Modal Styles
  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  bottomSheet: {
    height: "75%",
    borderTopLeftRadius: moderateScale(24),
    borderTopRightRadius: moderateScale(24),
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(12),
    paddingBottom: verticalScale(20),
  },
  dragHandle: {
    width: scale(40),
    height: verticalScale(4),
    borderRadius: moderateScale(2),
    alignSelf: "center",
    marginBottom: verticalScale(20),
    opacity: 0.5,
  },
  modalTitle: {
    fontSize: moderateScale(18),
    fontWeight: "800",
    marginBottom: verticalScale(20),
    textAlign: 'center',
  },
  commentItem: {
    marginBottom: verticalScale(20),
    flexDirection: 'row',
  },
  avatarPlaceholder: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
  },
  commentText: {
    fontSize: moderateScale(14),
    lineHeight: moderateScale(20),
  },
  commentMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: verticalScale(6),
  },
  commentTime: {
    fontSize: moderateScale(11),
  },
  commentLike: {
    fontSize: moderateScale(12),
  },
  commentReply: {
    fontSize: moderateScale(12),
    fontWeight: '600',
  },
  replyingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(8),
    paddingHorizontal: scale(4),
  },
  replyingToText: {
    fontSize: moderateScale(12),
    fontWeight: '500',
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: verticalScale(12),
  },
  input: {
    flex: 1,
    borderRadius: moderateScale(24),
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(10),
    marginRight: scale(12),
    fontSize: moderateScale(14),
  },
  postBtn: {
    fontWeight: "700",
    fontSize: moderateScale(15),
  },
});

export default React.memo(Articles);
