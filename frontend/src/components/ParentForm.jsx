// frontend/src/components/ParentForm.jsx
import React, { useState } from 'react';
import './ParentForm.css';

const ParentForm = ({ 
  title, 
  parentNumber, 
  formData, 
  onChange, 
  speciesList, 
  baseColors, 
  visualMutations, 
  splitGenes 
}) => {
  const [showGeneticData, setShowGeneticData] = useState(false);
  const [showGrandparentData, setShowGrandparentData] = useState(false);

  const handleInputChange = (field, value) => {
    onChange(parentNumber, field, value);
  };

  const handleVisualMutationChange = (mutationName, checked) => {
    const currentMutations = formData.visual_mutations || [];
    let newMutations;
    if (checked) {
      newMutations = [...currentMutations, mutationName];
    } else {
      newMutations = currentMutations.filter(m => m !== mutationName);
    }
    handleInputChange('visual_mutations', newMutations);
  };

  const handleSplitGeneChange = (geneName, checked) => {
    const currentGenes = formData.split_genes || [];
    let newGenes;
    if (checked) {
      newGenes = [...currentGenes, geneName];
    } else {
      newGenes = currentGenes.filter(g => g !== geneName);
    }
    handleInputChange('split_genes', newGenes);
  };

  // Helper for nested genetic data changes
  const handleGeneticDataChange = (parentType, grandparentSide, individualType, field, value) => {
    if (parentType === 'parent') {
      // For mother/father genetic data
      const currentGenetic = formData.genetic_data || {};
      const updatedIndividual = {
        ...(currentGenetic[individualType] || {}),
        [field]: value
      };
      handleInputChange(`genetic_data.${individualType}`, updatedIndividual);
    } else if (parentType === 'grandparent') {
      // For grandparents
      const currentGrandparent = formData.grandparent_data || {};
      const updatedSide = {
        ...(currentGrandparent[grandparentSide] || {}),
        [individualType]: {
          ...(currentGrandparent[grandparentSide]?.[individualType] || {}),
          [field]: value
        }
      };
      handleInputChange(`grandparent_data.${grandparentSide}`, updatedSide);
    }
  };

  // Helper for nested visual mutations (grandparent)
  const handleGrandparentVisualMutationChange = (side, individualType, mutationName, checked) => {
    const currentGrandparent = formData.grandparent_data || {};
    const currentMutations = currentGrandparent[side]?.[individualType]?.visual_mutations || [];
    let newMutations;
    if (checked) {
      newMutations = [...currentMutations, mutationName];
    } else {
      newMutations = currentMutations.filter(m => m !== mutationName);
    }
    
    const updatedIndividual = {
      ...(currentGrandparent[side]?.[individualType] || {}),
      visual_mutations: newMutations
    };
    const updatedSide = {
      ...(currentGrandparent[side] || {}),
      [individualType]: updatedIndividual
    };
    handleInputChange(`grandparent_data.${side}`, updatedSide);
  };

  // Helper for nested split genes (grandparent)
  const handleGrandparentSplitGeneChange = (side, individualType, geneName, checked) => {
    const currentGrandparent = formData.grandparent_data || {};
    const currentGenes = currentGrandparent[side]?.[individualType]?.split_genes || [];
    let newGenes;
    if (checked) {
      newGenes = [...currentGenes, geneName];
    } else {
      newGenes = currentGenes.filter(g => g !== geneName);
    }
    
    const updatedIndividual = {
      ...(currentGrandparent[side]?.[individualType] || {}),
      split_genes: newGenes
    };
    const updatedSide = {
      ...(currentGrandparent[side] || {}),
      [individualType]: updatedIndividual
    };
    handleInputChange(`grandparent_data.${side}`, updatedSide);
  };

  // Helper for parent genetic data visual mutations
  const handleParentGeneticVisualChange = (individualType, mutationName, checked) => {
    const currentGenetic = formData.genetic_data || {};
    const currentMutations = currentGenetic[individualType]?.visual_mutations || [];
    let newMutations;
    if (checked) {
      newMutations = [...currentMutations, mutationName];
    } else {
      newMutations = currentMutations.filter(m => m !== mutationName);
    }
    
    const updatedIndividual = {
      ...(currentGenetic[individualType] || {}),
      visual_mutations: newMutations
    };
    handleInputChange(`genetic_data.${individualType}`, updatedIndividual);
  };

  // Helper for parent genetic data split genes
  const handleParentGeneticSplitChange = (individualType, geneName, checked) => {
    const currentGenetic = formData.genetic_data || {};
    const currentGenes = currentGenetic[individualType]?.split_genes || [];
    let newGenes;
    if (checked) {
      newGenes = [...currentGenes, geneName];
    } else {
      newGenes = currentGenes.filter(g => g !== geneName);
    }
    
    const updatedIndividual = {
      ...(currentGenetic[individualType] || {}),
      split_genes: newGenes
    };
    handleInputChange(`genetic_data.${individualType}`, updatedIndividual);
  };

  // Render genetic info form for a bird (reusable)
  const renderGeneticBirdForm = (birdType, label, isGrandparent = false, side = null) => {
    let birdData = {};
    let onBaseColorChange = (value) => {};
    let onVisualChange = (mutation, checked) => {};
    let onSplitChange = (gene, checked) => {};

    if (isGrandparent) {
      birdData = formData.grandparent_data?.[side]?.[birdType] || {};
      onBaseColorChange = (value) => handleGeneticDataChange('grandparent', side, birdType, 'base_color', value);
      onVisualChange = (mutation, checked) => handleGrandparentVisualMutationChange(side, birdType, mutation, checked);
      onSplitChange = (gene, checked) => handleGrandparentSplitGeneChange(side, birdType, gene, checked);
    } else {
      birdData = formData.genetic_data?.[birdType] || {};
      onBaseColorChange = (value) => handleGeneticDataChange('parent', null, birdType, 'base_color', value);
      onVisualChange = (mutation, checked) => handleParentGeneticVisualChange(birdType, mutation, checked);
      onSplitChange = (gene, checked) => handleParentGeneticSplitChange(birdType, gene, checked);
    }

    return (
      <div className="genetic-bird-form">
        <h5>{label}</h5>
        <div className="form-grid">
          {/* Base Color */}
          <div className="form-group">
            <label>Base Color</label>
            <select
              className="form-select"
              value={birdData.base_color || ''}
              onChange={(e) => onBaseColorChange(e.target.value)}
            >
              <option value="">Select Base Color</option>
              {baseColors.map((color) => (
                <option key={color.id} value={color.name}>
                  {color.name}
                </option>
              ))}
            </select>
          </div>

          {/* Visual Mutations */}
          <div className="form-group full-width">
            <label>Visual Color Mutations</label>
            <div className="checkbox-group compact">
              {visualMutations.map((mutation) => (
                <label key={mutation.id} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={(birdData.visual_mutations || []).includes(mutation.name)}
                    onChange={(e) => onVisualChange(mutation.name, e.target.checked)}
                  />
                  <span>{mutation.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Split Genes */}
          <div className="form-group full-width">
            <label>Split / Hidden Genes (Carrier Genes)</label>
            <div className="checkbox-group compact">
              {splitGenes.map((gene) => (
                <label key={gene.id} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={(birdData.split_genes || []).includes(gene.name)}
                    onChange={(e) => onSplitChange(gene.name, e.target.checked)}
                  />
                  <span>{gene.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="parent-form">
      <div className="parent-status-bar">
        <span className="status-pulse-dot" aria-hidden="true" />
        <span className="status-text">{title} • Data Entry Active</span>
      </div>

      <div className="form-grid">
        {/* Bird ID / Name */}
        <div className="form-group">
          <label>Bird ID / Name</label>
          <input
            type="text"
            className="form-input"
            value={formData.bird_id || ''}
            onChange={(e) => handleInputChange('bird_id', e.target.value)}
            placeholder="Enter bird ID or name"
          />
        </div>

        {/* Species */}
        <div className="form-group">
          <label>Species *</label>
          <select
            className="form-select"
            value={formData.species || ''}
            onChange={(e) => handleInputChange('species', e.target.value)}
            required
          >
            <option value="">Select Species</option>
            {speciesList.map((species) => (
              <option key={species.id} value={species.name}>
                {species.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sex */}
        <div className="form-group">
          <label>Sex *</label>
          <select
            className="form-select"
            value={formData.sex || ''}
            onChange={(e) => handleInputChange('sex', e.target.value)}
            required
          >
            <option value="">Select Sex</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        {/* Age */}
        <div className="form-group">
          <label>Age (months)</label>
          <input
            type="number"
            className="form-input"
            value={formData.age || ''}
            onChange={(e) => handleInputChange('age', e.target.value)}
            placeholder="Enter age in months"
          />
        </div>

        {/* Base Color */}
        <div className="form-group">
          <label>Base Color *</label>
          <select
            className="form-select"
            value={formData.base_color || ''}
            onChange={(e) => handleInputChange('base_color', e.target.value)}
            required
          >
            <option value="">Select Base Color</option>
            {baseColors.map((color) => (
              <option key={color.id} value={color.name}>
                {color.name}
              </option>
            ))}
          </select>
        </div>

        {/* Visual Color Mutations */}
        <div className="form-group full-width">
          <label>Visual Color Mutations (Select multiple)</label>
          <div className="checkbox-group">
            {visualMutations.map((mutation) => (
              <label key={mutation.id} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={(formData.visual_mutations || []).includes(mutation.name)}
                  onChange={(e) => handleVisualMutationChange(mutation.name, e.target.checked)}
                />
                <span>{mutation.name}</span>
                {mutation.inheritance && <small>({mutation.inheritance})</small>}
              </label>
            ))}
          </div>
        </div>

        {/* Split / Hidden Genes */}
        <div className="form-group full-width">
          <label>Split / Hidden Genes (Carrier Genes)</label>
          <div className="checkbox-group">
            {splitGenes.map((gene) => (
              <label key={gene.id} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={(formData.split_genes || []).includes(gene.name)}
                  onChange={(e) => handleSplitGeneChange(gene.name, e.target.checked)}
                />
                <span>{gene.name}</span>
                {gene.inheritance && <small>({gene.inheritance})</small>}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Optional: Parent Genetic Data (Mother/Father) Section */}
      <div className="toggle-section">
        <button 
          type="button"
          className="toggle-button"
          onClick={() => setShowGeneticData(!showGeneticData)}
        >
          {showGeneticData ? '▼' : '▶'} Optional: Parent Genetic Data (Mother/Father)
        </button>
        
        {showGeneticData && (
          <div className="toggle-content">
            <div className="sub-form-grid">
              {renderGeneticBirdForm('mother', 'Mother\'s Genetic Information', false)}
              {renderGeneticBirdForm('father', 'Father\'s Genetic Information', false)}
            </div>
          </div>
        )}
      </div>

      {/* Optional: Grandparent Data Section */}
      <div className="toggle-section">
        <button 
          type="button"
          className="toggle-button"
          onClick={() => setShowGrandparentData(!showGrandparentData)}
        >
          {showGrandparentData ? '▼' : '▶'} Optional: Grandparent Data
        </button>
        
        {showGrandparentData && (
          <div className="toggle-content">
            <div className="grandparent-grid">
              {/* Paternal Grandparents */}
              <div className="grandparent-card">
                <h4>Paternal Grandparents (Father's side)</h4>
                {renderGeneticBirdForm('grandfather', 'Paternal Grandfather', true, 'paternal')}
                {renderGeneticBirdForm('grandmother', 'Paternal Grandmother', true, 'paternal')}
              </div>

              {/* Maternal Grandparents */}
              <div className="grandparent-card">
                <h4>Maternal Grandparents (Mother's side)</h4>
                {renderGeneticBirdForm('grandfather', 'Maternal Grandfather', true, 'maternal')}
                {renderGeneticBirdForm('grandmother', 'Maternal Grandmother', true, 'maternal')}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentForm;