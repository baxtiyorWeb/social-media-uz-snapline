import { HapticTab } from "@/components/haptic-tab";
import { ProfileTabButton } from "@/components/profileTabButton";
import { useCheckAuth } from "@/hooks/check-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Tabs } from "expo-router";
import React from "react";
import { Animated, Platform, Pressable, StyleSheet, View } from "react-native";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { user, loading } = useCheckAuth();

  const TabIcon = ({
    name,
    focused,
  }: {
    name: keyof typeof Ionicons.glyphMap;
    focused: boolean;
  }) => {
    const scale = React.useRef(new Animated.Value(1)).current;
    const opacity = React.useRef(new Animated.Value(focused ? 1 : 0.6)).current;

    React.useEffect(() => {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: focused ? 1.15 : 1,
          friction: 5,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: focused ? 1 : 0.6,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }, [focused]);

    return (
      <Animated.View
        style={[
          styles.iconContainer,
          {
            transform: [{ scale }],
            opacity,
          },
        ]}
      >
        {focused && (
          <View style={styles.activeIndicator}>
            <LinearGradient
              colors={["#5e5ce6", "#8b5cf6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.activeIndicatorGradient}
            />
          </View>
        )}
        <Ionicons
          name={name}
          size={26}
          color={focused ? "#fff" : "rgba(255, 255, 255, 0.5)"}
        />
      </Animated.View>
    );
  };

  const AddButton = (props: any) => {
    const focused = props.accessibilityState?.selected ?? false;
    const scale = React.useRef(new Animated.Value(1)).current;
    const rotate = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
      if (focused) {
        Animated.parallel([
          Animated.spring(scale, {
            toValue: 1.1,
            friction: 5,
            useNativeDriver: true,
          }),
          Animated.timing(rotate, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        Animated.parallel([
          Animated.spring(scale, {
            toValue: 1,
            friction: 5,
            useNativeDriver: true,
          }),
          Animated.timing(rotate, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }, [focused]);

    const handlePressIn = () => {
      Animated.spring(scale, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(scale, {
        toValue: focused ? 1.1 : 1,
        useNativeDriver: true,
      }).start();
    };

    const rotateInterpolate = rotate.interpolate({
      inputRange: [0, 1],
      outputRange: ["0deg", "135deg"],
    });

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
            {
              transform: [{ scale }, { rotate: rotateInterpolate }],
            },
          ]}
        >
          <LinearGradient
            colors={["#5e5ce6", "#8b5cf6", "#a855f7"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          />
          <View style={styles.addButtonInner}>
            <Ionicons name="add" size={32} color="#fff" />
          </View>

          {/* Glow effect */}
          <View style={styles.glowOuter} />
        </Animated.View>
      </Pressable>
    );
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#5e5ce6",
        tabBarInactiveTintColor: "rgba(255, 255, 255, 0.5)",
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarButton: (props) => (
          <HapticTab
            {...props}
            route={props.accessibilityState?.selected ? "someRoute" : ""}
          />
        ),
        tabBarShowLabel: false,
        tabBarBackground: () => (
          <BlurView
            intensity={80}
            tint="dark"
            style={StyleSheet.absoluteFillObject}
          />
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={({ route }) => ({
          tabBarIcon: ({ focused }) => (
            <TabIcon name="home" focused={focused} />
          ),
        })}
      />
      <Tabs.Screen
        name="snaps"
        options={({ route }) => ({
          tabBarStyle:
            route.name === "snaps" ? { display: "none" } : styles.tabBar,
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon name="play-circle" focused={focused} />
          ),
        })}
      />
      <Tabs.Screen
        name="add-video"
        options={({ route }) => ({
          tabBarButton: AddButton,
          title: "",
          headerShown: false,
          tabBarStyle:
            route.name === "add-video" ? { display: "none" } : styles.tabBar,
        })}
      />
      <Tabs.Screen
        name="messages"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="chatbubble" focused={focused} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="person" focused={focused} />
          ),
          tabBarButton: (props) => {
            return <ProfileTabButton {...props} />;
          },
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 20 : 16,
    left: 16,
    right: 16,
    height: 60,
    borderRadius: 24,
    backgroundColor: "rgba(10, 10, 20, 0.91)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    // overflow: "hidden",
  },

  // Icon Container
  iconContainer: {
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    top: -4,
  },
  activeIndicator: {
    position: "absolute",
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: "hidden",
  },
  activeIndicatorGradient: {
    flex: 1,
    opacity: 0.15,
  },

  // Add Button
  addButtonWrapper: {
    top: -28,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  addButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: "visible",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 32,
  },
  addButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  glowOuter: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#5e5ce6",
    opacity: 0.2,
    zIndex: -1,
  },
});
