import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

interface Message {
  id: string;
  user: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  typing?: boolean;
}

const MOCK_MESSAGES: Message[] = [
  {
    id: '1',
    user: 'Sarah Johnson',
    avatar: 'https://i.pravatar.cc/150?img=1',
    lastMessage: 'Hey! Did you see my latest video? 🎥',
    time: '2m',
    unread: 3,
    online: true,
  },
  {
    id: '2',
    user: 'Mike Chen',
    avatar: 'https://i.pravatar.cc/150?img=2',
    lastMessage: 'That was amazing! 🔥',
    time: '15m',
    unread: 0,
    online: true,
    typing: true,
  },
  {
    id: '3',
    user: 'Emma Wilson',
    avatar: 'https://i.pravatar.cc/150?img=3',
    lastMessage: 'Can we collaborate on a video?',
    time: '1h',
    unread: 1,
    online: false,
  },
  {
    id: '4',
    user: 'Alex Martinez',
    avatar: 'https://i.pravatar.cc/150?img=4',
    lastMessage: 'Thanks for the shoutout! 🙏',
    time: '3h',
    unread: 0,
    online: false,
  },
  {
    id: '5',
    user: 'Jessica Lee',
    avatar: 'https://i.pravatar.cc/150?img=5',
    lastMessage: 'Love your content style 💜',
    time: '5h',
    unread: 5,
    online: true,
  },
  {
    id: '6',
    user: 'David Kim',
    avatar: 'https://i.pravatar.cc/150?img=6',
    lastMessage: 'When is the next livestream?',
    time: '1d',
    unread: 0,
    online: false,
  },
  {
    id: '7',
    user: 'Lisa Anderson',
    avatar: 'https://i.pravatar.cc/150?img=7',
    lastMessage: 'Check your DM! 📩',
    time: '2d',
    unread: 2,
    online: false,
  },
  {
    id: '8',
    user: 'Tom Brown',
    avatar: 'https://i.pravatar.cc/150?img=8',
    lastMessage: 'Amazing editing! What app do you use?',
    time: '3d',
    unread: 0,
    online: true,
  },
];

export default function Messages() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'all' | 'unread'>('all');
  const router = useRouter();

  const filteredMessages = MOCK_MESSAGES.filter((message) => {
    const matchesSearch = message.user.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = selectedTab === 'all' || (selectedTab === 'unread' && message.unread > 0);
    return matchesSearch && matchesTab;
  });

  const openChat = (message: Message) => {
    // Navigate to chat screen with user data
    router.push({
      pathname: '/chat/[id]',
      params: {
        id: message.id,
        user: message.user,
        avatar: message.avatar,
        online: message.online.toString(),
      },
    });
  };

  const renderMessageItem = ({ item }: { item: Message }) => (
    <TouchableOpacity
      style={styles.messageCard}
      activeOpacity={0.7}
      onPress={() => openChat(item)}
    >
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        {item.online && <View style={styles.onlineBadge} />}
      </View>

      <View style={styles.messageContent}>
        <View style={styles.messageHeader}>
          <Text style={styles.userName} numberOfLines={1}>
            {item.user}
          </Text>
          <Text style={styles.timeText}>{item.time}</Text>
        </View>

        <View style={styles.messageFooter}>
          {item.typing ? (
            <View style={styles.typingContainer}>
              <View style={styles.typingDot} />
              <View style={[styles.typingDot, styles.typingDotDelay1]} />
              <View style={[styles.typingDot, styles.typingDotDelay2]} />
              <Text style={styles.typingText}>typing...</Text>
            </View>
          ) : (
            <Text style={[styles.lastMessage, item.unread > 0 && styles.unreadMessage]} numberOfLines={1}>
              {item.lastMessage}
            </Text>
          )}
          {item.unread > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unread > 9 ? '9+' : item.unread}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

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
          <Ionicons name="search" size={20} color="rgba(255,255,255,0.5)" style={styles.searchIcon} />
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
            <Text style={[styles.tabText, selectedTab === 'all' && styles.activeTabText]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'unread' && styles.activeTab]}
            onPress={() => setSelectedTab('unread')}
          >
            <Text style={[styles.tabText, selectedTab === 'unread' && styles.activeTabText]}>Unread</Text>
            {MOCK_MESSAGES.filter((m) => m.unread > 0).length > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{MOCK_MESSAGES.filter((m) => m.unread > 0).length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </BlurView>

      {/* Messages List */}
      <FlatList
        data={filteredMessages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessageItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={80} color="rgba(255,255,255,0.3)" />
            <Text style={styles.emptyTitle}>No messages found</Text>
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

  // Typing Indicator
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#5e5ce6',
    opacity: 0.6,
  },
  typingDotDelay1: {
    opacity: 0.4,
  },
  typingDotDelay2: {
    opacity: 0.2,
  },
  typingText: {
    fontSize: 14,
    color: '#5e5ce6',
    fontWeight: '600',
    marginLeft: 4,
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