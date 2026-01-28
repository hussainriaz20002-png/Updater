
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FlashList } from "@shopify/flash-list";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

// @ts-ignore
import hamidMir from '../../assets/images/HamidMir.png';
// @ts-ignore
import najamSethi from '../../assets/images/najamSethi.jpg';
import { useTheme } from "../../context/ThemeContext";

const journalists = [
  {
    id: "1",
    name: "Najam Sethi",
    image: najamSethi,
    role: "Senior Analyst"
  },
  {
    id: "2",
    name: "Hamid Mir",
    image: hamidMir,
    role: "Geo News"
  },
];

export default function Column() {
  const [search, setSearch] = useState("");
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [userRole, setUserRole] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      const checkRole = async () => {
        try {
          const role = await AsyncStorage.getItem("userRole");
          setUserRole(role);
        } catch (e) {
          console.error("Failed to fetch role", e);
        }
      };
      checkRole();
    }, [])
  );

  const renderJournalist = ({ item }: any) => (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          shadowColor: colors.primary,
        },
      ]}
    >
      <View style={[styles.avatarContainer, { borderColor: isDark ? '#444' : '#eee' }]}>
        <Image source={item.image} style={styles.avatar} resizeMode="cover" />
      </View>

      <View style={styles.cardContent}>
        <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.role, { color: isDark ? '#aaa' : '#666' }]}>{item.role}</Text>

        <TouchableOpacity
          style={[styles.readBtn, { backgroundColor: colors.primary }]}
          activeOpacity={0.8}
          onPress={() =>
            router.push({ pathname: "/ReadColumns", params: { journalistId: item.id, journalistName: item.name } })
          }
        >
          <Text style={styles.readText}>Read Columns</Text>
          <Ionicons name="arrow-forward" size={moderateScale(14)} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerText, { color: colors.text }]}>Columnists</Text>
      </View>

      {/* Search Bar */}
      <View
        style={[
          styles.searchContainer,
          {
            backgroundColor: colors.card,
            shadowColor: isDark ? "#000" : "#ccc"
          },
        ]}
      >
        <Ionicons name="search-outline" size={moderateScale(20)} color={colors.primary} style={{ marginRight: scale(10) }} />
        <TextInput
          placeholder="Search for columnists..."
          placeholderTextColor={isDark ? "#888" : "#999"}
          value={search}
          onChangeText={setSearch}
          style={[styles.searchInput, { color: colors.text }]}
        />
      </View>

      {/* Columnists List */}
      <FlashList
        data={journalists.filter((j) =>
          j.name.toLowerCase().includes(search.toLowerCase())
        )}
        renderItem={renderJournalist}
        keyExtractor={(item) => item.id}
        estimatedItemSize={moderateScale(120)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: verticalScale(100) }}
      />

      {/*  Show both FABs only if logged-in user is a columnist (journalist) */}
      {userRole === "journalist" && (
        <>
          {/* Newspaper FAB (upper circle) */}
          <TouchableOpacity
            style={[styles.fab, styles.secondFab, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/YourColumns")}
            activeOpacity={0.8}
          >
            <Ionicons name="newspaper-outline" size={moderateScale(24)} color="#fff" />
          </TouchableOpacity>

          {/* Pencil FAB (bottom circle) */}
          <TouchableOpacity
            style={[styles.fab, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/UploadColumns")}
            activeOpacity={0.8}
          >
            <Ionicons name="pencil" size={moderateScale(24)} color="#fff" />
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
    marginBottom: verticalScale(15)
  },
  headerText: {
    fontSize: moderateScale(28),
    fontWeight: "800",
    letterSpacing: 0.5
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: moderateScale(16),
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
    marginBottom: verticalScale(25),
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: moderateScale(16),
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: moderateScale(20),
    padding: moderateScale(16),
    marginBottom: verticalScale(16),
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarContainer: {
    width: moderateScale(70),
    height: moderateScale(70),
    borderRadius: moderateScale(35),
    borderWidth: 2,
    overflow: 'hidden',
    marginRight: scale(16),
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center'
  },
  name: {
    fontSize: moderateScale(18),
    fontWeight: "700",
    marginBottom: verticalScale(2)
  },
  role: {
    fontSize: moderateScale(14),
    fontWeight: '500',
    marginBottom: verticalScale(10)
  },
  readBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(8),
    paddingHorizontal: scale(16),
    borderRadius: moderateScale(20),
    alignSelf: "flex-start",
  },
  readText: {
    color: "#fff",
    fontSize: moderateScale(12),
    fontWeight: "700",
    marginRight: scale(6),
    textTransform: 'uppercase'
  },
  fab: {
    position: "absolute",
    bottom: verticalScale(30),
    right: scale(25),
    width: moderateScale(56),
    height: moderateScale(56),
    borderRadius: moderateScale(28),
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  secondFab: {
    bottom: verticalScale(100),
  },
});
