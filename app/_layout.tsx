import { Stack } from "expo-router";
import "react-native-gesture-handler";
import { ReelProvider } from "../context/ReelContext";
import { SavedArticlesProvider } from "../context/SavedArticlesContext";
import { ThemeProvider } from "../context/ThemeContext";

export default function RootLayout() {
  return (
    <SavedArticlesProvider>
      <ThemeProvider>
        <ReelProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="Login" />
            <Stack.Screen name="SignUpScreen" />
            <Stack.Screen name="SignUpJournalist" />
            <Stack.Screen name="SignUpUser" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="DeepDive" />
            <Stack.Screen name="UploadReels" />
            <Stack.Screen name="UploadColumns" />
            <Stack.Screen name="EditProfile" />
            <Stack.Screen name="ProfileSetting" />
            <Stack.Screen name="SavedArticles" />
            <Stack.Screen name="ReadColumns" />
            <Stack.Screen name="ColumnDetails" />
            <Stack.Screen name="YourColumns" />
          </Stack>
        </ReelProvider>
      </ThemeProvider>
    </SavedArticlesProvider>
  );
}
