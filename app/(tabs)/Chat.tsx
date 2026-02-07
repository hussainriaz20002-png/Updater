import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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

const GEMINI_API_KEY = process.env.GEMINI_KEY;

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
              {/* Premium Welcome Section */}
              <View style={styles.welcomeSection}>
                <LinearGradient
                  colors={[colors.primary, "#6366f1"]} // Gradient Icon Background
                  style={{
                    width: moderateScale(60),
                    height: moderateScale(60),
                    borderRadius: moderateScale(30),
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: verticalScale(16),
                    shadowColor: colors.primary,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 6,
                  }}
                >
                  <Ionicons
                    name="sparkles"
                    size={moderateScale(32)}
                    color="#fff"
                  />
                </LinearGradient>
                <Text style={[styles.welcomeTitle, { color: colors.text }]}>
                  Hello, I'm Gemini.
                </Text>
                <Text
                  style={[
                    styles.welcomeSubtitle,
                    { color: isDark ? "#aaa" : "#666" },
                  ]}
                >
                  How can I help you today?
                </Text>
              </View>

              {/* Premium Suggestions Grid */}
              <View style={styles.suggestionsGrid}>
                {[
                  {
                    icon: "newspaper",
                    title: "Market News",
                    text: "Summarize today's top finance headlines",
                    color: ["#3b82f6", "#2563eb"], // Blue
                  },
                  {
                    icon: "earth",
                    title: "Global Events",
                    text: "What's happening in world politics?",
                    color: ["#10b981", "#059669"], // Green
                  },
                  {
                    icon: "trending-up",
                    title: "Analysis",
                    text: "Explain the latest tech market trends",
                    color: ["#f59e0b", "#d97706"], // Amber
                  },
                  {
                    icon: "code-slash",
                    title: "Tech Update",
                    text: "What are the latest breakthroughs in AI?",
                    color: ["#8b5cf6", "#7c3aed"], // Violet
                  },
                ].map((suggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    activeOpacity={0.9}
                    onPress={() => setInputText(suggestion.text)}
                    style={[
                      styles.suggestionCard,
                      {
                        backgroundColor: isDark ? "#1f2937" : "#fff",
                        borderColor: isDark ? "#374151" : "#e5e7eb",
                      },
                    ]}
                  >
                    {/* Icon Header */}
                    <View style={styles.cardHeader}>
                      <LinearGradient
                        colors={suggestion.color as any}
                        style={styles.iconBadge}
                      >
                        <Ionicons
                          name={suggestion.icon as any}
                          size={16}
                          color="#fff"
                        />
                      </LinearGradient>
                      <Ionicons
                        name="arrow-forward"
                        size={16}
                        color={isDark ? "#6b7280" : "#9ca3af"}
                      />
                    </View>

                    {/* Text Content */}
                    <View style={styles.cardContent}>
                      <Text style={[styles.cardTitle, { color: colors.text }]}>
                        {suggestion.title}
                      </Text>
                      <Text
                        style={[
                          styles.cardDescription,
                          { color: isDark ? "#9ca3af" : "#6b7280" },
                        ]}
                        numberOfLines={2}
                      >
                        {suggestion.text}
                      </Text>
                    </View>
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
    marginBottom: verticalScale(32),
    marginTop: verticalScale(20),
  },
  welcomeTitle: {
    fontSize: moderateScale(24),
    fontWeight: "800",
    marginTop: verticalScale(4),
    textAlign: "center",
    letterSpacing: 0.5,
  },
  welcomeSubtitle: {
    fontSize: moderateScale(15),
    marginTop: verticalScale(8),
    textAlign: "center",
    maxWidth: "80%",
    fontWeight: "400",
  },
  suggestionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: scale(10), // Reduced gap slightly
    width: "100%",
  },
  suggestionCard: {
    width: "47%", // Reduced width slightly to ensure 2 items fit per row
    padding: moderateScale(16),
    borderRadius: moderateScale(20),
    borderWidth: 1,
    minHeight: verticalScale(140),
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: verticalScale(10), // Add explicit margin bottom for rows
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: verticalScale(12),
  },
  iconBadge: {
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(10),
    justifyContent: "center",
    alignItems: "center",
  },
  cardContent: {
    flex: 1,
    justifyContent: "flex-end",
  },
  cardTitle: {
    fontSize: moderateScale(14),
    fontWeight: "700",
    marginBottom: verticalScale(4),
  },
  cardDescription: {
    fontSize: moderateScale(12),
    lineHeight: moderateScale(16),
  },
});

export default ChatScreen;
