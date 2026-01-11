import { useChat } from "@/hooks/chat/use-chat";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Stack } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ChatScreen = () => {
  const {
    messages,
    message,
    isLoading,
    isTyping,
    typingUser,
    replyingTo,
    userOnlineStatus,
    selectedMessage,
    menuVisible,
    flatListRef,
    router,
    username,
    userAvatar,
    setReplyingTo,
    setMenuVisible,
    handleInputChange,
    handleSendMessage,
    handleDeleteMessage,
    handleEditMessage,
    handleReplyMessage,
    showMessageMenu,
    markAllAsRead,
  } = useChat();

  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const shouldAutoScrollRef = useRef(true);
  const isUserScrollingRef = useRef(false);
  const messagesLengthRef = useRef(messages.length);

  // Messages o'zgarganda scroll qilish
  useEffect(() => {
    // Faqat yangi xabar qo'shilganda scroll qilish
    if (messages.length > messagesLengthRef.current) {
      messagesLengthRef.current = messages.length;

      if (shouldAutoScrollRef.current && !isUserScrollingRef.current) {
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    } else {
      messagesLengthRef.current = messages.length;
    }
  }, [messages.length]);

  // Scroll event handler
  const handleScroll = (event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const isAtBottom =
      contentOffset.y + layoutMeasurement.height >= contentSize.height - 50;

    // Agar user scrolllayotgan bo'lsa
    if (!isAtBottom) {
      isUserScrollingRef.current = true;
      shouldAutoScrollRef.current = false;
    } else {
      isUserScrollingRef.current = false;
      shouldAutoScrollRef.current = true;
    }
  };

  const renderMessage = ({ item, index }: { item: any; index: number }) => {
    const prevMessage = index > 0 ? messages[index - 1] : null;
    const showAvatar = !item.isSent && prevMessage?.senderId !== item.senderId;

    return (
      <Animated.View
        style={[
          styles.messageWrapper,
          item.isSent ? styles.sentWrapper : styles.receivedWrapper,
        ]}
      >
        <TouchableOpacity
          onLongPress={() => showMessageMenu(item)}
          disabled={item.isDeleted}
          activeOpacity={0.7}
          style={[
            styles.messageContainer,
            item.isSent ? styles.sentMessage : styles.receivedMessage,
          ]}
        >
          {/* Avatar */}
          {showAvatar && (
            <Image
              source={{
                uri: item.senderAvatar || "https://via.placeholder.com/40",
              }}
              style={styles.messageAvatar}
            />
          )}

          <View style={styles.messageContent}>
            {!item.isSent && showAvatar && (
              <Text style={styles.senderName}>{item.senderName}</Text>
            )}

            {item.replyTo && (
              <View
                style={[
                  styles.replyContainer,
                  item.isSent
                    ? styles.replyContainerSent
                    : styles.replyContainerReceived,
                ]}
              >
                <View style={styles.replyBorder} />
                <View style={styles.replyContent}>
                  <Text style={styles.replyName}>
                    {item.replyTo.senderName}
                  </Text>
                  <Text style={styles.replyText} numberOfLines={1}>
                    {item.replyTo.text}
                  </Text>
                </View>
              </View>
            )}

            <Text
              style={[
                styles.messageText,
                item.isSent ? styles.sentText : styles.receivedText,
                item.isDeleted && styles.deletedText,
              ]}
            >
              {item.text}
            </Text>

            <View style={styles.messageFooter}>
              <Text
                style={[
                  styles.messageTime,
                  item.isSent ? styles.sentTime : styles.receivedTime,
                ]}
              >
                {item.time}
              </Text>
              {item.isSent && (
                <Ionicons
                  name={
                    item.status === "read"
                      ? "checkmark-done"
                      : item.status === "delivered"
                      ? "checkmark-done"
                      : "checkmark"
                  }
                  size={14}
                  color={item.status === "read" ? "#34C759" : "#A0A0A0"}
                  style={styles.checkmark}
                />
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderTypingIndicator = () => {
    if (!isTyping) return null;

    return (
      <View style={styles.typingWrapper}>
        <View style={styles.typingContainer}>
          <View style={styles.typingDots}>
            <Animated.View style={[styles.dot, styles.dot1]} />
            <Animated.View style={[styles.dot, styles.dot2]} />
            <Animated.View style={[styles.dot, styles.dot3]} />
          </View>
          <Text style={styles.typingText}>{typingUser} yozmoqda...</Text>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Xabarlar yuklanmoqda...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Input Container */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <Stack.Screen options={{ headerShown: false }} />

        <LinearGradient
          colors={["#F8F9FA", "#E9ECEF"]}
          style={StyleSheet.absoluteFillObject}
        />

        <SafeAreaView style={styles.safeArea} edges={["top"]}>
          {/* Header */}
          <BlurView intensity={80} tint="light" style={styles.headerBlur}>
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.backButton}
              >
                <Ionicons name="chevron-back" size={28} color="#007AFF" />
              </TouchableOpacity>

              <View style={styles.headerCenter}>
                <Image
                  source={{
                    uri: userAvatar || "https://via.placeholder.com/40",
                  }}
                  style={styles.headerAvatar}
                />
                <View style={styles.headerInfo}>
                  <Text style={styles.headerTitle}>{username}</Text>
                  <View style={styles.statusContainer}>
                    <View
                      style={[
                        styles.statusDot,
                        userOnlineStatus && styles.statusDotOnline,
                      ]}
                    />
                    <Text style={styles.headerStatus}>
                      {isTyping
                        ? `${typingUser} yozmoqda...`
                        : userOnlineStatus
                        ? "Onlayn"
                        : "Offlayn"}
                    </Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                onPress={markAllAsRead}
                style={styles.headerAction}
              >
                <Ionicons
                  name="checkmark-done-outline"
                  size={24}
                  color="#007AFF"
                />
              </TouchableOpacity>
            </View>
          </BlurView>

          {/* Messages */}

          <SafeAreaView style={styles.flex} edges={["bottom"]}>
            <FlatList
              key={messages.length}
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyboardShouldPersistTaps="handled"
              onContentSizeChange={() => {
                if (shouldAutoScrollRef.current) {
                  flatListRef.current?.scrollToEnd({ animated: true });
                }
              }}
              keyExtractor={(item, index) =>
                item.id ? item.id.toString() : index.toString()
              }
              contentContainerStyle={styles.messagesList}
              scrollEventThrottle={400}
              showsVerticalScrollIndicator={false}
              ListFooterComponent={renderTypingIndicator}
              onScrollBeginDrag={() => {
                isUserScrollingRef.current = true;
              }}
              onMomentumScrollEnd={(event) => {
                const { contentOffset, contentSize, layoutMeasurement } =
                  event.nativeEvent;
                const isAtBottom =
                  contentOffset.y + layoutMeasurement.height >=
                  contentSize.height - 50;

                if (isAtBottom) {
                  shouldAutoScrollRef.current = true;
                  isUserScrollingRef.current = false;
                }
              }}
            />
          </SafeAreaView>

          {replyingTo && (
            <BlurView intensity={95} tint="light" style={styles.replyPreview}>
              <View style={styles.replyPreviewLine} />
              <View style={styles.replyPreviewContent}>
                <View style={styles.replyPreviewInfo}>
                  <Ionicons name="arrow-undo" size={16} color="#007AFF" />
                  <Text style={styles.replyPreviewTitle}>
                    {replyingTo.senderName}
                  </Text>
                </View>
                <Text style={styles.replyPreviewText} numberOfLines={1}>
                  {replyingTo.text}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setReplyingTo(null)}
                style={styles.replyPreviewClose}
              >
                <Ionicons name="close-circle" size={24} color="#666" />
              </TouchableOpacity>
            </BlurView>
          )}

          <BlurView intensity={95} tint="light" style={styles.inputBlur}>
            <View style={styles.inputContainer}>
              <TouchableOpacity style={styles.attachButton}>
                <Ionicons name="add-circle" size={28} color="#007AFF" />
              </TouchableOpacity>

              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={message}
                  onChangeText={handleInputChange}
                  placeholder="Xabar yozing..."
                  placeholderTextColor="#999"
                  multiline
                  maxLength={1000}
                  onFocus={() => {
                    shouldAutoScrollRef.current = true;
                    setTimeout(() => {
                      flatListRef.current?.scrollToEnd({ animated: true });
                    }, 300);
                  }}
                />
              </View>

              {message.trim() ? (
                <TouchableOpacity
                  onPress={handleSendMessage}
                  style={styles.sendButton}
                >
                  <LinearGradient
                    colors={["#007AFF", "#0051D5"]}
                    style={styles.sendGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name="send" size={20} color="#FFF" />
                  </LinearGradient>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.voiceButton}>
                  <Ionicons name="mic" size={24} color="#007AFF" />
                </TouchableOpacity>
              )}
            </View>
          </BlurView>

          {/* Message Menu Modal */}
          {menuVisible && selectedMessage && (
            <View style={styles.menuOverlay}>
              <TouchableOpacity
                style={styles.menuBackdrop}
                activeOpacity={1}
                onPress={() => setMenuVisible(false)}
              />
              <BlurView
                intensity={100}
                tint="dark"
                style={styles.menuContainer}
              >
                <View style={styles.menuHandle} />

                {selectedMessage.isSent && !selectedMessage.isDeleted && (
                  <>
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => handleEditMessage(selectedMessage)}
                    >
                      <View
                        style={[
                          styles.menuIcon,
                          { backgroundColor: "#007AFF15" },
                        ]}
                      >
                        <Ionicons
                          name="create-outline"
                          size={22}
                          color="#007AFF"
                        />
                      </View>
                      <Text style={styles.menuText}>Tahrirlash</Text>
                      <Ionicons name="chevron-forward" size={20} color="#CCC" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => handleDeleteMessage(selectedMessage)}
                    >
                      <View
                        style={[
                          styles.menuIcon,
                          { backgroundColor: "#FF3B3015" },
                        ]}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={22}
                          color="#FF3B30"
                        />
                      </View>
                      <Text style={[styles.menuText, styles.menuTextDanger]}>
                        O'chirish
                      </Text>
                      <Ionicons name="chevron-forward" size={20} color="#CCC" />
                    </TouchableOpacity>
                  </>
                )}

                {!selectedMessage.isDeleted && (
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => handleReplyMessage(selectedMessage)}
                  >
                    <View
                      style={[
                        styles.menuIcon,
                        { backgroundColor: "#34C75915" },
                      ]}
                    >
                      <Ionicons
                        name="arrow-undo-outline"
                        size={22}
                        color="#34C759"
                      />
                    </View>
                    <Text style={styles.menuText}>Javob berish</Text>
                    <Ionicons name="chevron-forward" size={20} color="#CCC" />
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.menuItem, styles.menuItemLast]}
                  onPress={() => setMenuVisible(false)}
                >
                  <View
                    style={[styles.menuIcon, { backgroundColor: "#88888815" }]}
                  >
                    <Ionicons name="close-outline" size={22} color="#888" />
                  </View>
                  <Text style={styles.menuText}>Bekor qilish</Text>
                </TouchableOpacity>
              </BlurView>
            </View>
          )}
        </SafeAreaView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
  headerBlur: {
    overflow: "hidden",
    borderBottomWidth: 0.5,
    borderBottomColor: "#fff",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10000,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "rgba(255,255,255,0.7)",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  headerCenter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#FFF",
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#000",
    marginBottom: 2,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#999",
    marginRight: 6,
  },
  statusDotOnline: {
    backgroundColor: "#34C759",
  },
  headerStatus: {
    fontSize: 13,
    color: "#666",
  },
  headerAction: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  messagesList: {
    padding: 16,
    paddingBottom: 8,
  },
  messageWrapper: {
    marginBottom: 12,
  },
  sentWrapper: {
    alignItems: "flex-end",
  },
  receivedWrapper: {
    alignItems: "flex-start",
  },
  messageContainer: {
    maxWidth: "75%",
    borderRadius: 20,
    overflow: "hidden",
  },
  messageAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    position: "absolute",
    bottom: 0,
    left: -28,
  },
  messageContent: {
    padding: 12,
  },
  sentMessage: {
    backgroundColor: "#007AFF",
    borderBottomRightRadius: 4,
  },
  receivedMessage: {
    backgroundColor: "#FFF",
    borderBottomLeftRadius: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  senderName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#007AFF",
    marginBottom: 4,
  },
  replyContainer: {
    borderLeftWidth: 3,
    paddingLeft: 8,
    paddingVertical: 6,
    marginBottom: 8,
    borderRadius: 4,
  },
  replyContainerSent: {
    borderLeftColor: "#FFF",
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  replyContainerReceived: {
    borderLeftColor: "#007AFF",
    backgroundColor: "#F8F9FA",
  },
  replyBorder: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
  replyContent: {
    paddingLeft: 8,
  },
  replyName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#007AFF",
    marginBottom: 2,
  },
  replyText: {
    fontSize: 13,
    color: "#666",
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  sentText: {
    color: "#FFF",
  },
  receivedText: {
    color: "#000",
  },
  deletedText: {
    fontStyle: "italic",
    color: "#999",
  },
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    justifyContent: "flex-end",
  },
  messageTime: {
    fontSize: 11,
  },
  sentTime: {
    color: "rgba(255,255,255,0.8)",
  },
  receivedTime: {
    color: "#999",
  },
  checkmark: {
    marginLeft: 4,
  },
  typingWrapper: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  typingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    alignSelf: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  typingDots: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#007AFF",
    marginHorizontal: 2,
  },
  dot1: { opacity: 0.4 },
  dot2: { opacity: 0.7 },
  dot3: { opacity: 1 },
  typingText: {
    fontSize: 14,
    color: "#666",
  },
  replyPreview: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 0.5,
    borderTopColor: "rgba(0,0,0,0.1)",
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  replyPreviewLine: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: "#007AFF",
  },
  replyPreviewContent: {
    flex: 1,
    marginLeft: 8,
  },
  replyPreviewInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  replyPreviewTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#007AFF",
    marginLeft: 6,
  },
  replyPreviewText: {
    fontSize: 14,
    color: "#666",
  },
  replyPreviewClose: {
    padding: 4,
  },
  inputBlur: {
    overflow: "hidden",
    borderTopWidth: 0.5,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  attachButton: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    marginBottom: 2,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: "#F1F3F5",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    marginRight: 8,
    minHeight: 40,
    justifyContent: "center",
  },
  input: {
    fontSize: 16,
    color: "#000",
    maxHeight: 100,
    minHeight: 20,
    paddingTop: 0,
    paddingBottom: 0,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 2,
  },
  sendGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  voiceButton: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 2,
  },
  menuOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
  },
  menuBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  menuContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 34,
    overflow: "hidden",
  },
  menuHandle: {
    width: 40,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 17,
    color: "#FFF",
    fontWeight: "500",
  },
  menuTextDanger: {
    color: "#FF3B30",
  },
});

export default ChatScreen;
