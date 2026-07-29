import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import api from '../api/axios';
import { colors, radius, spacing } from '../theme';

const cleanSplitName = (name) =>
  name.replace(/^split to /i, '').replace(/^split /i, '');

const BreedingPairsScreen = () => {
  const navigation = useNavigation();
  const [pairs, setPairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedResult, setSelectedResult] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchBreedingPairs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/breeding-pairs');
      if (response.data.success) setPairs(response.data.data);
      setError(null);
    } catch {
      setError('Failed to load breeding pairs');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchBreedingPairs();
    }, [])
  );

  const handleDelete = (id) => {
    Alert.alert('Delete pair', 'Are you sure you want to delete this breeding pair?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/breeding-pairs/${id}`);
            fetchBreedingPairs();
          } catch {
            Alert.alert('Error', 'Failed to delete pair');
          }
        },
      },
    ]);
  };

  const handleViewResult = async (pairId) => {
    try {
      const response = await api.get(`/computation-result/${pairId}`);
      if (response.data.success) {
        setSelectedResult(response.data.data);
        setModalOpen(true);
      } else {
        Alert.alert('No result', 'No computation result found for this pair.');
      }
    } catch {
      Alert.alert('Error', 'Failed to load result. Please try again.');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.toolGold} />
        <Text style={styles.muted}>Loading breeding pairs...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>My Breeding Pairs</Text>
        <Pressable style={styles.addBtn} onPress={() => navigation.navigate('Breed')}>
          <Text style={styles.addText}>+ New</Text>
        </Pressable>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {pairs.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.muted}>No breeding pairs yet.</Text>
          <Pressable style={styles.addBtn} onPress={() => navigation.navigate('Breed')}>
            <Text style={styles.addText}>Create Your First Prediction</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={pairs}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: spacing.md, paddingBottom: 40 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.date}>
                {new Date(item.created_at).toLocaleDateString()}
              </Text>
              <View style={styles.parents}>
                <View style={styles.parentCol}>
                  <Text style={styles.parentTitle}>Parent 1</Text>
                  <Text style={styles.meta}>{item.parent1_species}</Text>
                  <Text style={styles.meta}>{item.parent1_sex}</Text>
                  <Text style={styles.meta}>{item.parent1_base_color}</Text>
                </View>
                <Text style={styles.vs}>VS</Text>
                <View style={styles.parentCol}>
                  <Text style={styles.parentTitle}>Parent 2</Text>
                  <Text style={styles.meta}>{item.parent2_species}</Text>
                  <Text style={styles.meta}>{item.parent2_sex}</Text>
                  <Text style={styles.meta}>{item.parent2_base_color}</Text>
                </View>
              </View>
              {item.status === 'completed' && (
                <Text style={styles.badge}>✓ Prediction Complete</Text>
              )}
              <View style={styles.actions}>
                <Pressable style={styles.viewBtn} onPress={() => handleViewResult(item.id)}>
                  <Text style={styles.viewText}>View Result</Text>
                </Pressable>
                <Pressable style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
                  <Text style={styles.deleteText}>Delete</Text>
                </Pressable>
              </View>
            </View>
          )}
        />
      )}

      <Modal visible={modalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Pressable
              style={styles.modalClose}
              onPress={() => {
                setModalOpen(false);
                setSelectedResult(null);
              }}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </Pressable>
            <Text style={styles.modalTitle}>Prediction Result</Text>
            <ScrollView>
              <Text style={styles.section}>6 Chicks</Text>
              {selectedResult?.chicks_data?.map((chick, idx) => {
                const uniqueVisual = [...new Set(chick.visual_mutations || [])];
                const uniqueSplits = [
                  ...new Set((chick.split_genes || []).map(cleanSplitName)),
                ];
                return (
                  <Text key={idx} style={styles.chickLine}>
                    #{idx + 1} {chick.sex === 'Male' ? '♂' : '♀'} {chick.sex} · {chick.base_color}
                    {uniqueVisual.length ? ` + ${uniqueVisual.join(', ')}` : ''}
                    {uniqueSplits.length ? ` / split: ${uniqueSplits.join(', ')}` : ''}
                  </Text>
                );
              })}

              <Pressable
                style={styles.fullLink}
                onPress={() => {
                  const id = selectedResult?.breeding_pair_id;
                  setModalOpen(false);
                  if (id) {
                    const root = navigation.getParent()?.getParent?.() || navigation.getParent() || navigation;
                    root.navigate('ComputationResult', { id });
                  }
                }}
              >
                <Text style={styles.fullLinkText}>View Full Details →</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.toolEnd },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  title: { fontSize: 22, fontWeight: '800', color: colors.toolGold },
  addBtn: {
    backgroundColor: colors.toolGold,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  addText: { color: colors.toolEnd, fontWeight: '800' },
  muted: { color: colors.toolCream, marginBottom: spacing.md },
  error: { color: '#ff8a65', paddingHorizontal: spacing.md },
  card: {
    backgroundColor: colors.toolMid,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(225,207,113,0.25)',
  },
  date: { color: colors.toolGold, marginBottom: 8, fontWeight: '600' },
  parents: { flexDirection: 'row', alignItems: 'center' },
  parentCol: { flex: 1 },
  parentTitle: { color: colors.toolCream, fontWeight: '700', marginBottom: 4 },
  meta: { color: 'rgba(238,212,173,0.85)', fontSize: 13 },
  vs: { color: colors.toolGold, fontWeight: '800', marginHorizontal: 8 },
  badge: { color: '#8bc34a', marginTop: 8, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  viewBtn: {
    flex: 1,
    backgroundColor: colors.toolGold,
    borderRadius: radius.sm,
    paddingVertical: 10,
    alignItems: 'center',
  },
  viewText: { color: colors.toolEnd, fontWeight: '800' },
  deleteBtn: {
    borderWidth: 1,
    borderColor: '#ff8a65',
    borderRadius: radius.sm,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  deleteText: { color: '#ff8a65', fontWeight: '700' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    maxHeight: '75%',
    padding: spacing.lg,
  },
  modalClose: { alignSelf: 'flex-end' },
  modalCloseText: { fontSize: 22, color: colors.textMuted },
  modalTitle: { fontSize: 20, fontWeight: '800', color: colors.text, marginBottom: spacing.md },
  section: { fontWeight: '700', color: colors.text, marginBottom: 8 },
  chickLine: { color: colors.textMuted, marginBottom: 6, lineHeight: 20 },
  fullLink: { marginTop: spacing.md, marginBottom: spacing.xl },
  fullLinkText: { color: colors.accent, fontWeight: '700' },
});

export default BreedingPairsScreen;
