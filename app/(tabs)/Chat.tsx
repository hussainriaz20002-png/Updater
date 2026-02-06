import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import TypingIndicator from "../../components/TypingIndicator";
import { useChat } from "../../context/ChatContext";
import { useTheme } from "../../context/ThemeContext";

const GEMINI_API_KEY = "AIzaSyDEEjzQRbthyQzdD5CIY6lUWMFWIKa10io";

const ChatScreen = () => {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { messages, addMessage } = useChat();
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const flatListRef = React.useRef<FlatList>(null);
  const insets = useSafeAreaInsets();

  const sendMessage = async () => {
    if (inputText.trim().length === 0) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: "me" as "me",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    addMessage(userMessage);
    setInputText("");
    setLoading(true);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: inputText }] }],
          }),
        },
      );

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message);
      }

      const geminiResponse =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Sorry, I couldn't understand that.";

      const botMessage = {
        id: (Date.now() + 1).toString(),
        text: geminiResponse,
        sender: "gemini" as "gemini",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      addMessage(botMessage);
    } catch (error) {
      console.error("Gemini API Error:", error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, something went wrong. Please check your API key and connection.",
        sender: "gemini" as "gemini",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      addMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isMe = item.sender === "me";
    return (
      <View
        style={[
          styles.messageContainer,
          isMe ? styles.myMessage : styles.otherMessage,
          {
            backgroundColor: isMe
              ? colors.primary
              : isDark
                ? "#333"
                : "#f0f0f0",
          },
        ]}
      >
        <Text
          style={[styles.messageText, { color: isMe ? "#fff" : colors.text }]}
        >
          {item.text}
        </Text>
        <Text
          style={[
            styles.timeText,
            { color: isMe ? "rgba(255,255,255,0.7)" : "#999" },
          ]}
        >
          {item.time}
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.card,
            borderBottomColor: isDark ? "#333" : "#e0e0e0",
            paddingTop: insets.top + verticalScale(10), // Manual top padding
          },
        ]}
      >
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Gemini Chat
          </Text>
          <View style={styles.onlineBadge} />
        </View>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons
            name="sparkles"
            size={moderateScale(20)}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Main Content Wrapper with Keyboard Handling */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0} // Adjusted offset
      >
        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={{ flex: 1 }}
          contentContainerStyle={[
            styles.listContent,
            {
              flexGrow: 1,
              justifyContent: messages.length === 0 ? "center" : undefined,
            },
          ]}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          ListFooterComponent={loading ? <TypingIndicator /> : null}
          ListEmptyComponent={
            <View style={styles.suggestionsContainer}>
              <View style={styles.welcomeSection}>
                <Ionicons
                  name="sparkles"
                  size={moderateScale(40)}
                  color={colors.primary}
                />
                <Text style={[styles.welcomeTitle, { color: colors.text }]}>
                  How can I help you today?
                </Text>
                <Text
                  style={[
                    styles.welcomeSubtitle,
                    { color: isDark ? "#888" : "#666" },
                  ]}
                >
                  Ask me anything about news and current events
                </Text>
              </View>
              <View style={styles.suggestionsGrid}>
                {[
                  {
                    icon: "newspaper-outline",
                    text: "Summarize today's top headlines",
                  },
                  {
                    icon: "globe-outline",
                    text: "What's happening in world politics?",
                  },
                  {
                    icon: "trending-up-outline",
                    text: "Explain the latest market trends",
                  },
                  { icon: "bulb-outline", text: "Give me a tech news update" },
                ].map((suggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.suggestionCard,
                      {
                        backgroundColor: isDark ? "#1E1E1E" : "#f8f9fa",
                        borderColor: isDark ? "#333" : "#e0e0e0",
                      },
                    ]}
                    onPress={() => setInputText(suggestion.text)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={suggestion.icon as any}
                      size={moderateScale(20)}
                      color={colors.primary}
                      style={{ marginBottom: verticalScale(8) }}
                    />
                    <Text
                      style={[styles.suggestionText, { color: colors.text }]}
                      numberOfLines={2}
                    >
                      {suggestion.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          }
        />

        {/* Input Area */}
        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: colors.card,
              borderTopColor: isDark ? "#333" : "#e0e0e0",
              paddingBottom:
                Platform.OS === "ios" ? verticalScale(10) : verticalScale(10), // Reduced bottom padding as we might rely on insets or just standard padding
              marginBottom:
                Platform.OS === "ios" && insets.bottom === 0 ? 10 : 0, // extra margin for older phones
            },
          ]}
        >
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: isDark ? "#222" : "#f5f5f5",
                color: colors.text,
              },
            ]}
            placeholder="Ask Gemini..."
            placeholderTextColor="#999"
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 },
            ]}
            onPress={sendMessage}
            disabled={loading}
          >
            <Ionicons name="send" size={moderateScale(18)} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
    borderBottomWidth: 1,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 10,
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: "700",
  },
  onlineBadge: {
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: moderateScale(4),
    backgroundColor: "#4CAF50",
    marginLeft: scale(6),
    marginTop: verticalScale(2),
  },
  iconButton: {
    padding: 4,
  },
  listContent: {
    paddingHorizontal: scale(16),
    paddingBottom: verticalScale(20),
    paddingTop: verticalScale(16),
  },
  messageContainer: {
    maxWidth: "80%",
    borderRadius: moderateScale(16),
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(10),
    marginBottom: verticalScale(12),
  },
  myMessage: {
    alignSelf: "flex-end",
    borderBottomRightRadius: 2,
  },
  otherMessage: {
    alignSelf: "flex-start",
    borderBottomLeftRadius: 2,
  },
  messageText: {
    fontSize: moderateScale(15),
    lineHeight: moderateScale(22),
  },
  timeText: {
    fontSize: moderateScale(10),
    marginTop: verticalScale(4),
    textAlign: "right",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(10),
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderRadius: moderateScale(20),
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(10),
    maxHeight: verticalScale(100),
    fontSize: moderateScale(15),
  },
  sendButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    justifyContent: "center",
    alignItems: "center",
    marginLeft: scale(10),
    elevation: 2,
  },
  suggestionsContainer: {
    alignItems: "center",
    paddingHorizontal: scale(16),
  },
  welcomeSection: {
    alignItems: "center",
    marginBottom: verticalScale(24),
  },
  welcomeTitle: {
    fontSize: moderateScale(22),
    fontWeight: "700",
    marginTop: verticalScale(12),
    textAlign: "center",
    marginBottom: verticalScale(8),
  },
  welcomeSubtitle: {
    fontSize: moderateScale(14),
    marginTop: verticalScale(6),
    textAlign: "center",
  },
  suggestionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: scale(10),
  },
  suggestionCard: {
    width: "47%",
    padding: moderateScale(14),
    borderRadius: moderateScale(14),
    borderWidth: 1,
    alignItems: "flex-start",
    minHeight: verticalScale(80),
  },
  suggestionText: {
    fontSize: moderateScale(13),
    fontWeight: "500",
    lineHeight: moderateScale(18),
  },
});

export default ChatScreen;
