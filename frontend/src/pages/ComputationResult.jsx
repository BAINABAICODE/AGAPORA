// frontend/src/pages/ComputationResult.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import './ComputationResult.css';

const ComputationResult = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchResult();
  }, [id]);

  const fetchResult = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/computation-result/${id}`);
      if (response.data.success) {
        setResult(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching result:', error);
      setError('Failed to load computation results');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="computation-result loading-container">
        <div className="loading-spinner"></div>
        <p>Loading prediction results...</p>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="computation-result error-container">
        <div className="error-card">
          <h2>No Results Found</h2>
          <p>{error || 'Please compute predictions first'}</p>
          <button onClick={() => navigate('/breeding-form')} className="retry-button">
            Start New Prediction
          </button>
        </div>
      </div>
    );
  }

  const chicks = result.chicks_data;
  const probabilities = result.probabilities;

  return (
    <div className="computation-result">
      <div className="result-container">
        <h1 className="result-title">Genetic Prediction Results</h1>
        <p className="result-subtitle">6 Chicks predicted based on parent genetics</p>

        {/* Probability Statistics */}
        <div className="probabilities-section">
          <h2>Probability Statistics</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Base Color Distribution</h3>
              {Object.entries(probabilities.base_colors || {}).map(([color, prob]) => (
                <div key={color} className="stat-item">
                  <span>{color}</span>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${prob}%` }}></div>
                  </div>
                  <span className="stat-value">{prob}%</span>
                </div>
              ))}
            </div>

            <div className="stat-card">
              <h3>Sex Distribution</h3>
              {Object.entries(probabilities.sex || {}).map(([sex, prob]) => (
                <div key={sex} className="stat-item">
                  <span>{sex}</span>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${prob}%` }}></div>
                  </div>
                  <span className="stat-value">{prob}%</span>
                </div>
              ))}
            </div>

            {probabilities.mutations && Object.keys(probabilities.mutations).length > 0 && (
              <div className="stat-card full-width">
                <h3>Mutation Probabilities</h3>
                <div className="mutations-grid">
                  {Object.entries(probabilities.mutations).map(([mutation, prob]) => (
                    <div key={mutation} className="stat-item">
                      <span>{mutation}</span>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${prob}%` }}></div>
                      </div>
                      <span className="stat-value">{prob}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chicks Results */}
        <div className="chicks-section">
          <h2>Predicted Offspring (6 Chicks)</h2>
          <div className="chicks-grid">
            {chicks.map((chick, index) => (
              <div key={index} className="chick-card">
                <div className="chick-header">
                  <h3>Chick #{chick.chick_number}</h3>
                  <span className={`chick-sex ${chick.sex.toLowerCase()}`}>{chick.sex}</span>
                </div>
                <div className="chick-details">
                  <div className="detail-item">
                    <strong>Base Color:</strong>
                    <span>{chick.base_color}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Visual Mutations:</strong>
                    <span>{chick.visual_mutations?.length > 0 ? chick.visual_mutations.join(', ') : 'None'}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Split Genes:</strong>
                    <span>{chick.split_genes?.length > 0 ? chick.split_genes.join(', ') : 'None'}</span>
                  </div>
                  <div className="detail-item full">
                    <strong>Genetic Makeup:</strong>
                    <span className="genetic-makeup">{chick.genetic_makeup}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="result-actions">
          <button onClick={() => navigate('/breeding-pairs')} className="btn-secondary">
            View All Pairs
          </button>
          <button onClick={() => navigate('/breeding-form')} className="btn-primary">
            New Prediction
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComputationResult;