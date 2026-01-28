// components/SignUpScreen.tsx
import Ionicons from "@react-native-vector-icons/ionicons";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../context/ThemeContext";

const SignUpScreen = () => {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={28} color={colors.primary} />
      </TouchableOpacity>

      {/* Card */}
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        {/* Heading */}
        <Text style={[styles.heading, { color: colors.text }]}>
          <Text style={[styles.headingBlack, { color: colors.text }]}>SignUp </Text>
          <Text style={[styles.headingBlue, { color: colors.primary }]}>As</Text>
        </Text>

        {/* Columnist Option */}
        <TouchableOpacity
          style={styles.option}
          onPress={() => navigation.navigate("SignUpJournalist")}
        >
          <Ionicons name="person-circle-outline" size={100} color={colors.primary} />
          <Text style={[styles.optionText, { color: colors.text }]}>Columnist</Text>
        </TouchableOpacity>

        {/* User Option */}
        <TouchableOpacity
          style={styles.option}
          onPress={() => navigation.navigate("SignUpUser")}
        >
          <Ionicons name="person-circle-outline" size={100} color={colors.primary} />
          <Text style={[styles.optionText, { color: colors.text }]}>User</Text>
        </TouchableOpacity>
      </View>

      {/* Login Link */}
      <TouchableOpacity onPress={() => navigation.navigate("LoginScreen")}>
        <Text style={[styles.loginText, { color: colors.text }]}>
          Already have an account?{" "}
          <Text style={[styles.loginLink, { color: colors.primary }]}>Login</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default SignUpScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  backBtn: {
    position: "absolute",
    top: 20,
    left: 20,
    padding: 5,
  },
  card: {
    width: "90%",
    borderRadius: 16,
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: "center",
    elevation: 5, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  heading: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 40,
  },
  headingBlack: {
    fontWeight: "bold",
  },
  headingBlue: {
    fontWeight: "bold",
  },
  option: {
    alignItems: "center",
    marginVertical: 20,
  },
  optionText: {
    marginTop: 10,
    fontSize: 20,
    fontWeight: "600",
  },
  loginText: {
    marginTop: 40,
    fontSize: 16,
  },
  loginLink: {
    fontWeight: "bold",
  },
});
