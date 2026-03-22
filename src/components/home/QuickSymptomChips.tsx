import React, { useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../theme/colors';

interface Symptom {
  id: string;
  label: string;
  icon: string;
}

const symptoms: Symptom[] = [
  { id: 'gorge', label: 'Mal de gorge', icon: 'mic' },
  { id: 'toux', label: 'Toux', icon: 'wind' },
  { id: 'fievre', label: 'Fièvre', icon: 'thermometer' },
  { id: 'stress', label: 'Stress', icon: 'cloud' },
  { id: 'sommeil', label: 'Sommeil', icon: 'moon' },
  { id: 'digestion', label: 'Digestion', icon: 'coffee' },
  { id: 'tete', label: 'Maux de tête', icon: 'zap' },
  { id: 'muscles', label: 'Douleurs musculaires', icon: 'activity' },
];

interface QuickSymptomChipsProps {
  selectedSymptom: string | null;
  onSelectSymptom: (symptomId: string) => void;
}

const SymptomChipItem: React.FC<{
  symptom: Symptom;
  isSelected: boolean;
  onPress: () => void;
}> = ({ symptom, isSelected, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View 
        style={[
          styles.chip,
          isSelected && styles.chipActive,
          { transform: [{ scale: scaleAnim }] }
        ]}
      >
        <Feather 
          name={symptom.icon as any} 
          size={14} 
          color={isSelected ? colors.textPrimary : colors.textMuted} 
        />
        <Text style={[styles.chipLabel, isSelected && styles.chipLabelActive]}>
          {symptom.label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

export const QuickSymptomChips: React.FC<QuickSymptomChipsProps> = ({
  selectedSymptom,
  onSelectSymptom,
}) => {
  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {symptoms.map((symptom) => (
          <SymptomChipItem
            key={symptom.id}
            symptom={symptom}
            isSelected={selectedSymptom === symptom.id}
            onPress={() => onSelectSymptom(symptom.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.md,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  chipActive: {
    backgroundColor: colors.accentPrimaryMuted,
    borderColor: colors.accentPrimary,
  },
  chipLabel: {
    marginLeft: spacing.xs,
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
  },
  chipLabelActive: {
    color: colors.textPrimary,
  },
});
