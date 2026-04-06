// frontend/src/pages/BreedingForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import ParentForm from '../components/ParentForm';
import './BreedingForm.css';

const BreedingForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [computing, setComputing] = useState(false);
  const [references, setReferences] = useState({
    species: [],
    base_colors: [],
    visual_mutations: [],
    split_genes: []
  });
  
  const [parent1, setParent1] = useState({
    bird_id: '',
    name: '',
    species: '',
    sex: '',
    age: '',
    base_color: '',
    visual_mutations: [],
    split_genes: [],
    genetic_data: {},
    grandparent_data: {}
  });
  
  const [parent2, setParent2] = useState({
    bird_id: '',
    name: '',
    species: '',
    sex: '',
    age: '',
    base_color: '',
    visual_mutations: [],
    split_genes: [],
    genetic_data: {},
    grandparent_data: {}
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch reference data
  useEffect(() => {
    const fetchReferences = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/references/all');
        if (response.data.success) {
          setReferences(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching references:', error);
        setErrorMessage('Failed to load form data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchReferences();
  }, []);

  const handleParentChange = (parentNumber, field, value) => {
    if (parentNumber === 1) {
      setParent1(prev => {
        if (field.includes('.')) {
          const keys = field.split('.');
          return {
            ...prev,
            [keys[0]]: {
              ...prev[keys[0]],
              [keys[1]]: value
            }
          };
        }
        return { ...prev, [field]: value };
      });
    } else {
      setParent2(prev => {
        if (field.includes('.')) {
          const keys = field.split('.');
          return {
            ...prev,
            [keys[0]]: {
              ...prev[keys[0]],
              [keys[1]]: value
            }
          };
        }
        return { ...prev, [field]: value };
      });
    }
  };

  const handleSubmitAndCompute = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');
    setComputing(true);
    
    // Validate required fields
    if (!parent1.species || !parent1.sex || !parent1.base_color) {
      setErrorMessage('Please fill all required fields for Parent 1');
      setSubmitting(false);
      setComputing(false);
      return;
    }
    
    if (!parent2.species || !parent2.sex || !parent2.base_color) {
      setErrorMessage('Please fill all required fields for Parent 2');
      setSubmitting(false);
      setComputing(false);
      return;
    }
    
    const formData = {
      parent1_bird_id: parent1.bird_id,
      parent1_name: parent1.name,
      parent1_species: parent1.species,
      parent1_sex: parent1.sex,
      parent1_age: parent1.age,
      parent1_base_color: parent1.base_color,
      parent1_visual_mutations: parent1.visual_mutations,
      parent1_split_genes: parent1.split_genes,
      parent1_genetic_data: parent1.genetic_data,
      
      parent2_bird_id: parent2.bird_id,
      parent2_name: parent2.name,
      parent2_species: parent2.species,
      parent2_sex: parent2.sex,
      parent2_age: parent2.age,
      parent2_base_color: parent2.base_color,
      parent2_visual_mutations: parent2.visual_mutations,
      parent2_split_genes: parent2.split_genes,
      parent2_genetic_data: parent2.genetic_data,
      
      grandparent_data: {
        parent1: parent1.grandparent_data,
        parent2: parent2.grandparent_data
      }
    };
    
    try {
      // Step 1: Save the breeding pair
      const saveResponse = await axios.post('/breeding-pairs', formData);
      
      if (saveResponse.data.success) {
        const breedingPairId = saveResponse.data.data.id;
        
        // Step 2: Run computation and prediction
        setSuccessMessage('Data collected. Running genetic computation...');
        
        const computeResponse = await axios.post(`/compute/${breedingPairId}`);
        
        if (computeResponse.data.success) {
          setSuccessMessage('Computation complete! Redirecting to results...');
          
          // Redirect to results page
          setTimeout(() => {
            navigate(`/computation-result/${breedingPairId}`);
          }, 1500);
        } else {
          setErrorMessage('Computation failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to process breeding pair');
    } finally {
      setSubmitting(false);
      setComputing(false);
    }
  };

  if (loading) {
    return (
      <div className="breeding-form loading-container">
        <div className="loading-spinner"></div>
        <p>Loading form data...</p>
      </div>
    );
  }

  return (
    <div className="breeding-form">
      <div className="breeding-form-container">
        <h1 className="form-main-title">Genetic Data Collection for Prediction</h1>
        <p className="form-description">Enter genetic information for both parent birds to predict offspring traits</p>
        
        {successMessage && (
          <div className="success-message">
            {successMessage}
            {computing && <div className="computing-spinner"></div>}
          </div>
        )}
        
        {errorMessage && (
          <div className="error-message">
            {errorMessage}
          </div>
        )}
        
        <form onSubmit={handleSubmitAndCompute}>
          <ParentForm
            title="Parent 1"
            parentNumber={1}
            formData={parent1}
            onChange={handleParentChange}
            speciesList={references.species}
            baseColors={references.base_colors}
            visualMutations={references.visual_mutations}
            splitGenes={references.split_genes}
          />
          
          <ParentForm
            title="Parent 2"
            parentNumber={2}
            formData={parent2}
            onChange={handleParentChange}
            speciesList={references.species}
            baseColors={references.base_colors}
            visualMutations={references.visual_mutations}
            splitGenes={references.split_genes}
          />
          
          <div className="form-actions">
            <button 
              type="button" 
              className="btn-cancel"
              onClick={() => navigate('/')}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-submit"
              disabled={submitting || computing}
            >
              {computing ? 'Computing...' : submitting ? 'Saving...' : 'Compute & Predict'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BreedingForm;