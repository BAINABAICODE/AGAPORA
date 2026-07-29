import { StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../theme';

export default StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    maxHeight: '85%',
  },
  closeBtn: { position: 'absolute', right: 12, top: 8, zIndex: 2, padding: 8 },
  closeText: { fontSize: 28, color: colors.textMuted },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    marginBottom: spacing.sm,
    color: colors.text,
    backgroundColor: colors.bgElevated,
  },
  error: { color: colors.danger, marginBottom: spacing.sm, fontSize: 13 },
  submit: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  submitDisabled: { opacity: 0.7 },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  link: {
    color: colors.accent,
    textAlign: 'center',
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
});
