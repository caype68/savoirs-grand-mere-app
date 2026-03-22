import React, { useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../theme/colors';
import { remedeTypeImages } from '../../assets';

interface Method {
  id: string;
  title: string;
  description: string;
  image: any;
}

const methods: Method[] = [
  { id: 'infusions', title: 'Infusions', description: 'Boissons chaudes apaisantes', image: remedeTypeImages.infusion },
  { id: 'cataplasmes', title: 'Cataplasmes', description: 'Applications locales', image: remedeTypeImages.cataplasme },
  { id: 'vapeurs', title: 'Vapeurs', description: 'Inhalations bienfaisantes', image: remedeTypeImages.fumigation },
];

interface PopularMethodsSectionProps {
  onSelectMethod: (methodId: string) => void;
}

const MethodFeatureCard: React.FC<{
  method: Method;
  onPress: () => void;
}> = ({ method, onPress }) => {
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
    >
      <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
        <Image source={method.image} style={styles.cardImage} />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.85)']}
          style={styles.cardGradient}
        />
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{method.title}</Text>
          <Text style={styles.cardDescription}>{method.description}</Text>
        </View>
        <View style={styles.arrowContainer}>
          <Feather name="arrow-right" size={16} color={colors.textPrimary} />
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

export const PopularMethodsSection: React.FC<PopularMethodsSectionProps> = ({
  onSelectMethod,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>MÉTHODES POPULAIRES</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {methods.map((method) => (
          <MethodFeatureCard
            key={method.id}
            method={method}
            onPress={() => onSelectMethod(method.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  card: {
    width: 140,
    height: 160,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    marginRight: spacing.md,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  cardGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  cardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.sm,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  cardDescription: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  arrowContainer: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(120, 166, 134, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
