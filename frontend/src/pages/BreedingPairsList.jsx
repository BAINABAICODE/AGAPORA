// frontend/src/pages/BreedingPairsList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/axios';
import './BreedingPairsList.css';

const BreedingPairsList = () => {
  const [pairs, setPairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedResult, setSelectedResult] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchBreedingPairs();
  }, []);

  const fetchBreedingPairs = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/breeding-pairs');
      if (response.data.success) {
        setPairs(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching breeding pairs:', error);
      setError('Failed to load breeding pairs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this breeding pair?')) {
      try {
        await axios.delete(`/breeding-pairs/${id}`);
        fetchBreedingPairs();
      } catch (error) {
        console.error('Error deleting:', error);
      }
    }
  };

  const handleViewResult = async (pairId) => {
    try {
      const response = await axios.get(`/computation-result/${pairId}`);
      if (response.data.success) {
        setSelectedResult(response.data.data);
        setModalOpen(true);
      } else {
        alert('No computation result found for this pair.');
      }
    } catch (error) {
      console.error('Error fetching result:', error);
      alert('Failed to load result. Please try again.');
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedResult(null);
  };

  // Helper to clean up split gene names (remove "split to " if present)
  const cleanSplitName = (name) => {
    return name.replace(/^split to /i, '').replace(/^split /i, '');
  };

  if (loading) {
    return (
      <div className="breeding-pairs-list loading-container">
        <div className="loading-spinner"></div>
        <p>Loading breeding pairs...</p>
      </div>
    );
  }

  return (
    <div className="breeding-pairs-list">
      <div className="pairs-container">
        <div className="pairs-header">
          <h1>My Breeding Pairs</h1>
          <Link to="/breeding-form" className="btn-add">
            + New Prediction
          </Link>
        </div>

        {error && <div className="error-message">{error}</div>}

        {pairs.length === 0 ? (
          <div className="empty-state">
            <p>No breeding pairs yet.</p>
            <Link to="/breeding-form" className="btn-start">
              Create Your First Prediction
            </Link>
          </div>
        ) : (
          <div className="pairs-grid">
            {pairs.map((pair) => (
              <div key={pair.id} className="pair-card">
                <div className="pair-header">
                  <span className="pair-date">
                    {new Date(pair.created_at).toLocaleDateString()}
                  </span>
                  <div className="pair-actions">
                    <button 
                      className="btn-view-result"
                      onClick={() => handleViewResult(pair.id)}
                    >
                      View Result
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => handleDelete(pair.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                <div className="pair-parents">
                  <div className="parent-info">
                    <h3>Parent 1</h3>
                    <p><strong>Species:</strong> {pair.parent1_species}</p>
                    <p><strong>Sex:</strong> {pair.parent1_sex}</p>
                    <p><strong>Base Color:</strong> {pair.parent1_base_color}</p>
                    {pair.parent1_visual_mutations && pair.parent1_visual_mutations.length > 0 && (
                      <p><strong>Mutations:</strong> {pair.parent1_visual_mutations.join(', ')}</p>
                    )}
                  </div>
                  
                  <div className="vs-icon">VS</div>
                  
                  <div className="parent-info">
                    <h3>Parent 2</h3>
                    <p><strong>Species:</strong> {pair.parent2_species}</p>
                    <p><strong>Sex:</strong> {pair.parent2_sex}</p>
                    <p><strong>Base Color:</strong> {pair.parent2_base_color}</p>
                    {pair.parent2_visual_mutations && pair.parent2_visual_mutations.length > 0 && (
                      <p><strong>Mutations:</strong> {pair.parent2_visual_mutations.join(', ')}</p>
                    )}
                  </div>
                </div>
                
                {pair.status === 'completed' && (
                  <div className="pair-status completed">
                    ✓ Prediction Complete
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal with improved chick display */}
      {modalOpen && selectedResult && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>✕</button>
            <h2>Prediction Result</h2>
            
            <div className="modal-body">
              {/* 6 Chicks Preview – clean, no duplicates */}
              <h3>🐣 6 Chicks</h3>
              <div className="chicks-preview">
                {selectedResult.chicks_data?.map((chick, idx) => {
                  // Deduplicate visual mutations
                  const uniqueVisual = [...new Set(chick.visual_mutations || [])];
                  // Deduplicate split genes and clean names
                  const uniqueSplits = [...new Set((chick.split_genes || []).map(cleanSplitName))];
                  
                  return (
                    <div key={idx} className="preview-chick">
                      <strong>#{idx+1}</strong>
                      <span>{chick.sex === 'Male' ? '♂' : '♀'} {chick.sex}</span>
                      <span>· {chick.base_color}</span>
                      {uniqueVisual.length > 0 && (
                        <span className="visual-badge">+ {uniqueVisual.join(', ')}</span>
                      )}
                      {uniqueSplits.length > 0 && (
                        <span className="split-badge">/ split: {uniqueSplits.join(', ')}</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Percentages Section (unchanged) */}
              <div className="percentages-section">
                <h3>📊 Probability Distribution</h3>
                
                {/* Base Colors */}
                <div className="prob-group">
                  <strong>Base Colors</strong>
                  <div className="prob-items">
                    {Object.entries(selectedResult.probabilities?.base_colors || {}).map(([color, p]) => (
                      <div key={color} className="prob-item">
                        <span>{color}</span>
                        <div className="prob-bar">
                          <div className="prob-fill" style={{ width: `${p}%`, backgroundColor: '#6B8E23' }}></div>
                        </div>
                        <span className="prob-value">{p}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sex Ratio */}
                <div className="prob-group">
                  <strong>Sex Distribution</strong>
                  <div className="prob-items">
                    <div className="prob-item">
                      <span>Male ♂</span>
                      <div className="prob-bar">
                        <div className="prob-fill" style={{ width: `${selectedResult.probabilities?.sex?.Male || 0}%`, backgroundColor: '#2C3E50' }}></div>
                      </div>
                      <span className="prob-value">{selectedResult.probabilities?.sex?.Male || 0}%</span>
                    </div>
                    <div className="prob-item">
                      <span>Female ♀</span>
                      <div className="prob-bar">
                        <div className="prob-fill" style={{ width: `${selectedResult.probabilities?.sex?.Female || 0}%`, backgroundColor: '#A1887F' }}></div>
                      </div>
                      <span className="prob-value">{selectedResult.probabilities?.sex?.Female || 0}%</span>
                    </div>
                  </div>
                </div>

                {/* Visual Mutations */}
                {Object.keys(selectedResult.probabilities?.mutations || {}).length > 0 && (
                  <div className="prob-group">
                    <strong>Visual Mutations</strong>
                    <div className="prob-items">
                      {Object.entries(selectedResult.probabilities.mutations).map(([mut, p]) => (
                        <div key={mut} className="prob-item">
                          <span>{mut}</span>
                          <div className="prob-bar">
                            <div className="prob-fill" style={{ width: `${p}%`, backgroundColor: '#D9471E' }}></div>
                          </div>
                          <span className="prob-value">{p}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Split Genes */}
                {Object.keys(selectedResult.probabilities?.split_genes || {}).length > 0 && (
                  <div className="prob-group">
                    <strong>Split / Carrier Genes</strong>
                    <div className="prob-items">
                      {Object.entries(selectedResult.probabilities.split_genes).map(([gene, p]) => (
                        <div key={gene} className="prob-item">
                          <span>{cleanSplitName(gene)}</span>
                          <div className="prob-bar">
                            <div className="prob-fill" style={{ width: `${p}%`, backgroundColor: '#EC793D' }}></div>
                          </div>
                          <span className="prob-value">{p}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Link to={`/computation-result/${selectedResult.breeding_pair_id}`} className="modal-full-link">
                View Full Details →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BreedingPairsList;