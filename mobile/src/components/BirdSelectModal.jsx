import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { birdService } from '../api/birdService';
import { useToast } from '../context/ToastContext';
import styles from './BirdSelectModal.styles';

const BirdSelectModal = ({ visible, onClose, onSelect, sexFilter }) => {
  const toast = useToast();
  const [birds, setBirds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { search: search || undefined, sort: 'name', direction: 'asc' };
      if (sexFilter) params.sex = sexFilter;
      const res = await birdService.list(params);
      if (res.success) setBirds(res.data || []);
      else toast.error(res.message || 'Failed to load birds');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load birds');
    } finally {
      setLoading(false);
    }
  }, [search, sexFilter, toast]);

  React.useEffect(() => {
    if (visible) load();
  }, [visible, load]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Select Bird</Text>
            <Pressable onPress={onClose}>
              <Text style={styles.close}>✕</Text>
            </Pressable>
          </View>
          <TextInput
            style={styles.search}
            placeholder="Search by ID, name, species..."
            placeholderTextColor="#5a6a7a"
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={load}
          />
          <Pressable style={styles.searchBtn} onPress={load}>
            <Text style={styles.searchBtnText}>Search</Text>
          </Pressable>

          {loading ? (
            <ActivityIndicator color="#5f7f1f" style={{ marginVertical: 24 }} />
          ) : (
            <FlatList
              data={birds}
              keyExtractor={(item) => String(item.id)}
              ListEmptyComponent={
                <Text style={styles.empty}>No birds found. Add birds from the Birds tab.</Text>
              }
              renderItem={({ item }) => (
                <Pressable
                  style={styles.row}
                  onPress={() => {
                    onSelect(item);
                    onClose();
                  }}
                >
                  <Text style={styles.rowTitle}>
                    {item.name || item.bird_id || `Bird #${item.id}`}
                  </Text>
                  <Text style={styles.rowMeta}>
                    {item.species} · {item.sex} · {item.base_color} · {item.status}
                  </Text>
                </Pressable>
              )}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

export default BirdSelectModal;
