// ============================================
// COMPOSANT CARTE HUILE ESSENTIELLE
// ============================================

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../theme/colors';
import { EssentialOil, SafetyLevel } from '../types';
import { SafetyBadge } from './MedicalWarningCard';

// ============================================
// TYPES
// ============================================

interface EssentialOilCardProps {
  oil: EssentialOil;
  onPress?: () => void;
  compact?: boolean;
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export const EssentialOilCard: React.FC<EssentialOilCardProps> = ({
  oil,
  onPress,
  compact = false,
}) => {
  const mainProperties = oil.mainProperties.slice(0, 3);
  const mainUses = oil.commonUses.slice(0, 3);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        compact && styles.containerCompact,
        pressed && styles.containerPressed,
      ]}
      onPress={onPress}
    >
      {/* Header avec icône et nom */}
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: `${oil.color || colors.accentPrimary}20` }]}>
          <Text style={styles.iconEmoji}>{oil.icon || '🌿'}</Text>
        </View>
        <View style={styles.headerText}>
          <View style={styles.titleRow}>
            <Text style={styles.name} numberOfLines={1}>{oil.name}</Text>
            <SafetyBadge safetyLevel={oil.safetyLevel} />
          </View>
          {oil.nameLatin && (
            <Text style={styles.latinName} numberOfLines={1}>{oil.nameLatin}</Text>
          )}
        </View>
      </View>

      {/* Description courte */}
      <Text style={styles.description} numberOfLines={compact ? 2 : 3}>
        {oil.shortDescription}
      </Text>

      {/* Propriétés principales */}
      {!compact && mainProperties.length > 0 && (
        <View style={styles.tagsContainer}>
          {mainProperties.map((prop, index) => (
            <View key={index} style={styles.propertyTag}>
              <Text style={styles.propertyTagText}>{prop}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Usages principaux */}
      {!compact && mainUses.length > 0 && (
        <View style={styles.usesContainer}>
          <Feather name="check-circle" size={12} color={colors.textMuted} />
          <Text style={styles.usesText} numberOfLines={1}>
            {mainUses.join(' • ')}
          </Text>
        </View>
      )}

      {/* Voies d'utilisation */}
      <View style={styles.routesContainer}>
        {oil.usageRoutes.slice(0, 4).map((route, index) => (
          <View key={index} style={styles.routeBadge}>
            <Feather 
              name={getRouteIcon(route)} 
              size={10} 
              color={colors.accentPrimary} 
            />
            <Text style={styles.routeText}>{getRouteLabel(route)}</Text>
          </View>
        ))}
      </View>

      {/* Indicateur de navigation */}
      <View style={styles.chevronContainer}>
        <Feather name="chevron-right" size={18} color={colors.textMuted} />
      </View>
    </Pressable>
  );
};

// ============================================
// COMPOSANT CARTE COMPACTE (pour listes horizontales)
// ============================================

interface EssentialOilCardMiniProps {
  oil: EssentialOil;
  onPress?: () => void;
}

export const EssentialOilCardMini: React.FC<EssentialOilCardMiniProps> = ({
  oil,
  onPress,
}) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.miniContainer,
        pressed && styles.containerPressed,
      ]}
      onPress={onPress}
    >
      <View style={[styles.miniIcon, { backgroundColor: `${oil.color || colors.accentPrimary}20` }]}>
        <Text style={styles.miniIconEmoji}>{oil.icon || '🌿'}</Text>
      </View>
      <Text style={styles.miniName} numberOfLines={2}>{oil.name}</Text>
      <SafetyBadge safetyLevel={oil.safetyLevel} size="small" />
    </Pressable>
  );
};

// ============================================
// HELPERS
// ============================================

function getRouteIcon(route: string): any {
  const icons: Record<string, string> = {
    diffusion: 'wind',
    inhalation: 'cloud',
    cutanee: 'droplet',
    massage: 'hand',
    bain: 'droplet',
    orale: 'coffee',
    gargarisme: 'mic',
  };
  return icons[route] || 'circle';
}

function getRouteLabel(route: string): string {
  const labels: Record<string, string> = {
    diffusion: 'Diffusion',
    inhalation: 'Inhalation',
    cutanee: 'Cutanée',
    massage: 'Massage',
    bain: 'Bain',
    orale: 'Orale',
    gargarisme: 'Gargarisme',
  };
  return labels[route] || route;
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  containerCompact: {
    padding: spacing.sm,
  },
  containerPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconEmoji: {
    fontSize: 24,
  },
  headerText: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  latinName: {
    fontSize: 12,
    fontStyle: 'italic',
    color: colors.textMuted,
    marginTop: 2,
  },
  description: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  propertyTag: {
    backgroundColor: colors.accentPrimaryMuted,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  propertyTagText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.accentPrimary,
  },
  usesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  usesText: {
    flex: 1,
    fontSize: 12,
    color: colors.textMuted,
  },
  routesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  routeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(120, 166, 134, 0.1)',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  routeText: {
    fontSize: 10,
    color: colors.accentPrimary,
  },
  chevronContainer: {
    position: 'absolute',
    right: spacing.md,
    top: '50%',
    marginTop: -9,
  },
  // Mini card styles
  miniContainer: {
    width: 100,
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  miniIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  miniIconEmoji: {
    fontSize: 20,
  },
  miniName: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
});

export default EssentialOilCard;
