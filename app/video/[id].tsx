import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Animated,
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

interface Comment {
  id: string;
  user: string;
  avatar: string;
  text: string;
  likes: number;
  timeAgo: string;
  replies?: Comment[];
}

interface RelatedVideo {
  id: string;
  thumbnail: string;
  title: string;
  user: string;
  views: string;
}

const MOCK_COMMENTS: Comment[] = [
  {
    id: '1',
    user: 'sarah_m',
    avatar: 'https://i.pravatar.cc/150?img=30',
    text: 'This is amazing! 🔥',
    likes: 245,
    timeAgo: '2h',
    replies: [
      {
        id: '1-1',
        user: 'creator_1',
        avatar: 'https://i.pravatar.cc/150?img=10',
        text: 'Thank you so much! 🙏',
        likes: 12,
        timeAgo: '1h',
      },
    ],
  },
  {
    id: '2',
    user: 'mike_tech',
    avatar: 'https://i.pravatar.cc/150?img=31',
    text: 'What camera did you use?',
    likes: 89,
    timeAgo: '5h',
  },
  {
    id: '3',
    user: 'emma_creates',
    avatar: 'https://i.pravatar.cc/150?img=32',
    text: 'Love the editing style! Tutorial please? 🎥',
    likes: 156,
    timeAgo: '8h',
  },
];

const RELATED_VIDEOS: RelatedVideo[] = Array.from({ length: 6 }).map((_, idx) => ({
  id: `related${idx + 1}`,
  thumbnail: `https://picsum.photos/400/600?random=${idx + 400}`,
  title: `Related video ${idx + 1}`,
  user: `creator_${idx + 5}`,
  views: `${Math.floor(Math.random() * 500 + 50)}K`,
}));

export default function VideoDetailScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [comment, setComment] = useState('');
  const [selectedTab, setSelectedTab] = useState<'comments' | 'related'>('comments');
  const scrollY = useRef(new Animated.Value(0)).current;

  const videoTitle = params.title || 'Video Detail';



  const videoData = {
    id: params.id || '1',
    user: params.user || 'creator_1',
    avatar: params.avatar || 'https://i.pravatar.cc/150?img=10',
    thumbnail: params.thumbnail || 'https://picsum.photos/1080/1920?random=200',
    title: params.title || 'Amazing sunset vibes 🌅',
    category: params.category || 'Trending',
    views: '125K',
    likes: '12.5K',
    comments: '486',
    shares: '892',
    description: 'This is an amazing video showcasing beautiful moments. Shot on iPhone 15 Pro Max with natural lighting. #sunset #nature #photography',
    hashtags: ['#sunset', '#nature', '#photography', '#viral'],
    song: 'Summer Vibes • Artist Name',
    location: 'Maldives',
  };

  const formatNumber = (num: string) => num;

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const renderComment = ({ item, isReply = false }: { item: Comment; isReply?: boolean }) => (
    <View style={[styles.commentItem, isReply && styles.replyItem]}>
      <Image source={{ uri: item.avatar }} style={styles.commentAvatar} />
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <Text style={styles.commentUser}>{item.user}</Text>
          <Text style={styles.commentTime}>{item.timeAgo}</Text>
        </View>
        <Text style={styles.commentText}>{item.text}</Text>
        <View style={styles.commentActions}>
          <TouchableOpacity style={styles.commentAction}>
            <Ionicons name="heart-outline" size={14} color="rgba(255,255,255,0.6)" />
            <Text style={styles.commentActionText}>{item.likes}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.commentAction}>
            <Text style={styles.commentActionText}>Reply</Text>
          </TouchableOpacity>
        </View>
        {item.replies && item.replies.length > 0 && (
          <View style={styles.repliesContainer}>
            <TouchableOpacity style={styles.viewReplies}>
              <Text style={styles.viewRepliesText}>── View {item.replies.length} replies</Text>
            </TouchableOpacity>
            {item.replies.map((reply) => (
              <View key={reply.id}>
                {renderComment({ item: reply, isReply: true })}
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );

  const renderRelatedVideo = ({ item }: { item: RelatedVideo }) => (
    <TouchableOpacity style={styles.relatedCard}>
      <Image source={{ uri: item.thumbnail }} style={styles.relatedThumbnail} />
      <View style={styles.relatedOverlay}>
        <Ionicons name="play-circle" size={32} color="rgba(255,255,255,0.9)" />
      </View>
      <View style={styles.relatedInfo}>
        <Text style={styles.relatedTitle} numberOfLines={2}>{item.title}</Text>
        <View style={styles.relatedStats}>
          <Text style={styles.relatedUser}>{item.user}</Text>
          <Text style={styles.relatedViews}>{item.views} views</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>

      <Stack.Screen
        options={{
          title: videoTitle as string, // bu header da video title chiqadi
          headerShown: true,
        }}
      />
      {/* Animated Header */}
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <BlurView intensity={80} tint="dark" style={styles.headerBlur}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>{videoData.title}</Text>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="share-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </BlurView>
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Video Player */}
        <View style={styles.videoContainer}>
          <Image
            source={{
              uri: Array.isArray(videoData.thumbnail)
                ? videoData.thumbnail[0]
                : videoData.thumbnail
            }}
            style={styles.videoPlayer}
          />


          {/* Video Controls Overlay */}
          <View style={styles.videoControls}>
            <TouchableOpacity
              style={styles.playButton}
              onPress={() => setIsPlaying(!isPlaying)}
            >
              <BlurView intensity={50} tint="dark" style={styles.playButtonBlur}>
                <Ionicons name={isPlaying ? 'pause' : 'play'} size={48} color="#fff" />
              </BlurView>
            </TouchableOpacity>

            {/* Top Controls */}
            <View style={styles.topControls}>
              <TouchableOpacity style={styles.videoControlBtn} onPress={() => router.back()}>
                <BlurView intensity={60} tint="dark" style={styles.controlBtnBlur}>
                  <Ionicons name="chevron-back" size={24} color="#fff" />
                </BlurView>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.videoControlBtn}
                onPress={() => setIsMuted(!isMuted)}
              >
                <BlurView intensity={60} tint="dark" style={styles.controlBtnBlur}>
                  <Ionicons name={isMuted ? 'volume-mute' : 'volume-high'} size={22} color="#fff" />
                </BlurView>
              </TouchableOpacity>
            </View>

            {/* Bottom Info */}
            <View style={styles.videoInfo}>
              <View style={styles.categoryTag}>
                <Text style={styles.categoryTagText}>{videoData.category}</Text>
              </View>
              <View style={styles.viewsTag}>
                <Ionicons name="eye" size={14} color="#fff" />
                <Text style={styles.viewsText}>{videoData.views} views</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* User Section */}
          <View style={styles.userSection}>
            <Image
              source={{ uri: Array.isArray(videoData.avatar) ? videoData.avatar[0] : videoData.avatar }}
              style={styles.inputAvatar}
            />
            <View style={styles.userInfo}>
              <Text style={styles.userName}>@{videoData.user}</Text>
              <View style={styles.userMeta}>
                <Ionicons name="location" size={12} color="rgba(255,255,255,0.6)" />
                <Text style={styles.userLocation}>{videoData.location}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.followButton, isFollowing && styles.followingButton]}
              onPress={() => setIsFollowing(!isFollowing)}
            >
              <Text style={styles.followButtonText}>
                {isFollowing ? 'Following' : 'Follow'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Title & Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.videoTitle}>{videoData.title}</Text>
            <TouchableOpacity onPress={() => setShowDescription(!showDescription)}>
              <Text
                style={styles.videoDescription}
                numberOfLines={showDescription ? undefined : 2}
              >
                {videoData.description}
              </Text>
              <Text style={styles.showMoreText}>
                {showDescription ? 'Show less' : 'Show more'}
              </Text>
            </TouchableOpacity>

            {/* Hashtags */}
            <View style={styles.hashtagsContainer}>
              {videoData.hashtags.map((tag, idx) => (
                <TouchableOpacity key={idx} style={styles.hashtag}>
                  <Text style={styles.hashtagText}>{tag}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Song */}
            <TouchableOpacity style={styles.songTag}>
              <Ionicons name="musical-note" size={18} color="#fff" />
              <Text style={styles.songText}>{videoData.song}</Text>
              <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.6)" />
            </TouchableOpacity>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setIsLiked(!isLiked)}
            >
              <Ionicons
                name={isLiked ? 'heart' : 'heart-outline'}
                size={28}
                color={isLiked ? '#ff3b5c' : '#fff'}
              />
              <Text style={styles.actionButtonText}>{videoData.likes}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="chatbubble-outline" size={26} color="#fff" />
              <Text style={styles.actionButtonText}>{videoData.comments}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="share-social-outline" size={26} color="#fff" />
              <Text style={styles.actionButtonText}>{videoData.shares}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setIsSaved(!isSaved)}
            >
              <Ionicons
                name={isSaved ? 'bookmark' : 'bookmark-outline'}
                size={26}
                color={isSaved ? '#ffd700' : '#fff'}
              />
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, selectedTab === 'comments' && styles.activeTab]}
              onPress={() => setSelectedTab('comments')}
            >
              <Text style={[styles.tabText, selectedTab === 'comments' && styles.activeTabText]}>
                Comments ({videoData.comments})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, selectedTab === 'related' && styles.activeTab]}
              onPress={() => setSelectedTab('related')}
            >
              <Text style={[styles.tabText, selectedTab === 'related' && styles.activeTabText]}>
                Related
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          {selectedTab === 'comments' ? (
            <View style={styles.commentsSection}>
              <FlatList
                data={MOCK_COMMENTS}
                renderItem={renderComment}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            </View>
          ) : (
            <View style={styles.relatedSection}>
              <FlatList
                data={RELATED_VIDEOS}
                renderItem={renderRelatedVideo}
                keyExtractor={(item) => item.id}
                numColumns={2}
                scrollEnabled={false}
                columnWrapperStyle={styles.relatedRow}
              />
            </View>
          )}
        </View>
      </Animated.ScrollView>

      {/* Comment Input */}
      <BlurView intensity={100} tint="dark" style={styles.commentInputContainer}>
        <Image
          source={{ uri: Array.isArray(videoData.avatar) ? videoData.avatar[0] : videoData.avatar }}
          style={styles.inputAvatar}
        />
        <TextInput
          style={styles.commentInput}
          placeholder="Add a comment..."
          placeholderTextColor="rgba(255,255,255,0.5)"
          value={comment}
          onChangeText={setComment}
        />
        <TouchableOpacity
          style={[styles.sendButton, !comment.trim() && styles.sendButtonDisabled]}
          disabled={!comment.trim()}
        >
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </BlurView>
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  headerBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 12,
    paddingHorizontal: 16,
    overflow: 'hidden',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    marginHorizontal: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Video Player
  videoContainer: {
    width,
    height: width * 1.5,
    position: 'relative',
    backgroundColor: '#000',
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
  },
  videoControls: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -40,
    marginLeft: -40,
  },
  playButtonBlur: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 16,
  },
  videoControlBtn: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  controlBtnBlur: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  categoryTag: {
    backgroundColor: 'rgba(94,92,230,0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryTagText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  viewsTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  viewsText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },

  // Content
  content: {
    backgroundColor: '#000',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    paddingTop: 20,
  },

  // User Section
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  userLocation: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
  },
  followButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#5e5ce6',
  },
  followingButton: {
    backgroundColor: 'rgba(94,92,230,0.2)',
    borderWidth: 1,
    borderColor: '#5e5ce6',
  },
  followButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },

  // Description
  descriptionSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  videoTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  videoDescription: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 22,
  },
  showMoreText: {
    color: '#5e5ce6',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  hashtagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  hashtag: {
    backgroundColor: 'rgba(94,92,230,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  hashtagText: {
    color: '#5e5ce6',
    fontSize: 13,
    fontWeight: '600',
  },
  songTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    marginTop: 12,
    gap: 8,
  },
  songText: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  // Actions
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  actionButtonText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontWeight: '600',
  },

  // Tabs
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#5e5ce6',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
  },
  activeTabText: {
    color: '#fff',
  },

  // Comments
  commentsSection: {
    paddingHorizontal: 20,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  replyItem: {
    marginLeft: 40,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentUser: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
  },
  commentTime: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
  commentText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 20,
    marginBottom: 8,
  },
  commentActions: {
    flexDirection: 'row',
    gap: 16,
  },
  commentAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  commentActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
  },
  repliesContainer: {
    marginTop: 12,
  },
  viewReplies: {
    marginBottom: 12,
  },
  viewRepliesText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5e5ce6',
  },

  // Related
  relatedSection: {
    paddingHorizontal: 12,
  },
  relatedRow: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  relatedCard: {
    width: (width - 36) / 2,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  relatedThumbnail: {
    width: '100%',
    height: (width - 36) / 2 * 1.4,
  },
  relatedOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  relatedInfo: {
    padding: 12,
  },
  relatedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 6,
  },
  relatedStats: {
    gap: 4,
  },
  relatedUser: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  relatedViews: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
  },

  // Comment Input
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 32 : 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  inputAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  commentInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
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