import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import './BirdList.css';

const BirdList = () => {
  const [birds, setBirds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBirds();
  }, []);

  const fetchBirds = async () => {
    try {
      const response = await api.get('/birds');
      setBirds(response.data);
    } catch (error) {
      console.error('Error fetching birds:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="birdlist-loading">Loading birds...</div>;

  return (
    <div className="birdlist-container">
      <h1>My Birds</h1>
      <div className="birds-grid">
        {birds.length === 0 ? (
          <p className="no-birds">No birds added yet. Go to Breed page to add parents.</p>
        ) : (
          birds.map((bird) => (
            <div key={bird.id} className="bird-card">
              <div className="bird-card-header">
                <h3>{bird.bird_id}</h3>
                <span className={`sex-badge ${bird.sex.toLowerCase()}`}>{bird.sex}</span>
              </div>
              <div className="bird-card-details">
                <p><strong>Species:</strong> {bird.species}</p>
                <p><strong>Base Color:</strong> {bird.base_color}</p>
                <p><strong>Age (months):</strong> {bird.age_months || 'N/A'}</p>
                <p><strong>Visual Mutations:</strong> {bird.visual_mutations?.length ? bird.visual_mutations.join(', ') : 'None'}</p>
                <p><strong>Splits:</strong> {bird.splits?.length ? bird.splits.join(', ') : 'None'}</p>
                {bird.mother_data && (
                  <details>
                    <summary>Mother</summary>
                    <p>Species: {bird.mother_data.species}</p>
                    <p>Base: {bird.mother_data.base_color}</p>
                    <p>Mutations: {bird.mother_data.visual_mutations?.join(', ') || 'None'}</p>
                    <p>Splits: {bird.mother_data.splits?.join(', ') || 'None'}</p>
                  </details>
                )}
                {bird.father_data && (
                  <details>
                    <summary>Father</summary>
                    <p>Species: {bird.father_data.species}</p>
                    <p>Base: {bird.father_data.base_color}</p>
                    <p>Mutations: {bird.father_data.visual_mutations?.join(', ') || 'None'}</p>
                    <p>Splits: {bird.father_data.splits?.join(', ') || 'None'}</p>
                  </details>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BirdList;