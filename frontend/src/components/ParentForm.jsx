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

  // Handle genetic data changes
  const handleGeneticDataChange = (field, value, type = 'parent') => {
    if (type === 'genetic') {
      handleInputChange(`genetic_data.${field}`, value);
    } else if (type === 'grandparent_paternal') {
      handleInputChange(`grandparent_data.paternal.${field}`, value);
    } else if (type === 'grandparent_maternal') {
      handleInputChange(`grandparent_data.maternal.${field}`, value);
    }
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

      {/* Optional Parent Genetic Data Section */}
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
              <h4>Mother's Genetic Information</h4>
              <div className="form-grid">
                <div className="form-group">
                  <label>Base Color</label>
                  <select
                    className="form-select"
                    value={formData.genetic_data?.mother?.base_color || ''}
                    onChange={(e) => handleGeneticDataChange('mother.base_color', e.target.value, 'genetic')}
                  >
                    <option value="">Select Base Color</option>
                    {baseColors.map((color) => (
                      <option key={color.id} value={color.name}>{color.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Mutation Type</label>
                  <input type="text" className="form-input" placeholder="e.g., Lutino, Pied"
                    value={formData.genetic_data?.mother?.mutation_type || ''}
                    onChange={(e) => handleGeneticDataChange('mother.mutation_type', e.target.value, 'genetic')}
                  />
                </div>
                <div className="form-group">
                  <label>Visual Traits</label>
                  <input type="text" className="form-input" placeholder="Visual characteristics"
                    value={formData.genetic_data?.mother?.visual_traits || ''}
                    onChange={(e) => handleGeneticDataChange('mother.visual_traits', e.target.value, 'genetic')}
                  />
                </div>
                <div className="form-group full-width">
                  <label>Split / Hidden Genes</label>
                  <input type="text" className="form-input" placeholder="e.g., split to Blue, split to Pied"
                    value={formData.genetic_data?.mother?.split_genes || ''}
                    onChange={(e) => handleGeneticDataChange('mother.split_genes', e.target.value, 'genetic')}
                  />
                </div>
              </div>

              <h4>Father's Genetic Information</h4>
              <div className="form-grid">
                <div className="form-group">
                  <label>Base Color</label>
                  <select
                    className="form-select"
                    value={formData.genetic_data?.father?.base_color || ''}
                    onChange={(e) => handleGeneticDataChange('father.base_color', e.target.value, 'genetic')}
                  >
                    <option value="">Select Base Color</option>
                    {baseColors.map((color) => (
                      <option key={color.id} value={color.name}>{color.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Mutation Type</label>
                  <input type="text" className="form-input" placeholder="e.g., Lutino, Pied"
                    value={formData.genetic_data?.father?.mutation_type || ''}
                    onChange={(e) => handleGeneticDataChange('father.mutation_type', e.target.value, 'genetic')}
                  />
                </div>
                <div className="form-group">
                  <label>Visual Traits</label>
                  <input type="text" className="form-input" placeholder="Visual characteristics"
                    value={formData.genetic_data?.father?.visual_traits || ''}
                    onChange={(e) => handleGeneticDataChange('father.visual_traits', e.target.value, 'genetic')}
                  />
                </div>
                <div className="form-group full-width">
                  <label>Split / Hidden Genes</label>
                  <input type="text" className="form-input" placeholder="e.g., split to Blue, split to Pied"
                    value={formData.genetic_data?.father?.split_genes || ''}
                    onChange={(e) => handleGeneticDataChange('father.split_genes', e.target.value, 'genetic')}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Optional Grandparent Data Section */}
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
                <div className="sub-form-grid">
                  <h5>Paternal Grandfather</h5>
                  <div className="form-grid">
                    <div className="form-group"><label>Base Color</label><input type="text" className="form-input" placeholder="e.g., Green, Blue"
                      value={formData.grandparent_data?.paternal?.grandfather?.base_color || ''}
                      onChange={(e) => handleGeneticDataChange('paternal.grandfather.base_color', e.target.value, 'grandparent_paternal')}
                    /></div>
                    <div className="form-group"><label>Mutation Type</label><input type="text" className="form-input" placeholder="e.g., Lutino"
                      value={formData.grandparent_data?.paternal?.grandfather?.mutation_type || ''}
                      onChange={(e) => handleGeneticDataChange('paternal.grandfather.mutation_type', e.target.value, 'grandparent_paternal')}
                    /></div>
                    <div className="form-group"><label>Visual Traits</label><input type="text" className="form-input" placeholder="Visual characteristics"
                      value={formData.grandparent_data?.paternal?.grandfather?.visual_traits || ''}
                      onChange={(e) => handleGeneticDataChange('paternal.grandfather.visual_traits', e.target.value, 'grandparent_paternal')}
                    /></div>
                    <div className="form-group"><label>Split Genes</label><input type="text" className="form-input" placeholder="Carrier genes"
                      value={formData.grandparent_data?.paternal?.grandfather?.split_genes || ''}
                      onChange={(e) => handleGeneticDataChange('paternal.grandfather.split_genes', e.target.value, 'grandparent_paternal')}
                    /></div>
                  </div>
                  <h5>Paternal Grandmother</h5>
                  <div className="form-grid">
                    <div className="form-group"><label>Base Color</label><input type="text" className="form-input" placeholder="e.g., Green, Blue"
                      value={formData.grandparent_data?.paternal?.grandmother?.base_color || ''}
                      onChange={(e) => handleGeneticDataChange('paternal.grandmother.base_color', e.target.value, 'grandparent_paternal')}
                    /></div>
                    <div className="form-group"><label>Mutation Type</label><input type="text" className="form-input" placeholder="e.g., Lutino"
                      value={formData.grandparent_data?.paternal?.grandmother?.mutation_type || ''}
                      onChange={(e) => handleGeneticDataChange('paternal.grandmother.mutation_type', e.target.value, 'grandparent_paternal')}
                    /></div>
                    <div className="form-group"><label>Visual Traits</label><input type="text" className="form-input" placeholder="Visual characteristics"
                      value={formData.grandparent_data?.paternal?.grandmother?.visual_traits || ''}
                      onChange={(e) => handleGeneticDataChange('paternal.grandmother.visual_traits', e.target.value, 'grandparent_paternal')}
                    /></div>
                    <div className="form-group"><label>Split Genes</label><input type="text" className="form-input" placeholder="Carrier genes"
                      value={formData.grandparent_data?.paternal?.grandmother?.split_genes || ''}
                      onChange={(e) => handleGeneticDataChange('paternal.grandmother.split_genes', e.target.value, 'grandparent_paternal')}
                    /></div>
                  </div>
                </div>
              </div>

              {/* Maternal Grandparents */}
              <div className="grandparent-card">
                <h4>Maternal Grandparents (Mother's side)</h4>
                <div className="sub-form-grid">
                  <h5>Maternal Grandfather</h5>
                  <div className="form-grid">
                    <div className="form-group"><label>Base Color</label><input type="text" className="form-input" placeholder="e.g., Green, Blue"
                      value={formData.grandparent_data?.maternal?.grandfather?.base_color || ''}
                      onChange={(e) => handleGeneticDataChange('maternal.grandfather.base_color', e.target.value, 'grandparent_maternal')}
                    /></div>
                    <div className="form-group"><label>Mutation Type</label><input type="text" className="form-input" placeholder="e.g., Lutino"
                      value={formData.grandparent_data?.maternal?.grandfather?.mutation_type || ''}
                      onChange={(e) => handleGeneticDataChange('maternal.grandfather.mutation_type', e.target.value, 'grandparent_maternal')}
                    /></div>
                    <div className="form-group"><label>Visual Traits</label><input type="text" className="form-input" placeholder="Visual characteristics"
                      value={formData.grandparent_data?.maternal?.grandfather?.visual_traits || ''}
                      onChange={(e) => handleGeneticDataChange('maternal.grandfather.visual_traits', e.target.value, 'grandparent_maternal')}
                    /></div>
                    <div className="form-group"><label>Split Genes</label><input type="text" className="form-input" placeholder="Carrier genes"
                      value={formData.grandparent_data?.maternal?.grandfather?.split_genes || ''}
                      onChange={(e) => handleGeneticDataChange('maternal.grandfather.split_genes', e.target.value, 'grandparent_maternal')}
                    /></div>
                  </div>
                  <h5>Maternal Grandmother</h5>
                  <div className="form-grid">
                    <div className="form-group"><label>Base Color</label><input type="text" className="form-input" placeholder="e.g., Green, Blue"
                      value={formData.grandparent_data?.maternal?.grandmother?.base_color || ''}
                      onChange={(e) => handleGeneticDataChange('maternal.grandmother.base_color', e.target.value, 'grandparent_maternal')}
                    /></div>
                    <div className="form-group"><label>Mutation Type</label><input type="text" className="form-input" placeholder="e.g., Lutino"
                      value={formData.grandparent_data?.maternal?.grandmother?.mutation_type || ''}
                      onChange={(e) => handleGeneticDataChange('maternal.grandmother.mutation_type', e.target.value, 'grandparent_maternal')}
                    /></div>
                    <div className="form-group"><label>Visual Traits</label><input type="text" className="form-input" placeholder="Visual characteristics"
                      value={formData.grandparent_data?.maternal?.grandmother?.visual_traits || ''}
                      onChange={(e) => handleGeneticDataChange('maternal.grandmother.visual_traits', e.target.value, 'grandparent_maternal')}
                    /></div>
                    <div className="form-group"><label>Split Genes</label><input type="text" className="form-input" placeholder="Carrier genes"
                      value={formData.grandparent_data?.maternal?.grandmother?.split_genes || ''}
                      onChange={(e) => handleGeneticDataChange('maternal.grandmother.split_genes', e.target.value, 'grandparent_maternal')}
                    /></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentForm;