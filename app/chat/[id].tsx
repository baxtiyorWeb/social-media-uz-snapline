import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

interface ChatMessage {
  id: string;
  text: string;
  time: string;
  isSent: boolean;
  status?: 'sent' | 'delivered' | 'read';
}

const MOCK_CHAT: ChatMessage[] = [
  { id: '1', text: 'Hey! How are you doing?', time: '10:30', isSent: false },
  { id: '2', text: 'I\'m great! Just finished editing my new video 🎥', time: '10:32', isSent: true, status: 'read' },
  { id: '3', text: 'That sounds exciting! When are you posting it?', time: '10:33', isSent: false },
  { id: '4', text: 'Tomorrow morning! Want to see a preview?', time: '10:35', isSent: true, status: 'read' },
  { id: '5', text: 'Absolutely! Send it over 😊', time: '10:36', isSent: false },
  { id: '6', text: 'Here it is! Let me know what you think', time: '10:38', isSent: true, status: 'delivered' },
  { id: '7', text: 'Wow, the editing is amazing! 🔥', time: '10:40', isSent: false },
  { id: '8', text: 'Thanks! Spent hours on those transitions', time: '10:42', isSent: true, status: 'sent' },
];

export default function ChatScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_CHAT);
  const flatListRef = useRef<FlatList>(null);
  const inputHeight = useRef(new Animated.Value(50)).current;

  const { user, avatar, online } = params;

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const sendMessage = () => {
    if (message.trim()) {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        text: message.trim(),
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        isSent: true,
        status: 'sent',
      };
      setMessages([...messages, newMessage]);
      setMessage('');

      // Simulate received message after 2 seconds
      setTimeout(() => {
        const reply: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: 'Got it! 👍',
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
          isSent: false,
        };
        setMessages(prev => [...prev, reply]);
      }, 2000);
    }
  };

  const renderMessage = ({ item, index }: { item: ChatMessage; index: number }) => {
    const prevMessage = index > 0 ? messages[index - 1] : null;
    const showAvatar = !item.isSent && (!prevMessage || prevMessage.isSent);

    return (
      <View style={[styles.messageRow, item.isSent && styles.sentMessageRow]}>
        {!item.isSent && (
          <View style={styles.avatarContainer}>
            {showAvatar ? (
              <Image source={{ uri: avatar as string }} style={styles.messageAvatar} />
            ) : (
              <View style={styles.avatarPlaceholder} />
            )}
          </View>
        )}

        <View style={[styles.messageBubble, item.isSent ? styles.sentBubble : styles.receivedBubble]}>
          <Text style={[styles.messageText, item.isSent && styles.sentMessageText]}>{item.text}</Text>
          <View style={styles.messageFooter}>
            <Text style={[styles.messageTime, item.isSent && styles.sentMessageTime]}>{item.time}</Text>
            {item.isSent && item.status && (
              <Ionicons
                name={
                  item.status === 'read'
                    ? 'checkmark-done'
                    : item.status === 'delivered'
                      ? 'checkmark-done'
                      : 'checkmark'
                }
                size={14}
                color={item.status === 'read' ? '#5e5ce6' : 'rgba(255,255,255,0.5)'}
                style={{ marginLeft: 4 }}
              />
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <BlurView intensity={80} tint="dark" style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={styles.headerAvatarContainer}>
            <Image source={{ uri: avatar as string }} style={styles.headerAvatar} />
            {online === 'true' && <View style={styles.headerOnlineBadge} />}
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.headerName}>{user}</Text>
            <Text style={styles.headerStatus}>{online === 'true' ? 'Online' : 'Offline'}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
        </TouchableOpacity>
      </BlurView>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Input */}
      <BlurView intensity={100} tint="dark" style={styles.inputContainer}>
        <TouchableOpacity style={styles.attachButton}>
          <Ionicons name="add-circle" size={32} color="#5e5ce6" />
        </TouchableOpacity>

        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Message..."
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity style={styles.emojiButton}>
            <Ionicons name="happy-outline" size={24} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!message.trim()}
        >
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </BlurView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  headerAvatarContainer: {
    position: 'relative',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  headerOnlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4caf50',
    borderWidth: 2,
    borderColor: '#000',
  },
  headerInfo: {
    marginLeft: 12,
  },
  headerName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
  headerStatus: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  moreButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Messages
  messagesContent: {
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 12,
    maxWidth: '80%',
  },
  sentMessageRow: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  avatarContainer: {
    width: 32,
    marginRight: 8,
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    maxWidth: '100%',
  },
  receivedBubble: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderBottomLeftRadius: 4,
  },
  sentBubble: {
    backgroundColor: '#5e5ce6',
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 16,
    color: '#fff',
    lineHeight: 22,
  },
  sentMessageText: {
    color: '#fff',
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
    color: 'rgba(255,255,255,0.7)',
  },

  // Input
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 90,
    paddingHorizontal: 12,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 32 : 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  attachButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    maxHeight: 100,
    paddingVertical: 6,
  },
  emojiButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#5e5ce6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(94,92,230,0.3)',
  },
});