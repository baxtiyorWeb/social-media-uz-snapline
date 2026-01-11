import { styles } from "@/components/home/home-index-styles";
import api from "@/config/api";
import { useStory } from "@/hooks/home/use-story";
import { Ionicons } from "@expo/vector-icons";
import { ResizeMode, Video } from "expo-av";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
const { width } = Dimensions.get("window");
const CATEGORIES = ["For You", "Trending", "Music", "Gaming", "Food", "Travel"];

export default function Snaps() {
  const {
    stories,
    activeStory,
    currentStoryIndex,
    isAdding,
    progressAnim,
    openStory,
    closeStory,
    handlePickStory,
    handleStoryTap,
  } = useStory();

  const [selectedCategory, setSelectedCategory] = useState("For You");
  const [posts, setPosts] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPosts = useCallback(async () => {
    try {
      setRefreshing(true);
      const res = await api.get("/posts", { params: { page: 1, limit: 20 } });
      setPosts(res.data?.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <BlurView intensity={80} tint="dark" style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerSubtitle}>Discover the</Text>
            <Text style={styles.headerTitle}>Moments</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handlePickStory}
            >
              {isAdding ? (
                <ActivityIndicator color="#6366f1" size="small" />
              ) : (
                <Ionicons name="add-circle" size={28} color="#6366f1" />
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="notifications-outline" size={24} color="#fff" />
              <View style={styles.badge} />
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>

      <FlatList
        data={posts}
        numColumns={2}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.snapCard}
            onPress={() => router.push(`/video/${item.id}`)}
          >
            <Video
              source={{ uri: item.videoUrl }}
              style={StyleSheet.absoluteFill}
              resizeMode={ResizeMode.COVER}
              isMuted
              shouldPlay={false}
              isLooping
            />
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.8)"]}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.snapContent}>
              <Text style={styles.snapCategory}>
                {item.category || "Viral"}
              </Text>
              <Text style={styles.snapUser}>
                @{item.user?.profile?.username}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={() => (
          <>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.storiesContainer}
              contentContainerStyle={styles.storiesContent}
            >
              {stories.map((story) => (
                <TouchableOpacity
                  key={story.id}
                  style={styles.storyWrap}
                  onPress={() => openStory(story)}
                  activeOpacity={0.7}
                >
                  <View style={styles.storyContainer}>
                    <View
                      style={[
                        styles.avatarRing,
                        story.hasStory && styles.ringActive,
                        story.id === "me" && !story.hasStory && styles.ringAdd,
                      ]}
                    >
                      <Image
                        source={{ uri: story.avatar }}
                        style={styles.storyImg}
                      />
                      {story.isLive && (
                        <View style={styles.liveBadge}>
                          <Text style={styles.liveText}>LIVE</Text>
                        </View>
                      )}
                      {story.id === "me" && !story.hasStory && (
                        <View style={styles.addIconContainer}>
                          <Ionicons name="add" size={20} color="#6366f1" />
                        </View>
                      )}
                    </View>
                    {isAdding && story.id === "me" && (
                      <View style={styles.storyLoadingOverlay}>
                        <ActivityIndicator color="#fff" size="small" />
                        <Text style={styles.loadingText}>Uploading...</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.storyName} numberOfLines={1}>
                    {story.user}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.catScroll}
            >
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.catBtn,
                    selectedCategory === cat && styles.catActive,
                  ]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text
                    style={[
                      styles.catLabel,
                      selectedCategory === cat && styles.catLabelActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}
        refreshing={refreshing}
        onRefresh={fetchPosts}
      />

      <Modal
        visible={!!activeStory}
        transparent
        animationType="fade"
        onRequestClose={closeStory}
      >
        <View style={styles.modalContainer}>
          <TouchableWithoutFeedback
            onPress={(e) => handleStoryTap(e.nativeEvent.locationX)}
          >
            <View style={styles.storyImageContainer}>
              <Image
                source={{
                  uri:
                    activeStory?.stories?.[currentStoryIndex]?.content ||
                    activeStory?.avatar,
                }}
                style={styles.fullStoryImage}
                resizeMode="cover"
              />
            </View>
          </TouchableWithoutFeedback>

          <LinearGradient
            colors={[
              "rgba(0,0,0,0.7)",
              "transparent",
              "transparent",
              "rgba(0,0,0,0.7)",
            ]}
            style={styles.storyOverlay}
            pointerEvents="none"
          />

          <View style={styles.progressContainer} pointerEvents="none">
            {activeStory?.stories?.map((_: any, index: number) => (
              <View key={index} style={styles.progressBarBackground}>
                <Animated.View
                  style={[
                    styles.progressBarFill,
                    {
                      width:
                        index < currentStoryIndex
                          ? "100%"
                          : index === currentStoryIndex
                          ? progressAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: ["0%", "100%"],
                            })
                          : "0%",
                    },
                  ]}
                />
              </View>
            ))}
          </View>

          <View style={styles.storyModalHeader} pointerEvents="box-none">
            <View style={styles.storyUserInfo}>
              <Image
                source={{ uri: activeStory?.avatar }}
                style={styles.storyAvatarSmall}
              />
              <View>
                <Text style={styles.storyUserTitle}>{activeStory?.user}</Text>
                <Text style={styles.storyTimestamp}>
                  {activeStory?.stories?.[currentStoryIndex]?.timestamp}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={closeStory}
              style={styles.closeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.storyFooter} pointerEvents="box-none">
            <TouchableOpacity style={styles.replyInput} activeOpacity={0.8}>
              <Ionicons name="chatbubble-outline" size={20} color="#999" />
              <Text style={styles.replyPlaceholder}>Send message...</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="heart-outline" size={26} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="paper-plane-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
