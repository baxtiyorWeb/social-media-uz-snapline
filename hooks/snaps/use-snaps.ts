import api from "@/config/api";
import { Post } from "@/interfaces/interfaces";
import { useCallback, useEffect, useRef, useState } from "react";
import { Dimensions, FlatList } from "react-native";

const { height } = Dimensions.get("window");

// ============================================
// API FUNKSIYALARI (HOOK ICHIDA)
// ============================================

/**
 * Feed postlarini olish
 */
async function fetchFeedPosts(
  page: number,
  limit: number,
  category?: string
): Promise<Post[]> {
  try {
    const response = await api.get("/posts", {
      params: { page, limit, category },
    });

    
    const rawData = response.data?.data || [];
    return rawData.map((item: any) => ({
      id: item.id?.toString() || "",
      username:
        item.user?.username || item.user?.profile?.username || "unknown",
      avatar: item.user?.profile?.avatar || "https://picsum.photos/200",
      mediaUrl:
        item.videoUrl || item.videoUrl || "https://picsum.photos/1080/1920",
      caption: item.caption || item.description || "",
      song: item.song || item.music || "Original Audio",
      likes: item.likes || 0,
      comments: item.comments || 0,
      shares: item.shares || 0,
      isLiked: false, // Default false, keyinchalik API'dan olish mumkin
      isSaved: false,
      isFollowing: false,
    }));
  } catch (error) {
    console.error("Feed olishda xatolik:", error);
    return [];
  }
}

/**
 * Post like/unlike
 */
async function togglePostLike(
  postId: number
): Promise<{ liked: boolean; likes: number }> {
  try {
    const response = await api.post(`/posts/${postId}/like`);
    return {
      liked: response.data?.liked ?? false,
      likes: response.data?.likes ?? 0,
    };
  } catch (error) {
    console.error("Like xatolik:", error);
    throw error;
  }
}

/**
 * Comment yaratish
 */
async function createComment(postId: number, content: string): Promise<any> {
  try {
    const response = await api.post("/comments", { postId, content });
    return response.data;
  } catch (error) {
    console.error("Comment yaratishda xatolik:", error);
    throw error;
  }
}

/**
 * Commentlarni olish
 */
async function fetchCommentsByPost(
  postId: number,
  page: number = 1,
  limit: number = 20
): Promise<any[]> {
  try {
    const response = await api.get(`/comments/post/${postId}`, {
      params: { page, limit },
    });

    const rawData = response.data?.data || response.data || [];

    return rawData.map((item: any) => ({
      id: item.id?.toString() || Date.now().toString(),
      username:
        item.user?.username || item.user?.profile?.username || "unknown",
      text: item.content || "",
      likes: item.likes || 0,
      time: formatTime(item.createdAt),
      avatar: item.user?.profile?.avatar || "https://picsum.photos/100",
      isLiked: false,
      replies:
        item.replies?.map((reply: any) => ({
          id: reply.id?.toString() || Date.now().toString(),
          username: reply.user?.username || "unknown",
          text: reply.content || "",
          time: formatTime(reply.createdAt),
          avatar: reply.user?.profile?.avatar || "https://picsum.photos/100",
        })) || [],
    }));
  } catch (error) {
    console.error("Commentlar olishda xatolik:", error);
    return [];
  }
}

/**
 * Comment like/unlike
 */
async function toggleCommentLike(
  commentId: number
): Promise<{ liked: boolean; likes: number }> {
  try {
    const response = await api.post(`/comments/${commentId}/like`);
    return {
      liked: response.data?.liked ?? false,
      likes: response.data?.likes ?? 0,
    };
  } catch (error) {
    console.error("Comment like xatolik:", error);
    throw error;
  }
}

// Vaqtni formatlash helper
function formatTime(dateString?: string): string {
  if (!dateString) return "now";

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "now";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  return `${diffDays}d`;
}

// ============================================
// MAIN HOOK
// ============================================

export const useFeed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [comment, setComment] = useState("");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const flatListRef = useRef<FlatList<Post>>(null);

  // Rate limiting uchun
  const lastRequestTime = useRef<number>(0);
  const REQUEST_DELAY = 500; // 500ms

  const loadPosts = useCallback(
    async (isInitial: boolean = false) => {
      if (isLoading || (!hasMore && !isInitial)) return;

      // Rate limiting
      const now = Date.now();
      if (now - lastRequestTime.current < REQUEST_DELAY) {
        console.log("Too many requests, waiting...");
        return;
      }
      lastRequestTime.current = now;

      setIsLoading(true);
      const nextPage = isInitial ? 1 : page;

      try {
        const newPosts = await fetchFeedPosts(nextPage, 5);

        if (newPosts.length === 0) {
          setHasMore(false);
        } else {
          setPosts((prev) => (isInitial ? newPosts : [...prev, ...newPosts]));
          setPage(nextPage + 1);
        }
      } catch (error) {
        console.error("Posts yuklashda xatolik:", error);
        // 429 xatolikda biroz kutamiz
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, hasMore, page]
  );

  useEffect(() => {
    loadPosts(true);
  }, []); // Faqat birinchi render'da ishga tushadi

  const formatNumber = useCallback((num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  }, []);

  const handleLike = useCallback(async (id: string) => {
    const postId = parseInt(id);
    if (isNaN(postId)) return;

    // Optimistic Update
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, isLiked: !p.isLiked, likes: p.likes + (p.isLiked ? -1 : 1) }
          : p
      )
    );

    try {
      const result = await togglePostLike(postId);

      setPosts((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, isLiked: result.liked, likes: result.likes } : p
        )
      );
    } catch (error) {
      console.error("Like xatolik:", error);
      // Rollback
      setPosts((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                isLiked: !p.isLiked,
                likes: p.likes + (p.isLiked ? 1 : -1),
              }
            : p
        )
      );
    }
  }, []);

  const handleSave = useCallback((id: string) => {
    // Hozircha faqat local state
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isSaved: !p.isSaved } : p))
    );
  }, []);

  const handleFollow = useCallback((id: string) => {
    // Hozircha faqat local state
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isFollowing: !p.isFollowing } : p))
    );
  }, []);

  const handleShare = useCallback((post: Post) => {
    console.log("Share:", post.id);
  }, []);

  const sendComment = useCallback(
    async (commentText: string) => {
      const currentPostId = parseInt(posts[currentIndex]?.id);
      if (!commentText.trim() || isNaN(currentPostId)) return;

      try {
        await createComment(currentPostId, commentText);

        setPosts((prev) =>
          prev.map((p, index) =>
            index === currentIndex ? { ...p, comments: p.comments + 1 } : p
          )
        );
      } catch (error) {
        console.error("Comment yuborishda xatolik:", error);
      }
    },
    [currentIndex, posts]
  );

  const onScrollEnd = useCallback(
    (e: any) => {
      const index = Math.round(e.nativeEvent.contentOffset.y / height);
      setCurrentIndex(index);

      // Oxirgi 3 ta postga yetganda yangi postlar yuklaymiz
      if (index >= posts.length - 3 && hasMore && !isLoading) {
        loadPosts();
      }
    },
    [posts.length, hasMore, isLoading, loadPosts]
  );

  const getItemLayout = useCallback(
    (_data: any, index: number) => ({
      length: height,
      offset: height * index,
      index,
    }),
    []
  );

  // Comments uchun funksiyalar
  const loadComments = useCallback(async (postId: number) => {
    try {
      return await fetchCommentsByPost(postId);
    } catch (error) {
      console.error("Comments yuklashda xatolik:", error);
      return [];
    }
  }, []);

  const handleCommentLike = useCallback(async (commentId: string) => {
    const id = parseInt(commentId);
    if (isNaN(id)) return;

    try {
      await toggleCommentLike(id);
    } catch (error) {
      console.error("Comment like xatolik:", error);
    }
  }, []);

  return {
    posts,
    currentIndex,
    comment,
    flatListRef,
    isLoading,

    setComment,

    formatNumber,
    handleLike,
    handleSave,
    handleFollow,
    handleShare,
    sendComment,
    onScrollEnd,
    getItemLayout,
    loadComments,
    handleCommentLike,
  };
};
