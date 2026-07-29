import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../api/axios';
import ParentForm from '../components/ParentForm';
import { computeGenetics } from '../utils/GeneticComputationEngine';
import { useToast } from '../context/ToastContext';
import styles from './BreedingFormScreen.styles';

const setNestedValue = (obj, path, value) => {
  const keys = path.split('.');
  const lastKey = keys.pop();
  const target = keys.reduce((acc, key) => {
    if (!acc[key]) acc[key] = {};
    return acc[key];
  }, obj);
  target[lastKey] = value;
  return obj;
};

const getParentCompletion = (parent) => {
  const required = ['species', 'sex', 'base_color'];
  const filled = required.filter((field) => Boolean(parent[field])).length;
  return {
    filled,
    total: required.length,
    percent: Math.round((filled / required.length) * 100),
    isComplete: filled === required.length,
  };
};

const emptyParent = () => ({
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
});

const BreedingFormScreen = () => {
  const navigation = useNavigation();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [computing, setComputing] = useState(false);
  const [references, setReferences] = useState({
    species: [],
    base_colors: [],
    visual_mutations: [],
    split_genes: [],
  });
  const [parent1, setParent1] = useState(emptyParent());
  const [parent2, setParent2] = useState(emptyParent());
  const [computeLog, setComputeLog] = useState([]);
  const [activeParent, setActiveParent] = useState(1);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await api.get('/references/all');
        if (res.data.success) setReferences(res.data.data);
        else toast.error('Failed to load form options.');
      } catch {
        toast.error('Failed to load form options. Check API connection.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleParentChange = (parentNumber, field, value) => {
    const setter = parentNumber === 1 ? setParent1 : setParent2;
    setter((prev) => {
      const newState = JSON.parse(JSON.stringify(prev));
      setNestedValue(newState, field, value);
      return newState;
    });
  };

  const handleApplyBird = (parentNumber, fields) => {
    if (parentNumber === 1) setParent1({ ...emptyParent(), ...fields });
    else setParent2({ ...emptyParent(), ...fields });
  };

  const resetForm = () => {
    setParent1(emptyParent());
    setParent2(emptyParent());
    setComputeLog([]);
    setActiveParent(1);
  };

  const logStep = (msg) => setComputeLog((prev) => [...prev, msg]);

  const handleSubmitAndCompute = async () => {
    setComputeLog([]);

    if (!parent1.species || !parent1.sex || !parent1.base_color) {
      toast.error('Parent 1: Species, Sex, and Base Color are required.');
      return;
    }
    if (!parent2.species || !parent2.sex || !parent2.base_color) {
      toast.error('Parent 2: Species, Sex, and Base Color are required.');
      return;
    }
    if (parent1.sex === parent2.sex) {
      toast.error('One parent must be Male and the other Female for breeding.');
      return;
    }

    setSubmitting(true);
    toast.info('Saving breeding pair data...');

    const formData = {
      parent1_bird_id: parent1.bird_id || null,
      parent1_name: parent1.name || null,
      parent1_species: parent1.species,
      parent1_sex: parent1.sex,
      parent1_age: parent1.age || null,
      parent1_base_color: parent1.base_color,
      parent1_visual_mutations: parent1.visual_mutations || [],
      parent1_split_genes: parent1.split_genes || [],
      parent1_genetic_data: parent1.genetic_data || {},
      parent2_bird_id: parent2.bird_id || null,
      parent2_name: parent2.name || null,
      parent2_species: parent2.species,
      parent2_sex: parent2.sex,
      parent2_age: parent2.age || null,
      parent2_base_color: parent2.base_color,
      parent2_visual_mutations: parent2.visual_mutations || [],
      parent2_split_genes: parent2.split_genes || [],
      parent2_genetic_data: parent2.genetic_data || {},
      grandparent_data: {
        parent1: parent1.grandparent_data || {},
        parent2: parent2.grandparent_data || {},
      },
    };

    let breedingPairId;
    try {
      const saveRes = await api.post('/breeding-pairs', formData);
      if (!saveRes.data.success) throw new Error(saveRes.data.message || 'Save failed');
      breedingPairId = saveRes.data.data.id;
    } catch (err) {
      toast.error('Failed to save data: ' + (err.response?.data?.message || err.message));
      setSubmitting(false);
      return;
    }

    setComputing(true);
    toast.info('Running genetic computation...');

    try {
      logStep('Step 1: Encoding genetic data...');
      logStep('Step 2: Building Punnett matrices...');
      logStep('Step 3: Running Genetic Algorithm...');

      const results = computeGenetics(
        { ...formData, parent1_name: parent1.name, parent2_name: parent2.name },
        references.visual_mutations
      );

      logStep('Storing results on server...');

      const storeRes = await api.post(`/compute/${breedingPairId}`, {
        chicks_data: results.chicks,
        genetic_analysis: results.genetic_analysis,
        probabilities: results.probabilities,
        verification: results.verification,
      });

      if (!storeRes.data.success) throw new Error('Failed to store results');

      toast.success('Prediction complete! Form reset for a new entry.');
      resetForm();

      setTimeout(() => {
        const root = navigation.getParent()?.getParent?.() || navigation.getParent() || navigation;
        root.navigate('ComputationResult', { id: breedingPairId });
      }, 600);
    } catch (err) {
      toast.error('Computation error: ' + (err.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
      setComputing(false);
    }
  };

  const parent1Progress = getParentCompletion(parent1);
  const parent2Progress = getParentCompletion(parent2);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#e1cf71" />
        <Text style={styles.loadingText}>Loading form data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Genetic Data Collection</Text>
      <Text style={styles.desc}>
        Enter genetic information for both parents, or tap + Bird to auto-fill from your bird list.
      </Text>

      <View style={styles.steps}>
        <Pressable
          style={[styles.step, activeParent === 1 && styles.stepActive]}
          onPress={() => setActiveParent(1)}
        >
          <Text style={styles.stepText}>
            {parent1Progress.isComplete ? '✓' : '1'} Parent 1 ({parent1Progress.percent}%)
          </Text>
        </Pressable>
        <Pressable
          style={[styles.step, activeParent === 2 && styles.stepActive]}
          onPress={() => setActiveParent(2)}
        >
          <Text style={styles.stepText}>
            {parent2Progress.isComplete ? '✓' : '2'} Parent 2 ({parent2Progress.percent}%)
          </Text>
        </Pressable>
      </View>

      {computeLog.length > 0 && (
        <View style={styles.logBox}>
          <Text style={styles.logTitle}>Computation Log</Text>
          {computeLog.map((step, i) => (
            <Text key={i} style={styles.logLine}>
              {step}
            </Text>
          ))}
        </View>
      )}

      {activeParent === 1 ? (
        <ParentForm
          title="Parent 1"
          parentNumber={1}
          formData={parent1}
          onChange={handleParentChange}
          onApplyBird={handleApplyBird}
          speciesList={references.species}
          baseColors={references.base_colors}
          visualMutations={references.visual_mutations}
          splitGenes={references.split_genes}
        />
      ) : (
        <ParentForm
          title="Parent 2"
          parentNumber={2}
          formData={parent2}
          onChange={handleParentChange}
          onApplyBird={handleApplyBird}
          speciesList={references.species}
          baseColors={references.base_colors}
          visualMutations={references.visual_mutations}
          splitGenes={references.split_genes}
        />
      )}

      <View style={styles.actions}>
        <Pressable
          style={styles.cancelBtn}
          disabled={submitting || computing}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
        <Pressable
          style={[styles.submitBtn, (submitting || computing) && styles.disabled]}
          disabled={submitting || computing}
          onPress={handleSubmitAndCompute}
        >
          {computing || submitting ? (
            <ActivityIndicator color="#0a2f3f" />
          ) : (
            <Text style={styles.submitText}>Compute & Predict</Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
};

export default BreedingFormScreen;
