import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface Filter {
  id: string;
  name: string;
  gradient: [string, string, ...string[]];
}

const FILTERS: Filter[] = [
  { id: 'none', name: 'Normal', gradient: ['transparent', 'transparent'] },
  { id: 'warm', name: 'Warm', gradient: ['rgba(255,107,107,0.3)', 'rgba(255,159,64,0.3)'] },
  { id: 'cool', name: 'Cool', gradient: ['rgba(52,152,219,0.3)', 'rgba(155,89,182,0.3)'] },
  { id: 'vintage', name: 'Vintage', gradient: ['rgba(244,208,63,0.3)', 'rgba(230,126,34,0.3)'] },
  { id: 'bw', name: 'B&W', gradient: ['rgba(0,0,0,0.3)', 'rgba(255,255,255,0.3)'] },
  { id: 'sunset', name: 'Sunset', gradient: ['rgba(255,94,77,0.3)', 'rgba(255,154,158,0.3)'] },
  { id: 'ocean', name: 'Ocean', gradient: ['rgba(26,188,156,0.3)', 'rgba(22,160,133,0.3)'] },
];

interface AddStoryProps {
  visible: boolean;
  onClose: () => void;
  onStoryCreated?: (image: string) => void;
}

export default function AddStory({ visible, onClose, onStoryCreated }: AddStoryProps) {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState('none');
  const [captionText, setCaptionText] = useState('');
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [textColor, setTextColor] = useState('#fff');
  const [textBgColor, setTextBgColor] = useState('transparent');
  const [isPosting, setIsPosting] = useState(false);

  const TEXT_COLORS = ['#fff', '#000', '#ff3b5c', '#5e5ce6', '#34c759', '#ff9500', '#ffd700'];
  const TEXT_BG_COLORS = ['transparent', 'rgba(0,0,0,0.5)', 'rgba(255,255,255,0.8)', 'rgba(94,92,230,0.3)'];

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant access to your photos');
      return false;
    }
    return true;
  };

  const pickFromGallery = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [9, 16],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera access');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [9, 16],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handlePost = async () => {
    if (!selectedImage) return;

    setIsPosting(true);

    // Simulate posting
    setTimeout(() => {
      setIsPosting(false);
      Alert.alert('Success!', 'Your story has been posted', [
        {
          text: 'OK',
          onPress: () => {
            onStoryCreated?.(selectedImage);
            handleClose();
          },
        },
      ]);
    }, 1500);
  };

  const handleClose = () => {
    setSelectedImage(null);
    setSelectedFilter('none');
    setCaptionText('');
    setShowTextEditor(false);
    setTextColor('#fff');
    setTextBgColor('transparent');
    onClose();
  };

  const renderInitialScreen = () => (
    <View style={styles.initialContainer}>
      <BlurView intensity={90} tint="dark" style={styles.initialHeader}>
        <Text style={styles.initialTitle}>Create Story</Text>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Ionicons name="close" size={28} color="#fff" />
        </TouchableOpacity>
      </BlurView>

      <View style={styles.initialContent}>
        <View style={styles.avatarSection}>
          <LinearGradient
            colors={['#667eea', '#764ba2', '#f093fb']}
            style={styles.avatarGradient}
          >
            <Image
              source={{ uri: 'https://i.pravatar.cc/300?img=12' }}
              style={styles.avatar}
            />
          </LinearGradient>
          <View style={styles.addBadge}>
            <Ionicons name="add" size={24} color="#fff" />
          </View>
        </View>

        <Text style={styles.welcomeText}>Share a moment</Text>
        <Text style={styles.welcomeSubtext}>Create your story in seconds</Text>

        <View style={styles.optionsContainer}>
          {/* Camera Option */}
          <TouchableOpacity style={styles.optionCard} onPress={takePhoto}>
            <LinearGradient
              colors={['rgba(255,59,92,0.2)', 'rgba(255,107,107,0.05)']}
              style={styles.optionGradient}
            >
              <View style={styles.optionIconContainer}>
                <LinearGradient
                  colors={['#ff3b5c', '#ff6b6b']}
                  style={styles.optionIcon}
                >
                  <Ionicons name="camera" size={32} color="#fff" />
                </LinearGradient>
              </View>
              <Text style={styles.optionTitle}>Take Photo</Text>
              <Text style={styles.optionSubtitle}>Capture the moment</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Gallery Option */}
          <TouchableOpacity style={styles.optionCard} onPress={pickFromGallery}>
            <LinearGradient
              colors={['rgba(94,92,230,0.2)', 'rgba(94,92,230,0.05)']}
              style={styles.optionGradient}
            >
              <View style={styles.optionIconContainer}>
                <LinearGradient
                  colors={['#5e5ce6', '#8b7bd8']}
                  style={styles.optionIcon}
                >
                  <Ionicons name="images" size={32} color="#fff" />
                </LinearGradient>
              </View>
              <Text style={styles.optionTitle}>Choose Photo</Text>
              <Text style={styles.optionSubtitle}>From your gallery</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>💡 Tips</Text>
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color="#34c759" />
              <Text style={styles.tipText}>Best in 9:16 ratio</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color="#34c759" />
              <Text style={styles.tipText}>Stories last 24 hours</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color="#34c759" />
              <Text style={styles.tipText}>Add text & filters</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  const renderEditor = () => {
    const currentFilter = FILTERS.find(f => f.id === selectedFilter);

    return (
      <View style={styles.editorContainer}>
        {/* Preview */}
        <View style={styles.previewContainer}>
          <Image source={{ uri: selectedImage! }} style={styles.previewImage} />
          {currentFilter && (
            <LinearGradient
              colors={currentFilter.gradient}
              style={styles.filterOverlay}
            />
          )}

          {captionText && (
            <View style={[styles.captionOverlay, { backgroundColor: textBgColor }]}>
              <Text style={[styles.captionText, { color: textColor }]}>
                {captionText}
              </Text>
            </View>
          )}
        </View>

        {/* Top Controls */}
        <BlurView intensity={80} tint="dark" style={styles.topControls}>
          <TouchableOpacity onPress={handleClose} style={styles.controlButton}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <View style={styles.topControlsCenter}>
            <Text style={styles.topControlsTitle}>Edit Story</Text>
          </View>
          <View style={styles.controlButton} />
        </BlurView>

        {/* Bottom Controls */}
        <BlurView intensity={90} tint="dark" style={styles.bottomControls}>
          {/* Filters */}
          {!showTextEditor && (
            <View style={styles.filtersSection}>
              <Text style={styles.sectionLabel}>Filters</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filtersList}
              >
                {FILTERS.map((filter) => (
                  <TouchableOpacity
                    key={filter.id}
                    style={[
                      styles.filterItem,
                      selectedFilter === filter.id && styles.filterItemActive,
                    ]}
                    onPress={() => setSelectedFilter(filter.id)}
                  >
                    <LinearGradient
                      colors={filter.gradient}
                      style={styles.filterPreview}
                    >
                      {selectedFilter === filter.id && (
                        <Ionicons name="checkmark-circle" size={20} color="#fff" />
                      )}
                    </LinearGradient>
                    <Text style={styles.filterName}>{filter.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Text Editor */}
          {showTextEditor && (
            <View style={styles.textEditorSection}>
              <TextInput
                style={styles.textInput}
                placeholder="Add text..."
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={captionText}
                onChangeText={setCaptionText}
                multiline
                maxLength={150}
              />

              {/* Text Colors */}
              <View style={styles.colorPicker}>
                <Text style={styles.colorLabel}>Text Color</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.colorsList}>
                    {TEXT_COLORS.map((color) => (
                      <TouchableOpacity
                        key={color}
                        style={[
                          styles.colorItem,
                          { backgroundColor: color },
                          textColor === color && styles.colorItemActive,
                        ]}
                        onPress={() => setTextColor(color)}
                      />
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Background Colors */}
              <View style={styles.colorPicker}>
                <Text style={styles.colorLabel}>Background</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.colorsList}>
                    {TEXT_BG_COLORS.map((color) => (
                      <TouchableOpacity
                        key={color}
                        style={[
                          styles.colorItem,
                          { backgroundColor: color === 'transparent' ? '#333' : color },
                          textBgColor === color && styles.colorItemActive,
                        ]}
                        onPress={() => setTextBgColor(color)}
                      >
                        {color === 'transparent' && (
                          <Ionicons name="close" size={16} color="#fff" />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowTextEditor(!showTextEditor)}
            >
              <Ionicons name="text" size={24} color="#fff" />
              <Text style={styles.actionButtonText}>Text</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="brush" size={24} color="#fff" />
              <Text style={styles.actionButtonText}>Draw</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="happy" size={24} color="#fff" />
              <Text style={styles.actionButtonText}>Sticker</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.postButton}
              onPress={handlePost}
              disabled={isPosting}
            >
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.postButtonGradient}
              >
                {isPosting ? (
                  <Text style={styles.postButtonText}>Posting...</Text>
                ) : (
                  <>
                    <Ionicons name="checkmark" size={20} color="#fff" />
                    <Text style={styles.postButtonText}>Post Story</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </BlurView>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {selectedImage ? renderEditor() : renderInitialScreen()}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  // Initial Screen
  initialContainer: {
    flex: 1,
  },
  initialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
    marginTop: -14,
  },
  initialTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
    position: 'relative',
    top: -15,
  },
  closeButton: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    top: -15,
    right: 10,
  },
  initialContent: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
  },
  avatarSection: {
    position: 'relative',
    marginBottom: 24,
  },
  avatarGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    padding: 4,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 56,
  },
  addBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#5e5ce6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#000',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  welcomeSubtext: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 40,
  },
  optionsContainer: {
    width: '100%',
    paddingHorizontal: 20,
    gap: 16,
    marginBottom: 40,
  },
  optionCard: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  optionGradient: {
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  optionIconContainer: {
    marginRight: 20,
  },
  optionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
    flex: 1,
  },
  optionSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    position: 'absolute',
    left: 104,
    bottom: 24,
  },
  tipsContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tipText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },

  // Editor
  editorContainer: {
    flex: 1,
  },
  previewContainer: {
    flex: 1,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  filterOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  captionOverlay: {
    position: 'absolute',
    bottom: 200,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 16,
  },
  captionText: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  topControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    paddingHorizontal: 20,
    overflow: 'hidden',
  },
  controlButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topControlsCenter: {
    flex: 1,
    alignItems: 'center',
  },
  topControlsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    paddingTop: 20,
    paddingHorizontal: 20,
    overflow: 'hidden',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  filtersSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 12,
  },
  filtersList: {
    gap: 12,
  },
  filterItem: {
    alignItems: 'center',
    gap: 8,
  },
  filterItemActive: {
    opacity: 1,
  },
  filterPreview: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterName: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  textEditorSection: {
    marginBottom: 20,
  },
  textInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    minHeight: 80,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  colorPicker: {
    marginBottom: 12,
  },
  colorLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 8,
  },
  colorsList: {
    flexDirection: 'row',
    gap: 12,
  },
  colorItem: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorItemActive: {
    borderColor: '#fff',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    gap: 4,
  },
  actionButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  postButton: {
    flex: 1.5,
    borderRadius: 16,
    overflow: 'hidden',
  },
  postButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  postButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
});