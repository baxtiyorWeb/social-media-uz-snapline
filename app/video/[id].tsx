import { renderRelatedVideo } from "@/components/video/related-video";
import { renderComment } from "@/components/video/render-comments";
import { styles } from "@/components/video/video-styles";
import api from "@/config/api";
import useVideoId from "@/hooks/video-id/use-video-id";
import { Comment } from "@/interfaces/interfaces";
import { Ionicons } from "@expo/vector-icons";
import { ResizeMode, Video } from "expo-av";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const MOCK_COMMENTS: Comment[] = [
  {
    id: "1",
    user: "sarah_m",
    avatar: "https://i.pravatar.cc/150?img=30",
    text: "This is absolutely incredible! The production quality is insane 🔥",
    likes: 245,
    timeAgo: "2h",
    replies: [
      {
        id: "1-1",
        user: "creator_1",
        avatar: "https://i.pravatar.cc/150?img=10",
        text: "Thank you so much! 🙏 Appreciate the love",
        likes: 12,
        timeAgo: "1h",
      },
    ],
  },
];

export default function VideoDetailScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const {
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
  } = useVideoId(params.id as string);

  const handleMessage = async () => {
    if (!videoData || !videoData.userId) return; // to'g'ri shart

    try {
      const response = await api.post("/chat/create", {
        isGroup: false,
        participantIds: [videoData.userId], // backend bilan mos
      });

      const chat = response.data;

      router.push(
        `/chat/${chat.id}?user=${videoData.user?.profile?.username}&avatar=${videoData.user?.profile?.avatar}&online=true&userId=${videoData.userId}`
      );
    } catch (error: any) {
      console.error(
        "Chat yaratishda xatolik:",
        error.response?.data || error.message
      );
    }
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5e5ce6" />
      </View>
    );
  }

  if (!videoData) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons
          name="alert-circle-outline"
          size={48}
          color="rgba(255,255,255,0.5)"
        />
        <Text style={styles.errorText}>Video topilmadi</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <BlurView intensity={90} tint="dark" style={styles.headerBlur}>
          <TouchableOpacity
            style={styles.headerBackButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {videoData.caption}
          </Text>
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
        <View style={styles.videoContainer}>
          <Video
            source={{ uri: videoData.videoUrl }}
            style={styles.videoPlayer}
            resizeMode={ResizeMode.COVER}
            isLooping
            shouldPlay
            isMuted={isMuted}
          />

          <LinearGradient
            colors={["rgba(0,0,0,0.3)", "transparent"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.videoGradient}
          />

          <View style={styles.videoTopControls}>
            <TouchableOpacity
              style={styles.videoControlBtn}
              onPress={() => router.back()}
            >
              <BlurView
                intensity={70}
                tint="dark"
                style={styles.controlBtnBlur}
              >
                <Ionicons name="chevron-back" size={24} color="#fff" />
              </BlurView>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.videoControlBtn}
              onPress={() => setIsMuted(!isMuted)}
            >
              <BlurView
                intensity={70}
                tint="dark"
                style={styles.controlBtnBlur}
              >
                <Ionicons
                  name={isMuted ? "volume-mute" : "volume-high"}
                  size={22}
                  color="#fff"
                />
              </BlurView>
            </TouchableOpacity>
          </View>

          <View style={styles.videoBottomInfo}>
            <View style={styles.categoryTag}>
              <Text style={styles.categoryTagText}>
                {videoData.category || "Video"}
              </Text>
            </View>
            <View style={styles.viewsTag}>
              <Ionicons name="eye" size={14} color="#5e5ce6" />
              <Text style={styles.viewsText}>{videoData.views || 0} views</Text>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.titleSection}>
            <Text style={styles.videoTitle}>{videoData.caption}</Text>
          </View>

          <View style={styles.userCard}>
            <View style={styles.userContent}>
              <Image
                source={{ uri: videoData.user.profile?.avatar }}
                style={styles.userAvatar}
              />
              <View style={styles.userInfo}>
                <Text style={styles.userName}>
                  @{videoData.user.profile?.username}
                </Text>
                <Text style={styles.userRealName}>
                  {videoData.user.profile?.firstName}{" "}
                  {videoData.user.profile?.lastName}
                </Text>
              </View>
            </View>

            <View style={styles.userActions}>
              <TouchableOpacity
                style={[
                  styles.followButton,
                  isFollow?.isFollowing && styles.followingButton,
                ]}
                onPress={handleFollow}
                disabled={followLoading}
              >
                {followLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons
                      name={isFollow?.isFollowing ? "checkmark" : "person-add"}
                      size={16}
                      color="#fff"
                    />
                    <Text style={styles.followButtonText}>
                      {isFollow?.isFollowing ? "Following" : "Follow"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.messageButton}
                onPress={handleMessage}
              >
                <Ionicons name="chatbubble-outline" size={18} color="#5e5ce6" />
              </TouchableOpacity>
            </View>
          </View>

          {videoData.description && (
            <View style={styles.descriptionSection}>
              <TouchableOpacity
                onPress={() => setShowDescription(!showDescription)}
              >
                <Text
                  style={styles.videoDescription}
                  numberOfLines={showDescription ? undefined : 2}
                >
                  {videoData.description}
                </Text>
                <Text style={styles.showMoreText}>
                  {showDescription ? "− Show less" : "+ Show more"}
                </Text>
              </TouchableOpacity>
            </View>
          )}

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

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                isLiked && styles.actionButtonActive,
              ]}
              onPress={handleLike}
            >
              <Ionicons
                name={isLiked ? "heart" : "heart-outline"}
                size={26}
                color={isLiked ? "#ff3b5c" : "#fff"}
              />
              <Text style={styles.actionLabel}>Like</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setSelectedTab("comments")}
            >
              <Ionicons name="chatbubble-outline" size={26} color="#fff" />
              <Text style={styles.actionLabel}>Comment</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="share-social-outline" size={26} color="#fff" />
              <Text style={styles.actionLabel}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                isSaved && styles.actionButtonActive,
              ]}
              onPress={() => setIsSaved(!isSaved)}
            >
              <Ionicons
                name={isSaved ? "bookmark" : "bookmark-outline"}
                size={26}
                color={isSaved ? "#ffd700" : "#fff"}
              />
              <Text style={styles.actionLabel}>Save</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                selectedTab === "comments" && styles.activeTab,
              ]}
              onPress={() => setSelectedTab("comments")}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedTab === "comments" && styles.activeTabText,
                ]}
              >
                Comments
              </Text>
              {selectedTab === "comments" && (
                <View style={styles.tabIndicator} />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                selectedTab === "related" && styles.activeTab,
              ]}
              onPress={() => setSelectedTab("related")}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedTab === "related" && styles.activeTabText,
                ]}
              >
                Related
              </Text>
              {selectedTab === "related" && (
                <View style={styles.tabIndicator} />
              )}
            </TouchableOpacity>
          </View>

          {selectedTab === "comments" ? (
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
                  <Ionicons
                    name="chatbubbles-outline"
                    size={40}
                    color="rgba(255,255,255,0.3)"
                  />
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
                  <Ionicons
                    name="film-outline"
                    size={40}
                    color="rgba(255,255,255,0.3)"
                  />
                  <Text style={styles.emptyStateText}>No related videos</Text>
                </View>
              )}
            </View>
          )}
          <View style={{ height: 100 }} />
        </View>
      </Animated.ScrollView>

      <BlurView
        intensity={100}
        tint="dark"
        style={styles.commentInputContainer}
      >
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
          style={[
            styles.sendButton,
            !comment.trim() && styles.sendButtonDisabled,
          ]}
          disabled={!comment.trim()}
        >
          <Ionicons name="send" size={18} color="#fff" />
        </TouchableOpacity>
      </BlurView>
    </View>
  );
}
