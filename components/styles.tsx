import { Platform, StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
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

  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#93c5fd',
    marginBottom: 12,
    letterSpacing: 0.5,
  },

  formCard: {
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },

  formGroup: {
    marginBottom: 20,
  },

  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 10,
  },

  input: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 14,
    color: '#fff',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#334155',
  },

  inputDisabled: {
    opacity: 0.6,
    backgroundColor: '#0f172a',
  },

  bioInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },

  charCount: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 8,
    textAlign: 'right',
  },

  avatarSection: {
    alignItems: 'center',
    marginVertical: 30,
  },

  largeAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#5e5ce6',
  },

  changeAvatarButton: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#5e5ce6',
    justifyContent: 'center',
    alignItems: 'center',
  },

  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 40,
  },

  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5e5ce6',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },

  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#22c55e',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },

  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },

  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },

  statusCard: {
    marginHorizontal: 20,
    marginVertical: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    overflow: 'hidden',
  },

  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },

  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22c55e',
  },

  statusText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#22c55e',
  },

  statusSubtext: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginLeft: 22,
  },

  settingCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    overflow: 'hidden',
  },

  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  settingLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 4,
  },

  settingValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },

  changeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },

  changeButtonText: {
    color: '#5e5ce6',
    fontWeight: '700',
    fontSize: 14,
  },

  infoCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    overflow: 'hidden',
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },

  infoLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },

  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },

  separator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },

  appsCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    overflow: 'hidden',
  },

  appRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },

  appName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },

  removeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255,59,92,0.2)',
  },

  removeButtonText: {
    color: '#ff3b5c',
    fontWeight: '700',
    fontSize: 13,
  },

  dangerCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,59,92,0.3)',
    backgroundColor: 'rgba(255,59,92,0.1)',
    overflow: 'hidden',
  },

  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 10,
  },

  dangerButtonText: {
    color: '#ff3b5c',
    fontWeight: '700',
    fontSize: 15,
  },

  toggleCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },

  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },

  toggleIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  toggleInfo: {
    flex: 1,
  },

  toggleTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },

  toggleSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
  },

  blockedCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    overflow: 'hidden',
  },

  blockedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  blockedCount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },

  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  viewAllText: {
    color: '#5e5ce6',
    fontWeight: '700',
    fontSize: 14,
  },

  twoFactorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },

  twoFactorTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },

  twoFactorSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
  },

  enableButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#5e5ce6',
  },

  enableButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },

  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 40,
  },

  progressWrapper: {
    alignItems: 'center',
    flexDirection: 'row',
  },

  progressDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1e293b',
    borderWidth: 2,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },

  progressDotActive: {
    backgroundColor: '#5e5ce6',
    borderColor: '#5e5ce6',
  },

  progressNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#93c5fd',
  },

  progressLine: {
    width: 30,
    height: 2,
    backgroundColor: '#334155',
    marginHorizontal: 10,
  },

  progressLineActive: {
    backgroundColor: '#5e5ce6',
  },

  stepContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },

  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },

  infoText: {
    flex: 1,
    marginLeft: 16,
  },

  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
  },

  infoDescription: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 18,
  },

  benefitsCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    overflow: 'hidden',
  },

  benefitsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
  },

  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  benefitDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#5e5ce6',
    marginRight: 12,
  },

  benefitText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },

  stepTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 20,
  },

  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  categoryButton: {
    flex: 0.48,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
  },

  categoryButtonActive: {
    backgroundColor: '#5e5ce6',
    borderColor: '#5e5ce6',
  },

  categoryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.6)',
  },

  categoryButtonTextActive: {
    color: '#fff',
  },

  uploadCard: {
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    overflow: 'hidden',
  },

  uploadArea: {
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#5e5ce6',
    paddingVertical: 40,
    alignItems: 'center',
    marginBottom: 24,
  },

  uploadText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginTop: 12,
  },

  uploadSubtext: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 6,
    textAlign: 'center',
  },

  requirementsBox: {
    backgroundColor: 'rgba(94, 92, 230, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#5e5ce6',
  },

  requirementsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
  },

  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  requirementDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#5e5ce6',
    marginRight: 10,
  },

  requirementText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },

  navigationButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 40,
  },

  prevButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#334155',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },

  nextButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5e5ce6',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },

  submitButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#22c55e',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },

  navButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});