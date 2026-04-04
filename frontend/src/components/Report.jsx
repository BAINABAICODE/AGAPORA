import React, { useState } from 'react';
import api from '../api/axios';
import './Report.css';

const Report = ({ reportData }) => {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const saveToDatabase = async () => {
    setSaving(true);
    try {
      const breedingData = {
        pair_name: `${reportData.parents.parent1.bird_id || 'Parent1'} x ${reportData.parents.parent2.bird_id || 'Parent2'}`,
        parent1: {
          bird_id: reportData.parents.parent1.bird_id,
          name: reportData.parents.parent1.name,
          species: reportData.parents.parent1.species,
          sex: reportData.parents.parent1.sex,
          age: reportData.parents.parent1.age_months,
          base_color: reportData.parents.parent1.base_color,
          visual_mutations: reportData.parents.parent1.visual_mutations,
          splits: reportData.parents.parent1.splits
        },
        parent2: {
          bird_id: reportData.parents.parent2.bird_id,
          name: reportData.parents.parent2.name,
          species: reportData.parents.parent2.species,
          sex: reportData.parents.parent2.sex,
          age: reportData.parents.parent2.age_months,
          base_color: reportData.parents.parent2.base_color,
          visual_mutations: reportData.parents.parent2.visual_mutations,
          splits: reportData.parents.parent2.splits
        },
        computation_results: reportData.computationResults,
        compatibility_score: reportData.verification,
        offspring_predictions: reportData.offspringPredictions
      };
      await api.post('/breeding/store', breedingData);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving:', error);
      alert('Failed to save breeding data');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="report-container">
      <div className="report-header">
        <h2>Genetic Breeding Report</h2>
        <button 
          className={`save-btn ${saved ? 'saved' : ''}`} 
          onClick={saveToDatabase} 
          disabled={saving}
        >
          {saving ? 'Saving...' : saved ? '✓ Saved!' : '💾 Save to Database'}
        </button>
      </div>

      <div className="compatibility-card">
        <h3>Parent Compatibility Analysis</h3>
        <div className="compatibility-stats">
          <div className="stat">
            <span className="stat-label">Compatibility Score</span>
            <span className="stat-value">
              {reportData.verification?.fuzzyLogicResult?.score || reportData.computationResults?.geneticAlgorithmResults?.compatibilityScore || 0}%
            </span>
          </div>
          <div className="stat">
            <span className="stat-label">Compatibility Level</span>
            <span className="stat-level">
              {reportData.verification?.fuzzyLogicResult?.level || 'Calculating...'}
            </span>
          </div>
          <div className="stat full-width">
            <span className="stat-label">Recommendation</span>
            <span className="stat-recommendation">
              {reportData.verification?.fuzzyLogicResult?.recommendation || 
                (reportData.computationResults?.geneticAlgorithmResults?.recommendedBreeding 
                  ? 'Recommended for breeding' 
                  : 'Consider other pairings')}
            </span>
          </div>
        </div>
      </div>

      <div className="chicks-section">
        <h3>Offspring Predictions (6 Chicks)</h3>
        <div className="chicks-grid">
          {reportData.offspringPredictions?.map((chick, idx) => (
            <div key={idx} className="chick-card">
              <div className="chick-header">
                <span className="chick-number">Chick #{chick.chickNumber || idx + 1}</span>
                <span className="inheritance-badge">{chick.inheritancePercentage || 85}% Match</span>
              </div>
              <div className="chick-details">
                <div className="detail-row">
                  <span className="detail-label">Base Color:</span>
                  <span className="detail-value">{chick.baseColor || 'Green'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Dark Factor:</span>
                  <span className="detail-value">
                    {chick.darkFactor === 0 ? 'None' : chick.darkFactor === 1 ? 'Single Factor' : 'Double Factor'}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Visual Mutations:</span>
                  <span className="detail-value">
                    {chick.visualMutations?.length ? chick.visualMutations.join(', ') : 'None'}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Split/Carries:</span>
                  <span className="detail-value">
                    {chick.splits?.length ? chick.splits.join(', ') : 'None'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="parents-section">
        <div className="parent-card">
          <h4>Parent 1 (Male/Father)</h4>
          <div className="parent-details">
            <p><strong>ID:</strong> {reportData.parents.parent1.bird_id || 'N/A'}</p>
            <p><strong>Species:</strong> {reportData.parents.parent1.species}</p>
            <p><strong>Base Color:</strong> {reportData.parents.parent1.base_color}</p>
            <p><strong>Visual Mutations:</strong> {reportData.parents.parent1.visual_mutations?.join(', ') || 'None'}</p>
            <p><strong>Splits:</strong> {reportData.parents.parent1.splits?.join(', ') || 'None'}</p>
          </div>
        </div>
        <div className="parent-card">
          <h4>Parent 2 (Female/Mother)</h4>
          <div className="parent-details">
            <p><strong>ID:</strong> {reportData.parents.parent2.bird_id || 'N/A'}</p>
            <p><strong>Species:</strong> {reportData.parents.parent2.species}</p>
            <p><strong>Base Color:</strong> {reportData.parents.parent2.base_color}</p>
            <p><strong>Visual Mutations:</strong> {reportData.parents.parent2.visual_mutations?.join(', ') || 'None'}</p>
            <p><strong>Splits:</strong> {reportData.parents.parent2.splits?.join(', ') || 'None'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;