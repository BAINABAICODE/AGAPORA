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

const TABS = [
  { key: 'chicks', label: 'Chicks' },
  { key: 'statistics', label: 'Stats' },
  { key: 'verification', label: 'Verify' },
  { key: 'genetics', label: 'Genetics' },
];

const ComputationResultScreen = () => {
  const { params } = useRoute();
  const navigation = useNavigation();
  const id = params?.id;
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('chicks');

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

  const chicks = result.chicks_data || [];
  const probs = result.probabilities || {};
  const analysis = result.genetic_analysis || {};
  const verification = analysis.verification || result.verification || {};
  const algo = analysis.algorithm || {};
  const bp = result.breeding_pair || {};
  const compat = analysis.species_compatibility || {};

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Genetic Prediction Results</Text>
      <Text style={styles.subtitle}>
        6 chicks predicted using Rule-Based GA + Punnett verification
      </Text>

      {algo.name ? (
        <View style={styles.algoBadge}>
          <Text style={styles.algoName}>{algo.name}</Text>
          {algo.generations ? (
            <Text style={styles.algoMeta}>
              {algo.generations} generations · pop {algo.population_size} · {algo.selection}
            </Text>
          ) : null}
        </View>
      ) : null}

      {compat.warning ? (
        <Text style={styles.warning}>⚠ {compat.warning}</Text>
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

      {activeTab === 'chicks' &&
        chicks.map((chick, index) => (
          <View key={index} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Chick #{chick.chick_number || index + 1}</Text>
              <Text style={styles.sex}>
                {chick.sex === 'Male' ? '♂' : '♀'} {chick.sex}
              </Text>
            </View>
            <Text style={styles.meta}>
              <Text style={styles.bold}>Base Color: </Text>
              {chick.base_color || '—'}
            </Text>
            <Text style={styles.bold}>Visual Mutations</Text>
            <View style={styles.tags}>
              {chick.visual_mutations?.length
                ? chick.visual_mutations.map((m) => <Tag key={m} text={m} type="mutation" />)
                : <Text style={styles.none}>None</Text>}
            </View>
            <Text style={styles.bold}>Split Genes</Text>
            <View style={styles.tags}>
              {chick.split_genes?.length
                ? chick.split_genes.map((g) => <Tag key={g} text={g} type="split" />)
                : <Text style={styles.none}>None</Text>}
            </View>
            <Text style={styles.meta}>
              <Text style={styles.bold}>Genetic Makeup: </Text>
              {chick.genetic_makeup || '—'}
            </Text>
            {chick.fitness_score != null && (
              <Text style={styles.meta}>
                Fitness: {(chick.fitness_score * 100).toFixed(0)} / 100
              </Text>
            )}
          </View>
        ))}

      {activeTab === 'statistics' && (
        <View>
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
          {analysis.genetic_diversity_score != null && (
            <StatRow
              label="Diversity"
              value={analysis.genetic_diversity_score * 100}
              color="#26c6da"
            />
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
            </>
          ) : (
            <Text style={styles.none}>Verification data is not available.</Text>
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
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Summary</Text>
            <Text style={styles.meta}>Total chicks: {chicks.length}</Text>
            <Text style={styles.meta}>
              Males: {chicks.filter((c) => c.sex === 'Male').length} · Females:{' '}
              {chicks.filter((c) => c.sex === 'Female').length}
            </Text>
          </View>
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
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  cardTitle: { color: colors.toolGold, fontWeight: '800', fontSize: 16 },
  sex: { color: colors.toolCream, fontWeight: '700' },
  meta: { color: colors.toolCream, marginBottom: 4, lineHeight: 20 },
  bold: { fontWeight: '700', color: colors.toolGold },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginVertical: 6 },
  tag: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  tagMutation: { backgroundColor: 'rgba(171,71,188,0.25)' },
  tagSplit: { backgroundColor: 'rgba(255,112,67,0.25)' },
  tagText: { color: colors.toolCream, fontSize: 12 },
  none: { color: 'rgba(238,212,173,0.55)', fontStyle: 'italic' },
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
