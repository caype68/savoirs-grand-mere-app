import React, { useMemo, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  ImageBackground,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, spacing, borderRadius } from '../theme/colors';
import { textures, getRemedyImage } from '../assets';
import { remedes } from '../data/remedes';
import { searchRemedes, SearchResult } from '../utils/search';

type RootStackParamList = {
  Results: { 
    searchTerm?: string; 
    mode?: 'symptom' | 'body' | 'type';
    zone?: string;
    route?: 'orale' | 'cutanee' | 'inhalation';
    subType?: string;
    method?: string;
    filteredIds?: string[]; // IDs des remèdes filtrés par l'IA
  };
  RemedeDetail: { remedeId: string };
  Compare: { remedeIds: string[] };
};

type ResultsScreenProps = NativeStackScreenProps<RootStackParamList, 'Results'>;

const filterChips = [
  { id: 'rapide', label: 'Rapide', icon: 'zap' },
  { id: 'facile', label: 'Facile', icon: 'check-circle' },
  { id: 'orale', label: 'Orale', icon: 'coffee' },
  { id: 'cutanee', label: 'Cutanée', icon: 'droplet' },
  { id: 'inhalation', label: 'Inhalation', icon: 'wind' },
];

const ResultsHeader: React.FC<{ 
  searchTerm: string; 
  mode?: string;
  zone?: string;
  onBack: () => void;
}> = ({ searchTerm, mode, zone, onBack }) => {
  let contextText = `Résultats pour : ${searchTerm}`;
  if (mode === 'body' && zone) {
    contextText = `Zone sélectionnée : ${zone}`;
  }

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Feather name="arrow-left" size={24} color={colors.textPrimary} />
      </TouchableOpacity>
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>{contextText}</Text>
      </View>
    </View>
  );
};

const FilterChip: React.FC<{
  chip: typeof filterChips[0];
  isSelected: boolean;
  onPress: () => void;
}> = ({ chip, isSelected, onPress }) => (
  <TouchableOpacity
    style={[styles.filterChip, isSelected && styles.filterChipActive]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Feather 
      name={chip.icon as any} 
      size={12} 
      color={isSelected ? colors.textPrimary : colors.textMuted} 
    />
    <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>
      {chip.label}
    </Text>
  </TouchableOpacity>
);

const HeroRemedyCard: React.FC<{
  result: SearchResult;
  onPress: () => void;
  onFavorite: () => void;
  isFavorite: boolean;
}> = ({ result, onPress, onFavorite, isFavorite }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const image = getRemedyImage(result.remede.nom, result.remede.route);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.98, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[styles.heroCard, { transform: [{ scale: scaleAnim }] }]}>
        <Image source={image} style={styles.heroImage} />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.9)']}
          style={styles.heroGradient}
        />
        
        {/* Favorite button */}
        <TouchableOpacity 
          style={styles.heroFavoriteButton}
          onPress={onFavorite}
        >
          <Feather 
            name={isFavorite ? 'heart' : 'heart'} 
            size={20} 
            color={isFavorite ? colors.error : colors.textPrimary} 
          />
        </TouchableOpacity>

        <View style={styles.heroContent}>
          <View style={styles.heroBadges}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>{result.remede.route}</Text>
            </View>
            {result.remede.verifie && (
              <View style={[styles.heroBadge, styles.heroBadgeVerified]}>
                <Feather name="check" size={10} color={colors.success} />
                <Text style={[styles.heroBadgeText, { color: colors.success }]}>Vérifié</Text>
              </View>
            )}
          </View>
          
          <Text style={styles.heroTitle}>{result.remede.nom}</Text>
          <Text style={styles.heroSubtitle}>{result.remede.indications[0]}</Text>
          
          <View style={styles.heroMeta}>
            <Text style={styles.heroMetaText}>
              {result.remede.ingredients.length} ingrédients • Préparation simple
            </Text>
          </View>

          <TouchableOpacity style={styles.heroButton} onPress={onPress}>
            <Text style={styles.heroButtonText}>Voir la fiche</Text>
            <Feather name="arrow-right" size={16} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const AlternativeRemedyCard: React.FC<{
  result: SearchResult;
  onPress: () => void;
}> = ({ result, onPress }) => {
  const image = getRemedyImage(result.remede.nom, result.remede.route);

  return (
    <TouchableOpacity style={styles.altCard} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.altImageContainer}>
        <Image source={image} style={styles.altImage} />
      </View>
      <View style={styles.altContent}>
        <Text style={styles.altTitle} numberOfLines={1}>{result.remede.nom}</Text>
        <Text style={styles.altSubtitle} numberOfLines={1}>{result.remede.indications[0]}</Text>
        <View style={styles.altBadge}>
          <Text style={styles.altBadgeText}>{result.remede.route}</Text>
        </View>
      </View>
      <Feather name="chevron-right" size={18} color={colors.textMuted} />
    </TouchableOpacity>
  );
};

export const ResultsScreen: React.FC<ResultsScreenProps> = ({ navigation, route }) => {
  const { searchTerm = '', mode, zone, route: routeFilter, subType, method, filteredIds } = route.params;
  const [selectedFilters, setSelectedFilters] = React.useState<string[]>([]);
  const [selectedForCompare, setSelectedForCompare] = React.useState<string[]>([]);

  const results = useMemo(() => {
    // Si on a des IDs filtrés par l'IA, les utiliser directement
    if (filteredIds && filteredIds.length > 0) {
      const filteredRemedes = remedes.filter(r => filteredIds.includes(r.id));
      return filteredRemedes.map(remede => ({
        remede,
        score: 100,
        matchedFields: ['ia-filtered'],
        matchReason: 'Filtré par IA',
      }));
    }

    let searchQuery = searchTerm;
    
    if (method) {
      searchQuery = method;
    }
    
    if (subType) {
      searchQuery = subType;
    }

    const baseResults = searchRemedes(remedes, searchQuery || '', {
      route: routeFilter || null,
      livre: null,
      confianceMin: undefined,
      verifieOnly: false,
    });

    // Apply filters
    let filtered = baseResults;
    if (selectedFilters.includes('orale')) {
      filtered = filtered.filter((r: SearchResult) => r.remede.route === 'orale');
    }
    if (selectedFilters.includes('cutanee')) {
      filtered = filtered.filter((r: SearchResult) => r.remede.route === 'cutanee');
    }
    if (selectedFilters.includes('inhalation')) {
      filtered = filtered.filter((r: SearchResult) => r.remede.route === 'inhalation');
    }

    return filtered;
  }, [searchTerm, routeFilter, subType, method, selectedFilters, filteredIds]);

  const toggleSelectForCompare = (remedeId: string) => {
    setSelectedForCompare(prev => {
      if (prev.includes(remedeId)) {
        return prev.filter(id => id !== remedeId);
      }
      if (prev.length >= 3) {
        return prev; // Max 3 remèdes
      }
      return [...prev, remedeId];
    });
  };

  const heroResult = results[0];
  const alternativeResults = results.slice(1);

  const handleCompare = () => {
    const remedeIds = results.slice(0, 3).map((r: SearchResult) => r.remede.id);
    navigation.navigate('Compare', { remedeIds });
  };

  const toggleFilter = (filterId: string) => {
    setSelectedFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(f => f !== filterId)
        : [...prev, filterId]
    );
  };

  const handleRemedyPress = (remedyId: string) => {
    navigation.navigate('RemedeDetail', { remedeId: remedyId });
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={textures.grainDark}
        style={styles.backgroundTexture}
        resizeMode="repeat"
      >
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          {/* Header */}
          <ResultsHeader 
            searchTerm={searchTerm}
            mode={mode}
            zone={zone}
            onBack={() => navigation.goBack()}
          />

          {/* Compare Bar - En haut */}
          {results.length > 1 && (
            <View style={styles.compareBar}>
              <View style={styles.compareBarLeft}>
                <Feather name="cpu" size={16} color={colors.accentPrimary} />
                <Text style={styles.compareBarText}>
                  {results.length} remède{results.length > 1 ? 's' : ''} trouvé{results.length > 1 ? 's' : ''}
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.compareButton} 
                onPress={handleCompare}
                activeOpacity={0.8}
              >
                <Feather name="columns" size={16} color="#fff" />
                <Text style={styles.compareButtonText}>Comparer</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Filter Bar */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filterBar}
            contentContainerStyle={styles.filterBarContent}
          >
            {filterChips.map((chip) => (
              <FilterChip
                key={chip.id}
                chip={chip}
                isSelected={selectedFilters.includes(chip.id)}
                onPress={() => toggleFilter(chip.id)}
              />
            ))}
          </ScrollView>

          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >

            {/* Hero Card */}
            {heroResult && (
              <HeroRemedyCard
                result={heroResult}
                onPress={() => handleRemedyPress(heroResult.remede.id)}
                onFavorite={() => {}}
                isFavorite={false}
              />
            )}

            {/* Alternative Results */}
            {alternativeResults.length > 0 && (
              <View style={styles.alternativesSection}>
                <Text style={styles.sectionTitle}>AUTRES ALTERNATIVES</Text>
                {alternativeResults.map((result) => (
                  <AlternativeRemedyCard
                    key={result.remede.id}
                    result={result}
                    onPress={() => handleRemedyPress(result.remede.id)}
                  />
                ))}
              </View>
            )}

            {/* Empty state */}
            {results.length === 0 && (
              <View style={styles.emptyState}>
                <Feather name="search" size={48} color={colors.textMuted} />
                <Text style={styles.emptyTitle}>Aucun remède trouvé</Text>
                <Text style={styles.emptySubtitle}>
                  Essayez avec "gorge", "ventre", "stress" ou explorez par zone du corps.
                </Text>
              </View>
            )}

            <View style={styles.bottomSpacer} />
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  filterBar: {
    maxHeight: 50,
  },
  filterBarContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    flexDirection: 'row',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  filterChipActive: {
    backgroundColor: colors.accentPrimaryMuted,
    borderColor: colors.accentPrimary,
  },
  filterChipText: {
    marginLeft: 6,
    fontSize: 12,
    color: colors.textMuted,
  },
  filterChipTextActive: {
    color: colors.textPrimary,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    minHeight: '100%',
  },
  resultsCount: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  heroCard: {
    height: 280,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    backgroundColor: colors.surfaceCard,
    marginBottom: spacing.lg,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  heroFavoriteButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
  },
  heroBadges: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    backgroundColor: 'rgba(120, 166, 134, 0.3)',
    gap: 4,
  },
  heroBadgeVerified: {
    backgroundColor: 'rgba(118, 181, 139, 0.2)',
  },
  heroBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.accentPrimary,
    textTransform: 'capitalize',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  heroSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  heroMeta: {
    marginTop: spacing.sm,
  },
  heroMetaText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  heroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentPrimary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  heroButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  alternativesSection: {
    marginTop: spacing.md,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  altCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  altImageContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  altImage: {
    width: '100%',
    height: '100%',
  },
  altContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  altTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  altSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  altBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.accentPrimaryMuted,
    marginTop: spacing.xs,
  },
  altBadgeText: {
    fontSize: 10,
    color: colors.accentPrimary,
    textTransform: 'capitalize',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  compareCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.accentPrimary,
    borderRadius: borderRadius.md,
    borderStyle: 'dashed',
    gap: spacing.sm,
  },
  compareCTAText: {
    fontSize: 14,
    color: colors.accentPrimary,
    fontWeight: '500',
  },
  compareBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  compareBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  compareBarText: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  compareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.accentPrimary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  compareButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 100,
  },
});
