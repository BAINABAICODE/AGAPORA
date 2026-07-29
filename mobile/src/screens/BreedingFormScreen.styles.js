import { StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../theme';

export default StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.toolEnd },
  content: { padding: spacing.md, paddingBottom: 48 },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.toolEnd,
  },
  loadingText: { color: colors.toolCream, marginTop: spacing.sm },
  title: { fontSize: 24, fontWeight: '800', color: colors.toolGold, marginBottom: 8 },
  desc: { color: colors.toolCream, marginBottom: spacing.md, lineHeight: 20 },
  steps: { flexDirection: 'row', gap: 8, marginBottom: spacing.md },
  step: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: radius.sm,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(225,207,113,0.25)',
  },
  stepActive: { borderColor: colors.toolGold, backgroundColor: 'rgba(225,207,113,0.15)' },
  stepText: { color: colors.toolCream, fontWeight: '600', textAlign: 'center', fontSize: 12 },
  logBox: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  logTitle: { color: colors.toolGold, fontWeight: '700', marginBottom: 6 },
  logLine: { color: colors.toolCream, fontSize: 12, marginBottom: 2 },
  actions: { flexDirection: 'row', gap: 12, marginTop: spacing.sm },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.toolCream,
    borderRadius: radius.sm,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelText: { color: colors.toolCream, fontWeight: '700' },
  submitBtn: {
    flex: 2,
    backgroundColor: colors.toolGold,
    borderRadius: radius.sm,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitText: { color: colors.toolEnd, fontWeight: '800' },
  disabled: { opacity: 0.7 },
});
