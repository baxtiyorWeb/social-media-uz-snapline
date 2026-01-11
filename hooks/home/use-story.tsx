import * as ImagePicker from "expo-image-picker";
import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Dimensions } from "react-native";

const { width } = Dimensions.get("window");
const STORY_DURATION = 5000;

const initialStories = [
  {
    id: "me",
    user: "You",
    avatar: "https://i.pravatar.cc/150?u=me",
    hasStory: false,
    stories: [] as any[],
  },
  {
    id: "1",
    user: "Sarah",
    avatar: "https://i.pravatar.cc/150?u=1",
    hasStory: true,
    isLive: true,
    stories: [
      {
        id: "s1",
        type: "image",
        content: "https://images.unsplash.com/photo-1517841905240-472988babdf9",
        timestamp: "2h ago",
      },
      {
        id: "s2",
        type: "image",
        content: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
        timestamp: "1h ago",
      },
    ],
  },
  {
    id: "2",
    user: "Mike",
    avatar: "https://i.pravatar.cc/150?u=2",
    hasStory: true,
    stories: [
      {
        id: "s3",
        type: "image",
        content: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
        timestamp: "3h ago",
      },
    ],
  },
  {
    id: "3",
    user: "Emma",
    avatar: "https://i.pravatar.cc/150?u=3",
    hasStory: true,
    stories: [
      {
        id: "s4",
        type: "image",
        content: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
        timestamp: "5h ago",
      },
    ],
  },
];

export const useStory = () => {
  const [stories, setStories] = useState(initialStories);
  const [isAdding, setIsAdding] = useState(false);
  const [activeStory, setActiveStory] = useState<any>(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const progressAnimRef = useRef<Animated.CompositeAnimation | null>(null);

  const startStoryProgress = useCallback(
    (duration: number) => {
      progressAnim.setValue(0);
      progressAnimRef.current?.stop();

      progressAnimRef.current = Animated.timing(progressAnim, {
        toValue: 1,
        duration: duration,
        useNativeDriver: false,
      });

      progressAnimRef.current.start(({ finished }) => {
        if (finished) {
          nextStory();
        }
      });
    },
    [progressAnim]
  );

  const closeStory = useCallback(() => {
    progressAnimRef.current?.stop();
    setActiveStory(null);
    setCurrentStoryIndex(0);
    progressAnim.setValue(0);
  }, [progressAnim]);
  const handlePickStory = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Kechirasiz, ruxsat berilmagan!");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [9, 16],
      quality: 1,
    });

    if (!result.canceled) {
      setIsAdding(true);

      setTimeout(() => {
        const newStory = {
          id: `s${Date.now()}`,
          type: "image",
          content: result.assets[0].uri,
          timestamp: "Just now",
        };

        setStories((prev) =>
          prev.map((s) =>
            s.id === "me"
              ? {
                  ...s,
                  avatar: result.assets[0].uri,
                  hasStory: true,
                  stories: [...(s.stories || []), newStory],
                }
              : s
          )
        );
        setIsAdding(false);
      }, 1500);
    }
  }, []);

  const nextStory = useCallback(() => {
    if (!activeStory) return;
    progressAnimRef.current?.stop();

    if (currentStoryIndex < activeStory.stories.length - 1) {
      const nextIndex = currentStoryIndex + 1;
      setCurrentStoryIndex(nextIndex);
      startStoryProgress(STORY_DURATION);
    } else {
      const currentUserIndex = stories.findIndex(
        (s) => s.id === activeStory.id
      );
      const nextUser = stories[currentUserIndex + 1];

      if (nextUser && nextUser.hasStory) {
        openStory(nextUser, 0);
      } else {
        closeStory();
      }
    }
  }, [activeStory, currentStoryIndex, stories, startStoryProgress, closeStory]);

  const previousStory = useCallback(() => {
    if (!activeStory) return;
    progressAnimRef.current?.stop();

    if (currentStoryIndex > 0) {
      const prevIndex = currentStoryIndex - 1;
      setCurrentStoryIndex(prevIndex);
      startStoryProgress(STORY_DURATION);
    } else {
      const currentUserIndex = stories.findIndex(
        (s) => s.id === activeStory.id
      );
      const previousUser = stories[currentUserIndex - 1];

      if (previousUser && previousUser.hasStory) {
        openStory(previousUser, previousUser.stories.length - 1);
      } else {
        setCurrentStoryIndex(0);
        startStoryProgress(STORY_DURATION);
      }
    }
  }, [activeStory, currentStoryIndex, stories, startStoryProgress]);

  const openStory = useCallback(
    (story: any, index: number = 0) => {
      if (!story.hasStory && story.id === "me") {
        handlePickStory();
        return;
      }
      if (!story.hasStory) return;

      setActiveStory(story);
      setCurrentStoryIndex(index);
      startStoryProgress(STORY_DURATION);
    },
    [handlePickStory, startStoryProgress]
  );

  const handleStoryTap = useCallback(
    (x: number) => {
      const halfWidth = width / 2;
      progressAnimRef.current?.stop();
      if (x < halfWidth) {
        previousStory();
      } else {
        nextStory();
      }
    },
    [previousStory, nextStory]
  );

  useEffect(() => {
    if (activeStory) {
      startStoryProgress(STORY_DURATION);
    }
    return () => progressAnimRef.current?.stop();
  }, [activeStory, currentStoryIndex, startStoryProgress]);

  return {
    stories,
    activeStory,
    currentStoryIndex,
    isAdding,
    progressAnim,
    openStory,
    closeStory,
    handlePickStory,
    handleStoryTap,
  };
};
