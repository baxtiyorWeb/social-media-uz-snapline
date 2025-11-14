import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';
import { Video, ResizeMode } from 'expo-av';
import React, { useState, useRef } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function AddVideo() {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const videoRef = useRef<Video>(null);

  // Request permissions
  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Ruxsat kerak', 'Iltimos, galereyaga kirish uchun ruxsat bering');
      return false;
    }
    return true;
  };

  // Pick video from gallery
  const pickVideo = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      aspect: [9, 16],
      quality: 1,
      videoMaxDuration: 60, // 60 seconds max
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedVideo(result.assets[0].uri);
      // Generate thumbnail (in real app, you'd extract frame from video)
      setThumbnail(result.assets[0].uri);
    }
  };

  // Record new video
  const recordVideo = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Ruxsat kerak', 'Iltimos, kameraga kirish uchun ruxsat bering');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      aspect: [9, 16],
      quality: 1,
      videoMaxDuration: 60,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedVideo(result.assets[0].uri);
      setThumbnail(result.assets[0].uri);
    }
  };

  // Upload video
  const handleUpload = async () => {
    if (!selectedVideo) {
      Alert.alert('Xato', 'Iltimos, video tanlang');
      return;
    }

    if (!caption.trim()) {
      Alert.alert('Xato', 'Iltimos, tavsif kiriting');
      return;
    }

    setIsUploading(true);

    // Simulate upload (in real app, upload to server)
    setTimeout(() => {
      setIsUploading(false);
      Alert.alert('Muvaffaqiyat!', 'Video muvaffaqiyatli yuklandi', [
        {
          text: 'OK',
          onPress: () => {
            // Reset form
            setSelectedVideo(null);
            setThumbnail(null);
            setCaption('');
            setIsPlaying(false);
          },
        },
      ]);
    }, 2000);
  };

  // Toggle video play
  const togglePlay = async () => {
    if (videoRef.current) {
      if (isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Clear selection
  const clearVideo = () => {
    setSelectedVideo(null);
    setThumbnail(null);
    setCaption('');
    setIsPlaying(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Video Yuklash</Text>
          <Text style={styles.headerSubtitle}>60 soniyagacha video yuboring</Text>
        </View>

        {/* Video Preview or Selection */}
        {selectedVideo ? (
          <View style={styles.previewContainer}>
            <View style={styles.videoWrapper}>
              <Video
                ref={videoRef}
                source={{ uri: selectedVideo }}
                style={styles.video}
                resizeMode={ResizeMode.COVER}
                isLooping
                onPlaybackStatusUpdate={(status) => {
                  if ('isPlaying' in status) {
                    setIsPlaying(status.isPlaying);
                  }
                }}
              />

              {/* Play/Pause Overlay */}
              {!isPlaying && (
                <TouchableOpacity style={styles.playOverlay} onPress={togglePlay}>
                  <BlurView intensity={50} tint="dark" style={styles.playButton}>
                    <Ionicons name="play" size={48} color="#fff" />
                  </BlurView>
                </TouchableOpacity>
              )}

              {/* Clear Button */}
              <TouchableOpacity style={styles.clearButton} onPress={clearVideo}>
                <BlurView intensity={80} tint="dark" style={styles.clearButtonInner}>
                  <Ionicons name="close" size={24} color="#fff" />
                </BlurView>
              </TouchableOpacity>
            </View>

            {/* Caption Input */}
            <View style={styles.captionContainer}>
              <Text style={styles.label}>Tavsif</Text>
              <TextInput
                style={styles.captionInput}
                placeholder="Videoga tavsif yozing..."
                placeholderTextColor="#999"
                value={caption}
                onChangeText={setCaption}
                multiline
                maxLength={500}
                textAlignVertical="top"
              />
              <Text style={styles.characterCount}>{caption.length}/500</Text>
            </View>

            {/* Upload Button */}
            <TouchableOpacity
              style={[styles.uploadButton, isUploading && styles.uploadButtonDisabled]}
              onPress={handleUpload}
              disabled={isUploading}
            >
              {isUploading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="cloud-upload-outline" size={24} color="#fff" />
                  <Text style={styles.uploadButtonText}>Videoni Yuklash</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.selectionContainer}>
            {/* Gallery Option */}
            <TouchableOpacity style={styles.optionCard} onPress={pickVideo}>
              <BlurView intensity={20} tint="light" style={styles.optionBlur}>
                <View style={styles.optionIconContainer}>
                  <Ionicons name="images-outline" size={48} color="#5e5ce6" />
                </View>
                <Text style={styles.optionTitle}>Galereyadan Tanlash</Text>
                <Text style={styles.optionDescription}>
                  Telefoningizdagi videolardan birini tanlang
                </Text>
              </BlurView>
            </TouchableOpacity>

            {/* Camera Option */}
            <TouchableOpacity style={styles.optionCard} onPress={recordVideo}>
              <BlurView intensity={20} tint="light" style={styles.optionBlur}>
                <View style={styles.optionIconContainer}>
                  <Ionicons name="videocam-outline" size={48} color="#ff3b5c" />
                </View>
                <Text style={styles.optionTitle}>Video Yozish</Text>
                <Text style={styles.optionDescription}>
                  Kamera orqali yangi video yarating
                </Text>
              </BlurView>
            </TouchableOpacity>
          </View>
        )}

        {/* Tips Section */}
        {!selectedVideo && (
          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>💡 Maslahatlar:</Text>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4caf50" />
              <Text style={styles.tipText}>9:16 format tavsiya etiladi</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4caf50" />
              <Text style={styles.tipText}>Maksimal davomiyligi: 60 soniya</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4caf50" />
              <Text style={styles.tipText}>Yorug'lik yaxshi bo'lsin</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4caf50" />
              <Text style={styles.tipText}>Qisqa va qiziqarli kontentni tanlang</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 30,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
  },

  // Selection Container
  selectionContainer: {
    paddingHorizontal: 20,
    gap: 20,
  },
  optionCard: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  optionBlur: {
    padding: 30,
    alignItems: 'center',
  },
  optionIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  optionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },

  // Preview Container
  previewContainer: {
    paddingHorizontal: 20,
  },
  videoWrapper: {
    width: '100%',
    aspectRatio: 9 / 16,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  clearButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  clearButtonInner: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Caption
  captionContainer: {
    marginTop: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  captionInput: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    minHeight: 120,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  characterCount: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 8,
    textAlign: 'right',
  },

  // Upload Button
  uploadButton: {
    backgroundColor: '#5e5ce6',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    gap: 10,
  },
  uploadButtonDisabled: {
    backgroundColor: 'rgba(94,92,230,0.5)',
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },

  // Tips
  tipsContainer: {
    marginTop: 40,
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  tipText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
    flex: 1,
  },
});