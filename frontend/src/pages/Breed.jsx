import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ParentForm from '../components/ParentForm';
import GeneticComputation from '../components/GeneticComputation';
import api from '../api/axios';
import './Breed.css';

const Breed = () => {
    const { user } = useAuth();
    const [parent1, setParent1] = useState(null);
    const [parent2, setParent2] = useState(null);
    const [showComputation, setShowComputation] = useState(false);
    const [computationResult, setComputationResult] = useState(null);
    const [saving, setSaving] = useState(false);

    const saveBirdToDatabase = async (birdData) => {
        try {
            const response = await api.post('/birds', birdData);
            return response.data;
        } catch (error) {
            console.error('Error saving bird:', error);
            alert(error.response?.data?.errors?.bird_id?.[0] || 'Failed to save bird. Bird ID may already exist.');
            return null;
        }
    };

    const handleParentSubmit = async (data, parentNumber) => {
        setSaving(true);
        const savedBird = await saveBirdToDatabase(data);
        setSaving(false);
        if (savedBird) {
            if (parentNumber === 1) {
                setParent1(savedBird);
            } else {
                setParent2(savedBird);
            }
        }
    };

    const handleBreed = () => {
        if (parent1 && parent2) {
            setShowComputation(true);
        }
    };

    const handleComputationComplete = (result) => {
        setComputationResult(result);
    };

    return (
        <div className="breed-container">
            <div className="breed-header">
                <h1>Lovebird Genetic Breeding System</h1>
                <p>Enter parent genetics to predict offspring outcomes</p>
            </div>

            <div className="breed-content">
                {/* Left Form - Parent 1 */}
                <div className="form-panel">
                    <ParentForm 
                        parentNumber={1} 
                        onSubmit={(data) => handleParentSubmit(data, 1)}
                        isDisabled={showComputation || saving}
                    />
                </div>

                {/* Center Breed Button */}
                <div className="breed-button-panel">
                    <button 
                        className={`breed-btn ${parent1 && parent2 && !showComputation ? 'active' : ''}`}
                        onClick={handleBreed}
                        disabled={!parent1 || !parent2 || showComputation || saving}
                    >
                        BREED
                    </button>
                    {parent1 && parent2 && !showComputation && (
                        <p className="ready-text">Ready to breed!</p>
                    )}
                </div>

                {/* Right Form - Parent 2 */}
                <div className="form-panel">
                    <ParentForm 
                        parentNumber={2} 
                        onSubmit={(data) => handleParentSubmit(data, 2)}
                        isDisabled={showComputation || saving}
                    />
                </div>
            </div>

            {/* Genetic Computation Section */}
            {showComputation && parent1 && parent2 && (
                <GeneticComputation 
                    parent1={parent1}
                    parent2={parent2}
                    onComplete={handleComputationComplete}
                />
            )}
        </div>
    );
};

export default Breed;