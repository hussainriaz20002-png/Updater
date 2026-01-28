import Ionicons from "@react-native-vector-icons/ionicons";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../context/ThemeContext";

const SignUpUser = () => {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignUp = () => {
    console.log("User Signup Data:", { email, password });
  };

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
        <View style={styles.heading}>
          <Text style={[styles.headingBlack, { color: colors.text }]}>
            SignUp As
          </Text>
          <Text style={[styles.headingBlue, { color: colors.primary }]}>
            User
          </Text>
        </View>

        {/* Email */}
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.background,
              borderColor: "#888",
              color: "#888",
            },
          ]}
          placeholder="Email"
          placeholderTextColor="#888"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        {/* Password */}
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.background,
              borderColor: "#888",
              color: "#888",
            },
          ]}
          placeholder="Password"
          placeholderTextColor="#888"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {/* Sign Up Button */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={handleSignUp}
        >
          <Text style={[styles.buttonText, { color: "#fff" }]}>
            Sign Up
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SignUpUser;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  backBtn: {
    position: "absolute",
    top: 20,
    left: 20,
    padding: 5,
    zIndex: 1,
  },
  card: {
    width: "100%",
    borderRadius: 16,
    paddingVertical: 30,
    paddingHorizontal: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  heading: {
    marginBottom: 25,
    alignItems: "center",
  },
  headingBlack: {
    fontWeight: "bold",
    fontSize: 22,
  },
  headingBlue: {
    fontWeight: "bold",
    fontSize: 24,
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
  },
});
