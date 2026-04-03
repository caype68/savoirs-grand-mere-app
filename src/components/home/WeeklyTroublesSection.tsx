// ============================================
// SECTION TROUBLES DE LA SEMAINE
// Affiche les symptômes/troubles logués cette semaine
// avec le même DA que le conseil de grand-mère
// ============================================

import React, { useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Easing,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../theme/colors';
import { useWellnessHistory } from '../../hooks/useWellness';
import { logo } from '../../assets';

// ============================================
// TYPES
// ============================================

interface TroubleItem {
  label: string;
  emoji: string;
  type: 'low_score' | 'symptom';
  value?: number;
  count?: number;
  color: string;
  searchTerm: string;
}

// ============================================
// PROPS
// ============================================

interface WeeklyTroublesSectionProps {
  onSearchTrouble: (searchTerm: string) => void;
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export const WeeklyTroublesSection: React.FC<WeeklyTroublesSectionProps> = ({
  onSearchTrouble,
}) => {
  const { history, isLoading } = useWellnessHistory(7);

  // Animations
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(15)).current;

  // Analyser les troubles de la semaine
  const troubles = useMemo(() => {
    if (!history || history.length === 0) return [];

    const items: TroubleItem[] = [];
    const count = history.length;

    // 1. Moyennes faibles (< 3/5)
    const avgSommeil = history.reduce((s, l) => s + (l.sommeil?.qualite || 0), 0) / count;
    const avgStress = history.reduce((s, l) => s + (l.stress || 0), 0) / count;
    const avgHumeur = history.reduce((s, l) => s + (l.humeur || 0), 0) / count;
    const avgEnergie = history.reduce((s, l) => s + (l.energie || 0), 0) / count;

    if (avgSommeil > 0 && avgSommeil < 3) {
      items.push({
        label: 'Sommeil difficile',
        emoji: '😴',
        type: 'low_score',
        value: Math.round(avgSommeil * 10) / 10,
        color: '#6B7FD7',
        searchTerm: 'sommeil',
      });
    }
    // Stress inversé : haut = mauvais (1=calme, 5=très stressé) → > 3 = problème
    if (avgStress > 3) {
      items.push({
        label: 'Stress élevé',
        emoji: '😰',
        type: 'low_score',
        value: Math.round(avgStress * 10) / 10,
        color: '#C084FC',
        searchTerm: 'stress',
      });
    }
    if (avgHumeur > 0 && avgHumeur < 3) {
      items.push({
        label: 'Humeur basse',
        emoji: '😔',
        type: 'low_score',
        value: Math.round(avgHumeur * 10) / 10,
        color: '#F59E0B',
        searchTerm: 'stress',
      });
    }
    if (avgEnergie > 0 && avgEnergie < 3) {
      items.push({
        label: 'Fatigue',
        emoji: '🔋',
        type: 'low_score',
        value: Math.round(avgEnergie * 10) / 10,
        color: '#FB7185',
        searchTerm: 'sommeil',
      });
    }

    // 2. Symptômes récurrents
    const symptomCount: Record<string, number> = {};
    history.forEach((log) => {
      (log.symptomes || []).forEach((s: string) => {
        symptomCount[s] = (symptomCount[s] || 0) + 1;
      });
    });

    const symptomEmojis: Record<string, string> = {
      'Fatigue': '😩', 'Maux de tête': '🤕', 'Mal de gorge': '🤧',
      'Toux': '😷', 'Nez bouché': '🤧', 'Douleurs musculaires': '💪',
      'Ballonnements': '🫄', 'Nausées': '🤢', 'Insomnie': '🌙',
      'Anxiété': '😟', 'Irritabilité': '😤', 'Douleurs articulaires': '🦴',
    };

    const symptomSearchTerms: Record<string, string> = {
      'Fatigue': 'sommeil', 'Maux de tête': 'tête', 'Mal de gorge': 'gorge',
      'Toux': 'toux', 'Nez bouché': 'rhume', 'Douleurs musculaires': 'douleur',
      'Ballonnements': 'digestion', 'Nausées': 'digestion', 'Insomnie': 'sommeil',
      'Anxiété': 'stress', 'Irritabilité': 'stress', 'Douleurs articulaires': 'douleur',
    };

    const symptomColors: Record<string, string> = {
      'Fatigue': '#FB7185', 'Maux de tête': '#F59E0B', 'Mal de gorge': '#38BDF8',
      'Toux': '#38BDF8', 'Nez bouché': '#38BDF8', 'Douleurs musculaires': '#F97316',
      'Ballonnements': '#34D399', 'Nausées': '#34D399', 'Insomnie': '#6B7FD7',
      'Anxiété': '#C084FC', 'Irritabilité': '#C084FC', 'Douleurs articulaires': '#F97316',
    };

    // Trier par fréquence
    Object.entries(symptomCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .forEach(([symptom, cnt]) => {
        items.push({
          label: symptom,
          emoji: symptomEmojis[symptom] || '🩹',
          type: 'symptom',
          count: cnt,
          color: symptomColors[symptom] || '#60A5FA',
          searchTerm: symptomSearchTerms[symptom] || symptom.toLowerCase(),
        });
      });

    return items.slice(0, 6); // Max 6 troubles
  }, [history]);

  useEffect(() => {
    if (troubles.length > 0) {
      Animated.parallel([
        Animated.timing(fadeIn, {
          toValue: 1,
          duration: 500,
          useNativeDriver: false,
        }),
        Animated.timing(slideUp, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.back(1.05)),
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [troubles.length]);

  // Ne rien afficher si pas de données ou pas de troubles
  if (isLoading || troubles.length === 0) {
    return null;
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>
      {/* Carte principale — même DA que conseil de grand-mère */}
      <View style={styles.card}>
        {/* Header avec avatar */}
        <View style={styles.headerRow}>
          <View style={styles.avatarWrap}>
            <Image source={logo} style={styles.avatarImg} resizeMode="contain" />
            <View style={styles.avatarBadge}>
              <Text style={styles.avatarBadgeEmoji}>🩺</Text>
            </View>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.headerLabel}>BILAN DE LA SEMAINE</Text>
            <Text style={styles.headerTitle}>Vos troubles récents</Text>
          </View>
          <View style={styles.weekBadge}>
            <Text style={styles.weekBadgeText}>{`${history.length}j`}</Text>
          </View>
        </View>

        {/* Grille de troubles */}
        <View style={styles.troublesGrid}>
          {troubles.map((trouble, index) => (
            <TouchableOpacity
              key={`trouble-${index}`}
              style={styles.troubleItem}
              activeOpacity={0.8}
              onPress={() => onSearchTrouble(trouble.searchTerm)}
            >
              <View style={[styles.troubleDot, { backgroundColor: trouble.color }]} />
              <View style={styles.troubleContent}>
                <View style={styles.troubleTop}>
                  <Text style={styles.troubleEmoji}>{trouble.emoji}</Text>
                  <Text style={styles.troubleLabel} numberOfLines={1}>{trouble.label}</Text>
                </View>
                {trouble.type === 'low_score' ? (
                  <View style={styles.troubleScoreRow}>
                    <View style={styles.troubleBarTrack}>
                      <View style={[styles.troubleBarFill, { flex: trouble.value || 0, backgroundColor: trouble.color }]} />
                      <View style={{ flex: 5 - (trouble.value || 0) }} />
                    </View>
                    <Text style={[styles.troubleValue, { color: trouble.color }]}>{`${trouble.value}/5`}</Text>
                  </View>
                ) : (
                  <Text style={styles.troubleCount}>{`${trouble.count}x cette semaine`}</Text>
                )}
              </View>
              <Feather name="search" size={14} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer - conseil */}
        <View style={styles.footerTip}>
          <Feather name="info" size={12} color={colors.textMuted} />
          <Text style={styles.footerText}>Appuyez sur un trouble pour trouver un remède</Text>
        </View>
      </View>
    </Animated.View>
  );
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },

  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },

  // Header
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatarWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceHighlight,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImg: {
    width: 40,
    height: 40,
  },
  avatarBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  avatarBadgeEmoji: {
    fontSize: 8,
  },
  headerText: {
    flex: 1,
  },
  headerLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 1,
  },
  weekBadge: {
    backgroundColor: colors.surfaceHighlight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  weekBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
  },

  // Troubles grid
  troublesGrid: {
    gap: 2,
  },
  troubleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    gap: spacing.sm,
    borderRadius: borderRadius.md,
  },
  troubleDot: {
    width: 4,
    height: 32,
    borderRadius: 2,
  },
  troubleContent: {
    flex: 1,
  },
  troubleTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  troubleEmoji: {
    fontSize: 14,
  },
  troubleLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  troubleScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  troubleBarTrack: {
    flex: 1,
    height: 4,
    backgroundColor: colors.surfaceHighlight,
    borderRadius: 2,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  troubleBarFill: {
    height: 4,
    borderRadius: 2,
  },
  troubleValue: {
    fontSize: 11,
    fontWeight: '600',
    width: 28,
    textAlign: 'right',
  },
  troubleCount: {
    fontSize: 11,
    color: colors.textMuted,
  },

  // Footer
  footerTip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerText: {
    fontSize: 11,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
});

export default WeeklyTroublesSection;
