// ============================================
// SECTION PRODUITS AFFILIÉS AMAZON
// Avec matching intelligent basé sur la composition
// ============================================

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../theme/colors';
import { AffiliateProduct, Remede } from '../types';
import { AffiliateProductCard } from './AffiliateProductCard';
import { getAffiliateProductsForRemedy } from '../data/affiliateProducts';
import { getSmartAffiliateProducts } from '../services/productMatching';

// ============================================
// TYPES
// ============================================

interface AffiliateProductsSectionProps {
  remedyId: string;
  remedy?: Remede; // Si fourni, utilise le matching intelligent
  layout?: 'horizontal' | 'vertical';
  maxProducts?: number;
  showTitle?: boolean;
  useSmartMatching?: boolean; // Active le matching intelligent
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export const AffiliateProductsSection: React.FC<AffiliateProductsSectionProps> = ({
  remedyId,
  remedy,
  layout = 'horizontal',
  maxProducts,
  showTitle = true,
  useSmartMatching = false,
}) => {
  // Récupérer les produits avec ou sans matching intelligent
  const products = useMemo(() => {
    // Si on a le remède et que le smart matching est activé
    if (remedy && useSmartMatching) {
      return getSmartAffiliateProducts(remedy);
    }
    // Sinon, utiliser l'ancien système
    return getAffiliateProductsForRemedy(remedyId);
  }, [remedyId, remedy, useSmartMatching]);

  // Ne rien afficher si pas de produits
  if (products.length === 0) {
    return null;
  }

  // Limiter le nombre de produits si spécifié
  const displayProducts = maxProducts ? products.slice(0, maxProducts) : products;

  // Séparer les produits par catégorie
  const mainProducts = displayProducts.filter(p => p.isEssential);
  const supportProducts = displayProducts.filter(p => !p.isEssential && p.category !== 'accessoire');
  const accessoryProducts = displayProducts.filter(p => p.category === 'accessoire');

  const renderHorizontalLayout = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.horizontalScroll}
    >
      {displayProducts.map((product) => (
        <AffiliateProductCard
          key={product.id}
          product={product}
          remedyId={remedyId}
          compact
        />
      ))}
    </ScrollView>
  );

  const renderVerticalLayout = () => (
    <View style={styles.verticalList}>
      {/* Produits principaux (ingrédients essentiels) */}
      {mainProducts.length > 0 && (
        <>
          <View style={styles.subSectionHeader}>
            <Feather name="check-circle" size={14} color={colors.accentPrimary} />
            <Text style={styles.subSectionTitle}>Ingrédients principaux</Text>
          </View>
          {mainProducts.map((product: AffiliateProduct) => (
            <AffiliateProductCard
              key={product.id}
              product={product}
              remedyId={remedyId}
            />
          ))}
        </>
      )}

      {/* Produits de support */}
      {supportProducts.length > 0 && (
        <>
          <View style={styles.subSectionHeader}>
            <Feather name="layers" size={14} color={colors.textSecondary} />
            <Text style={styles.subSectionTitle}>Compléments recommandés</Text>
          </View>
          {supportProducts.map((product: AffiliateProduct) => (
            <AffiliateProductCard
              key={product.id}
              product={product}
              remedyId={remedyId}
            />
          ))}
        </>
      )}

      {/* Accessoires */}
      {accessoryProducts.length > 0 && (
        <>
          <View style={styles.subSectionHeader}>
            <Feather name="tool" size={14} color={colors.textMuted} />
            <Text style={styles.subSectionTitle}>Accessoires utiles</Text>
          </View>
          {accessoryProducts.map((product: AffiliateProduct) => (
            <AffiliateProductCard
              key={product.id}
              product={product}
              remedyId={remedyId}
            />
          ))}
        </>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Titre de section */}
      {showTitle && (
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.iconContainer}>
              <Feather name="shopping-bag" size={18} color={colors.accentSecondary} />
            </View>
            <View>
              <Text style={styles.title}>Acheter les ingrédients</Text>
              <Text style={styles.subtitle}>
                {products.length} produit{products.length > 1 ? 's' : ''} recommandé{products.length > 1 ? 's' : ''}
              </Text>
            </View>
          </View>
          <View style={styles.amazonBadge}>
            <Text style={styles.amazonBadgeText}>Amazon</Text>
          </View>
        </View>
      )}

      {/* Liste des produits */}
      {layout === 'horizontal' ? renderHorizontalLayout() : renderVerticalLayout()}

      {/* Mention légale affiliation */}
      <View style={styles.disclaimer}>
        <Feather name="info" size={12} color={colors.textMuted} />
        <Text style={styles.disclaimerText}>
          Certains liens sont affiliés. Nous pouvons percevoir une commission sans coût supplémentaire pour vous.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accentSecondaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  amazonBadge: {
    backgroundColor: '#FF9900',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  amazonBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  horizontalScroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  verticalList: {
    paddingHorizontal: spacing.lg,
  },
  subSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
    marginTop: spacing.md,
  },
  subSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 10,
    color: colors.textMuted,
    lineHeight: 14,
  },
});

export default AffiliateProductsSection;
