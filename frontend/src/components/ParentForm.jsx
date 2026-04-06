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

  return (
    <div className="parent-form">
      <h3 className="parent-form-title">{title}</h3>
      
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
                {color.name} ({color.inheritance})
              </option>
            ))}
          </select>
        </div>

        {/* Visual Color Mutations - Checkboxes */}
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
                <small>({mutation.inheritance})</small>
              </label>
            ))}
          </div>
        </div>

        {/* Split / Hidden Genes - Checkboxes */}
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
                <small>({gene.inheritance} - {gene.sex_restriction})</small>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentForm;