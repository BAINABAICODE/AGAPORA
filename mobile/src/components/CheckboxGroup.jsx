import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../theme';

const CheckboxGroup = ({
  label,
  items,
  selected = [],
  onToggle,
  getLabel,
  getKey,
  variant = 'dark',
}) => {
  const light = variant === 'light';
  return (
    <View style={styles.wrap}>
      {label ? <Text style={[styles.label, light && styles.labelLight]}>{label}</Text> : null}
      <View style={styles.grid}>
        {items.map((item) => {
          const key = getKey ? getKey(item) : item.id;
          const name = getLabel ? getLabel(item) : item.name;
          const checked = selected.includes(name);
          return (
            <Pressable
              key={key}
              style={[
                styles.chip,
                light && styles.chipLight,
                checked && styles.chipOn,
                checked && light && styles.chipOnLight,
              ]}
              onPress={() => onToggle(name, !checked)}
            >
              <Text
                style={[
                  styles.chipText,
                  light && styles.chipTextLight,
                  checked && styles.chipTextOn,
                  checked && light && styles.chipTextOnLight,
                ]}
              >
                {checked ? '✓ ' : ''}
                {name}
              </Text>
              {item.inheritance ? (
                <Text style={[styles.meta, light && styles.metaLight]}>({item.inheritance})</Text>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  label: { color: colors.toolCream, fontWeight: '600', marginBottom: 8 },
  labelLight: { color: colors.text },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: 'rgba(225,207,113,0.35)',
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  chipLight: {
    borderColor: colors.border,
    backgroundColor: colors.bgElevated,
  },
  chipOn: {
    backgroundColor: 'rgba(225,207,113,0.2)',
    borderColor: colors.toolGold,
  },
  chipOnLight: {
    backgroundColor: 'rgba(95,127,31,0.15)',
    borderColor: colors.primary,
  },
  chipText: { color: colors.toolCream, fontSize: 13 },
  chipTextLight: { color: colors.text },
  chipTextOn: { color: colors.toolGold, fontWeight: '700' },
  chipTextOnLight: { color: colors.primary, fontWeight: '700' },
  meta: { color: 'rgba(238,212,173,0.6)', fontSize: 11 },
  metaLight: { color: colors.textMuted },
});

export default CheckboxGroup;
