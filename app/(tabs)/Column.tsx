
import Ionicons from "@react-native-vector-icons/ionicons";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

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
  },
  {
    id: "2",
    name: "Hamid Mir",
    image: hamidMir,
  },
];

export default function Column() {
  const [search, setSearch] = useState("");
  const navigation = useNavigation<any>();
  const { colors, isDark } = useTheme();

  //  Temporary mock user (replace later with real auth user)
  const loggedInUser = {
    id: "1", // example user id
    role: "columnist", // change to  "user" to test hidden FAB
  };

  const renderJournalist = ({ item }: any) => (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, shadowOpacity: isDark ? 0 : 0.1 },
      ]}
    >
      {/* <Image source={item.image} style={styles.avatar} /> */}
      <View style={{ flex: 1 }}>
        <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
        <TouchableOpacity
          style={[styles.readBtn, { backgroundColor: colors.primary }]}
          onPress={() =>
            navigation.navigate("ReadArticles", { journalist: item })
          }
        >
          <Text style={styles.readText}>Read Columns</Text>
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerText, { color: colors.text }]}>Columns</Text>
      </View>

      {/* Search Bar */}
      <View
        style={[
          styles.searchContainer,
          { backgroundColor: isDark ? "#2b2b2b" : "#f2f2f2" },
        ]}
      >
        <TextInput
          placeholder="Search for columnists"
          placeholderTextColor={isDark ? "#aaa" : "#999"}
          value={search}
          onChangeText={setSearch}
          style={[styles.searchInput, { color: colors.text }]}
        />
        <Ionicons name="search-outline" size={22} color={colors.primary} />
      </View>

      {/* Columnists List */}
      <FlatList
        data={journalists.filter((j) =>
          j.name.toLowerCase().includes(search.toLowerCase())
        )}
        renderItem={renderJournalist}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      />

      {/*  Show both FABs only if logged-in user is a columnist */}
      {loggedInUser.role === "columnist" && (
        <>
          {/* Newspaper FAB (upper circle) */}
          <TouchableOpacity
            style={[styles.fab, styles.secondFab, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate("YourColumns")} // adjust route if needed
          >
            <Ionicons name="newspaper-outline" size={24} color="#fff" />
          </TouchableOpacity>

          {/* Pencil FAB (bottom circle) */}
          <TouchableOpacity
            style={[styles.fab, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate("UploadArticles")}
          >
            <Ionicons name="pencil" size={24} color="#fff" />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {},
  headerText: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 15,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 25,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 2,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 50,
    marginRight: 15,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
  },
  readBtn: {
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginTop: 8,
    alignSelf: "flex-start",
  },
  readText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "500",
  },
  fab: {
    position: "absolute",
    bottom: 80,
    right: 25,
    width: 50,
    height: 50,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.5,
    elevation: 5,
  },
  secondFab: {
    bottom: 150,
  },
});
