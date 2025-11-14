import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

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
  likes: string;
  comments: number;
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
  likes: `${Math.floor(Math.random() * 50 + 10)}K`,
  comments: Math.floor(Math.random() * 200 + 50),
}));

const CATEGORIES = ['For You', 'Trending', 'Music', 'Gaming', 'Food', 'Travel', 'Art', 'Sports'];

export default function Snaps() {
  const [selectedCategory, setSelectedCategory] = useState('For You');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewVideo, setPreviewVideo] = useState<Snap | null>(null);
  const router = useRouter();

  // Animation values
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (previewVideo) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animation reset (to be sure the next animation starts correctly)
      // We don't need to reset here since `closeModal` handles the exit animation
      // and sets state to null. The logic in `closeModal` will ensure smooth exit.
    }
  }, [previewVideo]);

  const closeModal = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.9, // Kichik o'lchamga qaytadi
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 50,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setPreviewVideo(null);
      // Animatsiyani qayta tiklash
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
    });
  };

  const openPreview = (snap: Snap) => {
    setPreviewVideo(snap);
  };

  const filteredSnaps = SNAPS.filter(snap =>
    snap.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    snap.user.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderStory = ({ item }: { item: Story }) => (
    <TouchableOpacity style={styles.storyItem} activeOpacity={0.7}>
      {item.hasStory ? (
        <LinearGradient
          colors={['#9b5de5', '#5a4ae3', '#4a8fe7', '#4adede', '#ff6cab']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.storyRingGradient}
        >
          <View style={styles.storyCircle}>
            <Image source={{ uri: item.avatar }} style={styles.storyAvatar} />
          </View>
          {item.isLive && (
            <View style={styles.liveBadge}>
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          )}
        </LinearGradient>
      ) : (
        <View style={[styles.storyCircle, styles.storyCircleAdd]}>
          <Image source={{ uri: item.avatar }} style={styles.storyAvatar} />
        </View>
      )}

      <Text style={styles.storyUsername} numberOfLines={1}>
        {item.user}
      </Text>

      {item.id === 'add' && (
        <View style={styles.addStoryBadge}>
          <Ionicons name="add" size={18} color="#fff" />
        </View>
      )}
    </TouchableOpacity>
  );

  const renderCategory = (category: string) => (
    <TouchableOpacity
      key={category}
      style={[styles.categoryChip, selectedCategory === category && styles.categoryChipActive]}
      onPress={() => setSelectedCategory(category)}
      activeOpacity={0.7}
    >
      <Text style={[styles.categoryText, selectedCategory === category && styles.categoryTextActive]}>
        {category}
      </Text>
    </TouchableOpacity>
  );

  const renderSnap = ({ item }: { item: Snap }) => (
    <TouchableOpacity
      style={styles.snapCard}
      activeOpacity={0.9}
      onPress={() => router.push({ pathname: '/video/[id]', params: { id: item.id } })}
      onLongPress={() => openPreview(item)}
      delayLongPress={300}
    >
      <Image source={{ uri: item.thumbnail }} style={styles.snapThumbnail} />

      <LinearGradient
        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.9)']}
        style={styles.snapOverlay}
      />

      <View style={styles.categoryBadge}>
        <Text style={styles.categoryBadgeText}>{item.category}</Text>
      </View>

      <View style={styles.snapUserInfo}>
        <Image source={{ uri: item.avatar }} style={styles.snapAvatar} />
        <View style={styles.snapUserText}>
          <Text style={styles.snapUsername}>{item.user}</Text>
          <Text style={styles.snapTitle} numberOfLines={2}>{item.title}</Text>
        </View>
        {!item.isFollowing && (
          <TouchableOpacity style={styles.followBadge}>
            <Ionicons name="add" size={16} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.snapStats}>
        <View style={styles.snapStat}>
          <Ionicons name="play-circle" size={16} color="#fff" />
          <Text style={styles.snapStatText}>{item.views}</Text>
        </View>
        <View style={styles.snapStat}>
          <Ionicons name="time-outline" size={16} color="#fff" />
          <Text style={styles.snapStatText}>{item.timeAgo}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <BlurView intensity={90} tint="dark" style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Discover</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.headerButton} activeOpacity={0.7}>
              <Ionicons name="scan-outline" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton} activeOpacity={0.7}>
              <Ionicons name="notifications-outline" size={24} color="#fff" />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
          </View>
        </View>

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
            <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
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
            <TouchableOpacity activeOpacity={0.7}>
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
            data={filteredSnaps}
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

      {/* Premium Preview Modal */}
      <Modal
        visible={!!previewVideo}
        transparent
        animationType="none"
        onRequestClose={closeModal}
        statusBarTranslucent
      >
        <View style={styles.modalContainer}>
          {/* Backdrop with Blur */}
          <Animated.View style={[styles.modalBackdrop, { opacity: fadeAnim }]}>
            <BlurView intensity={95} tint="dark" style={StyleSheet.absoluteFill}>
              <TouchableOpacity
                style={StyleSheet.absoluteFill}
                onPress={closeModal}
                activeOpacity={1}
              />
            </BlurView>
          </Animated.View>

          {/* Modal Content */}
          {previewVideo && (
            <Animated.View
              style={[
                styles.modalContent,
                {
                  transform: [
                    { scale: scaleAnim },
                    { translateY: slideAnim },
                  ],
                  opacity: fadeAnim,
                },
              ]}
            >
              {/* Close Button */}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={closeModal}
                activeOpacity={0.8}
              >
                <BlurView intensity={80} tint="dark" style={styles.closeButtonBlur}>
                  <Ionicons name="close" size={26} color="#fff" />
                </BlurView>
              </TouchableOpacity>

              {/* Video Preview Card */}
              <View style={styles.videoCard}>
                {/* Video Thumbnail */}
                <View style={styles.videoPreview}>
                  <Image
                    source={{ uri: previewVideo.thumbnail }}
                    style={styles.previewImage}
                    resizeMode="cover"
                  />

                  {/* Play Button with Pulse Animation (Pulse animation is simulated with static styles here) */}
                  <View style={styles.playButtonContainer}>
                    <View style={styles.playPulse} />
                    <View style={styles.playButton}>
                      <LinearGradient
                        colors={['rgba(94,92,230,0.9)', 'rgba(118,75,162,0.9)']}
                        style={styles.playGradient}
                      >
                        <Ionicons name="play" size={40} color="#fff" />
                      </LinearGradient>
                    </View>
                  </View>

                  {/* Overlay Info */}
                  <LinearGradient
                    colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.9)']}
                    style={styles.videoOverlay}
                  >
                    {/* Top Info */}
                    <View style={styles.topOverlayInfo}>
                      <View style={styles.categoryTag}>
                        <Text style={styles.categoryTagText}>{previewVideo.category}</Text>
                      </View>
                      <View style={styles.quickStats}>
                        <View style={styles.quickStat}>
                          <Ionicons name="eye" size={14} color="#fff" />
                          <Text style={styles.quickStatText}>{previewVideo.views}</Text>
                        </View>
                        <View style={styles.quickStat}>
                          <Ionicons name="time" size={14} color="#fff" />
                          <Text style={styles.quickStatText}>{previewVideo.timeAgo}</Text>
                        </View>
                      </View>
                    </View>
                  </LinearGradient>
                </View>

                {/* Content Info */}
                <BlurView intensity={80} tint="dark" style={styles.contentInfo}>
                  {/* User Info */}
                  <View style={styles.modalUserInfo}>
                    <View style={styles.modalUserLeft}>
                      <View style={styles.modalAvatarContainer}>
                        <Image
                          source={{ uri: previewVideo.avatar }}
                          style={styles.modalAvatar}
                        />
                      </View>
                      <View style={styles.modalUserDetails}>
                        <Text style={styles.modalUsername}>{previewVideo.user}</Text>
                        <Text style={styles.modalUserStats}>
                          {previewVideo.likes} likes • {previewVideo.comments} comments
                        </Text>
                      </View>
                    </View>
                    {!previewVideo.isFollowing && (
                      <TouchableOpacity style={styles.modalFollowButton} activeOpacity={0.8}>
                        <LinearGradient
                          colors={['rgba(94,92,230,0.25)', 'rgba(118,75,162,0.25)']}
                          style={styles.modalFollowGradient}
                        >
                          <Ionicons name="add" size={16} color="#5e5ce6" />
                          <Text style={styles.modalFollowText}>Follow</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Title */}
                  <Text style={styles.modalTitle} numberOfLines={2}>
                    {previewVideo.title}
                  </Text>

                  {/* Action Buttons */}
                  <View style={styles.actionButtons}>
                    <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
                      <BlurView intensity={60} tint="dark" style={styles.actionBtnBlur}>
                        <Ionicons name="heart-outline" size={22} color="#fff" />
                        <Text style={styles.actionBtnText}>Like</Text>
                      </BlurView>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
                      <BlurView intensity={60} tint="dark" style={styles.actionBtnBlur}>
                        <Ionicons name="share-social-outline" size={22} color="#fff" />
                        <Text style={styles.actionBtnText}>Share</Text>
                      </BlurView>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
                      <BlurView intensity={60} tint="dark" style={styles.actionBtnBlur}>
                        <Ionicons name="bookmark-outline" size={22} color="#fff" />
                        <Text style={styles.actionBtnText}>Save</Text>
                      </BlurView>
                    </TouchableOpacity>
                  </View>

                  {/* Watch Full Video Button */}
                  <TouchableOpacity
                    style={styles.watchButton}
                    onPress={() => {
                      closeModal();
                      router.push({ pathname: '/video/[id]', params: { id: previewVideo.id } });
                    }}
                    activeOpacity={0.9}
                  >
                    <LinearGradient
                      colors={['#667eea', '#764ba2']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.watchButtonGradient}
                    >
                      <Text style={styles.watchButtonText}>Watch Full Video</Text>
                      <Ionicons name="arrow-forward" size={20} color="#fff" />
                    </LinearGradient>
                  </TouchableOpacity>
                </BlurView>
              </View>
            </Animated.View>
          )}
        </View>
      </Modal>
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
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.5)',
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
    letterSpacing: -1,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
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
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 1,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },

  // Stories
  storiesSection: {
    paddingVertical: 24,
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
    position: 'relative',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  storyRingGradient: {
    width: 76,
    height: 76,
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 3,
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
    bottom: 18,
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
    bottom: 2,
    left: 0,
    right: 0,
    backgroundColor: '#ff3b5c',
    paddingVertical: 3,
    borderRadius: 10,
    alignItems: 'center',
  },
  liveText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  storyUsername: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
  },

  // Categories
  categoriesContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 10,
  },
  categoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
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
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    // backdropFilter: 'blur(10px)', // Web/iOS only, use BlurView in Modal
    paddingHorizontal: 10,
    paddingVertical: 6,
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
    gap: 10,
  },
  snapStat: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    // backdropFilter: 'blur(10px)',
    paddingHorizontal: 8,
    paddingVertical: 5,
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

  // Modal
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    width: width - 40,
    maxWidth: 420,
    maxHeight: height * 0.85,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  // DAVOMI BU YERDA:
  closeButtonBlur: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  videoCard: {
    borderRadius: 25,
    overflow: 'hidden',
    backgroundColor: '#111',
    // Shadow qo'shimcha animatsiya effekti uchun
    shadowColor: '#5e5ce6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  videoPreview: {
    width: '100%',
    height: (width - 40) * 1.25, // Kattaroq nisbat
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    ...StyleSheet.absoluteFillObject,
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    padding: 16,
  },
  topOverlayInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? 10 : 0, // Close button tufayli o'rnatilgan
  },
  categoryTag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  categoryTagText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  quickStats: {
    flexDirection: 'row',
    gap: 12,
  },
  quickStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  quickStatText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  playButtonContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPulse: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
    position: 'absolute',
  },
  playButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
  },
  playGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Content Info Section
  contentInfo: {
    padding: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    backgroundColor: 'rgba(10,10,10,0.8)',
    overflow: 'hidden',
  },
  modalUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  modalUserLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalAvatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    padding: 2,
    borderWidth: 2,
    borderColor: '#5e5ce6',
  },
  modalAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  modalUserDetails: {
    marginLeft: 10,
  },
  modalUsername: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  modalUserStats: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '500',
  },
  modalFollowButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalFollowGradient: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(94,92,230,0.5)',
  },
  modalFollowText: {
    color: '#5e5ce6',
    fontSize: 14,
    fontWeight: '700',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 15,
    overflow: 'hidden',
  },
  actionBtnBlur: {
    width: '100%',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  watchButton: {
    width: '100%',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  watchButtonGradient: {
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  watchButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});