import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import api from '../api/axios';
import { colors, radius, spacing } from '../theme';

function ProgressBar({ value, color }) {
  return (
    <View style={styles.barTrack}>
      <View
        style={[
          styles.barFill,
          { width: `${Math.min(value || 0, 100)}%`, backgroundColor: color || colors.accent },
        ]}
      />
    </View>
  );
}

function StatRow({ label, value, color }) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <ProgressBar value={value} color={color} />
      <Text style={styles.statValue}>
        {typeof value === 'number' ? value.toFixed(1) : value}%
      </Text>
    </View>
  );
}

function Tag({ text, type }) {
  return (
    <View style={[styles.tag, type === 'split' ? styles.tagSplit : styles.tagMutation]}>
      <Text style={styles.tagText}>{text}</Text>
    </View>
  );
}

function EggChickCard({ chick }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Egg #{chick.egg_number || chick.chick_number}</Text>
        <Text style={styles.sex}>
          {chick.sex === 'Male' ? '♂' : '♀'} {chick.sex}
        </Text>
      </View>
      <Text style={styles.none}>
        {chick.status === 'expected_hatch' ? 'Expected hatch' : 'Egg possibility'} — {chick.hatch_note}
      </Text>
      <Text style={styles.meta}>
        <Text style={styles.bold}>Phenotype: </Text>
        {chick.phenotype || chick.genetic_makeup || '—'}
      </Text>
      <Text style={styles.meta}>
        <Text style={styles.bold}>Base color: </Text>
        {chick.base_color || '—'}
      </Text>
      <Text style={styles.bold}>Visual mutations</Text>
      <View style={styles.tags}>
        {chick.visual_mutations?.length
          ? chick.visual_mutations.map((m) => <Tag key={m} text={m} type="mutation" />)
          : <Text style={styles.none}>None</Text>}
      </View>
      <Text style={styles.bold}>Splits / carriers</Text>
      <View style={styles.tags}>
        {chick.split_genes?.length
          ? chick.split_genes.map((g) => <Tag key={g} text={g} type="split" />)
          : <Text style={styles.none}>None</Text>}
      </View>
      <Text style={styles.meta}>
        <Text style={styles.bold}>Genotype: </Text>
        {chick.genotype || '—'}
      </Text>
      {(chick.inherited_traits || []).map((line, i) => (
        <Text key={i} style={styles.none}>
          • {line}
        </Text>
      ))}
    </View>
  );
}

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'probabilities', label: 'Probabilities' },
  { key: 'verification', label: 'Verify' },
  { key: 'report', label: 'Report' },
  { key: 'genetics', label: 'Genetics' },
];

const ComputationResultScreen = () => {
  const { params } = useRoute();
  const navigation = useNavigation();
  const id = params?.id;
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/computation-result/${id}`);
        if (res.data.success) setResult(res.data.data);
        else setError('No results found for this breeding pair.');
      } catch {
        setError('Failed to load computation results.');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchResult();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.toolGold} />
        <Text style={styles.muted}>Loading prediction results...</Text>
      </View>
    );
  }

  if (error || !result) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>No Results Found</Text>
        <Text style={styles.muted}>{error || 'Please compute predictions first.'}</Text>
        <Pressable style={styles.primaryBtn} onPress={() => navigation.navigate('Breed')}>
          <Text style={styles.primaryText}>Start New Prediction</Text>
        </Pressable>
      </View>
    );
  }

  const probs = result.probabilities || {};
  const analysis = result.genetic_analysis || {};
  const verification = analysis.verification || result.verification || {};
  const algo = analysis.algorithm || {};
  const bp = result.breeding_pair || {};
  const compat = analysis.species_compatibility || {};
  const gica = analysis.gica || {};
  const repro = analysis.reproductive_forecast || {};
  const report = analysis.report || {};
  const eggExamples =
    report.egg_chick_examples || analysis.egg_chick_examples || null;
  const eggChicks =
    eggExamples?.chicks ||
    result.chicks_data ||
    [];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Pair Compatibility Results</Text>
      <Text style={styles.subtitle}>RBGIA probability distributions · GICA Compatibility Index</Text>

      {algo.name ? (
        <View style={styles.algoBadge}>
          <Text style={styles.algoName}>{algo.name}</Text>
          <Text style={styles.algoMeta}>{algo.computation_location || 'Client genetic engine'}</Text>
        </View>
      ) : null}

      {(compat.warning || repro.hybrid_warning) ? (
        <Text style={styles.warning}>⚠ {repro.hybrid_warning || compat.warning}</Text>
      ) : null}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs}>
        {TABS.map((tab) => (
          <Pressable
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {activeTab === 'overview' && (
        <View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>GICA Compatibility Index</Text>
            <Text style={styles.scoreBig}>
              {gica.score != null ? `${gica.score}` : '—'}
              <Text style={styles.scoreUnit}> / 100</Text>
            </Text>
            <Text style={styles.labelText}>{gica.label || '—'}</Text>
            <Text style={styles.meta}>{gica.recommendation || ''}</Text>
            {gica.breakdown ? (
              <>
                <StatRow label="Trait success" value={gica.breakdown.trait_success} color="#66bb6a" />
                <StatRow label="Risk" value={gica.breakdown.risk} color="#ef5350" />
                <StatRow label="Diversity" value={gica.breakdown.diversity} color="#26c6da" />
              </>
            ) : null}
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Reproductive Forecast</Text>
            <Text style={styles.meta}>Species: {repro.species_used || '—'}</Text>
            <Text style={styles.meta}>
              Species clutch range: {repro.eggs_laid_min ?? '—'}–{repro.eggs_laid_max ?? '—'} (ref.
              mean {repro.eggs_laid_mean ?? '—'})
            </Text>
            <Text style={styles.scoreMid}>
              Forecast eggs for this pair: {repro.eggs_forecast ?? eggExamples?.egg_count ?? '—'}
            </Text>
            <Text style={styles.none}>{repro.eggs_forecast_basis || ''}</Text>
            <Text style={styles.meta}>
              Hatch rate: {repro.hatch_rate_percent != null ? `${repro.hatch_rate_percent}%` : '—'}
              {repro.clutch_factor != null ? ` · clutch factor ${repro.clutch_factor}` : ''}
            </Text>
            <Text style={styles.meta}>
              Expected hatchlings: {repro.expected_hatchlings ?? '—'}
            </Text>
            <Text style={styles.none}>{repro.formula || ''}</Text>
            {(repro.adjustment_notes || []).map((note, i) => (
              <Text key={i} style={styles.none}>
                • {note}
              </Text>
            ))}
          </View>

          {eggChicks.length > 0 && (
            <View>
              <Text style={styles.sectionNote}>
                Egg possibilities (genotype + phenotype at hatch)
              </Text>
              {eggChicks.map((chick, idx) => (
                <EggChickCard key={idx} chick={chick} />
              ))}
            </View>
          )}

          <Text style={styles.disclaimer}>
            Decision-support only. Not a veterinary diagnosis. Actual clutches vary with health,
            husbandry, and environment.
          </Text>
        </View>
      )}

      {activeTab === 'probabilities' && (
        <View>
          <Text style={styles.sectionNote}>RBGIA — Rule-Based Genetic Inheritance Algorithm</Text>
          <StatRow label="Male ♂" value={probs.sex?.Male || 0} color="#5b8dee" />
          <StatRow label="Female ♀" value={probs.sex?.Female || 0} color="#f78fb3" />
          {Object.entries(probs.base_colors || {}).map(([color, p]) => (
            <StatRow key={color} label={color} value={p} color="#66bb6a" />
          ))}
          {Object.entries(probs.mutations || {}).map(([m, p]) => (
            <StatRow key={m} label={m} value={p} color="#ab47bc" />
          ))}
          {Object.entries(probs.split_genes || {}).map(([g, p]) => (
            <StatRow key={g} label={g} value={p} color="#ff7043" />
          ))}
          {Object.keys(probs.mutations || {}).length === 0 &&
            Object.keys(probs.split_genes || {}).length === 0 && (
              <Text style={styles.none}>No mutation/split probabilities for this pair.</Text>
            )}
        </View>
      )}

      {activeTab === 'verification' && (
        <View>
          {verification.method ? (
            <>
              <Text style={styles.meta}>{verification.method}</Text>
              {verification.confidence_score != null && (
                <StatRow
                  label="Confidence"
                  value={verification.confidence_score}
                  color="#26c6da"
                />
              )}
              {Object.entries(verification.base_color_probabilities || {}).map(([c, p]) => (
                <StatRow key={c} label={c} value={p} color="#66bb6a" />
              ))}
              {Object.entries(verification.mutation_probabilities || {}).map(([m, p]) => (
                <StatRow key={m} label={m} value={p} color="#ab47bc" />
              ))}
              {Object.entries(verification.split_probabilities || {}).map(([g, p]) => (
                <StatRow key={g} label={g} value={p} color="#ff7043" />
              ))}
              {verification.punnett_detail ? (
                <View style={styles.card}>
                  <Text style={styles.meta}>
                    Blue-series: {verification.punnett_detail.blue_series_cross}
                  </Text>
                  <Text style={styles.meta}>
                    Dark-factor: {verification.punnett_detail.dark_factor_cross}
                  </Text>
                </View>
              ) : null}
            </>
          ) : (
            <Text style={styles.none}>Verification data is not available.</Text>
          )}
        </View>
      )}

      {activeTab === 'report' && (
        <View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{report.title || 'Computational Summary'}</Text>
            <Text style={styles.meta}>{report.determinism}</Text>
            <Text style={styles.meta}>
              <Text style={styles.bold}>Time: </Text>
              {report.time_complexity || 'O(M) to O(M·K)'}
            </Text>
            <Text style={styles.none}>{report.time_complexity_note}</Text>
            <Text style={styles.meta}>
              <Text style={styles.bold}>Space: </Text>
              {report.space_complexity || 'O(M)'}
            </Text>
            <Text style={styles.none}>{report.space_complexity_note}</Text>
            <Text style={styles.meta}>{report.scalability}</Text>
            <Text style={styles.meta}>{report.note_n6_removed}</Text>
            <Text style={styles.meta}>{report.reproductive_summary}</Text>
            <Text style={styles.meta}>{report.gica_summary}</Text>
            {report.inheritance_summary ? (
              <Text style={styles.meta}>{report.inheritance_summary}</Text>
            ) : null}
            <Text style={styles.disclaimer}>{report.disclaimer}</Text>
          </View>

          {(report.inherited_traits || analysis.inherited_traits) && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>
                {(report.inherited_traits || analysis.inherited_traits).title ||
                  'Traits Offspring Inherit'}
              </Text>
              <Text style={styles.none}>
                {(report.inherited_traits || analysis.inherited_traits).summary}
              </Text>

              {(() => {
                const it = report.inherited_traits || analysis.inherited_traits || {};
                const phen = it.expected_phenotype_summary || {};
                const color = it.color_inheritance || {};
                return (
                  <>
                    <Text style={styles.sectionNote}>Expected phenotype</Text>
                    <Text style={styles.scoreMid}>
                      {phen.most_likely_base_color || '—'}{' '}
                      <Text style={styles.scoreUnit}>
                        ({phen.most_likely_base_color_percent ?? '—'}%)
                      </Text>
                    </Text>
                    <Text style={styles.meta}>
                      Visual ≥25%: {(phen.likely_visual_mutations || []).join(', ') || 'none'}
                    </Text>
                    <Text style={styles.meta}>
                      Splits ≥25%: {(phen.likely_splits || []).join(', ') || 'none'}
                    </Text>
                    <Text style={styles.meta}>{phen.sex_ratio}</Text>

                    <Text style={styles.sectionNote}>Base color inheritance</Text>
                    <Text style={styles.meta}>
                      {color.parent1_phenotype || '—'} × {color.parent2_phenotype || '—'} →{' '}
                      {color.most_likely_offspring || '—'} ({color.probability_percent ?? '—'}%)
                    </Text>
                    <Text style={styles.none}>{color.computation}</Text>

                    {(it.mutation_traits || []).map((t) => (
                      <View key={`m-${t.trait}`} style={{ marginBottom: 8 }}>
                        <Text style={styles.meta}>
                          <Text style={styles.bold}>Visual {t.trait}: </Text>
                          {t.probability_percent}% · {t.inheritance_type?.replace(/_/g, ' ')}
                        </Text>
                        <Text style={styles.none}>
                          From: {(t.inherited_from || []).join('; ')}
                        </Text>
                      </View>
                    ))}

                    {(it.split_traits || []).map((t) => (
                      <View key={`s-${t.trait}`} style={{ marginBottom: 8 }}>
                        <Text style={styles.meta}>
                          <Text style={styles.bold}>Split {t.trait}: </Text>
                          {t.probability_percent}% carrier
                        </Text>
                        <Text style={styles.none}>
                          From: {(t.inherited_from || []).join('; ')}
                        </Text>
                      </View>
                    ))}

                    <Text style={styles.sectionNote}>Feature lines</Text>
                    {(it.feature_lines || []).map((line, i) => (
                      <Text key={i} style={styles.meta}>
                        • {line}
                      </Text>
                    ))}
                  </>
                );
              })()}
            </View>
          )}

          {eggChicks.length > 0 && (
            <View>
              <Text style={styles.sectionNote}>
                Chicks / eggs from reproductive forecast
              </Text>
              <Text style={styles.none}>
                {eggExamples?.formula_note || report.reproductive_summary}
              </Text>
              {eggChicks.map((chick, idx) => (
                <EggChickCard key={`r-${idx}`} chick={chick} />
              ))}
            </View>
          )}
        </View>
      )}

      {activeTab === 'genetics' && (
        <View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              Parent 1 — {bp.parent1_sex} {bp.parent1_species}
            </Text>
            <Text style={styles.meta}>Base: {bp.parent1_base_color || '—'}</Text>
            <Text style={styles.meta}>
              Mutations: {bp.parent1_visual_mutations?.join(', ') || 'None'}
            </Text>
            <Text style={styles.meta}>
              Splits: {bp.parent1_split_genes?.join(', ') || 'None'}
            </Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              Parent 2 — {bp.parent2_sex} {bp.parent2_species}
            </Text>
            <Text style={styles.meta}>Base: {bp.parent2_base_color || '—'}</Text>
            <Text style={styles.meta}>
              Mutations: {bp.parent2_visual_mutations?.join(', ') || 'None'}
            </Text>
            <Text style={styles.meta}>
              Splits: {bp.parent2_split_genes?.join(', ') || 'None'}
            </Text>
          </View>
          {analysis.inheritance_rules ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Inheritance Rules</Text>
              {Object.entries(analysis.inheritance_rules).map(([key, val]) => (
                <Text key={key} style={styles.meta}>
                  <Text style={styles.bold}>{key.replace(/_/g, ' ')}: </Text>
                  {val}
                </Text>
              ))}
            </View>
          ) : null}
        </View>
      )}

      <View style={styles.actions}>
        <Pressable
          style={styles.secondaryBtn}
          onPress={() => navigation.navigate('Pairs')}
        >
          <Text style={styles.secondaryText}>View All Pairs</Text>
        </Pressable>
        <Pressable style={styles.primaryBtn} onPress={() => navigation.navigate('Breed')}>
          <Text style={styles.primaryText}>New Prediction</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.toolEnd },
  content: { padding: spacing.md, paddingBottom: 48 },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.toolEnd,
    padding: spacing.lg,
  },
  title: { fontSize: 24, fontWeight: '800', color: colors.toolGold },
  subtitle: { color: colors.toolCream, marginBottom: spacing.md, marginTop: 4 },
  muted: { color: colors.toolCream, textAlign: 'center', marginTop: 8 },
  errorTitle: { color: colors.toolGold, fontSize: 20, fontWeight: '700' },
  algoBadge: {
    backgroundColor: 'rgba(225,207,113,0.12)',
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  algoName: { color: colors.toolGold, fontWeight: '700' },
  algoMeta: { color: colors.toolCream, marginTop: 4, fontSize: 12 },
  warning: { color: '#ffcc80', marginBottom: spacing.md },
  tabs: { marginBottom: spacing.md },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.sm,
    marginRight: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  tabActive: { backgroundColor: colors.toolGold },
  tabText: { color: colors.toolCream, fontWeight: '600' },
  tabTextActive: { color: colors.toolEnd },
  card: {
    backgroundColor: colors.toolMid,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(225,207,113,0.2)',
  },
  cardTitle: { color: colors.toolGold, fontWeight: '800', fontSize: 16, marginBottom: 8 },
  scoreBig: { color: colors.toolGold, fontSize: 36, fontWeight: '800' },
  scoreMid: { color: colors.toolGold, fontSize: 18, fontWeight: '800', marginTop: 8 },
  scoreUnit: { fontSize: 16, fontWeight: '600', color: colors.toolCream },
  labelText: { color: colors.toolCream, fontWeight: '700', marginBottom: 6, fontSize: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  sex: { color: colors.toolCream, fontWeight: '700' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginVertical: 6 },
  tag: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  tagMutation: { backgroundColor: 'rgba(171,71,188,0.25)' },
  tagSplit: { backgroundColor: 'rgba(255,112,67,0.25)' },
  tagText: { color: colors.toolCream, fontSize: 12 },
  meta: { color: colors.toolCream, marginBottom: 4, lineHeight: 20 },
  bold: { fontWeight: '700', color: colors.toolGold },
  none: { color: 'rgba(238,212,173,0.55)', fontStyle: 'italic', marginBottom: 6 },
  sectionNote: { color: colors.toolGold, fontWeight: '700', marginBottom: 10 },
  disclaimer: {
    color: 'rgba(238,212,173,0.7)',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
    marginBottom: spacing.md,
  },
  barTrack: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    flex: 1,
    marginHorizontal: 8,
  },
  barFill: { height: '100%' },
  statRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  statLabel: { width: 90, color: colors.toolCream, fontSize: 12 },
  statValue: { width: 48, color: colors.toolGold, fontWeight: '700', fontSize: 12 },
  actions: { flexDirection: 'row', gap: 10, marginTop: spacing.md },
  primaryBtn: {
    flex: 1,
    backgroundColor: colors.toolGold,
    borderRadius: radius.sm,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryText: { color: colors.toolEnd, fontWeight: '800' },
  secondaryBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.toolCream,
    borderRadius: radius.sm,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryText: { color: colors.toolCream, fontWeight: '700' },
});

export default ComputationResultScreen;
