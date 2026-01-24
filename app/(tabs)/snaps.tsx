import { Ionicons } from "@expo/vector-icons";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetFlatList,
} from "@gorhom/bottom-sheet";
import { ResizeMode, Video } from "expo-av";
import React, { memo, useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { Post } from "@/interfaces/interfaces";
import { styles } from "../../hooks/snaps/styles";
import { useFeed } from "../../hooks/snaps/use-snaps";

const { height: SCREEN_HEIGHT } = Dimensions.get("screen");

const ReplyItem = memo(({ reply }: { reply: any }) => (
  <View key={reply.id} style={styles.replyItem}>
    <Image source={{ uri: reply.avatar }} style={styles.replyAvatar} />
    <View style={styles.replyTextContainer}>
      <Text style={styles.replyUsername}>{reply.username}</Text>
      <Text style={styles.replyContent}>{reply.text}</Text>
      <Text style={styles.replyTime}>{reply.time}</Text>
    </View>
  </View>
));

const CommentItem = memo(
  ({ item, onLike }: { item: any; onLike: (id: string) => void }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handleLikePress = () => {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.3,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
      onLike(item.id);
    };

    return (
      <View style={styles.commentItem}>
        <Image source={{ uri: item.avatar }} style={styles.commentUserAvatar} />
        <View style={styles.commentTextContainer}>
          <Text style={styles.commentUsername}>{item.username}</Text>
          <Text style={styles.commentContent}>{item.text}</Text>
          <View style={styles.commentFooter}>
            <Text style={styles.commentTime}>{item.time}</Text>
            <TouchableOpacity>
              <Text style={styles.replyText}>Reply</Text>
            </TouchableOpacity>
          </View>
          {item.replies?.length > 0 && (
            <View style={styles.repliesContainer}>
              {item.replies.map((reply: any) => (
                <ReplyItem key={reply.id} reply={reply} />
              ))}
            </View>
          )}
        </View>
        <TouchableOpacity
          style={styles.commentLikeContainer}
          onPress={handleLikePress}
        >
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <Ionicons
              name={item.isLiked ? "heart" : "heart-outline"}
              size={20}
              color={item.isLiked ? "#ff3b5c" : "#888"}
            />
          </Animated.View>
          <Text style={styles.commentLikeCount}>{item.likes}</Text>
        </TouchableOpacity>
      </View>
    );
  }
);

export default function HomeScreen() {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["65%", "95%"], []);
  const videoRefs = useRef<{ [key: string]: Video | null }>({});
  const [currentVisibleIndex, setCurrentVisibleIndex] = useState(0);
  const [comments, setComments] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);

  const {
    posts,
    currentIndex,
    comment,
    flatListRef,
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
  } = useFeed();

  // Video autoplay
  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const index = viewableItems[0].index;
      setCurrentVisibleIndex(index);

      viewableItems.forEach((item: any) => {
        const video = videoRefs.current[item.item.id];
        if (video) {
          if (item.index === index) video.playAsync();
          else video.pauseAsync();
        }
      });
    }
  }).current;

  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 80 });

  const handleOpenComments = useCallback(async () => {
    bottomSheetRef.current?.expand();
    const currentPostId = parseInt(posts[currentIndex]?.id);
    if (isNaN(currentPostId)) return;

    setLoadingComments(true);
    try {
      const fetchedComments = await loadComments(currentPostId);
      setComments(fetchedComments);
    } catch (error) {
      console.error("Comments yuklashda xatolik:", error);
    } finally {
      setLoadingComments(false);
    }
  }, [currentIndex, posts, loadComments]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.7}
      />
    ),
    []
  );

  const handleCommentLikePress = useCallback(
    (commentId: string) => {
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? {
                ...c,
                isLiked: !c.isLiked,
                likes: c.isLiked ? c.likes - 1 : c.likes + 1,
              }
            : c
        )
      );
      handleCommentLike(commentId);
    },
    [handleCommentLike]
  );

  const handleSendComment = () => {
    if (comment.trim() && posts[currentIndex]) {
      const newComment = {
        id: Date.now().toString(),
        username: "current_user",
        text: comment,
        likes: 0,
        time: "now",
        avatar: posts[currentIndex]?.avatar || "https://picsum.photos/200",
        isLiked: false,
        replies: [],
      };
      setComments([newComment, ...comments]);
      sendComment(comment);
      setComment("");
    }
  };

  const renderPost = useCallback(
    ({ item, index }: { item: Post; index: number }) => (
      <View style={[styles.postContainer, { height: SCREEN_HEIGHT }]}>
        <Video
          ref={(ref: any) => (videoRefs.current[item.id] = ref)}
          source={{ uri: item.mediaUrl }}
          style={styles.media}
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay={index === currentVisibleIndex}
          isLooping
        />

        
        <View style={styles.gradientTop} />
        <View style={styles.gradientBottom} />

        <View style={styles.rightSidebar}>
          <View style={styles.avatarWrapper}>
            <Image source={{ uri: item.avatar }} style={styles.sidebarAvatar} />
            <TouchableOpacity
              style={styles.followButton}
              onPress={() => handleFollow(item.id)}
            >
              <Ionicons name="add" size={14} color="#fff" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.sidebarIconBtn}
            onPress={() => handleLike(item.id)}
          >
            <Ionicons
              name="heart"
              size={38}
              color={item.isLiked ? "#ff3b5c" : "#fff"}
            />
            <Text style={styles.sidebarIconText}>
              {formatNumber(item.likes)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sidebarIconBtn}
            onPress={handleOpenComments}
          >
            <Ionicons name="chatbubble-ellipses" size={34} color="#fff" />
            <Text style={styles.sidebarIconText}>
              {formatNumber(item.comments)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sidebarIconBtn}
            onPress={() => handleSave(item.id)}
          >
            <Ionicons
              name="bookmark"
              size={32}
              color={item.isSaved ? "#ffd700" : "#fff"}
            />
            <Text style={styles.sidebarIconText}>Save</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sidebarIconBtn}
            onPress={() => handleShare(item)}
          >
            <Ionicons name="share-social" size={32} color="#fff" />
            <Text style={styles.sidebarIconText}>Share</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomContent}>
          <Text style={styles.userText}>@{item.username}</Text>
          <Text style={styles.captionText} numberOfLines={2}>
            {item.caption}
          </Text>
          <View style={styles.musicContainer}>
            <Ionicons name="musical-note" size={15} color="#fff" />
            <Text style={styles.musicText} numberOfLines={1}>
              {item.song || "Original Audio"}
            </Text>
          </View>
        </View>
      </View>
    ),
    [
      currentVisibleIndex,
      handleFollow,
      handleLike,
      handleOpenComments,
      handleSave,
      handleShare,
      formatNumber,
    ]
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#000" }}>
        <StatusBar
          barStyle="light-content"
          translucent
          backgroundColor="transparent"
        />

        <FlatList
          ref={flatListRef}
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          snapToInterval={SCREEN_HEIGHT}
          snapToAlignment="start"
          decelerationRate="fast"
          getItemLayout={getItemLayout}
          onMomentumScrollEnd={onScrollEnd}
          removeClippedSubviews
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewConfigRef.current}
        />

        <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          snapPoints={snapPoints}
          enablePanDownToClose
          android_keyboardInputMode="adjustPan"
          backdropComponent={renderBackdrop}
          handleIndicatorStyle={{ backgroundColor: "#555", width: 45 }}
          backgroundStyle={{
            backgroundColor: "#181818",
            borderTopLeftRadius: 25,
            borderTopRightRadius: 25,
          }}
        >
          <View style={styles.commentHeader}>
            <Text style={styles.commentHeaderTitle}>
              Comments ({comments.length})
            </Text>
          </View>

          {loadingComments ? (
            <View style={{ padding: 20, alignItems: "center" }}>
              <ActivityIndicator size="large" color="#ff3b5c" />
            </View>
          ) : (
            <BottomSheetFlatList
              data={comments}
              keyExtractor={(item: { id: number }) => item.id}
              renderItem={({ item }: any) => (
                <CommentItem item={item} onLike={handleCommentLikePress} />
              )}
              contentContainerStyle={{
                paddingHorizontal: 16,
                paddingBottom: 120,
              }}
              ListEmptyComponent={
                <View style={{ padding: 20, alignItems: "center" }}>
                  <Text style={{ color: "#666" }}>No comments yet</Text>
                </View>
              }
            />
          )}
        </BottomSheet>

        <View style={styles.inputWrapper}>
          <View style={styles.inputContainer}>
            <Image
              source={{
                uri: posts[currentIndex]?.avatar || "https://picsum.photos/32",
              }}
              style={styles.smallAvatar}
            />
            <TextInput
              style={styles.textInput}
              placeholder="Add a comment..."
              placeholderTextColor="#666"
              value={comment}
              onChangeText={setComment}
              multiline
              onFocus={handleOpenComments}
            />
            <TouchableOpacity
              onPress={handleSendComment}
              disabled={!comment.trim()}
              style={[styles.sendBtn, !comment.trim() && { opacity: 0.5 }]}
            >
              <Ionicons name="arrow-up" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </GestureHandlerRootView>
    </KeyboardAvoidingView>
  );
}
