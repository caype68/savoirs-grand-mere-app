import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../theme/colors';

interface DisclaimerBannerProps {
  type?: 'warning' | 'info';
  message?: string;
}

export const DisclaimerBanner: React.FC<DisclaimerBannerProps> = ({
  type = 'warning',
  message = 'Info documentaire. Consultez un professionnel de santé en cas de doute.',
}) => {
  const isWarning = type === 'warning';
  const bgColor = isWarning ? colors.warning + '15' : colors.info + '15';
  const borderColor = isWarning ? colors.warning + '40' : colors.info + '40';
  const iconColor = isWarning ? colors.warning : colors.info;
  const textColor = isWarning ? colors.warning : colors.info;

  return (
    <View style={[styles.container, { backgroundColor: bgColor, borderColor }]}>
      <Feather 
        name={isWarning ? 'alert-triangle' : 'info'} 
        size={16} 
        color={iconColor} 
      />
      <Text style={[styles.text, { color: textColor }]}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    gap: spacing.sm,
  },
  text: {
    ...typography.bodySmall,
    flex: 1,
  },
});
