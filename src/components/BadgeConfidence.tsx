import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../theme/colors';

interface BadgeConfidenceProps {
  score: number;
  showLabel?: boolean;
  compact?: boolean;
}

export const BadgeConfidence: React.FC<BadgeConfidenceProps> = ({ 
  score, 
  showLabel = true,
  compact = false 
}) => {
  const percentage = Math.round(score * 100);
  
  let color = colors.confidenceHigh;
  let icon: keyof typeof Feather.glyphMap = 'check-circle';
  let label = 'Fiable';
  
  if (score < 0.7) {
    color = colors.confidenceLow;
    icon = 'alert-circle';
    label = 'À vérifier';
  } else if (score < 0.85) {
    color = colors.confidenceMedium;
    icon = 'alert-triangle';
    label = 'Moyen';
  }
  
  return (
    <View style={[styles.container, compact && styles.containerCompact, { backgroundColor: color + '15' }]}>
      <Feather name={icon} size={compact ? 11 : 13} color={color} />
      <Text style={[styles.text, compact && styles.textCompact, { color }]}>
        {showLabel ? `${percentage}%` : `${percentage}%`}
      </Text>
    </View>
  );
};

interface ConfidenceDetailProps {
  confianceOCR: number;
  confianceParsing: number;
  confianceGlobale: number;
}

export const ConfidenceDetail: React.FC<ConfidenceDetailProps> = ({
  confianceOCR,
  confianceParsing,
  confianceGlobale,
}) => {
  const getBarColor = (score: number) => {
    if (score >= 0.85) return colors.confidenceHigh;
    if (score >= 0.7) return colors.confidenceMedium;
    return colors.confidenceLow;
  };

  const ProgressBar = ({ value, label }: { value: number; label: string }) => (
    <View style={styles.progressRow}>
      <View style={styles.progressLabelContainer}>
        <Text style={styles.progressLabel}>{label}</Text>
        <Text style={styles.progressValue}>{(value * 100).toFixed(0)}%</Text>
      </View>
      <View style={styles.progressBarBg}>
        <View 
          style={[
            styles.progressBarFill, 
            { width: `${value * 100}%`, backgroundColor: getBarColor(value) }
          ]} 
        />
      </View>
    </View>
  );

  return (
    <View style={styles.detailContainer}>
      <ProgressBar value={confianceOCR} label="Reconnaissance (OCR)" />
      <ProgressBar value={confianceParsing} label="Extraction (Parsing)" />
      
      <View style={styles.totalContainer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Score global</Text>
          <View style={styles.totalBadge}>
            <BadgeConfidence score={confianceGlobale} showLabel={true} />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontWeight: '600',
  },
  textCompact: {
    fontSize: 11,
  },
  detailContainer: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  progressRow: {
    gap: spacing.sm,
  },
  progressLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  progressValue: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: colors.surfaceHighlight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  totalContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.lg,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  totalBadge: {
    flexDirection: 'row',
  },
});
