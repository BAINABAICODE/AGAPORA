// frontend/src/pages/BreedingForm.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import ParentForm from '../components/ParentForm';
import { computeGenetics } from '../utils/GeneticComputationEngine';
import './BreedingForm.css';

// Helper to set a nested property in an object
const setNestedValue = (obj, path, value) => {
  const keys = path.split('.');
  const lastKey = keys.pop();
  const target = keys.reduce((acc, key) => {
    if (!acc[key]) acc[key] = {};
    return acc[key];
  }, obj);
  target[lastKey] = value;
  return obj;
};

const getParentCompletion = (parent) => {
  const required = ['species', 'sex', 'base_color'];
  const filled = required.filter((field) => Boolean(parent[field])).length;
  return {
    filled,
    total: required.length,
    percent: Math.round((filled / required.length) * 100),
    isComplete: filled === required.length,
  };
};

const BreedingForm = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [computing, setComputing] = useState(false);

  const [references, setReferences] = useState({
    species: [],
    base_colors: [],
    visual_mutations: [],
    split_genes: [],
  });

  const emptyParent = () => ({
    bird_id: '',
    name: '',
    species: '',
    sex: '',
    age: '',
    base_color: '',
    visual_mutations: [],
    split_genes: [],
    genetic_data: {},
    grandparent_data: {},
  });

  const [parent1, setParent1] = useState(emptyParent());
  const [parent2, setParent2] = useState(emptyParent());
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [computeLog, setComputeLog] = useState([]);
  const [activeParent, setActiveParent] = useState(1);

  const parent1Ref = useRef(null);
  const parent2Ref = useRef(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/references/all');
        if (res.data.success) setReferences(res.data.data);
      } catch (err) {
        console.error('Error fetching references:', err);
        setErrorMessage('Failed to load form options. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // Improved nested field handler
  const handleParentChange = (parentNumber, field, value) => {
    const setter = parentNumber === 1 ? setParent1 : setParent2;
    setter(prev => {
      const newState = JSON.parse(JSON.stringify(prev));
      setNestedValue(newState, field, value);
      return newState;
    });
  };

  const logStep = (msg) => setComputeLog(prev => [...prev, msg]);

  const handleSubmitAndCompute = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setComputeLog([]);

    if (!parent1.species || !parent1.sex || !parent1.base_color) {
      setErrorMessage('Parent 1: Species, Sex, and Base Color are required.');
      return;
    }
    if (!parent2.species || !parent2.sex || !parent2.base_color) {
      setErrorMessage('Parent 2: Species, Sex, and Base Color are required.');
      return;
    }
    if (parent1.sex === parent2.sex) {
      setErrorMessage('One parent must be Male and the other Female for breeding.');
      return;
    }

    setSubmitting(true);
    setSuccessMessage('Saving breeding pair data to server...');

    // Updated formData with the merge requirements
    const formData = {
      parent1_bird_id: parent1.bird_id || null,
      parent1_name: parent1.name || null,
      parent1_species: parent1.species,
      parent1_sex: parent1.sex,
      parent1_age: parent1.age || null,
      parent1_base_color: parent1.base_color,
      parent1_visual_mutations: parent1.visual_mutations || [],
      parent1_split_genes: parent1.split_genes || [],
      parent1_genetic_data: parent1.genetic_data || {},
      parent2_bird_id: parent2.bird_id || null,
      parent2_name: parent2.name || null,
      parent2_species: parent2.species,
      parent2_sex: parent2.sex,
      parent2_age: parent2.age || null,
      parent2_base_color: parent2.base_color,
      parent2_visual_mutations: parent2.visual_mutations || [],
      parent2_split_genes: parent2.split_genes || [],
      parent2_genetic_data: parent2.genetic_data || {},
      grandparent_data: {
        parent1: parent1.grandparent_data || {},
        parent2: parent2.grandparent_data || {},
      },
    };

    let breedingPairId;
    try {
      const saveRes = await axios.post('/breeding-pairs', formData);
      if (!saveRes.data.success) throw new Error(saveRes.data.message || 'Save failed');
      breedingPairId = saveRes.data.data.id;
    } catch (err) {
      setErrorMessage('Failed to save data: ' + (err.response?.data?.message || err.message));
      setSubmitting(false);
      return;
    }

    setComputing(true);
    setSuccessMessage('Data saved! Starting genetic computation...');

    try {
      await new Promise(r => setTimeout(r, 50));
      logStep('🔬 Step 1: Encoding genetic data into Mendelian allele pairs...');
      logStep('   ↳ Blue-series locus encoding (B=Green dominant, b=Blue recessive)');
      logStep('   ↳ Dark-factor locus encoding (co-dominant: 0/1/2 copies)');
      logStep('   ↳ Autosomal recessive mutation loci (visual=mm, split=Nm)');
      logStep('   ↳ Sex-linked recessive loci (ZZ male / ZW female bird system)');
      await new Promise(r => setTimeout(r, 100));

      logStep('🔬 Step 2: Building Punnett Square crossing matrices...');
      logStep('   ↳ Blue-series: 4 allele combinations generated');
      logStep('   ↳ Dark-factor: 4 allele combinations generated');
      logStep('   ↳ Per-mutation locus crossings computed');
      await new Promise(r => setTimeout(r, 100));

      logStep('🔬 Step 3: Running Genetic Algorithm (60 individuals, 30 generations)...');
      logStep('   ↳ 3a. Species compatibility check');
      logStep('   ↳ 3b. Genetic diversity score calculated');
      logStep('   ↳ 3c. Initial population seeded via Punnett sampling');
      await new Promise(r => setTimeout(r, 80));

      logStep('   ↳ 3d. Linear Rank Selection (assigning rank probabilities)');
      logStep('   ↳ 3e. Parameterized Uniform Crossover (per-gene, diversity-adjusted)');
      logStep('   ↳ 3f. Random Resetting Mutation (annealed rate)');
      logStep('   ↳ 3g. Inversion Mutation (chromosomal inversion model)');
      await new Promise(r => setTimeout(r, 80));

      const results = computeGenetics(
        { ...formData, parent1_name: parent1.name, parent2_name: parent2.name },
        references.visual_mutations
      );

      logStep('🔬 Verification: Running Traditional Punnett + Fuzzy Logic (independent)...');
      await new Promise(r => setTimeout(r, 80));
      logStep('   ↳ Exact Punnett Square for base color probabilities');
      logStep('   ↳ Fuzzy Logic membership functions for mutation probabilities');
      logStep('   ↳ Confidence score calculated');
      await new Promise(r => setTimeout(r, 60));
      logStep('🐣 Selecting 6 offspring from evolved population (balanced sex)...');
      await new Promise(r => setTimeout(r, 60));

      logStep('💾 Storing results on server...');
      const storeRes = await axios.post(`/compute/${breedingPairId}`, {
        chicks_data: results.chicks,
        genetic_analysis: results.genetic_analysis,
        probabilities: results.probabilities,
        verification: results.verification,
      });

      if (!storeRes.data.success) throw new Error('Failed to store results');
      logStep('✅ Computation complete! Redirecting to results...');
      setSuccessMessage('✅ All done! Redirecting to your results...');
      setTimeout(() => navigate(`/computation-result/${breedingPairId}`), 1500);
    } catch (err) {
      console.error('Computation error:', err);
      setErrorMessage('Computation error: ' + (err.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
      setComputing(false);
    }
  };

  const parent1Progress = getParentCompletion(parent1);
  const parent2Progress = getParentCompletion(parent2);
  const bothParentsComplete = parent1Progress.isComplete && parent2Progress.isComplete;

  const getStepStatus = (progress, isActive) => {
    if (progress.isComplete) return 'Complete';
    if (isActive) return 'Data Entry Active';
    if (progress.filled > 0) return 'In Progress';
    return 'Not Started';
  };

  const handleStepClick = (parentNumber) => {
    setActiveParent(parentNumber);
    const targetRef = parentNumber === 1 ? parent1Ref : parent2Ref;
    targetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
        <div className="form-progress-bar" role="navigation" aria-label="Form progress">
          <div className="progress-bar-header">
            <span className="progress-pulse-dot" aria-hidden="true" />
            <span className="progress-current-label">
              Currently answering: <strong>Parent {activeParent}</strong>
            </span>
          </div>

          <div className="progress-steps">
            <button
              type="button"
              className={`progress-step ${activeParent === 1 ? 'active' : ''} ${parent1Progress.isComplete ? 'complete' : ''}`}
              onClick={() => handleStepClick(1)}
              aria-current={activeParent === 1 ? 'step' : undefined}
            >
              <span className="step-indicator">
                {parent1Progress.isComplete ? '✓' : '1'}
              </span>
              <span className="step-content">
                <span className="step-title">Parent 1</span>
                <span className="step-status">{getStepStatus(parent1Progress, activeParent === 1)}</span>
                <span className="step-progress-track" aria-hidden="true">
                  <span className="step-progress-fill" style={{ width: `${parent1Progress.percent}%` }} />
                </span>
              </span>
            </button>

            <div className={`progress-connector ${parent1Progress.isComplete ? 'complete' : ''}`} aria-hidden="true" />

            <button
              type="button"
              className={`progress-step ${activeParent === 2 ? 'active' : ''} ${parent2Progress.isComplete ? 'complete' : ''}`}
              onClick={() => handleStepClick(2)}
              aria-current={activeParent === 2 ? 'step' : undefined}
            >
              <span className="step-indicator">
                {parent2Progress.isComplete ? '✓' : '2'}
              </span>
              <span className="step-content">
                <span className="step-title">Parent 2</span>
                <span className="step-status">{getStepStatus(parent2Progress, activeParent === 2)}</span>
                <span className="step-progress-track" aria-hidden="true">
                  <span className="step-progress-fill" style={{ width: `${parent2Progress.percent}%` }} />
                </span>
              </span>
            </button>

            <div className={`progress-connector ${bothParentsComplete ? 'complete' : ''}`} aria-hidden="true" />

            <div className={`progress-step review-step ${bothParentsComplete ? 'ready' : ''}`}>
              <span className="step-indicator">3</span>
              <span className="step-content">
                <span className="step-title">Review &amp; Compute</span>
                <span className="step-status">
                  {bothParentsComplete ? 'Ready' : 'Awaiting parent data'}
                </span>
              </span>
            </div>
          </div>
        </div>

        <h1 className="form-main-title">Genetic Data Collection for Prediction</h1>
        <p className="form-description">
          Enter genetic information for both parent birds to predict offspring traits.
          Computation runs in your browser using a Rule-Based Genetic Algorithm.
        </p>

        {successMessage && (
          <div className="success-message">
            <span>{successMessage}</span>
            {computing && <div className="computing-spinner"></div>}
          </div>
        )}
        {errorMessage && <div className="error-message">{errorMessage}</div>}

        {computeLog.length > 0 && (
          <div className="computation-log">
            <h4>🧬 Computation Log</h4>
            <div className="log-scroll">
              {computeLog.map((step, i) => (
                <div key={i} className="log-line">{step}</div>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmitAndCompute}>
          <div className="parent-forms-row">
            <div
              ref={parent1Ref}
              className={`parent-form-wrapper ${activeParent === 1 ? 'parent-form-wrapper--active' : ''}`}
              onFocusCapture={() => setActiveParent(1)}
            >
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
            </div>
            <div
              ref={parent2Ref}
              className={`parent-form-wrapper ${activeParent === 2 ? 'parent-form-wrapper--active' : ''}`}
              onFocusCapture={() => setActiveParent(2)}
            >
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
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={() => navigate('/')} disabled={submitting || computing}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={submitting || computing}>
              {computing ? '🧬 Computing...' : submitting ? '💾 Saving...' : '🧬 Compute & Predict'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BreedingForm;