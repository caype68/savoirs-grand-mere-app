import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Image,
  ImageBackground,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, typography, shadows } from '../theme/colors';
import { remedes } from '../data/remedes';
import { searchRemedes } from '../utils/search';
import { useFavoris } from '../hooks/useFavoris';
import { useRemedySearch } from '../hooks/useBackend';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { illustrations, textures, getIllustration, logoComplet, grandMereRemedes, frameNatural, getRemedyImage } from '../assets';
import { SymptomChip, AIQuestionFlow, isBroadSearchTerm, NaturalFrameCard } from '../components';

const { width } = Dimensions.get('window');

type SearchScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

// Chips maladies courantes avec icônes personnalisées
const symptomChips = [
  { id: 'rhume', label: 'Mal gorge', icon: 'thermometer' },
  { id: 'toux', label: 'Toux', icon: 'wind' },
  { id: 'fievre', label: 'Fièvre', icon: 'activity' },
  { id: 'stress', label: 'Stress', icon: 'cloud' },
  { id: 'sommeil', label: 'Sommeil', icon: 'moon', active: true },
];

// Articles populaires avec illustrations locales
const popularArticles = [
  {
    id: 'rem-1',
    title: 'Camomille',
    subtitle: 'Infusion apaisante',
    category: 'Sommeil',
    badge: 'Bien-être',
    badgeColor: colors.accentPrimary,
    reads: '12,5k',
    verified: true,
    image: grandMereRemedes,
  },
  {
    id: 'rem-2',
    title: 'Gingembre anti-nausée',
    subtitle: 'Décoction digestive',
    category: 'Digestion',
    badge: 'Étude Scientifique',
    badgeColor: colors.accentSecondary,
    reads: '8,2k',
    verified: true,
    image: grandMereRemedes,
  },
  {
    id: 'rem-3',
    title: 'Miel & Citron',
    subtitle: 'Remède traditionnel',
    category: 'Gorge',
    badge: 'Tradition',
    badgeColor: colors.accentTertiary,
    reads: '15,3k',
    verified: true,
    image: grandMereRemedes,
  },
];

export const SearchScreen: React.FC<SearchScreenProps> = ({ navigation }) => {
  const [query, setQuery] = useState('');
  const [selectedChip, setSelectedChip] = useState<string | null>('sommeil');
  const [refinedSearchTerm, setRefinedSearchTerm] = useState<string | null>(null);
  const [showRefinementModal, setShowRefinementModal] = useState(false);
  const [pendingBroadTerm, setPendingBroadTerm] = useState<string>('');
  const { isFavori, toggleFavori } = useFavoris();

  // Use refined term if available, otherwise use chip or query
  const baseSearchTerm = selectedChip ? symptomChips.find(c => c.id === selectedChip)?.label || '' : query;
  
  // Check if the current query is a broad term that needs refinement
  const needsRefinement = isBroadSearchTerm(baseSearchTerm) && !refinedSearchTerm;
  
  // Only use the search term if it's not a broad term OR if it has been refined
  const searchTerm = needsRefinement ? '' : (refinedSearchTerm || baseSearchTerm);

  // Utiliser le hook hybride pour la recherche (backend si disponible, sinon local)
  const { data: backendResults, isLoading: isSearching, source } = useRemedySearch(searchTerm, 30);

  // Fallback local si le hook ne retourne rien ou en cas d'erreur
  const results = useMemo(() => {
    // Si on a des résultats du backend, les utiliser
    if (backendResults && backendResults.length > 0) {
      return backendResults;
    }
    // Sinon, recherche locale
    if (!searchTerm.trim()) return [];
    return searchRemedes(remedes, searchTerm, {
      route: null,
      livre: null,
      confianceMin: undefined,
      verifieOnly: false,
    });
  }, [searchTerm, backendResults]);

  const handleSearchSubmit = () => {
    const term = query.trim();
    if (term && isBroadSearchTerm(term)) {
      setPendingBroadTerm(term);
      setShowRefinementModal(true);
    }
  };

  const handleAIComplete = (refinedTerm: string) => {
    // Use the refined search term from AI questions
    setRefinedSearchTerm(refinedTerm);
    setShowRefinementModal(false);
  };

  const handleSkipRefinement = () => {
    // When skipping, use the original broad term to show all results
    setRefinedSearchTerm(pendingBroadTerm);
    setShowRefinementModal(false);
  };

  const handleChipPress = (chipId: string) => {
    setRefinedSearchTerm(null); // Reset refinement when changing chips
    if (selectedChip === chipId) {
      setSelectedChip(null);
    } else {
      setSelectedChip(chipId);
    }
  };

  const handleArticlePress = (articleId: string) => {
    navigation.navigate('RemedeDetail', { remedeId: articleId });
  };

  const handleResultPress = (remedeId: string) => {
    navigation.navigate('RemedeDetail', { remedeId });
  };

  const hasActiveSearch = query.trim().length > 0 || selectedChip !== null;

  return (
    <View style={styles.container}>
      {/* Texture de fond */}
      <ImageBackground
        source={textures.grainDark}
        style={styles.backgroundTexture}
        imageStyle={{ opacity: 0.4 }}
      >
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          {/* Header avec logo complet centré */}
          <View style={styles.header}>
            <Image source={logoComplet} style={styles.headerLogoComplet} resizeMode="contain" />
          </View>

          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <View style={styles.searchBar}>
                <Feather name="search" size={20} color={colors.textMuted} />
                <TextInput
                  style={styles.searchInput}
                  value={query}
                  onChangeText={(text) => {
                    setQuery(text);
                    setSelectedChip(null);
                    setRefinedSearchTerm(null);
                    // Auto-show modal for broad terms
                    if (text.trim() && isBroadSearchTerm(text)) {
                      setPendingBroadTerm(text.trim());
                      setShowRefinementModal(true);
                    }
                  }}
                  onSubmitEditing={handleSearchSubmit}
                  placeholder="Rechercher un remède ou une plante..."
                  placeholderTextColor={colors.textMuted}
                  returnKeyType="search"
                />
                {query.length > 0 && (
                  <TouchableOpacity onPress={() => { setQuery(''); }}>
                    <Feather name="x" size={18} color={colors.textMuted} />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Symptom Chips avec effets naturels */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsContainer}
            >
              {symptomChips.map((chip) => (
                <SymptomChip
                  key={chip.id}
                  label={chip.label}
                  icon={chip.icon}
                  isActive={selectedChip === chip.id}
                  onPress={() => handleChipPress(chip.id)}
                />
              ))}
            </ScrollView>

            {/* Disclaimer Banner */}
            <View style={styles.disclaimerBanner}>
              <ImageBackground
                source={textures.amberWarm}
                style={styles.disclaimerBackground}
                imageStyle={styles.disclaimerBackgroundImage}
              >
                <View style={styles.disclaimerContent}>
                  <Feather name="alert-circle" size={18} color={colors.textPrimary} />
                  <Text style={styles.disclaimerText}>
                    Ces informations sont issues de savoirs traditionnels et ne remplacent pas un avis médical.
                  </Text>
                </View>
              </ImageBackground>
            </View>

            {/* Section Title - Only show when not searching */}
            {!isSearching && (
              <>
                <Text style={styles.sectionTitle}>REMÈDES POPULAIRES</Text>

                {/* Article Cards */}
                <View style={styles.articlesContainer}>
                  {popularArticles.map((article) => (
                <TouchableOpacity
                  key={article.id}
                  style={styles.articleCard}
                  onPress={() => handleArticlePress(article.id)}
                  activeOpacity={0.9}
                >
                  <ImageBackground
                    source={textures.cardSoft}
                    style={styles.articleCardBackground}
                    imageStyle={styles.articleCardBackgroundImage}
                  >
                    <View style={styles.articleContent}>
                      <View style={styles.articleLeft}>
                        {/* Badge */}
                        <View style={[styles.articleBadge, { backgroundColor: article.badgeColor + '25' }]}>
                          <Text style={[styles.articleBadgeText, { color: article.badgeColor }]}>
                            {article.badge}
                          </Text>
                        </View>
                        
                        {/* Title */}
                        <Text style={styles.articleTitle}>{article.title}</Text>
                        <Text style={styles.articleSubtitle}>{article.subtitle}</Text>
                        
                        {/* Meta */}
                        <View style={styles.articleMeta}>
                          {article.verified && (
                            <View style={styles.verifiedBadge}>
                              <Feather name="check-circle" size={12} color={colors.accentPrimary} />
                              <Text style={styles.verifiedText}>Source vérifiée</Text>
                            </View>
                          )}
                          <Text style={styles.articleReads}>{article.reads} lectures</Text>
                        </View>
                      </View>
                      
                      {/* Image */}
                      <View style={styles.articleImageContainer}>
                        <Image
                          source={article.image}
                          style={styles.articleImage}
                          resizeMode="cover"
                        />
                      </View>
                    </View>
                  </ImageBackground>
                </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {/* Results if searching */}
            {hasActiveSearch && results.length > 0 && (
              <View style={styles.resultsSection}>
                <Text style={styles.sectionTitle}>
                  {results.length} RÉSULTAT{results.length > 1 ? 'S' : ''}
                  {source === 'remote' && ' (backend)'}
                </Text>
                {isSearching && (
                  <ActivityIndicator size="small" color={colors.accentPrimary} style={{ marginBottom: spacing.sm }} />
                )}
                {results.map((result) => {
                  // Gérer les deux formats: SearchResult (avec .remede) ou Remede direct
                  const remede = 'remede' in result ? result.remede : result;
                  return (
                    <NaturalFrameCard
                      key={remede.id}
                      title={remede.nom}
                      subtitle={remede.indications[0]}
                      image={getRemedyImage(remede.nom, remede.route)}
                      onPress={() => handleResultPress(remede.id)}
                    />
                  );
                })}
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>

      {/* AI Question Flow Modal */}
      <AIQuestionFlow
        visible={showRefinementModal}
        searchTerm={pendingBroadTerm}
        onClose={() => setShowRefinementModal(false)}
        onComplete={handleAIComplete}
        onSkip={handleSkipRefinement}
      />
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  headerLogoComplet: {
    width: width - spacing.lg * 2,
    height: 140,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 4,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    padding: 0,
  },
  chipsContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.md,
  },
  disclaimerBanner: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  disclaimerBackground: {
    padding: spacing.lg,
  },
  disclaimerBackgroundImage: {
    borderRadius: borderRadius.lg,
    opacity: 0.9,
  },
  disclaimerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  disclaimerText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    flex: 1,
    lineHeight: 20,
    opacity: 0.9,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.textMuted,
    letterSpacing: 1.5,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  articlesContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  articleCard: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  articleCardBackground: {
    padding: spacing.lg,
  },
  articleCardBackgroundImage: {
    borderRadius: borderRadius.lg,
    opacity: 0.6,
  },
  articleContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  articleLeft: {
    flex: 1,
    paddingRight: spacing.md,
  },
  articleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
  },
  articleBadgeText: {
    ...typography.caption,
    fontWeight: '600',
  },
  articleTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  articleSubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  articleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  verifiedText: {
    ...typography.caption,
    color: colors.accentPrimary,
  },
  articleReads: {
    ...typography.caption,
    color: colors.textMuted,
  },
  articleImageContainer: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  articleImage: {
    width: '100%',
    height: '100%',
  },
  resultsSection: {
    marginTop: spacing.xl,
    paddingHorizontal: 0,
  },
  resultCardWrapper: {
    marginBottom: spacing.md,
    width: '100%',
    overflow: 'hidden',
  },
  resultCardFrame: {
    width: '100%',
    aspectRatio: 2.8,
    overflow: 'hidden',
  },
  resultCardFrameImage: {
    width: '100%',
    height: '100%',
  },
  resultCardContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: '8%',
    paddingRight: '8%',
  },
  resultImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: 'rgba(139, 90, 43, 0.8)',
  },
  resultInfo: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  resultName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    ...Platform.select({
      web: { textShadow: '1px 1px 3px rgba(0, 0, 0, 0.9)' },
      default: {
        textShadowColor: 'rgba(0, 0, 0, 0.9)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
      },
    }),
  },
  resultIndication: {
    fontSize: 14,
    color: 'rgba(220, 220, 220, 0.95)',
    marginTop: 4,
    textAlign: 'center',
    ...Platform.select({
      web: { textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' },
      default: {
        textShadowColor: 'rgba(0, 0, 0, 0.7)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
      },
    }),
  },
});
