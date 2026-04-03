// ============================================
// COMPOSANT AD BANNER
// Bannière publicitaire pour les utilisateurs free
// Prêt pour intégration AdMob / RevenueCat
// ============================================

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Linking,
  Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius } from '../theme/colors';
import { getPremiumStatus, PremiumStatus } from '../services/premiumService';

// ============================================
// TYPES
// ============================================

interface AdBannerProps {
  placement?: 'home' | 'detail' | 'search' | 'explore';
  style?: any;
  onUpgradePress?: () => void;
}

// ============================================
// PROMOTIONS INTERNES (remplace les pubs avant AdMob)
// ============================================

const INTERNAL_ADS = [
  {
    id: 'premium-1',
    title: '🌿 Passez à Premium',
    subtitle: 'Accédez aux huiles essentielles et routines avancées',
    cta: 'En savoir plus',
    gradient: ['#78A686', '#5F8770'] as [string, string],
    type: 'premium' as const,
  },
  {
    id: 'tip-1',
    title: '💡 Le saviez-vous ?',
    subtitle: 'La camomille est utilisée depuis l\'Antiquité pour le sommeil',
    cta: 'Découvrir',
    gradient: ['#818CF8', '#6366F1'] as [string, string],
    type: 'tip' as const,
  },
  {
    id: 'tip-2',
    title: '🍯 Astuce de Grand-Mère',
    subtitle: 'Le miel et le citron : le duo parfait contre le mal de gorge',
    cta: 'Voir le remède',
    gradient: ['#D97706', '#B45309'] as [string, string],
    type: 'tip' as const,
  },
  {
    id: 'premium-2',
    title: '✨ Sans publicités',
    subtitle: 'Profitez de l\'app sans interruption dès 2,99€/mois',
    cta: 'Supprimer les pubs',
    gradient: ['#C49B61', '#9B7748'] as [string, string],
    type: 'premium' as const,
  },
  {
    id: 'tip-3',
    title: '🌱 Conseil du jour',
    subtitle: 'Buvez une tisane de thym chaque matin pour booster votre immunité',
    cta: 'Plus de conseils',
    gradient: ['#34D399', '#059669'] as [string, string],
    type: 'tip' as const,
  },
];

// ============================================
// COMPOSANT
// ============================================

export const AdBanner: React.FC<AdBannerProps> = ({
  placement = 'home',
  style,
  onUpgradePress,
}) => {
  const [premiumStatus, setPremiumStatus] = useState<PremiumStatus | null>(null);
  const [currentAd, setCurrentAd] = useState(INTERNAL_ADS[0]);
  const [dismissed, setDismissed] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    loadPremium();
    // Rotation des pubs
    const randomIndex = Math.floor(Math.random() * INTERNAL_ADS.length);
    setCurrentAd(INTERNAL_ADS[randomIndex]);

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const loadPremium = async () => {
    const status = await getPremiumStatus();
    setPremiumStatus(status);
  };

  // Ne pas afficher si premium ou dismissed
  if (premiumStatus?.isPremium || dismissed) return null;

  const handlePress = () => {
    if (currentAd.type === 'premium' && onUpgradePress) {
      onUpgradePress();
    }
  };

  const handleDismiss = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setDismissed(true));
  };

  return (
    <Animated.View
      style={[
        styles.container,
        style,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.adCard}
        onPress={handlePress}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={currentAd.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.content}>
            <View style={styles.textContent}>
              <Text style={styles.title}>{currentAd.title}</Text>
              <Text style={styles.subtitle} numberOfLines={2}>
                {currentAd.subtitle}
              </Text>
            </View>
            <View style={styles.ctaContainer}>
              <Text style={styles.ctaText}>{currentAd.cta}</Text>
              <Feather name="chevron-right" size={14} color="#fff" />
            </View>
          </View>

          {/* Bouton fermer */}
          <TouchableOpacity
            style={styles.dismissBtn}
            onPress={handleDismiss}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="x" size={14} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>

          {/* Label pub */}
          <View style={styles.adLabel}>
            <Text style={styles.adLabelText}>Sponsorisé</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ============================================
// MINI AD (inline dans les listes)
// ============================================

interface MiniAdProps {
  onUpgradePress?: () => void;
}

export const MiniAd: React.FC<MiniAdProps> = ({ onUpgradePress }) => {
  const [premiumStatus, setPremiumStatus] = useState<PremiumStatus | null>(null);

  useEffect(() => {
    getPremiumStatus().then(setPremiumStatus);
  }, []);

  if (premiumStatus?.isPremium) return null;

  return (
    <TouchableOpacity
      style={styles.miniContainer}
      onPress={onUpgradePress}
      activeOpacity={0.8}
    >
      <View style={styles.miniIconCircle}>
        <Text style={styles.miniIcon}>✨</Text>
      </View>
      <View style={styles.miniTextContent}>
        <Text style={styles.miniTitle}>Passez à Premium</Text>
        <Text style={styles.miniSubtitle}>Sans pubs • Huiles essentielles • Routines</Text>
      </View>
      <Feather name="arrow-right" size={16} color={colors.accentPrimary} />
    </TouchableOpacity>
  );
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
  },
  adCard: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  gradient: {
    padding: spacing.lg,
    position: 'relative',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContent: {
    flex: 1,
    marginRight: spacing.md,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 17,
  },
  ctaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  ctaText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  dismissBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adLabel: {
    position: 'absolute',
    bottom: 4,
    right: 8,
  },
  adLabelText: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '500',
  },
  // Mini Ad
  miniContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderAccent,
    gap: spacing.md,
  },
  miniIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accentPrimaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniIcon: {
    fontSize: 18,
  },
  miniTextContent: {
    flex: 1,
  },
  miniTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  miniSubtitle: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
});
