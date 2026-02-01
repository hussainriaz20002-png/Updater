import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { db } from "../../config/firebase";

import DefaultAvatar from "../../components/DefaultAvatar";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import useFetch from "../../hooks/useFetch";

interface Journalist {
  id: string;
  name: string;
  image: any;
  role: string;
  columnCount: number;
}

export default function Column() {
  const [search, setSearch] = useState("");
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { userData } = useAuth();

  // Use useFetch to get all articles
  const { data: articles, loading } = useFetch<any>("articles", [], true);

  // Compute journalists list from articles
  const journalists = useMemo(() => {
    if (!articles) return [];

    // Group by author
    const authorMap: { [key: string]: { count: number; image: any } } = {};

    articles.forEach((article) => {
      if (article.author) {
        if (!authorMap[article.author]) {
          authorMap[article.author] = {
            count: 0,
            image: article.authorImage || null,
          };
        }
        authorMap[article.author].count++;
      }
    });

    // Convert to journalist array
    return Object.keys(authorMap).map((name, index) => ({
      id: index.toString(),
      name: name,
      image: authorMap[name].image || null,
      role: "Columnist",
      columnCount: authorMap[name].count,
    }));
  }, [articles]);

  // Extracting into a component to allow hooks
  const JournalistCard = ({ item }: { item: Journalist }) => {
    const [image, setImage] = useState(item.image);

    useEffect(() => {
      const fetchImage = async () => {
        try {
          // If we have an ID, use it (future proofing)
          // But currently aggregator generates fake IDs '0', '1', etc.
          // So we rely on name lookup.

          if (item.name) {
            const q = query(
              collection(db, "users"),
              where("name", "==", item.name),
              limit(1),
            );
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
              const data = snapshot.docs[0].data();
              if (data.photoURL) {
                setImage(data.photoURL);
              }
            }
          }
        } catch (e) {
          // silent fail
        }
      };

      // Only fetch if we suspect it's stale or default
      // Actually, always fetch to be safe? Or only if we don't trust the snapshot.
      // The snapshot comes from 'authorMap' which comes from 'articles'.
      // Updates to profile don't update 'articles' collection.
      // So we MUST fetch.
      fetchImage();
    }, [item.name]);

    return (
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            shadowColor: colors.primary,
            shadowOpacity: isDark ? 0.4 : 0.15,
          },
        ]}
        activeOpacity={0.9}
        onPress={() =>
          router.push({
            pathname: "/ReadColumns",
            params: { journalistId: item.id, journalistName: item.name },
          })
        }
      >
        <View style={styles.cardInner}>
          <View
            style={[
              styles.avatarContainer,
              { borderColor: colors.primary, shadowColor: colors.primary },
            ]}
          >
            {image ? (
              <Image
                source={{ uri: image }}
                style={styles.avatar}
                resizeMode="cover"
              />
            ) : (
              <DefaultAvatar name={item.name} size={moderateScale(65)} />
            )}
          </View>

          <View style={styles.cardContent}>
            <Text style={[styles.name, { color: colors.text }]}>
              {item.name}
            </Text>
            <View style={styles.badgeRow}>
              <View
                style={[
                  styles.roleBadge,
                  { backgroundColor: isDark ? "#333" : "#f0f0f0" },
                ]}
              >
                <Text style={[styles.roleText, { color: colors.text }]}>
                  Columnist
                </Text>
              </View>
              <View
                style={[
                  styles.countBadge,
                  { backgroundColor: colors.primary + "20" },
                ]}
              >
                <Ionicons
                  name="document-text-outline"
                  size={12}
                  color={colors.primary}
                  style={{ marginRight: 4 }}
                />
                <Text style={[styles.countText, { color: colors.primary }]}>
                  {item.columnCount}
                </Text>
              </View>
            </View>
          </View>

          <Ionicons
            name="chevron-forward"
            size={moderateScale(24)}
            color={colors.primary}
            style={{ opacity: 0.8 }}
          />
        </View>
      </TouchableOpacity>
    );
  };

  const filteredJournalists = journalists.filter((j) =>
    j.name.toLowerCase().includes(search.toLowerCase()),
  );

  const userRole = userData?.role;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Premium Header */}
      <View style={styles.header}>
        <Text style={[styles.headerSubtitle, { color: colors.primary }]}>
          DISCOVER
        </Text>
        <Text style={[styles.headerText, { color: colors.text }]}>
          Top Columnists
        </Text>
      </View>

      {/* Modern Search Bar */}
      <View
        style={[
          styles.searchContainer,
          {
            backgroundColor: colors.card,
            shadowColor: colors.primary,
            borderColor: isDark ? "#333" : "#f0f0f0",
          },
        ]}
      >
        <Ionicons
          name="search"
          size={moderateScale(20)}
          color={colors.primary}
          style={{ marginRight: scale(12) }}
        />
        <TextInput
          placeholder="Search journalists..."
          placeholderTextColor={isDark ? "#666" : "#aaa"}
          value={search}
          onChangeText={setSearch}
          style={[styles.searchInput, { color: colors.text }]}
        />
      </View>

      {/* List */}
      <FlashList
        data={filteredJournalists}
        renderItem={({ item }) => <JournalistCard item={item} />}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: verticalScale(100) }}
        refreshing={loading}
        onRefresh={() => {}} // useFetch handles realtime, but this prop is needed for pull-to-refresh feel if desired, though empty is fine for now
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="people-outline"
              size={moderateScale(48)}
              color={isDark ? "#333" : "#e0e0e0"}
            />
            <Text
              style={[styles.emptyText, { color: isDark ? "#666" : "#aaa" }]}
            >
              No columnists found
            </Text>
          </View>
        }
      />

      {/* Floating Action Buttons */}
      {userRole === "journalist" && (
        <>
          <TouchableOpacity
            style={[
              styles.fab,
              styles.fabSecondary,
              { backgroundColor: colors.card, borderColor: colors.primary },
            ]}
            onPress={() => router.push("/YourColumns")}
            activeOpacity={0.8}
          >
            <Ionicons name="layers-outline" size={24} color={colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.fab,
              { backgroundColor: colors.primary, shadowColor: colors.primary },
            ]}
            onPress={() => router.push("/UploadColumns")}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={32} color="#fff" />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(20),
  },
  header: {
    marginTop: verticalScale(20),
    marginBottom: verticalScale(20),
  },
  headerSubtitle: {
    fontSize: moderateScale(12),
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: verticalScale(4),
  },
  headerText: {
    fontSize: moderateScale(32),
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: moderateScale(25),
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(14),
    marginBottom: verticalScale(30),
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 5,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: moderateScale(16),
    fontFamily: "System",
  },
  card: {
    borderRadius: moderateScale(24),
    marginBottom: verticalScale(16),
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 12,
    elevation: 6,
  },
  cardInner: {
    flexDirection: "row",
    alignItems: "center",
    padding: moderateScale(16),
  },
  avatarContainer: {
    marginRight: scale(16),
    borderRadius: moderateScale(35),
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  avatar: {
    width: moderateScale(70),
    height: moderateScale(70),
    borderRadius: moderateScale(35),
    borderWidth: 2,
    borderColor: "#fff",
  },
  cardContent: {
    flex: 1,
    justifyContent: "center",
  },
  name: {
    fontSize: moderateScale(18),
    fontWeight: "700",
    marginBottom: verticalScale(8),
    letterSpacing: 0.3,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  roleBadge: {
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(10),
    marginRight: scale(8),
  },
  roleText: {
    fontSize: moderateScale(10),
    fontWeight: "700",
    textTransform: "uppercase",
  },
  countBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(10),
  },
  countText: {
    fontSize: moderateScale(10),
    fontWeight: "700",
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: verticalScale(50),
  },
  emptyText: {
    marginTop: verticalScale(10),
    fontSize: moderateScale(16),
  },
  fab: {
    position: "absolute",
    bottom: verticalScale(40),
    right: scale(20),
    width: moderateScale(60),
    height: moderateScale(60),
    borderRadius: moderateScale(30),
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  fabSecondary: {
    bottom: verticalScale(110),
    width: moderateScale(50),
    height: moderateScale(50),
    right: scale(25),
    borderWidth: 1,
  },
});
