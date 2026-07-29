import React from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme';

const AboutScreen = () => (
  <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
    <Text style={styles.title}>About LoveBird</Text>
    <Text style={styles.p}>
      LoveBird is a dedicated platform for lovebird enthusiasts worldwide.
    </Text>
    <Text style={styles.p}>
      Our mission is to provide comprehensive information about lovebird species, their care,
      and create a community for bird lovers.
    </Text>
  </ScrollView>
);

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg },
  title: { fontSize: 28, fontWeight: '800', color: colors.primary, marginBottom: spacing.md },
  p: { color: colors.text, lineHeight: 22, marginBottom: spacing.md },
});

export default AboutScreen;
