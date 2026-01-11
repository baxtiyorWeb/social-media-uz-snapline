import { styles } from "@/hooks/chat/styles";
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

export default ChatListScreen;
