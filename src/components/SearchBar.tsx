import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows } from '../theme/colors';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onSubmit,
  placeholder = 'Rechercher un sujet...',
  autoFocus = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[
      styles.container,
      isFocused && styles.containerFocused,
    ]}>
      <View style={styles.iconContainer}>
        <Feather 
          name="search" 
          size={18} 
          color={isFocused ? colors.accentPrimary : colors.textMuted} 
        />
      </View>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        autoFocus={autoFocus}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        selectionColor={colors.accentPrimary}
      />
      {value.length > 0 && (
        <TouchableOpacity 
          onPress={() => onChangeText('')} 
          style={styles.clearButton}
          activeOpacity={0.7}
        >
          <View style={styles.clearIconContainer}>
            <Feather name="x" size={12} color={colors.surface} />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  containerFocused: {
    borderColor: colors.borderAccent,
    backgroundColor: colors.surfaceElevated,
  },
  iconContainer: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
    padding: 0,
  },
  clearButton: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
  clearIconContainer: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.textMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
