import api from '@/config/api';
import { useCheckAuth } from '@/hooks/check-auth';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://192.168.100.89:4040';
const { width, height } = Dimensions.get('window');

interface ChatMessage {
  id: string;
  text: string;
  time: string;
  isSent: boolean;
  status?: 'sent' | 'delivered' | 'read' | 'failed' | 'sending';
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'audio';
  isDeleted?: boolean;
  replyTo?: ChatMessage | null;
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

export default function ChatScreen() {
  const params = useLocalSearchParams<ChatParams>();
  const router = useRouter();
  const { user } = useCheckAuth()

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [userOnlineStatus, setUserOnlineStatus] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<ChatMessage | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);


  const flatListRef = useRef<FlatList>(null);
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const keyboardAnimRef = useRef(new Animated.Value(0)).current;

  const chatId = Number(params?.id || 0);
  const userId = Number(params?.userId || 0);
  const userName = params?.user || 'User';
  const userAvatar = params?.avatar || '';

  useEffect(() => {
    let isMounted = true;

    const loadMessages = async () => {
      try {
        const response = await api.get(`/chat/${chatId}/messages?page=1&limit=50`);

        if (isMounted) {
          const formattedMessages = response.data.data.map((msg: any) => ({
            id: msg.id?.toString() || Date.now().toString(),
            text: msg.text || '',
            time: new Date(msg.createdAt).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            }),
            isSent: user?.id && true,
            status: msg.reads?.length > 0 ? 'read' : msg.isDelivered ? 'delivered' : 'sent',
            mediaUrl: msg.mediaUrl,
            mediaType: msg.mediaType,
            isDeleted: msg.isDeleted || false,
            isForwarded: msg.isForwarded || false,
            senderId: msg.senderId,
            senderName: msg.senderName,
            replyTo: msg.replyTo || null,
          }));

          setMessages(formattedMessages);
        }
      } catch (error) {
        console.error('Error loading messages:', error);
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
  }, [chatId, userId]);

  useEffect(() => {
    let isMounted = true;

    const initSocket = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        if (!token) {
          if (isMounted) router.back();
          return;
        }

        socketRef.current = io(SOCKET_URL, {
          transports: ['websocket'],
          reconnection: true,
          auth: { userId },
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5,
        });

        socketRef.current.on('connect', () => {
          if (socketRef.current === null) {
            console.log('error')
          }
          socketRef.current.emit('join_chat', { chatId });

          // ❗❗❗ Qarshi tarafni tekshiramiz (receiverId)
          socketRef.current.emit('get_user_status', { userId: userId });
        });

        socketRef.current.on("user_online", (data) => {
          if (data.userId === userId) {
            setUserOnlineStatus(true);
          }
        });

        socketRef.current.on("user_offline", (data) => {
          if (data.userId === userId) {
            setUserOnlineStatus(false);
          }
        });

        socketRef.current.on("get_user_status", (res) => {
          if (res.userId === userId) {
            setUserOnlineStatus(res.isOnline);
          }
        });

        socketRef.current.on('new_message', (data) => {
          const isMe = data.senderId === userId;

          const formatted: ChatMessage = {
            id: data.id.toString(),
            text: data.text || '',
            time: new Date(data.createdAt).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            }),
            isSent: isMe,
            status: isMe ? 'delivered' : 'read',
            senderId: data.senderId,
            senderName: data.senderName || 'User',
            mediaUrl: data.mediaUrl,
            isDeleted: false,
            replyTo: data.replyTo || null,
          };

          setMessages(prev => {
            if (prev.some(m => m.id === data.id.toString())) return prev;
            return [...prev, formatted];
          });
        });

        socketRef.current.on('typing', (data) => {
          if (data.userId !== userId) {
            setIsTyping(data.typing);
            setTypingUser(data.typing ? data.userName : '');
          }
        });

        socketRef.current.on('message_delivered', (data) => {
          setMessages(prev =>
            prev.map(msg =>
              msg.id === data.messageId?.toString()
                ? { ...msg, status: 'delivered' }
                : msg
            )
          );
        });

        socketRef.current.on('message_read', (data) => {
          setMessages(prev =>
            prev.map(msg =>
              msg.id === data.messageId?.toString()
                ? { ...msg, status: 'read' }
                : msg
            )
          );
        });

        socketRef.current.on('message_deleted', (data) => {
          setMessages(prev =>
            prev.map(msg =>
              msg.id === data.messageId?.toString()
                ? { ...msg, isDeleted: true, text: "Xabar o'chirildi", mediaUrl: undefined }
                : msg
            )
          );
        });

        socketRef.current.on('message_edited', (data) => {
          setMessages(prev =>
            prev.map(msg =>
              msg.id === data.messageId?.toString()
                ? { ...msg, text: data.newText }
                : msg
            )
          );
        });

        if (isMounted) setIsLoading(false);
      } catch (error) {
        console.error('Socket connection error:', error);
        if (isMounted) setIsLoading(false);
      }
    };

    initSocket();

    return () => {
      isMounted = false;
      socketRef.current?.disconnect();
    };
  }, [chatId, userId, userId]);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleInputChange = useCallback(
    (text: string) => {
      setMessage(text);

      if (!socketRef.current) return;

      socketRef.current.emit('typing', {
        chatId,
        typing: text.length > 0,
        userName,
      });

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current?.emit('typing', {
          chatId,
          typing: false,
          userName,
        });
      }, 3000);
    },
    [chatId, userName]
  );

  const handleSendMessage = useCallback(async () => {
    if (!message.trim() || !socketRef.current) return;

    const tempId = Date.now().toString();

    const optimisticMessage: ChatMessage = {
      id: tempId,
      text: message.trim(),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      isSent: true,
      status: 'sending',
      senderId: user?.id,
      replyToId: replyingTo?.id || null,
      senderAvatar: userAvatar
    };

    setMessages(prev => [...prev, optimisticMessage]);
    setMessage('');
    setReplyingTo(null);

    try {
      const response = await api.post(`/chat/${chatId}/send`, {
        text: optimisticMessage.text,
        replyToId: replyingTo?.id || null,
      });

      const realId = response.data.id.toString();

      setMessages(prev =>
        prev.map(m =>
          m.id === tempId ? { ...m, id: realId, status: 'delivered' } : m
        )
      );

      socketRef.current.emit('send_message', {
        chatId,
        text: optimisticMessage.text,
        senderId: user?.id,
        skipSelf: true,
      });

    } catch (error) {
      console.error('Xabar yuborishda xato:', error);
      setMessages(prev =>
        prev.map(m =>
          m.id === tempId ? { ...m, status: 'failed' } : m
        )
      );
      Alert.alert('Xato', "Xabar jo'natishda muammo yuz berdi");
    }
  }, [message, replyingTo, chatId, userId]);

  const handleDeleteMessage = useCallback(
    (msg: ChatMessage) => {
      setMenuVisible(false);
      Alert.alert("O'chirish", "Xabarni o'chirishni xohlaysizmi?", [
        { text: 'Bekor qilish', style: 'cancel' },
        {
          text: "O'chirish",
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/chat/delete/${msg.id}`);

              setMessages((prev) =>
                prev.map((m) =>
                  m.id === msg.id
                    ? { ...m, isDeleted: true, text: "Xabar o'chirildi", mediaUrl: undefined }
                    : m
                )
              );

              socketRef.current?.emit('delete_message', {
                chatId,
                messageId: msg.id,
              });
            } catch (error) {
              console.error('Error deleting message:', error);
              Alert.alert('Xato', "Xabar o'chirishda muammo");
            }
          },
        },
      ]);
    },
    [chatId]
  );

  const handleEditMessage = useCallback(
    (msg: ChatMessage) => {
      setMenuVisible(false);
      Alert.prompt('Xabarni Tahrirlash', 'Yangi matnni kiriting', [
        { text: 'Bekor qilish', style: 'cancel' },
        {
          text: 'Saqlash',
          onPress: async (newText) => {
            if (!newText?.trim()) return;

            try {
              await api.patch(`/chat/edit/${msg.id}`, { text: newText });

              setMessages((prev) =>
                prev.map((m) => (m.id === msg.id ? { ...m, text: newText } : m))
              );

              socketRef.current?.emit('edit_message', {
                chatId,
                messageId: msg.id,
                text: newText,
              });
            } catch (error) {
              console.error('Error editing message:', error);
              Alert.alert('Xato', "Xabar tahrirlashda muammo");
            }
          },
        },
      ]);
    },
    [chatId]
  );

  const handleReplyMessage = useCallback((msg: ChatMessage) => {
    setMenuVisible(false);
    setReplyingTo(msg);
    scrollToBottom();
  }, [scrollToBottom]);

  const showMessageMenu = (msg: ChatMessage) => {
    setSelectedMessage(msg);
    setMenuVisible(true);
  };

  const renderMessage = useCallback(
    ({ item, index }: { item: ChatMessage; index: number }) => {
      const prevMessage = index > 0 ? messages[index - 1] : null;
      const nextMessage = index < messages.length - 1 ? messages[index + 1] : null;

      const isMe = item.senderId === user?.id;



      // Avatar faqat yangi blok boshlanganda chiqadi
      const showAvatar = !isMe && (!prevMessage || prevMessage.senderId !== item.senderId);

      // Bubble davomiyligi: ketma-ket kelgan xabarlar
      const continuesBubble = nextMessage && nextMessage.senderId === item.senderId;

      // Vaqt oxirgi xabarda ko‘rinadi
      const showTime = !nextMessage || nextMessage.senderId !== item.senderId;

      return (
        <View style={{ marginVertical: 2 }}>
          {/* Reply */}
          {item.replyTo && (
            <View style={[styles.replyContext, isMe && styles.replyContextSent]}>
              <View style={styles.replyLine} />
              <View style={styles.replyContent}>
                <Text style={styles.replyLabel}>Javob:</Text>
                <Text style={styles.replyText} numberOfLines={1}>
                  {item.replyTo.text}
                </Text>
              </View>
            </View>
          )}

          <View style={[styles.messageRow, isMe ? styles.sentMessageRow : styles.receivedMessageRow]}>
            {!isMe && showAvatar && (
              <Image
                source={{ uri: userAvatar }}
                style={styles.messageAvatar}
              />
            )}

            <View
              style={[
                styles.messageBubble,
                isMe ? styles.sentBubble : styles.receivedBubble,
                item.isDeleted && styles.deletedBubble,
                continuesBubble && (isMe ? styles.continuedSentBubble : styles.continuedReceivedBubble),
              ]}
            >
              {item.mediaUrl && (
                <Image source={{ uri: item.mediaUrl }} style={styles.mediaPreview} resizeMode="cover" />
              )}

              <Text
                style={[
                  styles.messageText,
                  isMe && styles.sentMessageText,
                  item.isDeleted && styles.deletedText,
                ]}
              >
                {item.isDeleted ? 'Xabar o‘chirildi' : item.text}
              </Text>

              {showTime && (
                <View style={styles.messageFooter}>
                  <Text style={[styles.messageTime, isMe && styles.sentMessageTime]}>
                    {item.time}
                  </Text>
                  {isMe && item.status && (
                    <Ionicons
                      name={
                        item.status === 'read'
                          ? 'checkmark-done'
                          : item.status === 'delivered'
                            ? 'checkmark-done'
                            : item.status === 'sending'
                              ? 'time-outline'
                              : item.status === 'failed'
                                ? 'close-circle'
                                : 'checkmark'
                      }
                      size={15}
                      color={
                        item.status === 'read'
                          ? '#00d4ff'
                          : item.status === 'failed'
                            ? '#ff3b5c'
                            : '#ffffff99'
                      }
                    />
                  )}
                </View>
              )}
            </View>

            {/* Avatar o‘ng tarafda (faqat o‘zingiz yuborgan) */}
            {isMe && showAvatar && (
              <Image
                source={{ uri: item.senderAvatar || 'https://i.pravatar.cc/150' }}
                style={styles.messageAvatar}
              />
            )}
          </View>
        </View>
      );
    },
    [messages, userId]
  );


  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#00d4ff" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'position' : 'padding'}
      keyboardVerticalOffset={10}
    >
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <BlurView intensity={95} tint="dark" style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.headerCenterButton}>
          <View style={styles.headerAvatarContainer}>
            <Image source={{ uri: userAvatar }} style={styles.headerAvatar} />
            {userOnlineStatus && <View style={styles.headerOnlineBadge} />}
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.headerName}>{userName}</Text>
            <Text style={styles.headerStatus}>
              {isTyping ? '✓ Yozmoqda...' : userOnlineStatus ? '● Online' : 'Offline'}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerIconButton}>
            <Ionicons name="call-outline" size={22} color="#00d4ff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconButton}>
            <Ionicons name="videocam-outline" size={22} color="#00d4ff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconButton}>
            <Ionicons name="ellipsis-vertical" size={22} color="#00d4ff" />
          </TouchableOpacity>
        </View>
      </BlurView>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        scrollEnabled={true}
        nestedScrollEnabled={false}
      />

      {/* Typing Indicator */}
      {isTyping && (
        <View style={styles.typingContainer}>
          <View style={styles.typingDots}>
            <Animated.View style={styles.typingDot} />
            <Animated.View style={styles.typingDot} />
            <Animated.View style={styles.typingDot} />
          </View>
          <Text style={styles.typingText}>{typingUser} yozmoqda...</Text>
        </View>
      )}

      {/* Reply Context */}
      {replyingTo && (
        <View style={styles.replyingToContainer}>
          <LinearGradient
            colors={['rgba(0, 212, 255, 0.1)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.replyingGradient}
          />
          <View style={styles.replyingContent}>
            <View style={styles.replyingLine} />
            <View style={{ flex: 1 }}>
              <Text style={styles.replyingLabel}>Javob qilish</Text>
              <Text style={styles.replyingText} numberOfLines={1}>
                {replyingTo.text}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setReplyingTo(null)} style={styles.closeButton}>
              <Ionicons name="close" size={20} color="rgba(255,255,255,0.5)" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Input */}
      <BlurView intensity={95} tint="dark" style={styles.inputContainer}>
        <TouchableOpacity style={styles.attachButton}>
          <Ionicons name="add-circle" size={28} color="#00d4ff" />
        </TouchableOpacity>

        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Xabar yozing..."
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={message}
            onChangeText={handleInputChange}
            multiline
            maxLength={1000}
            editable={!isLoading}
          />
          <TouchableOpacity style={styles.emojiButton}>
            <Ionicons name="happy-outline" size={22} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
          onPress={handleSendMessage}
          disabled={!message.trim()}
        >
          <Ionicons name="send" size={18} color="#fff" />
        </TouchableOpacity>
      </BlurView>

      {/* Message Context Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.contextMenu}>
                {selectedMessage && (
                  <>
                    <View style={styles.contextMenuHeader}>
                      <Text style={styles.contextMenuTitle}>Xabar amallari</Text>
                    </View>

                    <TouchableOpacity
                      style={styles.contextMenuItem}
                      onPress={() => handleReplyMessage(selectedMessage)}
                    >
                      <Ionicons name="arrow-redo-outline" size={20} color="#00d4ff" />
                      <Text style={styles.contextMenuText}>Javob berish</Text>
                    </TouchableOpacity>

                    {selectedMessage.isSent && (
                      <>
                        <TouchableOpacity
                          style={styles.contextMenuItem}
                          onPress={() => handleEditMessage(selectedMessage)}
                        >
                          <Ionicons name="pencil-outline" size={20} color="#00d4ff" />
                          <Text style={styles.contextMenuText}>Tahrirlash</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.contextMenuItem}
                          onPress={() => handleDeleteMessage(selectedMessage)}
                        >
                          <Ionicons name="trash-outline" size={20} color="#ff3b5c" />
                          <Text style={[styles.contextMenuText, { color: '#ff3b5c' }]}>
                            O'chirish
                          </Text>
                        </TouchableOpacity>
                      </>
                    )}

                    <TouchableOpacity
                      style={[styles.contextMenuItem, styles.contextMenuFooter]}
                      onPress={() => setMenuVisible(false)}
                    >
                      <Ionicons name="close-circle-outline" size={20} color="rgba(255,255,255,0.5)" />
                      <Text style={[styles.contextMenuText, { color: 'rgba(255,255,255,0.5)' }]}>
                        Yopish
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 2,
    backgroundColor: '#0a0e27',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 212, 255, 0.1)',
    overflow: 'hidden',
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  headerCenterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  headerAvatarContainer: {
    position: 'relative',
  },
  headerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: 'rgba(0, 212, 255, 0.3)',
  },
  headerOnlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 13,
    height: 13,
    borderRadius: 6.5,
    backgroundColor: '#4caf50',
    borderWidth: 2.5,
    borderColor: '#0a0e27',
  },
  headerInfo: {
    marginLeft: 12,
    flex: 1,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  headerStatus: {
    fontSize: 12,
    color: '#00d4ff',
    marginTop: 2,
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerIconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: 'rgba(0, 212, 255, 0.08)',
  },

  // Messages
  messagesContent: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexGrow: 1,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 4,
    maxWidth: '85%',
  },
  sentMessageRow: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  avatarContainer: {
    width: 36,
    marginRight: 8,
    justifyContent: 'flex-end',
  },
  messageAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 212, 255, 0.2)',
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
  },
  messageBubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    maxWidth: '100%',
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
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.15)',
  },
  sentBubble: {
    backgroundColor: '#00d4ff',
    borderBottomRightRadius: 4,
  },
  deletedBubble: {
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  messageText: {
    fontSize: 15,
    color: '#fff',
    lineHeight: 21,
  },
  sentMessageText: {
    color: '#000',
  },
  deletedText: {
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.4)',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    justifyContent: 'flex-end',
  },
  messageTime: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
  },
  sentMessageTime: {
    color: 'rgba(0,0,0,0.6)',
  },
  mediaPreview: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 8,
  },

  // Reply
  replyContext: {
    flexDirection: 'row',
    marginBottom: 6,
    paddingLeft: 12,
    alignItems: 'center',
  },
  replyContextSent: {
    marginLeft: 'auto',
    paddingRight: 12,
    paddingLeft: 0,
  },
  replyLine: {
    width: 2.5,
    height: 38,
    backgroundColor: '#00d4ff',
    marginRight: 10,
  },
  replyContent: {
    flex: 1,
  },
  replyLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600',
  },
  replyText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },

  // Typing
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 212, 255, 0.05)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 212, 255, 0.1)',
  },
  typingDots: {
    flexDirection: 'row',
    gap: 5,
    marginRight: 10,
  },
  typingDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#00d4ff',
  },
  typingText: {
    fontSize: 12,
    color: '#00d4ff',
    fontWeight: '600',
  },

  // Replying to
  replyingToContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 212, 255, 0.15)',
    backgroundColor: 'rgba(0, 212, 255, 0.08)',
    padding: 12,
    paddingHorizontal: 16,
    overflow: 'hidden',
  },
  replyingGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  replyingContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  replyingLine: {
    width: 2.5,
    height: 40,
    backgroundColor: '#00d4ff',
  },
  replyingLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 4,
    fontWeight: '600',
  },
  replyingText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },

  // Input
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 32 : 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 212, 255, 0.1)',
    overflow: 'hidden',
    gap: 10,
  },
  attachButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(0, 212, 255, 0.08)',
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 212, 255, 0.15)',
    minHeight: 44,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
    maxHeight: 100,
    paddingVertical: 8,
  },
  emojiButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
    borderRadius: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#00d4ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(0, 212, 255, 0.3)',
  },

  // Modal Context Menu
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  contextMenu: {
    backgroundColor: '#1a1f3a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? 32 : 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 212, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 20,
  },
  contextMenuHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 212, 255, 0.1)',
  },
  contextMenuTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  contextMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  contextMenuFooter: {
    borderBottomWidth: 0,
  },
  contextMenuText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#00d4ff',
    flex: 1,
  },
});