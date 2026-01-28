import Ionicons from "@react-native-vector-icons/ionicons";
import { useNavigation, useTheme } from "@react-navigation/native";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const LoginScreen = () => {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Back Icon */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={colors.primary} />
      </TouchableOpacity>

      {/* Card */}
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        {/* Heading */}
        <Text style={[styles.heading, { color: colors.text }]}>Login</Text>

        {/* Email Input */}
        <TextInput
          style={[
            styles.input,
            {
              color: colors.text,
              borderColor: colors.border,
              backgroundColor: colors.background,
            },
          ]}
          placeholder="Email"
          placeholderTextColor={colors.border}
          value={email}
          onChangeText={setEmail}
        />

        {/* Password Input */}
        <TextInput
          style={[
            styles.input,
            {
              color: colors.text,
              borderColor: colors.border,
              backgroundColor: colors.background,
            },
          ]}
          placeholder="Password"
          placeholderTextColor={colors.border}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {/* Forgot Password */}
        <TouchableOpacity style={styles.forgotBtn}>
          <Text style={[styles.forgotText, { color: colors.primary }]}>
            Forgot Password?
          </Text>
        </TouchableOpacity>

        {/* Login Button */}
        <TouchableOpacity
          style={[styles.loginBtn, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.loginText}>Login</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.text }]}>
            Don’t have an account?{" "}
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("SignUpScreen")}
          >
            <Text style={[styles.signupText, { color: colors.primary }]}>
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  backBtn: {
    position: "absolute",
    top: 20,
    left: 20,
    zIndex: 1,
  },
  card: {
    borderRadius: 15,
    padding: 25,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 25,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  forgotBtn: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  forgotText: {
    fontSize: 14,
  },
  loginBtn: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 20,
  },
  loginText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  footerText: {
    fontSize: 14,
  },
  signupText: {
    fontSize: 14,
    fontWeight: "bold",
  },
});
