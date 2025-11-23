import api from '@/config/api';
import { Ionicons } from '@expo/vector-icons';
import { Video } from 'expo-av';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

interface Story {
  id: string;
  user: string;
  avatar: string;
  hasStory: boolean;
  isLive?: boolean;
}

interface Snap {
  id: string;
  user: string;
  avatar: string;
  thumbnail: string;
  title: string;
  views: string;
  timeAgo: string;
  category: string;
  isFollowing: boolean;
}

const STORIES: Story[] = [
  { id: 'add', user: 'Your Story', avatar: 'https://i.pravatar.cc/150?img=50', hasStory: false },
  { id: '1', user: 'Sarah', avatar: 'https://i.pravatar.cc/150?img=1', hasStory: true, isLive: true },
  { id: '2', user: 'Mike', avatar: 'https://i.pravatar.cc/150?img=2', hasStory: true },
  { id: '3', user: 'Emma', avatar: 'https://i.pravatar.cc/150?img=3', hasStory: true },
  { id: '4', user: 'Alex', avatar: 'https://i.pravatar.cc/150?img=4', hasStory: true },
  { id: '5', user: 'Jessica', avatar: 'https://i.pravatar.cc/150?img=5', hasStory: true },
  { id: '6', user: 'David', avatar: 'https://i.pravatar.cc/150?img=6', hasStory: true },
  { id: '7', user: 'Lisa', avatar: 'https://i.pravatar.cc/150?img=7', hasStory: true },
];

const SNAPS: Snap[] = Array.from({ length: 20 }).map((_, idx) => ({
  id: `snap${idx + 1}`,
  user: `creator_${idx + 1}`,
  avatar: `https://i.pravatar.cc/150?img=${idx + 10}`,
  thumbnail: `https://picsum.photos/800/1400?random=${idx + 200}`,
  title: [
    'Amazing sunset vibes 🌅',
    'Day in my life vlog 🎥',
    'Cooking tutorial 🍳',
    'Workout routine 💪',
    'Travel adventures ✈️',
    'Music cover 🎵',
    'Art process 🎨',
    'Tech review 📱',
  ][idx % 8],
  views: `${Math.floor(Math.random() * 900 + 100)}K`,
  timeAgo: ['2m', '15m', '1h', '3h', '5h', '1d', '2d', '3d'][idx % 8],
  category: ['Trending', 'Music', 'Gaming', 'Food', 'Travel', 'Art'][idx % 6],
  isFollowing: idx % 3 === 0,
}));

const CATEGORIES = ['For You', 'Trending', 'Music', 'Gaming', 'Food', 'Travel', 'Art', 'Sports'];

export default function Snaps() {
  const [selectedCategory, setSelectedCategory] = useState('For You');
  const [searchQuery, setSearchQuery] = useState('');


  const [posts, setPosts] = useState<any[]>([]);


  const getPosts = async () => {
    const data = await api.get("/posts", {
      params: {
        page: 1,
        limit: 100,
      }
    })

    return data.data
  }


  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await getPosts();
        setPosts(data);
      } catch (error) {
        console.log("error", error);
      }
    };

    fetchPosts();
  }, []);







  // const filteredSnaps = SNAPS.filter(snap =>
  //   snap.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //   snap.user.toLowerCase().includes(searchQuery.toLowerCase())
  // );

  const renderStory = ({ item }: { item: Story }) => (
    <TouchableOpacity style={styles.storyItem}>
      <View style={[
        styles.storyCircle,
        item.hasStory && styles.storyCircleActive,
        item.id === 'add' && styles.storyCircleAdd,
      ]}>
        <Image source={{ uri: item.avatar }} style={styles.storyAvatar} />
        {item.id === 'add' && (
          <View style={styles.addStoryBadge}>
            <Ionicons name="add" size={16} color="#fff" />
          </View>
        )}
        {item.isLive && (
          <View style={styles.liveBadge}>
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        )}
      </View>
      <Text style={styles.storyUsername} numberOfLines={1}>{item.user}</Text>
    </TouchableOpacity>
  );

  const renderCategory = (category: string) => (
    <TouchableOpacity
      key={category}
      style={[styles.categoryChip, selectedCategory === category && styles.categoryChipActive]}
      onPress={() => setSelectedCategory(category)}
    >
      <Text style={[styles.categoryText, selectedCategory === category && styles.categoryTextActive]}>
        {category}
      </Text>
    </TouchableOpacity>
  );
  const getTimeAgo = (dateString: string) => {
    const diff = (Date.now() - new Date(dateString).getTime()) / 1000;

    if (diff < 60) return `${Math.floor(diff)}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const renderSnap = ({ item }: { item: any }) => {

    console.log("posts: ", item);

    const thumbnail = item.videoUrl;
    const category = item.category;
    const avatar = item.user?.profile?.avatar || "https://via.placeholder.com/150";
    const username = item.user?.profile?.username || "Unknown";
    const title = item.caption;
    const views = item.views;
    const createdAt = item.createdAt;

    const timeAgo = getTimeAgo(createdAt);


    return (
      <TouchableOpacity style={styles.snapCard} onPress={() => router.push(`/video/${item.id}`)} activeOpacity={0.9}>
        <Video source={{ uri: thumbnail }} style={styles.snapThumbnail} />
        <View style={styles.snapOverlay} />

        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>{category}</Text>
        </View>

        {/* User Info */}
        <View style={styles.snapUserInfo}>
          <Image source={{ uri: avatar }} style={styles.snapAvatar} />
          <View style={styles.snapUserText}>
            <Text style={styles.snapUsername}>{username}</Text>
            <Text style={styles.snapTitle} numberOfLines={2}>{title}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.snapStats}>
          <View style={styles.snapStat}>
            <Ionicons name="play-circle" size={16} color="#fff" />
            <Text style={styles.snapStatText}>{views}</Text>
          </View>
          <View style={styles.snapStat}>
            <Ionicons name="time-outline" size={16} color="#fff" />
            <Text style={styles.snapStatText}>{timeAgo}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <BlurView intensity={80} tint="dark" style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Discover</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="scan-outline" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="notifications-outline" size={24} color="#fff" />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="rgba(255,255,255,0.5)" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search snaps, creators..."
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
      </BlurView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Stories Section */}
        <View style={styles.storiesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Stories</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={STORIES}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={renderStory}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.storiesList}
          />
        </View>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {CATEGORIES.map(renderCategory)}
        </ScrollView>

        {/* Snaps Grid */}
        <View style={styles.snapsGrid}>
          <FlatList
            data={posts?.data}
            renderItem={renderSnap}
            keyExtractor={(item) => item.id}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={styles.snapRow}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={80} color="rgba(255,255,255,0.3)" />
                <Text style={styles.emptyTitle}>No snaps found</Text>
                <Text style={styles.emptySubtitle}>Try a different search or category</Text>
              </View>
            }
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
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: '#fff',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
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
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff3b5c',
    borderWidth: 2,
    borderColor: '#000',
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
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

  // Stories
  storiesSection: {
    paddingVertical: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
  },
  seeAllText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#5e5ce6',
  },
  storiesList: {
    paddingHorizontal: 20,
  },
  storyItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 75,
  },
  storyCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    padding: 3,
    marginBottom: 8,
    position: 'relative',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  storyCircleActive: {
    background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
    borderWidth: 2,
    borderColor: '#5e5ce6',
  },
  storyCircleAdd: {
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    borderStyle: 'dashed',
  },
  storyAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 33,
  },
  addStoryBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#5e5ce6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  liveBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ff3b5c',
    paddingVertical: 2,
    borderRadius: 10,
    alignItems: 'center',
  },
  liveText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
  storyUsername: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
    textAlign: 'center',
  },

  // Categories
  categoriesContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 10,
  },
  categoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginRight: 10,
  },
  categoryChipActive: {
    backgroundColor: '#5e5ce6',
    borderColor: '#5e5ce6',
  },
  categoryText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
  },
  categoryTextActive: {
    color: '#fff',
  },

  // Snaps Grid
  snapsGrid: {
    paddingHorizontal: 12,
  },
  snapRow: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  snapCard: {
    width: (width - 36) / 2,
    height: (width - 36) / 2 * 1.6,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  snapThumbnail: {
    width: '100%',
    height: '100%',
  },
  snapOverlay: {
    ...StyleSheet.absoluteFillObject,
    background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 100%)',
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  categoryBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  snapUserInfo: {
    position: 'absolute',
    bottom: 50,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  snapAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#fff',
    marginRight: 8,
  },
  snapUserText: {
    flex: 1,
  },
  snapUsername: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  snapTitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 16,
  },
  followBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#5e5ce6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  snapStats: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    gap: 12,
  },
  snapStat: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  snapStatText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
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
});