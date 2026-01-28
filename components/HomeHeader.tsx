import { useNavigation, useTheme } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const HomeHeader = () => {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();

  return (
    <View style={[styles.header, { backgroundColor: colors.card, shadowColor: colors.text }]}>
      <Text style={[styles.logo, { color: colors.text }]}>Updater</Text>
      <TouchableOpacity
        onPress={() => navigation.navigate("SignUpScreen")}
        style={[styles.signUpButton, { backgroundColor: colors.primary }]}
      >
        <Text style={styles.signUpText}>Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    elevation: 3,
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  logo: {
    fontSize: 24,
    fontWeight: "bold",
    fontFamily: "Itim",
  },
  signUpButton: {
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  signUpText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default HomeHeader;
