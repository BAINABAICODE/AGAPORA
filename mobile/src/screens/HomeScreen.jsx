import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { speciesService } from '../api/speciesService';
import { resolveSpeciesImage } from '../utils/speciesImages';
import { colors, radius, spacing } from '../theme';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const navigation = useNavigation();
  const { user, openLogin } = useAuth();
  const [species, setSpecies] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const response = await speciesService.getAll();
      if (response?.success && response.data?.length > 0) {
        setSpecies(response.data);
        setError(null);
      } else {
        setError('Unable to load species data');
      }
    } catch {
      setError('Failed to connect to database. Check API URL and Wi‑Fi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (species.length === 0) return undefined;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % species.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [species.length]);

  const handleStartBreeding = () => {
    if (user) navigation.navigate('Breed');
    else openLogin();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.muted}>Loading beautiful lovebirds...</Text>
      </View>
    );
  }

  if (error || species.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>Unable to Load Data</Text>
        <Text style={styles.muted}>{error || 'No species data available'}</Text>
        <Pressable style={styles.cta} onPress={load}>
          <Text style={styles.ctaText}>Try Again</Text>
        </Pressable>
      </View>
    );
  }

  const current = species[currentSlide];
  const birdImage = resolveSpeciesImage(current.image_src);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.brand}>Agapora</Text>
      <Text style={styles.subtitle}>Scientific Lovebird Breeding Platform</Text>
      <Text style={styles.body}>
        Welcome to Agapora – predict pair compatibility using rule-based genetic inheritance
        and get predictions for six lovebird chicks.
      </Text>

      <Pressable style={styles.cta} onPress={handleStartBreeding}>
        <Text style={styles.ctaText}>Start Breeding Now</Text>
      </Pressable>

      <View
        style={[
          styles.card,
          { backgroundColor: current.gradient_from || colors.primary },
        ]}
      >
        {birdImage ? (
          <Image
            source={birdImage}
            style={styles.birdImage}
            resizeMode="contain"
          />
        ) : null}
        <Text style={styles.birdName}>{current.name}</Text>
        <Text style={styles.scientific}>{current.scientific_name}</Text>
        <Text style={styles.desc}>{current.description}</Text>

        <View style={styles.navRow}>
          <Pressable
            onPress={() =>
              setCurrentSlide((prev) => (prev - 1 + species.length) % species.length)
            }
          >
            <Text style={styles.arrow}>‹</Text>
          </Pressable>
          <View style={styles.dots}>
            {species.map((_, i) => (
              <View key={i} style={[styles.dot, i === currentSlide && styles.dotActive]} />
            ))}
          </View>
          <Pressable onPress={() => setCurrentSlide((prev) => (prev + 1) % species.length)}>
            <Text style={styles.arrow}>›</Text>
          </Pressable>
        </View>
      </View>

      <Pressable style={styles.secondary} onPress={() => navigation.navigate('More', { screen: 'About' })}>
        <Text style={[styles.secondaryText, { color: current.gradient_from || colors.primary }]}>
          Learn about lovebirds →
        </Text>
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg,
    padding: spacing.lg,
  },
  brand: {
    fontSize: 40,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  body: { color: colors.text, lineHeight: 22, marginBottom: spacing.lg },
  cta: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  ctaText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  card: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    minHeight: 320,
  },
  birdImage: {
    width: width - 80,
    height: 180,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  birdName: { fontSize: 24, fontWeight: '800', color: '#fff' },
  scientific: {
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.85)',
    marginBottom: spacing.sm,
  },
  desc: { color: 'rgba(255,255,255,0.95)', lineHeight: 20 },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  arrow: { color: '#fff', fontSize: 36, paddingHorizontal: 8 },
  dots: { flexDirection: 'row', gap: 6 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  dotActive: { backgroundColor: '#fff' },
  secondary: {
    marginTop: spacing.md,
    alignSelf: 'center',
    padding: spacing.sm,
  },
  secondaryText: { fontWeight: '700' },
  muted: { color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm },
  errorTitle: { fontSize: 20, fontWeight: '700', color: colors.text },
});

export default HomeScreen;
