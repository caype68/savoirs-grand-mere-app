// ============================================
// COMPOSANT CARTE ROUTINE QUOTIDIENNE
// Affiche les routines matin/soir
// ============================================

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius } from '../theme/colors';
import { DailyRoutine, RoutineBlock, Remede } from '../types';

// ============================================
// TYPES
// ============================================

interface DailyRoutineCardProps {
  routine: DailyRoutine;
  remedies: { morning: Remede[]; evening: Remede[] };
  onViewRemedy: (remedyId: string) => void;
  onCompleteRoutine: (type: 'morning' | 'evening') => void;
  compact?: boolean;
}

interface RoutineBlockCardProps {
  block: RoutineBlock;
  remedies: Remede[];
  onViewRemedy: (remedyId: string) => void;
  onComplete: () => void;
}

// ============================================
// COMPOSANT BLOC ROUTINE
// ============================================

const RoutineBlockCard: React.FC<RoutineBlockCardProps> = ({
  block,
  remedies,
  onViewRemedy,
  onComplete,
}) => {
  const isMorning = block.type === 'morning';
  const gradientColors: readonly [string, string, string] = isMorning
    ? ['#FEF3C7', '#FDE68A', '#FCD34D'] as const // Jaune/doré pour le matin
    : ['#C7D2FE', '#A5B4FC', '#818CF8'] as const; // Violet/bleu pour le soir

  return (
    <View style={styles.blockContainer}>
      {/* Header avec gradient */}
      <LinearGradient
        colors={gradientColors}
        style={styles.blockHeader}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.blockHeaderContent}>
          <Text style={styles.blockEmoji}>
            {isMorning ? '🌞' : '🌙'}
          </Text>
          <View style={styles.blockHeaderText}>
            <Text style={styles.blockTitle}>{block.title}</Text>
            <Text style={styles.blockSubtitle}>{block.subtitle}</Text>
          </View>
        </View>
        
        <View style={styles.blockMeta}>
          <Feather name="clock" size={12} color="rgba(0,0,0,0.5)" />
          <Text style={styles.blockDuration}>{block.duration}</Text>
        </View>
      </LinearGradient>

      {/* Remèdes */}
      <View style={styles.blockContent}>
        {remedies.map((remedy, index) => (
          <TouchableOpacity
            key={remedy.id}
            style={styles.remedyItem}
            onPress={() => onViewRemedy(remedy.id)}
            activeOpacity={0.7}
          >
            <View style={styles.remedyNumber}>
              <Text style={styles.remedyNumberText}>{index + 1}</Text>
            </View>
            <View style={styles.remedyInfo}>
              <Text style={styles.remedyName} numberOfLines={1}>
                {remedy.nom}
              </Text>
              <Text style={styles.remedyRoute}>
                {remedy.route === 'orale' ? '💧 Voie orale' :
                 remedy.route === 'inhalation' ? '💨 Inhalation' :
                 remedy.route === 'cutanee' ? '✋ Application' :
                 remedy.route}
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        ))}

        {/* Tips */}
        {block.tips.length > 0 && (
          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>💡 Conseils</Text>
            {block.tips.map((tip, index) => (
              <Text key={index} style={styles.tipText}>• {tip}</Text>
            ))}
          </View>
        )}

        {/* Bouton compléter */}
        {!block.isCompleted ? (
          <TouchableOpacity
            style={styles.completeButton}
            onPress={onComplete}
            activeOpacity={0.8}
          >
            <Feather name="check-circle" size={18} color="#fff" />
            <Text style={styles.completeButtonText}>
              Marquer comme fait
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.completedBadge}>
            <Feather name="check" size={16} color={colors.accentPrimary} />
            <Text style={styles.completedText}>
              Complété {block.completedAt && `à ${new Date(block.completedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export const DailyRoutineCard: React.FC<DailyRoutineCardProps> = ({
  routine,
  remedies,
  onViewRemedy,
  onCompleteRoutine,
  compact = false,
}) => {
  const now = new Date();
  const currentHour = now.getHours();
  const isMorningTime = currentHour >= 5 && currentHour < 14;

  if (compact) {
    // Version compacte pour la home
    const activeBlock = isMorningTime ? routine.morningRoutine : routine.eveningRoutine;
    const activeRemedies = isMorningTime ? remedies.morning : remedies.evening;
    
    return (
      <View style={styles.compactContainer}>
        <View style={styles.compactHeader}>
          <Text style={styles.compactEmoji}>
            {isMorningTime ? '🌞' : '🌙'}
          </Text>
          <View style={styles.compactHeaderText}>
            <Text style={styles.compactTitle}>
              {isMorningTime ? 'Routine Matin' : 'Routine Soir'}
            </Text>
            <Text style={styles.compactSubtitle}>
              {activeRemedies.length} remède{activeRemedies.length > 1 ? 's' : ''} • {activeBlock.duration}
            </Text>
          </View>
          {activeBlock.isCompleted && (
            <View style={styles.compactCompletedBadge}>
              <Feather name="check" size={14} color={colors.accentPrimary} />
            </View>
          )}
        </View>

        {/* Liste horizontale des remèdes */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.compactRemedies}
        >
          {activeRemedies.map((remedy) => (
            <TouchableOpacity
              key={remedy.id}
              style={styles.compactRemedyChip}
              onPress={() => onViewRemedy(remedy.id)}
            >
              <Text style={styles.compactRemedyName} numberOfLines={1}>
                {remedy.nom}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {!activeBlock.isCompleted && (
          <TouchableOpacity
            style={styles.compactCompleteButton}
            onPress={() => onCompleteRoutine(isMorningTime ? 'morning' : 'evening')}
          >
            <Text style={styles.compactCompleteText}>Faire la routine</Text>
            <Feather name="arrow-right" size={16} color={colors.accentPrimary} />
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // Version complète
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Vos routines du jour</Text>
          <Text style={styles.headerDate}>
            {new Date(routine.dateKey).toLocaleDateString('fr-FR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </Text>
        </View>
        
        {/* Indicateur de complétion */}
        <View style={styles.completionIndicator}>
          <View style={[
            styles.completionDot,
            routine.morningRoutine.isCompleted && styles.completionDotActive
          ]} />
          <View style={[
            styles.completionDot,
            routine.eveningRoutine.isCompleted && styles.completionDotActive
          ]} />
        </View>
      </View>

      {/* Routine Matin */}
      <RoutineBlockCard
        block={routine.morningRoutine}
        remedies={remedies.morning}
        onViewRemedy={onViewRemedy}
        onComplete={() => onCompleteRoutine('morning')}
      />

      {/* Routine Soir */}
      <RoutineBlockCard
        block={routine.eveningRoutine}
        remedies={remedies.evening}
        onViewRemedy={onViewRemedy}
        onComplete={() => onCompleteRoutine('evening')}
      />

      {/* Message de motivation */}
      {routine.morningRoutine.isCompleted && routine.eveningRoutine.isCompleted && (
        <View style={styles.motivationBanner}>
          <Text style={styles.motivationEmoji}>🎉</Text>
          <Text style={styles.motivationText}>
            Bravo ! Vous avez complété vos deux routines aujourd'hui !
          </Text>
        </View>
      )}
    </View>
  );
};

// ============================================
// COMPOSANT ÉTAT VIDE
// ============================================

interface NoRoutineCardProps {
  onGenerate: () => void;
  isLoading?: boolean;
}

export const NoRoutineCard: React.FC<NoRoutineCardProps> = ({
  onGenerate,
  isLoading = false,
}) => {
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconRow}>
        <Text style={styles.emptyEmoji}>🌞</Text>
        <Text style={styles.emptyEmoji}>🌙</Text>
      </View>
      <Text style={styles.emptyTitle}>
        Pas encore de routine aujourd'hui
      </Text>
      <Text style={styles.emptyText}>
        Générez vos routines personnalisées basées sur vos objectifs et votre état du jour.
      </Text>
      <TouchableOpacity
        style={[styles.generateButton, isLoading && styles.generateButtonDisabled]}
        onPress={onGenerate}
        disabled={isLoading}
      >
        {isLoading ? (
          <Text style={styles.generateButtonText}>Génération...</Text>
        ) : (
          <>
            <Feather name="refresh-cw" size={18} color="#fff" />
            <Text style={styles.generateButtonText}>Générer mes routines</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  // Container principal
  container: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {},
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  headerDate: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  completionIndicator: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  completionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.border,
  },
  completionDotActive: {
    backgroundColor: colors.accentPrimary,
  },

  // Bloc routine
  blockContainer: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  blockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  blockHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  blockEmoji: {
    fontSize: 28,
  },
  blockHeaderText: {},
  blockTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: 'rgba(0,0,0,0.8)',
  },
  blockSubtitle: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.5)',
  },
  blockMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.5)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  blockDuration: {
    fontSize: 11,
    color: 'rgba(0,0,0,0.6)',
    fontWeight: '500',
  },
  blockContent: {
    padding: spacing.md,
  },

  // Remède item
  remedyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  remedyNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.accentPrimaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  remedyNumberText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accentPrimary,
  },
  remedyInfo: {
    flex: 1,
  },
  remedyName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  remedyRoute: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },

  // Tips
  tipsContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  tipsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  tipText: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: 4,
  },

  // Bouton compléter
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accentPrimary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
  },
  completeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accentPrimaryMuted,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
  },
  completedText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.accentPrimary,
  },

  // Motivation
  motivationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.accentPrimaryMuted,
    padding: spacing.lg,
  },
  motivationEmoji: {
    fontSize: 24,
  },
  motivationText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: colors.accentPrimary,
  },

  // Compact
  compactContainer: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  compactEmoji: {
    fontSize: 28,
  },
  compactHeaderText: {
    flex: 1,
  },
  compactTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  compactSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  compactCompletedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.accentPrimaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactRemedies: {
    paddingBottom: spacing.sm,
  },
  compactRemedyChip: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginRight: spacing.sm,
  },
  compactRemedyName: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  compactCompleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  compactCompleteText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accentPrimary,
  },

  // Empty state
  emptyContainer: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  emptyIconRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  emptyEmoji: {
    fontSize: 32,
    opacity: 0.5,
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
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accentPrimary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  generateButtonDisabled: {
    opacity: 0.6,
  },
  generateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});

export default DailyRoutineCard;
