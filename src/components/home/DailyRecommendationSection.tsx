// ============================================
// SECTION RECOMMANDATION DU JOUR
// Affiche le remède recommandé basé sur le wellness log
// ============================================

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../theme/colors';
import { DailyRecommendation } from '../../types';
import { useDailyRecommendation } from '../../hooks/useWellness';

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

  // État de chargement
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.sectionTitle}>🌿 VOTRE REMÈDE DU JOUR</Text>
        </View>
        <View style={styles.loadingCard}>
          <ActivityIndicator size="small" color={colors.accentPrimary} />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </View>
    );
  }

  // Pas de recommandation - inviter à remplir le journal
  if (!recommendation) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.sectionTitle}>🌿 VOTRE REMÈDE DU JOUR</Text>
        </View>
        <TouchableOpacity 
          style={styles.emptyCard}
          onPress={onFillWellnessLog}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[colors.surface, colors.surfaceHighlight]}
            style={styles.emptyGradient}
          >
            <View style={styles.emptyIcon}>
              <Feather name="edit-3" size={24} color={colors.accentPrimary} />
            </View>
            <Text style={styles.emptyTitle}>Remplissez votre journal</Text>
            <Text style={styles.emptySubtitle}>
              Pour recevoir une recommandation personnalisée
            </Text>
            <View style={styles.emptyButton}>
              <Text style={styles.emptyButtonText}>Commencer</Text>
              <Feather name="arrow-right" size={16} color={colors.accentPrimary} />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  // Afficher la recommandation
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>🌿 VOTRE REMÈDE DU JOUR</Text>
        {source === 'remote' && (
          <View style={styles.sourceBadge}>
            <Feather name="cloud" size={10} color={colors.accentSecondary} />
          </View>
        )}
      </View>
      
      <TouchableOpacity 
        style={styles.card}
        onPress={() => onViewRemedy(recommendation.remedyId)}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={[getCategoryColor(recommendation.category), getCategoryColorDark(recommendation.category)]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          {/* Badge catégorie */}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>
              {getCategoryEmoji(recommendation.category)} {getCategoryLabel(recommendation.category)}
            </Text>
          </View>

          {/* Nom du remède */}
          <Text style={styles.remedyName}>{recommendation.remedyName}</Text>

          {/* Raison */}
          <Text style={styles.reason}>{recommendation.reason}</Text>

          {/* Score de match */}
          <View style={styles.matchRow}>
            <View style={styles.matchScore}>
              <Feather name="target" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.matchText}>{recommendation.matchScore}% de pertinence</Text>
            </View>
            <View style={styles.viewButton}>
              <Text style={styles.viewButtonText}>Voir le remède</Text>
              <Feather name="chevron-right" size={16} color="#fff" />
            </View>
          </View>

          {/* Tags */}
          {recommendation.matchedTags.length > 0 && (
            <View style={styles.tagsRow}>
              {recommendation.matchedTags.slice(0, 3).map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

// ============================================
// HELPERS
// ============================================

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    sommeil: '#6B7FD7',
    stress: '#D4A5D9',
    energie: '#E8A87C',
    humeur: '#F5B041',
    digestion: '#A8D5BA',
    respiration: '#7BC8E8',
    immunite: '#82E0AA',
    detente: '#BB8FCE',
    concentration: '#5DADE2',
    douleurs: '#F1948A',
    bien_etre_general: '#85C1E9',
  };
  return colors[category] || '#85C1E9';
}

function getCategoryColorDark(category: string): string {
  const colors: Record<string, string> = {
    sommeil: '#4A5BA8',
    stress: '#A569BD',
    energie: '#CA6F1E',
    humeur: '#D68910',
    digestion: '#52BE80',
    respiration: '#3498DB',
    immunite: '#27AE60',
    detente: '#8E44AD',
    concentration: '#2E86C1',
    douleurs: '#E74C3C',
    bien_etre_general: '#5499C7',
  };
  return colors[category] || '#5499C7';
}

function getCategoryEmoji(category: string): string {
  const emojis: Record<string, string> = {
    sommeil: '😴',
    stress: '🧘',
    energie: '⚡',
    humeur: '😊',
    digestion: '🍃',
    respiration: '💨',
    immunite: '🛡️',
    detente: '🌸',
    concentration: '🧠',
    douleurs: '💆',
    bien_etre_general: '🌿',
  };
  return emojis[category] || '🌿';
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    sommeil: 'Sommeil',
    stress: 'Anti-stress',
    energie: 'Énergie',
    humeur: 'Humeur',
    digestion: 'Digestion',
    respiration: 'Respiration',
    immunite: 'Immunité',
    detente: 'Détente',
    concentration: 'Concentration',
    douleurs: 'Douleurs',
    bien_etre_general: 'Bien-être',
  };
  return labels[category] || 'Bien-être';
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 1,
  },
  sourceBadge: {
    padding: 4,
    backgroundColor: colors.accentSecondary + '20',
    borderRadius: 8,
  },
  loadingCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  loadingText: {
    color: colors.textMuted,
    fontSize: 13,
  },
  emptyCard: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  emptyGradient: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accentPrimary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accentPrimary,
  },
  card: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  cardGradient: {
    padding: spacing.lg,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  remedyName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
  },
  reason: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  matchScore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  matchText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
  },
  viewButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: spacing.xs,
  },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  tagText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
  },
});

export default DailyRecommendationSection;
