import api from "@/config/api";
import { Comment, RelatedVideo } from "@/interfaces/interfaces"; // Comment interfeysi import qilindi
import { useCallback, useEffect, useRef, useState } from "react";
import { Animated } from "react-native";

const useVideoId = (id: string) => {
  const [videoData, setVideoData] = useState<any>(null);
  const [relatedVideos, setRelatedVideos] = useState<RelatedVideo[]>([]);
  const [comments, setComments] = useState<Comment[]>([]); // Yangi state
  const [commentPage, setCommentPage] = useState(1);
  const [commentTotal, setCommentTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false); // Komment yuborish loadingi

  const [isMuted, setIsMuted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isFollow, setIsFollow] = useState<any>(null);
  const [followLoading, setFollowLoading] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [commentInput, setCommentInput] = useState(""); // Input nomi 'comment'dan 'commentInput'ga o'zgartirildi
  const [selectedTab, setSelectedTab] = useState<"comments" | "related">(
    "comments"
  );
  const [likes, setLikes] = useState(0);
  const scrollY = useRef(new Animated.Value(0)).current;

  // --- API chaqiruvlari ---

  const fetchComments = useCallback(async () => {
    try {
      if (id) {
        setCommentLoading(true);
        const response = await api.get(`/comments/post/${id}`, {
          params: { page: commentPage, limit: 10 },
        });
        setComments(response.data.data);
        setCommentTotal(response.data.total);
      }
    } catch (error) {
      console.error("Kommentariyalar yuklash xatosi:", error);
    } finally {
      setCommentLoading(false);
    }
  }, [id, commentPage]);

  const fetchVideoDetail = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/posts/${id}`);
      setVideoData(response.data);
      setLikes(response.data.likes || 0);
      await api.post(`/posts/${id}/view`);
    } catch (error) {
      console.error("Video yuklash xatosi:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedVideos = async () => {
    try {
      const response = await api.get("/posts?page=1&limit=6");
      setRelatedVideos(response.data.data || []);
    } catch (error) {
      console.error("Related videos yuklash xatosi:", error);
    }
  };

  const isFollowingResponse = async () => {
    try {
      const response = await api.get(`/follow/is-follow/${videoData?.userId}`);
      setIsFollow(response.data);
      return response.data;
    } catch (error) {
      console.log("error", error);
    }
  };

  // --- Effect'lar ---

  useEffect(() => {
    if (id) {
      fetchVideoDetail();
      fetchRelatedVideos();
      fetchComments(); // Kommentariyalarni yuklash
    }
  }, [id, fetchComments]);

  useEffect(() => {
    if (videoData?.userId) {
      isFollowingResponse();
    }
  }, [videoData]);

  // --- Handler'lar ---

  const handleLike = async () => {
    try {
      const response = await api.post(`/posts/${id}/like`);
      // Backend toggle like qilsa, current state'ni o'zgartiramiz
      setIsLiked(response.data.liked);
      setLikes(response.data.likes);
    } catch (error) {
      console.error("Like xatosi:", error);
    }
  };

  const handleFollow = async () => {
    if (!videoData?.user?.profile?.username) return;
    try {
      setFollowLoading(true);
      const response = await api.post(
        `/follow/username/${videoData.user.profile.username}`
      );
      setIsFollow(response.data);
      return response.data;
    } catch (error) {
      console.log("error", error);
    } finally {
      setFollowLoading(false);
    }
  };

  const handlePostComment = async () => {
    if (!commentInput.trim() || commentLoading) return;

    try {
      setCommentLoading(true);
      // Backendga yangi komment yuborish
      await api.post("/comments", {
        postId: parseInt(id),
        content: commentInput,
      });

      setCommentInput(""); // Inputni tozalash

      // Yangi komment yuborilgach, ro'yxatni yangilash
      await fetchComments();

      // Kommentlar sonini yangilash
      setVideoData((prev: any) => ({
        ...prev,
        comments: prev.comments + 1,
      }));
    } catch (error) {
      console.error("Komment yuborish xatosi:", error);
    } finally {
      setCommentLoading(false);
    }
  };

  // Kommentga like bosish handler'i
  const handleCommentLike = async (commentId: number) => {
    try {
      const response = await api.post(`/comments/${commentId}/like`);

      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment.id === commentId.toString()
            ? { ...comment, likes: response.data.likes }
            : comment
        )
      );
    } catch (error) {
      console.error("Comment Like xatosi:", error);
    }
  };

  return {
    videoData,
    relatedVideos,
    comments, // Export qilindi
    commentTotal,
    loading,
    commentLoading,
    isMuted,
    setIsMuted,
    isLiked,
    isSaved,
    setIsSaved,
    isFollow,
    followLoading,
    showDescription,
    setShowDescription,
    commentInput, // Input nomi o'zgardi
    setCommentInput,
    selectedTab,
    setSelectedTab,
    likes,
    scrollY,
    handleLike,
    handleFollow,
    handlePostComment, // Export qilindi
    handleCommentLike, // Export qilindi
    fetchVideoDetail,
  };
};

export default useVideoId;
