import Ionicons from "@react-native-vector-icons/ionicons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import WebView from "react-native-webview";

const DeepDive = ({ route, navigation }: any) => {
  const { url } = route.params;

  return (
    <View style={{ flex: 1 }}>
      {/* Floating header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <Ionicons name="arrow-back-outline" size={28} color="white" />
        </TouchableOpacity>
      </View>

      {/* Full Article in WebView */}
      {url ? (
        <WebView source={{ uri: url }} style={{ flex: 1 }} />
      ) : (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Ionicons name="alert-circle-outline" size={40} color="gray" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    position: "absolute",
    top: 40,
    left: 15,
    right: 15,
    zIndex: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  iconButton: {
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 8,
    borderRadius: 30,
  },
});

export default DeepDive;
