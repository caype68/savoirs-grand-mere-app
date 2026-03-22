import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../theme/colors';
import { plantes, remedes } from '../data/remedes';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { illustrations, textures, getIllustration } from '../assets';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - spacing.lg * 3) / 2;

type ExploreScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

// Catégories avec icônes
const categories = [
  { id: 'sommeil', label: 'Sommeil', icon: 'moon' },
  { id: 'stress', label: 'Stress', icon: 'cloud' },
  { id: 'digestion', label: 'Digestion', icon: 'coffee' },
  { id: 'immunite', label: 'Immunité', icon: 'shield' },
  { id: 'douleurs', label: 'Douleurs', icon: 'activity' },
  { id: 'peau', label: 'Peau', icon: 'droplet' },
  { id: 'rhume', label: 'Rhume', icon: 'thermometer' },
  { id: 'energie', label: 'Énergie', icon: 'zap' },
];

// Plantes populaires avec illustrations locales
const popularPlants = [
  { id: 'camomille', name: 'Camomille', usage: 'Sommeil • Stress', image: illustrations.camomille },
  { id: 'gingembre', name: 'Gingembre', usage: 'Digestion • Nausées', image: illustrations.gingembre },
  { id: 'menthe', name: 'Menthe', usage: 'Digestion • Fraîcheur', image: illustrations.menthe },
  { id: 'curcuma', name: 'Curcuma', usage: 'Anti-inflammatoire', image: illustrations.curcuma },
  { id: 'eucalyptus', name: 'Eucalyptus', usage: 'Respiration • Rhume', image: illustrations.eucalyptus },
  { id: 'tilleul', name: 'Tilleul', usage: 'Sommeil • Calme', image: illustrations.tilleul },
];

export const ExploreScreen: React.FC<ExploreScreenProps> = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleCategoryPress = (categoryId: string) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
  };

  const handlePlantPress = (plantId: string) => {
    navigation.navigate('IngredientDetail', { ingredientId: plantId });
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={textures.grainDark}
        style={styles.backgroundTexture}
        imageStyle={{ opacity: 0.4 }}
      >
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerLabel}>Explorer</Text>
          </View>

          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Featured Card */}
            <View style={styles.featuredCard}>
              <ImageBackground
                source={textures.parchment}
                style={styles.featuredBackground}
                imageStyle={styles.featuredBackgroundImage}
              >
                <View style={styles.featuredContent}>
                  <Text style={styles.featuredTitle}>Découvrez nos remèdes naturels</Text>
                  <Text style={styles.featuredSubtitle}>
                    Plus de 50 recettes traditionnelles vérifiées
                  </Text>
                </View>
              </ImageBackground>
            </View>

            {/* Categories Section */}
            <Text style={styles.sectionTitle}>CATÉGORIES</Text>
            <View style={styles.categoriesGrid}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryCard,
                    selectedCategory === cat.id && styles.categoryCardActive,
                  ]}
                  onPress={() => handleCategoryPress(cat.id)}
                  activeOpacity={0.8}
                >
                  <Feather 
                    name={cat.icon as any} 
                    size={20} 
                    color={selectedCategory === cat.id ? colors.accentPrimary : colors.textSecondary} 
                  />
                  <Text style={[
                    styles.categoryLabel,
                    selectedCategory === cat.id && styles.categoryLabelActive,
                  ]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Plants Section */}
            <Text style={styles.sectionTitle}>PLANTES POPULAIRES</Text>
            <View style={styles.plantsGrid}>
              {popularPlants.map((plant) => (
                <TouchableOpacity
                  key={plant.id}
                  style={styles.plantCard}
                  onPress={() => handlePlantPress(plant.id)}
                  activeOpacity={0.85}
                >
                  <Image
                    source={plant.image}
                    style={styles.plantImage}
                    resizeMode="cover"
                  />
                  <View style={styles.plantInfo}>
                    <Text style={styles.plantName}>{plant.name}</Text>
                    <Text style={styles.plantUsage}>{plant.usage}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Guide Card */}
            <TouchableOpacity style={styles.guideCard} activeOpacity={0.9}>
              <ImageBackground
                source={textures.amberWarm}
                style={styles.guideBackground}
                imageStyle={styles.guideBackgroundImage}
              >
                <View style={styles.guideContent}>
                  <Image
                    source={illustrations.guide}
                    style={styles.guideImage}
                    resizeMode="cover"
                  />
                  <View style={styles.guideText}>
                    <Text style={styles.guideTitle}>Guide du débutant</Text>
                    <Text style={styles.guideSubtitle}>
                      Apprenez les bases des remèdes naturels
                    </Text>
                  </View>
                  <Feather name="chevron-right" size={24} color={colors.textPrimary} />
                </View>
              </ImageBackground>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backgroundTexture: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  headerLabel: {
    ...typography.h1,
    color: colors.textPrimary,
    fontSize: 28,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  featuredCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  featuredBackground: {
    padding: spacing.xl,
  },
  featuredBackgroundImage: {
    borderRadius: borderRadius.xl,
    opacity: 0.15,
  },
  featuredContent: {
    alignItems: 'flex-start',
  },
  featuredTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  featuredSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.textMuted,
    letterSpacing: 1.5,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    marginTop: spacing.md,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  categoryCardActive: {
    borderColor: colors.accentPrimary,
    backgroundColor: colors.accentPrimaryMuted,
  },
  categoryLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  categoryLabelActive: {
    color: colors.accentPrimary,
    fontWeight: '600',
  },
  plantsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  plantCard: {
    width: CARD_WIDTH,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceCard,
  },
  plantImage: {
    width: '100%',
    height: 120,
    backgroundColor: colors.surface,
  },
  plantInfo: {
    padding: spacing.md,
    backgroundColor: colors.surfaceCard,
  },
  plantName: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  plantUsage: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  guideCard: {
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  guideBackground: {
    padding: spacing.lg,
  },
  guideBackgroundImage: {
    borderRadius: borderRadius.lg,
    opacity: 0.9,
  },
  guideContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  guideImage: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.md,
  },
  guideText: {
    flex: 1,
  },
  guideTitle: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  guideSubtitle: {
    ...typography.caption,
    color: colors.textPrimary,
    opacity: 0.8,
    marginTop: 2,
  },
});
