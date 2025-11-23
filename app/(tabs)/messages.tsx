import api from '@/config/api';
import { useCheckAuth } from '@/hooks/check-auth';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const { width } = Dimensions.get('window');
const API_URL = 'http://192.168.100.89:4040/chat';

interface Chat {
  id: number;
  isGroup: boolean;
  title?: string;
  avatar?: string;
  participants: {
    id: number;
    name: string;
    avatar: string;
    isAdmin: boolean;
  }[];
  lastMessage?: {
    id: number;
    text: string;
    sender: string;
    createdAt: string;
    mediaType?: string;
  } | null;
  unreadCount: number;
  isPinned?: boolean;
  isBlocked?: boolean;
}

export default function Messages() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'all' | 'unread'>('all');
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pinnedChats, setPinnedChats] = useState<number[]>([]);
  const [blockedChats, setBlockedChats] = useState<number[]>([]);
  const router = useRouter();

  const { user } = useCheckAuth()

  // currentUserId — frontend state yoki context orqali olinadi
  const loadChats = useCallback(async (page = 1, limit = 50) => {
    try {
      const response = await api.get(`/chat?page=${page}&limit=${limit}`);
      const currentUserId = user?.id;

      if (!currentUserId) {
        console.warn("User ID is not yet available, skipping chat load.");
        setLoading(false); // Loading ni bekor qilish
        setRefreshing(false);
        return;
      }
      console.log("currentUserId: ", currentUserId);


      const formattedChats = response.data.data.map((chat: any) => {
        const otherParticipant = chat.participants.find((p: any) => p.id !== currentUserId);

        return {
          id: chat.id,
          isGroup: chat.isGroup,
          title: chat.title || otherParticipant?.name || "No name",
          avatar: chat.avatar || otherParticipant?.avatar || "",
          participants: chat.participants,
          lastMessage: chat.lastMessage,
          unreadCount: chat.unreadCount,
        };
      });

      setChats(formattedChats);
    } catch (error) {
      console.error('Error loading chats:', error);
      Alert.alert('Xato', 'Chatlarni yuklashda muammo yuz berdi');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);



  useEffect(() => {
    loadChats();
  }, [loadChats, user?.id]);

  const filteredChats = chats.filter((chat) => {
    const matchesSearch = chat.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.participants.some(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTab = selectedTab === 'all' || (selectedTab === 'unread' && chat.unreadCount > 0);
    const notBlocked = !blockedChats.includes(chat.id);
    return matchesSearch && matchesTab && notBlocked;
  });

  // Pinned chatlarni oldin ko'rsatish
  const sortedChats = filteredChats.sort((a, b) => {
    const aPinned = pinnedChats.includes(a.id) ? 0 : 1;
    const bPinned = pinnedChats.includes(b.id) ? 0 : 1;
    return aPinned - bPinned;
  });

  const openChat = (chat: Chat) => {
    if (blockedChats.includes(chat.id)) {
      Alert.alert('Xato', 'Bu chat blokiylangan');
      return;
    }

    const otherUser = chat.participants[0];

    router.push({
      pathname: '/chat/[id]',
      params: {
        id: chat.id.toString(),
        user: chat.title || 'User',
        avatar: chat.avatar,
        online: 'true',
        userId: otherUser?.id?.toString() || '0',
      },
    });
  };

  // Delete chat
  const handleDeleteChat = (chat: Chat) => {
    Alert.alert(
      "Chatni O'chirish",
      `"${chat.title}" chatni o'chirishni xohlaysizmi? Bu amalni qaytara olmaysiz.`,
      [
        { text: 'Bekor qilish', style: 'cancel' },
        {
          text: "O'chirish",
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/chat/${chat.id}`);
              setChats(chats.filter(c => c.id !== chat.id));
              Alert.alert('Muvaffaqiyat', 'Chat o\'chirildi');
            } catch (error) {
              console.error('Error deleting chat:', error);
              Alert.alert('Xato', "Chat o'chirishda muammo yuz berdi");
            }
          },
        },
      ]
    );
  };

  // Pin/Unpin chat
  const handlePinChat = (chat: Chat) => {
    if (pinnedChats.includes(chat.id)) {
      setPinnedChats(pinnedChats.filter(id => id !== chat.id));
      Alert.alert('Muvaffaqiyat', "Chat ushlab qo'yish bekor qilindi");
    } else {
      setPinnedChats([...pinnedChats, chat.id]);
      Alert.alert('Muvaffaqiyat', 'Chat ushlab qo\'yildi');
    }
  };

  // Block/Unblock chat
  const handleBlockChat = (chat: Chat) => {
    if (blockedChats.includes(chat.id)) {
      setBlockedChats(blockedChats.filter(id => id !== chat.id));
      Alert.alert('Muvaffaqiyat', 'Chat blokirovkasi bekor qilindi');
    } else {
      setBlockedChats([...blockedChats, chat.id]);
      Alert.alert('Muvaffaqiyat', 'Chat blokiylandi');
    }
  };

  // Context menu
  const showChatMenu = (chat: Chat) => {
    const isPinned = pinnedChats.includes(chat.id);
    const isBlocked = blockedChats.includes(chat.id);

    const options = [
      {
        text: isPinned ? "Ushlab qo'yishni bekor qilish" : "Ushlab qo'yish",
        icon: isPinned ? 'pin' : 'pin-outline',
        onPress: () => handlePinChat(chat),
      },
      {
        text: isBlocked ? 'Blokni bekor qilish' : 'Blokla',
        icon: isBlocked ? 'checkmark-circle' : 'ban',
        onPress: () => handleBlockChat(chat),
      },
      {
        text: "O'chirish",
        icon: 'trash-outline',
        isDangerous: true,
        onPress: () => handleDeleteChat(chat),
      },
    ];

    Alert.alert(
      'Chat Amallari',
      chat.title,
      [
        ...options.map(opt => ({
          text: opt.text,
          style: opt.isDangerous ? 'destructive' as const : 'default' as const,
          onPress: opt.onPress,
        })),
        { text: 'Bekor qilish', style: 'cancel' as const },
      ]
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadChats();
  };

  const renderChatItem = ({ item }: { item: Chat }) => {
    const lastMessageText = item.lastMessage?.text || 'No messages yet';
    const lastMessageTime = item.lastMessage?.createdAt
      ? new Date(item.lastMessage.createdAt).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
      : '';

    const isPinned = pinnedChats.includes(item.id);
    const isBlocked = blockedChats.includes(item.id);

    return (
      <TouchableOpacity
        style={[
          styles.messageCard,
          isBlocked && styles.blockedCard,
          isPinned && styles.pinnedCard,
        ]}
        activeOpacity={0.7}
        onPress={() => openChat(item)}
        onLongPress={() => showChatMenu(item)}
        delayLongPress={400}
      >
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: item.avatar }}
            style={[styles.avatar, isBlocked && styles.blockedAvatar]}
          />
          {!isBlocked && <View style={styles.onlineBadge} />}
          {isPinned && (
            <View style={styles.pinBadge}>
              <Ionicons name="pin" size={12} color="#fff" />
            </View>
          )}
        </View>

        <View style={[styles.messageContent, isBlocked && styles.blockedContent]}>
          <View style={styles.messageHeader}>
            <View style={styles.titleContainer}>
              <Text style={styles.userName} numberOfLines={1}>
                {item.title}
              </Text>
              {isPinned && (
                <Ionicons name="pin" size={14} color="#5e5ce6" style={{ marginLeft: 6 }} />
              )}
            </View>
            <Text style={styles.timeText}>{lastMessageTime}</Text>
          </View>

          <View style={styles.messageFooter}>
            <Text
              style={[
                styles.lastMessage,
                item.unreadCount > 0 && styles.unreadMessage,
                isBlocked && styles.blockedMessage,
              ]}
              numberOfLines={1}
            >
              {isBlocked ? 'Chat blokiylangan' : lastMessageText}
            </Text>
            {item.unreadCount > 0 && !isBlocked && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>
                  {item.unreadCount > 9 ? '9+' : item.unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Action buttons (revealed on long press) */}
        <View style={styles.actionIcons}>
          <TouchableOpacity
            style={styles.actionIcon}
            onPress={() => handlePinChat(item)}
          >
            <Ionicons
              name={isPinned ? 'pin' : 'pin-outline'}
              size={20}
              color={isPinned ? '#5e5ce6' : 'rgba(255,255,255,0.5)'}
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#5e5ce6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <BlurView intensity={80} tint="dark" style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Messages</Text>
          <TouchableOpacity style={styles.newMessageButton}>
            <Ionicons name="create-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="rgba(255,255,255,0.5)"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search messages..."
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="rgba(255,255,255,0.5)" />
            </TouchableOpacity>
          )}
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'all' && styles.activeTab]}
            onPress={() => setSelectedTab('all')}
          >
            <Text style={[styles.tabText, selectedTab === 'all' && styles.activeTabText]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'unread' && styles.activeTab]}
            onPress={() => setSelectedTab('unread')}
          >
            <Text style={[styles.tabText, selectedTab === 'unread' && styles.activeTabText]}>
              Unread
            </Text>
            {chats.filter((m) => m.unreadCount > 0).length > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>
                  {chats.filter((m) => m.unreadCount > 0).length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </BlurView>

      {/* Chats List */}
      <FlatList
        data={sortedChats}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderChatItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={80} color="rgba(255,255,255,0.3)" />
            <Text style={styles.emptyTitle}>No chats found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? 'Try a different search' : 'Start a conversation!'}
            </Text>
          </View>
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab}>
        <BlurView intensity={100} tint="light" style={styles.fabInner}>
          <Ionicons name="chatbubble-ellipses" size={28} color="#fff" />
        </BlurView>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Header
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: '#fff',
  },
  newMessageButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(94,92,230,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(94,92,230,0.4)',
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 1,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },

  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activeTab: {
    backgroundColor: '#5e5ce6',
  },
  tabText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 15,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#fff',
  },
  tabBadge: {
    backgroundColor: '#ff3b5c',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  tabBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },

  // Message List
  listContent: {
    paddingTop: 8,
    paddingBottom: 100,
  },
  messageCard: {
    flexDirection: 'row',
    padding: 16,
    marginHorizontal: 12,
    marginVertical: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
  },
  pinnedCard: {
    backgroundColor: 'rgba(94,92,230,0.08)',
    borderColor: 'rgba(94,92,230,0.2)',
  },
  blockedCard: {
    backgroundColor: 'rgba(255,59,92,0.05)',
    borderColor: 'rgba(255,59,92,0.15)',
  },
  blockedContent: {
    opacity: 0.6,
  },
  blockedAvatar: {
    opacity: 0.5,
  },
  blockedMessage: {
    fontStyle: 'italic',
    color: 'rgba(255,59,92,0.8)',
  },

  avatarContainer: {
    position: 'relative',
    marginRight: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4caf50',
    borderWidth: 2,
    borderColor: '#000',
  },
  pinBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#5e5ce6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },

  messageContent: {
    flex: 1,
    justifyContent: 'center',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
  },
  timeText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    marginLeft: 8,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.6)',
    flex: 1,
  },
  unreadMessage: {
    color: '#fff',
    fontWeight: '600',
  },
  unreadBadge: {
    backgroundColor: '#5e5ce6',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
    marginLeft: 8,
  },
  unreadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },

  actionIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#5e5ce6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  fabInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5e5ce6',
  },
});