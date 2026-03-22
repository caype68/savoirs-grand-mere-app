// ============================================
// ÉCRAN DÉTAIL HUILE ESSENTIELLE
// ============================================

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, spacing, borderRadius } from '../theme/colors';
import { MedicalWarningCard, SafetyBadge } from '../components/MedicalWarningCard';
import { AffiliateProductCard } from '../components/AffiliateProductCard';
import { getEssentialOilById } from '../data/essentialOils';
import { getRemediesForEssentialOil } from '../data/essentialOilRemedies';
import { getAffiliateProductsForEssentialOil } from '../data/essentialOilAffiliateProducts';
import { EssentialOil, EssentialOilUsageRoute } from '../types';
import { buildBestAmazonAffiliateUrl, trackAffiliateClick, AMAZON_AFFILIATE_TAG } from '../services/affiliate';
import { RootStackParamList } from '../navigation/AppNavigator';

// ============================================
// TYPES
// ============================================

type EssentialOilDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'EssentialOilDetail'>;

// ============================================
// HELPERS
// ============================================

const ROUTE_ICONS: Record<EssentialOilUsageRoute, { icon: string; label: string }> = {
  diffusion: { icon: 'wind', label: 'Diffusion' },
  inhalation: { icon: 'cloud', label: 'Inhalation' },
  cutanee: { icon: 'droplet', label: 'Cutanée' },
  massage: { icon: 'activity', label: 'Massage' },
  bain: { icon: 'droplet', label: 'Bain' },
  orale: { icon: 'coffee', label: 'Orale' },
  gargarisme: { icon: 'mic', label: 'Gargarisme' },
};

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export const EssentialOilDetailScreen: React.FC<EssentialOilDetailScreenProps> = ({ 
  navigation, 
  route 
}) => {
  const { oilId } = route.params;
  const oil = getEssentialOilById(oilId);

  // Remèdes utilisant cette huile
  const relatedRemedies = useMemo(() => {
    return getRemediesForEssentialOil(oilId);
  }, [oilId]);

  // Produits affiliés
  const affiliateProducts = useMemo(() => {
    return getAffiliateProductsForEssentialOil(oilId);
  }, [oilId]);

  if (!oil) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={48} color={colors.textMuted} />
          <Text style={styles.errorText}>Huile essentielle non trouvée</Text>
          <Pressable style={styles.backButtonError} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Retour</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const handleRemedyPress = (remedyId: string) => {
    navigation.navigate('EssentialOilRemedyDetail', { remedyId });
  };

  const handleProductPress = async (product: any) => {
    try {
      const url = buildBestAmazonAffiliateUrl(product);
      console.log('[EssentialOil] Opening affiliate URL:', url);
      
      await trackAffiliateClick(product.id, oilId);
      await Linking.openURL(url);
    } catch (error) {
      console.error('[EssentialOil] Error opening link:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>{oil.name}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={[styles.heroIcon, { backgroundColor: `${oil.color || colors.accentPrimary}20` }]}>
            <Text style={styles.heroEmoji}>{oil.icon || '🌿'}</Text>
          </View>
          <Text style={styles.heroTitle}>{oil.name}</Text>
          {oil.nameLatin && (
            <Text style={styles.heroLatin}>{oil.nameLatin}</Text>
          )}
          <View style={styles.safetyBadgeContainer}>
            <SafetyBadge safetyLevel={oil.safetyLevel} size="medium" />
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.description}>{oil.shortDescription}</Text>
          {oil.longDescription && (
            <Text style={styles.longDescription}>{oil.longDescription}</Text>
          )}
        </View>

        {/* Propriétés principales */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Propriétés principales</Text>
          <View style={styles.tagsContainer}>
            {oil.mainProperties.map((prop, index) => (
              <View key={index} style={styles.propertyTag}>
                <Feather name="check" size={12} color={colors.accentPrimary} />
                <Text style={styles.propertyTagText}>{prop}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Usages courants */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Usages courants</Text>
          <View style={styles.usesGrid}>
            {oil.commonUses.map((use, index) => (
              <View key={index} style={styles.useItem}>
                <Text style={styles.useBullet}>•</Text>
                <Text style={styles.useText}>{use}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Voies d'utilisation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Voies d'utilisation</Text>
          <View style={styles.routesContainer}>
            {oil.usageRoutes.map((route, index) => {
              const routeInfo = ROUTE_ICONS[route];
              return (
                <View key={index} style={styles.routeCard}>
                  <View style={styles.routeIconContainer}>
                    <Feather name={routeInfo.icon as any} size={20} color={colors.accentPrimary} />
                  </View>
                  <Text style={styles.routeLabel}>{routeInfo.label}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Dilution recommandée */}
        {oil.dilutionRecommended && (
          <View style={styles.section}>
            <View style={styles.dilutionCard}>
              <Feather name="droplet" size={18} color={colors.accentPrimary} />
              <View style={styles.dilutionContent}>
                <Text style={styles.dilutionTitle}>Dilution recommandée</Text>
                <Text style={styles.dilutionText}>{oil.dilutionRecommended}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Avertissements et précautions */}
        <View style={styles.section}>
          <MedicalWarningCard
            type="aromatherapy"
            safetyLevel={oil.safetyLevel}
            incompatibleProfiles={oil.incompatibleProfiles}
            precautions={oil.precautions}
            contraindications={oil.contraindications}
          />
        </View>

        {/* Synergies */}
        {oil.synergies && oil.synergies.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Se marie bien avec</Text>
            <View style={styles.synergiesContainer}>
              {oil.synergies.map((synergyId, index) => {
                const synergyOil = getEssentialOilById(synergyId);
                if (!synergyOil) return null;
                return (
                  <Pressable
                    key={index}
                    style={styles.synergyChip}
                    onPress={() => navigation.push('EssentialOilDetail', { oilId: synergyId })}
                  >
                    <Text style={styles.synergyEmoji}>{synergyOil.icon || '🌿'}</Text>
                    <Text style={styles.synergyText}>{synergyOil.name}</Text>
                    <Feather name="chevron-right" size={14} color={colors.textMuted} />
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {/* Remèdes associés */}
        {relatedRemedies.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Remèdes utilisant cette huile</Text>
            {relatedRemedies.slice(0, 3).map((remedy, index) => (
              <Pressable
                key={index}
                style={styles.remedyCard}
                onPress={() => handleRemedyPress(remedy.id)}
              >
                <View style={styles.remedyContent}>
                  <Text style={styles.remedyTitle}>{remedy.title}</Text>
                  <Text style={styles.remedySymptoms} numberOfLines={1}>
                    {remedy.symptomTargets.slice(0, 3).join(' • ')}
                  </Text>
                </View>
                <Feather name="chevron-right" size={18} color={colors.textMuted} />
              </Pressable>
            ))}
          </View>
        )}

        {/* Produits recommandés */}
        {affiliateProducts && affiliateProducts.products.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Produits recommandés</Text>
            <Text style={styles.affiliateDisclaimer}>
              Certains liens sont affiliés. Nous pouvons percevoir une commission sans coût supplémentaire pour vous.
            </Text>
            {affiliateProducts.products.map((product, index) => (
              <AffiliateProductCard
                key={index}
                product={product as any}
                remedyId={oilId}
              />
            ))}
          </View>
        )}

        {/* Source */}
        <View style={styles.sourceSection}>
          <Feather name="book-open" size={14} color={colors.textMuted} />
          <Text style={styles.sourceText}>
            Source : {oil.sourceBook}
          </Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  heroEmoji: {
    fontSize: 40,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  heroLatin: {
    fontSize: 14,
    fontStyle: 'italic',
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  safetyBadgeContainer: {
    marginTop: spacing.md,
  },
  section: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textPrimary,
  },
  longDescription: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  propertyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.accentPrimaryMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  propertyTagText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.accentPrimary,
  },
  usesGrid: {
    gap: spacing.xs,
  },
  useItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  useBullet: {
    fontSize: 14,
    color: colors.accentPrimary,
    marginTop: 2,
  },
  useText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  routesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  routeCard: {
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minWidth: 80,
  },
  routeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accentPrimaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  routeLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  dilutionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  dilutionContent: {
    flex: 1,
  },
  dilutionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  dilutionText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  synergiesContainer: {
    gap: spacing.sm,
  },
  synergyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  synergyEmoji: {
    fontSize: 18,
  },
  synergyText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  remedyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  remedyContent: {
    flex: 1,
  },
  remedyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  remedySymptoms: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  affiliateDisclaimer: {
    fontSize: 11,
    color: colors.textMuted,
    fontStyle: 'italic',
    marginBottom: spacing.md,
  },
  sourceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  sourceText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  bottomSpacer: {
    height: spacing.xl,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    fontSize: 16,
    color: colors.textMuted,
    marginTop: spacing.md,
  },
  backButtonError: {
    marginTop: spacing.lg,
    backgroundColor: colors.accentPrimary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default EssentialOilDetailScreen;
