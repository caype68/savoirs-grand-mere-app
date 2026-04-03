import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../theme/colors';
import { SponsoredProduct, ProductBadge } from '../types';
import { 
  getProductsForRemedy, 
  handleProductClick, 
  getBadgeLabel, 
  getBadgeColor 
} from '../services/products';

interface SponsoredProductsSectionProps {
  remedeId: string;
  compact?: boolean;
}

export const SponsoredProductsSection: React.FC<SponsoredProductsSectionProps> = ({
  remedeId,
  compact = false,
}) => {
  const products = getProductsForRemedy(remedeId);

  if (products.length === 0) return null;

  const handlePress = (product: SponsoredProduct) => {
    handleProductClick(product, 'fiche_remede', remedeId);
  };

  const renderBadge = (badge: ProductBadge) => (
    <View 
      key={badge} 
      style={[styles.badge, { backgroundColor: getBadgeColor(badge) + '20' }]}
    >
      <Text style={[styles.badgeText, { color: getBadgeColor(badge) }]}>
        {getBadgeLabel(badge)}
      </Text>
    </View>
  );

  const renderProduct = (product: SponsoredProduct, idx: number) => (
    <TouchableOpacity
      key={`${product.id}-${idx}`}
      style={[styles.productCard, compact && styles.productCardCompact]}
      onPress={() => handlePress(product)}
      activeOpacity={0.8}
    >
      <Image 
        source={{ uri: product.image }} 
        style={[styles.productImage, compact && styles.productImageCompact]}
        resizeMode="cover"
      />
      
      <View style={styles.productContent}>
        <View style={styles.badgesRow}>
          {product.badges.slice(0, 2).map(renderBadge)}
        </View>
        
        <Text style={styles.productName} numberOfLines={2}>
          {product.nom}
        </Text>
        
        {!compact && (
          <Text style={styles.productDescription} numberOfLines={2}>
            {product.description}
          </Text>
        )}
        
        <View style={styles.priceRow}>
          <Text style={styles.productPrice}>{product.prix}</Text>
          {product.prixOriginal && (
            <Text style={styles.productPriceOriginal}>{product.prixOriginal}</Text>
          )}
        </View>
        
        <View style={styles.ctaRow}>
          <Text style={styles.supplierText}>{product.fournisseur}</Text>
          <Feather name="external-link" size={14} color={colors.accentPrimary} />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Feather name="shopping-bag" size={18} color={colors.accentSecondary} />
          <Text style={styles.headerTitle}>Produits recommandés</Text>
        </View>
        <View style={styles.sponsoredBadge}>
          <Text style={styles.sponsoredText}>Liens sponsorisés</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.productsContainer}
      >
        {products.map(renderProduct)}
      </ScrollView>

      <Text style={styles.disclaimer}>
        Certains liens peuvent être affiliés. Cela nous aide à maintenir l'application.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.xl,
    paddingVertical: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    marginHorizontal: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  sponsoredBadge: {
    backgroundColor: colors.surfaceHighlight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  sponsoredText: {
    fontSize: 10,
    color: colors.textMuted,
  },
  productsContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  productCard: {
    width: 200,
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  productCardCompact: {
    width: 160,
  },
  productImage: {
    width: '100%',
    height: 120,
  },
  productImageCompact: {
    height: 90,
  },
  productContent: {
    padding: spacing.md,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  badge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  productDescription: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 16,
    marginBottom: spacing.sm,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.accentPrimary,
  },
  productPriceOriginal: {
    fontSize: 12,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  supplierText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  disclaimer: {
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
    fontStyle: 'italic',
  },
});

export default SponsoredProductsSection;
