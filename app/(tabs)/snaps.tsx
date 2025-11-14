import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React, { useCallback, useRef, useState } from 'react';
import {
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

const { width, height } = Dimensions.get('window');

interface Post {
  id: string;
  username: string;
  avatar: string;
  mediaUrl: string;
  caption: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  isSaved: boolean;
  isFollowing: boolean;
  song?: string;
  location?: string;
}

const MOCK_POSTS: Post[] = Array.from({ length: 10 }).map((_, idx) => ({
  id: `post${idx + 1}`,
  username: `creator_${idx + 1}`,
  avatar: `https://i.pravatar.cc/150?img=${idx + 20}`,
  mediaUrl: `https://picsum.photos/1080/1920?random=${idx + 300}`,
  caption: [
    'Living my best life 🌟',
    'New day, new adventures ✨',
    'Chasing dreams and sunsets 🌅',
    'Creating magic everyday 🎨',
    'Just vibing 🎵',
    'Life is beautiful 🌸',
    'Making memories 📸',
    'Stay positive ☀️',
  ][idx % 8],
  likes: Math.floor(Math.random() * 50000 + 1000),
  comments: Math.floor(Math.random() * 500 + 50),
  shares: Math.floor(Math.random() * 200 + 10),
  isLiked: false,
  isSaved: false,
  isFollowing: idx % 3 !== 0,
  song: `Song ${idx + 1} • Artist ${idx + 1}`,
  location: ['New York', 'Los Angeles', 'Tokyo', 'Paris', 'London'][idx % 5],
}));

export default function HomeScreen() {
  const [posts, setPosts] = useState(MOCK_POSTS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const handleLike = useCallback((id: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, isLiked: !p.isLiked, likes: p.likes + (p.isLiked ? -1 : 1) }
          : p
      )
    );
  }, []);

  const handleSave = useCallback((id: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isSaved: !p.isSaved } : p))
    );
  }, []);

  const handleFollow = useCallback((id: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isFollowing: !p.isFollowing } : p))
    );
  }, []);

  const handleShare = (post: Post) => {
    console.log('Share:', post.id);
  };

  const sendComment = () => {
    if (comment.trim()) {
      console.log('Comment:', comment);
      setComment('');
      setShowComments(false);
    }
  };

  const renderPost = ({ item, index }: { item: Post; index: number }) => {
    const isActive = index === currentIndex;
    const blurIntensity = isActive ? 0 : 10; // Aktiv bo'lmagan postlar uchun yanada kuchli blur

    return (
      <View style={styles.postContainer}>
        {/* Background Image/Video */}
        <Image
          source={{ uri: item.mediaUrl }}
          style={styles.media}
          blurRadius={blurIntensity}
        />

        {/* Gradient Overlays */}
        <View style={styles.gradientTop} />
        <View style={styles.gradientBottom} />

        {/* TOP BAR - Minimalist, ajratilgan elementlar */}
        <View style={styles.topBar}>
          {/* Logo (Chap burchak) */}
          <BlurView intensity={60} tint="dark" style={styles.topBarLogoBlur}>
            <TouchableOpacity style={styles.logoButton}>
              <Text style={styles.logoText}>Snappy</Text>
            </TouchableOpacity>
          </BlurView>

          {/* Icons (O'ng burchak) */}
          <BlurView intensity={60} tint="dark" style={styles.topBarIconsBlur}>
            <TouchableOpacity style={styles.topBarIcon}>
              <Ionicons name="search-outline" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.topBarIcon}>
              <Ionicons name="notifications-outline" size={24} color="#fff" />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
          </BlurView>
        </View>

        {/* BOTTOM SECTION (Chapda info, O'ngda action tugmalar) */}
        <View style={styles.bottomSection}>
          {/* Bottom Info (Chap tomon) */}
          <View style={styles.bottomInfo}>
            <TouchableOpacity style={styles.userInfo}>
              <Text style={styles.username}>@{item.username}</Text>
              {item.location && (
                <View style={styles.locationTag}>
                  <Ionicons name="location" size={12} color="#fff" />
                  <Text style={styles.locationText}>{item.location}</Text>
                </View>
              )}
            </TouchableOpacity>

            <Text style={styles.caption} numberOfLines={2}>
              {item.caption}
            </Text>

            {item.song && (
              <View style={styles.songTag}>
                <Ionicons name="musical-note" size={14} color="#fff" />
                <Text style={styles.songText} numberOfLines={1}>
                  {item.song}
                </Text>
              </View>
            )}
          </View>

          {/* Action Buttons (O'ng tomon) */}
          <View style={styles.actionButtonsRow}>
            {/* Like */}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleLike(item.id)}
            >
              <Ionicons
                name={item.isLiked ? 'heart' : 'heart-outline'}
                size={28}
                color={item.isLiked ? '#ff3b5c' : '#fff'}
              />
              <Text style={styles.actionText}>{formatNumber(item.likes)}</Text>
            </TouchableOpacity>

            {/* Comment */}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowComments(true)}
            >
              <Ionicons name="chatbubble-outline" size={28} color="#fff" />
              <Text style={styles.actionText}>{formatNumber(item.comments)}</Text>
            </TouchableOpacity>

            {/* Share */}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleShare(item)}
            >
              <Ionicons name="share-social-outline" size={28} color="#fff" />
              <Text style={styles.actionText}>{formatNumber(item.shares)}</Text>
            </TouchableOpacity>

            {/* Save */}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleSave(item.id)}
            >
              <Ionicons
                name={item.isSaved ? 'bookmark' : 'bookmark-outline'}
                size={28}
                color={item.isSaved ? '#ffd700' : '#fff'}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Floating Avatar & Follow (Action Buttons tepasida) */}
        <View style={styles.floatingAvatarContainer}>
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
          {!item.isFollowing && (
            <TouchableOpacity
              style={styles.followBadge}
              onPress={() => handleFollow(item.id)}
            >
              <Ionicons name="add" size={16} color="#fff" />
            </TouchableOpacity>
          )}
        </View>

        {/* Comments Modal */}
        {showComments && (
          <BlurView intensity={80} tint="dark" style={styles.commentsModal}>
            <View style={styles.commentsHeader}>
              <Text style={styles.commentsTitle}>Comments</Text>
              <TouchableOpacity onPress={() => setShowComments(false)}>
                <Ionicons name="close" size={28} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.commentsContent}>
              <Text style={styles.noComments}>No comments yet</Text>
              <Text style={styles.noCommentsSubtitle}>Be the first to comment!</Text>
            </View>

            <View style={styles.commentInputContainer}>
              <Image source={{ uri: item.avatar }} style={styles.commentAvatar} />
              <TextInput
                style={styles.commentInput}
                placeholder="Add a comment..."
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={comment}
                onChangeText={setComment}
              />
              <TouchableOpacity
                style={[styles.sendButton, !comment.trim() && styles.sendButtonDisabled]}
                onPress={sendComment}
                disabled={!comment.trim()}
              >
                <Ionicons name="send" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </BlurView>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToAlignment="start"
        decelerationRate="fast"
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.y / height);
          setCurrentIndex(index);
        }}
        getItemLayout={(data, index) => ({
          length: height,
          offset: height * index,
          index,
        })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  postContainer: {
    width,
    height: height + 50,
    position: 'relative',
  },
  media: {
    width: '100%',
    height: '100%',
  },
  gradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120, // Balandligi kamaytirildi
    backgroundColor: 'rgba(0,0,0,0.3)', // Shaffoflik kamaytirildi
    zIndex: 1, // Z-index gradientlar uchun
  },
  gradientBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200, // Balandligi kamaytirildi
    backgroundColor: 'rgba(0,0,0,0.8)', // Shaffoflik oshirildi, pastki videoni yopish uchun
    zIndex: 1, // Z-index gradientlar uchun
  },

  // --- TOP BAR (Yangi: Burchaklarga joylashgan) ---
  topBar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  topBarLogoBlur: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  topBarIconsBlur: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  logoButton: {},
  logoText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  topBarIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff3b5c',
  },

  // --- BOTTOM SECTION (Yangi: Gorizontal ma'lumot va harakat) ---
  bottomSection: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 80 : 60, // Kontentni biroz yuqoriga surish
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    zIndex: 5,
  },

  // Bottom Info (Chap tomon)
  bottomInfo: {
    flex: 1,
    marginRight: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  username: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
  locationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  locationText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  caption: {
    color: '#fff',
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 8,
  },
  songTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 15,
  },
  songText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    opacity: 0.9,
    maxWidth: width * 0.4,
  },

  // Action Buttons (O'ng tomon)
  actionButtonsRow: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.15)', // Shaffoflik kamaytirildi
  },
  actionButton: {
    alignItems: 'center',
  },
  actionText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },

  // Floating Avatar (Action Buttons tepasida joylashgan)
  floatingAvatarContainer: {
    position: 'absolute',
    right: 16 + (50 / 2) - (44 / 2), // actionButtonsRow kengligi (taxminan 50) markaziga moslash
    bottom: Platform.OS === 'ios' ? 80 + 10 + (28 * 4 + 12 * 3) + 20 : 60 + 10 + (28 * 4 + 12 * 3) + 20, // Action Buttons tepasiga aniq joylashtirish
    // (BottomSection.bottom + actionButtonsRow.padding + (iconSize * iconCount + gap * gapCount) + avatar pastiga bo'sh joy)
    alignItems: 'center',
    zIndex: 6,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#fff',
    marginBottom: 5, // FollowBadge bilan orasidagi masofa
  },
  followBadge: {
    position: 'absolute',
    bottom: 0, // Avatarkaning pastki qismiga to'g'irlash
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#5e5ce6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Comments Modal
  commentsModal: {
    position: 'absolute',
    bottom: 0, // Ekran pastki qismiga yopishtirildi
    left: 0,
    right: 0,
    height: height * 0.6,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    zIndex: 50,
  },
  commentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  commentsTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  commentsContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noComments: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  noCommentsSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.6)',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 32 : 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  commentInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 15,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#5e5ce6',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(94,92,230,0.3)',
  },
});