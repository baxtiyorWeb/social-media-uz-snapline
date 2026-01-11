import { Platform, StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 2,
    backgroundColor: "#0a0e27",
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 212, 255, 0.1)",
    overflow: "hidden",
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  headerCenterButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 8,
  },
  headerAvatarContainer: {
    position: "relative",
  },
  headerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "rgba(0, 212, 255, 0.3)",
  },
  headerOnlineBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 13,
    height: 13,
    borderRadius: 6.5,
    backgroundColor: "#4caf50",
    borderWidth: 2.5,
    borderColor: "#0a0e27",
  },
  headerInfo: {
    marginLeft: 12,
    flex: 1,
  },
  headerName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  headerStatus: {
    fontSize: 12,
    color: "#00d4ff",
    marginTop: 2,
    fontWeight: "500",
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  headerIconButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: "rgba(0, 212, 255, 0.08)",
  },

  // Messages
  messagesContent: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexGrow: 1,
  },
  messageRow: {
    flexDirection: "row",
    marginBottom: 4,
    maxWidth: "85%",
  },
  sentMessageRow: {
    alignSelf: "flex-end",
    flexDirection: "row-reverse",
  },
  avatarContainer: {
    width: 36,
    marginRight: 8,
    justifyContent: "flex-end",
  },
  messageAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "rgba(0, 212, 255, 0.2)",
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
  },
  messageBubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    maxWidth: "100%",
  },
  continuedSentBubble: {
    borderBottomRightRadius: 4,
    marginBottom: 2,
  },
  continuedReceivedBubble: {
    borderBottomLeftRadius: 4,
    marginBottom: 2,
  },
  receivedBubble: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(0, 212, 255, 0.15)",
  },
  sentBubble: {
    backgroundColor: "#00d4ff",
    borderBottomRightRadius: 4,
  },
  deletedBubble: {
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  messageText: {
    fontSize: 15,
    color: "#fff",
    lineHeight: 21,
  },
  sentMessageText: {
    color: "#000",
  },
  deletedText: {
    fontStyle: "italic",
    color: "rgba(255,255,255,0.4)",
  },
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    justifyContent: "flex-end",
  },
  messageTime: {
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
  },
  sentMessageTime: {
    color: "rgba(0,0,0,0.6)",
  },
  mediaPreview: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 8,
  },

  // Reply
  replyContext: {
    flexDirection: "row",
    marginBottom: 6,
    paddingLeft: 12,
    alignItems: "center",
  },
  replyContextSent: {
    marginLeft: "auto",
    paddingRight: 12,
    paddingLeft: 0,
  },
  replyLine: {
    width: 2.5,
    height: 38,
    backgroundColor: "#00d4ff",
    marginRight: 10,
  },
  replyContent: {
    flex: 1,
  },
  replyLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
    fontWeight: "600",
  },
  replyText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.9)",
    marginTop: 2,
  },

  // Typing
  typingContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "rgba(0, 212, 255, 0.05)",
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 212, 255, 0.1)",
  },
  typingDots: {
    flexDirection: "row",
    gap: 5,
    marginRight: 10,
  },
  typingDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#00d4ff",
  },
  typingText: {
    fontSize: 12,
    color: "#00d4ff",
    fontWeight: "600",
  },

  // Replying to
  replyingToContainer: {
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 212, 255, 0.15)",
    backgroundColor: "rgba(0, 212, 255, 0.08)",
    padding: 12,
    paddingHorizontal: 16,
    overflow: "hidden",
  },
  replyingGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  replyingContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  replyingLine: {
    width: 2.5,
    height: 40,
    backgroundColor: "#00d4ff",
  },
  replyingLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
    marginBottom: 4,
    fontWeight: "600",
  },
  replyingText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "500",
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.05)",
  },

  // Input
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 12,
    paddingBottom: Platform.OS === "ios" ? 32 : 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 212, 255, 0.1)",
    overflow: "hidden",
    gap: 10,
  },
  attachButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "rgba(0, 212, 255, 0.08)",
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: "rgba(0, 212, 255, 0.15)",
    minHeight: 44,
  },
  input: {
    flex: 1,
    color: "#fff",
    fontSize: 15,
    maxHeight: 100,
    paddingVertical: 8,
  },
  emojiButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
    borderRadius: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#00d4ff",
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "rgba(0, 212, 255, 0.3)",
  },

  // Modal Context Menu
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
  },
  contextMenu: {
    backgroundColor: "#1a1f3a",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === "ios" ? 32 : 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 212, 255, 0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 20,
  },
  contextMenuHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 212, 255, 0.1)",
  },
  contextMenuTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  contextMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  contextMenuFooter: {
    borderBottomWidth: 0,
  },
  contextMenuText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#00d4ff",
    flex: 1,
  },
});
