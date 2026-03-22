// ============================================
// COMPOSANT STREAK BADGE
// Affiche le streak et les badges de gamification
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
import { UserStreak, StreakBadge as StreakBadgeType } from '../types';

// ============================================
// TYPES
// ============================================

interface StreakDisplayProps {
  streak: UserStreak;
  onPress?: () => void;
  compact?: boolean;
}

interface BadgeCardProps {
  badge: StreakBadgeType;
  currentStreak: number;
  onPress?: () => void;
}

interface StreakProgressProps {
  currentStreak: number;
  nextBadge: StreakBadgeType | null;
  progress: number;
}

// ============================================
// COMPOSANT PRINCIPAL - AFFICHAGE STREAK
// ============================================

export const StreakDisplay: React.FC<StreakDisplayProps> = ({
  streak,
  onPress,
  compact = false,
}) => {
  const isActive = streak.currentStreak > 0;
  
  if (compact) {
    return (
      <TouchableOpacity
        style={styles.compactContainer}
        onPress={onPress}
        activeOpacity={0.8}
        disabled={!onPress}
      >
        <View style={[
          styles.compactFireIcon,
          isActive && styles.compactFireIconActive
        ]}>
          <Text style={styles.fireEmoji}>🔥</Text>
        </View>
        <Text style={[
          styles.compactStreakNumber,
          isActive && styles.compactStreakNumberActive
        ]}>
          {streak.currentStreak}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.85}
      disabled={!onPress}
    >
      <LinearGradient
        colors={isActive 
          ? ['#FF6B35', '#FF8C42', '#FFA94D'] 
          : [colors.surface, colors.surfaceHighlight]
        }
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          {/* Icône flamme */}
          <View style={styles.fireContainer}>
            <Text style={styles.fireEmojiLarge}>🔥</Text>
          </View>

          {/* Nombre de jours */}
          <View style={styles.streakInfo}>
            <Text style={[
              styles.streakNumber,
              !isActive && styles.streakNumberInactive
            ]}>
              {streak.currentStreak}
            </Text>
            <Text style={[
              styles.streakLabel,
              !isActive && styles.streakLabelInactive
            ]}>
              {streak.currentStreak === 1 ? 'jour' : 'jours'}
            </Text>
          </View>

          {/* Meilleur streak */}
          {streak.bestStreak > 0 && (
            <View style={styles.bestStreak}>
              <Feather name="award" size={12} color={isActive ? '#fff' : colors.textMuted} />
              <Text style={[
                styles.bestStreakText,
                !isActive && styles.bestStreakTextInactive
              ]}>
                Record : {streak.bestStreak}
              </Text>
            </View>
          )}
        </View>

        {/* Chevron si cliquable */}
        {onPress && (
          <Feather 
            name="chevron-right" 
            size={20} 
            color={isActive ? 'rgba(255,255,255,0.7)' : colors.textMuted} 
          />
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

// ============================================
// COMPOSANT CARTE BADGE
// ============================================

export const BadgeCard: React.FC<BadgeCardProps> = ({
  badge,
  currentStreak,
  onPress,
}) => {
  const progress = Math.min(100, (currentStreak / badge.requiredDays) * 100);
  const isUnlocked = badge.isUnlocked;

  return (
    <TouchableOpacity
      style={[
        styles.badgeCard,
        isUnlocked && styles.badgeCardUnlocked,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={!onPress}
    >
      {/* Icône */}
      <View style={[
        styles.badgeIconContainer,
        isUnlocked && styles.badgeIconContainerUnlocked,
      ]}>
        <Text style={styles.badgeIcon}>{badge.icon}</Text>
      </View>

      {/* Infos */}
      <View style={styles.badgeInfo}>
        <Text style={[
          styles.badgeName,
          isUnlocked && styles.badgeNameUnlocked,
        ]}>
          {badge.name}
        </Text>
        <Text style={styles.badgeDescription} numberOfLines={1}>
          {badge.description}
        </Text>
        
        {/* Barre de progression */}
        {!isUnlocked && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { width: `${progress}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {currentStreak}/{badge.requiredDays}
            </Text>
          </View>
        )}

        {/* Date de déverrouillage */}
        {isUnlocked && badge.unlockedAt && (
          <Text style={styles.unlockedDate}>
            Débloqué le {new Date(badge.unlockedAt).toLocaleDateString('fr-FR')}
          </Text>
        )}
      </View>

      {/* Indicateur déverrouillé */}
      {isUnlocked && (
        <View style={styles.unlockedIndicator}>
          <Feather name="check-circle" size={20} color={colors.accentPrimary} />
        </View>
      )}
    </TouchableOpacity>
  );
};

// ============================================
// COMPOSANT PROGRESSION VERS PROCHAIN BADGE
// ============================================

export const StreakProgress: React.FC<StreakProgressProps> = ({
  currentStreak,
  nextBadge,
  progress,
}) => {
  if (!nextBadge) {
    return (
      <View style={styles.progressCard}>
        <View style={styles.progressCardContent}>
          <Text style={styles.progressCardIcon}>👑</Text>
          <View style={styles.progressCardInfo}>
            <Text style={styles.progressCardTitle}>Tous les badges débloqués !</Text>
            <Text style={styles.progressCardSubtitle}>
              Vous êtes une Légende Naturelle
            </Text>
          </View>
        </View>
      </View>
    );
  }

  const daysRemaining = nextBadge.requiredDays - currentStreak;

  return (
    <View style={styles.progressCard}>
      <View style={styles.progressCardContent}>
        <Text style={styles.progressCardIcon}>{nextBadge.icon}</Text>
        <View style={styles.progressCardInfo}>
          <Text style={styles.progressCardTitle}>
            Prochain badge : {nextBadge.name}
          </Text>
          <Text style={styles.progressCardSubtitle}>
            Plus que {daysRemaining} jour{daysRemaining > 1 ? 's' : ''} !
          </Text>
        </View>
      </View>

      {/* Barre de progression */}
      <View style={styles.progressCardBar}>
        <View 
          style={[
            styles.progressCardBarFill,
            { width: `${progress}%` }
          ]} 
        />
      </View>

      <Text style={styles.progressCardPercent}>
        {Math.round(progress)}% complété
      </Text>
    </View>
  );
};

// ============================================
// COMPOSANT ANIMATION NOUVEAU BADGE
// ============================================

interface NewBadgeAnimationProps {
  badge: StreakBadgeType;
  onDismiss: () => void;
}

export const NewBadgeAnimation: React.FC<NewBadgeAnimationProps> = ({
  badge,
  onDismiss,
}) => {
  return (
    <View style={styles.animationOverlay}>
      <View style={styles.animationCard}>
        <Text style={styles.animationEmoji}>🎉</Text>
        <Text style={styles.animationTitle}>Nouveau Badge !</Text>
        
        <View style={styles.animationBadge}>
          <Text style={styles.animationBadgeIcon}>{badge.icon}</Text>
        </View>
        
        <Text style={styles.animationBadgeName}>{badge.name}</Text>
        <Text style={styles.animationBadgeDesc}>{badge.description}</Text>
        
        <TouchableOpacity style={styles.animationButton} onPress={onDismiss}>
          <Text style={styles.animationButtonText}>Super !</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  // Compact
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  compactFireIcon: {
    opacity: 0.5,
  },
  compactFireIconActive: {
    opacity: 1,
  },
  fireEmoji: {
    fontSize: 16,
  },
  compactStreakNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMuted,
  },
  compactStreakNumberActive: {
    color: '#FF6B35',
  },

  // Container principal
  container: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginVertical: spacing.sm,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  fireContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fireEmojiLarge: {
    fontSize: 28,
  },
  streakInfo: {
    alignItems: 'flex-start',
  },
  streakNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
  },
  streakNumberInactive: {
    color: colors.textPrimary,
  },
  streakLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: -4,
  },
  streakLabelInactive: {
    color: colors.textMuted,
  },
  bestStreak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  bestStreakText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '500',
  },
  bestStreakTextInactive: {
    color: colors.textMuted,
  },

  // Badge Card
  badgeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    opacity: 0.7,
  },
  badgeCardUnlocked: {
    opacity: 1,
    borderColor: colors.accentPrimary,
    backgroundColor: colors.accentPrimaryMuted,
  },
  badgeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceHighlight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeIconContainerUnlocked: {
    backgroundColor: colors.accentPrimary,
  },
  badgeIcon: {
    fontSize: 24,
  },
  badgeInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  badgeName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  badgeNameUnlocked: {
    color: colors.textPrimary,
  },
  badgeDescription: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accentPrimary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
  unlockedDate: {
    fontSize: 11,
    color: colors.accentPrimary,
    marginTop: spacing.xs,
  },
  unlockedIndicator: {
    marginLeft: spacing.sm,
  },

  // Progress Card
  progressCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  progressCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  progressCardIcon: {
    fontSize: 32,
  },
  progressCardInfo: {
    flex: 1,
  },
  progressCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  progressCardSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  progressCardBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressCardBarFill: {
    height: '100%',
    backgroundColor: colors.accentPrimary,
    borderRadius: 4,
  },
  progressCardPercent: {
    fontSize: 12,
    color: colors.accentPrimary,
    fontWeight: '600',
    textAlign: 'right',
    marginTop: spacing.sm,
  },

  // Animation
  animationOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  animationCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 300,
  },
  animationEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  animationTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  animationBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accentPrimaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  animationBadgeIcon: {
    fontSize: 40,
  },
  animationBadgeName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.accentPrimary,
    marginBottom: spacing.xs,
  },
  animationBadgeDesc: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  animationButton: {
    backgroundColor: colors.accentPrimary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  animationButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default StreakDisplay;
