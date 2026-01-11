import { Comment } from "@/app/video/[id]";
import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export const renderComment = ({
  item,
  isReply = false,
}: {
  item: Comment;
  isReply?: boolean;
}) => (
  <View style={[styles.commentItem, isReply && styles.replyItem]}>
    <Image source={{ uri: item.avatar }} style={styles.commentAvatar} />
    <View style={styles.commentContent}>
      <View style={styles.commentHeader}>
        <Text style={styles.commentUser}>{item.user}</Text>
        <Text style={styles.commentTime}>{item.timeAgo}</Text>
      </View>
      <Text style={styles.commentText}>{item.text}</Text>
      <View style={styles.commentActions}>
        <TouchableOpacity style={styles.commentAction}>
          <Ionicons
            name="heart-outline"
            size={14}
            color="rgba(255,255,255,0.6)"
          />
          <Text style={styles.commentActionText}>{item.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.commentAction}>
          <Text style={styles.commentActionText}>Reply</Text>
        </TouchableOpacity>
      </View>
      {item.replies && item.replies.length > 0 && (
        <View style={styles.repliesContainer}>
          <TouchableOpacity style={styles.viewReplies}>
            <Text style={styles.viewRepliesText}>
              ── View {item.replies.length} replies
            </Text>
          </TouchableOpacity>
          {item.replies.map((reply) => (
            <View key={reply.id}>
              {renderComment({ item: reply, isReply: true })}
            </View>
          ))}
        </View>
      )}
    </View>
  </View>
);

const styles = StyleSheet.create({

  commentItem: {
    flexDirection: "row",
    marginBottom: 20,
  },
  replyItem: {
    marginLeft: 48,
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1.5,
    borderColor: "rgba(0, 212, 255, 0.2)",
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  commentUser: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
    flex: 1,
  },
  commentTime: {
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
  },
  commentText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    lineHeight: 20,
    marginBottom: 8,
  },
  commentActions: {
    flexDirection: "row",
    gap: 16,
  },
  commentAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  commentActionText: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255,255,255,0.6)",
  },
  repliesContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 212, 255, 0.1)",
  },
  viewReplies: {
    marginBottom: 12,
  },
  viewRepliesText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#5e5ce6",
  },
});
