import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../theme/colors';
import { BadgeRoute } from './BadgeSource';
import { Remede } from '../types';

interface ResultCardProps {
  remede: Remede;
  matchReason?: string;
  onPress: () => void;
  isFavori?: boolean;
  onToggleFavori?: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  remede,
  matchReason,
  onPress,
  isFavori = false,
  onToggleFavori,
}) => {
  const ingredientsPreview = remede.ingredients
    .slice(0, 2)
    .map(i => i.nom)
    .join(' • ');

  return (
    <Pressable 
      style={({ pressed }) => [
        styles.container,
        pressed && styles.containerPressed,
      ]} 
      onPress={onPress}
    >
      {/* Accent bar */}
      <View style={[
        styles.accentBar,
        { backgroundColor: remede.verifie ? colors.accentPrimary : colors.accentSecondary }
      ]} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={1}>{remede.nom}</Text>
            {remede.verifie && (
              <View style={styles.verifiedBadge}>
                <Feather name="shield" size={12} color={colors.accentPrimary} />
              </View>
            )}
          </View>
          {onToggleFavori && (
            <TouchableOpacity 
              onPress={onToggleFavori} 
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={styles.favButton}
            >
              <Feather 
                name={isFavori ? 'heart' : 'heart'} 
                size={22} 
                color={isFavori ? colors.error : colors.textMuted}
                style={{ opacity: isFavori ? 1 : 0.4 }}
              />
            </TouchableOpacity>
          )}
        </View>
        
        <Text style={styles.subtitle} numberOfLines={1}>{ingredientsPreview}</Text>
        
        <View style={styles.badges}>
          <BadgeRoute route={remede.route} compact />
          {remede.source.livre === 'grimoire-remedes-naturels' && (
            <View style={styles.aiBadge}>
              <Feather name="cpu" size={10} color={colors.accentSecondary} />
              <Text style={styles.aiBadgeText}>Poussé par IA</Text>
            </View>
          )}
        </View>
        
        {matchReason && (
          <View style={styles.matchContainer}>
            <Feather name="zap" size={12} color={colors.accentTertiary} />
            <Text style={styles.matchText} numberOfLines={1}>{matchReason}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.chevronContainer}>
        <Feather name="chevron-right" size={20} color={colors.textMuted} />
      </View>
    </Pressable>
  );
};

interface TrendCardProps {
  titre: string;
  onPress: () => void;
  index?: number;
}

export const TrendCard: React.FC<TrendCardProps> = ({ titre, onPress, index = 0 }) => {
  const icons: (keyof typeof Feather.glyphMap)[] = ['sun', 'droplet', 'wind'];
  const bgColors = [colors.accentPrimaryMuted, colors.accentSecondaryMuted, 'rgba(167, 139, 250, 0.15)'];
  const iconColors = [colors.accentPrimary, colors.accentSecondary, colors.accentTertiary];

  return (
    <Pressable 
      style={({ pressed }) => [
        styles.trendContainer,
        pressed && styles.trendContainerPressed,
      ]} 
      onPress={onPress}
    >
      <View style={[styles.trendIconContainer, { backgroundColor: bgColors[index % 3] }]}>
        <Feather name={icons[index % 3]} size={20} color={iconColors[index % 3]} />
      </View>
      <View style={styles.trendContent}>
        <Text style={styles.trendTitle}>{titre}</Text>
        <Text style={styles.trendSubtitle}>Remède populaire</Text>
      </View>
      <View style={styles.trendArrow}>
        <Feather name="arrow-right" size={18} color={colors.textMuted} />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  containerPressed: {
    backgroundColor: colors.surfaceElevated,
    transform: [{ scale: 0.98 }],
  },
  accentBar: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
    flex: 1,
  },
  verifiedBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.accentPrimaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favButton: {
    padding: spacing.xs,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  matchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  matchText: {
    ...typography.caption,
    color: colors.textMuted,
    flex: 1,
  },
  chevronContainer: {
    justifyContent: 'center',
    paddingRight: spacing.md,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  trendContainerPressed: {
    backgroundColor: colors.surfaceElevated,
    transform: [{ scale: 0.98 }],
  },
  trendIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendContent: {
    flex: 1,
  },
  trendTitle: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  trendSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  trendArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    backgroundColor: colors.accentSecondary + '20',
    borderRadius: borderRadius.sm,
  },
  aiBadgeText: {
    fontSize: 10,
    color: colors.accentSecondary,
    fontWeight: '500',
  },
});
