import Ionicons from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
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
import { useSavedArticles } from "../context/SavedArticlesContext";
import { useTheme } from "../context/ThemeContext";
import type { RootStackParamList } from '../types';


type DeepDiveNavProp = NativeStackNavigationProp<RootStackParamList, 'DeepDive'>;

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
  const navigation = useNavigation<DeepDiveNavProp>();
  const theme = useTheme(); // 🔑 access theme

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
        navigation.navigate("DeepDive", {
          urlToImage: props.urlToImage,
          title: props.title,
          description: props.description,
          content: props.content,
          url: props.url,
        })
      }
    >
      <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
        {/* Image */}
        {props.urlToImage ? (
          <Image source={{ uri: props.urlToImage }} style={styles.image} />
        ) : null}

        {/* title and description */}
        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.colors.text }]}>{props.title}</Text>
          <Text style={{ color: theme.colors.text }}>{props.description}</Text>

          {/* Author + date */}
          <View style={{ marginTop: 10 }}>
            <Text style={{ color: theme.colors.text }}>By: {props.author || "Unknown"}</Text>
            <Text style={{ color: theme.colors.text }}>
              {moment(String(props.publishedAt)).startOf('hour').fromNow()}
            </Text>
          </View>

          {/* Source */}
          <View style={{ marginTop: 10 }}>
            <Text style={{ color: theme.colors.text }}>Source: {props.source}</Text>
          </View>

          {/* Icons */}
          <View style={styles.iconRow}>
            <View style={styles.leftIcons}>
              {/* Like */}
              <TouchableOpacity style={styles.iconBtn} onPress={toggleLike}>
                <Ionicons
                  name={liked ? "heart" : "heart-outline"}
                  size={24}
                  color={liked ? "#E91E63" : theme.colors.text}
                />
                <Text style={[styles.likeCount, { color: theme.colors.text }]}>{likeCount}</Text>
              </TouchableOpacity>

              {/* Comment */}
              <TouchableOpacity style={styles.iconBtn} onPress={() => setModalVisible(true)}>
                <Ionicons name="chatbubble-outline" size={24} color={theme.colors.text} />
                <Text style={[styles.likeCount, { color: theme.colors.text }]}>{comments.length}</Text>
              </TouchableOpacity>

              {/* Share */}
              <TouchableOpacity style={styles.iconBtn} onPress={onShare}>
                <Ionicons name="paper-plane-outline" size={24} color={theme.colors.text} />
                <Text style={[styles.likeCount, { color: theme.colors.text }]}>{shareCount}</Text>
              </TouchableOpacity>
            </View>

            {/* Save */}
            <TouchableOpacity onPress={toggleSave}>
              <Ionicons
                name={isSaved ? "bookmark" : "bookmark-outline"}
                size={24}
                color={isSaved ? "#007BFF" : theme.colors.text}
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
      >
        <View style={[styles.bottomSheet, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.dragHandle, { backgroundColor: theme.colors.card }]} />
          <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Comments</Text>

          <FlatList
            data={comments}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.commentItem}>
                <Text style={[styles.commentText, { color: theme.colors.text }]}>
                  <Text style={{ fontWeight: "600" }}>user123 </Text>
                  {item.text}
                </Text>
                <View style={styles.commentMeta}>
                  <Text style={[styles.commentTime, { color: theme.colors.text }]}>
                    {moment(item.time).fromNow()}
                  </Text>
                  <TouchableOpacity onPress={() => toggleLikeComment(item.id)}>
                    <Text style={[styles.commentLike, { color: theme.colors.text }]}>
                      {item.liked ? "♥" : "♡"} {item.likes}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setReplyingTo(item.id)}>
                    <Text style={[styles.commentReply, { color: theme.colors.primary }]}>Reply</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />

          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={80}>
            <View>
              {replyingTo && (
                <Text style={[styles.replyingToText, { color: theme.colors.primary }]}>
                  Replying to {comments.find(c => c.id === replyingTo)?.text.slice(0, 20)}...
                </Text>
              )}
              <View style={[styles.inputRow, { borderColor: theme.colors.card }]}>
                <TextInput
                  style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.card }]}
                  placeholder="Add a comment..."
                  placeholderTextColor={theme.isDark ? "#aaa" : "#888"}
                  value={commentText}
                  onChangeText={setCommentText}
                />
                <TouchableOpacity onPress={addComment}>
                  <Text style={[styles.postBtn, { color: theme.colors.primary }]}>Post</Text>
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
    margin: 15,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15
  },
  content: {
    padding: 20
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    paddingBottom: 8
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    justifyContent: 'space-between',
  },
  leftIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  likeCount: {
    marginLeft: 5,
    fontSize: 14,
  },
  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },
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
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
  },
  commentItem: {
    marginBottom: 15,
  },
  commentText: {
    fontSize: 15,
  },
  commentMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
  },
  commentTime: {
    fontSize: 12,
  },
  commentLike: {
    fontSize: 12,
    marginRight: 15,
  },
  commentReply: {
    fontSize: 12,
  },
  replyingToText: {
    fontSize: 12,
    marginLeft: 10,
    marginBottom: 5,
  },
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
  postBtn: {
    fontWeight: "600",
  },
});

export default Articles;
