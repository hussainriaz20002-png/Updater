import { router } from "expo-router";
import React from "react";
import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
// @ts-ignore
import getStartedImage from "../assets/images/getStarted.png";

const GetStarted = () => {
  return (
    <ImageBackground
      source={getStartedImage}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      {/* Overlay Gradient Effect (Simulated with background color) */}
      <View style={styles.overlay}>
        <View style={styles.contentContainer}>
          <Text style={styles.brandTitle}>Updater</Text>
          <Text style={styles.brandSubtitle}>Stay informed. Stay ahead.</Text>

          <View style={styles.bottomSection}>
            <TouchableOpacity
              style={styles.button}
              activeOpacity={0.8}
              onPress={() => router.push("/Login")}
            >
              <Text style={styles.buttonText}>Get Started</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
};

export default GetStarted;

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)", // Adds dimming for better text readability
    justifyContent: "flex-end",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: scale(20),
  },
  brandTitle: {
    color: "white",
    fontSize: moderateScale(48),
    textAlign: "center",
    marginTop: verticalScale(150),
    fontFamily: "Itim", // Keeping the requested font
    letterSpacing: 1,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  brandSubtitle: {
    color: "rgba(255,255,255,0.9)",
    fontSize: moderateScale(16),
    textAlign: "center",
    marginTop: verticalScale(10),
    letterSpacing: 0.5,
    fontWeight: "500",
  },
  bottomSection: {
    flex: 1,
    justifyContent: "flex-end",
    marginBottom: verticalScale(60),
    width: "100%",
    alignItems: "center",
  },
  button: {
    backgroundColor: "#3A7BD5",
    paddingVertical: verticalScale(16),
    borderRadius: moderateScale(30),
    width: "85%",
    alignItems: "center",
    shadowColor: "#3A7BD5",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 16,
  },
  buttonText: {
    color: "white",
    fontSize: moderateScale(18),
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
