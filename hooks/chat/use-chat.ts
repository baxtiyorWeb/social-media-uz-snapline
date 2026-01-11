import api from "@/config/api";
import { useCheckAuth } from "@/hooks/check-auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, FlatList, Keyboard } from "react-native";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = "https://snappy-backend-pearl.vercel.app";

interface ChatMessage {
  id: string;
  text: string;
  time: string;
  isSent: boolean;
  status?: "sent" | "delivered" | "read" | "failed" | "sending";
  mediaUrl?: string;
  mediaType?: "image" | "video" | "audio";
  isDeleted?: boolean;
  replyTo?: {
    id: string;
    text: string;
    senderId?: string;
    senderName?: string;
  } | null;
  isForwarded?: boolean;
  senderId?: number;
  senderName?: string;
  senderAvatar?: string;
}

interface ChatParams {
  id: string;
  user: string;
  avatar: string;
  online: string;
  userId: string;
}

export const useChat = () => {
  const params = useLocalSearchParams() as unknown as ChatParams;
  const router = useRouter();
  const { user } = useCheckAuth();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState("");
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [userOnlineStatus, setUserOnlineStatus] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<ChatMessage | null>(
    null
  );
  const [menuVisible, setMenuVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const flatListRef = useRef<FlatList<ChatMessage>>(null);
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shouldScrollRef = useRef(true);

  const chatId = Number(params?.id || 0);
  const receiverId = Number(params?.userId || 0);
  const username = params?.user || "User";
  const userAvatar = params?.avatar || "";

  // Keyboard listeners
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener("keyboardWillShow", (e) => {
      setKeyboardHeight(e.endCoordinates.height);
      setTimeout(() => scrollToBottom(), 100);
    });
    const keyboardWillHide = Keyboard.addListener("keyboardWillHide", () => {
      setKeyboardHeight(0);
    });

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  const scrollToBottom = useCallback(
    (animated = true) => {
      if (shouldScrollRef.current && messages.length > 0) {
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated });
        }, 100);
      }
    },
    [messages.length]
  );

  // Xabarlarni yuklash
  useEffect(() => {
    let isMounted = true;

    const loadMessages = async () => {
      try {
        const response = await api.get(
          `/chat/${chatId}/messages?page=1&limit=50`
        );

        if (isMounted) {
          const formattedMessages = response.data.data.map((msg: any) => ({
            id: msg.id?.toString() || Date.now().toString(),
            text: msg.text || "",
            time: new Date(msg.createdAt).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            }),
            isSent: user?.id === msg.senderId,
            status: msg.readBy?.some((r: any) => r.id !== msg.senderId)
              ? "read"
              : msg.isDelivered
              ? "delivered"
              : "sent",
            mediaUrl: msg.mediaUrl,
            mediaType: msg.mediaType,
            isDeleted: msg.isDeleted || false,
            isForwarded: msg.isForwarded || false,
            senderId: msg.senderId,
            senderName: msg.senderName,
            replyTo: msg.replyTo
              ? {
                  id: msg.replyTo.id?.toString(),
                  text: msg.replyTo.text,
                  senderId: msg.replyTo.senderId?.toString(),
                  senderName: msg.replyTo.senderName,
                }
              : null,
            senderAvatar: msg.senderAvatar,
          }));

          setMessages(formattedMessages);
          console.log(`📥 Loaded ${formattedMessages.length} messages`);

          // Xabarlar yuklangandan so'ng pastga scroll qilish
          setTimeout(() => scrollToBottom(false), 200);
        }
      } catch (error) {
        console.error("❌ Error loading messages:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadMessages();

    return () => {
      isMounted = false;
    };
  }, [chatId, user?.id]);

  // Socket ulanishi
  useEffect(() => {
    let isMounted = true;

    const initSocket = async () => {
      try {
        const token = await AsyncStorage.getItem("access_token");
        if (!token) {
          if (isMounted) router.back();
          return;
        }

        console.log(`🔌 Connecting to socket with userId: ${user?.id}`);

        socketRef.current = io(SOCKET_URL, {
          transports: ["websocket"],
          reconnection: true,
          auth: { userId: user?.id },
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5,
        });

        socketRef.current.on("connect", () => {
          console.log(`✅ Socket connected: ${socketRef.current?.id}`);
          socketRef.current?.emit("join_chat", { chatId });
          socketRef.current?.emit("get_user_status", { userId: receiverId });
        });

        socketRef.current.on("disconnect", (reason) => {
          console.log(`❌ Socket disconnected: ${reason}`);
        });

        socketRef.current.on("reconnect", (attemptNumber) => {
          console.log(`🔄 Reconnected after ${attemptNumber} attempts`);
          socketRef.current?.emit("join_chat", { chatId });
          socketRef.current?.emit("get_user_status", { userId: receiverId });
        });

        socketRef.current.on("connect_error", (error) => {
          console.error("❌ Socket connection error:", error);
        });

        socketRef.current.on("user_online", (data) => {
          console.log(`🟢 User ${data.userId} is online`);
          if (data.userId === receiverId) {
            setUserOnlineStatus(true);
          }
        });

        socketRef.current.on("user_offline", (data) => {
          console.log(`🔴 User ${data.userId} is offline`);
          if (data.userId === receiverId) {
            setUserOnlineStatus(false);
          }
        });

        socketRef.current.on("user_status", (res) => {
          console.log(
            `📊 Status response for user ${res.userId}: ${
              res.isOnline ? "Online" : "Offline"
            }`
          );
          if (res.userId === receiverId) {
            setUserOnlineStatus(res.isOnline);
          }
        });

        socketRef.current.on("new_message", (data) => {
          console.log(`📩 New message received:`, data);
          if (data?.senderId === user?.id) return;
          const isMe = data.senderId === user?.id;

          const formatted: ChatMessage = {
            id: data.id.toString(),
            text: data.text || "",
            time: new Date(data.createdAt).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            }),
            isSent: isMe,
            status: isMe ? "delivered" : "sent",
            senderId: data.senderId,
            senderName: data.senderName || "User",
            mediaUrl: data.mediaUrl,
            isDeleted: false,
            replyTo: data.replyTo
              ? {
                  id: data.replyTo.id?.toString(),
                  text: data.replyTo.text,
                  senderId: data.replyTo.senderId?.toString(),
                  senderName: data.replyTo.senderName,
                }
              : null,
            senderAvatar: data.senderAvatar,
          };

          setMessages((prev) => {
            if (prev.some((m) => m.id === data.id.toString())) {
              console.log(`⚠️ Message ${data.id} already exists`);
              return prev;
            }
            console.log(`✅ Adding new message ${data.id}`);
            return [...prev, formatted];
          });

          // Agar boshqa userdan xabar kelsa, avtomatik o'qilgan deb belgilash
          if (!isMe) {
            setTimeout(() => {
              socketRef.current?.emit("mark_read", {
                chatId,
                messageId: data.id,
              });
            }, 500);
          }

          setTimeout(() => scrollToBottom(), 100);
        });

        // Typing event - to'g'rilandi
        socketRef.current.on("user_typing", (data) => {
          console.log(`⌨️ Typing event:`, data);
          if (data.userId === receiverId && data.chatId === chatId) {
            setIsTyping(data.typing);
            setTypingUser(data.typing ? data.userName || username : "");

            // Typing ko'rsatilganda scroll
            if (data.typing) {
              setTimeout(() => scrollToBottom(), 100);
            }
          }
        });

        socketRef.current.on("message_delivered", (data) => {
          console.log(`✅ Message ${data.messageId} delivered`);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === data.messageId?.toString()
                ? { ...msg, status: "delivered" }
                : msg
            )
          );
        });

        socketRef.current.on("message_read", (data) => {
          console.log(`👁️ Message ${data.messageId} read by ${data.readerId}`);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === data.messageId?.toString() && msg.senderId === user?.id
                ? { ...msg, status: "read" }
                : msg
            )
          );
        });

        socketRef.current.on("all_messages_read", (data) => {
          console.log(`👁️ All messages read in chat ${data.chatId}`);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.senderId === user?.id && msg.status !== "read"
                ? { ...msg, status: "read" }
                : msg
            )
          );
        });

        socketRef.current.on("message_deleted", (data) => {
          console.log(`🗑️ Message ${data.messageId} deleted`);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === data.messageId?.toString()
                ? {
                    ...msg,
                    isDeleted: true,
                    text: "Xabar o'chirildi",
                    mediaUrl: undefined,
                  }
                : msg
            )
          );
        });

        socketRef.current.on("message_edited", (data) => {
          console.log(`✏️ Message ${data.messageId} edited`);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === data.messageId?.toString()
                ? { ...msg, text: data.newText }
                : msg
            )
          );
        });

        if (isMounted) setIsLoading(false);
      } catch (error) {
        console.error("❌ Socket initialization error:", error);
        if (isMounted) setIsLoading(false);
      }
    };

    initSocket();

    return () => {
      isMounted = false;
      console.log(`🔌 Disconnecting socket`);

      // Typing timeoutni tozalash
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      socketRef.current?.disconnect();
    };
  }, [chatId, receiverId, user?.id, router, username]);

  // Input o'zgarishi (typing)
  const handleInputChange = useCallback(
    (text: string) => {
      setMessage(text);

      if (!socketRef.current) {
        console.log("⚠️ Socket not connected for typing");
        return;
      }

      // Typing timeoutni tozalash
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Typing eventini yuborish
      const isTyping = text.length > 0;
      socketRef.current.emit("typing", {
        chatId,
        typing: isTyping,
        userName: user?.profile?.username || "User",
      });

      console.log(
        `⌨️ Typing: ${isTyping}, username: ${user?.profile?.username}`
      );

      // 2 soniyadan keyin typing to'xtatish
      if (isTyping) {
        typingTimeoutRef.current = setTimeout(() => {
          socketRef.current?.emit("typing", {
            chatId,
            typing: false,
            userName: user?.profile?.username || "User",
          });
          console.log(`⌨️ Typing stopped (timeout)`);
        }, 2000);
      }
    },
    [chatId, user?.profile?.username]
  );
  const handleSendMessage = useCallback(() => {
    if (!message.trim() || !socketRef.current || !user?.id) {
      console.log("⚠️ Cannot send message: empty or no connection");
      return;
    }

    const tempId = `temp_${Date.now()}`;
    const currentTime = new Date();

    const optimisticMessage: ChatMessage = {
      id: tempId,
      text: message.trim(),
      time: currentTime.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      isSent: true,
      status: "sending",
      senderId: Number(user?.id),
      replyTo: replyingTo
        ? {
            id: replyingTo.id,
            text: replyingTo.text,
            senderId: replyingTo.senderId?.toString(),
            senderName: replyingTo.senderName,
          }
        : null,
      senderAvatar: user?.profile?.avatar || userAvatar,
      senderName: user?.profile?.username || "User",
    };

    console.log(`📤 Sending message: "${message.trim()}"`);

    // Optimistic update
    setMessages((prev) => [...prev, optimisticMessage]);
    const messageText = message.trim();
    const replyToId = replyingTo?.id;

    setMessage("");
    setReplyingTo(null);

    // Stop typing
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    socketRef.current.emit("typing", {
      chatId,
      typing: false,
      userName: user?.profile?.username || "User",
    });

    Keyboard.dismiss();

    // Socket orqali xabar jo‘natish + ACK
    socketRef.current.emit(
      "send_message",
      {
        chatId,
        text: messageText,
        replyToId: replyToId ? Number(replyToId) : null,
        tempId,
      },
      (serverResponse: any) => {
        const realId = serverResponse?.messageId?.toString();
        if (!realId) return;

        console.log(`🔁 Temp ID ${tempId} → Real ID ${realId}`);

        // Update message
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempId
              ? {
                  ...m,
                  id: realId,
                  status: "delivered",
                }
              : m
          )
        );
      }
    );

    scrollToBottom();
  }, [message, replyingTo, chatId, user, userAvatar, scrollToBottom]);

  // Xabarni o'chirish
  const handleDeleteMessage = useCallback(
    (msg: ChatMessage) => {
      setMenuVisible(false);
      Alert.alert("O'chirish", "Xabarni o'chirishni xohlaysizmi?", [
        { text: "Bekor qilish", style: "cancel" },
        {
          text: "O'chirish",
          style: "destructive",
          onPress: async () => {
            try {
              console.log(`🗑️ Deleting message ${msg.id}`);

              await api.delete(`/chat/delete/${msg.id}`);

              setMessages((prev) =>
                prev.map((m) =>
                  m.id === msg.id
                    ? {
                        ...m,
                        isDeleted: true,
                        text: "Xabar o'chirildi",
                        mediaUrl: undefined,
                      }
                    : m
                )
              );

              socketRef.current?.emit("delete_message", {
                chatId,
                messageId: Number(msg.id),
              });

              console.log(`✅ Message ${msg.id} deleted`);
            } catch (error) {
              console.error("❌ Error deleting message:", error);
              Alert.alert("Xato", "Xabar o'chirishda muammo");
            }
          },
        },
      ]);
    },
    [chatId]
  );

  // Xabarni tahrirlash
  const handleEditMessage = useCallback(
    (msg: ChatMessage) => {
      setMenuVisible(false);
      Alert.prompt(
        "Xabarni Tahrirlash",
        "Yangi matnni kiriting",
        [
          { text: "Bekor qilish", style: "cancel" },
          {
            text: "Saqlash",
            onPress: async (newText: any) => {
              if (!newText?.trim()) return;

              try {
                console.log(`✏️ Editing message ${msg.id}`);

                await api.patch(`/chat/edit/${msg.id}`, { text: newText });

                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === msg.id ? { ...m, text: newText } : m
                  )
                );

                socketRef.current?.emit("edit_message", {
                  chatId,
                  messageId: Number(msg.id),
                  text: newText,
                });

                console.log(`✅ Message ${msg.id} edited`);
              } catch (error) {
                console.error("❌ Error editing message:", error);
                Alert.alert("Xato", "Xabar tahrirlashda muammo");
              }
            },
          },
        ],
        "plain-text",
        msg.text
      );
    },
    [chatId]
  );

  // Xabarga javob berish
  const handleReplyMessage = useCallback(
    (msg: ChatMessage) => {
      console.log(`💬 Replying to message ${msg.id}`);
      setMenuVisible(false);
      setReplyingTo(msg);
      scrollToBottom();
    },
    [scrollToBottom]
  );

  // Barcha xabarlarni o'qilgan deb belgilash
  const markAllAsRead = useCallback(async () => {
    try {
      await api.post(`/chat/${chatId}/mark-all-read`);

      socketRef.current?.emit("mark_all_read", { chatId });

      setMessages((prev) =>
        prev.map((msg) =>
          msg.senderId !== user?.id && msg.status !== "read"
            ? { ...msg, status: "read" }
            : msg
        )
      );

      console.log("✅ All messages marked as read");
    } catch (error) {
      console.error("❌ Error marking all as read:", error);
    }
  }, [chatId, user?.id]);

  // Xabar menyusini ko'rsatish
  const showMessageMenu = useCallback((msg: ChatMessage) => {
    console.log(`📋 Showing menu for message ${msg.id}`);
    setSelectedMessage(msg);
    setMenuVisible(true);
  }, []);

  // Scroll handle
  const handleScroll = useCallback((event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isAtBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - 50;
    shouldScrollRef.current = isAtBottom;
  }, []);

  return {
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
    keyboardHeight,

    username,
    userAvatar,
    currentUserId: user?.id,

    setMessage,
    setReplyingTo,
    setMenuVisible,

    handleInputChange,
    handleSendMessage,
    handleDeleteMessage,
    handleEditMessage,
    handleReplyMessage,
    showMessageMenu,
    markAllAsRead,
    handleScroll,
    scrollToBottom,
  };
};
