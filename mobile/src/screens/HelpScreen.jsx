import React from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme';

const HelpScreen = () => (
  <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
    <Text style={styles.title}>Help & Support</Text>
    <Text style={styles.h}>How to use this app?</Text>
    <Text style={styles.p}>Simply login or sign up to access bird information and features.</Text>
    <Text style={styles.h}>What species are available?</Text>
    <Text style={styles.p}>
      We have information on various lovebird species including Peach-faced, Masked, Fischer&apos;s,
      and more.
    </Text>
    <Text style={styles.h}>Contact Support</Text>
    <Text style={styles.p}>Email: support@lovebird.com</Text>
  </ScrollView>
);

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg },
  title: { fontSize: 28, fontWeight: '800', color: colors.primary, marginBottom: spacing.md },
  h: { fontSize: 18, fontWeight: '700', color: colors.text, marginTop: spacing.md, marginBottom: 6 },
  p: { color: colors.textMuted, lineHeight: 22 },
});

export default HelpScreen;
