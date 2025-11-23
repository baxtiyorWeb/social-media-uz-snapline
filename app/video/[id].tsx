import api from '@/config/api';
import { Ionicons } from '@expo/vector-icons';
import { ResizeMode, Video } from 'expo-av';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
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
  id: number;
  caption: string;
  thumbnail: string;
  user: {
    profile: {
      username: string;
      firstName: string;
      lastName: string;
      avatar: string;
    };
  };
  views: number;
  likes: number;
}

const MOCK_COMMENTS: Comment[] = [
  {
    id: '1',
    user: 'sarah_m',
    avatar: 'https://i.pravatar.cc/150?img=30',
    text: 'This is absolutely incredible! The production quality is insane 🔥',
    likes: 245,
    timeAgo: '2h',
    replies: [
      {
        id: '1-1',
        user: 'creator_1',
        avatar: 'https://i.pravatar.cc/150?img=10',
        text: 'Thank you so much! 🙏 Appreciate the love',
        likes: 12,
        timeAgo: '1h',
      },
    ],
  },
  {
    id: '2',
    user: 'mike_tech',
    avatar: 'https://i.pravatar.cc/150?img=31',
    text: 'What camera setup did you use for this? Looking to upgrade',
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

export default function VideoDetailScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const [videoData, setVideoData] = useState<any>(null);
  const [relatedVideos, setRelatedVideos] = useState<RelatedVideo[]>([]);
  const [loading, setLoading] = useState(true);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isFollow, setIsFollow] = useState<any>();
  const [followLoading, setFollowLoading] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [comment, setComment] = useState('');
  const [selectedTab, setSelectedTab] = useState<'comments' | 'related'>('comments');
  const [likes, setLikes] = useState(0);
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchVideoDetail();
    fetchRelatedVideos();
  }, [params.id]);

  const fetchVideoDetail = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/posts/${params.id}`);
      setVideoData(response.data);
      setLikes(response.data.likes || 0);
      await api.post(`/posts/${params.id}/view`);
    } catch (error) {
      console.error('Video yuklash xatosi:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedVideos = async () => {
    try {
      const response = await api.get('/posts?page=1&limit=6');
      setRelatedVideos(response.data.data || []);
    } catch (error) {
      console.error('Related videos yuklash xatosi:', error);
    }
  };

  const handleLike = async () => {
    try {
      const response = await api.post(`/posts/${params.id}/like`);
      setIsLiked(!isLiked);
      setLikes(response.data.likes);
    } catch (error) {
      console.error('Like xatosi:', error);
    }
  };

  const handleFollow = async () => {
    try {
      setFollowLoading(true);
      const response = await api.post(`/follow/username/${videoData?.user?.profile?.username}`);
      setIsFollow(response.data);
      return response.data;
    } catch (error) {
      console.log('error', error);
    } finally {
      setFollowLoading(false);
    }
  };

  const isFollowingResponse = async () => {
    try {
      const response = await api.get(`/follow/is-follow/${videoData?.userId}`);
      setIsFollow(response.data);
      return response.data;
    } catch (error) {
      console.log('error', error);
    }
  };

  useEffect(() => {
    if (!videoData) return;
    const getIsFollowing = async () => {
      try {
        await isFollowingResponse();
      } catch (error) {
        console.log(error);
      }
    };
    getIsFollowing();
  }, [videoData]);

  const handleMessage = () => {
    if (!videoData) return;

    // async funksiya ichida API chaqiruvini qilamiz
    (async () => {
      try {
        const response = await api.post("/chat/create", {
          isGroup: false,
          participants: [videoData.userId],
        });
        const chat = response.data;
        const chatId = chat.id;

        // Router-ni async ichida ishlatish mumkin
        router.push(
          `/chat/${chatId}?user=${videoData.user?.profile?.username}&avatar=${videoData.user?.profile?.avatar}&online=true&userId=${videoData.userId}`
        );
      } catch (error: any) {
        console.error("Chat yaratishda xatolik:", error.response?.data || error.message);
      }
    })();
  };

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
    <TouchableOpacity
      style={styles.relatedCard}
      onPress={() => router.push(`/video/${item.id}`)}
      activeOpacity={0.85}
    >
      <Image
        source={{ uri: item.thumbnail || 'https://via.placeholder.com/300x400' }}
        style={styles.relatedThumbnail}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.relatedGradient}
      />
      <View style={styles.relatedOverlay}>
        <View style={styles.playIconWrapper}>
          <Ionicons name="play-circle" size={40} color="#fff" />
        </View>
      </View>
      <View style={styles.relatedInfo}>
        <Text style={styles.relatedTitle} numberOfLines={2}>{item.caption}</Text>
        <View style={styles.relatedStats}>
          <Text style={styles.relatedUser}>@{item.user.profile.username}</Text>
          <Text style={styles.relatedDot}>•</Text>
          <Text style={styles.relatedViews}>{item.views || 0}K views</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00d4ff" />
      </View>
    );
  }

  if (!videoData) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="rgba(255,255,255,0.5)" />
        <Text style={styles.errorText}>Video topilmadi</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      {/* Animated Header */}
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <BlurView intensity={90} tint="dark" style={styles.headerBlur}>
          <TouchableOpacity style={styles.headerBackButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>{videoData.caption}</Text>
          <TouchableOpacity style={styles.headerAction}>
            <Ionicons name="share-social" size={22} color="#fff" />
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
          <Video
            source={{ uri: videoData.videoUrl }}
            style={styles.videoPlayer}
            resizeMode={ResizeMode.COVER}
            isLooping
            useNativeControls
            progressUpdateIntervalMillis={500}
          />

          {/* Gradient Overlay */}
          <LinearGradient
            colors={['rgba(0,0,0,0.3)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.videoGradient}
          />

          {/* Top Controls */}
          <View style={styles.videoTopControls}>
            <TouchableOpacity style={styles.videoControlBtn} onPress={() => router.back()}>
              <BlurView intensity={70} tint="dark" style={styles.controlBtnBlur}>
                <Ionicons name="chevron-back" size={24} color="#fff" />
              </BlurView>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.videoControlBtn}
              onPress={() => setIsMuted(!isMuted)}
            >
              <BlurView intensity={70} tint="dark" style={styles.controlBtnBlur}>
                <Ionicons name={isMuted ? 'volume-mute' : 'volume-high'} size={22} color="#fff" />
              </BlurView>
            </TouchableOpacity>
          </View>

          {/* Bottom Video Info */}
          <View style={styles.videoBottomInfo}>
            <View style={styles.categoryTag}>
              <Text style={styles.categoryTagText}>{videoData.category || 'Video'}</Text>
            </View>
            <View style={styles.viewsTag}>
              <Ionicons name="eye" size={14} color="#00d4ff" />
              <Text style={styles.viewsText}>{videoData.views || 0} views</Text>
            </View>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Title */}
          <View style={styles.titleSection}>
            <Text style={styles.videoTitle}>{videoData.caption}</Text>
          </View>

          {/* User Card */}
          <View style={styles.userCard}>
            <View style={styles.userContent}>
              <Image
                source={{ uri: videoData.user.profile?.avatar }}
                style={styles.userAvatar}
              />
              <View style={styles.userInfo}>
                <View>
                  <Text style={styles.userName}>@{videoData.user.profile?.username}</Text>
                  <Text style={styles.userRealName}>
                    {videoData.user.profile?.firstName} {videoData.user.profile?.lastName}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.userActions}>
              <TouchableOpacity
                style={[styles.followButton, isFollow?.isFollowing && styles.followingButton]}
                onPress={handleFollow}
                disabled={followLoading}
              >
                {followLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons
                      name={isFollow?.isFollowing ? 'checkmark' : 'person-add'}
                      size={16}
                      color="#fff"
                    />
                    <Text style={styles.followButtonText}>
                      {isFollow?.isFollowing ? 'Following' : 'Follow'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.messageButton}
                onPress={handleMessage}
              >
                <Ionicons name="chatbubble-outline" size={18} color="#00d4ff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Description */}
          {videoData.description && (
            <View style={styles.descriptionSection}>
              <TouchableOpacity onPress={() => setShowDescription(!showDescription)}>
                <Text
                  style={styles.videoDescription}
                  numberOfLines={showDescription ? undefined : 2}
                >
                  {videoData.description}
                </Text>
                <Text style={styles.showMoreText}>
                  {showDescription ? '− Show less' : '+ Show more'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Hashtags */}
          {videoData.hashtags && (
            <View style={styles.hashtagsContainer}>
              {videoData.hashtags.split(' ').map((tag: string, idx: number) => (
                <TouchableOpacity key={idx} style={styles.hashtag}>
                  <Text style={styles.hashtagText}>{tag}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Stats & Actions */}
          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{likes}</Text>
              <Text style={styles.statLabel}>Likes</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{videoData.comments || 0}</Text>
              <Text style={styles.statLabel}>Comments</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{videoData.shares || 0}</Text>
              <Text style={styles.statLabel}>Shares</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, isLiked && styles.actionButtonActive]}
              onPress={handleLike}
            >
              <Ionicons
                name={isLiked ? 'heart' : 'heart-outline'}
                size={26}
                color={isLiked ? '#ff3b5c' : '#fff'}
              />
              <Text style={styles.actionLabel}>Like</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="chatbubble-outline" size={26} color="#fff" />
              <Text style={styles.actionLabel}>Comment</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="share-social-outline" size={26} color="#fff" />
              <Text style={styles.actionLabel}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, isSaved && styles.actionButtonActive]}
              onPress={() => setIsSaved(!isSaved)}
            >
              <Ionicons
                name={isSaved ? 'bookmark' : 'bookmark-outline'}
                size={26}
                color={isSaved ? '#ffd700' : '#fff'}
              />
              <Text style={styles.actionLabel}>Save</Text>
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.tab, selectedTab === 'comments' && styles.activeTab]}
              onPress={() => setSelectedTab('comments')}
            >
              <Text style={[styles.tabText, selectedTab === 'comments' && styles.activeTabText]}>
                Comments
              </Text>
              {selectedTab === 'comments' && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, selectedTab === 'related' && styles.activeTab]}
              onPress={() => setSelectedTab('related')}
            >
              <Text style={[styles.tabText, selectedTab === 'related' && styles.activeTabText]}>
                Related
              </Text>
              {selectedTab === 'related' && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
          </View>

          {/* Content */}
          {selectedTab === 'comments' ? (
            <View style={styles.commentsSection}>
              {MOCK_COMMENTS.length > 0 ? (
                <FlatList
                  data={MOCK_COMMENTS}
                  renderItem={renderComment}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                />
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="chatbubbles-outline" size={40} color="rgba(255,255,255,0.3)" />
                  <Text style={styles.emptyStateText}>No comments yet</Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.relatedSection}>
              {relatedVideos.length > 0 ? (
                <FlatList
                  data={relatedVideos.filter((v) => v.id !== videoData.id)}
                  renderItem={renderRelatedVideo}
                  keyExtractor={(item) => item.id.toString()}
                  numColumns={2}
                  scrollEnabled={false}
                  columnWrapperStyle={styles.relatedRow}
                />
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="film-outline" size={40} color="rgba(255,255,255,0.3)" />
                  <Text style={styles.emptyStateText}>No related videos</Text>
                </View>
              )}
            </View>
          )}

          <View style={{ height: 100 }} />
        </View>
      </Animated.ScrollView>

      {/* Comment Input */}
      <BlurView intensity={100} tint="dark" style={styles.commentInputContainer}>
        <Image
          source={{ uri: videoData.user.profile?.avatar }}
          style={styles.inputAvatar}
        />
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.commentInput}
            placeholder="Add a comment..."
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={comment}
            onChangeText={setComment}
            multiline
            maxLength={280}
          />
        </View>
        <TouchableOpacity
          style={[styles.sendButton, !comment.trim() && styles.sendButtonDisabled]}
          disabled={!comment.trim()}
        >
          <Ionicons name="send" size={18} color="#fff" />
        </TouchableOpacity>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e27',
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
  headerBackButton: {
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
  headerAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Video Player
  videoContainer: {
    width,
    height: width * 1.6,
    position: 'relative',
    backgroundColor: '#000',
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
  },
  videoGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  videoTopControls: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  videoBottomInfo: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryTag: {
    backgroundColor: 'rgba(0, 212, 255, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.3)',
  },
  categoryTagText: {
    color: '#00d4ff',
    fontSize: 12,
    fontWeight: '700',
  },
  viewsTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.2)',
  },
  viewsText: {
    color: '#00d4ff',
    fontSize: 12,
    fontWeight: '600',
  },

  // Content
  content: {
    backgroundColor: '#0a0e27',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -28,
    paddingTop: 24,
  },

  // Title Section
  titleSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  videoTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    lineHeight: 28,
  },

  // User Card
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'rgba(0, 212, 255, 0.05)',
    borderRadius: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.1)',
  },
  userContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#00d4ff',
  },
  userInfo: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  userRealName: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  userActions: {
    flexDirection: 'row',
    gap: 10,
  },
  followButton: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: '#00d4ff',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  followingButton: {
    backgroundColor: 'rgba(0, 212, 255, 0.15)',
    borderWidth: 1,
    borderColor: '#00d4ff',
  },
  followButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  messageButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 212, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.3)',
  },

  // Description
  descriptionSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  videoDescription: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 22,
  },
  showMoreText: {
    color: '#00d4ff',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 6,
  },

  // Hashtags
  hashtagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  hashtag: {
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.2)',
  },
  hashtagText: {
    color: '#00d4ff',
    fontSize: 13,
    fontWeight: '600',
  },

  // Stats
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 20,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 212, 255, 0.05)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.1)',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#00d4ff',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
  },

  // Actions
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    gap: 6,
  },
  actionButtonActive: {
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    borderColor: 'rgba(0, 212, 255, 0.3)',
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },

  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 212, 255, 0.1)',
    paddingBottom: 16,
  },
  tab: {
    flex: 1,
    paddingBottom: 0,
    alignItems: 'center',
    position: 'relative',
  },
  activeTab: {},
  tabText: {
    fontSize: 15,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
  },
  activeTabText: {
    color: '#00d4ff',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: -16,
    width: 30,
    height: 3,
    backgroundColor: '#00d4ff',
    borderRadius: 1.5,
  },

  // Comments
  commentsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  replyItem: {
    marginLeft: 48,
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 212, 255, 0.2)',
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
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
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 212, 255, 0.1)',
  },
  viewReplies: {
    marginBottom: 12,
  },
  viewRepliesText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#00d4ff',
  },

  // Related
  relatedSection: {
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  relatedRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  relatedCard: {
    width: (width - 44) / 2,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 212, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.1)',
  },
  relatedThumbnail: {
    width: '100%',
    height: (width - 44) / 2 * 1.5,
  },
  relatedGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  relatedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  playIconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 212, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#00d4ff',
  },
  relatedInfo: {
    padding: 12,
  },
  relatedTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
    lineHeight: 18,
  },
  relatedStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  relatedUser: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
  },
  relatedDot: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
  },
  relatedViews: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 12,
    fontWeight: '600',
  },

  // Comment Input
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 32 : 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 212, 255, 0.1)',
    overflow: 'hidden',
    gap: 10,
  },
  inputAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 212, 255, 0.3)',
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: 'rgba(0, 212, 255, 0.08)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.2)',
    overflow: 'hidden',
  },
  commentInput: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#00d4ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(0, 212, 255, 0.3)',
  },

  // Loading & Error
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0e27',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0e27',
  },
  errorText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginTop: 12,
  },
});