import api from "@/config/api";
import { Video } from "expo-av";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useRef, useState } from "react";
import { Alert } from "react-native";

const MAX_VIDEO_DURATION = 60; // seconds

export const useAddVideo = () => {
  const [selectedVideo, setSelectedVideo] = useState<{
    uri: string;
    name: string;
  } | null>(null);
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [description, setDescription] = useState("");
  const [quality, setQuality] = useState("HD");
  const [isPublic, setIsPublic] = useState(true);
  const [allowComments, setAllowComments] = useState(true);
  const [allowLikes, setAllowLikes] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<Video>(null);

  const categories = [
    "Comedy",
    "Music",
    "Education",
    "Gaming",
    "Sports",
    "Vlog",
    "Art",
    "Other",
  ];

  const resetForm = useCallback(() => {
    setSelectedVideo(null);
    setCaption("");
    setCategory("");
    setHashtags("");
    setDescription("");
    setTags([]);
    setTagInput("");
    setShowAdvanced(false);
    setIsPlaying(false);
    setUploadProgress(0);
  }, []);

  const clearVideo = useCallback(() => {
    setSelectedVideo(null);
    setCaption("");
    setCategory("");
    setUploadProgress(0);
  }, []);

  const requestPermissions = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Ruxsat kerak",
        "Iltimos, galereyaga kirish uchun ruxsat bering"
      );
      return false;
    }
    return true;
  }, []);

  const pickVideo = useCallback(async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      aspect: [9, 16],
      quality: 1,
      videoMaxDuration: MAX_VIDEO_DURATION,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedVideo({
        uri: result.assets[0].uri,
        name: result.assets[0].fileName || `video_${Date.now()}.mp4`,
      });
    }
  }, [requestPermissions]);

  const recordVideo = useCallback(async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Ruxsat kerak",
        "Iltimos, kameraga kirish uchun ruxsat bering"
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      aspect: [9, 16],
      quality: 1,
      videoMaxDuration: MAX_VIDEO_DURATION,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedVideo({
        uri: result.assets[0].uri,
        name: result.assets[0]?.fileName || `video_${Date.now()}.mp4`,
      });
    }
  }, [requestPermissions]);

  const uploadVideoToBlob = useCallback(async (): Promise<string> => {
    if (!selectedVideo) throw new Error("Video tanlanmagan");

    try {
      const formData = new FormData();
      formData.append("file", {
        uri: selectedVideo.uri,
        type: "video/mp4",
        name: selectedVideo.name,
      } as any);

      setUploadProgress(0);

      const response = await api.post("/uploads", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent: any) => {
          const progress = Math.round(
            (progressEvent.loaded / progressEvent.total) * 100
          );
          setUploadProgress(progress);
        },
      });

      if (response.data?.file?.url) {
        return response.data.file.url;
      }

      throw new Error("Video URL qaytmadi");
    } catch (error: any) {
      console.error("Video upload xatosi:", error);
      throw error;
    }
  }, [selectedVideo]);

  const addTag = useCallback(() => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags((prev) => [...prev, tagInput.trim()]);
      setTagInput("");
    }
  }, [tagInput, tags]);

  const removeTag = useCallback((index: number) => {
    setTags((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const togglePlay = useCallback(async () => {
    if (videoRef.current) {
      if (isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const handleUpload = useCallback(async () => {
    if (!selectedVideo) {
      Alert.alert("Xato", "Iltimos, video tanlang");
      return;
    }

    if (!caption.trim()) {
      Alert.alert("Xato", "Iltimos, tavsif kiriting");
      return;
    }

    if (!category) {
      Alert.alert("Xato", "Iltimos, kategoriya tanlang");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      Alert.alert("Yuklash boshlandi", "Video yuklanyapti...");
      const videoUrl = await uploadVideoToBlob();

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

      const response = await api.post("/posts", uploadData);

      if (response.data?.id || response.status === 201) {
        setUploadSuccess(true);
        setTimeout(() => {
          resetForm();
          setUploadSuccess(false);
        }, 2000);
      }
    } catch (error: any) {
      console.error("Upload xatosi:", error);
      Alert.alert(
        "Xato",
        error?.response?.data?.message ||
          error?.message ||
          "Video yuklashda xato yuz berdi"
      );
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [
    selectedVideo,
    caption,
    category,
    hashtags,
    description,
    isPublic,
    allowComments,
    allowLikes,
    quality,
    tags,
    uploadVideoToBlob,
    resetForm,
  ]);

  return {
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
  };
};
