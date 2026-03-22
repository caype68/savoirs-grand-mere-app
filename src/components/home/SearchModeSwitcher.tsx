import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../theme/colors';

export type SearchMode = 'symptom' | 'body' | 'type';

interface SearchModeSwitcherProps {
  activeMode: SearchMode;
  onModeChange: (mode: SearchMode) => void;
}

const modes: { id: SearchMode; label: string; icon: string }[] = [
  { id: 'symptom', label: 'Symptôme', icon: 'activity' },
  { id: 'body', label: 'Zone du corps', icon: 'user' },
  { id: 'type', label: 'Type de remède', icon: 'layers' },
];

const ModeButton: React.FC<{
  mode: typeof modes[0];
  isActive: boolean;
  onPress: () => void;
}> = ({ mode, isActive, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
  };

  return (
    <TouchableOpacity
      style={styles.modeButtonWrapper}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
    >
      <Animated.View 
        style={[
          styles.modeButton,
          isActive && styles.modeButtonActive,
          { transform: [{ scale: scaleAnim }] }
        ]}
      >
        <Feather 
          name={mode.icon as any} 
          size={14} 
          color={isActive ? colors.textPrimary : colors.textMuted} 
        />
        <Text 
          style={[
            styles.modeLabel,
            isActive && styles.modeLabelActive
          ]}
        >
          {mode.label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

export const SearchModeSwitcher: React.FC<SearchModeSwitcherProps> = ({
  activeMode,
  onModeChange,
}) => {
  return (
    <View style={styles.container}>
      {modes.map((mode) => (
        <ModeButton
          key={mode.id}
          mode={mode}
          isActive={activeMode === mode.id}
          onPress={() => onModeChange(mode.id)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: 6,
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    gap: 8,
  },
  modeButtonWrapper: {
    flex: 1,
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: 'transparent',
  },
  modeButtonActive: {
    backgroundColor: colors.accentPrimary,
  },
  modeLabel: {
    marginLeft: 6,
    fontSize: 11,
    fontWeight: '500',
    color: colors.textMuted,
  },
  modeLabelActive: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
});
