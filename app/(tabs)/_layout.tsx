import { HapticTab } from '@/components/haptic-tab';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Tabs } from 'expo-router';
import React from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  // const theme = Colors[colorScheme ?? 'light'];


  const TabIcon = ({ name, focused }: { name: keyof typeof Ionicons.glyphMap; focused: boolean }) => {
    const scale = React.useRef(new Animated.Value(focused ? 1.2 : 1)).current;

    React.useEffect(() => {
      Animated.spring(scale, { toValue: focused ? 1.2 : 1, friction: 6, useNativeDriver: true }).start();
    }, [focused]);

    const activeColor = '#5D5FEF';
    const inactiveColor = '#888888';

    return (
      <Animated.View style={{ transform: [{ scale }] }}>
        <Ionicons
          name={name}
          size={30}
          marginTop={-20}
          color={focused ? activeColor : inactiveColor}
          style={
            focused
              ? {
                textShadowColor: activeColor,
                textShadowOffset: { width: 0, height: 0 },
              }
              : {}
          }
        />
      </Animated.View>
    );
  };

  const AddButton = (props: any) => {
    const focused = props.accessibilityState?.selected ?? false;
    const scale = React.useRef(new Animated.Value(1)).current;

    const handlePressIn = () => Animated.spring(scale, { toValue: 1.15, useNativeDriver: true }).start();
    const handlePressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

    return (
      <Pressable
        onPress={props.onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.addButtonWrapper}
      >
        <Animated.View
          style={[
            styles.addButton,
            { transform: [{ scale }] },
          ]}
        >
          <LinearGradient
            colors={focused ? ['#FF6EC4', '#7873F5', '#4ADE80'] : ['#C0C0C0', '#A0A0A0']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          />
          <Ionicons name="add" size={36} color={focused ? '#fff' : '#fff'} />
        </Animated.View>
      </Pressable>
    );
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#5D5FEF',
        tabBarInactiveTintColor: '#888',
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarButton: (props) => <HapticTab {...props} route={props.accessibilityState?.selected ? "someRoute" : ""} />,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen name="index" options={({ route }) => ({
        tabBarIcon: ({ focused }) =>
          <TabIcon name="home" focused={focused} />,

      })} />
      <Tabs.Screen name="snaps"
        options={({ route }) => ({
          tabBarStyle: route.name === 'snaps' ? { display: 'none' } : {},
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon name="play-circle" focused={focused} />,

        })} />
      <Tabs.Screen name="add-video" options={({ route }) => ({
        tabBarButton: AddButton,
        title: '', headerShown: false,
        tabBarStyle: route.name === 'add-video' ? { display: 'none' } : {},
      })} />
      <Tabs.Screen name="messages" options={{ tabBarIcon: ({ focused }) => <TabIcon name="chatbubble" focused={focused} /> }} />
      <Tabs.Screen name="profile" options={{ tabBarIcon: ({ focused }) => <TabIcon name="person" focused={focused} /> }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    height: 75,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.95)',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 15,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  addButtonWrapper: {
    top: -25,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  addButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6EC4',
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
    backgroundColor: 'transparent',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 35,
  },
});
