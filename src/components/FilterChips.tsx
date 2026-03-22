import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../theme/colors';

interface Chip {
  id: string;
  label: string;
  icon?: keyof typeof Feather.glyphMap;
}

interface FilterChipsProps {
  chips: Chip[];
  selectedIds?: string[];
  onSelect: (id: string) => void;
  multiSelect?: boolean;
}

export const FilterChips: React.FC<FilterChipsProps> = ({
  chips,
  selectedIds = [],
  onSelect,
  multiSelect = false,
}) => {
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {chips.map((chip) => {
        const isSelected = selectedIds.includes(chip.id);
        return (
          <TouchableOpacity
            key={chip.id}
            style={[styles.chip, isSelected && styles.chipSelected]}
            onPress={() => onSelect(chip.id)}
            activeOpacity={0.8}
          >
            {chip.icon && (
              <Feather 
                name={chip.icon} 
                size={14} 
                color={isSelected ? colors.background : colors.textSecondary} 
                style={styles.chipIcon}
              />
            )}
            <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
              {chip.label}
            </Text>
            {isSelected && (
              <View style={styles.checkContainer}>
                <Feather name="check" size={12} color={colors.background} />
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

interface SuggestionChipsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
}

export const SuggestionChips: React.FC<SuggestionChipsProps> = ({
  suggestions,
  onSelect,
}) => {
  const icons: Record<string, keyof typeof Feather.glyphMap> = {
    'Gorge': 'mic',
    'Digestion': 'coffee',
    'Sommeil': 'moon',
    'Peau': 'droplet',
  };

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {suggestions.map((suggestion) => (
        <TouchableOpacity
          key={suggestion}
          style={styles.suggestionChip}
          onPress={() => onSelect(suggestion)}
          activeOpacity={0.8}
        >
          <View style={styles.suggestionIconContainer}>
            <Feather 
              name={icons[suggestion] || 'hash'} 
              size={14} 
              color={colors.accentPrimary} 
            />
          </View>
          <Text style={styles.suggestionText}>{suggestion}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.accentPrimary,
    borderColor: colors.accentPrimary,
    ...shadows.sm,
  },
  chipIcon: {
    marginRight: spacing.xs,
  },
  chipText: {
    ...typography.bodySmall,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  chipTextSelected: {
    color: colors.background,
    fontWeight: '600',
  },
  checkContainer: {
    marginLeft: spacing.xs,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accentPrimaryMuted,
    borderWidth: 1,
    borderColor: colors.borderAccent,
    gap: spacing.sm,
  },
  suggestionIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.accentPrimaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.accentPrimary,
  },
});
