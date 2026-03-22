import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../theme/colors';

export const MedicalDisclaimerBanner: React.FC = () => {
  return (
    <View style={styles.container}>
      <Feather name="info" size={16} color={colors.accentSecondary} style={styles.icon} />
      <Text style={styles.text}>
        Les informations présentées sont issues de savoirs traditionnels et ne remplacent pas un avis médical.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.accentSecondaryMuted,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: colors.accentSecondary,
  },
  icon: {
    marginRight: spacing.sm,
    marginTop: 2,
  },
  text: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
