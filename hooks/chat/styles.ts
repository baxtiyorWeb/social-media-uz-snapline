import { Platform, StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  // Container
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.6)",
    fontWeight: "500",
  },

  // Header
  headerBlur: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
    overflow: "hidden",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.3,
  },
  headerBadge: {
    backgroundColor: "#5e5ce6",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  headerBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fff",
  },
  headerActions: {
    flexDirection: "row",
    gap: 12,
  },
  headerAction: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },

  // List
  chatList: {
    paddingTop: 8,
  },
  emptyList: {
    flexGrow: 1,
  },
  listHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  listHeaderText: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.6)",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },

  // Chat Item
  chatItem: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  chatItemContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  separator: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    marginLeft: 90,
  },

  // Avatar
  avatarContainer: {
    position: "relative",
    marginRight: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: "#5e5ce6",
  },
  avatarPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#5e5ce6",
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
  },
  onlineIndicatorWrapper: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  onlineIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4caf50",
  },
  avatarBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#ff3b5c",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2.5,
    borderColor: "#000",
  },
  avatarBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#fff",
  },

  // Chat Info
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  chatTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 6,
  },
  chatName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
    flex: 1,
  },
  chatNameUnread: {
    fontWeight: "800",
  },
  groupIcon: {
    marginLeft: 4,
    opacity: 0.7,
  },
  chatTime: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.5)",
    fontWeight: "500",
    marginLeft: 8,
  },
  chatTimeUnread: {
    color: "#5e5ce6",
    fontWeight: "700",
  },

  // Chat Footer
  chatFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lastMessage: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.6)",
    flex: 1,
    lineHeight: 20,
  },
  unreadMessage: {
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "600",
  },
  unreadBadgeSmall: {
    backgroundColor: "#5e5ce6",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  unreadTextSmall: {
    fontSize: 12,
    fontWeight: "800",
    color: "#fff",
  },

  // Swipe Actions
  rightActionsContainer: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  rightAction: {
    width: 90,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  actionText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 6,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    backgroundColor: "rgba(94, 92, 230, 0.2)",
    borderWidth: 4,
    borderColor: "#5e5ce6",
  },
  emptyText: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.6)",
    textAlign: "center",
    lineHeight: 22,
  },

  // FAB
  fab: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 100 : 80,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    shadowColor: "#5e5ce6",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  fabGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#5e5ce6",
    borderWidth: 3,
    borderColor: "rgba(94, 92, 230, 0.3)",
  },

  // Swipe Indicator
  swipeIndicator: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  videoStatIcon: {
    color: "#fff",
  },
});
