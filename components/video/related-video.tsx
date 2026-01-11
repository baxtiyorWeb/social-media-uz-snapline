import { RelatedVideo } from "@/interfaces/interfaces";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
    Dimensions,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
const { width, height } = Dimensions.get("window");
export const renderRelatedVideo = ({ item }: { item: RelatedVideo }) => {
  return (
    <TouchableOpacity
      style={styles.relatedCard}
      onPress={() => router.push(`/video/${item.id}`)}
      activeOpacity={0.85}
    >
      <Image
        source={{
          uri: item.thumbnail || "https://via.placeholder.com/300x400",
        }}
        style={styles.relatedThumbnail}
      />
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.8)"]}
        style={styles.relatedGradient}
      />
      <View style={styles.relatedOverlay}>
        <View style={styles.playIconWrapper}>
          <Ionicons name="play-circle" size={40} color="#fff" />
        </View>
      </View>
      <View style={styles.relatedInfo}>
        <Text style={styles.relatedTitle} numberOfLines={2}>
          {item.caption}
        </Text>
        <View style={styles.relatedStats}>
          <Text style={styles.relatedUser}>@{item.user.profile.username}</Text>
          <Text style={styles.relatedDot}>•</Text>
          <Text style={styles.relatedViews}>{item.views || 0}K views</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Related
  relatedSection: {
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  relatedRow: {
    justifyContent: "space-between",
    marginBottom: 16,
  },
  relatedCard: {
    width: (width - 44) / 2,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "rgba(0, 212, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(0, 212, 255, 0.1)",
  },
  relatedThumbnail: {
    width: "100%",
    height: ((width - 44) / 2) * 1.5,
  },
  relatedGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "60%",
  },
  relatedOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  playIconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(0, 212, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#5e5ce6",
  },
  relatedInfo: {
    padding: 12,
  },
  relatedTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 6,
    lineHeight: 18,
  },
  relatedStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  relatedUser: {
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
    fontWeight: "600",
  },
  relatedDot: {
    fontSize: 10,
    color: "rgba(255,255,255,0.4)",
  },
  relatedViews: {
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
  },
});
