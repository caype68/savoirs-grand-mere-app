import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../theme/colors';

interface BadgeSourceProps {
  livre: string;
  page: number;
  compact?: boolean;
}

export const BadgeSource: React.FC<BadgeSourceProps> = ({ livre, page, compact = false }) => {
  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      <Feather name="book" size={compact ? 11 : 13} color={colors.textMuted} />
      <Text style={[styles.text, compact && styles.textCompact]}>
        {livre} · p.{page}
      </Text>
    </View>
  );
};

interface BadgeRouteProps {
  route: 'orale' | 'cutanee' | 'inhalation' | 'gargarisme' | 'nasale';
  compact?: boolean;
}

const routeLabels: Record<string, string> = {
  orale: 'Orale',
  cutanee: 'Cutanée',
  inhalation: 'Inhalation',
  gargarisme: 'Gargarisme',
  nasale: 'Nasale',
};

const routeIcons: Record<string, keyof typeof Feather.glyphMap> = {
  orale: 'coffee',
  cutanee: 'droplet',
  inhalation: 'wind',
  gargarisme: 'mic',
  nasale: 'wind',
};

const routeColors: Record<string, string> = {
  orale: colors.accentPrimary,
  cutanee: colors.accentSecondary,
  inhalation: colors.accentTertiary,
  gargarisme: colors.accentPrimary,
  nasale: colors.accentTertiary,
};

export const BadgeRoute: React.FC<BadgeRouteProps> = ({ route, compact = false }) => {
  const color = routeColors[route];
  
  return (
    <View style={[
      styles.routeContainer, 
      compact && styles.containerCompact,
      { backgroundColor: color + '18' }
    ]}>
      <Feather 
        name={routeIcons[route]} 
        size={compact ? 11 : 13} 
        color={color} 
      />
      <Text style={[styles.routeText, compact && styles.textCompact, { color }]}>
        {routeLabels[route]}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceHighlight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs + 1,
    borderRadius: borderRadius.sm,
    gap: spacing.xs,
  },
  containerCompact: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  text: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  textCompact: {
    fontSize: 11,
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs + 1,
    borderRadius: borderRadius.sm,
    gap: spacing.xs,
  },
  routeText: {
    ...typography.caption,
    fontWeight: '600',
  },
});
