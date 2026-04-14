// frontend/src/pages/ComputationResult.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import './ComputationResult.css';

// ── Small reusable components ──────────────────────────────────
function ProgressBar({ value, color }) {
  return (
    <div className="progress-bar">
      <div
        className="progress-fill"
        style={{ width: `${Math.min(value, 100)}%`, background: color || '#EC793D' }}
      />
    </div>
  );
}

function StatRow({ label, value, color }) {
  return (
    <div className="stat-item">
      <span className="stat-label">{label}</span>
      <ProgressBar value={value} color={color} />
      <span className="stat-value">{typeof value === 'number' ? value.toFixed(1) : value}%</span>
    </div>
  );
}

function Tag({ text, type }) {
  return <span className={`tag tag-${type || 'default'}`}>{text}</span>;
}

// ── Main Component ─────────────────────────────────────────────
const ComputationResult = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('chicks');

  useEffect(() => {
    fetchResult();
    // eslint-disable-next-line
  }, [id]);

  const fetchResult = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/computation-result/${id}`);
      if (res.data.success) setResult(res.data.data);
      else setError('No results found for this breeding pair.');
    } catch (err) {
      console.error(err);
      setError('Failed to load computation results. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading)
    return (
      <div className="computation-result loading-container">
        <div className="loading-spinner" />
        <p>Loading prediction results...</p>
      </div>
    );

  // Error state
  if (error || !result)
    return (
      <div className="computation-result error-container">
        <div className="error-card">
          <h2>No Results Found</h2>
          <p>{error || 'Please compute predictions first.'}</p>
          <button onClick={() => navigate('/breeding-form')} className="retry-button">
            Start New Prediction
          </button>
        </div>
      </div>
    );

  // Extract data
  const chicks = result.chicks_data || [];
  const probs = result.probabilities || {};
  const analysis = result.genetic_analysis || {};
  const verification = analysis.verification || result.verification || {};
  const algo = analysis.algorithm || {};
  const bp = result.breeding_pair || {};
  const compat = analysis.species_compatibility || {};

  const TABS = [
    { key: 'chicks', label: '🐣 6 Chicks' },
    { key: 'statistics', label: '📊 Statistics' },
    { key: 'verification', label: '🔬 Verification' },
    { key: 'genetics', label: '🧬 Genetic Analysis' },
  ];

  return (
    <div className="computation-result">
      <div className="result-container">
        <h1 className="result-title">🧬 Genetic Prediction Results</h1>
        <p className="result-subtitle">
          6 chicks predicted using a Rule‑Based Genetic Algorithm + Traditional Punnett Square Verification
        </p>

        {algo.name && (
          <div className="algo-badge">
            <strong>{algo.name}</strong>
            {algo.generations && (
              <span className="algo-detail">
                &nbsp;· {algo.generations} generations · pop {algo.population_size} · {algo.selection}
              </span>
            )}
            <br />
            <small style={{ opacity: 0.7 }}>{algo.computation_location}</small>
          </div>
        )}

        {compat.warning && (
          <div className={`compat-banner ${compat.compatible ? 'compat-warn' : 'compat-error'}`}>
            ⚠ {compat.warning}
          </div>
        )}

        <div className="result-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ========= TAB 1 – 6 CHICKS ========= */}
        {activeTab === 'chicks' && (
          <div className="chicks-section">
            <p className="section-note">
              These 6 chicks were selected from a population of 60 individuals evolved over 30 generations.
              Sex is balanced (3M/3F when possible).
            </p>
            <div className="chicks-grid">
              {chicks.map((chick, index) => (
                <div key={index} className="chick-card">
                  <div className="chick-header">
                    <h3>Chick #{chick.chick_number || index + 1}</h3>
                    <span className={`chick-sex ${(chick.sex || '').toLowerCase()}`}>
                      {chick.sex === 'Male' ? '♂' : '♀'} {chick.sex}
                    </span>
                  </div>
                  <div className="chick-details">
                    <div className="detail-item">
                      <strong>Base Color</strong>
                      <span className="color-badge">{chick.base_color || '—'}</span>
                    </div>
                    <div className="detail-item">
                      <strong>Visual Color Mutations</strong>
                      <div className="tags-row">
                        {chick.visual_mutations && chick.visual_mutations.length > 0
                          ? chick.visual_mutations.map((m) => <Tag key={m} text={m} type="mutation" />)
                          : <em className="none-label">None</em>}
                      </div>
                    </div>
                    <div className="detail-item">
                      <strong>Split / Hidden Genes</strong>
                      <div className="tags-row">
                        {chick.split_genes && chick.split_genes.length > 0
                          ? chick.split_genes.map((g) => <Tag key={g} text={g} type="split" />)
                          : <em className="none-label">None</em>}
                      </div>
                    </div>
                    <div className="detail-item full">
                      <strong>Genetic Makeup</strong>
                      <span className="genetic-makeup">{chick.genetic_makeup || '—'}</span>
                    </div>
                    {chick.fitness_score != null && (
                      <div className="detail-item fitness-row">
                        <strong>GA Fitness Score</strong>
                        <span className="fitness-badge">{(chick.fitness_score * 100).toFixed(0)} / 100</span>
                      </div>
                    )}

                    {/* INHERITANCE PERCENTAGES (new) */}
                    {chick.inheritance_percentages && (
                      <div className="detail-item inheritance-row">
                        <strong>Inheritance from</strong>
                        <div className="inheritance-bars">
                          <div
                            className="mother-bar"
                            style={{ width: `${chick.inheritance_percentages.mother}%` }}
                          >
                            Mother {chick.inheritance_percentages.mother.toFixed(0)}%
                          </div>
                          <div
                            className="father-bar"
                            style={{ width: `${chick.inheritance_percentages.father}%` }}
                          >
                            Father {chick.inheritance_percentages.father.toFixed(0)}%
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========= TAB 2 – STATISTICS ========= */}
        {activeTab === 'statistics' && (
          <div className="statistics-section">
            <p className="section-note">
              Probabilities calculated from the full evolved population of 60 individuals.
              Genetic diversity score:{' '}
              <strong>
                {analysis.genetic_diversity_score != null
                  ? (analysis.genetic_diversity_score * 100).toFixed(0) + '%'
                  : 'N/A'}
              </strong>
            </p>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Sex Distribution</h3>
                <StatRow label="Male ♂" value={probs.sex?.Male || 0} color="#5b8dee" />
                <StatRow label="Female ♀" value={probs.sex?.Female || 0} color="#f78fb3" />
              </div>
              <div className="stat-card">
                <h3>Base Color Distribution</h3>
                {Object.entries(probs.base_colors || {}).map(([color, p]) => (
                  <StatRow key={color} label={color} value={p} color="#66bb6a" />
                ))}
                {Object.keys(probs.base_colors || {}).length === 0 && <p className="none-label">No data</p>}
              </div>
              {Object.keys(probs.mutations || {}).length > 0 && (
                <div className="stat-card full-width">
                  <h3>Visual Mutation Probabilities</h3>
                  <p className="stat-note">How often each mutation appeared in the evolved population.</p>
                  <div className="mutations-grid">
                    {Object.entries(probs.mutations).map(([m, p]) => (
                      <StatRow key={m} label={m} value={p} color="#ab47bc" />
                    ))}
                  </div>
                </div>
              )}
              {Object.keys(probs.split_genes || {}).length > 0 && (
                <div className="stat-card full-width">
                  <h3>Split / Carrier Gene Probabilities</h3>
                  <p className="stat-note">How often each split gene appeared as a carrier in offspring.</p>
                  <div className="mutations-grid">
                    {Object.entries(probs.split_genes).map(([g, p]) => (
                      <StatRow key={g} label={g} value={p} color="#ff7043" />
                    ))}
                  </div>
                </div>
              )}
              {analysis.genetic_diversity_score != null && (
                <div className="stat-card">
                  <h3>Genetic Diversity Score</h3>
                  <StatRow
                    label="Diversity"
                    value={analysis.genetic_diversity_score * 100}
                    color="#26c6da"
                  />
                  <p className="stat-note">
                    Higher diversity → more varied offspring phenotypes expected.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========= TAB 3 – VERIFICATION ========= */}
        {activeTab === 'verification' && (
          <div className="verification-section">
            {verification.method ? (
              <>
                <div className="verify-header">
                  <h3>🔬 Verification Method</h3>
                  <p className="method-name">{verification.method}</p>
                  {verification.confidence_score != null && (
                    <div className="confidence-row">
                      <span>Confidence Score:</span>
                      <div className="confidence-bar-wrap">
                        <ProgressBar value={verification.confidence_score} color="#26c6da" />
                      </div>
                      <strong>{verification.confidence_score}%</strong>
                    </div>
                  )}
                </div>
                <div className="verify-grid">
                  <div className="verify-card">
                    <h4>📐 Base Color – Exact Punnett Square</h4>
                    <p className="verify-note">
                      16 allele combinations from blue‑series × dark‑factor.
                    </p>
                    {Object.entries(verification.base_color_probabilities || {}).map(([c, p]) => (
                      <StatRow key={c} label={c} value={p} color="#66bb6a" />
                    ))}
                    {verification.punnett_detail && (
                      <div className="punnett-detail">
                        <small>Blue‑series cross: <code>{verification.punnett_detail.blue_series_cross}</code></small>
                        <br />
                        <small>Dark‑factor cross: <code>{verification.punnett_detail.dark_factor_cross}</code></small>
                      </div>
                    )}
                  </div>
                  <div className="verify-card">
                    <h4>⚧ Sex Distribution – Theoretical</h4>
                    <p className="verify-note">ZZ/ZW system → always 50% Male / 50% Female.</p>
                    <StatRow label="Male ♂" value={50} color="#5b8dee" />
                    <StatRow label="Female ♀" value={50} color="#f78fb3" />
                  </div>
                  {Object.keys(verification.mutation_probabilities || {}).length > 0 && (
                    <div className="verify-card full-width">
                      <h4>🌀 Visual Mutation Probability – Fuzzy Logic</h4>
                      <p className="verify-note">
                        Fuzzy inference based on how many parents express or carry the mutation.
                      </p>
                      {Object.entries(verification.mutation_probabilities).map(([m, p]) => (
                        <StatRow key={m} label={m} value={p} color="#ab47bc" />
                      ))}
                    </div>
                  )}
                  {Object.keys(verification.split_probabilities || {}).length > 0 && (
                    <div className="verify-card full-width">
                      <h4>🔮 Split / Carrier Gene Probability – Fuzzy Logic</h4>
                      <p className="verify-note">
                        Probability that an offspring is a silent carrier.
                      </p>
                      {Object.entries(verification.split_probabilities).map(([g, p]) => (
                        <StatRow key={g} label={g} value={p} color="#ff7043" />
                      ))}
                    </div>
                  )}
                </div>
                <div className="verify-explanation">
                  <h4>How the Verification Works</h4>
                  <p>
                    This tab shows results from a <strong>completely independent</strong> computation
                    using different methods from the Genetic Algorithm.
                  </p>
                  <ul>
                    <li><strong>Base Color:</strong> Exact Punnett‑Square math (16 outcomes).</li>
                    <li><strong>Mutations:</strong> Fuzzy Logic inference (membership functions).</li>
                    <li>If Statistics and Verification tabs show similar numbers, the computation is validated.</li>
                  </ul>
                </div>
              </>
            ) : (
              <div className="no-data">
                <p>Verification data is not available for this result.</p>
              </div>
            )}
          </div>
        )}

        {/* ========= TAB 4 – GENETIC ANALYSIS ========= */}
        {activeTab === 'genetics' && (
          <div className="genetics-section">
            <div className="genetics-card">
              <h3>Parent 1 — {bp.parent1_sex === 'Male' ? '♂' : '♀'} {bp.parent1_species || 'Unknown'}</h3>
              <div className="genetics-info">
                <p><strong>Base Color:</strong> {bp.parent1_base_color || '—'}</p>
                <p><strong>Visual Mutations:</strong> {bp.parent1_visual_mutations?.length ? bp.parent1_visual_mutations.join(', ') : 'None'}</p>
                <p><strong>Split Genes:</strong> {bp.parent1_split_genes?.length ? bp.parent1_split_genes.join(', ') : 'None'}</p>
                {analysis.parent1?.encoded_alleles && (
                  <>
                    <p><strong>Encoded Blue‑series:</strong> [{analysis.parent1.encoded_alleles.blue_series?.join(', ')}]</p>
                    <p><strong>Encoded Dark‑factor:</strong> [{analysis.parent1.encoded_alleles.dark_factor?.join(', ')}]</p>
                  </>
                )}
              </div>
            </div>
            <div className="genetics-card">
              <h3>Parent 2 — {bp.parent2_sex === 'Male' ? '♂' : '♀'} {bp.parent2_species || 'Unknown'}</h3>
              <div className="genetics-info">
                <p><strong>Base Color:</strong> {bp.parent2_base_color || '—'}</p>
                <p><strong>Visual Mutations:</strong> {bp.parent2_visual_mutations?.length ? bp.parent2_visual_mutations.join(', ') : 'None'}</p>
                <p><strong>Split Genes:</strong> {bp.parent2_split_genes?.length ? bp.parent2_split_genes.join(', ') : 'None'}</p>
                {analysis.parent2?.encoded_alleles && (
                  <>
                    <p><strong>Encoded Blue‑series:</strong> [{analysis.parent2.encoded_alleles.blue_series?.join(', ')}]</p>
                    <p><strong>Encoded Dark‑factor:</strong> [{analysis.parent2.encoded_alleles.dark_factor?.join(', ')}]</p>
                  </>
                )}
              </div>
            </div>
            {algo.steps_performed && (
              <div className="genetics-card">
                <h3>Algorithm Steps Performed</h3>
                <div className="genetics-info">
                  <ol className="steps-list">
                    {algo.steps_performed.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </div>
              </div>
            )}
            {analysis.punnett_square && (
              <div className="genetics-card">
                <h3>Punnett Square Data</h3>
                <div className="genetics-info">
                  <p><strong>Blue‑series combinations:</strong> {(analysis.punnett_square.blue_series_combinations || []).map(a => a.join('')).join(' | ')}</p>
                  <p><strong>Dark‑factor combinations:</strong> {(analysis.punnett_square.dark_factor_combinations || []).map(a => a.join('')).join(' | ')}</p>
                  {analysis.punnett_square.mutation_loci_processed?.length > 0 && (
                    <p><strong>Mutation loci processed:</strong> {analysis.punnett_square.mutation_loci_processed.join(', ')}</p>
                  )}
                </div>
              </div>
            )}
            {analysis.inheritance_rules && (
              <div className="genetics-card">
                <h3>Inheritance Rules Applied</h3>
                <div className="genetics-info">
                  {Object.entries(analysis.inheritance_rules).map(([key, val]) => (
                    <p key={key}><strong>{key.replace(/_/g, ' ')}:</strong> {val}</p>
                  ))}
                </div>
              </div>
            )}
            <div className="genetics-card">
              <h3>Result Summary</h3>
              <div className="genetics-info">
                <p><strong>Total Chicks:</strong> {chicks.length}</p>
                <p><strong>Male Count:</strong> {chicks.filter(c => c.sex === 'Male').length}</p>
                <p><strong>Female Count:</strong> {chicks.filter(c => c.sex === 'Female').length}</p>
                <p><strong>Unique Base Colors:</strong> {[...new Set(chicks.map(c => c.base_color))].join(', ') || '—'}</p>
                <p><strong>Most Common Color:</strong> {Object.entries(probs.base_colors || {}).sort((a, b) => b[1] - a[1])[0]?.[0] || '—'}</p>
                {Object.keys(probs.mutations || {}).length > 0 && (
                  <p><strong>Most Likely Mutation:</strong> {Object.entries(probs.mutations).sort((a, b) => b[1] - a[1])[0]?.[0] || '—'}</p>
                )}
                {analysis.genetic_diversity_score != null && (
                  <p><strong>Genetic Diversity Score:</strong> {(analysis.genetic_diversity_score * 100).toFixed(0)}%</p>
                )}
              </div>
            </div>
          </div>
        )}

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