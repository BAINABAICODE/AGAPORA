// frontend/src/pages/ComputationResult.jsx — RBGIA + GICA results (no fixed N=6)
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import './ComputationResult.css';

function ProgressBar({ value, color }) {
  return (
    <div className="progress-bar">
      <div
        className="progress-fill"
        style={{ width: `${Math.min(value || 0, 100)}%`, background: color || '#EC793D' }}
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

const ComputationResult = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

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

  if (loading)
    return (
      <div className="computation-result loading-container">
        <div className="loading-spinner" />
        <p>Loading prediction results...</p>
      </div>
    );

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

  const probs = result.probabilities || {};
  const analysis = result.genetic_analysis || {};
  const verification = analysis.verification || result.verification || {};
  const algo = analysis.algorithm || {};
  const bp = result.breeding_pair || {};
  const compat = analysis.species_compatibility || {};
  const gica = analysis.gica || {};
  const repro = analysis.reproductive_forecast || {};
  const report = analysis.report || {};
  const eggExamples = report.egg_chick_examples || analysis.egg_chick_examples || null;
  const eggChicks = eggExamples?.chicks || result.chicks_data || [];

  const TABS = [
    { key: 'overview', label: 'Overview' },
    { key: 'probabilities', label: 'Probabilities' },
    { key: 'verification', label: 'Verify' },
    { key: 'report', label: 'Report' },
    { key: 'genetics', label: 'Genetics' },
  ];

  return (
    <div className="computation-result">
      <div className="result-container">
        <h1 className="result-title">Pair Compatibility Results</h1>
        <p className="result-subtitle">
          RBGIA probability distributions · GICA Compatibility Index · species reproductive forecast
        </p>

        {algo.name && (
          <div className="algo-badge">
            <strong>{algo.name}</strong>
            <br />
            <small style={{ opacity: 0.7 }}>{algo.computation_location}</small>
          </div>
        )}

        {(compat.warning || repro.hybrid_warning) && (
          <div className={`compat-banner ${compat.compatible ? 'compat-warn' : 'compat-error'}`}>
            ⚠ {repro.hybrid_warning || compat.warning}
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

        {activeTab === 'overview' && (
          <div className="statistics-section">
            <div className="stats-grid">
              <div className="stat-card">
                <h3>GICA Compatibility Index</h3>
                <p style={{ fontSize: '2rem', fontWeight: 800, margin: '0.25rem 0' }}>
                  {gica.score != null ? gica.score : '—'} <small>/ 100</small>
                </p>
                <p><strong>{gica.label || '—'}</strong></p>
                <p className="stat-note">{gica.recommendation || ''}</p>
                {gica.breakdown && (
                  <>
                    <StatRow label="Trait success" value={gica.breakdown.trait_success} color="#66bb6a" />
                    <StatRow label="Risk" value={gica.breakdown.risk} color="#ef5350" />
                    <StatRow label="Diversity" value={gica.breakdown.diversity} color="#26c6da" />
                  </>
                )}
              </div>
              <div className="stat-card">
                <h3>Reproductive Forecast</h3>
                <p><strong>Species:</strong> {repro.species_used || '—'}</p>
                <p>
                  <strong>Species clutch range:</strong> {repro.eggs_laid_min ?? '—'}–
                  {repro.eggs_laid_max ?? '—'} (ref. mean {repro.eggs_laid_mean ?? '—'})
                </p>
                <p style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                  Forecast eggs for this pair: {repro.eggs_forecast ?? eggExamples?.egg_count ?? '—'}
                </p>
                <p className="stat-note">{repro.eggs_forecast_basis}</p>
                <p>
                  <strong>Hatch rate:</strong>{' '}
                  {repro.hatch_rate_percent != null ? `${repro.hatch_rate_percent}%` : '—'}
                  {repro.clutch_factor != null ? ` · clutch factor ${repro.clutch_factor}` : ''}
                </p>
                <p>
                  <strong>Expected hatchlings:</strong> {repro.expected_hatchlings ?? '—'}
                </p>
                <p className="stat-note">{repro.formula}</p>
                <ul className="steps-list">
                  {(repro.adjustment_notes || []).map((note, i) => (
                    <li key={i}>{note}</li>
                  ))}
                </ul>
              </div>
            </div>

            {eggChicks.length > 0 && (
              <div className="chicks-section" style={{ marginTop: '1.25rem' }}>
                <h3>Egg possibilities (genotype + phenotype at hatch)</h3>
                <p className="section-note">{eggExamples?.formula_note || report.reproductive_summary}</p>
                <div className="chicks-grid">
                  {eggChicks.map((chick, index) => (
                    <div key={index} className="chick-card">
                      <div className="chick-header">
                        <h3>Egg #{chick.egg_number || index + 1}</h3>
                        <span className={`chick-sex ${(chick.sex || '').toLowerCase()}`}>
                          {chick.sex === 'Male' ? '♂' : '♀'} {chick.sex}
                        </span>
                      </div>
                      <div className="chick-details">
                        <p className="stat-note">
                          {chick.status === 'expected_hatch' ? 'Expected hatch' : 'Egg possibility'} —{' '}
                          {chick.hatch_note}
                        </p>
                        <div className="detail-item">
                          <strong>Phenotype</strong>
                          <span className="genetic-makeup">{chick.phenotype || chick.genetic_makeup || '—'}</span>
                        </div>
                        <div className="detail-item">
                          <strong>Base Color</strong>
                          <span className="color-badge">{chick.base_color || '—'}</span>
                        </div>
                        <div className="detail-item">
                          <strong>Visual Mutations</strong>
                          <div className="tags-row">
                            {chick.visual_mutations?.length
                              ? chick.visual_mutations.map((m) => (
                                  <span key={m} className="tag tag-mutation">{m}</span>
                                ))
                              : <em className="none-label">None</em>}
                          </div>
                        </div>
                        <div className="detail-item">
                          <strong>Splits</strong>
                          <div className="tags-row">
                            {chick.split_genes?.length
                              ? chick.split_genes.map((g) => (
                                  <span key={g} className="tag tag-split">{g}</span>
                                ))
                              : <em className="none-label">None</em>}
                          </div>
                        </div>
                        <div className="detail-item full">
                          <strong>Genotype</strong>
                          <span className="genetic-makeup">{chick.genotype || '—'}</span>
                        </div>
                        {(chick.inherited_traits || []).length > 0 && (
                          <ul className="steps-list">
                            {chick.inherited_traits.map((line, i) => (
                              <li key={i}>{line}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="section-note" style={{ marginTop: '1rem' }}>
              Decision-support only. Not a veterinary diagnosis. Actual clutches vary with health,
              husbandry, and environment.
            </p>
          </div>
        )}

        {activeTab === 'probabilities' && (
          <div className="statistics-section">
            <p className="section-note">
              RBGIA — Rule-Based Genetic Inheritance Algorithm (deterministic Mendelian probabilities)
            </p>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Sex</h3>
                <StatRow label="Male ♂" value={probs.sex?.Male || 0} color="#5b8dee" />
                <StatRow label="Female ♀" value={probs.sex?.Female || 0} color="#f78fb3" />
              </div>
              <div className="stat-card">
                <h3>Base Color</h3>
                {Object.entries(probs.base_colors || {}).map(([color, p]) => (
                  <StatRow key={color} label={color} value={p} color="#66bb6a" />
                ))}
              </div>
              {Object.keys(probs.mutations || {}).length > 0 && (
                <div className="stat-card full-width">
                  <h3>Visual Mutations</h3>
                  {Object.entries(probs.mutations).map(([m, p]) => (
                    <StatRow key={m} label={m} value={p} color="#ab47bc" />
                  ))}
                </div>
              )}
              {Object.keys(probs.split_genes || {}).length > 0 && (
                <div className="stat-card full-width">
                  <h3>Splits / Carriers</h3>
                  {Object.entries(probs.split_genes).map(([g, p]) => (
                    <StatRow key={g} label={g} value={p} color="#ff7043" />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'verification' && (
          <div className="verification-section">
            {verification.method ? (
              <>
                <div className="verify-header">
                  <h3>Mendelian / Punnett Verification</h3>
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
                    <h4>Base Color</h4>
                    {Object.entries(verification.base_color_probabilities || {}).map(([c, p]) => (
                      <StatRow key={c} label={c} value={p} color="#66bb6a" />
                    ))}
                    {verification.punnett_detail && (
                      <div className="punnett-detail">
                        <small>
                          Blue-series: <code>{verification.punnett_detail.blue_series_cross}</code>
                        </small>
                        <br />
                        <small>
                          Dark-factor: <code>{verification.punnett_detail.dark_factor_cross}</code>
                        </small>
                      </div>
                    )}
                  </div>
                  <div className="verify-card">
                    <h4>Sex (ZW)</h4>
                    <StatRow label="Male ♂" value={50} color="#5b8dee" />
                    <StatRow label="Female ♀" value={50} color="#f78fb3" />
                  </div>
                  {Object.keys(verification.mutation_probabilities || {}).length > 0 && (
                    <div className="verify-card full-width">
                      <h4>Mutations</h4>
                      {Object.entries(verification.mutation_probabilities).map(([m, p]) => (
                        <StatRow key={m} label={m} value={p} color="#ab47bc" />
                      ))}
                    </div>
                  )}
                  {Object.keys(verification.split_probabilities || {}).length > 0 && (
                    <div className="verify-card full-width">
                      <h4>Splits</h4>
                      {Object.entries(verification.split_probabilities).map(([g, p]) => (
                        <StatRow key={g} label={g} value={p} color="#ff7043" />
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="no-data">
                <p>Verification data is not available for this result.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'report' && (
          <div className="genetics-section">
            <div className="genetics-card">
              <h3>{report.title || 'Computational Summary (RBGIA + GICA)'}</h3>
              <div className="genetics-info">
                <p>{report.determinism}</p>
                <p>
                  <strong>Time complexity:</strong> {report.time_complexity || 'O(M) to O(M·K)'}
                </p>
                <p className="stat-note">{report.time_complexity_note}</p>
                <p>
                  <strong>Space complexity:</strong> {report.space_complexity || 'O(M)'}
                </p>
                <p className="stat-note">{report.space_complexity_note}</p>
                <p>{report.scalability}</p>
                <p>{report.note_n6_removed}</p>
                <p>{report.reproductive_summary}</p>
                <p>{report.gica_summary}</p>
                {report.inheritance_summary && <p>{report.inheritance_summary}</p>}
                <p className="section-note">{report.disclaimer}</p>
              </div>
            </div>

            {(report.inherited_traits || analysis.inherited_traits) && (() => {
              const it = report.inherited_traits || analysis.inherited_traits || {};
              const phen = it.expected_phenotype_summary || {};
              const color = it.color_inheritance || {};
              return (
                <div className="genetics-card">
                  <h3>{it.title || 'Genetic Traits Offspring Inherit from Parents'}</h3>
                  <div className="genetics-info">
                    <p className="stat-note">{it.summary}</p>
                    <p>
                      <strong>Most likely base color:</strong> {phen.most_likely_base_color || '—'}{' '}
                      ({phen.most_likely_base_color_percent ?? '—'}%)
                    </p>
                    <p>
                      <strong>Visual mutations ≥25%:</strong>{' '}
                      {(phen.likely_visual_mutations || []).join(', ') || 'none'}
                    </p>
                    <p>
                      <strong>Likely splits ≥25%:</strong>{' '}
                      {(phen.likely_splits || []).join(', ') || 'none'}
                    </p>
                    <p>
                      <strong>Sex:</strong> {phen.sex_ratio || '50% Male / 50% Female'}
                    </p>

                    <h4 style={{ marginTop: '1rem' }}>Base color inheritance</h4>
                    <p>
                      {color.parent1_phenotype || '—'} × {color.parent2_phenotype || '—'} →{' '}
                      <strong>{color.most_likely_offspring || '—'}</strong> (
                      {color.probability_percent ?? '—'}%)
                    </p>
                    <p className="stat-note">{color.computation}</p>

                    {(it.mutation_traits || []).length > 0 && (
                      <>
                        <h4>Visual mutations inherited</h4>
                        <ul className="steps-list">
                          {it.mutation_traits.map((t) => (
                            <li key={t.trait}>
                              <strong>{t.trait}</strong> — {t.probability_percent}% visual (
                              {(t.inheritance_type || '').replace(/_/g, ' ')}). From:{' '}
                              {(t.inherited_from || []).join('; ')}. {t.computation}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}

                    {(it.split_traits || []).length > 0 && (
                      <>
                        <h4>Splits / carriers inherited</h4>
                        <ul className="steps-list">
                          {it.split_traits.map((t) => (
                            <li key={t.trait}>
                              <strong>{t.trait}</strong> — {t.probability_percent}% silent carrier.
                              From: {(t.inherited_from || []).join('; ')}.
                            </li>
                          ))}
                        </ul>
                      </>
                    )}

                    <h4>Feature lines</h4>
                    <ul className="steps-list">
                      {(it.feature_lines || []).map((line, i) => (
                        <li key={i}>{line}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })()}

            {eggChicks.length > 0 && (
              <div className="genetics-card">
                <h3>Chicks / eggs from reproductive forecast</h3>
                <p className="stat-note">{eggExamples?.formula_note || report.reproductive_summary}</p>
                <div className="chicks-grid">
                  {eggChicks.map((chick, index) => (
                    <div key={index} className="chick-card">
                      <div className="chick-header">
                        <h3>Egg #{chick.egg_number || index + 1}</h3>
                        <span className={`chick-sex ${(chick.sex || '').toLowerCase()}`}>
                          {chick.sex === 'Male' ? '♂' : '♀'} {chick.sex}
                        </span>
                      </div>
                      <div className="chick-details">
                        <p className="stat-note">
                          {chick.status === 'expected_hatch' ? 'Expected hatch' : 'Egg possibility'}
                        </p>
                        <p>
                          <strong>Phenotype:</strong> {chick.phenotype || '—'}
                        </p>
                        <p>
                          <strong>Genotype:</strong> {chick.genotype || '—'}
                        </p>
                        <p>
                          <strong>Mutations:</strong>{' '}
                          {chick.visual_mutations?.join(', ') || 'None'}
                        </p>
                        <p>
                          <strong>Splits:</strong> {chick.split_genes?.join(', ') || 'None'}
                        </p>
                        <ul className="steps-list">
                          {(chick.inherited_traits || []).map((line, i) => (
                            <li key={i}>{line}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'genetics' && (
          <div className="genetics-section">
            <div className="genetics-card">
              <h3>
                Parent 1 — {bp.parent1_sex === 'Male' ? '♂' : '♀'} {bp.parent1_species || 'Unknown'}
              </h3>
              <div className="genetics-info">
                <p>
                  <strong>Base Color:</strong> {bp.parent1_base_color || '—'}
                </p>
                <p>
                  <strong>Visual Mutations:</strong>{' '}
                  {bp.parent1_visual_mutations?.length
                    ? bp.parent1_visual_mutations.join(', ')
                    : 'None'}
                </p>
                <p>
                  <strong>Split Genes:</strong>{' '}
                  {bp.parent1_split_genes?.length ? bp.parent1_split_genes.join(', ') : 'None'}
                </p>
              </div>
            </div>
            <div className="genetics-card">
              <h3>
                Parent 2 — {bp.parent2_sex === 'Male' ? '♂' : '♀'} {bp.parent2_species || 'Unknown'}
              </h3>
              <div className="genetics-info">
                <p>
                  <strong>Base Color:</strong> {bp.parent2_base_color || '—'}
                </p>
                <p>
                  <strong>Visual Mutations:</strong>{' '}
                  {bp.parent2_visual_mutations?.length
                    ? bp.parent2_visual_mutations.join(', ')
                    : 'None'}
                </p>
                <p>
                  <strong>Split Genes:</strong>{' '}
                  {bp.parent2_split_genes?.length ? bp.parent2_split_genes.join(', ') : 'None'}
                </p>
              </div>
            </div>
            {analysis.inheritance_rules && (
              <div className="genetics-card">
                <h3>Inheritance Rules</h3>
                <div className="genetics-info">
                  {Object.entries(analysis.inheritance_rules).map(([key, val]) => (
                    <p key={key}>
                      <strong>{key.replace(/_/g, ' ')}:</strong> {val}
                    </p>
                  ))}
                </div>
              </div>
            )}
            {algo.steps_performed && (
              <div className="genetics-card">
                <h3>Algorithm Steps</h3>
                <div className="genetics-info">
                  <ol className="steps-list">
                    {algo.steps_performed.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </div>
              </div>
            )}
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
