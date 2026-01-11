import { Post } from "@/interfaces/interfaces";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React from "react";
import {
  FlatList,
  Image,
  ListRenderItem,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { styles } from "../../hooks/snaps/styles";
import { useFeed } from "../../hooks/snaps/use-snaps";

export default function HomeScreen() {
  const {
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
  } = useFeed();

  const renderPost: ListRenderItem<Post> = ({ item, index }) => {
    const isActive = index === currentIndex;
    const blurIntensity = isActive ? 0 : 10;

    return (
      <View style={styles.postContainer}>
        <Image
          source={{ uri: item.mediaUrl }}
          style={styles.media}
          blurRadius={blurIntensity}
        />

        <View style={styles.gradientTop} />
        <View style={styles.gradientBottom} />

        <View style={styles.topBar}>
          <BlurView intensity={60} tint="dark" style={styles.topBarLogoBlur}>
            <TouchableOpacity style={styles.logoButton}>
              <Text style={styles.logoText}>Snappy</Text>
            </TouchableOpacity>
          </BlurView>

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

        <View style={styles.bottomSection}>
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

          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleLike(item.id)}
            >
              <Ionicons
                name={item.isLiked ? "heart" : "heart-outline"}
                size={28}
                color={item.isLiked ? "#ff3b5c" : "#fff"}
              />
              <Text style={styles.actionText}>{formatNumber(item.likes)}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowComments(true)}
            >
              <Ionicons name="chatbubble-outline" size={28} color="#fff" />
              <Text style={styles.actionText}>
                {formatNumber(item.comments)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleShare(item)}
            >
              <Ionicons name="share-social-outline" size={28} color="#fff" />
              <Text style={styles.actionText}>{formatNumber(item.shares)}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleSave(item.id)}
            >
              <Ionicons
                name={item.isSaved ? "bookmark" : "bookmark-outline"}
                size={28}
                color={item.isSaved ? "#ffd700" : "#fff"}
              />
            </TouchableOpacity>
          </View>
        </View>

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

        {showComments && isActive && (
          <BlurView intensity={80} tint="dark" style={styles.commentsModal}>
            <View style={styles.commentsHeader}>
              <Text style={styles.commentsTitle}>Comments</Text>
              <TouchableOpacity onPress={() => setShowComments(false)}>
                <Ionicons name="close" size={28} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.commentsContent}>
              <Text style={styles.noComments}>No comments yet</Text>
              <Text style={styles.noCommentsSubtitle}>
                Be the first to comment!
              </Text>
            </View>

            <View style={styles.commentInputContainer}>
              <Image
                source={{ uri: item.avatar }}
                style={styles.commentAvatar}
              />
              <TextInput
                style={styles.commentInput}
                placeholder="Add a comment..."
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={comment}
                onChangeText={setComment}
                multiline
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  !comment.trim() && styles.sendButtonDisabled,
                ]}
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
        onMomentumScrollEnd={onScrollEnd}
        getItemLayout={getItemLayout}
      />
    </View>
  );
}
