import { StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../theme';

export default StyleSheet.create({
  card: {
    backgroundColor: colors.toolMid,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(225,207,113,0.25)',
    marginBottom: spacing.lg,
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: 8,
  },
  pulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.toolGold,
  },
  statusText: { color: colors.toolGold, fontWeight: '600', flex: 1 },
  addBirdBtn: {
    backgroundColor: colors.toolGold,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  addBirdText: { color: colors.toolEnd, fontWeight: '800', fontSize: 13 },
  fieldLabel: { color: colors.toolCream, fontWeight: '600', marginBottom: 6 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(225,207,113,0.35)',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    color: colors.toolCream,
    marginBottom: spacing.md,
  },
  toggle: {
    paddingVertical: 12,
    marginTop: spacing.sm,
  },
  toggleText: { color: colors.toolGold, fontWeight: '600' },
  subCard: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  subTitle: {
    color: colors.toolGold,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    color: colors.toolCream,
    fontWeight: '700',
    marginVertical: spacing.sm,
  },
});
