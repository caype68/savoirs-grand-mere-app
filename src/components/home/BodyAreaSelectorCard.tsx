import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius } from '../../theme/colors';
import { bodyPainZones } from '../../assets';

type BodyZone = 'tete' | 'gorge' | 'poitrine' | 'ventre' | 'bras' | 'dos' | 'jambes' | 'epaules' | 'coudes' | 'genoux';
type BodyView = 'front' | 'back';

interface BodyAreaSelectorCardProps {
  onSelectZone: (zone: BodyZone) => void;
  selectedZone: BodyZone | null;
}

interface ZoneButton {
  id: BodyZone;
  label: string;
}

const frontZones: ZoneButton[] = [
  { id: 'tete', label: 'Tête' },
  { id: 'gorge', label: 'Gorge' },
  { id: 'epaules', label: 'Épaules' },
  { id: 'poitrine', label: 'Poitrine' },
  { id: 'coudes', label: 'Coudes' },
  { id: 'ventre', label: 'Ventre' },
  { id: 'genoux', label: 'Genoux' },
  { id: 'jambes', label: 'Jambes' },
];

const backZones: ZoneButton[] = [
  { id: 'tete', label: 'Tête' },
  { id: 'dos', label: 'Dos' },
  { id: 'epaules', label: 'Épaules' },
  { id: 'coudes', label: 'Coudes' },
  { id: 'jambes', label: 'Jambes' },
];

const ZoneChip: React.FC<{
  zone: ZoneButton;
  isSelected: boolean;
  onPress: () => void;
}> = ({ zone, isSelected, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
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
          styles.zoneChip,
          isSelected && styles.zoneChipSelected,
          { transform: [{ scale: scaleAnim }] }
        ]}
      >
        <Text style={[styles.zoneChipLabel, isSelected && styles.zoneChipLabelSelected]}>
          {zone.label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

export const BodyAreaSelectorCard: React.FC<BodyAreaSelectorCardProps> = ({
  onSelectZone,
  selectedZone,
}) => {
  const [view, setView] = useState<BodyView>('front');
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const toggleView = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
    
    setTimeout(() => {
      setView(v => v === 'front' ? 'back' : 'front');
    }, 150);
  };

  const zones = view === 'front' ? frontZones : backZones;

  return (
    <View style={styles.container}>
      {/* View toggle */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, view === 'front' && styles.toggleButtonActive]}
          onPress={() => view !== 'front' && toggleView()}
        >
          <Text style={[styles.toggleText, view === 'front' && styles.toggleTextActive]}>
            Face avant
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, view === 'back' && styles.toggleButtonActive]}
          onPress={() => view !== 'back' && toggleView()}
        >
          <Text style={[styles.toggleText, view === 'back' && styles.toggleTextActive]}>
            Face arrière
          </Text>
        </TouchableOpacity>
      </View>

      {/* Body illustration with image */}
      <Animated.View style={[styles.bodyContainer, { opacity: fadeAnim }]}>
        <LinearGradient
          colors={['rgba(26, 31, 41, 0.95)', 'rgba(15, 17, 21, 0.98)']}
          style={styles.bodyBackground}
        >
          <Image 
            source={bodyPainZones} 
            style={styles.bodyImage}
            resizeMode="contain"
          />
        </LinearGradient>
      </Animated.View>

      {/* Zone buttons grid */}
      <View style={styles.zonesGrid}>
        {zones.map((zone) => (
          <ZoneChip
            key={zone.id}
            zone={zone}
            isSelected={selectedZone === zone.id}
            onPress={() => onSelectZone(zone.id)}
          />
        ))}
      </View>

      {/* Instructions */}
      <Text style={styles.instructions}>
        Touchez une zone pour voir les remèdes associés
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: 4,
    marginBottom: spacing.md,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
  },
  toggleButtonActive: {
    backgroundColor: colors.accentPrimaryMuted,
  },
  toggleText: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
  },
  toggleTextActive: {
    color: colors.accentPrimary,
    fontWeight: '600',
  },
  bodyContainer: {
    height: 200,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  bodyBackground: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bodyImage: {
    width: '100%',
    height: '100%',
    opacity: 0.9,
  },
  zonesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  zoneChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 80,
    alignItems: 'center',
  },
  zoneChipSelected: {
    backgroundColor: colors.accentPrimaryMuted,
    borderColor: colors.accentPrimary,
  },
  zoneChipLabel: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
  },
  zoneChipLabelSelected: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  instructions: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.textMuted,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
});
