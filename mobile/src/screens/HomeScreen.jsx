import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  ScrollView,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { speciesService } from '../api/speciesService';
import { resolveSpeciesImage } from '../utils/speciesImages';
import { colors } from '../theme';
import styles from './HomeScreen.styles';

const HomeScreen = () => {
  const navigation = useNavigation();
  const { user, openLogin } = useAuth();
  const [species, setSpecies] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [learnHover, setLearnHover] = useState(false);
  const floatAnim = useRef(new Animated.Value(0)).current;

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

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [floatAnim]);

  const handleStartBreeding = () => {
    if (user) navigation.navigate('Breed');
    else openLogin();
  };

  const handleLearnMore = () => {
    navigation.navigate('More', { screen: 'About' });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading beautiful lovebirds...</Text>
      </View>
    );
  }

  if (error || species.length === 0) {
    return (
      <View style={styles.center}>
        <View style={styles.errorCard}>
          <Text style={styles.errorIcon}>🐦</Text>
          <Text style={styles.errorTitle}>Unable to Load Data</Text>
          <Text style={styles.muted}>{error || 'No species data available'}</Text>
          <Pressable style={styles.retry} onPress={load}>
            <Text style={styles.retryText}>Try Again</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const current = species[currentSlide];
  const birdImage = resolveSpeciesImage(current.image_src, current.name);
  const gradientFrom = current.gradient_from || colors.primary;
  const gradientTo = current.gradient_to || colors.primaryHover;
  const floatY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.textColumn}>
        <Text style={styles.brand}>Agapora</Text>
        <Text style={styles.subtitle}>Scientific Lovebird Breeding Platform</Text>

        <View style={styles.infoWrap}>
          <Text style={styles.infoText}>
            Welcome to Agapora – a cutting-edge platform designed to help lovebird breeders
            predict pair compatibility using rule-based genetic inheritance.
          </Text>
          <Text style={styles.infoText}>
            Our algorithm analyzes genetic data to guide breeders in selecting optimal pairs
            and provides RBGIA/GICA pair compatibility with species-based reproductive forecasts.
          </Text>
          <Text style={[styles.infoText, styles.infoHighlight]}>
            By replacing guesswork with science, Agapora ensures a reliable and consistent
            breeding process.
          </Text>
        </View>

        <Pressable style={styles.cta} onPress={handleStartBreeding}>
          <Text style={styles.ctaText}>Start Breeding Now</Text>
        </Pressable>
      </View>

      <View style={styles.carousel}>
        <LinearGradient
          colors={[gradientFrom, gradientTo]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.birdCard}
        >
          <View style={styles.birdImageWrap}>
            {birdImage ? (
              <Animated.Image
                source={birdImage}
                style={[styles.birdImage, { transform: [{ translateY: floatY }] }]}
                resizeMode="contain"
              />
            ) : (
              <Text style={styles.imageFallback}>No image</Text>
            )}
          </View>

          <View style={styles.birdInfo}>
            <Text style={styles.birdName}>{current.name}</Text>
            <Text style={styles.scientific}>{current.scientific_name}</Text>
            <Text style={styles.desc}>{current.description}</Text>
          </View>

          {species.length > 1 && (
            <>
              <Pressable
                style={styles.arrowPrev}
                onPress={() =>
                  setCurrentSlide((prev) => (prev - 1 + species.length) % species.length)
                }
              >
                <Text style={styles.arrowText}>‹</Text>
              </Pressable>
              <Pressable
                style={styles.arrowNext}
                onPress={() => setCurrentSlide((prev) => (prev + 1) % species.length)}
              >
                <Text style={styles.arrowText}>›</Text>
              </Pressable>
              <View style={styles.dots}>
                {species.map((_, i) => (
                  <Pressable
                    key={i}
                    style={[styles.dot, i === currentSlide && styles.dotActive]}
                    onPress={() => setCurrentSlide(i)}
                  />
                ))}
              </View>
            </>
          )}
        </LinearGradient>

        <View style={styles.learnMoreWrap}>
          <Pressable
            style={[
              styles.learnMore,
              {
                borderColor: gradientFrom,
                backgroundColor: learnHover ? gradientFrom : 'transparent',
              },
            ]}
            onPress={handleLearnMore}
            onPressIn={() => setLearnHover(true)}
            onPressOut={() => setLearnHover(false)}
          >
            <Text
              style={[
                styles.learnMoreText,
                { color: learnHover ? '#fff' : gradientFrom },
              ]}
            >
              Learn about lovebirds →
            </Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
};

export default HomeScreen;
