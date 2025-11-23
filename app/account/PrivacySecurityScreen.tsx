import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { styles } from '../../components/styles';
type PrivacyState = {
  privateAccount: boolean;
  allowMessages: boolean;
  allowComments: boolean;
  allowTagging: boolean;
  activityStatus: boolean;
};


// ============ 3. PRIVACY & SECURITY SCREEN ============
export default function PrivacySecurityScreen() {
  type IconName = React.ComponentProps<typeof Ionicons>['name'];
  const items: { key: keyof PrivacyState; title: string; subtitle: string; icon: IconName }[] = [
    {
      key: 'privateAccount',
      title: 'Xususiy Akkaunt',
      subtitle: 'Faqat followerlar ko\'rishi mumkin',
      icon: 'eye-off-outline',
    },
    {
      key: 'allowMessages',
      title: 'Xabarlarni Qabul Qilish',
      subtitle: 'Hammadan xabar olish',
      icon: 'mail-outline',
    },
    {
      key: 'allowComments',
      title: 'Izohlarni Qabul Qilish',
      subtitle: 'Videolaringizga izoh qo\'yish',
      icon: 'chatbubble-outline',
    },
    {
      key: 'allowTagging',
      title: 'Teglanishga Ruxsat',
      subtitle: 'Suratlarngizda teglanish',
      icon: 'pricetag-outline',
    },
    {
      key: 'activityStatus',
      title: 'Faollik Holati',
      subtitle: 'Aktiv bo\'lganingizni ko\'rsatish',
      icon: 'time-outline',
    },
  ] as const;


  const [privacy, setPrivacy] = useState<PrivacyState>({
    privateAccount: false,
    allowMessages: true,
    allowComments: true,
    allowTagging: true,
    activityStatus: true,
  });

  const togglePrivacy = (key: keyof PrivacyState) => {
    setPrivacy(prev => ({ ...prev, [key]: !prev[key] }));
  };
  return (
    <KeyboardAvoidingView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <BlurView intensity={80} tint="dark" style={styles.header}>
          <TouchableOpacity style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Maxfiyliq va Xavfsizlik</Text>
          <View style={styles.backButton} />
        </BlurView>

        {/* Privacy Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔒 Maxfiyliq</Text>
          <BlurView intensity={40} tint="dark" style={styles.toggleCard}>
            {items.map((item, idx) => (
              <View key={item.key}>
                <View style={styles.toggleRow}>
                  <View style={[styles.toggleIcon, { backgroundColor: '#5e5ce620' }]}>
                    <Ionicons name={item.icon} size={20} color="#5e5ce6" />
                  </View>
                  <View style={styles.toggleInfo}>
                    <Text style={styles.toggleTitle}>{item.title}</Text>
                    <Text style={styles.toggleSubtitle}>{item.subtitle}</Text>
                  </View>
                  <Switch
                    value={privacy[item.key]}  // ✅ endi type-safe
                    onValueChange={() => togglePrivacy(item.key)} // ✅ type-safe
                    trackColor={{ false: '#333', true: '#34c759' }}
                    thumbColor="#fff"
                  />
                </View>
                {idx < items.length - 1 && <View style={styles.separator} />}
              </View>
            ))}

          </BlurView>
        </View>

        {/* Blocked Users */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚫 Bloklangan Foydalanuvchilar</Text>
          <BlurView intensity={40} tint="dark" style={styles.blockedCard}>
            <View style={styles.blockedHeader}>
              <Text style={styles.blockedCount}>5 ta bloklangan</Text>
              <TouchableOpacity style={styles.viewAllButton}>
                <Text style={styles.viewAllText}>Barchasini Ko'rish</Text>
                <Ionicons name="chevron-forward" size={16} color="#5e5ce6" />
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>

        {/* Muted Accounts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔇 Ovozsiz Qilingan Akkauntlar</Text>
          <BlurView intensity={40} tint="dark" style={styles.blockedCard}>
            <View style={styles.blockedHeader}>
              <Text style={styles.blockedCount}>3 ta ovozsiz</Text>
              <TouchableOpacity style={styles.viewAllButton}>
                <Text style={styles.viewAllText}>Barchasini Ko'rish</Text>
                <Ionicons name="chevron-forward" size={16} color="#5e5ce6" />
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>

        {/* Two Factor Auth */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🛡️ Ikki faktli Autentifikatsiya</Text>
          <BlurView intensity={40} tint="dark" style={styles.settingCard}>
            <View style={styles.twoFactorRow}>
              <View>
                <Text style={styles.twoFactorTitle}>Qo'shimcha Xavfsizlik</Text>
                <Text style={styles.twoFactorSubtitle}>
                  Akkauntingizni yanada xavfsiz qiling
                </Text>
              </View>
              <TouchableOpacity style={styles.enableButton}>
                <Text style={styles.enableButtonText}>Yoqish</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}