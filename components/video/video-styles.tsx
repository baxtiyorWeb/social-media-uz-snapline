import { Dimensions, Platform, StyleSheet } from "react-native";
const { width, height } = Dimensions.get("window");
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },

  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  headerBlur: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 12,
    paddingHorizontal: 16,
    overflow: "hidden",
  },
  headerBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
    marginHorizontal: 12,
  },
  headerAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  }, // Video Player

  videoContainer: {
    width,
    height: width * 1.6,
    position: "relative",
    backgroundColor: "#000",
  },
  videoPlayer: {
    width: "100%",
    height: "100%",
  },
  videoGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  videoTopControls: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 40,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  videoControlBtn: {
    borderRadius: 20,
    overflow: "hidden",
  },
  controlBtnBlur: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  videoBottomInfo: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryTag: {
    backgroundColor: "rgba(0, 212, 255, 0.15)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0, 212, 255, 0.3)",
  },
  categoryTagText: {
    color: "#5e5ce6",
    fontSize: 12,
    fontWeight: "700",
  },
  viewsTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(0, 212, 255, 0.2)",
  },
  viewsText: {
    color: "#5e5ce6",
    fontSize: 12,
    fontWeight: "600",
  }, // Content

  content: {
    backgroundColor: "#000",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: 28,
    paddingTop: 20,
  }, // Title Section

  titleSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  videoTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    lineHeight: 28,
  }, // User Card

  userCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 20,
    backgroundColor: "rgba(0, 212, 255, 0.05)",
    borderRadius: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(0, 212, 255, 0.1)",
  },
  userContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#5e5ce6",
  },
  userInfo: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
  userRealName: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
    marginTop: 2,
  },
  userActions: {
    flexDirection: "row",
    gap: 10,
  },
  followButton: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: "#5e5ce6",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  followingButton: {
    backgroundColor: "rgba(0, 212, 255, 0.15)",
    borderWidth: 1,
    borderColor: "#5e5ce6",
  },
  followButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  messageButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0, 212, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0, 212, 255, 0.3)",
  }, // Description

  descriptionSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  videoDescription: {
    fontSize: 15,
    color: "rgba(255,255,255,0.85)",
    lineHeight: 22,
  },
  showMoreText: {
    color: "#5e5ce6",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 6,
  }, // Hashtags

  hashtagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  hashtag: {
    backgroundColor: "rgba(0, 212, 255, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0, 212, 255, 0.2)",
  },
  hashtagText: {
    color: "#5e5ce6",
    fontSize: 13,
    fontWeight: "600",
  }, /// Stats

  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 20,
  },

  stat: {
    flex: 1,
    alignItems: "center",
  },

  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },

  statLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
    marginTop: 2,
  }, // Actions (Minimal & Serious)
  actionButtons: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 10,
  },

  actionButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.08)", // very subtle
  },

  actionButtonActive: {
    backgroundColor: "rgba(0,212,255,0.18)", // soft, no border
  },

  actionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#fff",
  }, // Tabs

  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 212, 255, 0.1)",
    paddingBottom: 16,
  },
  tab: {
    flex: 1,
    paddingBottom: 0,
    alignItems: "center",
    position: "relative",
  },
  activeTab: {},
  tabText: {
    fontSize: 15,
    fontWeight: "700",
    color: "rgba(255,255,255,0.5)",
  },
  activeTabText: {
    color: "#5e5ce6",
  },
  tabIndicator: {
    position: "absolute",
    bottom: -16,
    width: 30,
    height: 3,
    backgroundColor: "#5e5ce6",
    borderRadius: 1.5,
  }, // Comments Section

  commentsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  }, // --- COMMENT STYLES (YANGI QO'SHILDI) ---

  commentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  commentContent: {
    flexDirection: "row",
    flex: 1,
    marginRight: 10,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  commentBody: {
    flex: 1,
  },
  commentUser: {
    fontSize: 13,
    fontWeight: "700",
    color: "rgba(255,255,255,0.7)",
    marginBottom: 4,
  },
  commentText: {
    fontSize: 15,
    color: "#fff",
    lineHeight: 22,
  },
  commentMeta: {
    flexDirection: "row",
    marginTop: 8,
    gap: 12,
    alignItems: "center",
  },
  commentTime: {
    fontSize: 12,
    color: "rgba(255,255,255,0.4)",
  },
  commentReplyText: {
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(255,255,255,0.6)",
  },
  commentActions: {
    alignItems: "center",
    paddingLeft: 10,
  },
  commentLikes: {
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
    marginTop: 4,
    fontWeight: "600",
  }, // Reply Styles (YANGI QO'SHILDI)

  repliesContainer: {
    marginTop: 15,
    paddingLeft: 10,
    borderLeftWidth: 2,
    borderLeftColor: "rgba(0, 212, 255, 0.1)",
  },
  replyItem: {
    flexDirection: "row",
    paddingVertical: 8,
  },
  replyAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  replyBody: {
    flex: 1,
  },
  replyUser: {
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(255,255,255,0.6)",
    marginBottom: 2,
  },
  replyText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    lineHeight: 20,
  }, // --- COMMENT STYLES TUGADI --- // Related
  relatedSection: {
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  relatedRow: {
    justifyContent: "space-between",
    marginBottom: 16,
  },

  playIconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(0, 212, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#5e5ce6",
  },
  relatedInfo: {
    padding: 12,
  },
  relatedTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 6,
    lineHeight: 18,
  },
  relatedStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  relatedUser: {
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
    fontWeight: "600",
  },
  relatedDot: {
    fontSize: 10,
    color: "rgba(255,255,255,0.4)",
  },
  relatedViews: {
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
  }, // Empty State

  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 15,
    color: "rgba(255,255,255,0.5)",
    marginTop: 12,
    fontWeight: "600",
  }, // Comment Input

  commentInputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === "ios" ? 32 : 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 212, 255, 0.1)",
    overflow: "hidden",
    gap: 10,
  },
  inputAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "rgba(0, 212, 255, 0.3)",
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: "rgba(0, 212, 255, 0.08)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(0, 212, 255, 0.2)",
    overflow: "hidden",
  },
  commentInput: {
    flex: 1,
    color: "#fff",
    fontSize: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#5e5ce6",
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "rgba(0, 212, 255, 0.3)",
  }, // Loading & Error

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0a0e27",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0a0e27",
  },
  errorText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    marginTop: 12,
  },
});
