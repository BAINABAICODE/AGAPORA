import React, { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import PickerField from './PickerField';
import CheckboxGroup from './CheckboxGroup';
import BirdSelectModal from './BirdSelectModal';
import { birdToParentFields } from '../api/birdService';
import { useToast } from '../context/ToastContext';
import styles from './ParentForm.styles';

const ParentForm = ({
  title,
  parentNumber,
  formData,
  onChange,
  onApplyBird,
  speciesList = [],
  baseColors = [],
  visualMutations = [],
  splitGenes = [],
}) => {
  const toast = useToast();
  const [showGeneticData, setShowGeneticData] = useState(false);
  const [showGrandparentData, setShowGrandparentData] = useState(false);
  const [selectOpen, setSelectOpen] = useState(false);

  const handleInputChange = (field, value) => onChange(parentNumber, field, value);

  const handleVisualMutationChange = (mutationName, checked) => {
    const current = formData.visual_mutations || [];
    const next = checked
      ? [...current, mutationName]
      : current.filter((m) => m !== mutationName);
    handleInputChange('visual_mutations', next);
  };

  const handleSplitGeneChange = (geneName, checked) => {
    const current = formData.split_genes || [];
    const next = checked
      ? [...current, geneName]
      : current.filter((g) => g !== geneName);
    handleInputChange('split_genes', next);
  };

  const handleGeneticDataChange = (parentType, grandparentSide, individualType, field, value) => {
    if (parentType === 'parent') {
      const currentGenetic = formData.genetic_data || {};
      const updatedIndividual = {
        ...(currentGenetic[individualType] || {}),
        [field]: value,
      };
      handleInputChange(`genetic_data.${individualType}`, updatedIndividual);
    } else if (parentType === 'grandparent') {
      const currentGrandparent = formData.grandparent_data || {};
      const updatedSide = {
        ...(currentGrandparent[grandparentSide] || {}),
        [individualType]: {
          ...(currentGrandparent[grandparentSide]?.[individualType] || {}),
          [field]: value,
        },
      };
      handleInputChange(`grandparent_data.${grandparentSide}`, updatedSide);
    }
  };

  const handleGrandparentVisualMutationChange = (side, individualType, mutationName, checked) => {
    const currentGrandparent = formData.grandparent_data || {};
    const currentMutations =
      currentGrandparent[side]?.[individualType]?.visual_mutations || [];
    const newMutations = checked
      ? [...currentMutations, mutationName]
      : currentMutations.filter((m) => m !== mutationName);
    const updatedIndividual = {
      ...(currentGrandparent[side]?.[individualType] || {}),
      visual_mutations: newMutations,
    };
    const updatedSide = {
      ...(currentGrandparent[side] || {}),
      [individualType]: updatedIndividual,
    };
    handleInputChange(`grandparent_data.${side}`, updatedSide);
  };

  const handleGrandparentSplitGeneChange = (side, individualType, geneName, checked) => {
    const currentGrandparent = formData.grandparent_data || {};
    const currentGenes = currentGrandparent[side]?.[individualType]?.split_genes || [];
    const newGenes = checked
      ? [...currentGenes, geneName]
      : currentGenes.filter((g) => g !== geneName);
    const updatedIndividual = {
      ...(currentGrandparent[side]?.[individualType] || {}),
      split_genes: newGenes,
    };
    const updatedSide = {
      ...(currentGrandparent[side] || {}),
      [individualType]: updatedIndividual,
    };
    handleInputChange(`grandparent_data.${side}`, updatedSide);
  };

  const handleParentGeneticVisualChange = (individualType, mutationName, checked) => {
    const currentGenetic = formData.genetic_data || {};
    const currentMutations = currentGenetic[individualType]?.visual_mutations || [];
    const newMutations = checked
      ? [...currentMutations, mutationName]
      : currentMutations.filter((m) => m !== mutationName);
    const updatedIndividual = {
      ...(currentGenetic[individualType] || {}),
      visual_mutations: newMutations,
    };
    handleInputChange(`genetic_data.${individualType}`, updatedIndividual);
  };

  const handleParentGeneticSplitChange = (individualType, geneName, checked) => {
    const currentGenetic = formData.genetic_data || {};
    const currentGenes = currentGenetic[individualType]?.split_genes || [];
    const newGenes = checked
      ? [...currentGenes, geneName]
      : currentGenes.filter((g) => g !== geneName);
    const updatedIndividual = {
      ...(currentGenetic[individualType] || {}),
      split_genes: newGenes,
    };
    handleInputChange(`genetic_data.${individualType}`, updatedIndividual);
  };

  const colorOptions = baseColors.map((c) => ({ label: c.name, value: c.name }));
  const speciesOptions = speciesList.map((s) => ({ label: s.name, value: s.name }));

  const renderGeneticBirdForm = (birdType, label, isGrandparent = false, side = null) => {
    let birdData = {};
    let onBaseColorChange = () => {};
    let onVisualChange = () => {};
    let onSplitChange = () => {};

    if (isGrandparent) {
      birdData = formData.grandparent_data?.[side]?.[birdType] || {};
      onBaseColorChange = (value) =>
        handleGeneticDataChange('grandparent', side, birdType, 'base_color', value);
      onVisualChange = (mutation, checked) =>
        handleGrandparentVisualMutationChange(side, birdType, mutation, checked);
      onSplitChange = (gene, checked) =>
        handleGrandparentSplitGeneChange(side, birdType, gene, checked);
    } else {
      birdData = formData.genetic_data?.[birdType] || {};
      onBaseColorChange = (value) =>
        handleGeneticDataChange('parent', null, birdType, 'base_color', value);
      onVisualChange = (mutation, checked) =>
        handleParentGeneticVisualChange(birdType, mutation, checked);
      onSplitChange = (gene, checked) =>
        handleParentGeneticSplitChange(birdType, gene, checked);
    }

    return (
      <View style={styles.subCard} key={`${side || 'p'}-${birdType}`}>
        <Text style={styles.subTitle}>{label}</Text>
        <PickerField
          label="Base Color"
          value={birdData.base_color || ''}
          options={colorOptions}
          onChange={onBaseColorChange}
          placeholder="Select Base Color"
        />
        <CheckboxGroup
          label="Visual Color Mutations"
          items={visualMutations}
          selected={birdData.visual_mutations || []}
          onToggle={onVisualChange}
        />
        <CheckboxGroup
          label="Split / Hidden Genes"
          items={splitGenes}
          selected={birdData.split_genes || []}
          onToggle={onSplitChange}
        />
      </View>
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.statusBar}>
        <View style={styles.pulse} />
        <Text style={styles.statusText}>{title} • Data Entry Active</Text>
        <Pressable style={styles.addBirdBtn} onPress={() => setSelectOpen(true)}>
          <Text style={styles.addBirdText}>+ Bird</Text>
        </Pressable>
      </View>

      <Text style={styles.fieldLabel}>Bird ID</Text>
      <TextInput
        style={styles.input}
        value={formData.bird_id || ''}
        onChangeText={(v) => handleInputChange('bird_id', v)}
        placeholder="Enter bird ID"
        placeholderTextColor="rgba(238,212,173,0.45)"
      />

      <Text style={styles.fieldLabel}>Bird Name (optional)</Text>
      <TextInput
        style={styles.input}
        value={formData.name || ''}
        onChangeText={(v) => handleInputChange('name', v)}
        placeholder="Enter bird name"
        placeholderTextColor="rgba(238,212,173,0.45)"
      />

      <PickerField
        label="Species"
        required
        value={formData.species || ''}
        options={speciesOptions}
        onChange={(v) => handleInputChange('species', v)}
        placeholder="Select Species"
      />

      <PickerField
        label="Sex"
        required
        value={formData.sex || ''}
        options={[
          { label: 'Male', value: 'Male' },
          { label: 'Female', value: 'Female' },
        ]}
        onChange={(v) => handleInputChange('sex', v)}
        placeholder="Select Sex"
      />

      <Text style={styles.fieldLabel}>Age (months)</Text>
      <TextInput
        style={styles.input}
        value={formData.age != null ? String(formData.age) : ''}
        onChangeText={(v) => handleInputChange('age', v)}
        placeholder="Enter age in months"
        placeholderTextColor="rgba(238,212,173,0.45)"
        keyboardType="numeric"
      />

      <PickerField
        label="Base Color"
        required
        value={formData.base_color || ''}
        options={colorOptions}
        onChange={(v) => handleInputChange('base_color', v)}
        placeholder="Select Base Color"
      />

      <CheckboxGroup
        label="Visual Color Mutations (Select multiple)"
        items={visualMutations}
        selected={formData.visual_mutations || []}
        onToggle={handleVisualMutationChange}
      />

      <CheckboxGroup
        label="Split / Hidden Genes (Carrier Genes)"
        items={splitGenes}
        selected={formData.split_genes || []}
        onToggle={handleSplitGeneChange}
      />

      <Pressable style={styles.toggle} onPress={() => setShowGeneticData(!showGeneticData)}>
        <Text style={styles.toggleText}>
          {showGeneticData ? '▼' : '▶'} Optional: Parent Genetic Data (Mother/Father)
        </Text>
      </Pressable>
      {showGeneticData && (
        <View>
          {renderGeneticBirdForm('mother', "Mother's Genetic Information", false)}
          {renderGeneticBirdForm('father', "Father's Genetic Information", false)}
        </View>
      )}

      <Pressable
        style={styles.toggle}
        onPress={() => setShowGrandparentData(!showGrandparentData)}
      >
        <Text style={styles.toggleText}>
          {showGrandparentData ? '▼' : '▶'} Optional: Grandparent Data
        </Text>
      </Pressable>
      {showGrandparentData && (
        <View>
          <Text style={styles.sectionTitle}>Paternal Grandparents</Text>
          {renderGeneticBirdForm('grandfather', 'Paternal Grandfather', true, 'paternal')}
          {renderGeneticBirdForm('grandmother', 'Paternal Grandmother', true, 'paternal')}
          <Text style={styles.sectionTitle}>Maternal Grandparents</Text>
          {renderGeneticBirdForm('grandfather', 'Maternal Grandfather', true, 'maternal')}
          {renderGeneticBirdForm('grandmother', 'Maternal Grandmother', true, 'maternal')}
        </View>
      )}

      <BirdSelectModal
        visible={selectOpen}
        onClose={() => setSelectOpen(false)}
        onSelect={(bird) => {
          const fields = birdToParentFields(bird);
          if (onApplyBird) onApplyBird(parentNumber, fields);
          toast.success(`Loaded ${fields.name || fields.bird_id || 'bird'} into ${title}`);
        }}
      />
    </View>
  );
};

export default ParentForm;
