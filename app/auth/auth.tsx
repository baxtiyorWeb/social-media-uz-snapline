import api from "@/config/api";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, Stack } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

const LockIcon = () => (
  <Ionicons name="lock-closed-outline" size={36} color="#fff" />
);
const PlayIcon = () => <Ionicons name="play-circle" size={20} color="#fff" />;
const UserIcon = () => (
  <Ionicons name="person-circle-outline" size={20} color="#fff" />
);
const EmailIcon = () => (
  <Ionicons name="mail-outline" size={20} color="#94a3b8" />
);
const PasswordIcon = () => (
  <Ionicons name="key-outline" size={20} color="#94a3b8" />
);
const ErrorXIcon = () => (
  <Ionicons name="close-circle-outline" size={24} color="#ef4444" />
);
const SuccessCheckIcon = () => (
  <Ionicons name="checkmark-circle-outline" size={24} color="#22c55e" />
);

export default function AuthApp() {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  React.useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    scaleAnim.setValue(0.8);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentStep]);

  React.useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [loading, rotateAnim]);

  React.useEffect(() => {
    const hide = Keyboard.addListener("keyboardDidHide", () => {
      fadeAnim.stopAnimation();
      slideAnim.stopAnimation();
      scaleAnim.stopAnimation();
    });

    return () => hide.remove();
  }, []);

  const handleChooseAuth = (type: any) => {
    setError("");
    setSuccess("");
    setCurrentStep(type === "login" ? 1 : 2);
  };

  const handleLogin = async () => {
    setError("");
    setSuccess("");

    if (!loginData.email.trim() || !loginData.password.trim()) {
      setError("Email va parol majburiy!");
      return;
    }

    if (!loginData.email.toLowerCase().endsWith("@gmail.com")) {
      setError("Faqat @gmail.com email orqali kirish mumkin!");
      return;
    }

    if (loginData.password.length < 6) {
      setError("Parol kamida 6 ta belgidan iborat bo'lishi kerak!");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(`/auth/login`, {
        email: loginData.email,
        password: loginData.password,
      });
      console.log("access_token", response.data.access_token);
      console.log("refresh_token", response.data.refresh_token);

      await AsyncStorage.setItem("access_token", response.data.access_token);
      await AsyncStorage.setItem("refresh_token", response.data.refresh_token);
      await AsyncStorage.setItem("user", JSON.stringify(response.data.user));

      setSuccess("✅ Login muvaffaqiyatli!");
      setLoginData({ email: "", password: "" });

      setTimeout(() => {
        router.navigate("/");
      }, 1500);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Login xatosi!";
      setError(errorMsg);
      Alert.alert("Xato", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setError("");
    setSuccess("");

    if (
      !registerData.email.trim() ||
      !registerData.password.trim() ||
      !registerData.confirmPassword.trim()
    ) {
      setError("Barcha maydonlar majburiy!");
      return;
    }

    if (!registerData.email.toLowerCase().endsWith("@gmail.com")) {
      setError("Faqat @gmail.com email orqali ro'yxatdan o'tish mumkin!");
      return;
    }

    if (registerData.password.length < 6) {
      setError("Parol kamida 6 ta belgidan iborat bo'lishi kerak!");
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setError("Parollar mos kelmadi!");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(`/auth/register`, {
        email: registerData.email,
        password: registerData.password,
        confirmPassword: registerData.confirmPassword,
      });

      await AsyncStorage.setItem("access_token", response.data.access_token);
      await AsyncStorage.setItem("refresh_token", response.data.refresh_token);
      await AsyncStorage.setItem("user", JSON.stringify(response.data.user));

      setSuccess("✅ Ro'yxatdan o'tish muvaffaqiyatli!");
      setRegisterData({ email: "", password: "", confirmPassword: "" });

      setTimeout(() => {
        router.navigate("/");
      }, 1500);
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message || "Ro'yxatdan o'tish xatosi!";
      setError(errorMsg);
      Alert.alert("Xato", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    setCurrentStep(0);
    setError("");
    setSuccess("");
    setLoginData({ email: "", password: "" });
    setRegisterData({ email: "", password: "", confirmPassword: "" });
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
      >
        {/* Step 0: Choose Authentication Type */}
        {currentStep === 0 && (
          <Animated.View
            style={[
              styles.stepContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
              },
            ]}
          >
            {/* Animated Background Elements - Olib tashlandi (yangi styllarda yo'q) */}
            {/* <View style={styles.floatingOrb1} /> */}
            {/* <View style={styles.floatingOrb2} /> */}
            {/* <View style={styles.floatingOrb3} /> */}

            {/* Header Icon */}
            <View style={styles.iconContainer}>
              <View style={styles.iconCircle}>
                <LockIcon />
              </View>
            </View>

            {/* Title */}
            <Text style={styles.mainTitle}>Snappy</Text>
            <Text style={styles.tagline}>Snappy Ijtimoiy Tarmog&apos;i </Text>
            <Text style={styles.subtitle}>
              Xush Kelibsiz! Ilovadan foydalanish uchun kirish yoki ro'yxatdan
              o'tishni tanlang.
            </Text>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.largeButton, styles.blueSolid]} // blueGradient o'rniga blueSolid
              onPress={() => handleChooseAuth("login")}
              activeOpacity={0.85}
            >
              <View style={styles.buttonContent}>
                {/* buttonIconBox olib tashlandi, ikonka to'g'ridan-to'g'ri ishlatiladi */}
                <PlayIcon />
                <Text style={styles.largeButtonText}>Kirish</Text>
                <Ionicons name="chevron-forward" size={20} color="#fff" />
              </View>
            </TouchableOpacity>

            {/* Register Button */}
            <TouchableOpacity
              style={[styles.largeButton, styles.pinkSolid]} // pinkGradient o'rniga pinkSolid
              onPress={() => handleChooseAuth("register")}
              activeOpacity={0.85}
            >
              <View style={styles.buttonContent}>
                {/* buttonIconBox olib tashlandi, ikonka to'g'ridan-to'g'ri ishlatiladi */}
                <UserIcon />
                <Text style={styles.largeButtonText}>Ro'yxatdan O'tish</Text>
                <Ionicons name="chevron-forward" size={20} color="#fff" />
              </View>
            </TouchableOpacity>

            {/* Info Box */}
            <View style={styles.infoBox}>
              {/* infoDot o'rniga oddiy ikonka qo'shildi */}
              <Ionicons
                name="information-circle-outline"
                size={20}
                color="#60a5fa"
              />
              <Text style={styles.infoText}>
                Faqat @gmail.com email orqali ro'yxatdan o'ting
              </Text>
            </View>
          </Animated.View>
        )}

        {/* Step 1: Login */}
        {currentStep === 1 && (
          <Animated.View
            style={[
              styles.stepContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
              },
            ]}
          >
            {/* Header */}
            <View style={styles.formHeader}>
              <TouchableOpacity
                onPress={handleGoBack}
                style={styles.backButton}
              >
                <View style={styles.backIcon}>
                  <Ionicons name="chevron-back" size={24} color="#60a5fa" />
                </View>
              </TouchableOpacity>
              <Text style={styles.formTitle}>Kirish</Text>
              <View style={{ width: 44 }} />
            </View>

            <Text style={styles.formSubtitle}>Akkauntingizga kirish</Text>

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Manzili</Text>
              <View style={[styles.inputContainer, styles.inputFocus]}>
                <View style={styles.inputIcon}>
                  <EmailIcon />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="example@gmail.com"
                  placeholderTextColor="#6b7280"
                  value={loginData.email}
                  onChangeText={(text) =>
                    setLoginData({ ...loginData, email: text })
                  }
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Parol</Text>
              <View style={[styles.inputContainer, styles.inputFocus]}>
                <View style={styles.inputIcon}>
                  <PasswordIcon />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#6b7280"
                  value={loginData.password}
                  onChangeText={(text) =>
                    setLoginData({ ...loginData, password: text })
                  }
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showPassword ? "eye" : "eye-off"}
                    size={20}
                    color="#60a5fa"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Error Message */}
            {error && (
              <Animated.View
                style={[
                  styles.errorBox,
                  {
                    transform: [{ scale: scaleAnim }],
                  },
                ]}
              >
                <ErrorXIcon />
                <Text style={styles.errorText}>{error}</Text>
              </Animated.View>
            )}

            {/* Success Message */}
            {success && (
              <Animated.View
                style={[
                  styles.successBox,
                  {
                    transform: [{ scale: scaleAnim }],
                  },
                ]}
              >
                <SuccessCheckIcon />
                <Text style={styles.successText}>{success}</Text>
              </Animated.View>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                styles.blueSolid, // blueGradient o'rniga blueSolid
                loading && styles.buttonDisabled,
              ]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <Animated.View style={{ transform: [{ rotate: spin }] }}>
                  <ActivityIndicator color="#fff" size={24} />
                </Animated.View>
              ) : (
                <View style={styles.buttonContent}>
                  <PlayIcon />
                  <Text style={styles.submitButtonText}>Kirish</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Switch to Register */}
            <View style={styles.switchContainer}>
              <Text style={styles.switchText}>Akkauntingiz yo'qmi? </Text>
              <TouchableOpacity onPress={() => handleChooseAuth("register")}>
                <Text style={styles.switchLink}>Ro'yxatdan o'ting</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

        {/* Step 2: Register */}
        {currentStep === 2 && (
          <Animated.View
            style={[
              styles.stepContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
              },
            ]}
          >
            {/* Header */}
            <View style={styles.formHeader}>
              <TouchableOpacity
                onPress={handleGoBack}
                style={styles.backButton}
              >
                <View style={styles.backIcon}>
                  <Ionicons name="chevron-back" size={24} color="#ec4899" />
                </View>
              </TouchableOpacity>
              <Text style={styles.formTitle}>Ro'yxatdan O'tish</Text>
              <View style={{ width: 44 }} />
            </View>

            <Text style={styles.formSubtitle}>Yangi akkaunt yaratish</Text>

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Manzili</Text>
              <View style={[styles.inputContainer, styles.inputFocus]}>
                <View style={styles.inputIcon}>
                  <EmailIcon />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="example@gmail.com"
                  placeholderTextColor="#6b7280"
                  value={registerData.email}
                  onChangeText={(text) =>
                    setRegisterData({ ...registerData, email: text })
                  }
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Parol</Text>
              <View style={[styles.inputContainer, styles.inputFocus]}>
                <View style={styles.inputIcon}>
                  <PasswordIcon />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#6b7280"
                  value={registerData.password}
                  onChangeText={(text) =>
                    setRegisterData({ ...registerData, password: text })
                  }
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showPassword ? "eye" : "eye-off"}
                    size={20}
                    color="#ec4899"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Parolni Tasdiqlash</Text>
              <View style={[styles.inputContainer, styles.inputFocus]}>
                <View style={styles.inputIcon}>
                  <PasswordIcon />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#6b7280"
                  value={registerData.confirmPassword}
                  onChangeText={(text) =>
                    setRegisterData({
                      ...registerData,
                      confirmPassword: text,
                    })
                  }
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showConfirmPassword ? "eye" : "eye-off"}
                    size={20}
                    color="#ec4899"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Error Message */}
            {error && (
              <Animated.View
                style={[
                  styles.errorBox,
                  {
                    transform: [{ scale: scaleAnim }],
                  },
                ]}
              >
                <ErrorXIcon />
                <Text style={styles.errorText}>{error}</Text>
              </Animated.View>
            )}

            {/* Success Message */}
            {success && (
              <Animated.View
                style={[
                  styles.successBox,
                  { transform: [{ scale: scaleAnim }] },
                ]}
              >
                <SuccessCheckIcon />
                <Text style={styles.successText}>{success}</Text>
              </Animated.View>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                styles.pinkSolid, // pinkGradient o'rniga pinkSolid
                loading && styles.buttonDisabled,
              ]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <Animated.View style={{ transform: [{ rotate: spin }] }}>
                  <ActivityIndicator color="#fff" size={24} />
                </Animated.View>
              ) : (
                <View style={styles.buttonContent}>
                  <UserIcon />
                  <Text style={styles.submitButtonText}>Ro'yxatdan O'tish</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Switch to Login */}
            <View style={styles.switchContainer}>
              <Text style={styles.switchText}>
                Allaqachon akkauntingiz bor?{" "}
              </Text>
              <TouchableOpacity onPress={() => handleChooseAuth("login")}>
                <Text style={styles.switchLink2}>Kirish</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  // MARK: - Layout & Background
  container: {
    flex: 1,
    backgroundColor: "#0f172a", // Asosiy to'q fon
  },
  // backgroundGradient (Olib tashlangan - ortiqcha bezak)
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 50,
    paddingHorizontal: 25,
  },
  stepContainer: {
    flex: 1,
  },

  // MARK: - Floating Orbs (Olib tashlangan - kulgili bezak)

  // MARK: - Text Styles
  mainTitle: {
    fontSize: 32,
    fontWeight: "800", // Qalin, jiddiy
    color: "#fff",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: 0, // Katta harf oralig'i olib tashlangan
  },
  tagline: {
    fontSize: 14,
    fontWeight: "600",
    color: "#60a5fa", // Yumshoqroq rang
    textAlign: "center",
    marginBottom: 4,
    letterSpacing: 1.5, // Kichik harf oralig'i saqlangan (subtle accent)
    textTransform: "uppercase",
  },
  subtitle: {
    fontSize: 16,
    color: "#94a3b8", // Yumshoqroq kulrang
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 24,
  },

  // MARK: - Icon Containers
  iconContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  // iconCircleGradient - (Soddalashtirilgan)
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#334155", // To'qroq, tekis fon
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    // Shadowlar olib tashlangan/soddalashtirilgan
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  // Custom Icons (Olib tashlangan, o'rniga haqiqiy piktogramma komponentlari ishlatilishi kerak)
  placeholderIcon: {
    width: 36,
    height: 36,
    backgroundColor: "#94a3b8", // Joyni belgilash uchun oddiy rang
    borderRadius: 4,
  },

  // MARK: - Button Styles
  blueSolid: {
    backgroundColor: "#3b82f6", // Asosiy ko'k
    shadowColor: "#1d4ed8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  pinkSolid: {
    backgroundColor: "#ec4899",
    shadowColor: "#9d174d",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  largeButton: {
    borderRadius: 12, // Kichikroq radius
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center", // Markazga joylangan
  },
  // buttonIconBox (Olib tashlangan - ikonka to'g'ridan-to'g'ri matn bilan birga joylashtiriladi)
  largeButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    // flex: 1, // Olib tashlangan, markazga joylashish uchun
    textAlign: "center",
  },

  // MARK: - Info Box
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start", // Matn yuqoridan boshlanadi
    backgroundColor: "rgba(96, 165, 250, 0.15)", // Kuchliroq fon
    borderRadius: 8,
    padding: 15,
    marginTop: 30,
    borderLeftWidth: 4,
    borderLeftColor: "#3b82f6",
  },
  // infoDot (Olib tashlangan, ikonka/emoji ishlatilishi kerak)
  infoText: {
    color: "#93c5fd",
    fontSize: 15,
    flex: 1,
    marginLeft: 5,
    lineHeight: 22,
  },

  // MARK: - Form Styles
  formHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start", // Chapga surilgan
    marginBottom: 30,
  },
  backButton: {
    padding: 10,
    marginRight: 10,
  },
  backIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#1e293b", // Fonga yaqin rang
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  formTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: "#fff",
  },
  formSubtitle: {
    fontSize: 16,
    color: "#94a3b8",
    marginBottom: 25,
    lineHeight: 24,
  },

  // MARK: - Input Styles
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
    color: "#e2e8f0", // Oqroq rang
    marginBottom: 8,
    letterSpacing: 0,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e293b",
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1, // Yupqa, aniq chegaralar
    borderColor: "#334155",
  },
  inputFocus: {
    borderColor: "#3b82f6", // Fokuslangan chegaraning rangi
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  inputIcon: {
    marginRight: 10,
    color: "#94a3b8", // Ikonka uchun yumshoq kulrang
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    paddingHorizontal: 0, // Ichki padding olib tashlangan (inputContainer ga ko'chirildi)
    color: "#fff",
    fontSize: 16,
    fontWeight: "400",
  },
  eyeIcon: {
    padding: 8,
    marginLeft: 8,
    color: "#94a3b8",
  },

  // MARK: - Error & Success (Qorong'i rejim uchun o'zgartirilgan)
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(239, 68, 68, 0.15)", // Engil qizil fon
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#ef4444",
  },
  errorText: {
    color: "#fca5a5",
    fontSize: 15,
    marginLeft: 12,
    flex: 1,
    fontWeight: "400",
  },
  successBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(34, 197, 94, 0.15)", // Engil yashil fon
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#22c55e",
  },
  successText: {
    color: "#86efac",
    fontSize: 15,
    marginLeft: 12,
    flex: 1,
    fontWeight: "400",
  },

  // MARK: - Submit Button
  submitButton: {
    borderRadius: 12,
    paddingVertical: 18,
    marginTop: 20,
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.4, // Qattiqroq o'chirish
    backgroundColor: "#334155", // Kulrang fon
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
    // marginLeft: 8, // Olib tashlangan
  },

  // MARK: - Switch Links
  switchContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    paddingVertical: 10,
  },
  switchText: {
    color: "#94a3b8",
    fontSize: 15,
    fontWeight: "400",
    marginRight: 4,
  },
  switchLink: {
    color: "#60a5fa", // Asosiy ko'k rang
    fontSize: 15,
    fontWeight: "700",
  },
  switchLink2: {
    color: "#ec4899",
    fontSize: 15,
    fontWeight: "700",
  },
});
