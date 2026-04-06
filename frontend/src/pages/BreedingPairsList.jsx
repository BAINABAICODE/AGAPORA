// frontend/src/pages/BreedingPairsList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/axios';
import './BreedingPairsList.css';

const BreedingPairsList = () => {
  const [pairs, setPairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
                    <Link 
                      to={`/computation-result/${pair.id}`} 
                      className="btn-view-result"
                    >
                      View Result
                    </Link>
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
    </div>
  );
};

export default BreedingPairsList;