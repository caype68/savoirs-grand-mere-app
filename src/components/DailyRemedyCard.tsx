// ============================================
// CARTE REMÈDE DU JOUR
// Affiche la recommandation quotidienne
// ============================================

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius } from '../theme/colors';
import { DailyRecommendation, WellnessCategory } from '../types';

// ============================================
// TYPES
// ============================================

interface DailyRemedyCardProps {
  recommendation: DailyRecommendation;
  onViewRemedy: (remedyId: string) => void;
  onSaveToFavorites?: (recommendation: DailyRecommendation) => void;
  compact?: boolean;
}

// ============================================
// CONFIGURATION
// ============================================

const CATEGORY_CONFIG: Record<WellnessCategory, { icon: string; color: string; label: string }> = {
  sommeil: { icon: 'moon', color: '#7C3AED', label: 'Sommeil' },
  stress: { icon: 'wind', color: '#EC4899', label: 'Anti-stress' },
  energie: { icon: 'zap', color: '#F59E0B', label: 'Énergie' },
  humeur: { icon: 'smile', color: '#10B981', label: 'Humeur' },
  digestion: { icon: 'coffee', color: '#8B5CF6', label: 'Digestion' },
  respiration: { icon: 'cloud', color: '#06B6D4', label: 'Respiration' },
  immunite: { icon: 'shield', color: '#EF4444', label: 'Immunité' },
  detente: { icon: 'feather', color: '#6366F1', label: 'Détente' },
  concentration: { icon: 'target', color: '#F97316', label: 'Concentration' },
  douleurs: { icon: 'activity', color: '#DC2626', label: 'Douleurs' },
  bien_etre_general: { icon: 'heart', color: '#78A686', label: 'Bien-être' },
};

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export const DailyRemedyCard: React.FC<DailyRemedyCardProps> = ({
  recommendation,
  onViewRemedy,
  onSaveToFavorites,
  compact = false,
}) => {
  const categoryConfig = CATEGORY_CONFIG[recommendation.category] || CATEGORY_CONFIG.bien_etre_general;

  if (compact) {
    return (
      <TouchableOpacity
        style={styles.compactCard}
        onPress={() => onViewRemedy(recommendation.remedyId)}
        activeOpacity={0.85}
      >
        <View style={[styles.compactIconContainer, { backgroundColor: `${categoryConfig.color}20` }]}>
          <Feather name={categoryConfig.icon as any} size={18} color={categoryConfig.color} />
        </View>
        <View style={styles.compactContent}>
          <Text style={styles.compactTitle} numberOfLines={1}>
            {recommendation.remedyName}
          </Text>
          <Text style={styles.compactCategory}>{categoryConfig.label}</Text>
        </View>
        <Feather name="chevron-right" size={18} color={colors.textMuted} />
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header avec gradient */}
      <LinearGradient
        colors={[`${categoryConfig.color}30`, `${categoryConfig.color}10`]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={[styles.iconContainer, { backgroundColor: `${categoryConfig.color}30` }]}>
            <Feather name={categoryConfig.icon as any} size={24} color={categoryConfig.color} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.headerLabel}>Votre remède du jour</Text>
            <View style={styles.categoryBadge}>
              <Text style={[styles.categoryText, { color: categoryConfig.color }]}>
                {categoryConfig.label}
              </Text>
            </View>
          </View>
        </View>
        
        {/* Score de pertinence */}
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreValue}>{recommendation.matchScore}%</Text>
          <Text style={styles.scoreLabel}>adapté</Text>
        </View>
      </LinearGradient>

      {/* Contenu */}
      <View style={styles.content}>
        {/* Nom du remède */}
        <Text style={styles.remedyName}>{recommendation.remedyName}</Text>
        
        {/* Raison de la recommandation */}
        <View style={styles.reasonContainer}>
          <Feather name="info" size={14} color={colors.textMuted} />
          <Text style={styles.reasonText}>{recommendation.reason}</Text>
        </View>

        {/* Tags matchés */}
        {recommendation.matchedTags.length > 0 && (
          <View style={styles.tagsContainer}>
            {recommendation.matchedTags.slice(0, 4).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => onViewRemedy(recommendation.remedyId)}
          >
            <Text style={styles.primaryButtonText}>Voir le remède</Text>
            <Feather name="arrow-right" size={16} color="#fff" />
          </TouchableOpacity>

          {onSaveToFavorites && !recommendation.isSavedToFavorites && (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => onSaveToFavorites(recommendation)}
            >
              <Feather name="heart" size={18} color={colors.accentPrimary} />
            </TouchableOpacity>
          )}

          {recommendation.isSavedToFavorites && (
            <View style={styles.savedBadge}>
              <Feather name="check" size={14} color={colors.accentPrimary} />
              <Text style={styles.savedText}>Sauvegardé</Text>
            </View>
          )}
        </View>
      </View>

      {/* Disclaimer */}
      <View style={styles.disclaimer}>
        <Feather name="alert-circle" size={12} color={colors.textMuted} />
        <Text style={styles.disclaimerText}>
          Les conseils proposés sont informatifs et ne remplacent pas un avis médical.
        </Text>
      </View>
    </View>
  );
};

// ============================================
// COMPOSANT ÉTAT VIDE
// ============================================

interface NoRecommendationCardProps {
  onFillJournal: () => void;
  journalFilled: boolean;
}

export const NoRecommendationCard: React.FC<NoRecommendationCardProps> = ({
  onFillJournal,
  journalFilled,
}) => {
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Feather 
          name={journalFilled ? "loader" : "edit-3"} 
          size={32} 
          color={colors.textMuted} 
        />
      </View>
      <Text style={styles.emptyTitle}>
        {journalFilled 
          ? "Génération en cours..." 
          : "Pas encore de recommandation"}
      </Text>
      <Text style={styles.emptyText}>
        {journalFilled
          ? "Votre remède personnalisé arrive..."
          : "Remplissez votre journal bien-être pour recevoir une recommandation adaptée à votre état."}
      </Text>
      {!journalFilled && (
        <TouchableOpacity style={styles.emptyButton} onPress={onFillJournal}>
          <Text style={styles.emptyButtonText}>Remplir mon journal</Text>
          <Feather name="arrow-right" size={16} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
};

// ============================================
// COMPOSANT HISTORIQUE
// ============================================

interface RecommendationHistoryItemProps {
  recommendation: DailyRecommendation;
  dateLabel: string;
  onPress: () => void;
}

export const RecommendationHistoryItem: React.FC<RecommendationHistoryItemProps> = ({
  recommendation,
  dateLabel,
  onPress,
}) => {
  const categoryConfig = CATEGORY_CONFIG[recommendation.category] || CATEGORY_CONFIG.bien_etre_general;

  return (
    <TouchableOpacity style={styles.historyItem} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.historyIcon, { backgroundColor: `${categoryConfig.color}20` }]}>
        <Feather name={categoryConfig.icon as any} size={16} color={categoryConfig.color} />
      </View>
      <View style={styles.historyContent}>
        <Text style={styles.historyDate}>{dateLabel}</Text>
        <Text style={styles.historyRemedy} numberOfLines={1}>
          {recommendation.remedyName}
        </Text>
      </View>
      <View style={styles.historyMeta}>
        <Text style={styles.historyScore}>{recommendation.matchScore}%</Text>
        {recommendation.isSavedToFavorites && (
          <Feather name="heart" size={12} color={colors.accentPrimary} />
        )}
      </View>
    </TouchableOpacity>
  );
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  // Carte principale
  container: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginVertical: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    gap: spacing.xs,
  },
  headerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.accentPrimary,
  },
  scoreLabel: {
    fontSize: 10,
    color: colors.textMuted,
  },
  content: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  remedyName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  reasonContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  reasonText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  tag: {
    backgroundColor: colors.accentPrimaryMuted,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.accentPrimary,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accentPrimary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  secondaryButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  savedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  savedText: {
    fontSize: 12,
    color: colors.accentPrimary,
    fontWeight: '500',
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 10,
    color: colors.textMuted,
    lineHeight: 14,
  },

  // Carte compacte
  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.md,
  },
  compactIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactContent: {
    flex: 1,
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  compactCategory: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },

  // État vide
  emptyContainer: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: spacing.lg,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accentPrimary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },

  // Historique
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  historyIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyContent: {
    flex: 1,
  },
  historyDate: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 2,
  },
  historyRemedy: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  historyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  historyScore: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.accentPrimary,
  },
});

export default DailyRemedyCard;
