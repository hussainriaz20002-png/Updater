import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import moment from "moment";
import React, { useEffect, useState } from "react";
import {
  Image,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
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

  // Share state
  const [shareCount, setShareCount] = useState(0);

  //save states
  const { addArticle, removeArticle, savedArticles } = useSavedArticles();
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const exists = savedArticles.some(
      (a: { url: string }) => a.url === props.url,
    );
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
        url: props.url,
      });
    }
    setIsSaved(!isSaved);
  };

  // Share functionality
  const onShare = async () => {
    try {
      const result = await Share.share({
        message: `${props.title}\n\n${props.description}\n\nRead more: ${props.url} \n\nShared via Updater`,
      });
      if (result.action === Share.sharedAction) {
        setShareCount((prev) => prev + 1);
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
          },
        })
      }
    >
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            shadowColor: isDark ? "#000" : "#ccc",
          },
        ]}
      >
        {/* Image */}
        {props.urlToImage ? (
          <Image source={{ uri: props.urlToImage }} style={styles.image} />
        ) : null}

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.metaRow}>
            <Text
              style={[
                styles.sourceTag,
                {
                  color: colors.primary,
                  backgroundColor: isDark
                    ? "rgba(58, 123, 213, 0.1)"
                    : "#E3F2FD",
                },
              ]}
            >
              {props.source || "News"}
            </Text>
            <Text
              style={[styles.dateText, { color: isDark ? "#aaa" : "#888" }]}
            >
              {moment(String(props.publishedAt)).startOf("hour").fromNow()}
            </Text>
          </View>

          <Text
            style={[styles.title, { color: colors.text }]}
            numberOfLines={3}
          >
            {props.title}
          </Text>
          <Text
            style={[styles.description, { color: isDark ? "#bbb" : "#555" }]}
            numberOfLines={3}
          >
            {props.description}
          </Text>

          <View style={styles.authorRow}>
            <Ionicons
              name="person-circle-outline"
              size={moderateScale(16)}
              color={colors.text}
              style={{ opacity: 0.6, marginRight: 4 }}
            />
            <Text style={[styles.authorText, { color: colors.text }]}>
              {props.author || "Unknown"}
            </Text>
          </View>

          {/* Divider */}
          <View
            style={[
              styles.divider,
              { backgroundColor: isDark ? "#333" : "#eee" },
            ]}
          />

          {/* Actions */}
          <View style={styles.iconRow}>
            <View style={styles.leftIcons}>
              {/* Share */}
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={onShare}
                hitSlop={10}
              >
                <Ionicons
                  name="paper-plane-outline"
                  size={moderateScale(22)}
                  color={colors.text}
                />
                <Text style={[styles.actionText, { color: colors.text }]}>
                  {shareCount > 0 ? shareCount : ""}
                </Text>
              </TouchableOpacity>

              {/* Reading Time (Simulated) */}
              <View style={[styles.iconBtn, { marginLeft: scale(10) }]}>
                <Ionicons
                  name="time-outline"
                  size={moderateScale(18)}
                  color={isDark ? "#888" : "#aaa"}
                />
                <Text
                  style={[
                    styles.actionText,
                    {
                      color: isDark ? "#888" : "#aaa",
                      fontSize: moderateScale(12),
                    },
                  ]}
                >
                  4 min read
                </Text>
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
    </TouchableOpacity>
  );
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
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: verticalScale(200),
  },
  content: {
    padding: moderateScale(16),
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(8),
  },
  sourceTag: {
    fontSize: moderateScale(11),
    fontWeight: "700",
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(6),
    overflow: "hidden",
  },
  dateText: {
    fontSize: moderateScale(12),
  },
  title: {
    fontSize: moderateScale(18),
    fontWeight: "800",
    marginBottom: verticalScale(6),
    lineHeight: moderateScale(24),
  },
  description: {
    fontSize: moderateScale(14),
    lineHeight: moderateScale(20),
    marginBottom: verticalScale(10),
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(12),
  },
  authorText: {
    fontSize: moderateScale(12),
    fontWeight: "600",
    opacity: 0.8,
  },
  divider: {
    height: 1,
    width: "100%",
    marginBottom: verticalScale(12),
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: scale(16),
  },
  actionText: {
    marginLeft: scale(4),
    fontSize: moderateScale(13),
    fontWeight: "600",
  },
});

export default React.memo(Articles);
