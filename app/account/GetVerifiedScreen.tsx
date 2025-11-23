import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { styles } from '../../components/styles';






// ============ 4. GET VERIFIED SCREEN ============
export default function GetVerifiedScreen() {
  const [verificationStep, setVerificationStep] = useState(0);
  const [verificationData, setVerificationData] = useState({
    fullName: '',
    category: '',
    biography: '',
    documents: null,
  });

  const categories = ['Musiqachi', 'Aktyor', 'Sportchi', 'Blogger', 'Biznes', 'Boshqa'];

  return (
    <KeyboardAvoidingView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <BlurView intensity={80} tint="dark" style={styles.header}>
          <TouchableOpacity style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tasdiqlangan Badge Olish</Text>
          <View style={styles.backButton} />
        </BlurView>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          {[0, 1, 2].map((step) => (
            <View key={step} style={styles.progressWrapper}>
              <View
                style={[
                  styles.progressDot,
                  step <= verificationStep && styles.progressDotActive,
                ]}
              >
                {step < verificationStep ? (
                  <Ionicons name="checkmark" size={14} color="#fff" />
                ) : (
                  <Text style={styles.progressNumber}>{step + 1}</Text>
                )}
              </View>
              {step < 2 && (
                <View
                  style={[
                    styles.progressLine,
                    step < verificationStep && styles.progressLineActive,
                  ]}
                />
              )}
            </View>
          ))}
        </View>

        {/* Step Content */}
        {verificationStep === 0 && (
          <View style={styles.stepContent}>
            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={24} color="#3b82f6" />
              <View style={styles.infoText}>
                <Text style={styles.infoTitle}>Nima uchun Tasdiqlanish?</Text>
                <Text style={styles.infoDescription}>
                  Tasdiqlangan badge sizning shaxsiyatni tasdiqlab, hammaga tug'ri akkaunt
                  ekanligini ko'rsatadi
                </Text>
              </View>
            </View>

            <BlurView intensity={40} tint="dark" style={styles.benefitsCard}>
              <Text style={styles.benefitsTitle}>✨ Foydalari</Text>
              {[
                'Tasdiqlanishni ko\'rsatuvchi badge',
                'Amal ahamiyati ortadi',
                'Qo\'shimcha xavfsizlik',
                'Priority qo\'llab-quvvatlash',
              ].map((benefit, idx) => (
                <View key={idx} style={styles.benefitRow}>
                  <View style={styles.benefitDot} />
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))}
            </BlurView>
          </View>
        )}

        {verificationStep === 1 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>📋 Shaxsiy Ma'lumotlar</Text>
            <BlurView intensity={40} tint="dark" style={styles.formCard}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>To'liq Ismingiz</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ismingiz va Familiyangiz"
                  placeholderTextColor="#6b7280"
                  value={verificationData.fullName}
                  onChangeText={(text) =>
                    setVerificationData({ ...verificationData, fullName: text })
                  }
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Kategoriya</Text>
                <View style={styles.categoryGrid}>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categoryButton,
                        verificationData.category === cat &&
                        styles.categoryButtonActive,
                      ]}
                      onPress={() =>
                        setVerificationData({ ...verificationData, category: cat })
                      }
                    >
                      <Text
                        style={[
                          styles.categoryButtonText,
                          verificationData.category === cat &&
                          styles.categoryButtonTextActive,
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Bio</Text>
                <TextInput
                  style={[styles.input, styles.bioInput]}
                  placeholder="Qisqacha tavsif..."
                  placeholderTextColor="#6b7280"
                  value={verificationData.biography}
                  onChangeText={(text) =>
                    setVerificationData({ ...verificationData, biography: text })
                  }
                  multiline
                  maxLength={200}
                />
                <Text style={styles.charCount}>{verificationData.biography.length}/200</Text>
              </View>
            </BlurView>
          </View>
        )}

        {verificationStep === 2 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>📄 Hujjatlarni Yuklash</Text>
            <BlurView intensity={40} tint="dark" style={styles.uploadCard}>
              <TouchableOpacity style={styles.uploadArea}>
                <Ionicons name="cloud-upload-outline" size={48} color="#5e5ce6" />
                <Text style={styles.uploadText}>Hujjatlarni Tanlang</Text>
                <Text style={styles.uploadSubtext}>
                  Shaxsiy guvohnoma, pasport yoki boshqa rasmiy hujjat
                </Text>
              </TouchableOpacity>

              <View style={styles.requirementsBox}>
                <Text style={styles.requirementsTitle}>📋 Talablar:</Text>
                {[
                  'Rasmiy guvohnoma yoki pasport',
                  'Aniq ko\'rinadigan suratlar',
                  'JPG yoki PNG formatida',
                  'Maksimal 5 MB',
                ].map((req, idx) => (
                  <View key={idx} style={styles.requirementRow}>
                    <View style={styles.requirementDot} />
                    <Text style={styles.requirementText}>{req}</Text>
                  </View>
                ))}
              </View>
            </BlurView>
          </View>
        )}

        {/* Navigation Buttons */}
        <View style={styles.navigationButtons}>
          {verificationStep > 0 && (
            <TouchableOpacity
              style={styles.prevButton}
              onPress={() => setVerificationStep(verificationStep - 1)}
            >
              <Ionicons name="chevron-back" size={20} color="#fff" />
              <Text style={styles.navButtonText}>Oldingi</Text>
            </TouchableOpacity>
          )}

          {verificationStep < 2 ? (
            <TouchableOpacity
              style={styles.nextButton}
              onPress={() => setVerificationStep(verificationStep + 1)}
            >
              <Text style={styles.navButtonText}>Keyingi</Text>
              <Ionicons name="chevron-forward" size={20} color="#fff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.submitButton}>
              <Ionicons name="checkmark-done" size={20} color="#fff" />
              <Text style={styles.navButtonText}>Yuborish</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ============ STYLES ============
