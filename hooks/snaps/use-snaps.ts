import { Post } from "@/interfaces/interfaces";
import { useCallback, useRef, useState } from "react";
import { Dimensions, FlatList } from "react-native";

const { height } = Dimensions.get("window");

const MOCK_POSTS: Post[] = Array.from({ length: 10 }).map((_, idx) => ({
  id: `post${idx + 1}`,
  username: `creator_${idx + 1}`,
  avatar: `https://i.pravatar.cc/150?img=${idx + 20}`,
  mediaUrl: `https://picsum.photos/1080/1920?random=${idx + 300}`,
  caption: [
    "Living my best life 🌟",
    "New day, new adventures ✨",
    "Chasing dreams and sunsets 🌅",
    "Creating magic everyday 🎨",
    "Just vibing 🎵",
    "Life is beautiful 🌸",
    "Making memories 📸",
    "Stay positive ☀️",
  ][idx % 8],
  likes: Math.floor(Math.random() * 50000 + 1000),
  comments: Math.floor(Math.random() * 500 + 50),
  shares: Math.floor(Math.random() * 200 + 10),
  isLiked: false,
  isSaved: false,
  isFollowing: idx % 3 !== 0,
  song: `Song ${idx + 1} • Artist ${idx + 1}`,
  location: ["New York", "Los Angeles", "Tokyo", "Paris", "London"][idx % 5],
}));

export const useFeed = () => {
  const [posts, setPosts] = useState(MOCK_POSTS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");
  const flatListRef = useRef<FlatList<Post>>(null);

  const formatNumber = useCallback((num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  }, []);

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

  const handleShare = useCallback((post: Post) => {
    console.log("Share:", post.id);
  }, []);

  const sendComment = useCallback(() => {
    if (comment.trim()) {
      console.log("Comment:", comment);
      setComment("");
      setShowComments(false);
    }
  }, [comment]);

  const onScrollEnd = useCallback((e: any) => {
    const index = Math.round(e.nativeEvent.contentOffset.y / height);
    setCurrentIndex(index);
  }, []);

  const getItemLayout = useCallback(
    (data: any, index: number) => ({
      length: height + 50,
      offset: (height + 50) * index,
      index,
    }),
    []
  );

  return {
    posts,
    currentIndex,
    showComments,
    comment,
    flatListRef,

    setShowComments,
    setComment,

    formatNumber,
    handleLike,
    handleSave,
    handleFollow,
    handleShare,
    sendComment,
    onScrollEnd,
    getItemLayout,
  };
};
