import { Dimensions, Platform, StyleSheet } from "react-native";

const { width } = Dimensions.get("window");

export const styles = StyleSheet.create({
  // Container
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  scrollContent: {
    paddingBottom: 100,
  },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
    overflow: "hidden",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
    fontWeight: "500",
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,59,92,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },

  // Form Container
  formContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },

  // Video Preview
  videoPreview: {
    width: "100%",
    aspectRatio: 9 / 16,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#000",
    marginBottom: 20,
    position: "relative",
    borderWidth: 2,
    borderColor: "rgba(94,92,230,0.3)",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  playButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    overflow: "hidden",
  },
  playButtonBlur: {
    width: 70,
    height: 70,
    alignItems: "center",
    justifyContent: "center",
  },
  durationBadge: {
    position: "absolute",
    bottom: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  durationText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },

  // Progress
  progressContainer: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(94,92,230,0.2)",
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
  progressPercent: {
    fontSize: 15,
    fontWeight: "800",
    color: "#5e5ce6",
  },
  progressBar: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },

  // Section
  section: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    flex: 1,
  },
  required: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ff3b5c",
  },

  // Input
  input: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#fff",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  textArea: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#fff",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    textAlignVertical: "top",
    minHeight: 100,
  },
  charCount: {
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
    marginTop: 8,
    textAlign: "right",
    fontWeight: "600",
  },

  // Category
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  categoryBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    position: "relative",
    overflow: "hidden",
  },
  categoryGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
  },
  categoryBtnActive: {
    borderColor: "#5e5ce6",
  },
  categoryText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "600",
  },
  categoryTextActive: {
    color: "#fff",
    fontWeight: "700",
  },

  // Quality
  qualityRow: {
    flexDirection: "row",
    gap: 12,
  },
  qualityBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  qualityGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
  },
  qualityBtnActive: {
    borderColor: "#5e5ce6",
  },
  qualityText: {
    fontSize: 15,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "600",
  },
  qualityTextActive: {
    color: "#fff",
    fontWeight: "700",
  },

  // Toggle
  toggleItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  toggleItemLast: {
    borderBottomWidth: 0,
  },
  toggleLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },

  // Advanced
  advancedBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(94,92,230,0.1)",
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(94,92,230,0.3)",
  },
  advancedText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#5e5ce6",
  },
  advancedSection: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },

  // Tags
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#5e5ce6",
    borderRadius: 20,
  },
  tagText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  tagInputRow: {
    flexDirection: "row",
    gap: 10,
  },
  tagInput: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: "#fff",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  addTagBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    overflow: "hidden",
  },
  addTagGradient: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },

  // Upload Button
  uploadBtn: {
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 8,
    marginBottom: 20,
    shadowColor: "#5e5ce6",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  uploadBtnDisabled: {
    shadowOpacity: 0,
  },
  uploadBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 18,
  },
  uploadBtnText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "800",
  },

  // Selection Screen
  selectionContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  optionCard: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    position: "relative",
    overflow: "hidden",
  },
  optionGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  optionIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 8,
  },
  optionDesc: {
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
    lineHeight: 20,
  },

  // Tips
  tipsContainer: {
    backgroundColor: "rgba(94,92,230,0.1)",
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#5e5ce6",
    borderWidth: 1,
    borderColor: "rgba(94,92,230,0.3)",
  },
  tipsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  tipsTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#fff",
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  tipText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    lineHeight: 20,
    flex: 1,
  },

  // Success Screen
  successContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    paddingHorizontal: 40,
  },
  successContent: {
    alignItems: "center",
  },
  successIconContainer: {
    marginBottom: 24,
    borderRadius: 60,
    overflow: "hidden",
  },
  successIconGradient: {
    width: 120,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  successTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 12,
    textAlign: "center",
  },
  successText: {
    fontSize: 16,
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
    lineHeight: 24,
  },
});