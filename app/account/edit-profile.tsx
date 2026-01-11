import api from "@/config/api";
import { useCheckAuth } from "@/hooks/check-auth";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as ImagePicker from "expo-image-picker"; // ImagePicker qo'shildi
import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  LayoutAnimation,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface ProfileDto {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  dateJoined: string;
  accountStatus: string;
  avatar: string;
}

const primaryColor = "#5e5ce6";
const dangerColor = "#ff3b5c";
const activeColor = "#00ff99";
const screenHeight = Dimensions.get("window").height;

interface CustomModalProps {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const CustomAnimatedModal: React.FC<CustomModalProps> = ({
  isVisible,
  onClose,
  title,
  children,
}) => {
  const [slideAnim] = useState(new Animated.Value(screenHeight));

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isVisible ? 0 : screenHeight,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, [isVisible]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: screenHeight,
      duration: 300,
      useNativeDriver: true,
    }).start(onClose);
  };

  if (!isVisible && slideAnim._value === screenHeight) return null;

  return (
    <Modal
      transparent
      visible={isVisible}
      onRequestClose={handleClose}
      animationType="fade"
    >
      <BlurView intensity={20} tint="dark" style={modalStyles.backdrop}>
        <Animated.View
          style={[
            modalStyles.modalContainer,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <BlurView intensity={60} tint="dark" style={modalStyles.modalCard}>
            <View style={modalStyles.header}>
              <Text style={modalStyles.title}>{title}</Text>
              <TouchableOpacity
                onPress={handleClose}
                style={modalStyles.closeButton}
              >
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            <View style={modalStyles.content}>{children}</View>
          </BlurView>
        </Animated.View>
      </BlurView>
    </Modal>
  );
};

interface ChangeInputModalProps {
  onClose: () => void;
  profile: ProfileDto;
  field: "firstName" | "lastName" | "username" | "phone";
  onUpdate: (data: Partial<ProfileDto>) => Promise<void>;
  loading: boolean;
}

const ChangeInputModal: React.FC<ChangeInputModalProps> = ({
  onClose,
  profile,
  field,
  onUpdate,
  loading,
}) => {
  const [newValue, setNewValue] = useState(profile[field] || "");

  const labels: Record<
    typeof field,
    {
      label: string;
      placeholder: string;
      keyboardType?: "default" | "phone-pad";
    }
  > = {
    firstName: { label: "Ism", placeholder: "Yangi ism" },
    lastName: { label: "Familiya", placeholder: "Yangi familiya" },
    username: {
      label: "Foydalanuvchi nomi",
      placeholder: "yangi_foydalanuvchi",
    },
    phone: {
      label: "Telefon raqami",
      placeholder: "+998 xx xxx xx xx",
      keyboardType: "phone-pad",
    },
  };

  const config = labels[field];

  const handleSave = async () => {
    const trimmed = newValue.trim();
    if (!trimmed)
      return Alert.alert("Xato", `${config.label} bo'sh bo'lishi mumkin emas.`);
    if (trimmed === profile[field])
      return Alert.alert("Ogohlantirish", "Hech qanday o'zgarish yo'q.");

    await onUpdate({ [field]: trimmed });
    onClose();
  };

  return (
    <View style={modalStyles.formContainer}>
      <Text style={modalStyles.label}>Hozirgi {config.label}:</Text>
      <Text style={modalStyles.currentValueText}>{profile[field]}</Text>

      <Text style={modalStyles.label}>Yangi {config.label}:</Text>
      <TextInput
        style={modalStyles.input}
        value={newValue}
        onChangeText={setNewValue}
        placeholder={config.placeholder}
        placeholderTextColor="#999"
        keyboardType={config.keyboardType || "default"}
        autoCapitalize={field === "username" ? "none" : "words"}
        editable={!loading}
      />

      <TouchableOpacity
        style={[
          modalStyles.saveButton,
          loading && modalStyles.saveButtonDisabled,
        ]}
        onPress={handleSave}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={modalStyles.saveButtonText}>Saqlash</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default function AccountSettingsScreen() {
  const { user, loading: authLoading } = useCheckAuth();
  const [profile, setProfile] = useState<ProfileDto | null>(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [activeModal, setActiveModal] = useState<
    "name" | "username" | "phone" | null
  >(null);

  useEffect(() => {
    if (user?.profile) {
      setProfile({
        ...(user.profile as ProfileDto),
        avatar: (user.profile as ProfileDto).avatar || "",
      });
    }
  }, [user]);

  const updateProfileField = async (
    data: Partial<ProfileDto> | { image: ImagePicker.ImagePickerAsset },
    profile: ProfileDto,
    setProfile: (profile: ProfileDto) => void,
    setApiLoading: (loading: boolean) => void
  ) => {
    if (!profile) return;
    setApiLoading(true);

    try {
      let response;

      if ("image" in data) {
        // ✅ Rasm upload qilish
        const { image } = data;
        const uriParts = image.uri.split(".");
        const fileType = uriParts[uriParts.length - 1];

        const formData = new FormData();
        formData.append("file", {
          uri: image.uri,
          name: `avatar.${fileType}`,
          type: `image/${fileType}`,
        } as any);

        // API chaqiruvi
        response = await api.post(`/profile/upload-avatar`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        response = await api.patch(`/profile/update`, data);
      }

      setProfile({ ...profile, ...response.data.profile });
      Alert.alert("✅ Muvaffaqiyat", "Maʼlumotlar yangilandi.");
    } catch (err: any) {
      const msg =
        err.response?.data?.message || err.message || "Xatolik yuz berdi";
      Alert.alert("❌ Xato", msg);
    } finally {
      setApiLoading(false);
    }
  };

  const handleImagePick = async () => {
    if (apiLoading) return;

    // Ruxsat so'rash (faqat iOS va ba'zi Android versiyalarida kerak)
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Ruxsat yoʻq",
        "Rasm tanlash uchun kutubxonaga kirishga ruxsat berishingiz kerak."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      await updateProfileField(
        { image: result.assets[0] },
        profile!, // hozirgi profile state
        setProfile, // setState funksiyasi
        setApiLoading // loading state funksiyasi
      );
    }
  };

  useEffect(() => {
    const hide = Keyboard.addListener("keyboardDidHide", () => {
      LayoutAnimation.configureNext(
        LayoutAnimation.create(0, "easeInEaseOut", "opacity")
      );
    });

    return () => hide.remove();
  }, []);

  if (authLoading || !profile) {
    return (
      <View
        style={[
          styles.fullContainer,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#fff" />
        <Text style={{ color: "#fff", marginTop: 10 }}>Yuklanmoqda...</Text>
      </View>
    );
  }

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("uz-UZ", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  return (
    <View style={styles.fullContainer}>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        style={styles.fullContainer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          contentInsetAdjustmentBehavior="never"
          keyboardShouldPersistTaps="handled"
        >
          <BlurView intensity={80} tint="dark" style={styles.header}>
            <TouchableOpacity style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Akkaunt Sozlamalari</Text>
            <View style={styles.backButton} />
          </BlurView>

          <View style={styles.userInfoCard}>
            <TouchableOpacity
              onPress={handleImagePick}
              style={styles.avatarContainer}
              disabled={apiLoading}
            >
              {profile.avatar ? (
                <Image
                  source={{ uri: profile.avatar }}
                  style={styles.avatarImage}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons
                    name="person-circle-outline"
                    size={70}
                    color="#fff"
                  />
                </View>
              )}
              {apiLoading ? (
                <ActivityIndicator
                  size="small"
                  color="#fff"
                  style={styles.avatarOverlay}
                />
              ) : (
                <View style={styles.cameraIconContainer}>
                  <Ionicons name="camera" size={18} color="#fff" />
                </View>
              )}
            </TouchableOpacity>

            <Text
              style={styles.fullNameText}
            >{`${profile.firstName} ${profile.lastName}`}</Text>
            <Text style={styles.usernameText}>@{profile.username}</Text>
          </View>

          <BlurView intensity={60} tint="dark" style={styles.statusCard}>
            <View style={styles.statusIndicator}>
              <Ionicons name="shield-checkmark" size={20} color={activeColor} />
              <Text style={styles.statusText}>{profile.accountStatus}</Text>
            </View>
            <Text style={styles.statusSubtext}>
              Akkauntingiz faol va xavfsiz
            </Text>
          </BlurView>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Asosiy Ma'lumotlar</Text>
            <BlurView intensity={40} tint="dark" style={styles.settingCard}>
              <TouchableOpacity
                style={styles.fullRowButton}
                onPress={() => setActiveModal("name")}
              >
                <View style={styles.flexOne}>
                  <Text style={styles.settingLabel}>Ism va Familiya</Text>
                  <Text
                    style={styles.settingValue}
                  >{`${profile.firstName} ${profile.lastName}`}</Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={primaryColor}
                />
              </TouchableOpacity>

              <View style={styles.separator} />

              <TouchableOpacity
                style={styles.fullRowButton}
                onPress={() => setActiveModal("username")}
              >
                <View style={styles.flexOne}>
                  <Text style={styles.settingLabel}>Foydalanuvchi Nomi</Text>
                  <Text style={styles.settingValue}>@{profile.username}</Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={primaryColor}
                />
              </TouchableOpacity>

              <View style={styles.separator} />

              <View style={styles.settingRow}>
                <View style={styles.flexOne}>
                  <Text style={styles.settingLabel}>Email</Text>
                  <Text style={styles.settingValueDisabled}>{user?.email}</Text>
                </View>
                <Ionicons name="lock-closed-outline" size={20} color="#555" />
              </View>
            </BlurView>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Kontakt</Text>
            <BlurView intensity={40} tint="dark" style={styles.settingCard}>
              <View style={styles.settingRow}>
                <View style={styles.flexOne}>
                  <Text style={styles.settingLabel}>Telefon</Text>
                  <Text style={styles.settingValue}>
                    {showPhone ? profile.phone : "+998 ••• ••• ••••"}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowPhone(!showPhone)}
                  style={styles.iconButton}
                >
                  <Ionicons
                    name={showPhone ? "eye-off-outline" : "eye-outline"}
                    size={22}
                    color={primaryColor}
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.separator} />
              <TouchableOpacity
                style={styles.changeButton}
                onPress={() => setActiveModal("phone")}
              >
                <Text style={styles.changeButtonText}>
                  Raqamni o'zgartirish
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={primaryColor}
                />
              </TouchableOpacity>
            </BlurView>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Akkaunt Detallari</Text>
            <BlurView intensity={40} tint="dark" style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Qo'shilgan sana:</Text>
                <Text style={styles.infoValue}>
                  {formatDate(profile.dateJoined)}
                </Text>
              </View>
              <View style={styles.separator} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>ID:</Text>
                <Text style={styles.infoValue}>#{profile.id}</Text>
              </View>
            </BlurView>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Xavfli Zona</Text>
            <BlurView intensity={40} tint="dark" style={styles.dangerCard}>
              <TouchableOpacity style={styles.dangerButton}>
                <Ionicons
                  name="log-out-outline"
                  size={22}
                  color={dangerColor}
                />
                <Text style={styles.dangerButtonText}>
                  Barcha sessiyalardan chiqish
                </Text>
              </TouchableOpacity>
            </BlurView>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <CustomAnimatedModal
        isVisible={activeModal === "name"}
        onClose={() => setActiveModal(null)}
        title="Ism va Familiya"
      >
        <ChangeInputModal
          profile={profile}
          field="firstName"
          loading={apiLoading}
          onUpdate={async (data: Partial<ProfileDto>) => {
            if (!profile) return;
            await updateProfileField(data, profile, setProfile, setApiLoading);
          }}
          onClose={() => setActiveModal(null)}
        />

        <ChangeInputModal
          profile={profile}
          field="lastName"
          loading={apiLoading}
          onUpdate={async (data: Partial<ProfileDto>) => {
            if (!profile) return;
            await updateProfileField(data, profile, setProfile, setApiLoading);
          }}
          onClose={() => setActiveModal(null)}
        />
      </CustomAnimatedModal>

      <CustomAnimatedModal
        isVisible={activeModal === "username"}
        onClose={() => setActiveModal(null)}
        title="Foydalanuvchi Nomi"
      >
        <ChangeInputModal
          profile={profile}
          field="username"
          loading={apiLoading}
          onUpdate={async (data: Partial<ProfileDto>) => {
            if (!profile) return;
            await updateProfileField(data, profile, setProfile, setApiLoading);
          }}
          onClose={() => setActiveModal(null)}
        />
      </CustomAnimatedModal>

      <CustomAnimatedModal
        isVisible={activeModal === "phone"}
        onClose={() => setActiveModal(null)}
        title="Telefon Raqami"
      >
        <ChangeInputModal
          profile={profile}
          field="phone"
          loading={apiLoading}
          onUpdate={async (data: Partial<ProfileDto>) => {
            if (!profile) return;
            await updateProfileField(data, profile, setProfile, setApiLoading);
          }}
          onClose={() => setActiveModal(null)}
        />
      </CustomAnimatedModal>
    </View>
  );
}

const styles = StyleSheet.create({
  fullContainer: { flex: 1, backgroundColor: "#000" },
  scrollContent: { paddingBottom: 40, paddingHorizontal: 16 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    marginBottom: 20,
    backgroundColor: "rgba(0,0,0,0.8)",
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  backButton: { padding: 4 },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
  userInfoCard: { alignItems: "center", marginBottom: 30 },
  // ✅ Avatarga yangi stillar qo'shildi
  avatarContainer: {
    width: 90, // Kattaroq qilish
    height: 90, // Kattaroq qilish
    borderRadius: 45,
    marginBottom: 10,
    borderWidth: 3,
    borderColor: primaryColor, // Asosiy rang bilan border
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 45,
    resizeMode: "cover",
  },
  cameraIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: primaryColor,
    borderRadius: 15,
    padding: 5,
    borderWidth: 2,
    borderColor: "#000",
  },
  avatarOverlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
  },
  // ✅ Avatar stili tugadi
  fullNameText: { color: "#fff", fontSize: 22, fontWeight: "700" },
  usernameText: { color: "#aaa", fontSize: 14, marginTop: 4 },
  statusCard: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderWidth: 1,
    borderColor: activeColor + "30",
    marginBottom: 30,
  },
  statusIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  statusText: {
    color: activeColor,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  statusSubtext: { color: "#bbb", fontSize: 13 },
  section: { marginBottom: 25 },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  settingCard: {
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  fullRowButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  flexOne: { flex: 1 },
  settingLabel: { color: "#aaa", fontSize: 13, marginBottom: 2 },
  settingValue: { color: "#fff", fontSize: 16, fontWeight: "500" },
  settingValueDisabled: { color: "#777", fontSize: 16, fontWeight: "500" },
  iconButton: { padding: 8 },
  changeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  changeButtonText: { color: primaryColor, fontSize: 15, fontWeight: "600" },
  separator: { height: 1, backgroundColor: "rgba(255,255,255,0.05)" },
  infoCard: {
    padding: 15,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  infoLabel: { color: "#aaa", fontSize: 14 },
  infoValue: { color: "#fff", fontSize: 14, fontWeight: "500" },
  dangerCard: {
    padding: 15,
    borderRadius: 12,
    backgroundColor: "rgba(255,59,92,0.1)",
    borderWidth: 1,
    borderColor: dangerColor + "30",
  },
  dangerButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  dangerButtonText: {
    color: dangerColor,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 12,
  },
});

const modalStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalContainer: { width: "100%", paddingTop: 10 },
  modalCard: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
    backgroundColor: "rgba(0,0,0,0.8)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
    marginBottom: 15,
  },
  title: { color: "#fff", fontSize: 20, fontWeight: "700" },
  closeButton: { padding: 5 },
  content: { paddingHorizontal: 5 },
  formContainer: { width: "100%" },
  label: {
    color: "#aaa",
    fontSize: 14,
    fontWeight: "500",
    marginTop: 15,
    marginBottom: 5,
  },
  currentValueText: {
    color: activeColor,
    fontSize: 16,
    fontWeight: "600",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 10,
    paddingHorizontal: 15,
    color: "#fff",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  saveButton: {
    backgroundColor: primaryColor,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 30,
    shadowColor: primaryColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  saveButtonDisabled: { backgroundColor: "gray", shadowOpacity: 0 },
  saveButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
