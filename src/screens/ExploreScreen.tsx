import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, typography } from '../theme/colors';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { logo, plantPhotos } from '../assets';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - spacing.lg * 3) / 2;

type ExploreScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

// Catégories avec icônes
const categories = [
  { id: 'sommeil', label: 'Sommeil', icon: 'moon', color: '#818CF8' },
  { id: 'stress', label: 'Stress', icon: 'cloud', color: '#F472B6' },
  { id: 'digestion', label: 'Digestion', icon: 'coffee', color: '#34D399' },
  { id: 'immunite', label: 'Immunité', icon: 'shield', color: '#FBBF24' },
  { id: 'douleurs', label: 'Douleurs', icon: 'activity', color: '#F87171' },
  { id: 'peau', label: 'Peau', icon: 'droplet', color: '#60A5FA' },
  { id: 'rhume', label: 'Rhume', icon: 'thermometer', color: '#FB923C' },
  { id: 'energie', label: 'Énergie', icon: 'zap', color: '#A78BFA' },
];

// Plantes populaires avec images locales
const popularPlants = [
  { id: 'camomille', name: 'Camomille', usage: 'Sommeil • Stress', emoji: '🌼',
    image: plantPhotos.camomille },
  { id: 'gingembre', name: 'Gingembre', usage: 'Digestion • Nausées', emoji: '🫚',
    image: plantPhotos.gingembre },
  { id: 'menthe', name: 'Menthe', usage: 'Digestion • Fraîcheur', emoji: '🌿',
    image: plantPhotos.camomille },
  { id: 'curcuma', name: 'Curcuma', usage: 'Anti-inflammatoire', emoji: '🌾',
    image: plantPhotos.gingembre },
  { id: 'eucalyptus', name: 'Eucalyptus', usage: 'Respiration • Rhume', emoji: '🍃',
    image: plantPhotos.eucalyptus },
  { id: 'tilleul', name: 'Tilleul', usage: 'Sommeil • Calme', emoji: '🍵',
    image: plantPhotos.tilleul },
];

export const ExploreScreen: React.FC<ExploreScreenProps> = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const logoBounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrée avec fondu + slide
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: false }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: false }),
      Animated.spring(logoScale, { toValue: 1, friction: 4, tension: 80, useNativeDriver: false }),
    ]).start();

    // Bounce continu du logo
    const bounce = Animated.loop(
      Animated.sequence([
        Animated.timing(logoBounce, { toValue: -6, duration: 1500, useNativeDriver: false }),
        Animated.timing(logoBounce, { toValue: 0, duration: 1500, useNativeDriver: false }),
      ])
    );
    bounce.start();
    return () => bounce.stop();
  }, []);

  const handleCategoryPress = (categoryId: string) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
    // Naviguer vers les résultats de cette catégorie
    navigation.navigate('Results', { searchQuery: categoryId, searchType: 'symptom' });
  };

  const handlePlantPress = (plantId: string) => {
    navigation.navigate('IngredientDetail', { ingredientId: plantId });
  };

  const handleGuidePress = () => {
    navigation.navigate('BeginnerGuide');
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header animé avec logo */}
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Explorer</Text>
            <Text style={styles.headerSubtitle}>Découvrez les remèdes naturels</Text>
          </View>
          <Animated.View style={{
            transform: [
              { scale: logoScale },
              { translateY: logoBounce }
            ]
          }}>
            <Image source={logo} style={styles.headerLogo} />
          </Animated.View>
        </Animated.View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Carte Guide du débutant — mise en avant */}
          <Animated.View style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }}>
            <TouchableOpacity
              style={styles.guideCard}
              onPress={handleGuidePress}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#92400E', '#B45309', '#D97706']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.guideGradient}
              >
                <View style={styles.guideLeft}>
                  <Animated.View style={{
                    transform: [
                      { scale: logoScale },
                      { translateY: logoBounce }
                    ]
                  }}>
                    <Image source={logo} style={styles.guideLogo} />
                  </Animated.View>
                </View>
                <View style={styles.guideRight}>
                  <View style={styles.guideBadge}>
                    <Feather name="book-open" size={12} color="#FDE68A" />
                    <Text style={styles.guideBadgeText}>GUIDE DÉBUTANT</Text>
                  </View>
                  <Text style={styles.guideTitle}>Apprenez à vous soigner naturellement</Text>
                  <Text style={styles.guideSubtitle}>
                    Les bases des plantes médicinales expliquées par Grand-Mère
                  </Text>
                  <View style={styles.guideButton}>
                    <Text style={styles.guideButtonText}>Commencer</Text>
                    <Feather name="arrow-right" size={14} color="#92400E" />
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Catégories */}
          <Text style={styles.sectionTitle}>CATÉGORIES</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryChip,
                  selectedCategory === cat.id && { borderColor: cat.color, backgroundColor: `${cat.color}15` },
                ]}
                onPress={() => handleCategoryPress(cat.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.categoryIcon, { backgroundColor: `${cat.color}20` }]}>
                  <Feather
                    name={cat.icon as any}
                    size={16}
                    color={cat.color}
                  />
                </View>
                <Text style={[
                  styles.categoryLabel,
                  selectedCategory === cat.id && { color: cat.color, fontWeight: '600' },
                ]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Plantes Populaires */}
          <Text style={styles.sectionTitle}>PLANTES POPULAIRES</Text>
          <View style={styles.plantsGrid}>
            {popularPlants.map((plant, index) => (
              <Animated.View
                key={plant.id}
                style={{
                  opacity: fadeAnim,
                  width: CARD_WIDTH,
                }}
              >
                <TouchableOpacity
                  style={styles.plantCard}
                  onPress={() => handlePlantPress(plant.id)}
                  activeOpacity={0.85}
                >
                  <Image
                    source={plant.image}
                    style={styles.plantImage}
                    resizeMode="cover"
                  />
                  {/* Overlay gradient */}
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.7)']}
                    style={styles.plantOverlay}
                  >
                    <Text style={styles.plantEmoji}>{plant.emoji}</Text>
                    <Text style={styles.plantName}>{plant.name}</Text>
                    <Text style={styles.plantUsage}>{plant.usage}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>

          {/* Stats rapides */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>50+</Text>
              <Text style={styles.statLabel}>Remèdes</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>20+</Text>
              <Text style={styles.statLabel}>Plantes</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>100%</Text>
              <Text style={styles.statLabel}>Naturel</Text>
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 2,
  },
  headerLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },

  // Guide Card — premium design
  guideCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
  },
  guideGradient: {
    flexDirection: 'row',
    padding: spacing.lg,
    minHeight: 160,
  },
  guideLeft: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  guideLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: 'rgba(253, 230, 138, 0.5)',
  },
  guideRight: {
    flex: 1,
    justifyContent: 'center',
  },
  guideBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  guideBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FDE68A',
    letterSpacing: 1.5,
  },
  guideTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFBEB',
    lineHeight: 22,
    marginBottom: 6,
  },
  guideSubtitle: {
    fontSize: 12,
    color: 'rgba(255,251,235,0.7)',
    lineHeight: 16,
    marginBottom: 12,
  },
  guideButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FDE68A',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 6,
  },
  guideButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
  },

  // Section
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 1.5,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },

  // Categories — horizontal scroll
  categoriesScroll: {
    paddingHorizontal: spacing.lg,
    gap: 10,
    marginBottom: spacing.xl,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  categoryIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },

  // Plants Grid
  plantsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  plantCard: {
    width: '100%',
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.surfaceCard,
  },
  plantImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.surface,
  },
  plantOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    paddingTop: 40,
  },
  plantEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  plantName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  plantUsage: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
    backgroundColor: colors.surfaceCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.accentPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
});
