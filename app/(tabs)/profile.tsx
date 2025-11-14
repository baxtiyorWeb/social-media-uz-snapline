import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React, { useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

interface Video {
  id: string;
  thumbnail: string;
  views: string;
  likes: string;
  duration: string;
}

const MOCK_VIDEOS: Video[] = Array.from({ length: 12 }).map((_, idx) => ({
  id: `v${idx + 1}`,
  thumbnail: `https://picsum.photos/400/600?random=${idx + 100}`,
  views: `${Math.floor(Math.random() * 900 + 100)}K`,
  likes: `${Math.floor(Math.random() * 50 + 10)}K`,
  duration: `0:${Math.floor(Math.random() * 40 + 15)}`,
}));

const STATS = [
  { label: 'Videos', value: '248' },
  { label: 'Followers', value: '1.2M' },
  { label: 'Following', value: '342' },
  { label: 'Likes', value: '8.7M' },
];

const HIGHLIGHTS = [
  { id: '1', title: 'Travel', image: 'https://i.pravatar.cc/150?img=20', color: '#FF6B6B' },
  { id: '2', title: 'Food', image: 'https://i.pravatar.cc/150?img=21', color: '#4ECDC4' },
  { id: '3', title: 'Fitness', image: 'https://i.pravatar.cc/150?img=22', color: '#95E1D3' },
  { id: '4', title: 'Music', image: 'https://i.pravatar.cc/150?img=23', color: '#F38181' },
  { id: '5', title: 'Art', image: 'https://i.pravatar.cc/150?img=24', color: '#AA96DA' },
];

export default function Profile() {
  const [activeTab, setActiveTab] = useState<'videos' | 'liked' | 'saved'>('videos');
  const [isFollowing, setIsFollowing] = useState(false);

  const renderVideoItem = ({ item, index }: { item: Video; index: number }) => (
    <TouchableOpacity
      style={[styles.videoCard, index % 3 !== 2 && styles.videoCardMargin]}
      activeOpacity={0.9}
    >
      <Image source={{ uri: item.thumbnail }} style={styles.videoThumbnail} />

      {/* Gradient Overlay */}
      <View style={styles.videoOverlay}>
        <View style={styles.videoStats}>
          <View style={styles.videoStat}>
            <Ionicons name="play" size={14} color="#fff" />
            <Text style={styles.videoStatText}>{item.views}</Text>
          </View>
        </View>
        <View style={styles.videoDuration}>
          <Text style={styles.videoDurationText}>{item.duration}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderHighlight = ({ item }: { item: typeof HIGHLIGHTS[0] }) => (
    <TouchableOpacity style={styles.highlightItem}>
      <View style={[styles.highlightCircle, { borderColor: item.color }]}>
        <Image source={{ uri: item.image }} style={styles.highlightImage} />
        <View style={[styles.highlightBadge, { backgroundColor: item.color }]}>
          <Ionicons name="add" size={16} color="#fff" />
        </View>
      </View>
      <Text style={styles.highlightTitle} numberOfLines={1}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <BlurView intensity={80} tint="dark" style={styles.header}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="notifications-outline" size={26} color="#fff" />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>3</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.username}>@alexcreator</Text>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="menu-outline" size={26} color="#fff" />
          </TouchableOpacity>
        </BlurView>

        {/* Profile Info */}
        <View style={styles.profileSection}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: 'https://i.pravatar.cc/300?img=12' }}
              style={styles.avatar}
            />
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={32} color="#5e5ce6" />
            </View>
          </View>

          {/* Name & Bio */}
          <Text style={styles.displayName}>Alex Anderson</Text>
          <Text style={styles.bio}>
            Content Creator 🎥 | Digital Artist 🎨{'\n'}
            Making the world more creative ✨
          </Text>

          {/* Stats */}
          <View style={styles.statsContainer}>
            {STATS.map((stat, index) => (
              <TouchableOpacity key={stat.label} style={styles.statItem}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.followButton, isFollowing && styles.followingButton]}
              onPress={() => setIsFollowing(!isFollowing)}
            >
              <Ionicons
                name={isFollowing ? "checkmark" : "add"}
                size={20}
                color="#fff"
              />
              <Text style={styles.followButtonText}>
                {isFollowing ? 'Following' : 'Follow'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.messageButton}>
              <Ionicons name="chatbubble-outline" size={20} color="#fff" />
              <Text style={styles.messageButtonText}>Message</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.moreButton}>
              <Ionicons name="person-add-outline" size={22} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Highlights/Stories */}
          <View style={styles.highlightsSection}>
            <FlatList
              data={HIGHLIGHTS}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={renderHighlight}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.highlightsList}
            />
          </View>
        </View>

        {/* Tabs */}
        <BlurView intensity={60} tint="dark" style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'videos' && styles.activeTab]}
            onPress={() => setActiveTab('videos')}
          >
            <Ionicons
              name="grid"
              size={22}
              color={activeTab === 'videos' ? '#fff' : 'rgba(255,255,255,0.5)'}
            />
            <Text style={[styles.tabText, activeTab === 'videos' && styles.activeTabText]}>
              Videos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'liked' && styles.activeTab]}
            onPress={() => setActiveTab('liked')}
          >
            <Ionicons
              name="heart"
              size={22}
              color={activeTab === 'liked' ? '#fff' : 'rgba(255,255,255,0.5)'}
            />
            <Text style={[styles.tabText, activeTab === 'liked' && styles.activeTabText]}>
              Liked
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'saved' && styles.activeTab]}
            onPress={() => setActiveTab('saved')}
          >
            <Ionicons
              name="bookmark"
              size={22}
              color={activeTab === 'saved' ? '#fff' : 'rgba(255,255,255,0.5)'}
            />
            <Text style={[styles.tabText, activeTab === 'saved' && styles.activeTabText]}>
              Saved
            </Text>
          </TouchableOpacity>
        </BlurView>

        {/* Video Grid */}
        <View style={styles.videosGrid}>
          <FlatList
            data={MOCK_VIDEOS}
            renderItem={renderVideoItem}
            keyExtractor={(item) => item.id}
            numColumns={3}
            scrollEnabled={false}
            columnWrapperStyle={styles.videoRow}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContent: {
    paddingBottom: 100,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  username: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#ff3b5c',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },

  // Profile Section
  profileSection: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 20,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#5e5ce6',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#000',
    borderRadius: 16,
  },
  displayName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  bio: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },

  // Stats
  statsContainer: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
    marginBottom: 24,
  },
  followButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5e5ce6',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  followingButton: {
    backgroundColor: 'rgba(94,92,230,0.2)',
    borderWidth: 1,
    borderColor: '#5e5ce6',
  },
  followButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  messageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  messageButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  moreButton: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },

  // Highlights
  highlightsSection: {
    width: '100%',
    marginBottom: 10,
  },
  highlightsList: {
    paddingVertical: 8,
  },
  highlightItem: {
    alignItems: 'center',
    marginRight: 20,
  },
  highlightCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    padding: 3,
    marginBottom: 8,
  },
  highlightImage: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
  },
  highlightBadge: {
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
  highlightTitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
    maxWidth: 70,
    textAlign: 'center',
  },

  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  activeTab: {
    backgroundColor: 'rgba(94,92,230,0.2)',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
  },
  activeTabText: {
    color: '#fff',
  },

  // Videos Grid
  videosGrid: {
    paddingHorizontal: 2,
    paddingTop: 2,
  },
  videoRow: {
    marginBottom: 4,
  },
  videoCard: {
    width: (width - 8) / 3,
    height: (width - 8) / 3 * 1.5,
    position: 'relative',
    overflow: 'hidden',
  },
  videoCardMargin: {
    marginRight: 4,
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'space-between',
    padding: 8,
  },
  videoStats: {
    alignSelf: 'flex-start',
  },
  videoStat: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  videoStatText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  videoDuration: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  videoDurationText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
});