import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../theme/colors';
import { remedeTypeImages } from '../../assets';

type RouteType = 'orale' | 'cutanee' | 'inhalation';
type SubType = 'infusion' | 'tisane' | 'sirop' | 'friction' | 'compresse' | 'cataplasme' | 'vapeurs' | 'fumigation';

interface RemedyTypeGridProps {
  selectedRoute: RouteType | null;
  selectedSubType: SubType | null;
  onSelectRoute: (route: RouteType) => void;
  onSelectSubType: (subType: SubType) => void;
}

const routeTypes: { id: RouteType; label: string; icon: string; description: string; image: any }[] = [
  { id: 'orale', label: 'Orale', icon: 'coffee', description: 'À boire ou avaler', image: remedeTypeImages.infusion },
  { id: 'cutanee', label: 'Cutanée', icon: 'droplet', description: 'Application sur la peau', image: remedeTypeImages.cataplasme },
  { id: 'inhalation', label: 'Inhalation', icon: 'wind', description: 'À respirer', image: remedeTypeImages.fumigation },
];

const subTypes: { id: SubType; route: RouteType; label: string }[] = [
  { id: 'infusion', route: 'orale', label: 'Infusion' },
  { id: 'tisane', route: 'orale', label: 'Tisane' },
  { id: 'sirop', route: 'orale', label: 'Sirop' },
  { id: 'friction', route: 'cutanee', label: 'Friction' },
  { id: 'compresse', route: 'cutanee', label: 'Compresse' },
  { id: 'cataplasme', route: 'cutanee', label: 'Cataplasme' },
  { id: 'vapeurs', route: 'inhalation', label: 'Vapeurs' },
  { id: 'fumigation', route: 'inhalation', label: 'Fumigation' },
];

const TypeCategoryCard: React.FC<{
  route: typeof routeTypes[0];
  isSelected: boolean;
  onPress: () => void;
}> = ({ route, isSelected, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.categoryCardWrapper}
    >
      <Animated.View style={[
        styles.categoryCard,
        isSelected && styles.categoryCardActive,
        { transform: [{ scale: scaleAnim }] }
      ]}>
        <Image source={route.image} style={styles.categoryImage} />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.categoryGradient}
        />
        <View style={styles.categoryContent}>
          <Feather name={route.icon as any} size={20} color={colors.textPrimary} />
          <Text style={styles.categoryLabel}>{route.label}</Text>
          <Text style={styles.categoryDescription}>{route.description}</Text>
        </View>
        {isSelected && (
          <View style={styles.selectedIndicator}>
            <Feather name="check" size={14} color={colors.textPrimary} />
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

const TypeMiniChip: React.FC<{
  subType: typeof subTypes[0];
  isSelected: boolean;
  onPress: () => void;
}> = ({ subType, isSelected, onPress }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[styles.miniChip, isSelected && styles.miniChipActive]}
    >
      <Text style={[styles.miniChipLabel, isSelected && styles.miniChipLabelActive]}>
        {subType.label}
      </Text>
    </TouchableOpacity>
  );
};

export const RemedyTypeGrid: React.FC<RemedyTypeGridProps> = ({
  selectedRoute,
  selectedSubType,
  onSelectRoute,
  onSelectSubType,
}) => {
  const filteredSubTypes = selectedRoute 
    ? subTypes.filter(st => st.route === selectedRoute)
    : subTypes;

  return (
    <View style={styles.container}>
      {/* Main category cards */}
      <View style={styles.categoriesRow}>
        {routeTypes.map((route) => (
          <TypeCategoryCard
            key={route.id}
            route={route}
            isSelected={selectedRoute === route.id}
            onPress={() => onSelectRoute(route.id)}
          />
        ))}
      </View>

      {/* Sub-type chips */}
      <View style={styles.subTypesContainer}>
        <Text style={styles.subTypesTitle}>Sous-types</Text>
        <View style={styles.subTypesRow}>
          {filteredSubTypes.map((subType) => (
            <TypeMiniChip
              key={subType.id}
              subType={subType}
              isSelected={selectedSubType === subType.id}
              onPress={() => onSelectSubType(subType.id)}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
  },
  categoriesRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  categoryCardWrapper: {
    flex: 1,
  },
  categoryCard: {
    height: 120,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryCardActive: {
    borderColor: colors.accentPrimary,
    borderWidth: 2,
  },
  categoryImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    opacity: 0.6,
  },
  categoryGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  categoryContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.sm,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 4,
  },
  categoryDescription: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.accentPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subTypesContainer: {
    marginTop: spacing.lg,
  },
  subTypesTitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  subTypesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  miniChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  miniChipActive: {
    backgroundColor: colors.accentPrimaryMuted,
    borderColor: colors.accentPrimary,
  },
  miniChipLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  miniChipLabelActive: {
    color: colors.textPrimary,
    fontWeight: '500',
  },
});
