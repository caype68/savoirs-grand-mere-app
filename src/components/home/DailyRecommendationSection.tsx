// ============================================
// SECTION RECOMMANDATION DU JOUR
// Grand-mère intégrée dans le design UI
// ============================================

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../theme/colors';
import { useDailyRecommendation } from '../../hooks/useWellness';
import { logo } from '../../assets';

// ============================================
// PROPS
// ============================================

interface DailyRecommendationSectionProps {
  onViewRemedy: (remedyId: string) => void;
  onFillWellnessLog?: () => void;
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export const DailyRecommendationSection: React.FC<DailyRecommendationSectionProps> = ({
  onViewRemedy,
  onFillWellnessLog,
}) => {
  const { recommendation, isLoading, source } = useDailyRecommendation();

  // Animations
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(20)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const logoPulse = useRef(new Animated.Value(1)).current;
  const contentFade = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (recommendation || !isLoading) {
      Animated.sequence([
        // 1. Carte apparaît
        Animated.parallel([
          Animated.timing(fadeIn, {
            toValue: 1,
            duration: 500,
            useNativeDriver: false,
          }),
          Animated.timing(slideUp, {
            toValue: 0,
            duration: 500,
            easing: Easing.out(Easing.back(1.1)),
            useNativeDriver: false,
          }),
        ]),
        // 2. Logo pop
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 4,
          tension: 80,
          useNativeDriver: false,
        }),
        // 3. Contenu texte fade in
        Animated.timing(contentFade, {
          toValue: 1,
          duration: 400,
          useNativeDriver: false,
        }),
      ]).start();

      // Glow pulse continu
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
        ])
      ).start();
    }
  }, [recommendation, isLoading]);

  // Breathing logo continu
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoPulse, {
          toValue: 1.06,
          duration: 2500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(logoPulse, {
          toValue: 1,
          duration: 2500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  // ─── Chargement ───
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.loadingInner}>
            <Animated.View style={[styles.avatarWrap, { transform: [{ scale: logoPulse }] }]}>
              <Image source={logo} style={styles.avatarImg} resizeMode="contain" />
            </Animated.View>
            <Text style={styles.loadingText}>Grand-mère cherche un remède...</Text>
            <ActivityIndicator size="small" color={colors.accentPrimary} />
          </View>
        </View>
      </View>
    );
  }

  // ─── Pas de recommandation ───
  if (!recommendation) {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.card}
          onPress={onFillWellnessLog}
          activeOpacity={0.85}
        >
          <View style={styles.emptyInner}>
            <Animated.View style={[styles.avatarWrap, { transform: [{ scale: logoPulse }] }]}>
              <Image source={logo} style={styles.avatarImg} resizeMode="contain" />
              <View style={styles.avatarBadgeEmpty}>
                <Feather name="message-circle" size={12} color="#fff" />
              </View>
            </Animated.View>
            <View style={styles.emptyTextBlock}>
              <Text style={styles.emptyTitle}>Comment allez-vous ?</Text>
              <Text style={styles.emptySubtitle}>
                Remplissez votre journal pour un conseil personnalisé
              </Text>
            </View>
            <View style={styles.emptyArrow}>
              <Feather name="chevron-right" size={20} color={colors.textMuted} />
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── Recommandation ───
  const catColor = getCategoryColor(recommendation.category);
  const catColorDark = getCategoryColorDark(recommendation.category);

  return (
    <Animated.View style={[styles.container, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>
      <TouchableOpacity
        style={styles.card}
        onPress={() => onViewRemedy(recommendation.remedyId)}
        activeOpacity={0.9}
      >
        {/* Glow derrière la carte */}
        <Animated.View style={[styles.cardGlow, { backgroundColor: catColor, opacity: glowOpacity }]} />

        <View style={styles.cardInner}>
          {/* Row : avatar + texte */}
          <View style={styles.topRow}>
            <Animated.View style={[styles.avatarWrap, { transform: [{ scale: logoScale }] }]}>
              <Image source={logo} style={styles.avatarImg} resizeMode="contain" />
              <View style={[styles.avatarBadge, { backgroundColor: catColor }]}>
                <Text style={styles.avatarBadgeEmoji}>{getCategoryEmoji(recommendation.category)}</Text>
              </View>
            </Animated.View>

            <Animated.View style={[styles.textBlock, { opacity: contentFade }]}>
              <View style={styles.nameRow}>
                <Text style={styles.label}>Conseil de Grand-mère</Text>
                {source === 'remote' ? (
                  <Feather name="cloud" size={10} color={colors.textMuted} />
                ) : (
                  <View />
                )}
              </View>
              <Text style={styles.remedyName} numberOfLines={1}>{recommendation.remedyName}</Text>
            </Animated.View>
          </View>

          {/* Bandeau catégorie + raison */}
          <Animated.View style={[styles.reasonBlock, { opacity: contentFade }]}>
            <LinearGradient
              colors={[catColor + '25', catColorDark + '10']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.reasonGradient}
            >
              <View style={[styles.catDot, { backgroundColor: catColor }]} />
              <Text style={styles.reasonText} numberOfLines={2}>{recommendation.reason}</Text>
            </LinearGradient>
          </Animated.View>

          {/* Bottom : tags + bouton */}
          <Animated.View style={[styles.bottomRow, { opacity: contentFade }]}>
            <View style={styles.tagsWrap}>
              {recommendation.matchedTags.length > 0 ? (
                recommendation.matchedTags.slice(0, 3).map((tag, i) => (
                  <View key={`tag-${i}`} style={[styles.tag, { borderColor: catColor + '40' }]}>
                    <Text style={[styles.tagText, { color: catColor }]}>{tag}</Text>
                  </View>
                ))
              ) : (
                <View />
              )}
            </View>
            <View style={[styles.viewBtn, { backgroundColor: catColor }]}>
              <Text style={styles.viewBtnText}>Voir</Text>
              <Feather name="arrow-right" size={13} color="#fff" />
            </View>
          </Animated.View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ============================================
// HELPERS
// ============================================

function getCategoryColor(c: string): string {
  const m: Record<string, string> = {
    sommeil: '#6B7FD7', stress: '#C084FC', energie: '#F59E0B',
    humeur: '#F5B041', digestion: '#34D399', respiration: '#38BDF8',
    immunite: '#4ADE80', detente: '#A78BFA', concentration: '#38BDF8',
    douleurs: '#FB7185', bien_etre_general: '#60A5FA',
  };
  return m[c] || '#60A5FA';
}

function getCategoryColorDark(c: string): string {
  const m: Record<string, string> = {
    sommeil: '#4A5BA8', stress: '#9333EA', energie: '#D97706',
    humeur: '#D68910', digestion: '#059669', respiration: '#0284C7',
    immunite: '#16A34A', detente: '#7C3AED', concentration: '#0369A1',
    douleurs: '#E11D48', bien_etre_general: '#2563EB',
  };
  return m[c] || '#2563EB';
}

function getCategoryEmoji(c: string): string {
  const m: Record<string, string> = {
    sommeil: '😴', stress: '🧘', energie: '⚡', humeur: '😊',
    digestion: '🍃', respiration: '💨', immunite: '🛡️', detente: '🌸',
    concentration: '🧠', douleurs: '💆', bien_etre_general: '🌿',
  };
  return m[c] || '🌿';
}

function getCategoryLabel(c: string): string {
  const m: Record<string, string> = {
    sommeil: 'Sommeil', stress: 'Anti-stress', energie: 'Énergie',
    humeur: 'Humeur', digestion: 'Digestion', respiration: 'Respiration',
    immunite: 'Immunité', detente: 'Détente', concentration: 'Concentration',
    douleurs: 'Douleurs', bien_etre_general: 'Bien-être',
  };
  return m[c] || 'Bien-être';
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },

  // Carte principale
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
  },
  cardGlow: {
    position: 'absolute',
    top: -1,
    left: 0,
    right: 0,
    height: 3,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
  },
  cardInner: {
    padding: spacing.md,
  },

  // Top row : avatar + nom
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  avatarWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceHighlight,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImg: {
    width: 48,
    height: 48,
  },
  avatarBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  avatarBadgeEmoji: {
    fontSize: 10,
  },
  avatarBadgeEmpty: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.accentPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },

  textBlock: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  remedyName: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 2,
  },

  // Raison
  reasonBlock: {
    marginBottom: spacing.sm,
  },
  reasonGradient: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  catDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 5,
  },
  reasonText: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },

  // Bottom row
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    flex: 1,
  },
  tag: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '500',
  },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
    marginLeft: spacing.sm,
  },
  viewBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },

  // Loading
  loadingInner: {
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  loadingText: {
    color: colors.textMuted,
    fontSize: 13,
    fontStyle: 'italic',
  },

  // Empty state
  emptyInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  emptyTextBlock: {
    flex: 1,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  emptySubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 16,
  },
  emptyArrow: {
    padding: spacing.xs,
  },
});

export default DailyRecommendationSection;
