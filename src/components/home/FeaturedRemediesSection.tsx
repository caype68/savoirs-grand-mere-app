import React, { useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../theme/colors';
import { getRemedyImage } from '../../assets';

interface FeaturedRemedy {
  id: string;
  title: string;
  subtitle: string;
  route: 'orale' | 'cutanee' | 'inhalation';
  badge?: string;
}

const featuredRemedies: FeaturedRemedy[] = [
  { id: 'infusion-thym', title: 'Infusion de thym', subtitle: 'Gorge irritée', route: 'orale', badge: 'Populaire' },
  { id: 'argile-cataplasme', title: 'Cataplasme d\'argile', subtitle: 'Douleurs articulaires', route: 'cutanee' },
  { id: 'lavande-inhalation', title: 'Inhalation lavande', subtitle: 'Respiration & détente', route: 'inhalation' },
];

interface FeaturedRemediesSectionProps {
  onSelectRemedy: (remedyId: string) => void;
}

const FeaturedRemedyCard: React.FC<{
  remedy: FeaturedRemedy;
  onPress: () => void;
}> = ({ remedy, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
  };

  const image = getRemedyImage(remedy.title, remedy.route);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.imageContainer}>
          <Image source={image} style={styles.cardImage} />
        </View>
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle} numberOfLines={1}>{remedy.title}</Text>
            {remedy.badge && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{remedy.badge}</Text>
              </View>
            )}
          </View>
          <Text style={styles.cardSubtitle}>{remedy.subtitle}</Text>
          <View style={styles.routeBadge}>
            <Feather 
              name={remedy.route === 'orale' ? 'coffee' : remedy.route === 'cutanee' ? 'droplet' : 'wind'} 
              size={10} 
              color={colors.accentPrimary} 
            />
            <Text style={styles.routeText}>{remedy.route}</Text>
          </View>
        </View>
        <Feather name="chevron-right" size={18} color={colors.textMuted} style={styles.arrow} />
      </Animated.View>
    </TouchableOpacity>
  );
};

export const FeaturedRemediesSection: React.FC<FeaturedRemediesSectionProps> = ({
  onSelectRemedy,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>REMÈDES POPULAIRES</Text>
      {featuredRemedies.map((remedy) => (
        <FeaturedRemedyCard
          key={remedy.id}
          remedy={remedy}
          onPress={() => onSelectRemedy(remedy.id)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  imageContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  badge: {
    backgroundColor: colors.accentSecondaryMuted,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '600',
    color: colors.accentSecondary,
    textTransform: 'uppercase',
  },
  cardSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  routeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: 4,
  },
  routeText: {
    fontSize: 10,
    color: colors.accentPrimary,
    textTransform: 'capitalize',
  },
  arrow: {
    marginLeft: spacing.sm,
  },
});
