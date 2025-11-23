import api from '@/config/api';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, Stack } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

// Custom Icon Components
const LockIcon = () => (
  <View style={styles.customIconLarge}>
    <View style={styles.lockBody} />
    <View style={styles.lockShackle} />
  </View>
);

const EmailIcon = () => (
  <View style={styles.customIconSmall}>
    <View style={styles.envelope}>
      <View style={styles.envelopeFront} />
    </View>
  </View>
);

const PasswordIcon = () => (
  <View style={styles.customIconSmall}>
    <View style={styles.padlock}>
      <View style={styles.padlockTop} />
      <View style={styles.padlockBody} />
    </View>
  </View>
);

const PlayIcon = () => (
  <View style={styles.playButton}>
    <View style={styles.playTriangle} />
  </View>
);

const UserIcon = () => (
  <View style={styles.customIconMedium}>
    <View style={styles.userHead} />
    <View style={styles.userBody} />
  </View>
);

const SuccessCheckIcon = () => (
  <View style={styles.successCircle}>
    <View style={styles.checkMark} />
  </View>
);

const ErrorXIcon = () => (
  <View style={styles.errorCircle}>
    <View style={styles.xMark} />
  </View>
);

export default function AuthApp() {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  // Register form state
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Animation on step change
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
  }, [currentStep, fadeAnim, slideAnim, scaleAnim]);

  // Rotate animation for loading
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

  const handleChooseAuth = (type: any) => {
    setError('');
    setSuccess('');
    setCurrentStep(type === 'login' ? 1 : 2);
  };

  const handleLogin = async () => {
    setError('');
    setSuccess('');

    if (!loginData.email.trim() || !loginData.password.trim()) {
      setError('Email va parol majburiy!');
      return;
    }

    if (!loginData.email.toLowerCase().endsWith('@gmail.com')) {
      setError('Faqat @gmail.com email orqali kirish mumkin!');
      return;
    }

    if (loginData.password.length < 6) {
      setError('Parol kamida 6 ta belgidan iborat bo\'lishi kerak!');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(`/auth/login`, {
        email: loginData.email,
        password: loginData.password,
      });
      console.log('access_token', response.data.access_token);
      console.log('refresh_token', response.data.refresh_token);

      await AsyncStorage.setItem('access_token', response.data.access_token);
      await AsyncStorage.setItem('refresh_token', response.data.refresh_token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));

      setSuccess('✅ Login muvaffaqiyatli!');
      setLoginData({ email: '', password: '' });

      setTimeout(() => {
        router.navigate('/');
      }, 1500);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Login xatosi!';
      setError(errorMsg);
      Alert.alert('Xato', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setError('');
    setSuccess('');

    if (
      !registerData.email.trim() ||
      !registerData.password.trim() ||
      !registerData.confirmPassword.trim()
    ) {
      setError('Barcha maydonlar majburiy!');
      return;
    }

    if (!registerData.email.toLowerCase().endsWith('@gmail.com')) {
      setError('Faqat @gmail.com email orqali ro\'yxatdan o\'tish mumkin!');
      return;
    }

    if (registerData.password.length < 6) {
      setError('Parol kamida 6 ta belgidan iborat bo\'lishi kerak!');
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setError('Parollar mos kelmadi!');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(`/auth/register`, {
        email: registerData.email,
        password: registerData.password,
        confirmPassword: registerData.confirmPassword,
      });



      await AsyncStorage.setItem('access_token', response.data.access_token);
      await AsyncStorage.setItem('refresh_token', response.data.refresh_token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));

      setSuccess('✅ Ro\'yxatdan o\'tish muvaffaqiyatli!');
      setRegisterData({ email: '', password: '', confirmPassword: '' });

      setTimeout(() => {
        router.navigate('/');
      }, 1500);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Ro\'yxatdan o\'tish xatosi!';
      setError(errorMsg);
      Alert.alert('Xato', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    setCurrentStep(0);
    setError('');
    setSuccess('');
    setLoginData({ email: '', password: '' });
    setRegisterData({ email: '', password: '', confirmPassword: '' });
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.backgroundGradient} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Step 0: Choose Authentication Type */}
        {currentStep === 0 && (
          <Animated.View
            style={[
              styles.stepContainer,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { scale: scaleAnim },
                ],
              },
            ]}
          >
            {/* Animated Background Elements */}
            <View style={styles.floatingOrb1} />
            <View style={styles.floatingOrb2} />
            <View style={styles.floatingOrb3} />

            {/* Header Icon */}
            <View style={styles.iconContainer}>
              <View style={styles.iconCircleGradient}>
                <LockIcon />
              </View>
            </View>

            {/* Title */}
            <Text style={styles.mainTitle}>PlayVibe</Text>
            <Text style={styles.tagline}>Video Platformasi</Text>
            <Text style={styles.subtitle}>Xush Kelibsiz! 👋</Text>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.largeButton, styles.blueGradient]}
              onPress={() => handleChooseAuth('login')}
              activeOpacity={0.85}
            >
              <View style={styles.buttonContent}>
                <View style={styles.buttonIconBox}>
                  <PlayIcon />
                </View>
                <Text style={styles.largeButtonText}>Kirish</Text>
                <Ionicons name="chevron-forward" size={20} color="#fff" />
              </View>
            </TouchableOpacity>

            {/* Register Button */}
            <TouchableOpacity
              style={[styles.largeButton, styles.pinkGradient]}
              onPress={() => handleChooseAuth('register')}
              activeOpacity={0.85}
            >
              <View style={styles.buttonContent}>
                <View style={styles.buttonIconBox}>
                  <UserIcon />
                </View>
                <Text style={styles.largeButtonText}>Ro'yxatdan O'tish</Text>
                <Ionicons name="chevron-forward" size={20} color="#fff" />
              </View>
            </TouchableOpacity>

            {/* Info Box */}
            <View style={styles.infoBox}>
              <View style={styles.infoDot} />
              <Text style={styles.infoText}>Faqat @gmail.com email orqali ro'yxatdan o'ting</Text>
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
                transform: [
                  { translateY: slideAnim },
                  { scale: scaleAnim },
                ],
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
                  <Ionicons name="chevron-back" size={28} color="#60a5fa" />
                </View>
              </TouchableOpacity>
              <Text style={styles.formTitle}>Kirish</Text>
              <View style={{ width: 40 }} />
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
                    name={showPassword ? 'eye' : 'eye-off'}
                    size={20}
                    color="#60a5fa"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Error Message */}
            {error && (
              <Animated.View
                style={[styles.errorBox, {
                  transform: [{ scale: scaleAnim }]
                }]}
              >
                <ErrorXIcon />
                <Text style={styles.errorText}>{error}</Text>
              </Animated.View>
            )}

            {/* Success Message */}
            {success && (
              <Animated.View style={[styles.successBox, {
                transform: [{ scale: scaleAnim }]
              }]}>
                <SuccessCheckIcon />
                <Text style={styles.successText}>{success}</Text>
              </Animated.View>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                styles.blueGradient,
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
              <TouchableOpacity onPress={() => handleChooseAuth('register')}>
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
                transform: [
                  { translateY: slideAnim },
                  { scale: scaleAnim },
                ],
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
                  <Ionicons name="chevron-back" size={28} color="#ec4899" />
                </View>
              </TouchableOpacity>
              <Text style={styles.formTitle}>Ro'yxatdan O'tish</Text>
              <View style={{ width: 40 }} />
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
                    name={showPassword ? 'eye' : 'eye-off'}
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
                  onPress={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye' : 'eye-off'}
                    size={20}
                    color="#ec4899"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Error Message */}
            {error && (
              <Animated.View
                style={[styles.errorBox, {
                  transform: [{ scale: scaleAnim }]
                }]}
              >
                <ErrorXIcon />
                <Text style={styles.errorText}>{error}</Text>
              </Animated.View>
            )}

            {/* Success Message */}
            {success && (
              <Animated.View style={[styles.successBox, { transform: [{ scale: scaleAnim }] }]}>
                <SuccessCheckIcon />
                <Text style={styles.successText}>{success}</Text>
              </Animated.View>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                styles.pinkGradient,
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
              <Text style={styles.switchText}>Allaqachon akkauntingiz bor? </Text>
              <TouchableOpacity onPress={() => handleChooseAuth('login')}>
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
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0f172a',
    opacity: 0.95,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  stepContainer: {
    flex: 1,
  },

  // Floating Orbs
  floatingOrb1: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    top: -30,
    right: -30,
  },
  floatingOrb2: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(236, 72, 153, 0.1)',
    bottom: 50,
    left: -40,
  },
  floatingOrb3: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    bottom: -50,
    right: -50,
  },

  // Custom Icons
  customIconLarge: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockBody: {
    width: 32,
    height: 28,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    position: 'absolute',
    bottom: 5,
  },
  lockShackle: {
    width: 20,
    height: 22,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    position: 'absolute',
    top: 2,
  },
  customIconSmall: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  envelope: {
    width: 24,
    height: 18,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 2,
  },
  envelopeFront: {
    width: 20,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
    marginLeft: 2,
  },
  padlock: {
    width: 20,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  padlockTop: {
    width: 14,
    height: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    borderBottomWidth: 0,
    borderRadius: 7,
  },
  padlockBody: {
    width: 18,
    height: 14,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 2,
    marginTop: -6,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playTriangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 8,
    borderRightWidth: 0,
    borderBottomWidth: 5,
    borderTopWidth: 5,
    borderLeftColor: '#fff',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderTopColor: 'transparent',
    marginLeft: 4,
  },
  customIconMedium: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userHead: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 2,
  },
  userBody: {
    width: 20,
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  successCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderWidth: 2,
    borderColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkMark: {
    width: 16,
    height: 8,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#22c55e',
    transform: [{ rotate: '-45deg' }],
  },
  errorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 2,
    borderColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  xMark: {
    width: 14,
    height: 2,
    backgroundColor: '#ef4444',
  },

  // Icon Containers
  iconContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconCircleGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },

  // Text Styles
  mainTitle: {
    fontSize: 40,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 13,
    fontWeight: '600',
    color: '#93c5fd',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 40,
  },

  // Button Styles
  blueGradient: {
    backgroundColor: '#3b82f6',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  pinkGradient: {
    backgroundColor: '#ec4899',
    shadowColor: '#ec4899',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  largeButton: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  buttonIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  largeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },

  // Info Box
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(96, 165, 250, 0.1)',
    borderRadius: 14,
    padding: 14,
    marginTop: 30,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  infoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#60a5fa',
    marginRight: 10,
  },
  infoText: {
    color: '#93c5fd',
    fontSize: 14,
    flex: 1,
  },

  // Form Styles
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(96, 165, 250, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
  },
  formSubtitle: {
    fontSize: 15,
    color: '#9ca3af',
    marginBottom: 28,
  },

  // Input Styles
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f1f5f9',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 2,
    borderColor: '#334155',
    overflow: 'hidden',
  },
  inputFocus: {
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputIcon: {
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 8,
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
  eyeIcon: {
    padding: 8,
    marginLeft: 8,
  },

  // Error & Success
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7f1d1d',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
    fontWeight: '500',
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#15803d',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#22c55e',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  successText: {
    color: '#86efac',
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
    fontWeight: '500',
  },

  // Submit Button
  submitButton: {
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 12,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginLeft: 8,
  },

  // Switch Links
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 12,
  },
  switchText: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '500',
  },
  switchLink: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '700',
  },
  switchLink2: {
    color: '#ec4899',
    fontSize: 14,
    fontWeight: '700',
  },
});