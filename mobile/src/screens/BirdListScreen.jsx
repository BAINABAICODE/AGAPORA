import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../api/axios';
import { birdService, parentFieldsToBirdPayload } from '../api/birdService';
import PickerField from '../components/PickerField';
import CheckboxGroup from '../components/CheckboxGroup';
import { useToast } from '../context/ToastContext';
import styles from './BirdListScreen.styles';

const emptyForm = () => ({
  bird_id: '',
  name: '',
  species: '',
  sex: '',
  age: '',
  base_color: '',
  visual_mutations: [],
  split_genes: [],
  genetic_data: {},
  grandparent_data: {},
  status: 'active',
});

const SORTS = [
  { key: 'created_at', label: 'Newest' },
  { key: 'name', label: 'Name' },
  { key: 'species', label: 'Species' },
  { key: 'sex', label: 'Sex' },
  { key: 'status', label: 'Status' },
];

const BirdListScreen = () => {
  const toast = useToast();
  const [birds, setBirds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('created_at');
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [references, setReferences] = useState({
    species: [],
    base_colors: [],
    visual_mutations: [],
    split_genes: [],
  });

  const loadRefs = async () => {
    try {
      const res = await api.get('/references/all');
      if (res.data.success) setReferences(res.data.data);
    } catch {
      toast.error('Failed to load reference data');
    }
  };

  const loadBirds = useCallback(async () => {
    setLoading(true);
    try {
      const res = await birdService.list({
        search: search || undefined,
        sort,
        direction: sort === 'created_at' ? 'desc' : 'asc',
      });
      if (res.success) setBirds(res.data || []);
      else toast.error(res.message || 'Failed to load birds');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load birds');
    } finally {
      setLoading(false);
    }
  }, [search, sort, toast]);

  useEffect(() => {
    loadRefs();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadBirds();
    }, [loadBirds])
  );

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setEditorOpen(true);
  };

  const openEdit = (bird) => {
    setEditingId(bird.id);
    setForm({
      bird_id: bird.bird_id || '',
      name: bird.name || '',
      species: bird.species || '',
      sex: bird.sex || '',
      age: bird.age != null ? String(bird.age) : '',
      base_color: bird.base_color || '',
      visual_mutations: bird.visual_mutations || [],
      split_genes: bird.split_genes || [],
      genetic_data: bird.genetic_data || {},
      grandparent_data: bird.grandparent_data || {},
      status: bird.status || 'active',
    });
    setEditorOpen(true);
  };

  const handleSave = async () => {
    if (!form.species || !form.sex || !form.base_color) {
      toast.error('Species, Sex, and Base Color are required.');
      return;
    }
    setSaving(true);
    try {
      const payload = parentFieldsToBirdPayload(form);
      if (editingId) {
        await birdService.update(editingId, payload);
        toast.success('Bird updated');
      } else {
        await birdService.create(payload);
        toast.success('Bird added');
      }
      setEditorOpen(false);
      loadBirds();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Save failed';
      toast.error(typeof msg === 'string' ? msg : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (bird) => {
    Alert.alert('Delete bird', `Delete ${bird.name || bird.bird_id || 'this bird'}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await birdService.remove(bird.id);
            toast.success('Bird deleted');
            loadBirds();
          } catch (err) {
            toast.error(err.response?.data?.message || 'Delete failed');
          }
        },
      },
    ]);
  };

  const speciesOptions = (references.species || []).map((s) => ({
    label: s.name,
    value: s.name,
  }));
  const colorOptions = (references.base_colors || []).map((c) => ({
    label: c.name,
    value: c.name,
  }));

  return (
    <View style={styles.screen}>
      <View style={{ padding: 16, paddingBottom: 0 }}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Bird List</Text>
          <Pressable style={styles.addBtn} onPress={openCreate}>
            <Text style={styles.addText}>+ Add</Text>
          </Pressable>
        </View>
        <TextInput
          style={styles.search}
          placeholder="Search birds..."
          placeholderTextColor="#5a6a7a"
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={loadBirds}
        />
        <View style={styles.sortRow}>
          {SORTS.map((s) => (
            <Pressable
              key={s.key}
              style={[styles.sortChip, sort === s.key && styles.sortChipOn]}
              onPress={() => setSort(s.key)}
            >
              <Text style={[styles.sortText, sort === s.key && styles.sortTextOn]}>{s.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#5f7f1f" />
        </View>
      ) : (
        <FlatList
          data={birds}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.content}
          ListEmptyComponent={<Text style={styles.empty}>No birds yet. Tap + Add to create one.</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{item.name || item.bird_id || `Bird #${item.id}`}</Text>
              <Text style={styles.meta}>ID: {item.bird_id || '—'}</Text>
              <Text style={styles.meta}>
                {item.species} · {item.sex} · {item.base_color}
              </Text>
              {item.age != null ? <Text style={styles.meta}>Age: {item.age} months</Text> : null}
              <Text style={styles.badge}>{item.status}</Text>
              <View style={styles.actions}>
                <Pressable style={styles.editBtn} onPress={() => openEdit(item)}>
                  <Text style={styles.editText}>Edit</Text>
                </Pressable>
                <Pressable style={styles.deleteBtn} onPress={() => handleDelete(item)}>
                  <Text style={styles.deleteText}>Delete</Text>
                </Pressable>
              </View>
            </View>
          )}
        />
      )}

      <Modal visible={editorOpen} transparent animationType="slide" onRequestClose={() => setEditorOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{editingId ? 'Edit Bird' : 'Add Bird'}</Text>
            <ScrollView keyboardShouldPersistTaps="handled">
              <Text style={styles.fieldLabel}>Bird ID</Text>
              <TextInput
                style={styles.input}
                value={form.bird_id}
                onChangeText={(v) => setForm((p) => ({ ...p, bird_id: v }))}
                placeholder="Optional ID"
              />
              <Text style={styles.fieldLabel}>Bird Name</Text>
              <TextInput
                style={styles.input}
                value={form.name}
                onChangeText={(v) => setForm((p) => ({ ...p, name: v }))}
                placeholder="Optional name"
              />
              <PickerField
                label="Species"
                required
                variant="light"
                value={form.species}
                options={speciesOptions}
                onChange={(v) => setForm((p) => ({ ...p, species: v }))}
              />
              <PickerField
                label="Sex"
                required
                variant="light"
                value={form.sex}
                options={[
                  { label: 'Male', value: 'Male' },
                  { label: 'Female', value: 'Female' },
                ]}
                onChange={(v) => setForm((p) => ({ ...p, sex: v }))}
              />
              <Text style={styles.fieldLabel}>Age (months)</Text>
              <TextInput
                style={styles.input}
                value={form.age}
                onChangeText={(v) => setForm((p) => ({ ...p, age: v }))}
                keyboardType="numeric"
                placeholder="Age"
              />
              <PickerField
                label="Base Color"
                required
                variant="light"
                value={form.base_color}
                options={colorOptions}
                onChange={(v) => setForm((p) => ({ ...p, base_color: v }))}
              />
              <CheckboxGroup
                label="Visual Mutations"
                variant="light"
                items={references.visual_mutations || []}
                selected={form.visual_mutations}
                onToggle={(name, checked) =>
                  setForm((p) => ({
                    ...p,
                    visual_mutations: checked
                      ? [...p.visual_mutations, name]
                      : p.visual_mutations.filter((m) => m !== name),
                  }))
                }
              />
              <CheckboxGroup
                label="Split Genes"
                variant="light"
                items={references.split_genes || []}
                selected={form.split_genes}
                onToggle={(name, checked) =>
                  setForm((p) => ({
                    ...p,
                    split_genes: checked
                      ? [...p.split_genes, name]
                      : p.split_genes.filter((g) => g !== name),
                  }))
                }
              />
              <PickerField
                label="Status"
                variant="light"
                value={form.status}
                options={[
                  { label: 'Active', value: 'active' },
                  { label: 'Retired', value: 'retired' },
                  { label: 'Sold', value: 'sold' },
                  { label: 'Deceased', value: 'deceased' },
                ]}
                onChange={(v) => setForm((p) => ({ ...p, status: v }))}
              />
              <Pressable style={styles.saveBtn} disabled={saving} onPress={handleSave}>
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveText}>{editingId ? 'Update Bird' : 'Save Bird'}</Text>
                )}
              </Pressable>
              <Pressable style={styles.cancelBtn} onPress={() => setEditorOpen(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default BirdListScreen;
