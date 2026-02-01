import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import { Stack, useRouter, useSegments } from "expo-router"; // Added hooks
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import "react-native-gesture-handler";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { ChatProvider } from "../context/ChatContext";
import { ReelProvider } from "../context/ReelContext";
import { SavedArticlesProvider } from "../context/SavedArticlesContext";

function AuthenticatedStack() {
  const { user, loading } = useAuth();
  const segments = useSegments() as string[];
  const router = useRouter();
  const { colors, isDark } = useTheme();

  const inAuthGroup =
    segments.length === 0 || // index
    segments[0] === "Login" ||
    segments[0] === "SignUpScreen" ||
    segments[0] === "SignUpJournalist" ||
    segments[0] === "SignUpUser";

  useEffect(() => {
    if (loading) return;

    if (user && inAuthGroup) {
      router.replace("/(tabs)/Home");
    }
  }, [user, loading, segments, inAuthGroup]);

  // Only show loading indicator for initial auth check
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack
        screenOptions={{ headerShown: false, animation: "slide_from_right" }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="Login" />
        <Stack.Screen name="SignUpScreen" />
        <Stack.Screen name="SignUpJournalist" />
        <Stack.Screen name="SignUpUser" />
        <Stack.Screen name="ForgotPassword" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="DeepDive" />

        <Stack.Screen name="UploadColumns" />
        <Stack.Screen name="EditProfile" />
        <Stack.Screen name="ProfileSetting" />
        <Stack.Screen name="SavedArticles" />
        <Stack.Screen name="ReadColumns" />
        <Stack.Screen name="ColumnDetails" />
        <Stack.Screen name="YourColumns" />
      </Stack>

      {/* Loading Overlay: 
          Keeps Stack mounted (preventing router errors) while blocking 
          interaction/vision during initial auth or redirect. 
      */}
      {(loading || (user && inAuthGroup)) && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: colors.background,
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}
    </View>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <SavedArticlesProvider>
        <ThemeProvider>
          <ReelProvider>
            <ChatProvider>
              {/* <StatusBar barStyle="default" /> */}
              <AuthenticatedStack />
            </ChatProvider>
          </ReelProvider>
        </ThemeProvider>
      </SavedArticlesProvider>
    </AuthProvider>
  );
}
