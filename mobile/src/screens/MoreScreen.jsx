import React from 'react';
import { View, Text, Pressable, StyleSheet, Image, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { colors, radius, spacing } from '../theme';

const MoreScreen = () => {
  const navigation = useNavigation();
  const { user, logout, openLogin, openSignup } = useAuth();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
      <Text style={styles.brand}>AGAPORAS</Text>
      <Text style={styles.meta}>
        {user ? `Signed in as ${user.name} (${user.role})` : 'You are not signed in'}
      </Text>

      <Pressable style={styles.item} onPress={() => navigation.navigate('About')}>
        <Text style={styles.itemText}>About</Text>
      </Pressable>
      <Pressable style={styles.item} onPress={() => navigation.navigate('Help')}>
        <Text style={styles.itemText}>Help & Support</Text>
      </Pressable>

      {user?.role === 'admin' && (
        <Pressable style={styles.item} onPress={() => navigation.navigate('Admin')}>
          <Text style={styles.itemText}>Admin Dashboard</Text>
        </Pressable>
      )}

      {user ? (
        <Pressable style={[styles.item, styles.danger]} onPress={logout}>
          <Text style={[styles.itemText, styles.dangerText]}>Logout</Text>
        </Pressable>
      ) : (
        <View style={styles.authRow}>
          <Pressable style={styles.primary} onPress={openLogin}>
            <Text style={styles.primaryText}>Login</Text>
          </Pressable>
          <Pressable style={styles.secondary} onPress={openSignup}>
            <Text style={styles.secondaryText}>Sign Up</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg },
  logo: { width: 72, height: 72, alignSelf: 'center', marginBottom: spacing.sm },
  brand: {
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 4,
  },
  meta: { textAlign: 'center', color: colors.textMuted, marginBottom: spacing.lg },
  item: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemText: { color: colors.text, fontWeight: '600', fontSize: 16 },
  danger: { borderColor: '#f5c6cb' },
  dangerText: { color: colors.danger },
  authRow: { flexDirection: 'row', gap: 10, marginTop: spacing.md },
  primary: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryText: { color: '#fff', fontWeight: '700' },
  secondary: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: radius.sm,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryText: { color: colors.accent, fontWeight: '700' },
});

export default MoreScreen;
