// ============================================
// PREMIUM SCREEN — Écran d'upgrade premium
// ============================================

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius } from '../theme/colors';
import {
  PREMIUM_PLANS,
  FEATURE_LABELS,
  activatePremium,
  PremiumFeature,
} from '../services/premiumService';

const { width } = Dimensions.get('window');

const crossAlert = (title: string, message: string) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

export const PremiumScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly' | 'lifetime'>('yearly');
  const [isLoading, setIsLoading] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const crownBounce = useRef(new Animated.Value(0)).current;
  const crownScale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      Animated.spring(crownScale, { toValue: 1, friction: 4, tension: 80, useNativeDriver: true }),
    ]).start();

    // Crown bounce
    Animated.loop(
      Animated.sequence([
        Animated.timing(crownBounce, { toValue: -8, duration: 1200, useNativeDriver: true }),
        Animated.timing(crownBounce, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handlePurchase = async () => {
    setIsLoading(true);
    try {
      // TODO: Intégrer RevenueCat / In-App Purchase ici
      // Pour l'instant, simulation
      const success = await activatePremium(selectedPlan);
      if (success) {
        crossAlert(
          '🎉 Bienvenue Premium !',
          'Votre abonnement est activé. Profitez de toutes les fonctionnalités !'
        );
        navigation.goBack();
      }
    } catch (e) {
      crossAlert('Erreur', 'Impossible de traiter le paiement. Réessayez.');
    } finally {
      setIsLoading(false);
    }
  };

  const plan = PREMIUM_PLANS[selectedPlan];

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => navigation.goBack()}
          >
            <Feather name="x" size={24} color={colors.textPrimary} />
          </TouchableOpacity>

          {/* Crown icon */}
          <Animated.View style={[
            styles.crownContainer,
            {
              transform: [
                { translateY: crownBounce },
                { scale: crownScale },
              ],
            },
          ]}>
            <LinearGradient
              colors={['#FFD700', '#FFA500', '#FF8C00']}
              style={styles.crownGradient}
            >
              <Text style={styles.crownEmoji}>👑</Text>
            </LinearGradient>
          </Animated.View>

          <Animated.View style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}>
            <Text style={styles.title}>Savoirs de Grand-Mère</Text>
            <Text style={styles.titlePremium}>Premium</Text>
            <Text style={styles.subtitle}>
              Débloquez tout le potentiel des remèdes naturels
            </Text>

            {/* Features */}
            <View style={styles.featuresContainer}>
              {Object.entries(FEATURE_LABELS).map(([key, { label, icon }]) => (
                <View key={key} style={styles.featureRow}>
                  <Text style={styles.featureIcon}>{icon}</Text>
                  <Text style={styles.featureLabel}>{label}</Text>
                  <Feather
                    name="check"
                    size={16}
                    color={plan.features.includes(key as PremiumFeature) ? '#34D399' : colors.textMuted}
                  />
                </View>
              ))}
            </View>

            {/* Plans */}
            <Text style={styles.plansTitle}>Choisissez votre plan</Text>

            <View style={styles.plansContainer}>
              {Object.entries(PREMIUM_PLANS).map(([key, planDef]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.planCard,
                    selectedPlan === key && styles.planCardSelected,
                    planDef.popular && styles.planCardPopular,
                  ]}
                  onPress={() => setSelectedPlan(key as any)}
                  activeOpacity={0.8}
                >
                  {planDef.popular && (
                    <View style={styles.popularBadge}>
                      <Text style={styles.popularBadgeText}>Populaire</Text>
                    </View>
                  )}

                  <View style={styles.planRadio}>
                    {selectedPlan === key && (
                      <View style={styles.planRadioInner} />
                    )}
                  </View>

                  <View style={styles.planInfo}>
                    <Text style={[
                      styles.planName,
                      selectedPlan === key && styles.planNameSelected,
                    ]}>
                      {planDef.name}
                    </Text>
                    <Text style={styles.planPeriod}>{planDef.period}</Text>
                  </View>

                  <View style={styles.planPriceContainer}>
                    <Text style={[
                      styles.planPrice,
                      selectedPlan === key && styles.planPriceSelected,
                    ]}>
                      {planDef.price}
                    </Text>
                    {'savings' in planDef && planDef.savings && (
                      <View style={styles.savingsBadge}>
                        <Text style={styles.savingsText}>-{planDef.savings}</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* CTA */}
            <TouchableOpacity
              style={[styles.ctaBtn, isLoading && { opacity: 0.6 }]}
              onPress={handlePurchase}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#FFD700', '#FFA500', '#FF8C00']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaGradient}
              >
                <Feather name="star" size={18} color="#000" />
                <Text style={styles.ctaText}>
                  {isLoading ? 'Traitement...' : `Débloquer Premium — ${plan.price}`}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Legal */}
            <Text style={styles.legalText}>
              L'abonnement sera facturé sur votre compte. Il se renouvelle automatiquement sauf si désactivé 24h avant la fin de la période. Conditions d'utilisation et politique de confidentialité.
            </Text>

            {/* Restore */}
            <TouchableOpacity style={styles.restoreBtn}>
              <Text style={styles.restoreText}>Restaurer un achat</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 40,
    alignItems: 'center',
  },
  closeBtn: {
    alignSelf: 'flex-end',
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  crownContainer: {
    marginBottom: spacing.lg,
  },
  crownGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crownEmoji: {
    fontSize: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  titlePremium: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  featuresContainer: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  featureIcon: {
    fontSize: 18,
    width: 28,
    textAlign: 'center',
  },
  featureLabel: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  plansTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
    alignSelf: 'flex-start',
  },
  plansContainer: {
    width: '100%',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  planCardSelected: {
    borderColor: '#FFD700',
    backgroundColor: 'rgba(255, 215, 0, 0.05)',
  },
  planCardPopular: {},
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: 12,
    backgroundColor: '#FFD700',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  popularBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000',
  },
  planRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  planRadioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFD700',
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  planNameSelected: {
    color: '#FFD700',
  },
  planPeriod: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  planPriceContainer: {
    alignItems: 'flex-end',
  },
  planPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  planPriceSelected: {
    color: '#FFD700',
  },
  savingsBadge: {
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  savingsText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#34D399',
  },
  ctaBtn: {
    width: '100%',
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  legalText: {
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 15,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  restoreBtn: {
    padding: spacing.sm,
  },
  restoreText: {
    fontSize: 13,
    color: colors.accentPrimary,
    fontWeight: '500',
  },
});
