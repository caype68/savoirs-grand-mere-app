import React, { useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Animated,
  Easing,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../theme/colors';

interface SymptomChipProps {
  label: string;
  icon?: string;
  isActive: boolean;
  onPress: () => void;
}

export const SymptomChip: React.FC<SymptomChipProps> = ({ 
  label, 
  icon,
  isActive, 
  onPress 
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const leafRotate1 = useRef(new Animated.Value(0)).current;
  const leafRotate2 = useRef(new Animated.Value(0)).current;
  const leafOpacity = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
      }),
      Animated.timing(leafOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(leafRotate1, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      Animated.timing(leafRotate2, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(leafOpacity, {
        toValue: isActive ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const leaf1Rotation = leafRotate1.interpolate({
    inputRange: [0, 1],
    outputRange: ['-30deg', '0deg'],
  });

  const leaf2Rotation = leafRotate2.interpolate({
    inputRange: [0, 1],
    outputRange: ['30deg', '0deg'],
  });

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[
          styles.chip,
          isActive && styles.chipActive,
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        {/* Feuille gauche */}
        <Animated.View 
          style={[
            styles.leafLeft,
            { 
              opacity: isActive ? 1 : leafOpacity,
              transform: [{ rotate: leaf1Rotation }],
            }
          ]}
        >
          <Feather name="feather" size={12} color={colors.accentPrimary} />
        </Animated.View>

        {/* Contenu */}
        <View style={styles.chipContent}>
          {icon && (
            <View style={[
              styles.iconContainer,
              isActive && styles.iconContainerActive,
            ]}>
              <Feather 
                name={icon as any} 
                size={14} 
                color={isActive ? colors.accentPrimary : colors.textMuted} 
              />
            </View>
          )}
          <Text style={[
            styles.chipText,
            isActive && styles.chipTextActive,
          ]}>
            {label}
          </Text>
        </View>

        {/* Feuille droite */}
        <Animated.View 
          style={[
            styles.leafRight,
            { 
              opacity: isActive ? 1 : leafOpacity,
              transform: [{ rotate: leaf2Rotation }, { scaleX: -1 }],
            }
          ]}
        >
          <Feather name="feather" size={12} color={colors.accentPrimary} />
        </Animated.View>

        {/* Bordure décorative naturelle */}
        {isActive && (
          <View style={styles.activeBorder}>
            <View style={styles.vineTop} />
            <View style={styles.vineBottom} />
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 4,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1.5,
    borderColor: colors.border,
    position: 'relative',
    overflow: 'visible',
  },
  chipActive: {
    backgroundColor: 'rgba(120, 166, 134, 0.15)',
    borderColor: colors.accentPrimary,
    borderWidth: 2,
  },
  chipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  iconContainer: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(107, 114, 128, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerActive: {
    backgroundColor: 'rgba(120, 166, 134, 0.25)',
  },
  chipText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  chipTextActive: {
    color: colors.accentPrimary,
    fontWeight: '600',
  },
  leafLeft: {
    position: 'absolute',
    left: -4,
    top: -6,
  },
  leafRight: {
    position: 'absolute',
    right: -4,
    top: -6,
  },
  activeBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  vineTop: {
    position: 'absolute',
    top: -1,
    left: '20%',
    width: 30,
    height: 3,
    backgroundColor: colors.accentPrimary,
    borderRadius: 2,
    opacity: 0.4,
  },
  vineBottom: {
    position: 'absolute',
    bottom: -1,
    right: '20%',
    width: 20,
    height: 3,
    backgroundColor: colors.accentPrimary,
    borderRadius: 2,
    opacity: 0.3,
  },
});
