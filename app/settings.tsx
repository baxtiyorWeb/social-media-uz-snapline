import { useCheckAuth } from '@/hooks/check-auth';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  type: 'navigate' | 'toggle' | 'action';
  value?: boolean;
  color?: string;
  badge?: string;
  dangerous?: boolean;
}

interface SettingSection {
  title: string;
  items: SettingItem[];
}

export default function SettingsScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState({
    darkMode: true,
    notifications: true,
    soundEffects: true,
    vibration: true,
    autoplay: true,
    dataUsage: false,
    privateAccount: false,
    activityStatus: true,
    readReceipts: true,
    twoFactor: false,
  });

  const toggleSetting = (key: string) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
  };

  const handleAction = (action: string) => {
    switch (action) {
      case 'logout':
        Alert.alert(
          'Chiqish',
          'Akkauntdan chiqishni xohlaysizmi?',
          [
            { text: 'Bekor qilish', style: 'cancel' },
            { text: 'Chiqish', style: 'destructive', onPress: () => console.log('Logged out') },
          ]
        );
        break;
      case 'deleteAccount':
        Alert.alert(
          'Akkauntni O\'chirish',
          'Bu amalni qaytarib bo\'lmaydi. Barcha ma\'lumotlaringiz doimiy o\'chiriladi.',
          [
            { text: 'Bekor qilish', style: 'cancel' },
            { text: 'O\'chirish', style: 'destructive', onPress: () => console.log('Account deleted') },
          ]
        );
        break;
      case 'clearCache':
        Alert.alert('Muvaffaqiyat', 'Kesh tozalandi');
        break;
      case 'downloadData':
        Alert.alert('Yuklash Boshlandi', 'Ma\'lumotlaringiz 24-48 soat ichida tayyor bo\'ladi');
        break;
      default:
        console.log('Action:', action);
    }
  };

  // NAVIGATION HANDLER
  const handleNavigate = (itemId: string) => {
    switch (itemId) {
      case 'profile':
        router.push('/account/edit-profile');
        break;

      case 'account':
        router.push('/account/edit-profile');
        break;

      case 'privacy':
        router.push('/account/PrivacySecurityScreen');
        break;

      case 'verification':
        router.push('/account/GetVerifiedScreen');
        break;

      case 'language':
        Alert.alert('Til', 'Tilni tanlang', [
          { text: 'O\'zbek', onPress: () => console.log('Uzbek') },
          { text: 'English', onPress: () => console.log('English') },
          { text: 'Bekor qilish', style: 'cancel' },
        ]);
        break;

      default:
        Alert.alert("Hali yo'q", "Bu bo'lim ishlab chiqilmagan");
    }
  };


  const sections: SettingSection[] = [
    {
      title: '👤 AKKAUNT',
      items: [
        {
          id: 'profile',
          title: 'Profilni Tahrirlash',
          subtitle: 'Ism, bio, avatar',
          icon: 'person-outline', type: 'navigate', color: '#5e5ce6'
        },
        {
          id: 'account',
          title: 'Akkaunt Sozlamalari',
          subtitle: 'Foydalanuvchi nomi, email, telefon',
          icon: 'settings-outline', type: 'navigate', color: '#5e5ce6'
        },
        {
          id: 'privacy',
          title: 'Maxfiyliq va Xavfsizlik',
          subtitle: 'Maxfiyligigini nazorat qiling',
          icon: 'lock-closed-outline', type: 'navigate', color: '#ff9500'
        },
        {
          id: 'verification',
          title: 'Tasdiqlangan Badge Olish',
          subtitle: 'Tasdiqlash uchun arizani qo\'shing',
          icon: 'checkmark-circle-outline', type: 'navigate', color: '#5e5ce6', badge: 'Yangi'
        },
      ],
    },
    {
      title: '⚙️ SOZLAMALAR',
      items: [
        { id: 'darkMode', title: 'Qorong\'i Rejim', subtitle: 'Ko\'zga oson', icon: 'moon-outline', type: 'toggle', value: settings.darkMode, color: '#5e5ce6' },
        { id: 'notifications', title: 'Bildirishnomalar', subtitle: 'Push bildirishnomalar', icon: 'notifications-outline', type: 'toggle', value: settings.notifications, color: '#ff3b5c' },
        { id: 'soundEffects', title: 'Ovozli Effektlar', subtitle: 'Ilova ovozlari', icon: 'volume-high-outline', type: 'toggle', value: settings.soundEffects, color: '#5e5ce6' },
        { id: 'vibration', title: 'Titirash', subtitle: 'Haptic qayta aloqa', icon: 'phone-portrait-outline', type: 'toggle', value: settings.vibration, color: '#5e5ce6' },
        { id: 'language', title: 'Til', subtitle: 'O\'zbek', icon: 'language-outline', type: 'navigate', color: '#5e5ce6' },
      ],
    },
    {
      title: '🎬 KONTENT',
      items: [
        { id: 'autoplay', title: 'Videoları Avtomatik Ijro Etish', subtitle: 'Mobil internetda', icon: 'play-circle-outline', type: 'toggle', value: settings.autoplay, color: '#5e5ce6' },
        { id: 'dataUsage', title: 'Maʼlumot Tejash', subtitle: 'Maʼlumot sarfini kamaytiring', icon: 'cellular-outline', type: 'toggle', value: settings.dataUsage, color: '#34c759' },
        { id: 'downloads', title: 'Yuklab Olingan Videolar', subtitle: 'Oflayn kontent boshqaruvi', icon: 'download-outline', type: 'navigate', color: '#5e5ce6' },
        { id: 'quality', title: 'Video Sifati', subtitle: 'Avtomatik (720p)', icon: 'videocam-outline', type: 'navigate', color: '#5e5ce6' },
      ],
    },
    {
      title: '🔒 MAXFIYLIQ',
      items: [
        { id: 'privateAccount', title: 'Xususiy Akkaunt', subtitle: 'Faqat followerlar ko\'rishi mumkin', icon: 'eye-off-outline', type: 'toggle', value: settings.privateAccount, color: '#ff9500' },
        { id: 'activityStatus', title: 'Faollik Holati', subtitle: 'Aktiv bo\'lganingizni ko\'rsatish', icon: 'time-outline', type: 'toggle', value: settings.activityStatus, color: '#34c759' },
        { id: 'readReceipts', title: 'O\'qilgan Qabul Qiluvchilar', subtitle: 'O\'qilgan holatini ko\'rsatish', icon: 'checkmark-done-outline', type: 'toggle', value: settings.readReceipts, color: '#5e5ce6' },
        { id: 'blockedUsers', title: 'Bloklangan Foydalanuvchilar', subtitle: 'Bloklangan akkauntlarni boshqaring', icon: 'ban-outline', type: 'navigate', color: '#ff3b5c' },
        { id: 'mutedAccounts', title: 'Ovozsiz Qilingan Akkauntlar', subtitle: 'Ovozsiz qilingan akkauntlar', icon: 'volume-mute-outline', type: 'navigate', color: '#ff9500' },
      ],
    },
    {
      title: '🛡️ XAVFSIZLIK',
      items: [
        { id: 'twoFactor', title: 'Ikki faktli Autentifikatsiya', subtitle: 'Qo\'shimcha xavfsizlik qatlami', icon: 'shield-checkmark-outline', type: 'toggle', value: settings.twoFactor, color: '#34c759' },
        { id: 'password', title: 'Parolni O\'zgartirish', subtitle: 'Parolingizni yangilang', icon: 'key-outline', type: 'navigate', color: '#5e5ce6' },
        { id: 'sessions', title: 'Faol Sessiyalar', subtitle: 'Tizimga kirgan qurilmalarni boshqaring', icon: 'phone-portrait-outline', type: 'navigate', color: '#5e5ce6' },
        { id: 'loginActivity', title: 'Kirish Faoliyati', subtitle: 'So\'nggi kirishlarni ko\'ring', icon: 'time-outline', type: 'navigate', color: '#5e5ce6' },
      ],
    },
    {
      title: '💬 YORDAM',
      items: [
        { id: 'help', title: 'Yordam Markazi', subtitle: 'Tez-tez soʻragan savollar va yordam', icon: 'help-circle-outline', type: 'navigate', color: '#5e5ce6' },
        { id: 'report', title: 'Muammo Haqida Xabar Bering', subtitle: 'Biror narsa ishlamayapti?', icon: 'flag-outline', type: 'navigate', color: '#ff9500' },
        { id: 'feedback', title: 'Fikr-Mulohaza Yuborish', subtitle: 'Sizning fikringizni eshitmishni istaydi', icon: 'chatbubble-outline', type: 'navigate', color: '#5e5ce6' },
        { id: 'about', title: 'PlayVibe Haqida', subtitle: '1.0.0 Versiyasi', icon: 'information-circle-outline', type: 'navigate', color: '#5e5ce6' },
      ],
    },
    {
      title: '📊 MA\'LUMOTLAR',
      items: [
        { id: 'clearCache', title: 'Keshni Tozalash', subtitle: '124 MB keshlanadi', icon: 'trash-outline', type: 'action', color: '#ff9500' },
        { id: 'downloadData', title: 'Ma\'lumotlarni Yuklab Olish', subtitle: 'Ma\'lumotlaringizning nusxasini oling', icon: 'cloud-download-outline', type: 'action', color: '#5e5ce6' },
        { id: 'storage', title: 'Saqlash Joyidan Foydalanish', subtitle: '2.4 GB', icon: 'folder-outline', type: 'navigate', color: '#5e5ce6' },
      ],
    },
    {
      title: '⚠️ AKKAUNT AMALLARI',
      items: [
        { id: 'logout', title: 'Chiqish', icon: 'log-out-outline', type: 'action', color: '#ff3b5c', dangerous: true },
        { id: 'deleteAccount', title: 'Akkauntni O\'chirish', subtitle: 'Doimiy o\'chirish', icon: 'trash-bin-outline', type: 'action', color: '#ff3b5c', dangerous: true },
      ],
    },
  ];

  const renderSettingItem = (item: SettingItem) => {
    const handlePress = () => {
      if (item.type === 'toggle') {
        toggleSetting(item.id);
      } else if (item.type === 'action') {
        handleAction(item.id);
      } else if (item.type === 'navigate') {
        handleNavigate(item.id);
      }
    };

    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.settingItem, item.dangerous && styles.dangerousItem]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: `${item.color}20` }]}>
          <Ionicons name={item.icon as any} size={22} color={item.color} />
        </View>

        <View style={styles.settingContent}>
          <View style={styles.settingTextContainer}>
            <Text style={[styles.settingTitle, item.dangerous && styles.dangerousText]}>
              {item.title}
            </Text>
            {item.subtitle && (
              <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
            )}
          </View>

          {item.badge && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.badge}</Text>
            </View>
          )}
        </View>

        {item.type === 'toggle' ? (
          <Switch
            value={item.value}
            onValueChange={() => toggleSetting(item.id)}
            trackColor={{ false: 'rgba(255,255,255,0.1)', true: item.color }}
            thumbColor="#fff"
            ios_backgroundColor="rgba(255,255,255,0.1)"
          />
        ) : (
          <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.4)" />
        )}
      </TouchableOpacity>
    );
  };


  const { user, loading } = useCheckAuth()


  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <BlurView intensity={80} tint="dark" style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sozlamalar</Text>
        <View style={styles.backButton} />
      </BlurView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Card */}
        <BlurView intensity={60} tint="dark" style={styles.profileCard}>
          <Image
            source={{ uri: user?.profile?.avatar }}
            style={styles.profileAvatar}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {user?.profile?.firstName && user?.profile?.lastName
                ? `${user?.profile?.firstName} ${user?.profile?.lastName}`
                : "Alex Jhonson"}
            </Text>
            {/* <Text style={styles.profileUsername}>
              {user?.profile?.username ? user?.profile?.username : "username"}
            </Text> */}
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>1.2M</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statNumber}>245</Text>
                <Text style={styles.statLabel}>Videolar</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.viewProfileButton}>
            <Ionicons name="eye-outline" size={20} color="#5e5ce6" />
          </TouchableOpacity>
        </BlurView>

        {/* Premium Banner */}
        <BlurView intensity={40} tint="dark" style={styles.premiumBanner}>
          <View style={styles.premiumContent}>
            <View style={styles.premiumIcon}>
              <Ionicons name="star" size={24} color="#fbbf24" />
            </View>
            <View style={styles.premiumText}>
              <Text style={styles.premiumTitle}>PlayVibe Premium</Text>
              <Text style={styles.premiumSubtitle}>Barcha imkoniyatlardan foydalaning</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#fbbf24" />
          </View>
        </BlurView>

        {/* Settings Sections */}
        {sections.map((section, index) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <BlurView intensity={40} tint="dark" style={styles.sectionCard}>
              {section.items.map((item, itemIndex) => (
                <View key={item.id}>
                  {renderSettingItem(item)}
                  {itemIndex < section.items.length - 1 && (
                    <View style={styles.separator} />
                  )}
                </View>
              ))}
            </BlurView>
          </View>
        ))}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>PlayVibe © 2024</Text>
          <View style={styles.footerLinks}>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Shartlar</Text>
            </TouchableOpacity>
            <Text style={styles.footerDot}>•</Text>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Maxfiyliq</Text>
            </TouchableOpacity>
            <Text style={styles.footerDot}>•</Text>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Kukilar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 24,
    padding: 16,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  profileAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#5e5ce6',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  profileUsername: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 13,
    fontWeight: '800',
    color: '#fff',
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  viewProfileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(94,92,230,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumBanner: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
  },
  premiumContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  premiumIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  premiumText: {
    flex: 1,
  },
  premiumTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fbbf24',
    marginBottom: 2,
  },
  premiumSubtitle: {
    fontSize: 13,
    color: 'rgba(251, 191, 36, 0.8)',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginLeft: 32,
    marginBottom: 12,
  },
  sectionCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  dangerousItem: {
    backgroundColor: 'rgba(255,59,92,0.05)',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  settingContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  dangerousText: {
    color: '#ff3b5c',
  },
  settingSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '500',
  },
  badge: {
    backgroundColor: '#5e5ce6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginRight: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginLeft: 74,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 12,
  },
  footerText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '600',
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footerLink: {
    fontSize: 13,
    color: '#5e5ce6',
    fontWeight: '600',
  },
  footerDot: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
  },
});