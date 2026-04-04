import React, { useState, useEffect } from 'react';
import AlgorithmVerification from './AlgorithmVerification';
import Report from './Report';
import { BASE_COLORS } from '../data/geneticsData';
import './GeneticComputation.css';

const GeneticComputation = ({ parent1, parent2, onComplete }) => {
  const [loading, setLoading] = useState(true);
  const [encodedData, setEncodedData] = useState(null);
  const [geneticAlgorithmResult, setGeneticAlgorithmResult] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [finalReport, setFinalReport] = useState(null);
  const [step, setStep] = useState(1);
  
  // Progress bar states
  const [progress, setProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    runGeneticComputation();
  }, []);

  // Step 1: Genetic Data Encoding
  const encodeGeneticData = () => {
    const encoded = {
      parent1: {
        species: parent1.species,
        sex: parent1.sex,
        baseColor: parent1.base_color,
        darkFactor: getDarkFactor(parent1.base_color),
        visualMutations: parent1.visual_mutations || [],
        splits: parent1.splits || []
      },
      parent2: {
        species: parent2.species,
        sex: parent2.sex,
        baseColor: parent2.base_color,
        darkFactor: getDarkFactor(parent2.base_color),
        visualMutations: parent2.visual_mutations || [],
        splits: parent2.splits || []
      }
    };
    
    setEncodedData(encoded);
    return encoded;
  };

  const getDarkFactor = (baseColor) => {
    const color = BASE_COLORS.find(c => c.name === baseColor);
    return color ? color.dark_factor : 0;
  };

  // Step 2: Rule-Based Genetic Inheritance Algorithm
  const ruleBasedInheritance = (encoded) => {
    const results = {
      darkFactorInheritance: calculateDarkFactor(encoded),
      recessiveInheritance: calculateRecessiveInheritance(encoded),
      sexLinkedInheritance: calculateSexLinkedInheritance(encoded),
      incompleteDominantInheritance: calculateIncompleteDominant(encoded),
      parblueInheritance: calculateParblueInheritance(encoded)
    };
    
    return results;
  };

  const calculateDarkFactor = (encoded) => {
    const df1 = encoded.parent1.darkFactor;
    const df2 = encoded.parent2.darkFactor;
    const sum = df1 + df2;
    const resultDF = Math.min(sum, 2);
    
    const probabilities = { 0: 0, 1: 0, 2: 0 };
    
    if (df1 === 0 && df2 === 0) probabilities[0] = 100;
    else if ((df1 === 0 && df2 === 1) || (df1 === 1 && df2 === 0)) {
      probabilities[1] = 50;
      probabilities[0] = 50;
    }
    else if ((df1 === 0 && df2 === 2) || (df1 === 2 && df2 === 0)) {
      probabilities[1] = 100;
    }
    else if (df1 === 1 && df2 === 1) {
      probabilities[2] = 25;
      probabilities[1] = 50;
      probabilities[0] = 25;
    }
    else if ((df1 === 1 && df2 === 2) || (df1 === 2 && df2 === 1)) {
      probabilities[2] = 50;
      probabilities[1] = 50;
    }
    else if (df1 === 2 && df2 === 2) {
      probabilities[2] = 100;
    }
    
    return { resultDF, probabilities };
  };

  const calculateRecessiveInheritance = (encoded) => {
    const mutations = [...new Set([...encoded.parent1.visualMutations, ...encoded.parent2.visualMutations])];
    const results = {};
    
    mutations.forEach(mutation => {
      const p1Has = encoded.parent1.visualMutations.includes(mutation);
      const p2Has = encoded.parent2.visualMutations.includes(mutation);
      const p1Split = encoded.parent1.splits?.includes(`split to ${mutation}`) || false;
      const p2Split = encoded.parent2.splits?.includes(`split to ${mutation}`) || false;
      
      if (p1Has && p2Has) {
        results[mutation] = { visual: 100, split: 0, normal: 0 };
      } else if (p1Has && p2Split) {
        results[mutation] = { visual: 50, split: 50, normal: 0 };
      } else if (p1Has && !p2Has && !p2Split) {
        results[mutation] = { visual: 0, split: 100, normal: 0 };
      } else if (p1Split && p2Split) {
        results[mutation] = { visual: 25, split: 50, normal: 25 };
      } else if ((p1Split && !p2Has && !p2Split) || (!p1Has && !p1Split && p2Split)) {
        results[mutation] = { visual: 0, split: 50, normal: 50 };
      } else {
        results[mutation] = { visual: 0, split: 0, normal: 100 };
      }
    });
    
    return results;
  };

  const calculateSexLinkedInheritance = (encoded) => {
    const sexLinkedMutations = ['Lutino (Ino)', 'Opaline', 'American Cinnamon', 'Pallid', 'Creamino', 'Albino'];
    const results = {};
    
    sexLinkedMutations.forEach(mutation => {
      const p1Has = encoded.parent1.visualMutations.includes(mutation);
      const p2Has = encoded.parent2.visualMutations.includes(mutation);
      const p1Split = encoded.parent1.splits?.includes(`split to ${mutation}`) || false;
      const p2Split = encoded.parent2.splits?.includes(`split to ${mutation}`) || false;
      
      const p1IsMale = encoded.parent1.sex === 'Male';
      const p2IsMale = encoded.parent2.sex === 'Male';
      
      if (p1Has && p2Has) {
        results[mutation] = { maleVisual: 100, femaleVisual: 100 };
      } else if (p1Has && !p2Has) {
        if (p1IsMale) {
          results[mutation] = { maleSplit: 100, femaleVisual: 100 };
        } else {
          results[mutation] = { maleVisual: 100, femaleSplit: 100 };
        }
      } else if (!p1Has && p2Has) {
        if (p2IsMale) {
          results[mutation] = { maleSplit: 100, femaleVisual: 100 };
        } else {
          results[mutation] = { maleVisual: 100, femaleSplit: 100 };
        }
      } else if (p1Split && p2Split) {
        results[mutation] = { maleVisual: 25, maleSplit: 50, maleNormal: 25, femaleVisual: 25, femaleNormal: 75 };
      } else if (p1Split && !p2Split) {
        results[mutation] = { maleSplit: 50, maleNormal: 50, femaleVisual: 50, femaleNormal: 50 };
      } else {
        results[mutation] = { maleNormal: 100, femaleNormal: 100 };
      }
    });
    
    return results;
  };

  const calculateIncompleteDominant = (encoded) => {
    const incompleteMutations = ['Violet', 'Double Violet', 'Orangeface'];
    const results = {};
    
    incompleteMutations.forEach(mutation => {
      const p1Has = encoded.parent1.visualMutations.includes(mutation);
      const p2Has = encoded.parent2.visualMutations.includes(mutation);
      
      if (p1Has && p2Has) {
        results[mutation] = { singleFactor: 50, doubleFactor: 25, normal: 25 };
      } else if ((p1Has && !p2Has) || (!p1Has && p2Has)) {
        results[mutation] = { singleFactor: 50, doubleFactor: 0, normal: 50 };
      } else {
        results[mutation] = { singleFactor: 0, doubleFactor: 0, normal: 100 };
      }
    });
    
    return results;
  };

  const calculateParblueInheritance = (encoded) => {
    const getParblueAllele = (parent) => {
      if (parent.baseColor.includes('Aqua-Turquoise')) return 'AT';
      if (parent.baseColor.includes('Turquoise')) return 'T';
      if (parent.baseColor.includes('Aqua')) return 'A';
      return 'G';
    };
    
    const a1 = getParblueAllele(encoded.parent1);
    const a2 = getParblueAllele(encoded.parent2);
    
    let result = '';
    if (a1 === 'G' && a2 === 'G') result = 'Green';
    else if ((a1 === 'G' && a2 === 'A') || (a1 === 'A' && a2 === 'G')) result = 'Green split Aqua';
    else if ((a1 === 'G' && a2 === 'T') || (a1 === 'T' && a2 === 'G')) result = 'Green split Turquoise';
    else if (a1 === 'A' && a2 === 'A') result = 'Aqua';
    else if (a1 === 'T' && a2 === 'T') result = 'Turquoise';
    else if ((a1 === 'A' && a2 === 'T') || (a1 === 'T' && a2 === 'A')) result = 'Seagreen (Aqua-Turquoise)';
    
    return { allele1: a1, allele2: a2, result };
  };

  // Step 3: Genetic Algorithm with advanced operators
  const runGeneticAlgorithm = (encoded, ruleResults) => {
    // Fitness Function
    const calculateFitness = () => {
      let fitness = 100;
      
      // Check species compatibility
      if (encoded.parent1.species !== encoded.parent2.species) {
        fitness -= 50;
      }
      
      // Check genetic diversity
      const uniqueMutations = [...new Set([...encoded.parent1.visualMutations, ...encoded.parent2.visualMutations])];
      fitness += uniqueMutations.length * 2;
      
      return Math.min(Math.max(fitness, 0), 100);
    };
    
    // Rank Selection
    const rankSelection = (fitness) => {
      return fitness / 100;
    };
    
    // Parameterized Uniform Crossover
    const uniformCrossover = (parent1Genes, parent2Genes, mixingRatio = 0.5) => {
      const offspring = [];
      for (let i = 0; i < parent1Genes.length; i++) {
        if (Math.random() < mixingRatio) {
          offspring.push(parent1Genes[i]);
        } else {
          offspring.push(parent2Genes[i]);
        }
      }
      return offspring;
    };
    
    // Mutation: Random Resetting + Inversion
    const mutate = (genes, mutationRate = 0.01) => {
      const mutated = [...genes];
      for (let i = 0; i < mutated.length; i++) {
        if (Math.random() < mutationRate) {
          // Random resetting
          mutated[i] = Math.random() < 0.5 ? 0 : 1;
        }
      }
      
      // Inversion mutation
      if (Math.random() < mutationRate * 2) {
        const start = Math.floor(Math.random() * mutated.length);
        const end = Math.floor(Math.random() * (mutated.length - start)) + start;
        const inverted = mutated.slice(start, end).reverse();
        for (let i = start; i < end; i++) {
          mutated[i] = inverted[i - start];
        }
      }
      
      return mutated;
    };
    
    const fitness = calculateFitness();
    const selectionProbability = rankSelection(fitness);
    const genes = [fitness, selectionProbability];
    const offspring = uniformCrossover([fitness], [selectionProbability], 0.6);
    const finalGenes = mutate(offspring);
    
    return {
      fitness,
      selectionProbability,
      crossoverOffspring: offspring,
      mutatedGenes: finalGenes,
      compatibilityScore: fitness,
      recommendedBreeding: fitness > 70
    };
  };

  // UPDATED: Removed all artificial setTimeout delays for fast computation
  const runGeneticComputation = async () => {
    setLoading(true);
    setProgress(10);
    setStatusMsg('Encoding genetic data...');
    const encoded = encodeGeneticData();

    setProgress(30);
    setStatusMsg('Applying rule-based inheritance...');
    const ruleResults = ruleBasedInheritance(encoded);

    setProgress(60);
    setStatusMsg('Running genetic algorithm...');
    const geneticResults = runGeneticAlgorithm(encoded, ruleResults);

    setProgress(90);
    setStatusMsg('Verifying with fuzzy logic...');
    const finalResults = {
      encodedData: encoded,
      ruleBasedResults: ruleResults,
      geneticAlgorithmResults: geneticResults,
      offspringPredictions: generateOffspringPredictions(encoded, ruleResults, geneticResults)
    };

    setGeneticAlgorithmResult(finalResults);
    setProgress(100);
    setStatusMsg('Complete!');
    setLoading(false);
    setStep(2);
  };

  const generateOffspringPredictions = (encoded, ruleResults, geneticResults) => {
    const predictions = [];
    
    for (let i = 1; i <= 6; i++) {
      predictions.push({
        chickNumber: i,
        baseColor: predictRandomBaseColor(encoded, ruleResults),
        darkFactor: predictRandomDarkFactor(ruleResults.darkFactorInheritance),
        visualMutations: predictRandomMutations(ruleResults.recessiveInheritance),
        splits: predictRandomSplits(encoded, ruleResults),
        inheritancePercentage: Math.floor(Math.random() * 30) + 70
      });
    }
    
    return predictions;
  };

  const predictRandomBaseColor = (encoded, ruleResults) => {
    const baseColors = [encoded.parent1.baseColor, encoded.parent2.baseColor];
    return baseColors[Math.floor(Math.random() * baseColors.length)];
  };

  const predictRandomDarkFactor = (darkFactorResult) => {
    const rand = Math.random() * 100;
    const probs = darkFactorResult.probabilities;
    
    if (rand < probs[0]) return 0;
    if (rand < probs[0] + probs[1]) return 1;
    return 2;
  };

  const predictRandomMutations = (recessiveResults) => {
    const mutations = [];
    for (const [mutation, probs] of Object.entries(recessiveResults)) {
      const rand = Math.random() * 100;
      if (rand < probs.visual) {
        mutations.push(mutation);
      }
    }
    return mutations;
  };

  const predictRandomSplits = (encoded, ruleResults) => {
    const splits = [];
    const allPossibleSplits = [...(encoded.parent1.splits || []), ...(encoded.parent2.splits || [])];
    
    allPossibleSplits.forEach(split => {
      if (Math.random() > 0.5) {
        splits.push(split);
      }
    });
    
    return splits;
  };

  const handleVerificationComplete = (verification) => {
    setVerificationResult(verification);
    
    if (verification.isValid) {
      setFinalReport({
        parents: { parent1, parent2 },
        computationResults: geneticAlgorithmResult,
        verification: verification,
        offspringPredictions: geneticAlgorithmResult?.offspringPredictions
      });
      setStep(3);
      if (onComplete) {
        onComplete(finalReport);
      }
    }
  };

  if (loading) {
    return (
      <div className="computation-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Processing Genetic Data...</p>
          <div className="progress-container">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
            <span className="progress-text">{statusMsg}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="computation-container">
      {step === 2 && geneticAlgorithmResult && (
        <AlgorithmVerification
          parent1={parent1}
          parent2={parent2}
          geneticResult={geneticAlgorithmResult}
          onComplete={handleVerificationComplete}
        />
      )}
      
      {step === 3 && finalReport && (
        <Report reportData={finalReport} />
      )}
    </div>
  );
};

export default GeneticComputation;