// ============================================
// ÉCRAN D'INTRODUCTION UNIQUE - PREMIUM
// Savoirs de Grand-Mère
// ============================================

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Animated,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, typography, shadows } from '../theme/colors';
import { logo } from '../assets';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingScreenProps {
  onComplete: () => void;
}

// Points forts de l'application
const FEATURES = [
  { icon: 'book-open' as const, text: 'Sources issues de livres numérisés' },
  { icon: 'search' as const, text: 'Recherche intelligente' },
  { icon: 'shield' as const, text: 'Approche informative et responsable' },
];

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const contentSlide = useRef(new Animated.Value(30)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animation d'entrée séquentielle
    Animated.sequence([
      // Logo apparaît en premier
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      // Puis le contenu glisse
      Animated.timing(contentSlide, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[colors.background, '#0D0D12', colors.background]}
        style={styles.gradient}
      >
        {/* Contenu principal */}
        <View style={styles.content}>
          {/* Logo avec halo */}
          <Animated.View
            style={[
              styles.logoContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: logoScale }],
              },
            ]}
          >
            <View style={styles.logoHalo}>
              <View style={styles.logoInner}>
                <Image source={logo} style={styles.logoImage} />
              </View>
            </View>
          </Animated.View>

          {/* Titre et sous-titre */}
          <Animated.View
            style={[
              styles.titleContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: contentSlide }],
              },
            ]}
          >
            <Text style={styles.title}>Savoirs de Grand-Mère</Text>
            <Text style={styles.subtitle}>Remèdes traditionnels & naturels</Text>
          </Animated.View>

          {/* Description */}
          <Animated.View
            style={[
              styles.descriptionContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: contentSlide }],
              },
            ]}
          >
            <Text style={styles.description}>
              Découvrez des remèdes traditionnels issus de savoirs anciens, organisés dans une application moderne pour rechercher facilement par symptôme, usage ou ingrédient.
            </Text>
          </Animated.View>

          {/* Points forts */}
          <Animated.View
            style={[
              styles.featuresContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: contentSlide }],
              },
            ]}
          >
            {FEATURES.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={styles.featureIconContainer}>
                  <Feather name={feature.icon} size={16} color={colors.accentPrimary} />
                </View>
                <Text style={styles.featureText}>{feature.text}</Text>
              </View>
            ))}
          </Animated.View>
        </View>

        {/* Footer */}
        <Animated.View
          style={[
            styles.footer,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          {/* Disclaimer */}
          <View style={styles.disclaimerContainer}>
            <Feather name="info" size={14} color={colors.textMuted} />
            <Text style={styles.disclaimerText}>
              Les informations présentées sont documentaires et ne remplacent pas un avis médical.
            </Text>
          </View>

          {/* Bouton principal */}
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={onComplete}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
            >
              <Text style={styles.primaryButtonText}>Commencer</Text>
              <Feather name="arrow-right" size={20} color={colors.background} />
            </Pressable>
          </Animated.View>
        </Animated.View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  gradient: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: spacing.xxl,
  },
  logoHalo: {
    padding: 8,
    borderRadius: 80,
    backgroundColor: 'rgba(120, 166, 134, 0.08)',
  },
  logoInner: {
    padding: 4,
    borderRadius: 70,
    backgroundColor: 'rgba(120, 166, 134, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(120, 166, 134, 0.2)',
  },
  logoImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.accentPrimary,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  descriptionContainer: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xxl,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  featuresContainer: {
    width: '100%',
    gap: spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  featureIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accentPrimaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  footer: {
    gap: spacing.lg,
  },
  disclaimerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textMuted,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentPrimary,
    paddingVertical: spacing.lg + 4,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.xl,
    gap: spacing.sm,
    ...Platform.select({
      web: { boxShadow: '0px 4px 12px rgba(120, 166, 134, 0.3)' },
      default: {
        shadowColor: colors.accentPrimary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
      },
    }),
  },
  buttonPressed: {
    opacity: 0.95,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.background,
    letterSpacing: 0.3,
  },
});
