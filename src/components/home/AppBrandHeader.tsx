import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing } from '../../theme/colors';
import { logo } from '../../assets';

interface AppBrandHeaderProps {
  showSubtitle?: boolean;
}

export const AppBrandHeader: React.FC<AppBrandHeaderProps> = ({ showSubtitle = true }) => {
  return (
    <View style={styles.container}>
      {/* Glow effect behind logo */}
      <View style={styles.glowContainer}>
        <LinearGradient
          colors={['rgba(120, 166, 134, 0.25)', 'rgba(120, 166, 134, 0.1)', 'transparent']}
          style={styles.glow}
        />
      </View>
      
      <Image source={logo} style={styles.logo} resizeMode="contain" />
      
      <Text style={styles.title}>Savoirs de Grand-Mère</Text>
      
      {showSubtitle && (
        <Text style={styles.subtitle}>Remèdes traditionnels & naturels</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingTop: spacing.xl,
    position: 'relative',
  },
  glowContainer: {
    position: 'absolute',
    top: spacing.md,
    left: '25%',
    right: '25%',
    height: 100,
    alignItems: 'center',
  },
  glow: {
    width: 140,
    height: 140,
    borderRadius: 70,
    position: 'absolute',
    top: -10,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  title: {
    marginTop: spacing.sm,
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  subtitle: {
    marginTop: spacing.xs,
    fontSize: 13,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
});
