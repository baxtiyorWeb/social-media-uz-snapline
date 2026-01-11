import { styles } from "@/hooks/add-video/styles";
import { useAddVideo } from "@/hooks/add-video/use-add-video";
import { Ionicons } from "@expo/vector-icons";
import { ResizeMode, Video } from "expo-av";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function AddVideoScreen() {
  const {
    selectedVideo,
    caption,
    category,
    hashtags,
    description,
    quality,
    isPublic,
    allowComments,
    allowLikes,
    isUploading,
    uploadSuccess,
    showAdvanced,
    tags,
    tagInput,
    uploadProgress,
    isPlaying,
    categories,
    videoRef,

    setCaption,
    setCategory,
    setHashtags,
    setDescription,
    setQuality,
    setIsPublic,
    setAllowComments,
    setAllowLikes,
    setShowAdvanced,
    setTagInput,

    pickVideo,
    recordVideo,
    handleUpload,
    clearVideo,
    addTag,
    removeTag,
    togglePlay,
  } = useAddVideo();

  if (uploadSuccess) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successContent}>
          <View style={styles.successIconContainer}>
            <LinearGradient
              colors={["#4CAF50", "#45a049"]}
              style={styles.successIconGradient}
            >
              <Ionicons name="checkmark-circle" size={80} color="#fff" />
            </LinearGradient>
          </View>
          <Text style={styles.successTitle}>Muvaffaqiyatli yuklandi!</Text>
          <Text style={styles.successText}>
            Videongiz ko'rib chiqilmoqda va tez orada nashr qilinadi
          </Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <BlurView intensity={80} tint="dark" style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.headerTitle}>Video Yuklash</Text>
              <Text style={styles.headerSubtitle}>
                60 soniyagacha video joylashtiring
              </Text>
            </View>
            {selectedVideo && (
              <TouchableOpacity
                style={styles.headerButton}
                onPress={clearVideo}
              >
                <Ionicons name="trash-outline" size={24} color="#ff3b5c" />
              </TouchableOpacity>
            )}
          </View>
        </BlurView>

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
                  if ("isPlaying" in status) {
                    // Playback state handled in hook
                  }
                }}
              />

              <View style={styles.videoOverlay}>
                <TouchableOpacity
                  style={styles.playButton}
                  onPress={togglePlay}
                  activeOpacity={0.8}
                >
                  <BlurView
                    intensity={60}
                    tint="dark"
                    style={styles.playButtonBlur}
                  >
                    <Ionicons
                      name={isPlaying ? "pause" : "play"}
                      size={32}
                      color="#fff"
                    />
                  </BlurView>
                </TouchableOpacity>
              </View>

              {/* Duration Badge */}
              <View style={styles.durationBadge}>
                <Ionicons name="time-outline" size={14} color="#fff" />
                <Text style={styles.durationText}>0:45</Text>
              </View>
            </View>

            {/* Upload Progress */}
            {isUploading && uploadProgress > 0 && (
              <View style={styles.progressContainer}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Yuklanmoqda...</Text>
                  <Text style={styles.progressPercent}>{uploadProgress}%</Text>
                </View>
                <View style={styles.progressBar}>
                  <LinearGradient
                    colors={["#5e5ce6", "#8b5cf6"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[
                      styles.progressFill,
                      { width: `${uploadProgress}%` },
                    ]}
                  />
                </View>
              </View>
            )}

            {/* Caption */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="create-outline" size={20} color="#5e5ce6" />
                <Text style={styles.label}>Tavsif</Text>
                <Text style={styles.required}>*</Text>
              </View>
              <TextInput
                style={styles.textArea}
                placeholder="Videongiz haqida yozing..."
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={caption}
                onChangeText={setCaption}
                multiline
                maxLength={500}
              />
              <Text style={styles.charCount}>{caption.length}/500</Text>
            </View>

            {/* Category */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="grid-outline" size={20} color="#5e5ce6" />
                <Text style={styles.label}>Kategoriya</Text>
                <Text style={styles.required}>*</Text>
              </View>
              <View style={styles.categoryGrid}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryBtn,
                      category === cat && styles.categoryBtnActive,
                    ]}
                    onPress={() => setCategory(cat)}
                    activeOpacity={0.7}
                  >
                    {category === cat && (
                      <LinearGradient
                        colors={["#5e5ce6", "#8b5cf6"]}
                        style={styles.categoryGradient}
                      />
                    )}
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
              <View style={styles.sectionHeader}>
                <Ionicons name="pricetag-outline" size={20} color="#5e5ce6" />
                <Text style={styles.label}>Xeshteglar</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="#music #video #trending"
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={hashtags}
                onChangeText={setHashtags}
              />
            </View>

            {/* Description */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons
                  name="document-text-outline"
                  size={20}
                  color="#5e5ce6"
                />
                <Text style={styles.label}>Qo'shimcha Tavsif</Text>
              </View>
              <TextInput
                style={[styles.textArea, { minHeight: 80 }]}
                placeholder="Video haqida batafsil..."
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={description}
                onChangeText={setDescription}
                multiline
              />
            </View>

            {/* Quality */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="settings-outline" size={20} color="#5e5ce6" />
                <Text style={styles.label}>Sifat</Text>
              </View>
              <View style={styles.qualityRow}>
                {["SD", "HD", "4K"].map((q) => (
                  <TouchableOpacity
                    key={q}
                    style={[
                      styles.qualityBtn,
                      quality === q && styles.qualityBtnActive,
                    ]}
                    onPress={() => setQuality(q)}
                    activeOpacity={0.7}
                  >
                    {quality === q && (
                      <LinearGradient
                        colors={["#5e5ce6", "#8b5cf6"]}
                        style={styles.qualityGradient}
                      />
                    )}
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
              <View style={styles.sectionHeader}>
                <Ionicons name="shield-outline" size={20} color="#5e5ce6" />
                <Text style={styles.label}>Maxfiylik</Text>
              </View>

              <View style={styles.toggleItem}>
                <View style={styles.toggleLeft}>
                  <Ionicons name="globe-outline" size={22} color="#fff" />
                  <Text style={styles.toggleLabel}>Ommaviy Video</Text>
                </View>
                <Switch
                  value={isPublic}
                  onValueChange={setIsPublic}
                  trackColor={{
                    false: "rgba(255,255,255,0.1)",
                    true: "#5e5ce6",
                  }}
                  thumbColor="#fff"
                />
              </View>

              <View style={styles.toggleItem}>
                <View style={styles.toggleLeft}>
                  <Ionicons name="chatbubble-outline" size={22} color="#fff" />
                  <Text style={styles.toggleLabel}>Izohlar</Text>
                </View>
                <Switch
                  value={allowComments}
                  onValueChange={setAllowComments}
                  trackColor={{
                    false: "rgba(255,255,255,0.1)",
                    true: "#5e5ce6",
                  }}
                  thumbColor="#fff"
                />
              </View>

              <View style={[styles.toggleItem, styles.toggleItemLast]}>
                <View style={styles.toggleLeft}>
                  <Ionicons name="heart-outline" size={22} color="#fff" />
                  <Text style={styles.toggleLabel}>Likelar</Text>
                </View>
                <Switch
                  value={allowLikes}
                  onValueChange={setAllowLikes}
                  trackColor={{
                    false: "rgba(255,255,255,0.1)",
                    true: "#5e5ce6",
                  }}
                  thumbColor="#fff"
                />
              </View>
            </View>

            {/* Advanced Settings */}
            <TouchableOpacity
              style={styles.advancedBtn}
              onPress={() => setShowAdvanced(!showAdvanced)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={showAdvanced ? "chevron-up" : "chevron-down"}
                size={20}
                color="#5e5ce6"
              />
              <Text style={styles.advancedText}>
                {showAdvanced ? "Kamroq" : "Ko'proq"} Sozlamalar
              </Text>
            </TouchableOpacity>

            {showAdvanced && (
              <View style={styles.advancedSection}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="bookmark-outline" size={20} color="#5e5ce6" />
                  <Text style={styles.label}>Teglar</Text>
                </View>

                {tags.length > 0 && (
                  <View style={styles.tagsContainer}>
                    {tags.map((tag, idx) => (
                      <View key={idx} style={styles.tag}>
                        <Text style={styles.tagText}>{tag}</Text>
                        <TouchableOpacity onPress={() => removeTag(idx)}>
                          <Ionicons name="close" size={16} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}

                <View style={styles.tagInputRow}>
                  <TextInput
                    style={styles.tagInput}
                    placeholder="Tag qo'shish..."
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    value={tagInput}
                    onChangeText={setTagInput}
                    onSubmitEditing={addTag}
                  />
                  <TouchableOpacity
                    style={styles.addTagBtn}
                    onPress={addTag}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={["#5e5ce6", "#8b5cf6"]}
                      style={styles.addTagGradient}
                    >
                      <Ionicons name="add" size={24} color="#fff" />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Upload Button */}
            <TouchableOpacity
              style={[
                styles.uploadBtn,
                (isUploading || !caption.trim() || !category) &&
                  styles.uploadBtnDisabled,
              ]}
              onPress={handleUpload}
              disabled={isUploading || !caption.trim() || !category}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={
                  isUploading || !caption.trim() || !category
                    ? ["#666", "#555"]
                    : ["#5e5ce6", "#8b5cf6"]
                }
                style={styles.uploadBtnGradient}
              >
                {isUploading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons
                      name="cloud-upload-outline"
                      size={24}
                      color="#fff"
                    />
                    <Text style={styles.uploadBtnText}>Videoni Yuklash</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.selectionContainer}>
            {/* Gallery Option */}
            <TouchableOpacity
              style={styles.optionCard}
              onPress={pickVideo}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["rgba(94,92,230,0.1)", "rgba(139,92,246,0.1)"]}
                style={styles.optionGradient}
              />
              <View style={styles.optionIconContainer}>
                <Ionicons name="images" size={48} color="#5e5ce6" />
              </View>
              <Text style={styles.optionTitle}>Galereyadan Tanlash</Text>
              <Text style={styles.optionDesc}>
                Telefoningizdagi videolardan birini tanlang
              </Text>
            </TouchableOpacity>

            {/* Record Option */}
            <TouchableOpacity
              style={styles.optionCard}
              onPress={recordVideo}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["rgba(255,59,92,0.1)", "rgba(255,107,129,0.1)"]}
                style={styles.optionGradient}
              />
              <View style={styles.optionIconContainer}>
                <Ionicons name="videocam" size={48} color="#ff3b5c" />
              </View>
              <Text style={styles.optionTitle}>Video Yozish</Text>
              <Text style={styles.optionDesc}>
                Kamera orqali yangi video yarating
              </Text>
            </TouchableOpacity>

            {/* Tips */}
            <View style={styles.tipsContainer}>
              <View style={styles.tipsHeader}>
                <Ionicons name="bulb" size={24} color="#5e5ce6" />
                <Text style={styles.tipsTitle}>Maslahatlar</Text>
              </View>

              <View style={styles.tipItem}>
                <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                <Text style={styles.tipText}>
                  9:16 vertikal format eng yaxshi
                </Text>
              </View>

              <View style={styles.tipItem}>
                <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                <Text style={styles.tipText}>Maksimal: 60 soniya</Text>
              </View>

              <View style={styles.tipItem}>
                <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                <Text style={styles.tipText}>
                  Yaxshi yoritilgan joyda suratga oling
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
