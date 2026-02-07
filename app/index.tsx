import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

const Index = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <LinearGradient
        // Deep elegant gradient: "Midnight City"
        colors={["#0f172a", "#1e3a8a", "#172554"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      >
        {/* Abstract Geometric Decoration (Optional for depth) */}
        <View style={styles.decorationCircle} />

        <View style={styles.contentContainer}>
          {/* Animated Header Section */}
          <View style={styles.headerSection}>
            <Animated.Text
              entering={FadeInDown.delay(200).duration(1000).springify()}
              style={styles.brandTitle}
            >
              UPDATER
            </Animated.Text>

            <Animated.View
              entering={FadeInDown.delay(600).duration(1000)}
              style={styles.divider}
            />
          </View>

          {/* Animated Button Section */}
          <Animated.View
            entering={FadeInUp.delay(1000).duration(800).springify()}
            style={styles.bottomSection}
          >
            <TouchableOpacity
              style={styles.button}
              activeOpacity={0.8}
              onPress={() => router.push("/Login")}
            >
              <LinearGradient
                colors={["#3b82f6", "#2563eb"]} // Vibrant Blue Button
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>Get Started</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </LinearGradient>
    </View>
  );
};

export default Index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: scale(30),
    justifyContent: "space-between",
    paddingVertical: verticalScale(80),
  },
  // Decoration
  decorationCircle: {
    position: "absolute",
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(59, 130, 246, 0.1)", // Faint blue glow
  },

  headerSection: {
    marginTop: verticalScale(60),
    alignItems: "center", // Centered
    width: "100%",
  },
  brandTitle: {
    fontSize: moderateScale(52),
    color: "#ffffff",
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: verticalScale(10),
  },
  divider: {
    height: 4,
    width: 280, // Stretched to match text width approximately
    backgroundColor: "#3b82f6", // Blue accent
    borderRadius: 2,
    marginTop: verticalScale(10),
    marginBottom: verticalScale(20),
  },

  bottomSection: {
    alignItems: "center",
    width: "100%",
    marginBottom: verticalScale(20),
  },
  button: {
    width: "100%",
    borderRadius: moderateScale(16),
    overflow: "hidden", // For gradient
    shadowColor: "#3b82f6",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  buttonGradient: {
    paddingVertical: verticalScale(18),
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontSize: moderateScale(18),
    fontWeight: "700",
    letterSpacing: 1,
  },
  loginLink: {
    color: "rgba(255,255,255,0.6)",
    fontSize: moderateScale(14),
    fontWeight: "500",
  },
});
