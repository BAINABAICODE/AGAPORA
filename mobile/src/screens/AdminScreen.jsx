import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { colors, radius, spacing } from '../theme';

const AdminScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      setLoading(false);
      setError('Admin access required.');
      return;
    }
    fetchUsers();
  }, [user]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users');
      setUsers(response.data);
      setError('');
    } catch {
      setError('Failed to load users. Make sure you are logged in as admin.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = (userId) => {
    Alert.alert('Delete user', 'Are you sure you want to delete this user?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/admin/users/${userId}`);
            setUsers((prev) => prev.filter((u) => u.id !== userId));
          } catch (err) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to delete user');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.link}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Admin Dashboard</Text>
      <Text style={styles.meta}>Total Users: {users.length}</Text>
      <FlatList
        data={users}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: spacing.lg }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.email}>{item.email}</Text>
            <Text style={styles.role}>
              #{item.id} · {item.role}
            </Text>
            {item.role !== 'admin' ? (
              <Pressable style={styles.deleteBtn} onPress={() => handleDeleteUser(item.id)}>
                <Text style={styles.deleteText}>Delete</Text>
              </Pressable>
            ) : (
              <Text style={styles.protected}>Protected</Text>
            )}
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg,
    padding: spacing.lg,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  meta: { color: colors.textMuted, paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  name: { fontWeight: '700', color: colors.text, fontSize: 16 },
  email: { color: colors.textMuted, marginTop: 2 },
  role: { color: colors.textMuted, marginTop: 4, marginBottom: 8 },
  deleteBtn: {
    alignSelf: 'flex-start',
    backgroundColor: colors.danger,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  deleteText: { color: '#fff', fontWeight: '700' },
  protected: { color: colors.primary, fontWeight: '600' },
  error: { color: colors.danger, textAlign: 'center', marginBottom: spacing.md },
  link: { color: colors.accent, fontWeight: '700' },
});

export default AdminScreen;
