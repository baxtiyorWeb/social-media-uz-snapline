// components/haptic-tab.tsx
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, View } from 'react-native';

export const HapticTab = ({ children, route }: { children: React.ReactNode; route: string }) => {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push(`/${route}` as any);
      }}
      style={{ padding: 12 }}
    >
      <View style={{ alignItems: 'center' }}>{children}</View>
    </Pressable>
  );
};