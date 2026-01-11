import { styles } from "@/hooks/add-video/styles";
import { useAddVideo } from "@/hooks/add-video/use-add-video";
import { ResizeMode, Video } from "expo-av";
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
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Video Yuklash</Text>
          <Text style={styles.headerSubtitle}>
            60 soniyagacha video yuboring
          </Text>
        </View>

        {selectedVideo ? (
          <View style={styles.formContainer}>
            <View style={styles.videoPreview}>
              <Video
                ref={videoRef}
                source={{ uri: selectedVideo.uri }}
                style={styles.video}
                resizeMode={ResizeMode.COVER}
                isLooping
                onPlaybackStatusUpdate={(status) => {
                  if ("isPlaying" in status) {
                    // status.isPlaying is available; playback state is managed inside the hook
                  }
                }}
              />

              <TouchableOpacity style={styles.playButton} onPress={togglePlay}>
                <Text style={styles.playIcon}>{isPlaying ? "⏸" : "▶"}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.clearBtn} onPress={clearVideo}>
                <Text style={styles.clearIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            {isUploading && uploadProgress > 0 && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${uploadProgress}%` },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>{uploadProgress}%</Text>
              </View>
            )}

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

            <View style={styles.section}>
              <Text style={styles.label}>⚙️ Sifat</Text>
              <View style={styles.qualityRow}>
                {["SD", "HD", "4K"].map((q) => (
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

            <View style={styles.section}>
              <View style={styles.toggleItem}>
                <Text style={styles.toggleLabel}>🌍 Ommaviy Video</Text>
                <Switch
                  value={isPublic}
                  onValueChange={setIsPublic}
                  trackColor={{ false: "#ccc", true: "#4CAF50" }}
                />
              </View>

              <View style={styles.toggleItem}>
                <Text style={styles.toggleLabel}>💬 Izohlar</Text>
                <Switch
                  value={allowComments}
                  onValueChange={setAllowComments}
                  trackColor={{ false: "#ccc", true: "#4CAF50" }}
                />
              </View>

              <View style={styles.toggleItem}>
                <Text style={styles.toggleLabel}>❤️ Like'lar</Text>
                <Switch
                  value={allowLikes}
                  onValueChange={setAllowLikes}
                  trackColor={{ false: "#ccc", true: "#4CAF50" }}
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.advancedBtn}
              onPress={() => setShowAdvanced(!showAdvanced)}
            >
              <Text style={styles.advancedText}>
                {showAdvanced ? "▼" : "▶"}{" "}
                {showAdvanced ? "Kamroq Sozlamalar" : "Ko'proq Sozlamalar"}
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
                    onSubmitEditing={addTag}
                  />
                  <TouchableOpacity style={styles.addTagBtn} onPress={addTag}>
                    <Text style={styles.addTagText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.uploadBtn,
                isUploading && styles.uploadBtnDisabled,
              ]}
              onPress={handleUpload}
              disabled={isUploading || uploadProgress > 0}
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
              <Text style={styles.optionDesc}>
                Telefoningizdagi videolardan birini tanlang
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionCard} onPress={recordVideo}>
              <Text style={styles.optionIcon}>🎥</Text>
              <Text style={styles.optionTitle}>Video Yozish</Text>
              <Text style={styles.optionDesc}>
                Kamera orqali yangi video yarating
              </Text>
            </TouchableOpacity>

            <View style={styles.tipsContainer}>
              <Text style={styles.tipsTitle}>💡 Maslahatlar:</Text>
              <Text style={styles.tipText}>✓ 9:16 format tavsiya etiladi</Text>
              <Text style={styles.tipText}>
                ✓ Maksimal davomiyligi: 60 soniya
              </Text>
              <Text style={styles.tipText}>✓ Yorug'lik yaxshi bo'lsin</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
