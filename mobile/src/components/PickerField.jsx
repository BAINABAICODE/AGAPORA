import React, { useState } from 'react';
import { View, Text, Pressable, Modal, FlatList, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../theme';

const PickerField = ({
  label,
  value,
  options,
  onChange,
  placeholder = 'Select...',
  required,
  variant = 'dark',
}) => {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);
  const light = variant === 'light';

  return (
    <View style={styles.wrap}>
      {label ? (
        <Text style={[styles.label, light && styles.labelLight]}>
          {label}
          {required ? ' *' : ''}
        </Text>
      ) : null}
      <Pressable style={[styles.field, light && styles.fieldLight]} onPress={() => setOpen(true)}>
        <Text
          style={[
            styles.value,
            light && styles.valueLight,
            !selected && styles.placeholder,
            !selected && light && styles.placeholderLight,
          ]}
        >
          {selected ? selected.label : placeholder}
        </Text>
        <Text style={[styles.chevron, light && styles.chevronLight]}>▾</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>{label || 'Select'}</Text>
            <FlatList
              data={[{ label: placeholder, value: '' }, ...options]}
              keyExtractor={(item, index) => `${item.value}-${index}`}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.option}
                  onPress={() => {
                    onChange(item.value);
                    setOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      item.value === value && styles.optionSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  label: { color: colors.toolCream, fontWeight: '600', marginBottom: 6 },
  labelLight: { color: colors.text },
  field: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(225,207,113,0.35)',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fieldLight: {
    backgroundColor: colors.bgElevated,
    borderColor: colors.border,
  },
  value: { color: colors.toolCream, flex: 1 },
  valueLight: { color: colors.text },
  placeholder: { color: 'rgba(238,212,173,0.55)' },
  placeholderLight: { color: colors.textMuted },
  chevron: { color: colors.toolGold, marginLeft: 8 },
  chevronLight: { color: colors.primary },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    maxHeight: '60%',
    paddingBottom: spacing.xl,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  option: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  optionText: { color: colors.text, fontSize: 16 },
  optionSelected: { color: colors.primary, fontWeight: '700' },
});

export default PickerField;
