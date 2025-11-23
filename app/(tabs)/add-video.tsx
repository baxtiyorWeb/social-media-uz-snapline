import api from '@/config/api';
import { ResizeMode, Video } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function VideoUploadScreen() {
  const [selectedVideo, setSelectedVideo] = useState<{ uri: string; name: string } | null>(null);
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [description, setDescription] = useState('');
  const [quality, setQuality] = useState('HD');
  const [isPublic, setIsPublic] = useState(true);
  const [allowComments, setAllowComments] = useState(true);
  const [allowLikes, setAllowLikes] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<Video>(null);

  const categories = ['Comedy', 'Music', 'Education', 'Gaming', 'Sports', 'Vlog', 'Art', 'Other'];

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Ruxsat kerak', 'Iltimos, galereyaga kirish uchun ruxsat bering');
      return false;
    }
    return true;
  };

  const pickVideo = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      aspect: [9, 16],
      quality: 1,
      videoMaxDuration: 60,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedVideo({
        uri: result.assets[0].uri,
        name: result.assets[0].filename || `video_${Date.now()}.mp4`,
      });
    }
  };

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
      setSelectedVideo({
        uri: result.assets[0].uri,
        name: result.assets[0]?.filename || `video_${Date.now()}.mp4`,
      });
    }
  };

  // VIDEO UPLOAD - Vercel Blob-ga yuklash
  const uploadVideoToBlob = async (): Promise<string> => {
    if (!selectedVideo) throw new Error('Video tanlanmagan');

    try {
      const formData = new FormData();
      formData.append('file', {
        uri: selectedVideo.uri,
        type: 'video/mp4',
        name: selectedVideo.name,
      } as any);

      setUploadProgress(0);

      const response = await api.post('/uploads', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent: any) => {
          const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
          setUploadProgress(progress);
        },
      });

      if (response.data?.file?.url) {
        return response.data.file.url;
      }

      throw new Error('Video URL qaytmadi');
    } catch (error: any) {
      console.error('Video upload xatosi:', error);
      throw error;
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput)) {
      setTags([...tags, tagInput]);
      setTagInput('');
    }
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!selectedVideo) {
      Alert.alert('Xato', 'Iltimos, video tanlang');
      return;
    }

    if (!caption.trim()) {
      Alert.alert('Xato', 'Iltimos, tavsif kiriting');
      return;
    }

    if (!category) {
      Alert.alert('Xato', 'Iltimos, kategoriya tanlang');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // 1. Video Blob-ga yuklash
      Alert.alert('Yuklash boshlandi', 'Video Vercel Blob-ga yuklanyapti...');
      const videoUrl = await uploadVideoToBlob();

      // 2. Post ma'lumotlarini API-ga jo'natish
      const uploadData = {
        videoUrl,
        caption: caption.trim(),
        category,
        hashtags,
        description,
        isPublic,
        allowComments,
        allowLikes,
        quality,
        tags,
      };

      const response = await api.post('/posts', uploadData);

      if (response.data?.id || response.status === 201) {
        setUploadSuccess(true);
        setTimeout(() => {
          resetForm();
          setUploadSuccess(false);
        }, 2000);
      }
    } catch (error: any) {
      console.error('Upload xatosi:', error);
      Alert.alert(
        'Xato',
        error?.response?.data?.message || error?.message || 'Video yuklashda xato yuz berdi'
      );
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const resetForm = () => {
    setSelectedVideo(null);
    setCaption('');
    setCategory('');
    setHashtags('');
    setDescription('');
    setTags([]);
    setTagInput('');
    setShowAdvanced(false);
    setIsPlaying(false);
    setUploadProgress(0);
  };

  const clearVideo = () => {
    setSelectedVideo(null);
    setCaption('');
    setCategory('');
    setUploadProgress(0);
  };

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

  if (uploadSuccess) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successContent}>
          <Text style={styles.checkmark}>✓</Text>
          <Text style={styles.successTitle}>Muvaffaqiyat!</Text>
          <Text style={styles.successText}>Video muvaffaqiyatli yuklandi</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Video Yuklash</Text>
          <Text style={styles.headerSubtitle}>60 soniyagacha video yuboring</Text>
        </View>

        {selectedVideo ? (
          <View style={styles.formContainer}>
            {/* Video Preview */}
            <View style={styles.videoPreview}>
              <Video
                ref={videoRef}
                source={{ uri: selectedVideo.uri }}
                style={styles.video}
                resizeMode={ResizeMode.COVER}
                isLooping
                onPlaybackStatusUpdate={(status) => {
                  if ('isPlaying' in status) {
                    setIsPlaying(status.isPlaying);
                  }
                }}
              />

              <TouchableOpacity style={styles.playButton} onPress={togglePlay}>
                <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶'}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.clearBtn} onPress={clearVideo}>
                <Text style={styles.clearIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Upload Progress */}
            {isUploading && uploadProgress > 0 && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${uploadProgress}%` }
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>{uploadProgress}%</Text>
              </View>
            )}

            {/* Caption */}
            <View style={styles.section}>
              <Text style={styles.label}>📝 Tavsif *</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Videoga tavsif yozing..."
                placeholderTextColor="#999"
                value={caption}
                onChangeText={setCaption}
                multiline
                maxLength={500}
              />
              <Text style={styles.charCount}>{caption.length}/500</Text>
            </View>

            {/* Category */}
            <View style={styles.section}>
              <Text style={styles.label}>🏷️ Kategoriya *</Text>
              <View style={styles.categoryGrid}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryBtn,
                      category === cat && styles.categoryBtnActive,
                    ]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        category === cat && styles.categoryTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Hashtags */}
            <View style={styles.section}>
              <Text style={styles.label}>#️⃣ Xeshteglar</Text>
              <TextInput
                style={styles.input}
                placeholder="#music #video #trending"
                placeholderTextColor="#999"
                value={hashtags}
                onChangeText={setHashtags}
              />
            </View>

            {/* Description */}
            <View style={styles.section}>
              <Text style={styles.label}>📄 Qo'shimcha Tavsif</Text>
              <TextInput
                style={[styles.textArea, { height: 100 }]}
                placeholder="Video haqida batafsil ma'lumot..."
                placeholderTextColor="#999"
                value={description}
                onChangeText={setDescription}
                multiline
              />
            </View>

            {/* Quality */}
            <View style={styles.section}>
              <Text style={styles.label}>⚙️ Sifat</Text>
              <View style={styles.qualityRow}>
                {['SD', 'HD', '4K'].map((q) => (
                  <TouchableOpacity
                    key={q}
                    style={[
                      styles.qualityBtn,
                      quality === q && styles.qualityBtnActive,
                    ]}
                    onPress={() => setQuality(q)}
                  >
                    <Text
                      style={[
                        styles.qualityText,
                        quality === q && styles.qualityTextActive,
                      ]}
                    >
                      {q}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Privacy Settings */}
            <View style={styles.section}>
              <View style={styles.toggleItem}>
                <Text style={styles.toggleLabel}>🌍 Ommaviy Video</Text>
                <Switch
                  value={isPublic}
                  onValueChange={setIsPublic}
                  trackColor={{ false: '#ccc', true: '#4CAF50' }}
                />
              </View>

              <View style={styles.toggleItem}>
                <Text style={styles.toggleLabel}>💬 Izohlar</Text>
                <Switch
                  value={allowComments}
                  onValueChange={setAllowComments}
                  trackColor={{ false: '#ccc', true: '#4CAF50' }}
                />
              </View>

              <View style={styles.toggleItem}>
                <Text style={styles.toggleLabel}>❤️ Like'lar</Text>
                <Switch
                  value={allowLikes}
                  onValueChange={setAllowLikes}
                  trackColor={{ false: '#ccc', true: '#4CAF50' }}
                />
              </View>
            </View>

            {/* Advanced Settings */}
            <TouchableOpacity
              style={styles.advancedBtn}
              onPress={() => setShowAdvanced(!showAdvanced)}
            >
              <Text style={styles.advancedText}>
                {showAdvanced ? '▼' : '▶'} {showAdvanced ? 'Kamroq Sozlamalar' : "Ko'proq Sozlamalar"}
              </Text>
            </TouchableOpacity>

            {showAdvanced && (
              <View style={styles.advancedSection}>
                <Text style={styles.label}>🏷️ Teglar</Text>
                <View style={styles.tagsContainer}>
                  {tags.map((tag, idx) => (
                    <View key={idx} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                      <TouchableOpacity onPress={() => removeTag(idx)}>
                        <Text style={styles.removeTag}>×</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
                <View style={styles.tagInputRow}>
                  <TextInput
                    style={styles.tagInput}
                    placeholder="Tag qo'shing..."
                    placeholderTextColor="#999"
                    value={tagInput}
                    onChangeText={setTagInput}
                  />
                  <TouchableOpacity style={styles.addTagBtn} onPress={addTag}>
                    <Text style={styles.addTagText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Upload Button */}
            <TouchableOpacity
              style={[styles.uploadBtn, isUploading && styles.uploadBtnDisabled]}
              onPress={handleUpload}
              disabled={isUploading}
            >
              {isUploading ? (
                <ActivityIndicator color="#fff" size="large" />
              ) : (
                <Text style={styles.uploadBtnText}>Videoni Yuklash</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.selectionContainer}>
            <TouchableOpacity style={styles.optionCard} onPress={pickVideo}>
              <Text style={styles.optionIcon}>📱</Text>
              <Text style={styles.optionTitle}>Galereyadan Tanlash</Text>
              <Text style={styles.optionDesc}>Telefoningizdagi videolardan birini tanlang</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionCard} onPress={recordVideo}>
              <Text style={styles.optionIcon}>🎥</Text>
              <Text style={styles.optionTitle}>Video Yozish</Text>
              <Text style={styles.optionDesc}>Kamera orqali yangi video yarating</Text>
            </TouchableOpacity>

            {/* Tips */}
            <View style={styles.tipsContainer}>
              <Text style={styles.tipsTitle}>💡 Maslahatlar:</Text>
              <Text style={styles.tipText}>✓ 9:16 format tavsiya etiladi</Text>
              <Text style={styles.tipText}>✓ Maksimal davomiyligi: 60 soniya</Text>
              <Text style={styles.tipText}>✓ Yorug'lik yaxshi bo'lsin</Text>
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
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#000',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  formContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  videoPreview: {
    width: '100%',
    aspectRatio: 9 / 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000',
    marginBottom: 20,
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -30,
    marginTop: -30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  clearBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearIcon: {
    fontSize: 22,
    color: '#fff',
    fontWeight: 'bold',
  },
  progressContainer: {
    marginBottom: 16,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#eee',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  progressText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  section: {
    marginBottom: 16,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#000',
    backgroundColor: '#fafafa',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#000',
    backgroundColor: '#fafafa',
    textAlignVertical: 'top',
    minHeight: 100,
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
    textAlign: 'right',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#eee',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  categoryBtnActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#fff',
  },
  qualityRow: {
    flexDirection: 'row',
    gap: 10,
  },
  qualityBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#eee',
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  qualityBtnActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  qualityText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  qualityTextActive: {
    color: '#fff',
  },
  toggleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  advancedBtn: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
  },
  advancedText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#007AFF',
  },
  advancedSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#007AFF',
    borderRadius: 16,
  },
  tagText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
  removeTag: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  tagInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tagInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    backgroundColor: '#fafafa',
  },
  addTagBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addTagText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  uploadBtn: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  uploadBtnDisabled: {
    backgroundColor: '#ccc',
  },
  uploadBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  selectionContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  optionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  optionIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  optionDesc: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },
  tipsContainer: {
    backgroundColor: '#f0f7ff',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
    marginBottom: 10,
  },
  tipText: {
    fontSize: 13,
    color: '#333',
    marginBottom: 6,
    lineHeight: 18,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  successContent: {
    alignItems: 'center',
  },
  checkmark: {
    fontSize: 64,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  successText: {
    fontSize: 16,
    color: '#666',
  },
});