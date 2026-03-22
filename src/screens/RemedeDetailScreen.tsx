import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Share,
  Image,
  ImageBackground,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, typography, shadows } from '../theme/colors';
import { useFavoris } from '../hooks/useFavoris';
import { useRemedy } from '../hooks/useBackend';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { textures, getRemedyImage } from '../assets';
import { SponsoredProductsSection } from '../components/SponsoredProductsSection';
import { AffiliateProductsSection } from '../components/AffiliateProductsSection';

type RootStackParamList = {
  MainTabs: undefined;
  RemedeDetail: { remedeId: string };
  IngredientDetail: { ingredientId: string };
};

type RemedeDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'RemedeDetail'>;

export const RemedeDetailScreen: React.FC<RemedeDetailScreenProps> = ({ navigation, route }) => {
  const { remedeId } = route.params;
  
  // Utiliser le hook hybride pour charger le remède
  const { data: remede, isLoading, error, source } = useRemedy(remedeId);
  
  const { isFavori, toggleFavori } = useFavoris();
  const [expandedSections, setExpandedSections] = useState<string[]>(['bienfaits']);

  // Get illustration for this remedy
  const remedeImage = remede ? getRemedyImage(remede.nom, remede.route) : null;

  // État de chargement
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accentPrimary} />
          <Text style={styles.loadingText}>Chargement du remède...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // État d'erreur ou remède non trouvé
  if (error || !remede) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={48} color={colors.textMuted} />
          <Text style={styles.errorText}>
            {error ? 'Erreur de chargement' : 'Remède non trouvé'}
          </Text>
          {error && (
            <Text style={styles.errorSubtext}>{error.message}</Text>
          )}
          <TouchableOpacity 
            style={styles.backButtonError}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${remede.nom} - Savoirs de Grand-Mère\n\nIngrédients: ${remede.ingredients.map(i => i.nom).join(', ')}\n\nSource: ${remede.source.livre}, p.${remede.source.page}`,
      });
    } catch (error) {
      console.error('Erreur partage:', error);
    }
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(s => s !== sectionId)
        : [...prev, sectionId]
    );
  };


  const getReliabilityColor = (confidence: number) => {
    if (confidence >= 80) return colors.confidenceHigh;
    if (confidence >= 50) return colors.confidenceMedium;
    return colors.confidenceLow;
  };

  const sections = [
    {
      id: 'bienfaits',
      title: 'Bienfaits',
      icon: 'heart',
      content: remede.indications,
    },
    {
      id: 'preparation',
      title: 'Préparation',
      icon: 'edit-3',
      content: remede.preparation.map(p => p.instruction),
    },
    {
      id: 'dosage',
      title: 'Dosage',
      icon: 'clock',
      content: [
        remede.posologie.frequence,
        remede.posologie.duree ? `Durée: ${remede.posologie.duree}` : null,
        remede.posologie.remarques,
      ].filter(Boolean) as string[],
    },
    {
      id: 'precautions',
      title: 'Précautions',
      icon: 'alert-triangle',
      content: [
        ...remede.contreIndications,
        ...(remede.precautions || []),
      ],
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header Image */}
      <View style={styles.imageContainer}>
        <Image
          source={remedeImage}
          style={styles.headerImage}
        />
        <LinearGradient
          colors={['transparent', colors.background]}
          style={styles.imageGradient}
        />
        
        {/* Navigation */}
        <SafeAreaView style={styles.navBar} edges={['top']}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.navButton}
          >
            <Feather name="arrow-left" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.navActions}>
            <TouchableOpacity 
              onPress={() => toggleFavori(remedeId)} 
              style={styles.navButton}
            >
              <Feather 
                name="heart" 
                size={22} 
                color={isFavori(remedeId) ? colors.error : colors.textPrimary}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShare} style={styles.navButton}>
              <Feather name="share-2" size={22} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Section */}
        <View style={styles.titleSection}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{remede.nom}</Text>
            {remede.verifie && (
              <View style={styles.verifiedBadge}>
                <Feather name="check" size={12} color={colors.background} />
              </View>
            )}
          </View>
          
          {/* Route badge */}
          <View style={styles.routeBadge}>
            <Feather 
              name={remede.route === 'orale' ? 'coffee' : remede.route === 'cutanee' ? 'droplet' : 'wind'} 
              size={12} 
              color={colors.accentSecondary} 
            />
            <Text style={styles.routeText}>
              {remede.route === 'orale' ? 'Voie orale' : remede.route === 'cutanee' ? 'Application cutanée' : 'Inhalation'}
            </Text>
          </View>

          {/* AI Badge for grimoire remedies */}
          {remede.source.livre === 'grimoire-remedes-naturels' && (
            <View style={styles.aiBadgeRow}>
              <View style={styles.aiBadge}>
                <Feather name="cpu" size={12} color={colors.accentSecondary} />
                <Text style={styles.aiBadgeText}>Poussé par IA</Text>
              </View>
            </View>
          )}
        </View>

        {/* Ingredients */}
        <View style={styles.ingredientsSection}>
          <Text style={styles.sectionLabel}>Ingrédients</Text>
          <View style={styles.ingredientsList}>
            {remede.ingredients.map((ingredient, index) => (
              <View key={index} style={styles.ingredientChip}>
                <Feather name="feather" size={12} color={colors.accentPrimary} />
                <Text style={styles.ingredientName}>{ingredient.nom}</Text>
                {ingredient.quantite && (
                  <Text style={styles.ingredientQty}>{ingredient.quantite}</Text>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Accordion Sections */}
        {sections.map((section) => (
          <View key={section.id} style={styles.accordionSection}>
            <TouchableOpacity
              style={styles.accordionHeader}
              onPress={() => toggleSection(section.id)}
              activeOpacity={0.7}
            >
              <View style={styles.accordionTitleRow}>
                <View style={styles.accordionIcon}>
                  <Feather name={section.icon as any} size={16} color={colors.accentPrimary} />
                </View>
                <Text style={styles.accordionTitle}>{section.title}</Text>
              </View>
              <Feather 
                name={expandedSections.includes(section.id) ? 'chevron-up' : 'chevron-down'} 
                size={20} 
                color={colors.textMuted} 
              />
            </TouchableOpacity>
            
            {expandedSections.includes(section.id) && (
              <View style={styles.accordionContent}>
                {section.content.length > 0 ? (
                  section.content.map((item, index) => (
                    <View key={index} style={styles.contentItem}>
                      <View style={styles.bulletPoint} />
                      <Text style={styles.contentText}>{item}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyContent}>Aucune information disponible</Text>
                )}
              </View>
            )}
          </View>
        ))}

        {/* Source Section */}
        <View style={styles.sourceSection}>
          <Text style={styles.sectionLabel}>Source du livre</Text>
          <View style={styles.sourceCard}>
            <View style={styles.sourceIcon}>
              <Feather name="book-open" size={24} color={colors.accentSecondary} />
            </View>
            <View style={styles.sourceInfo}>
              <Text style={styles.sourceTitle}>{remede.source.livre}</Text>
              <Text style={styles.sourceMeta}>Page {remede.source.page}</Text>
              {remede.source.edition && (
                <Text style={styles.sourceMeta}>Édition: {remede.source.edition}</Text>
              )}
            </View>
          </View>
          
          {remede.source.extrait && (
            <View style={styles.extractCard}>
              <Feather name="file-text" size={14} color={colors.textMuted} />
              <Text style={styles.extractText}>"{remede.source.extrait}"</Text>
            </View>
          )}
        </View>

        {/* Produits Sponsorisés (ancien système) */}
        <SponsoredProductsSection remedeId={remede.id} />

        {/* Acheter les ingrédients - Amazon Affilié */}
        <AffiliateProductsSection remedyId={remede.id} />

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Feather name="info" size={14} color={colors.warning} />
          <Text style={styles.disclaimerText}>
            Ces informations sont issues de savoirs traditionnels et ne remplacent pas un avis médical.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    ...typography.h3,
    color: colors.textSecondary,
    marginTop: spacing.lg,
  },
  backButtonError: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
  },
  backButtonText: {
    ...typography.bodyMedium,
    color: colors.accentPrimary,
  },
  imageContainer: {
    height: 220,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.surface,
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  navBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(15, 17, 21, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  content: {
    flex: 1,
    marginTop: -spacing.xl,
  },
  contentContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 100,
  },
  titleSection: {
    marginBottom: spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    fontSize: 28,
  },
  verifiedBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.accentPrimary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  routeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  routeText: {
    ...typography.bodySmall,
    color: colors.accentSecondary,
  },
  reliabilityRow: {
    marginTop: spacing.md,
  },
  reliabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  reliabilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  reliabilityText: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
  ingredientsSection: {
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  ingredientsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  ingredientChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceCard,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  ingredientName: {
    ...typography.bodySmall,
    color: colors.textPrimary,
  },
  ingredientQty: {
    ...typography.caption,
    color: colors.textMuted,
  },
  accordionSection: {
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  accordionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  accordionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accentPrimaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accordionTitle: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  accordionContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    paddingTop: spacing.xs,
  },
  contentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accentSecondary,
    marginTop: 7,
  },
  contentText: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 22,
  },
  emptyContent: {
    ...typography.body,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  sourceSection: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  sourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceCard,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  sourceIcon: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.md,
    backgroundColor: colors.accentSecondaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sourceInfo: {
    flex: 1,
  },
  sourceTitle: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  sourceMeta: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  extractCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  extractText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontStyle: 'italic',
    flex: 1,
    lineHeight: 20,
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  disclaimerText: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  aiBadgeRow: {
    marginTop: spacing.sm,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.accentSecondary + '20',
    borderRadius: borderRadius.md,
  },
  aiBadgeText: {
    fontSize: 12,
    color: colors.accentSecondary,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    color: colors.textSecondary,
    marginTop: spacing.md,
    fontSize: 14,
  },
  errorSubtext: {
    color: colors.textMuted,
    marginTop: spacing.xs,
    fontSize: 12,
    textAlign: 'center',
  },
});
