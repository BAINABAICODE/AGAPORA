import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { BASE_COLORS, VISUAL_MUTATIONS, SPLIT_GENES, SPECIES_LIST } from '../data/geneticsData';
import './ParentForm.css';

const customSelectStyles = {
    control: (base) => ({
        ...base,
        background: 'rgba(255,255,255,0.1)',
        borderColor: 'rgba(255,255,255,0.2)',
        color: 'white',
    }),
    menu: (base) => ({
        ...base,
        background: '#1a1a2e',
    }),
    option: (base, { isFocused }) => ({
        ...base,
        background: isFocused ? '#667eea' : '#1a1a2e',
        color: 'white',
    }),
    multiValue: (base) => ({
        ...base,
        background: '#667eea',
        color: 'white',
    }),
    multiValueLabel: (base) => ({
        ...base,
        color: 'white',
    }),
    input: (base) => ({
        ...base,
        color: 'white',
    }),
    placeholder: (base) => ({
        ...base,
        color: '#a0a0a0',
    }),
};

const ParentForm = ({ parentNumber, onSubmit, isDisabled }) => {
    const [formData, setFormData] = useState({
        bird_id: '',
        species: 'Peach-faced',
        sex: 'Male',
        age_months: '',
        base_color: 'Green',
        dark_factor: 0,
        visual_mutations: [],
        splits: []
    });

    const [errors, setErrors] = useState({});
    const [availableBaseColors, setAvailableBaseColors] = useState([]);
    const [availableMutations, setAvailableMutations] = useState([]);
    const [availableSplits, setAvailableSplits] = useState([]);

    useEffect(() => {
        // Update available options based on species
        const colors = BASE_COLORS.filter(c =>
            c.available_in.includes(formData.species) || c.available_in.includes('All species')
        );
        setAvailableBaseColors(colors);

        const mutations = VISUAL_MUTATIONS.filter(m =>
            m.available_in.includes(formData.species)
        );
        setAvailableMutations(mutations);

        const splits = SPLIT_GENES.filter(s =>
            s.available_in.includes(formData.species)
        );
        setAvailableSplits(splits);
    }, [formData.species]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSexChange = (sex) => {
        setFormData(prev => ({ ...prev, sex }));
        if (errors.sex) setErrors(prev => ({ ...prev, sex: '' }));
    };

    // Validate female cannot carry sex-linked splits
    const handleSplitChange = (selectedOptions) => {
        const selectedSplits = selectedOptions.map(opt => opt.value);
        
        // Check if female with sex-linked split
        if (formData.sex === 'Female') {
            const hasSexLinked = selectedSplits.some(split => {
                const splitGene = SPLIT_GENES.find(s => s.name === split);
                return splitGene?.sex_restriction === 'Male only';
            });
            if (hasSexLinked) {
                setErrors(prev => ({ ...prev, splits: 'Females cannot carry sex-linked split genes' }));
                return;
            }
        }
        
        setFormData(prev => ({ ...prev, splits: selectedSplits }));
        if (errors.splits) {
            setErrors(prev => ({ ...prev, splits: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.bird_id) {
            newErrors.bird_id = 'Bird ID is required';
        } else if (!/^[A-Za-z0-9_-]+$/.test(formData.bird_id)) {
            newErrors.bird_id = 'Bird ID can only contain letters, numbers, hyphens, and underscores';
        }

        if (!formData.species) newErrors.species = 'Please select a valid species';
        if (!formData.sex) newErrors.sex = 'Please select sex (Male/Female)';
        if (!formData.base_color) newErrors.base_color = 'Base Color is required';

        // Check for incompatible mutations
        if (formData.visual_mutations.includes('Lutino') && formData.visual_mutations.includes('Albino')) {
            newErrors.visual_mutations = 'Lutino and Albino cannot be selected together';
        }
        if (formData.visual_mutations.includes('Violet') && formData.visual_mutations.includes('Double Violet')) {
            newErrors.visual_mutations = 'Violet and Double Violet cannot be selected together';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            onSubmit(formData);
        }
    };

    const mutationOptions = availableMutations.map(m => ({ value: m.name, label: `${m.name} (${m.inheritance})` }));
    const splitOptions = availableSplits.map(s => ({ 
        value: s.name, 
        label: `${s.name}${s.sex_restriction === 'Male only' ? ' (♂ only)' : ''}` 
    }));

    return (
        <div className="parent-form">
            <div className="form-header">
                <h2>Parent {parentNumber}</h2>
                <span className={`sex-badge ${formData.sex.toLowerCase()}`}>{formData.sex}</span>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Bird ID / Ring Number</label>
                    <input
                        type="text"
                        name="bird_id"
                        value={formData.bird_id}
                        onChange={handleChange}
                        placeholder="e.g., LOVE-101"
                        disabled={isDisabled}
                    />
                    {errors.bird_id && <span className="error">{errors.bird_id}</span>}
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Species</label>
                        <select name="species" value={formData.species} onChange={handleChange} disabled={isDisabled}>
                            {SPECIES_LIST.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                        {errors.species && <span className="error">{errors.species}</span>}
                    </div>

                    <div className="form-group">
                        <label>Sex</label>
                        <div className="sex-buttons">
                            <button
                                type="button"
                                className={`sex-btn ${formData.sex === 'Male' ? 'active' : ''}`}
                                onClick={() => handleSexChange('Male')}
                                disabled={isDisabled}
                            >
                                ♂ Male
                            </button>
                            <button
                                type="button"
                                className={`sex-btn ${formData.sex === 'Female' ? 'active' : ''}`}
                                onClick={() => handleSexChange('Female')}
                                disabled={isDisabled}
                            >
                                ♀ Female
                            </button>
                        </div>
                        {errors.sex && <span className="error">{errors.sex}</span>}
                    </div>
                </div>

                <div className="form-group">
                    <label>Age (months)</label>
                    <input
                        type="number"
                        name="age_months"
                        value={formData.age_months}
                        onChange={handleChange}
                        placeholder="e.g., 18"
                        min="0"
                        max="360"
                        disabled={isDisabled}
                    />
                </div>

                <div className="form-group">
                    <label>Base Color</label>
                    <select name="base_color" value={formData.base_color} onChange={handleChange} disabled={isDisabled}>
                        {availableBaseColors.map(c => (
                            <option key={c.name} value={c.name}>{c.name}</option>
                        ))}
                    </select>
                    {errors.base_color && <span className="error">{errors.base_color}</span>}
                </div>

                <div className="form-group">
                    <label>Visual Mutations</label>
                    <Select
                        isMulti
                        options={mutationOptions}
                        value={mutationOptions.filter(opt => formData.visual_mutations.includes(opt.value))}
                        onChange={(selected) => setFormData(prev => ({ 
                            ...prev, 
                            visual_mutations: selected.map(s => s.value) 
                        }))}
                        placeholder="Search mutations..."
                        isDisabled={isDisabled}
                        styles={customSelectStyles}
                    />
                    {errors.visual_mutations && <span className="error">{errors.visual_mutations}</span>}
                </div>

                <div className="form-group">
                    <label>Split / Hidden Genes</label>
                    <Select
                        isMulti
                        options={splitOptions}
                        value={splitOptions.filter(opt => formData.splits.includes(opt.value))}
                        onChange={handleSplitChange}
                        placeholder="Search splits..."
                        isDisabled={isDisabled}
                        styles={customSelectStyles}
                    />
                    {errors.splits && <span className="error">{errors.splits}</span>}
                </div>

                {!isDisabled && (
                    <button type="submit" className="submit-btn">Save Parent {parentNumber}</button>
                )}

                {isDisabled && (
                    <div className="saved-indicator">
                        ✓ Parent {parentNumber} saved
                    </div>
                )}
            </form>
        </div>
    );
};

export default ParentForm;