import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Modal,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export interface StorySegment {
  id: string;
  image: string;
  duration: number;
}

interface Story {
  id: string;
  user: string;
  avatar: string;
  hasStory: boolean;
  isLive?: boolean;
  segments: StorySegment[];
}

interface StoriesViewerProps {
  visible: boolean;
  stories: Story[];
  initialStoryIndex: number;
  onClose: () => void;
}

// Mock segments generator - har bir story uchun random segments
const generateSegments = (userId: string): StorySegment[] => {
  const count = Math.floor(Math.random() * 3) + 1; // 1-3 segments
  return Array.from({ length: count }).map((_, idx) => ({
    id: `${userId}_seg${idx + 1}`,
    image: `https://picsum.photos/1080/1920?random=${userId}${idx}`,
    duration: 5,
  }));
};

export default function StoriesViewer({
  visible,
  stories,
  initialStoryIndex,
  onClose,
}: StoriesViewerProps) {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(initialStoryIndex);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showInput, setShowInput] = useState(false);

  const progress = useRef(new Animated.Value(0)).current;
  const currentStory = stories[currentStoryIndex];
  const currentSegment = currentStory?.segments[currentSegmentIndex];
  const totalSegments = currentStory?.segments.length || 0;

  // Reset when modal opens
  useEffect(() => {
    if (visible) {
      setCurrentStoryIndex(initialStoryIndex);
      setCurrentSegmentIndex(0);
      setIsPaused(false);
      setShowInput(false);
      setReplyText('');
    }
  }, [visible, initialStoryIndex]);

  // Progress animation
  useEffect(() => {
    if (!visible || !currentSegment || isPaused || isLongPressing || showInput) {
      return;
    }

    progress.setValue(0);
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: currentSegment.duration * 1000,
      useNativeDriver: false,
    });

    animation.start(({ finished }) => {
      if (finished) {
        goToNextSegment();
      }
    });

    return () => animation.stop();
  }, [visible, currentSegmentIndex, currentStoryIndex, isPaused, isLongPressing, showInput]);

  const goToNextSegment = useCallback(() => {
    if (currentSegmentIndex < totalSegments - 1) {
      setCurrentSegmentIndex(prev => prev + 1);
    } else if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
      setCurrentSegmentIndex(0);
    } else {
      onClose();
    }
  }, [currentSegmentIndex, currentStoryIndex, stories.length, totalSegments, onClose]);

  const goToPreviousSegment = useCallback(() => {
    if (currentSegmentIndex > 0) {
      setCurrentSegmentIndex(prev => prev - 1);
    } else if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
      const prevStory = stories[currentStoryIndex - 1];
      setCurrentSegmentIndex(prevStory.segments.length - 1);
    }
  }, [currentSegmentIndex, currentStoryIndex, stories]);

  const handleTap = (x: number) => {
    if (showInput) return;

    if (x < width / 2) {
      goToPreviousSegment();
    } else {
      goToNextSegment();
    }
  };

  const handleLongPress = () => {
    setIsLongPressing(true);
    setIsPaused(true);
  };

  const handleLongPressOut = () => {
    setIsLongPressing(false);
    setIsPaused(false);
  };

  const sendReply = () => {
    if (replyText.trim()) {
      console.log('Reply:', replyText, 'to', currentStory.user);
      setReplyText('');
      setShowInput(false);
    }
  };

  if (!visible || !currentStory) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        {/* Background Image */}
        <Image
          source={{ uri: currentSegment?.image }}
          style={styles.backgroundImage}
          resizeMode="cover"
        />

        {/* Gradient Overlays */}
        <LinearGradient
          colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.3)']}
          style={styles.gradientTop}
        />
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.8)']}
          style={styles.gradientBottom}
        />

        {/* Progress Bars */}
        <View style={styles.progressContainer}>
          {currentStory.segments.map((segment, index) => (
            <View key={segment.id} style={styles.progressBar}>
              <View style={styles.progressBarBg}>
                {index === currentSegmentIndex ? (
                  <Animated.View
                    style={[
                      styles.progressBarFill,
                      {
                        width: progress.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%'],
                        }),
                      },
                    ]}
                  />
                ) : index < currentSegmentIndex ? (
                  <View style={[styles.progressBarFill, { width: '100%' }]} />
                ) : null}
              </View>
            </View>
          ))}
        </View>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <LinearGradient
              colors={['#9b5de5', '#5a4ae3', '#4adede']}
              style={styles.avatarRing}
            >
              <Image source={{ uri: currentStory.avatar }} style={styles.avatar} />
            </LinearGradient>
            <View style={styles.userDetails}>
              <Text style={styles.username}>{currentStory.user}</Text>
              <Text style={styles.timestamp}>2h ago</Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => setIsPaused(!isPaused)}
            >
              <Ionicons
                name={isPaused ? 'play' : 'pause'}
                size={20}
                color="#fff"
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="volume-high" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tap Areas */}
        <View style={styles.tapContainer}>
          <TouchableOpacity
            style={styles.tapArea}
            activeOpacity={1}
            onPress={(e) => handleTap(e.nativeEvent.locationX)}
            onLongPress={handleLongPress}
            onPressOut={handleLongPressOut}
          />
        </View>

        {/* Bottom Actions */}
        {!showInput && (
          <View style={styles.bottomActions}>
            <TouchableOpacity
              style={styles.replyButton}
              onPress={() => setShowInput(true)}
            >
              <TextInput
                style={styles.replyInput}
                placeholder={`Reply to ${currentStory.user}...`}
                placeholderTextColor="rgba(255,255,255,0.6)"
                editable={false}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionIcon}>
              <Ionicons name="heart-outline" size={28} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionIcon}>
              <Ionicons name="paper-plane-outline" size={26} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

        {/* Reply Input */}
        {showInput && (
          <View style={styles.replyContainer}>
            <View style={styles.replyInputContainer}>
              <TextInput
                style={styles.activeReplyInput}
                placeholder={`Reply to ${currentStory.user}...`}
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={replyText}
                onChangeText={setReplyText}
                autoFocus
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  !replyText.trim() && styles.sendButtonDisabled,
                ]}
                onPress={sendReply}
                disabled={!replyText.trim()}
              >
                <Ionicons name="send" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setShowInput(false);
                setReplyText('');
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Pause Indicator */}
        {isPaused && !showInput && (
          <View style={styles.pauseIndicator}>
            <Ionicons name="pause" size={60} color="rgba(255,255,255,0.9)" />
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
  },
  gradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  gradientBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
  },

  // Progress
  progressContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 8,
    right: 8,
    flexDirection: 'row',
    gap: 4,
    zIndex: 10,
  },
  progressBar: {
    flex: 1,
    height: 3,
  },
  progressBarBg: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 2,
  },

  // Header
  header: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 80 : 60,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarRing: {
    width: 42,
    height: 42,
    borderRadius: 21,
    padding: 2,
    marginRight: 12,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 19,
  },
  userDetails: {},
  username: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Tap Areas
  tapContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  tapArea: {
    flex: 1,
  },

  // Bottom Actions
  bottomActions: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 50 : 30,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  replyButton: {
    flex: 1,
  },
  replyInput: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 15,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Reply Container
  replyContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.9)',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 50 : 30,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  replyInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    marginBottom: 12,
  },
  activeReplyInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 15,
    maxHeight: 120,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#5e5ce6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(94,92,230,0.4)',
  },
  cancelButton: {
    alignSelf: 'center',
    paddingVertical: 8,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },

  // Pause Indicator
  pauseIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -30,
    marginTop: -30,
  },
});