import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

type NotificationType =
  | 'like'
  | 'comment'
  | 'reply'
  | 'follow'
  | 'mention'
  | 'repost'
  | 'save'
  | 'collab'
  | 'live'
  | 'milestone';

interface Notification {
  id: string;
  type: NotificationType;
  user: string;
  avatar: string;
  content: string;
  thumbnail?: string;
  time: string;
  isRead: boolean;
  isFollowing?: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'follow',
    user: 'sarah_johnson',
    avatar: 'https://i.pravatar.cc/150?img=1',
    content: 'started following you',
    time: '2m',
    isRead: false,
    isFollowing: false,
  },
  {
    id: '2',
    type: 'like',
    user: 'mike_creator',
    avatar: 'https://i.pravatar.cc/150?img=2',
    content: 'liked your video "Amazing sunset vibes"',
    thumbnail: 'https://picsum.photos/400/600?random=1',
    time: '5m',
    isRead: false,
  },
  {
    id: '3',
    type: 'comment',
    user: 'emma_art',
    avatar: 'https://i.pravatar.cc/150?img=3',
    content: 'commented: "This is incredible! 🔥"',
    thumbnail: 'https://picsum.photos/400/600?random=2',
    time: '15m',
    isRead: false,
  },
  {
    id: '4',
    type: 'reply',
    user: 'alex_tech',
    avatar: 'https://i.pravatar.cc/150?img=4',
    content: 'replied to your comment: "Thanks for the tip!"',
    thumbnail: 'https://picsum.photos/400/600?random=3',
    time: '1h',
    isRead: true,
  },
  {
    id: '5',
    type: 'mention',
    user: 'jessica_vlogs',
    avatar: 'https://i.pravatar.cc/150?img=5',
    content: 'mentioned you in a video',
    thumbnail: 'https://picsum.photos/400/600?random=4',
    time: '2h',
    isRead: true,
  },
  {
    id: '6',
    type: 'milestone',
    user: 'snappy',
    avatar: 'https://i.pravatar.cc/150?img=50',
    content: 'Congratulations! You reached 10K followers 🎉',
    time: '3h',
    isRead: false,
  },
  {
    id: '7',
    type: 'live',
    user: 'david_music',
    avatar: 'https://i.pravatar.cc/150?img=6',
    content: 'started a live stream',
    thumbnail: 'https://picsum.photos/400/600?random=5',
    time: '4h',
    isRead: true,
  },
  {
    id: '8',
    type: 'collab',
    user: 'lisa_dance',
    avatar: 'https://i.pravatar.cc/150?img=7',
    content: 'invited you to collaborate',
    time: '5h',
    isRead: true,
  },
  {
    id: '9',
    type: 'repost',
    user: 'tom_fitness',
    avatar: 'https://i.pravatar.cc/150?img=8',
    content: 'reposted your video',
    thumbnail: 'https://picsum.photos/400/600?random=6',
    time: '1d',
    isRead: true,
  },
  {
    id: '10',
    type: 'save',
    user: 'amy_food',
    avatar: 'https://i.pravatar.cc/150?img=9',
    content: 'saved your video to favorites',
    thumbnail: 'https://picsum.photos/400/600?random=7',
    time: '2d',
    isRead: true,
  },
];

const getNotificationIcon = (type: NotificationType) => {
  const icons = {
    like: { name: 'heart', color: '#ff3b5c', bg: 'rgba(255,59,92,0.2)' },
    comment: { name: 'chatbubble', color: '#5e5ce6', bg: 'rgba(94,92,230,0.2)' },
    reply: { name: 'chatbubble-ellipses', color: '#5e5ce6', bg: 'rgba(94,92,230,0.2)' },
    follow: { name: 'person-add', color: '#34c759', bg: 'rgba(52,199,89,0.2)' },
    mention: { name: 'at', color: '#ff9500', bg: 'rgba(255,149,0,0.2)' },
    repost: { name: 'repeat', color: '#34c759', bg: 'rgba(52,199,89,0.2)' },
    save: { name: 'bookmark', color: '#ffd700', bg: 'rgba(255,215,0,0.2)' },
    collab: { name: 'people', color: '#5e5ce6', bg: 'rgba(94,92,230,0.2)' },
    live: { name: 'radio', color: '#ff3b5c', bg: 'rgba(255,59,92,0.2)' },
    milestone: { name: 'trophy', color: '#ffd700', bg: 'rgba(255,215,0,0.2)' },
  };
  return icons[type];
};

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.isRead)
    : notifications;

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleFollow = (id: string) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === id ? { ...n, isFollowing: !n.isFollowing } : n
      )
    );
  };

  const renderNotification = ({ item }: { item: Notification }) => {
    const iconData = getNotificationIcon(item.type);

    return (
      <TouchableOpacity
        style={[styles.notificationCard, !item.isRead && styles.unreadCard]}
        onPress={() => markAsRead(item.id)}
        activeOpacity={0.8}
      >
        <BlurView
          intensity={item.isRead ? 20 : 40}
          tint="dark"
          style={styles.cardBlur}
        >
          {/* Left Section */}
          <View style={styles.leftSection}>
            {/* Avatar with Icon Badge */}
            <View style={styles.avatarContainer}>
              <Image source={{ uri: item.avatar }} style={styles.avatar} />
              <View
                style={[
                  styles.iconBadge,
                  { backgroundColor: iconData.bg },
                ]}
              >
                <Ionicons
                  name={iconData.name as any}
                  size={14}
                  color={iconData.color}
                />
              </View>
            </View>

            {/* Content */}
            <View style={styles.contentSection}>
              <View style={styles.textContainer}>
                <Text style={styles.username}>{item.user}</Text>
                <Text style={styles.content}>{item.content}</Text>
              </View>
              <Text style={styles.time}>{item.time}</Text>
            </View>
          </View>

          {/* Right Section */}
          <View style={styles.rightSection}>
            {item.thumbnail && (
              <Image
                source={{ uri: item.thumbnail }}
                style={styles.thumbnail}
              />
            )}

            {item.type === 'follow' && !item.isFollowing && (
              <TouchableOpacity
                style={styles.followButton}
                onPress={() => handleFollow(item.id)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={styles.followGradient}
                >
                  <Text style={styles.followText}>Follow</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            {item.type === 'collab' && (
              <TouchableOpacity
                style={styles.actionButton}
                activeOpacity={0.8}
              >
                <Text style={styles.actionText}>View</Text>
              </TouchableOpacity>
            )}

            {!item.isRead && !item.thumbnail && item.type !== 'follow' && item.type !== 'collab' && (
              <View style={styles.unreadDot} />
            )}
          </View>
        </BlurView>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.headerSection}>
      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <BlurView intensity={60} tint="dark" style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <LinearGradient
              colors={['#ff3b5c', '#ff6b8a']}
              style={styles.statIconGradient}
            >
              <Ionicons name="heart" size={20} color="#fff" />
            </LinearGradient>
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statValue}>1.2K</Text>
          </View>
        </BlurView>

        <BlurView intensity={60} tint="dark" style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <LinearGradient
              colors={['#5e5ce6', '#8b7bd8']}
              style={styles.statIconGradient}
            >
              <Ionicons name="chatbubbles" size={20} color="#fff" />
            </LinearGradient>
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statValue}>328</Text>
          </View>
        </BlurView>

        <BlurView intensity={60} tint="dark" style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <LinearGradient
              colors={['#34c759', '#5ed87b']}
              style={styles.statIconGradient}
            >
              <Ionicons name="people" size={20} color="#fff" />
            </LinearGradient>
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statValue}>+156</Text>
          </View>
        </BlurView>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
          activeOpacity={0.7}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            All
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, filter === 'unread' && styles.filterButtonActive]}
          onPress={() => setFilter('unread')}
          activeOpacity={0.7}
        >
          <Text style={[styles.filterText, filter === 'unread' && styles.filterTextActive]}>
            Unread
          </Text>
          {unreadCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        {unreadCount > 0 && (
          <TouchableOpacity
            style={styles.markAllButton}
            onPress={markAllAsRead}
            activeOpacity={0.7}
          >
            <Ionicons name="checkmark-done" size={18} color="#5e5ce6" />
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}

      <Stack.Screen options={{ headerShown: false }} />
      <BlurView intensity={90} tint="dark" style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          style={styles.settingsButton}
          activeOpacity={0.7}
        >
          <Ionicons name="settings-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </BlurView>

      {/* Notifications List */}
      <FlatList
        data={filteredNotifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <LinearGradient
                colors={['rgba(94,92,230,0.2)', 'rgba(94,92,230,0.05)']}
                style={styles.emptyIconGradient}
              >
                <Ionicons name="notifications-off-outline" size={60} color="rgba(255,255,255,0.4)" />
              </LinearGradient>
            </View>
            <Text style={styles.emptyTitle}>No notifications</Text>
            <Text style={styles.emptySubtitle}>
              {filter === 'unread'
                ? "You're all caught up!"
                : "You'll see notifications here when you get them"}
            </Text>
          </View>
        }
      />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.5)',
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
    justifyContent: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  headerBadge: {
    backgroundColor: '#ff3b5c',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  headerBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  settingsButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Header Section
  headerSection: {
    paddingTop: 20,
    paddingBottom: 16,
  },

  // Stats
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'nowrap', // bir qatorda qoladi
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  statCard: {
    flexGrow: 1,
    flexBasis: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // elementlar orasida bo‘shliq
    padding: 12,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statIconContainer: {
    marginRight: 10,
  },
  statIconGradient: {
    width: 30,
    height: 30,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statContent: {
    flex: 1,
    flexShrink: 1, // kichik ekranlarda siqiladi lekin chiqmaydi
  },
  statValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 2,
    flexWrap: 'wrap', // uzun matn keyingi qatorda davom etadi
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
    flexWrap: 'wrap',
  },


  // Filters
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    gap: 6,
  },
  filterButtonActive: {
    backgroundColor: '#5e5ce6',
    borderColor: '#5e5ce6',
  },
  filterText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
  },
  filterTextActive: {
    color: '#fff',
  },
  filterBadge: {
    backgroundColor: '#ff3b5c',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  filterBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(94,92,230,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(94,92,230,0.3)',
    gap: 6,
    marginLeft: 'auto',
  },
  markAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5e5ce6',
  },

  // List
  listContent: {
    paddingTop: 8,
    paddingBottom: 100,
  },

  // Notification Card
  notificationCard: {
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  unreadCard: {
    backgroundColor: 'rgba(94,92,230,0.08)',
    borderColor: 'rgba(94,92,230,0.2)',
  },
  cardBlur: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  // Left Section
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  iconBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  contentSection: {
    flex: 1,
  },
  textContainer: {
    marginBottom: 4,
  },
  username: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 2,
  },
  content: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20,
  },
  time: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600',
  },

  // Right Section
  rightSection: {
    marginLeft: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  followButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  followGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  followText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  actionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#5e5ce6',
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    marginBottom: 20,
  },
  emptyIconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    lineHeight: 22,
  },
});