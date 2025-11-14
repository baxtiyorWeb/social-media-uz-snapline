import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useContext, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// --- MOCK UTILS & DATA ---
// Haptics ni mock qilish (Expo-Haptics ishlamaydigan muhitlar uchun)
const Haptics = {
  impactAsync: async (style: string) => { console.log('Haptics: Impact'); },
  NotificationFeedbackType: { Success: 'success' },
  notificationAsync: async (type: string) => { console.log('Haptics: Notification'); },
  ImpactFeedbackStyle: { Medium: 'medium', Light: 'light' },
};

// ThemeContext ni mock qilish
const ThemeContext = React.createContext({ isDark: false });
const { width, height } = Dimensions.get('window');

export interface Post {
  id: string;
  username: string;
  avatar: string;
  imageUrl: string;
  caption: string;
  category: string;
  likes: number;
  views: string; // Qo'shildi
  comments: string[];
  isLiked: boolean;
  isSaved: boolean;
  isFollowing: boolean; // Qo'shildi
}

const REAL_IMAGES = [
  'https://images.unsplash.com/photo-1506905925346-500db43f2db7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1519389950477-38177b6b9f0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1542831371-29b015170d69?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
];

const initialPost: Post = {
  id: 'p1',
  username: 'Toglar_uz',
  avatar: 'https://i.pravatar.cc/40?u=tog',
  imageUrl: REAL_IMAGES[0],
  caption:
    'Chimgan tog‘larida tong. Havo toza, fikr ochiq. #sayohat #tabiat Bu juda uzun sarlavha. Bu sarlavhani ko‘proq ma’lumot bilan to‘ldiramiz. Bu sarlavha ko‘proq matn bilan qisqa ko‘rinmasligi kerak.',
  likes: 2847,
  views: '12.5K', // Mock view count
  comments: ['Ajoyib manzara!', 'Qayerda bu?', 'Juda zo‘r tabiat!', 'Yangi kommentariya testi.'],
  isLiked: false,
  isSaved: true,
  isFollowing: true, // Initial following state
  category: 'Sayohat',
};

// --- YOUTUBE STYLE COMMENT SHEET COMPONENT ---
interface CommentSheetProps {
  post: Post;
  isVisible: boolean;
  onClose: () => void;
  onCommentAdd?: (comment: string) => void;
  modalY: Animated.Value;
}

const CommentSheet = ({ post, isVisible, onClose, onCommentAdd, modalY }: CommentSheetProps) => {
  const { isDark } = useContext(ThemeContext);
  const [newComment, setNewComment] = useState('');

  const handleAddComment = () => {
    if (newComment.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onCommentAdd?.(newComment);
      setNewComment('');
    }
  };

  const renderComment = ({ item, index }: { item: string; index: number }) => (
    <View style={styles.commentItem}>
      <Image source={{ uri: `https://i.pravatar.cc/40?u=c${index}` }} style={styles.commentAvatar} />
      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text style={[styles.commentUser, { color: isDark ? '#E2E8F0' : '#222' }]}>
          Izohchi{index + 1}
          <Text style={{ fontWeight: '400', color: isDark ? '#94A3B8' : '#777', fontSize: 12 }}>
            {' • 1h'}
          </Text>
        </Text>
        <Text style={[styles.commentText, { color: isDark ? '#A1A1AA' : '#333' }]}>{item}</Text>
      </View>
      <TouchableOpacity>
        <Ionicons name="heart-outline" size={16} color={isDark ? '#94A3B8' : '#777'} />
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal visible={isVisible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose} // Pastki qismga bosilganda yopish
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalKeyboardAvoid}
        >
          <Animated.View
            style={[
              styles.modalContent,
              {
                backgroundColor: isDark ? '#1E293B' : '#fff',
                transform: [{ translateY: modalY }],
              },
            ]}
          >
            {/* Modal Header */}
            <View style={[styles.modalHeader, { borderBottomColor: isDark ? '#334155' : '#eee' }]}>
              <Text style={[styles.modalTitle, { color: isDark ? '#E2E8F0' : '#222' }]}>
                Izohlar ({post.comments.length})
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={26} color={isDark ? '#E2E8F0' : '#666'} />
              </TouchableOpacity>
            </View>

            {/* Comments List */}
            <FlatList
              data={post.comments}
              renderItem={renderComment}
              keyExtractor={(_, index) => index.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 10 }}
              style={{ flex: 1, paddingTop: 10 }}
            />

            {/* Comment Input */}
            <View
              style={[
                styles.commentInputContainer,
                { borderTopColor: isDark ? '#334155' : '#eee' },
              ]}
            >
              <TextInput
                style={[
                  styles.commentInput,
                  {
                    backgroundColor: isDark ? '#334155' : '#f5f5f5',
                    color: isDark ? '#E2E8F0' : '#333',
                  },
                ]}
                placeholder="Izoh yozing..."
                placeholderTextColor={isDark ? '#94A3B8' : '#aaa'}
                value={newComment}
                onChangeText={setNewComment}
              />
              <TouchableOpacity
                onPress={handleAddComment}
                disabled={!newComment.trim()}
                style={[
                  styles.sendButton,
                  {
                    backgroundColor: newComment.trim() ? '#7873f5' : (isDark ? '#334155' : '#ccc'),
                  },
                ]}
              >
                <Ionicons name="send" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </TouchableOpacity>
    </Modal>
  );
};

// --- POST CARD COMPONENT ---
interface PostCardProps {
  post: Post;
  onLike: (id: string) => void;
  onSave: (id: string) => void;
  onShare: (id: string) => void;
  onCommentAdd: (id: string, comment: string) => void;
  onProfileView: (username: string) => void;
  onMore: (id: string) => void;
}

export const PostCard = React.memo(
  ({ post, onLike, onSave, onShare, onCommentAdd, onProfileView, onMore }: PostCardProps) => {
    const { isDark } = useContext(ThemeContext);
    const [localPost, setLocalPost] = useState(post);
    const [showComments, setShowComments] = useState(false);
    const [showFullCaption, setShowFullCaption] = useState(false);
    const heartAnim = useRef(new Animated.Value(0)).current;
    const modalY = useRef(new Animated.Value(height)).current;
    const lastPress = useRef(0);

    // --- Actions ---

    const handleLike = useCallback(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onLike(localPost.id);
      setLocalPost(prev => ({
        ...prev,
        isLiked: !prev.isLiked,
        likes: prev.likes + (!prev.isLiked ? 1 : -1),
      }));
    }, [localPost.id, localPost.isLiked, onLike]);

    // YENGI: Kuzatish/Kuzatuvda holatini o'zgartirish
    const handleFollow = useCallback(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setLocalPost(prev => ({
        ...prev,
        isFollowing: !prev.isFollowing
      }));
    }, []);

    const handleDoubleTap = useCallback(() => {
      const now = Date.now();
      const DOUBLE_PRESS_DELAY = 300;
      if (now - lastPress.current < DOUBLE_PRESS_DELAY) {
        if (!localPost.isLiked) {
          handleLike();
        }
        // Katta yurak animatsiyasi
        heartAnim.setValue(0);
        Animated.timing(heartAnim, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.back(2)),
          useNativeDriver: true,
        }).start(() => heartAnim.setValue(0));
      }
      lastPress.current = now;
    }, [handleLike, localPost.isLiked, heartAnim]);

    const handleSave = useCallback(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onSave(localPost.id);
      setLocalPost(prev => ({ ...prev, isSaved: !prev.isSaved }));
    }, [localPost.id, onSave]);

    const handleCommentAddLocally = useCallback(
      (comment: string) => {
        onCommentAdd(localPost.id, comment); // Ota komponentga xabar berish
        setLocalPost(prev => ({
          ...prev,
          comments: [...prev.comments, comment],
        }));
      },
      [localPost.id, onCommentAdd]
    );

    // --- Modal Logic ---

    const openComments = useCallback(() => {
      setShowComments(true);
      Animated.timing(modalY, {
        toValue: 0,
        duration: 350,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }, [modalY]);

    const closeComments = useCallback(() => {
      Animated.timing(modalY, {
        toValue: height,
        duration: 300,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start(() => setShowComments(false));
    }, [modalY]);

    // --- Rendering ---

    const caption = showFullCaption
      ? localPost.caption
      : localPost.caption.slice(0, 100) + (localPost.caption.length > 100 ? '...' : '');

    const heartOverlayStyle = {
      opacity: heartAnim,
      transform: [
        { scale: heartAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1.5] }) },
        { rotate: heartAnim.interpolate({ inputRange: [0, 1], outputRange: ['-15deg', '0deg'] }) },
      ],
    };

    return (
      <View
        style={[
          styles.cardContainer,
          { backgroundColor: isDark ? '#1E293B' : '#fff' },
        ]}
      >
        {/* YENGI HEADER: Avatar, Username, Views, Follow Button */}
        <View style={styles.header}>

          <TouchableOpacity onPress={() => onProfileView(localPost.username)} style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <Image source={{ uri: localPost.avatar }} style={styles.avatar} />
            <View style={{ marginLeft: 10 }}>
              <Text style={[styles.username, { color: isDark ? '#E2E8F0' : '#222' }]}>
                {localPost.username}
              </Text>
              <View style={styles.viewCountContainer}>
                <Ionicons name="eye-outline" size={14} color={isDark ? '#94A3B8' : '#555'} />
                <Text style={[styles.viewCountText, { color: isDark ? '#94A3B8' : '#555' }]}>
                  {localPost.views} Ko&apos;rish
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleFollow}
            style={[
              styles.followButton,
              {
                backgroundColor: localPost.isFollowing ? '#7873f5' : (isDark ? 'transparent' : '#fff'),
                borderColor: '#7873f5',
                borderWidth: localPost.isFollowing ? 0 : 1.5,
              },
            ]}
          >
            <Text
              style={[
                styles.followButtonText,
                {
                  color: localPost.isFollowing ? '#fff' : '#7873f5',
                },
              ]}
            >
              {localPost.isFollowing ? 'Kuzatuvda' : 'Kuzatish'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => onMore(localPost.id)} style={{ marginLeft: 15 }}>
            <Ionicons name="ellipsis-horizontal" size={22} color={isDark ? '#ccc' : '#666'} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={handleDoubleTap} activeOpacity={1}>
          <View style={styles.imageWrapper}>
            <Image source={{ uri: localPost.imageUrl }} style={styles.image} resizeMode="cover" />
            <Animated.View style={[styles.heartOverlay, heartOverlayStyle]}>
              <Ionicons name="heart" size={80} color="#ff3b5c" />
            </Animated.View>
          </View>
        </TouchableOpacity>

        <View style={styles.actions}>

          <TouchableOpacity onPress={handleLike} style={styles.actionBtn}>
            <Ionicons
              name={localPost.isLiked ? 'heart' : 'heart-outline'}
              size={28}
              color={localPost.isLiked ? '#ff3b5c' : isDark ? '#E2E8F0' : '#444'}
            />
            <Text style={{ color: isDark ? '#E2E8F0' : '#444', marginLeft: 6, fontWeight: '600' }}>
              {localPost.likes.toLocaleString()}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={openComments} style={styles.actionBtn}>
            <Ionicons name="chatbubble-outline" size={28} color={isDark ? '#E2E8F0' : '#444'} />
            <Text style={{ color: isDark ? '#E2E8F0' : '#444', marginLeft: 6, fontWeight: '600' }}>
              {localPost.comments.length}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => onShare(localPost.id)} style={styles.actionBtn}>
            <Ionicons name="share-outline" size={28} color={isDark ? '#E2E8F0' : '#444'} />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleSave} style={{ marginLeft: 'auto' }}>
            <Ionicons
              name={localPost.isSaved ? 'bookmark' : 'bookmark-outline'}
              size={28}
              color={localPost.isSaved ? '#7873f5' : isDark ? '#E2E8F0' : '#444'}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.captionWrapper}>
          <Text style={{ color: isDark ? '#E2E8F0' : '#222', fontSize: 15 }}>
            <Text style={{ fontWeight: '700' }}>{localPost.username} </Text>
            {caption}
          </Text>
          {localPost.caption.length > 100 && (
            <TouchableOpacity onPress={() => setShowFullCaption(!showFullCaption)}>
              <Text style={{ color: '#7873f5', marginTop: 2, fontWeight: '600' }}>
                {showFullCaption ? 'Kamroq' : 'Ko‘proq...'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {showComments && (
          <CommentSheet
            post={localPost}
            isVisible={showComments}
            onClose={closeComments}
            onCommentAdd={handleCommentAddLocally}
            modalY={modalY}
          />
        )}
      </View>
    );
  }
);


const App = () => {
  const [post, setPost] = useState(initialPost);
  const [isDark, setIsDark] = useState(false);

  const handleCommentAdd = useCallback((postId: string, comment: string) => {
    setPost(prev => ({
      ...prev,
      comments: [...prev.comments, comment],
    }));
  }, []);

  const mockLike = () => console.log('Liked!');
  const mockSave = () => console.log('Saved!');
  const mockShare = () => console.log('Shared!');
  const mockProfileView = (username: string) => console.log(`Viewing profile: ${username}`);
  const mockMore = (id: string) => console.log(`More options for post: ${id}`);

  return (
    <ThemeContext.Provider value={{ isDark }}>
      <View style={[styles.appContainer, { backgroundColor: isDark ? '#0F172A' : '#F1F5F9' }]}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingTop: 40, paddingBottom: 100 }}
        >
          <TouchableOpacity
            onPress={() => setIsDark(prev => !prev)}
            style={[styles.darkModeToggle, { backgroundColor: isDark ? '#334155' : '#7873f5' }]}
          >
            <Ionicons
              name={isDark ? 'sunny-outline' : 'moon-outline'}
              size={24}
              color="#fff"
            />
          </TouchableOpacity>

          <PostCard
            post={post}
            onLike={mockLike}
            onSave={mockSave}
            onShare={mockShare}
            onCommentAdd={handleCommentAdd}
            onProfileView={mockProfileView}
            onMore={mockMore}
          />

          <View style={styles.spacer}>
            <Text style={{ color: isDark ? '#94A3B8' : '#64748B', textAlign: 'center' }}>
              Boshqa postlar shu yerda...
            </Text>
          </View>
        </ScrollView>
      </View>
    </ThemeContext.Provider>
  );
};

export default App;

const styles = StyleSheet.create({
  appContainer: { flex: 1 },
  darkModeToggle: {
    position: 'absolute',
    top: 5,
    right: 20,
    padding: 10,
    borderRadius: 30,
    zIndex: 10,
  },
  cardContainer: {
    marginVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
    marginHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    justifyContent: 'space-between',
  },
  avatar: { width: 44, height: 44, borderRadius: 22, borderColor: '#7873f5', borderWidth: 2 },
  username: { fontWeight: '700', fontSize: 16 },
  category: { fontSize: 12, marginTop: 2, color: '#7873f5' },

  viewCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  viewCountText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },

  followButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginLeft: 10,
    marginRight: 5,
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  followButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },

  imageWrapper: {
    width: '100%',
    height: width * 0.9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: { width: '100%', height: '100%' },
  heartOverlay: { position: 'absolute', justifyContent: 'center', alignItems: 'center' },
  actions: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
  captionWrapper: { paddingHorizontal: 12, paddingBottom: 12 },
  spacer: { padding: 20 },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalKeyboardAvoid: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    height: height * 0.8,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  closeButton: { padding: 5 },

  commentItem: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'flex-start',
  },
  commentAvatar: { width: 30, height: 30, borderRadius: 15, marginTop: 2 },
  commentUser: { fontWeight: '700', fontSize: 14, marginBottom: 2 },
  commentText: { fontSize: 14, lineHeight: 20 },

  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  commentInput: {
    flex: 1,
    borderRadius: 25,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 15,
    marginRight: 10,
  },
  sendButton: {
    borderRadius: 25,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});