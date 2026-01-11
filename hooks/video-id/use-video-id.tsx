import api from "@/config/api";
import { RelatedVideo } from "@/interfaces/interfaces";
import { useEffect, useRef, useState } from "react";
import { Animated } from "react-native";

const useVideoId = (id: string) => {
  const [videoData, setVideoData] = useState<any>(null);
  const [relatedVideos, setRelatedVideos] = useState<RelatedVideo[]>([]);
  const [loading, setLoading] = useState(true);

  const [isMuted, setIsMuted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isFollow, setIsFollow] = useState<any>(null);
  const [followLoading, setFollowLoading] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [comment, setComment] = useState("");
  const [selectedTab, setSelectedTab] = useState<"comments" | "related">(
    "comments"
  );
  const [likes, setLikes] = useState(0);
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (id) {
      fetchVideoDetail();
      fetchRelatedVideos();
    }
  }, [id]);

  useEffect(() => {
    if (videoData?.userId) {
      isFollowingResponse();
    }
  }, [videoData]);

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

  const handleLike = async () => {
    try {
      const response = await api.post(`/posts/${id}/like`);
      setIsLiked(!isLiked);
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

  const isFollowingResponse = async () => {
    try {
      const response = await api.get(`/follow/is-follow/${videoData?.userId}`);
      setIsFollow(response.data);
      return response.data;
    } catch (error) {
      console.log("error", error);
    }
  };

  return {
    videoData,
    relatedVideos,
    loading,
    isMuted,
    setIsMuted,
    isLiked,
    isSaved,
    setIsSaved,
    isFollow,
    followLoading,
    showDescription,
    setShowDescription,
    comment,
    setComment,
    selectedTab,
    setSelectedTab,
    likes,
    scrollY,
    handleLike,
    handleFollow,
    fetchVideoDetail,
  };
};

export default useVideoId;
