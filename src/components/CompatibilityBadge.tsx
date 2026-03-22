import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../theme/colors';
import { CompatibilityStatus, RemedyCompatibility } from '../types';
import { getCompatibilityLabel, getCompatibilityColor } from '../services/compatibility';

interface CompatibilityBadgeProps {
  compatibility: RemedyCompatibility;
  compact?: boolean;
  onPress?: () => void;
}

export const CompatibilityBadge: React.FC<CompatibilityBadgeProps> = ({
  compatibility,
  compact = false,
  onPress,
}) => {
  const { status, raisons, scorePersonnalise } = compatibility;
  const color = getCompatibilityColor(status);
  const label = getCompatibilityLabel(status);

  const getIcon = (): keyof typeof Feather.glyphMap => {
    switch (status) {
      case 'compatible':
        return 'check-circle';
      case 'attention':
        return 'alert-circle';
      case 'deconseille':
        return 'x-circle';
    }
  };

  if (compact) {
    return (
      <View style={[styles.compactBadge, { backgroundColor: color + '20' }]}>
        <Feather name={getIcon()} size={12} color={color} />
        <Text style={[styles.compactText, { color }]}>
          {status === 'compatible' ? 'Compatible' : status === 'attention' ? 'À vérifier' : 'Déconseillé'}
        </Text>
      </View>
    );
  }

  const content = (
    <View style={[styles.container, { borderColor: color + '40' }]}>
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Feather name={getIcon()} size={20} color={color} />
      </View>
      
      <View style={styles.textContainer}>
        <Text style={[styles.label, { color }]}>{label}</Text>
        {raisons.length > 0 && (
          <Text style={styles.reason} numberOfLines={2}>
            {raisons[0]}
          </Text>
        )}
      </View>
      
      {scorePersonnalise > 0 && (
        <View style={styles.scoreContainer}>
          <Text style={[styles.score, { color }]}>{scorePersonnalise}%</Text>
          <Text style={styles.scoreLabel}>match</Text>
        </View>
      )}
      
      {onPress && (
        <Feather name="chevron-right" size={18} color={colors.textMuted} />
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

interface CompatibilityWarningProps {
  raisons: string[];
}

export const CompatibilityWarning: React.FC<CompatibilityWarningProps> = ({ raisons }) => {
  if (raisons.length === 0) return null;

  return (
    <View style={styles.warningContainer}>
      <View style={styles.warningHeader}>
        <Feather name="alert-triangle" size={16} color="#FBBF24" />
        <Text style={styles.warningTitle}>Points d'attention</Text>
      </View>
      {raisons.map((raison, index) => (
        <View key={index} style={styles.warningItem}>
          <View style={styles.warningBullet} />
          <Text style={styles.warningText}>{raison}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  reason: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  scoreContainer: {
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  score: {
    fontSize: 18,
    fontWeight: '700',
  },
  scoreLabel: {
    fontSize: 10,
    color: colors.textMuted,
  },
  compactBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  compactText: {
    fontSize: 11,
    fontWeight: '600',
  },
  warningContainer: {
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FBBF24',
  },
  warningItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: spacing.xs,
  },
  warningBullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FBBF24',
    marginTop: 6,
    marginRight: spacing.sm,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});

export default CompatibilityBadge;
