import { ChatListItem, useChatList } from "@/hooks/chat/use-chat-list";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React, { useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { RectButton, Swipeable } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

// ChatItemProps uchun model (yoki interfeys)

const ChatListScreen = () => {
  const {
    chats,
    isLoading,
    refreshing,
    totalUnreadCount,
    handleRefresh,
    openChat,
    handleBlockChat,
    handleDeleteChat,
  } = useChatList();

  const swipeableRefs = useRef<Record<number, Swipeable | null>>({});

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return minutes < 1 ? "Hozir" : `${minutes}d`;
    }

    if (hours < 24) {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    }

    const days = Math.floor(hours / 24);
    if (days === 1) return "Kecha";
    if (days < 7) return `${days} kun oldin`;

    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
    });
  };

  const getLastMessagePreview = (chat: ChatListItem) => {
    // ... avvalgi getLastMessagePreview funksiyasi qoldi
    if (!chat.lastMessage) return "Yangi suhbat boshlang";

    if (chat.lastMessage.mediaType) {
      switch (chat.lastMessage.mediaType) {
        case "image":
          return "📷 Foto";
        case "video":
          return "🎥 Video";
        case "audio":
          return "🎵 Audio";
        default:
          return "📎 Fayl";
      }
    }

    const prefix =
      chat.lastMessage.senderId === chat.participants[0]?.id
        ? "Siz: "
        : chat.isGroup
        ? `${chat.lastMessage.sender}: `
        : "";

    return `${prefix}${chat.lastMessage.text}`;
  };

  const closeOtherSwipeables = (id: number) => {
    Object.keys(swipeableRefs.current).forEach((key) => {
      const currentId = parseInt(key);
      if (currentId !== id && swipeableRefs.current[currentId]) {
        swipeableRefs.current[currentId]?.close();
      }
    });
  };

  // Surish (Swipe) amallarini render qilish funksiyasi
  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
    item: ChatListItem
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: "clamp",
    });

    // Bloklash tugmasi (Asosiy xavfli amal)
    const renderBlockButton = () => (
      <RectButton
        style={[styles.rightAction, { backgroundColor: "#FF3B30" }]}
        onPress={() => {
          swipeableRefs.current[item.id]?.close();
          handleBlockChat(item.id);
        }}
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          <Ionicons name="hand-right-outline" size={24} color="#FFF" />
          <Text style={styles.actionText}>Bloklash</Text>
        </Animated.View>
      </RectButton>
    );

    // O'chirish tugmasi (Ikkilamchi amal)
    const renderDeleteButton = () => (
      <RectButton
        style={[styles.rightAction, { backgroundColor: "#A0A0A0" }]}
        onPress={() => {
          swipeableRefs.current[item.id]?.close();
          handleDeleteChat(item.id);
        }}
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          <Ionicons name="trash-outline" size={24} color="#FFF" />
          <Text style={styles.actionText}>O'chirish</Text>
        </Animated.View>
      </RectButton>
    );

    return (
      <View style={styles.rightActionsContainer}>
        {renderBlockButton()}
        {renderDeleteButton()}
      </View>
    );
  };

  const renderChatItem = ({
    item,
    index,
  }: {
    item: ChatListItem;
    index: number;
  }) => {
    const otherUser = !item.isGroup
      ? item.participants.find((p: any) => p.id !== item.participants[0]?.id)
      : null;

    const displayName = item.isGroup
      ? item.title || "Guruh suhbati"
      : otherUser?.name || "Foydalanuvchi";

    const displayAvatar = item.isGroup ? item.avatar : otherUser?.avatar;

    const isLast = index === chats.length - 1;

    return (
      <Swipeable
        ref={(ref) => {
          swipeableRefs.current[item.id] = ref;
        }}
        renderRightActions={(progress, dragX) =>
          renderRightActions(progress, dragX, item)
        }
        friction={2} // Surish tezligini boshqaradi
        rightThreshold={30}
        onSwipeableWillOpen={() => closeOtherSwipeables(item.id)}
      >
        <TouchableOpacity
          style={styles.chatItem}
          onPress={() => openChat(item)}
          activeOpacity={0.7}
        >
          <View style={styles.chatItemContent}>
            {/* Avatar with Online Status */}
            <View style={styles.avatarContainer}>
              {displayAvatar ? (
                <Image source={{ uri: displayAvatar }} style={styles.avatar} />
              ) : (
                <LinearGradient
                  colors={["#667EEA", "#764BA2"]}
                  style={[styles.avatar, styles.avatarPlaceholder]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.avatarText}>
                    {displayName.charAt(0).toUpperCase()}
                  </Text>
                </LinearGradient>
              )}

              {/* Online Indicator */}
              {!item.isGroup && otherUser?.isOnline && (
                <View style={styles.onlineIndicatorWrapper}>
                  <View style={styles.onlineIndicator} />
                </View>
              )}

              {/* Unread Badge on Avatar */}
              {item.unreadCount > 0 && (
                <View style={styles.avatarBadge}>
                  <Text style={styles.avatarBadgeText}>
                    {item.unreadCount > 9 ? "9+" : item.unreadCount}
                  </Text>
                </View>
              )}
            </View>

            {/* Chat Info */}
            <View style={styles.chatInfo}>
              <View style={styles.chatHeader}>
                <View style={styles.chatTitleContainer}>
                  <Text
                    style={[
                      styles.chatName,
                      item.unreadCount > 0 && styles.chatNameUnread,
                    ]}
                    numberOfLines={1}
                  >
                    {displayName}
                  </Text>
                  {item.isGroup && (
                    <Ionicons
                      name="people"
                      size={14}
                      color="#999"
                      style={styles.groupIcon}
                    />
                  )}
                </View>
                {item.lastMessage && (
                  <Text
                    style={[
                      styles.chatTime,
                      item.unreadCount > 0 && styles.chatTimeUnread,
                    ]}
                  >
                    {formatTime(item?.lastMessage?.createdAt)}
                  </Text>
                )}
              </View>

              <View style={styles.chatFooter}>
                <Text
                  style={[
                    styles.lastMessage,
                    item.unreadCount > 0 && styles.unreadMessage,
                  ]}
                  numberOfLines={1}
                >
                  {getLastMessagePreview(item)}
                </Text>

                {item.unreadCount > 0 && (
                  <View style={styles.unreadBadgeSmall}>
                    <Text style={styles.unreadTextSmall}>
                      {item.unreadCount > 99 ? "99+" : item.unreadCount}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Swipe Actions Indicator - Endi keraksiz */}
          {/* <View style={styles.swipeIndicator}>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          </View> */}
        </TouchableOpacity>
        {!isLast && <View style={styles.separator} />}
      </Swipeable>
    );
  };

  const renderEmptyState = () => (
    // ... avvalgi renderEmptyState funksiyasi qoldi
    <View style={styles.emptyContainer}>
      <LinearGradient
        colors={["#667EEA", "#764BA2"]}
        style={styles.emptyIconContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Ionicons name="chatbubbles-outline" size={60} color="#FFF" />
      </LinearGradient>
      <Text style={styles.emptyText}>Xabarlar yo'q</Text>
      <Text style={styles.emptySubtext}>
        Yangi suhbat boshlash uchun qo'shish tugmasini bosing
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.listHeader}>
      <Text style={styles.listHeaderText}>Suhbatlar ro'yxati</Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={["#F8F9FA", "#E9ECEF"]}
          style={StyleSheet.absoluteFillObject}
        />
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Yuklanmoqda...</Text>
      </View>
    );
  }
  const normalizedChats: ChatListItem[] = chats.map((chat) => ({
    ...chat,
    title: chat.title ?? null,
    avatar: chat.avatar ?? null,
    participants: chat.participants.map((p) => ({
      ...p,
      avatar: p.avatar ?? null,
      isAdmin: p.isAdmin ?? false,
    })),
    lastMessage: chat.lastMessage
      ? {
          text: chat.lastMessage.text,
          senderId: chat.lastMessage.senderId ?? 0, // default value if missing
          sender: chat.lastMessage.sender ?? "Unknown",
          createdAt: chat.lastMessage.createdAt ?? new Date().toISOString(),
          mediaType: chat.lastMessage.mediaType,
        }
      : null,
  }));

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#F8F9FA", "#E9ECEF"]}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        {/* Header */}
        <BlurView intensity={80} tint="light" style={styles.headerBlur}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerTitle}>Xabarlar</Text>
              {totalUnreadCount > 0 && (
                <View style={styles.headerBadge}>
                  <Text style={styles.headerBadgeText}>
                    {totalUnreadCount > 99 ? "99+" : totalUnreadCount}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.headerAction}>
                <Ionicons name="search-outline" size={24} color="#007AFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerAction}>
                <Ionicons name="create-outline" size={24} color="#007AFF" />
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>

        {/* Chat List */}
        <FlatList
          data={normalizedChats}
          renderItem={renderChatItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={
            chats.length === 0 ? styles.emptyList : styles.chatList
          }
          ListEmptyComponent={renderEmptyState}
          ListHeaderComponent={chats.length > 0 ? renderHeader : null}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#007AFF"]}
              tintColor="#007AFF"
            />
          }
          showsVerticalScrollIndicator={false}
          // ItemSeparatorComponent olib tashlandi, uni renderChatItem ichida Swipeable ostiga joylashtirdim
        />

        {/* Floating Action Button */}
        <TouchableOpacity style={styles.fab} activeOpacity={0.8}>
          <LinearGradient
            colors={["#007AFF", "#0051D5"]}
            style={styles.fabGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="add" size={28} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
};

// --- STYLES ---
const styles = StyleSheet.create({
  // ... Avvalgi style lar ...
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
  headerBlur: {
    overflow: "hidden",
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "rgba(255,255,255,0.7)",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000",
  },
  headerBadge: {
    backgroundColor: "#FF3B30",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 12,
    minWidth: 24,
    alignItems: "center",
  },
  headerBadgeText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "700",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerAction: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  listHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  listHeaderText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  chatList: {
    paddingBottom: 80,
  },
  emptyList: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#667EEA",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#000",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    justifyContent: "space-between",
  },
  chatItemContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  separator: {
    height: 0.5,
    backgroundColor: "#E5E5E5",
    marginLeft: 88, // Avatar + margin eni
  },
  avatarContainer: {
    position: "relative",
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFF",
  },
  onlineIndicatorWrapper: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
  },
  onlineIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#34C759",
  },
  avatarBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#FF3B30",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  avatarBadgeText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "700",
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  chatTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  chatName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#000",
    flexShrink: 1,
  },
  chatNameUnread: {
    fontWeight: "800",
  },
  groupIcon: {
    marginLeft: 4,
  },
  chatTime: {
    fontSize: 13,
    color: "#999",
    marginLeft: 8,
    minWidth: 40,
    textAlign: "right",
  },
  chatTimeUnread: {
    color: "#007AFF",
    fontWeight: "600",
  },
  chatFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  lastMessage: {
    flex: 1,
    fontSize: 15,
    color: "#666",
    marginRight: 8,
  },
  unreadMessage: {
    fontWeight: "600",
    color: "#000",
  },
  unreadBadgeSmall: {
    backgroundColor: "#007AFF",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: "center",
    marginLeft: "auto",
  },
  unreadTextSmall: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "700",
  },
  swipeIndicator: {
    marginLeft: 8,
    opacity: 0.3,
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: "hidden",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  // --- SWIPE ACTIONS STYLES ---
  rightActionsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rightAction: {
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    height: "100%",
  },
  actionText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 4,
  },
});

export default ChatListScreen;
