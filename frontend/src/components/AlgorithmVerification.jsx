import React, { useState, useEffect } from 'react';
import './AlgorithmVerification.css';

const AlgorithmVerification = ({ parent1, parent2, geneticResult, onComplete }) => {
  const [verificationStatus, setVerificationStatus] = useState('verifying');
  const [manualResults, setManualResults] = useState(null);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    performManualVerification();
  }, []);

  const calculateAgeCompatibility = (ageMonths1, ageMonths2) => {
    const parseAge = (age) => {
      if (age === undefined || age === null) return 12;
      if (typeof age === 'number') return age;
      const match = String(age).match(/(\d+)\s*(months|month|years|year|weeks|week|days|day)/i);
      if (!match) return 12;
      const value = parseInt(match[1]);
      const unit = match[2].toLowerCase();
      if (unit.includes('year')) return value * 12;
      if (unit.includes('week')) return value / 4;
      if (unit.includes('day')) return value / 30;
      return value;
    };
    const ageInMonths1 = parseAge(ageMonths1);
    const ageInMonths2 = parseAge(ageMonths2);
    const avgAge = (ageInMonths1 + ageInMonths2) / 2;
    if (avgAge >= 12 && avgAge <= 60) return 20;
    if (avgAge >= 8 && avgAge <= 84) return 15;
    return 10;
  };

  const calculateColorCompatibility = (color1, color2) => {
    const colorGroups = {
      'Green':10,'Dark Green':8,'Olive':6,'Blue':10,'Cobalt':8,'Mauve':6,
      'Aqua (Dutch Blue)':9,'Turquoise (Whitefaced Blue)':9,
      'Aqua-Turquoise (Seagreen)':10
    };
    return ((colorGroups[color1]||5) + (colorGroups[color2]||5)) / 2;
  };

  const calculateMutationCompatibility = (mutations1, mutations2) => {
    const baseScore = 15;
    const shared = mutations1.filter(m => mutations2.includes(m)).length;
    return shared > 0 ? baseScore + shared*2 : baseScore;
  };

  const fuzzyLogicCompatibility = (p1, p2) => {
    let compatibility = 0;
    compatibility += p1.species === p2.species ? 30 : 10;
    compatibility += calculateColorCompatibility(p1.base_color, p2.base_color);
    compatibility += calculateMutationCompatibility(p1.visual_mutations||[], p2.visual_mutations||[]);
    compatibility += calculateAgeCompatibility(p1.age_months, p2.age_months);
    const score = Math.min(compatibility, 100);
    return {
      score,
      level: score>=80?'Excellent':score>=60?'Good':score>=40?'Fair':'Poor',
      recommendation: score>=70?'Recommended for breeding':'Consider other pairings'
    };
  };

  const punnettSquare = (p1, p2, trait) => {
    const getAlleles = (parent) => {
      if (parent.visual_mutations?.includes(trait)) return ['A','A'];
      if (parent.splits?.includes(`split to ${trait}`)) return ['A','a'];
      return ['a','a'];
    };
    const p1Alleles = getAlleles(p1);
    const p2Alleles = getAlleles(p2);
    const combos = [];
    for (const a1 of p1Alleles) for (const a2 of p2Alleles) combos.push(a1+a2);
    const counts = { AA: combos.filter(c=>c==='AA').length, Aa: combos.filter(c=>c==='Aa'||c==='aA').length, aa: combos.filter(c=>c==='aa').length };
    const isDominant = trait.includes('Dominant');
    return {
      visual: ((counts.AA + (isDominant ? counts.Aa : 0)) / 4) * 100,
      split: (counts.Aa / 4) * 100,
      normal: (counts.aa / 4) * 100
    };
  };

  const performManualVerification = () => {
    setVerificationStatus('verifying');
    const fuzzyResult = fuzzyLogicCompatibility(parent1, parent2);
    const allMutations = [...new Set([
      ...(parent1.visual_mutations||[]), ...(parent2.visual_mutations||[]),
      ...(parent1.splits||[]).map(s=>s.replace('split to ','')),
      ...(parent2.splits||[]).map(s=>s.replace('split to ',''))
    ])];
    const punnettResults = {};
    for (const mutation of allMutations) punnettResults[mutation] = punnettSquare(parent1, parent2, mutation);
    const algorithmScore = geneticResult?.geneticAlgorithmResults?.compatibilityScore || 0;
    const isCompatible = Math.abs(algorithmScore - fuzzyResult.score) < 30;
    const verification = {
      isValid: isCompatible,
      fuzzyLogicResult: fuzzyResult,
      punnettSquareResults: punnettResults,
      algorithmScore,
      timestamp: new Date().toISOString()
    };
    setManualResults(verification);
    setIsValid(isCompatible);
    setVerificationStatus('complete');
    setTimeout(() => onComplete(verification), 1000);
  };

  if (verificationStatus === 'verifying') {
    return (
      <div className="verification-container">
        <h3>Verifying Genetic Compatibility</h3>
        <div className="verification-steps">
          <div className="step active">
            <div className="step-icon">🔬</div>
            <span>Fuzzy Logic Analysis</span>
          </div>
          <div className="step">
            <div className="step-icon">📊</div>
            <span>Punnett Square Calculation</span>
          </div>
          <div className="step">
            <div className="step-icon">⚖️</div>
            <span>Algorithm Validation</span>
          </div>
        </div>
        <div className="progress-bar">
          <div className="progress-fill"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="verification-complete">
      <div className={`verification-badge ${isValid ? 'success' : 'warning'}`}>
        {isValid ? '✓ Verification Passed' : '⚠ Verification Warning'}
      </div>
      {manualResults && (
        <div className="verification-results">
          <div className="result-section">
            <h4>Fuzzy Logic Compatibility</h4>
            <div className="compatibility-score">
              <div className="score-value">{manualResults.fuzzyLogicResult.score}%</div>
              <div className="score-level">{manualResults.fuzzyLogicResult.level}</div>
              <p>{manualResults.fuzzyLogicResult.recommendation}</p>
            </div>
          </div>
          <div className="result-section">
            <h4>Algorithm vs Manual Comparison</h4>
            <div className="comparison">
              <div className="compare-item">
                <span>Genetic Algorithm:</span>
                <strong>{manualResults.algorithmScore}%</strong>
              </div>
              <div className="compare-item">
                <span>Fuzzy Logic:</span>
                <strong>{manualResults.fuzzyLogicResult.score}%</strong>
              </div>
              <div className={`match-indicator ${isValid ? 'match' : 'mismatch'}`}>
                {isValid ? 'Results Aligned ✓' : 'Results Differ ⚠'}
              </div>
            </div>
          </div>
        </div>
      )}
      <button className="continue-btn" onClick={() => onComplete(manualResults)}>
        Continue to Report
      </button>
    </div>
  );
};

export default AlgorithmVerification;