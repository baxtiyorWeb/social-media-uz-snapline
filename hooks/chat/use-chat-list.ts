import api from "@/config/api";
import { useCheckAuth } from "@/hooks/check-auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "react-native"; // Foydalanuvchiga xabar berish uchun
import { io, Socket } from "socket.io-client";

// SOCKET URL ni o'zgartirmaymiz
const SOCKET_URL = "snappy-backend-pearl.vercel.app";

export interface ChatListItem {
  id: number;
  isGroup: boolean;
  title?: string | null | undefined;
  avatar?: string | null | undefined;
  participants: {
    id: number;
    name: string;
    avatar?: string | null | undefined;
    isAdmin: boolean;
    isOnline?: boolean;
  }[];
  lastMessage: {
    id?: number;
    text: string;
    senderId?: number;
    sender?: string;
    createdAt?: string | any;
    mediaType?: string;
  } | null;
  unreadCount: number;
  isOnline?: boolean;
  isBlocked?: boolean; // Bloklash statusi uchun yangi maydon
}

export const useChatList = () => {
  const { user } = useCheckAuth();
  const router = useRouter();

  // Normalize user id to number for comparisons (handles string | undefined)
  const myId = typeof user?.id === "string" ? Number(user.id) : user?.id;

  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<number>>(new Set());

  const socketRef = useRef<Socket | null>(null);

  // Chatlarni yuklash
  const loadChats = useCallback(
    async (showLoader = true) => {
      try {
        if (showLoader) setIsLoading(true);

        const response = await api.get("/chat/list?page=1&limit=50");
        const chatData: ChatListItem[] = response.data.data;

        // Online statuslarni qo'shish
        const chatsWithOnline = chatData.map((chat) => {
          // Guruh bo'lmagan suhbatlar uchun online statusini tekshirish
          if (!chat.isGroup && chat.participants.length > 0) {
            const otherUser = chat.participants.find((p) => p.id !== myId);
            return {
              ...chat,
              isOnline: otherUser ? onlineUsers.has(otherUser.id) : false,
              // isBlocked maydoni back-end dan kelishi kerak, agar kelmasa default false
              isBlocked: (chat as any).isBlocked || false,
            };
          }
          return chat;
        });

        setChats(chatsWithOnline);
        console.log(`📋 Loaded ${chatData.length} chats`);
      } catch (error) {
        console.error("❌ Error loading chats:", error);
      } finally {
        setIsLoading(false);
        setRefreshing(false);
      }
    },
    [user?.id, onlineUsers]
  );

  // Pull to refresh
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadChats(false);
  }, [loadChats]);

  // ==========================================================
  // ⚡ YANGI AMALLAR (Bloklash va O'chirish) ⚡
  // ==========================================================

  // Chatni bloklash
  const handleBlockChat = useCallback(async (chatId: number) => {
    Alert.alert(
      "Suhbatni bloklash",
      "Bu suhbatni chindan ham bloklamoqchimisiz? Bloklangandan so'ng, siz bu suhbatdan xabar olmaysiz.",
      [
        {
          text: "Bekor qilish",
          style: "cancel",
        },
        {
          text: "Bloklash",
          style: "destructive",
          onPress: async () => {
            try {
              // API chaqiruvi (POST /chat/:chatId/block)
              await api.post(`/chat/${chatId}/block`);

              // UI ni yangilash: chatni isBlocked deb belgilash (yoki ro'yxatdan olib tashlash)
              setChats((prevChats) =>
                prevChats.map((chat) =>
                  chat.id === chatId ? { ...chat, isBlocked: true } : chat
                )
              );
              Alert.alert("Muvaffaqiyatli", "Suhbat bloklandi.");

              // Keyingi yangilanishda bu chatni List API qaytarmasligi kerak.
              // Lekin darhol ko'rinishdan olib tashlash yaxshiroq bo'ladi:
              // setChats((prevChats) => prevChats.filter((chat) => chat.id !== chatId));
            } catch (error) {
              console.error("❌ Error blocking chat:", error);
              Alert.alert("Xato", "Suhbatni bloklashda xatolik yuz berdi.");
            }
          },
        },
      ]
    );
  }, []);

  // Chatni o'chirish
  const handleDeleteChat = useCallback(async (chatId: number) => {
    Alert.alert(
      "Suhbatni o'chirish",
      "Bu suhbatni chindan ham o'chirmoqchimisiz? Bu amal qaytarilmaydi. (Sizning tarafingizdan o'chiriladi)",
      [
        {
          text: "Bekor qilish",
          style: "cancel",
        },
        {
          text: "O'chirish",
          style: "destructive",
          onPress: async () => {
            try {
              // API chaqiruvi (DELETE /chat/:chatId)
              await api.delete(`/chat/${chatId}`);

              // UI ni yangilash: chatni ro'yxatdan olib tashlash
              setChats((prevChats) =>
                prevChats.filter((chat) => chat.id !== chatId)
              );
              Alert.alert("Muvaffaqiyatli", "Suhbat o'chirildi.");
            } catch (error) {
              console.error("❌ Error deleting chat:", error);
              Alert.alert("Xato", "Suhbatni o'chirishda xatolik yuz berdi.");
            }
          },
        },
      ]
    );
  }, []);

  // ==========================================================
  // ⚡ SOCKET ULANISHI (Avvalgisi + qo'shimcha) ⚡
  // ==========================================================

  // Socket ulanishi
  useEffect(() => {
    let isMounted = true;

    const initSocket = async () => {
      try {
        const token = await AsyncStorage.getItem("access_token");
        if (!token || !user?.id) return;

        console.log(`🔌 Connecting chat list socket with userId: ${user.id}`);

        socketRef.current = io(SOCKET_URL, {
          transports: ["websocket"],
          reconnection: true,
          auth: { userId: user.id },
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5,
        });

        socketRef.current.on("connect", () => {
          console.log(
            `✅ Chat list socket connected: ${socketRef.current?.id}`
          );
        });

        socketRef.current.on("disconnect", (reason) => {
          console.log(`❌ Chat list socket disconnected: ${reason}`);
        });

        // User online/offline (avvalgidek)
        socketRef.current.on("user_online", (data) => {
          console.log(`🟢 User ${data.userId} is online`);
          setOnlineUsers((prev) => new Set(prev).add(data.userId));
          setChats((prevChats) =>
            prevChats.map((chat) => {
              if (!chat.isGroup) {
                const otherUser = chat.participants.find((p) => p.id !== myId);
                if (otherUser?.id === data.userId) {
                  return { ...chat, isOnline: true };
                }
              }
              return chat;
            })
          );
        });

        socketRef.current.on("user_offline", (data) => {
          console.log(`🔴 User ${data.userId} is offline`);
          setOnlineUsers((prev) => {
            const newSet = new Set(prev);
            newSet.delete(data.userId);
            return newSet;
          });
          setChats((prevChats) =>
            prevChats.map((chat) => {
              if (!chat.isGroup) {
                const otherUser = chat.participants.find((p) => p.id !== myId);
                if (otherUser?.id === data.userId) {
                  return { ...chat, isOnline: false };
                }
              }
              return chat;
            })
          );
        });

        // Yangi xabar kelganda (avvalgidek)
        socketRef.current.on("new_message", (data) => {
          console.log(`📩 New message in chat ${data.chatId}`);

          setChats((prevChats) => {
            const updatedChats = prevChats.map((chat) => {
              if (chat.id === data.chatId) {
                const isMyMessage = data.senderId === user?.id;
                return {
                  ...chat,
                  lastMessage: {
                    id: data.id,
                    text: data.text || "",
                    senderId: data.senderId,
                    sender: data.senderName || "User",
                    createdAt: data.createdAt,
                    mediaType: data.mediaType,
                  },
                  unreadCount: isMyMessage
                    ? chat.unreadCount
                    : chat.unreadCount + 1,
                };
              }
              return chat;
            });

            // Yangi xabar kelgan chatni tepaga ko'tarish
            const chatIndex = updatedChats.findIndex(
              (c) => c.id === data.chatId
            );
            if (chatIndex >= 0) {
              // >= 0 deb o'zgartirildi (agar chat topilsa 0-index bo'lishi mumkin)
              const [movedChat] = updatedChats.splice(chatIndex, 1);
              updatedChats.unshift(movedChat);
            } else {
              // Agar chat ro'yxatda bo'lmasa, uni yuklab olish kerak.
              // Hozircha oddiylik uchun reload qilmaymiz, lekin ideal holatda bu yerga yangi chatni to'liq obyekti bilan qo'shish kerak.
              // loadChats(false);
            }

            return updatedChats;
          });
        });

        // Chat yangilanganda (avvalgidek)
        socketRef.current.on("chat_updated", (data) => {
          console.log(`🔄 Chat ${data.chatId} updated`);

          setChats((prevChats) => {
            const updatedChats = prevChats.map((chat) => {
              if (chat.id === data.chatId && data.lastMessage) {
                return {
                  ...chat,
                  lastMessage: {
                    id: data.lastMessage.id,
                    text: data.lastMessage.text,
                    senderId: data.lastMessage.senderId,
                    sender: data.lastMessage.senderName || "User",
                    createdAt: data.lastMessage.createdAt,
                  },
                };
              }
              return chat;
            });

            const chatIndex = updatedChats.findIndex(
              (c) => c.id === data.chatId
            );
            if (chatIndex >= 0) {
              const [movedChat] = updatedChats.splice(chatIndex, 1);
              updatedChats.unshift(movedChat);
            }
            return updatedChats;
          });
        });

        // Xabar o'qilganda (avvalgidek)
        socketRef.current.on("message_read", (data) => {
          console.log(`👁️ Message read in chat ${data.chatId}`);
          setChats((prevChats) =>
            prevChats.map((chat) => {
              if (chat.id === data.chatId && data.readerId !== user?.id) {
                return {
                  ...chat,
                  unreadCount: Math.max(0, chat.unreadCount - data.readCount), // data.readCount ishlatilishi mumkin
                };
              }
              return chat;
            })
          );
        });

        // Barcha xabarlar o'qilganda (avvalgidek)
        socketRef.current.on("all_messages_read", (data) => {
          console.log(`👁️ All messages read in chat ${data.chatId}`);
          setChats((prevChats) =>
            prevChats.map((chat) => {
              if (chat.id === data.chatId && data.readerId !== user?.id) {
                return {
                  ...chat,
                  unreadCount: 0,
                };
              }
              return chat;
            })
          );
        });

        // Xabar o'chirilganda (avvalgidek)
        socketRef.current.on("message_deleted", (data) => {
          console.log(`🗑️ Message deleted in chat ${data.chatId}`);
          setChats((prevChats) =>
            prevChats.map((chat) => {
              if (
                chat.id === data.chatId &&
                chat.lastMessage?.id === data.messageId
              ) {
                return {
                  ...chat,
                  lastMessage: {
                    ...chat.lastMessage,
                    text: "Xabar o'chirildi",
                  },
                };
              }
              return chat;
            })
          );
        });

        // Xabar tahrirlaganda (avvalgidek)
        socketRef.current.on("message_edited", (data) => {
          console.log(`✏️ Message edited in chat ${data.chatId}`);
          setChats((prevChats) =>
            prevChats.map((chat) => {
              if (
                chat.id === data.chatId &&
                chat.lastMessage?.id === data.messageId
              ) {
                return {
                  ...chat,
                  lastMessage: {
                    ...chat.lastMessage,
                    text: data.newText,
                  },
                };
              }
              return chat;
            })
          );
        });
      } catch (error) {
        console.error("❌ Socket initialization error:", error);
      }
    };

    initSocket();

    return () => {
      isMounted = false;
      console.log(`🔌 Disconnecting chat list socket`);
      socketRef.current?.disconnect();
    };
  }, [user?.id]);

  // Dastlabki yuklash
  useEffect(() => {
    loadChats();
  }, [loadChats]);

  // Chatni ochish (avvalgidek)
  const openChat = useCallback(
    (chat: ChatListItem) => {
      const otherUser = !chat.isGroup
        ? chat.participants.find((p) => p.id !== myId)
        : null;

      router.push({
        pathname: "/chat/[id]",
        params: {
          id: chat.id.toString(),
          user: chat.isGroup
            ? chat.title || "Group Chat"
            : otherUser?.name || "User",
          avatar: chat.isGroup ? chat.avatar || "" : otherUser?.avatar || "",
          online: chat.isOnline ? "true" : "false",
          userId: otherUser?.id.toString() || "",
        },
      });
    },
    [user?.id, router]
  );

  // Unread count (avvalgidek)
  const totalUnreadCount = chats.reduce(
    (sum, chat) => sum + chat.unreadCount,
    0
  );

  return {
    chats,
    isLoading,
    refreshing,
    totalUnreadCount,
    onlineUsers,
    loadChats,
    handleRefresh,
    openChat,
    handleBlockChat, // Eksport qilingan yangi funksiya
    handleDeleteChat, // Eksport qilingan yangi funksiya
  };
};
