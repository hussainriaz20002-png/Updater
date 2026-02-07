import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import { Stack } from "expo-router"; // Added hooks
import { View } from "react-native";
import "react-native-gesture-handler";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { ChatProvider } from "../context/ChatContext";
import { ReelProvider } from "../context/ReelContext";
import { SavedArticlesProvider } from "../context/SavedArticlesContext";

import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

SplashScreen.preventAutoHideAsync();

function AuthenticatedStack() {
  const { user, loading } = useAuth();
  const { colors } = useTheme();

  useEffect(() => {
    if (!loading) {
      SplashScreen.hideAsync();
    }
  }, [loading]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack
        screenOptions={{ headerShown: false, animation: "slide_from_right" }}
      >
        <Stack.Protected guard={!user}>
          <Stack.Screen name="index" />
          <Stack.Screen name="Login" />
          <Stack.Screen name="SignUpScreen" />
          <Stack.Screen name="SignUpJournalist" />
          <Stack.Screen name="SignUpUser" />
          <Stack.Screen name="ForgotPassword" />
        </Stack.Protected>

        <Stack.Protected guard={!!user}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="DeepDive" />
          <Stack.Screen name="UploadColumns" />
          <Stack.Screen name="EditProfile" />
          <Stack.Screen name="ProfileSetting" />
          <Stack.Screen name="SavedArticles" />
          <Stack.Screen name="ReadColumns" />
          <Stack.Screen name="ColumnDetails" />
          <Stack.Screen name="YourColumns" />
          <Stack.Screen name="StockMarket" />
        </Stack.Protected>
      </Stack>
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
