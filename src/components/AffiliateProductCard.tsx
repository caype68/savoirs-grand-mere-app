// ============================================
// CARTE PRODUIT AFFILIÉ AMAZON
// Avec système d'images intelligent
// ============================================

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius } from '../theme/colors';
import { AffiliateProduct, AffiliateProductBadge } from '../types';
import { getAffiliateBadgeLabel, getAffiliateBadgeColor, openAffiliateLink } from '../services/affiliate';
import { getSmartProductImage, getFallbackImage } from '../services/imageGenerator';

// ============================================
// TYPES
// ============================================

interface AffiliateProductCardProps {
  product: AffiliateProduct;
  remedyId: string;
  compact?: boolean;
}

// ============================================
// COMPOSANT IMAGE INTELLIGENTE
// ============================================

interface SmartProductImageProps {
  product: AffiliateProduct;
  style?: any;
  size?: 'normal' | 'compact';
}

const SmartProductImage: React.FC<SmartProductImageProps> = ({ 
  product, 
  style,
  size = 'normal' 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const fadeAnim = useState(new Animated.Value(0))[0];

  // Générer les URLs d'images avec fallbacks
  const imageUrls = useMemo(() => {
    const urls: string[] = [];
    
    // Priorité 1: Image directe
    if (product.image && product.image.trim() !== '') {
      urls.push(product.image);
    }
    
    // Priorité 2: Image pré-générée
    if (product.generatedImage && product.generatedImage.trim() !== '') {
      urls.push(product.generatedImage);
    }
    
    // Priorité 3: Image générée dynamiquement
    const smartImage = getSmartProductImage(product);
    if (smartImage) {
      urls.push(smartImage);
    }
    
    // Priorité 4: Fallback par catégorie
    const fallback = getFallbackImage(product.category);
    urls.push(fallback);
    
    return urls;
  }, [product]);

  const currentImageUrl = imageUrls[currentImageIndex] || imageUrls[imageUrls.length - 1];

  const handleLoadStart = useCallback(() => {
    setIsLoading(true);
    fadeAnim.setValue(0);
  }, [fadeAnim]);

  const handleLoadEnd = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleError = useCallback(() => {
    console.log(`[SmartImage] Error loading image ${currentImageIndex + 1}/${imageUrls.length}`);
    
    // Essayer l'image suivante
    if (currentImageIndex < imageUrls.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
    } else {
      // Toutes les images ont échoué
      setIsLoading(false);
      setHasError(true);
    }
  }, [currentImageIndex, imageUrls.length]);

  const iconSize = size === 'compact' ? 24 : 32;

  // Affichage en cas d'erreur totale
  if (hasError) {
    return (
      <LinearGradient
        colors={[colors.surfaceHighlight, colors.surface]}
        style={[style, styles.imagePlaceholder]}
      >
        <Feather name="package" size={iconSize} color={colors.textMuted} />
      </LinearGradient>
    );
  }

  return (
    <View style={style}>
      {/* Loader */}
      {isLoading && (
        <View style={[StyleSheet.absoluteFill, styles.loaderContainer]}>
          <LinearGradient
            colors={[colors.surfaceHighlight, colors.surface]}
            style={StyleSheet.absoluteFill}
          />
          <ActivityIndicator size="small" color={colors.accentPrimary} />
        </View>
      )}

      {/* Image avec fade-in */}
      <Animated.Image
        source={{ uri: currentImageUrl }}
        style={[
          StyleSheet.absoluteFill,
          { opacity: fadeAnim },
        ]}
        resizeMode="cover"
        onLoadStart={handleLoadStart}
        onLoad={handleLoadEnd}
        onError={handleError}
      />

      {/* Overlay gradient subtil pour meilleure lisibilité */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.15)']}
        style={[StyleSheet.absoluteFill, styles.imageOverlay]}
        pointerEvents="none"
      />
    </View>
  );
};

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export const AffiliateProductCard: React.FC<AffiliateProductCardProps> = ({
  product,
  remedyId,
  compact = false,
}) => {
  const handlePress = async () => {
    const success = await openAffiliateLink(product, remedyId);
    if (!success) {
      console.warn('⚠️ Impossible d\'ouvrir le lien Amazon');
    }
  };

  const renderBadge = () => {
    if (!product.badge) return null;
    
    const badgeColor = getAffiliateBadgeColor(product.badge);
    
    return (
      <View style={[styles.badge, { backgroundColor: badgeColor + '20' }]}>
        <Text style={[styles.badgeText, { color: badgeColor }]}>
          {getAffiliateBadgeLabel(product.badge)}
        </Text>
      </View>
    );
  };

  const renderEssentialIndicator = () => {
    if (!product.isEssential) return null;
    
    return (
      <View style={styles.essentialIndicator}>
        <Feather name="check-circle" size={12} color={colors.accentPrimary} />
      </View>
    );
  };

  const renderCategoryIcon = () => {
    const categoryIcons: Record<string, string> = {
      'ingredient': 'leaf',
      'accessoire': 'tool',
      'contenant': 'box',
      'pack': 'package',
      'livre': 'book',
      'huile_essentielle': 'droplet',
      'huile_vegetale': 'droplet',
      'diffuseur': 'wind',
      'roll_on': 'edit-3',
      'inhalateur': 'cloud',
      'flacon': 'box',
      'coffret': 'gift',
    };
    
    const iconName = categoryIcons[product.category] || 'package';
    
    return (
      <View style={styles.categoryIconContainer}>
        <Feather name={iconName as any} size={10} color={colors.textMuted} />
      </View>
    );
  };

  // Version compacte (pour scroll horizontal)
  if (compact) {
    return (
      <TouchableOpacity
        style={styles.cardCompact}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        {/* Image intelligente */}
        <View style={styles.imageContainerCompact}>
          <SmartProductImage 
            product={product} 
            style={styles.imageCompact}
            size="compact"
          />
          {renderEssentialIndicator()}
          {renderCategoryIcon()}
        </View>

        {/* Contenu */}
        <View style={styles.contentCompact}>
          {renderBadge()}
          <Text style={styles.titleCompact} numberOfLines={2}>
            {product.title}
          </Text>
          {product.priceLabel && (
            <Text style={styles.priceCompact}>{product.priceLabel}</Text>
          )}
        </View>

        {/* Bouton Amazon */}
        <TouchableOpacity style={styles.amazonButtonCompact} onPress={handlePress}>
          <Feather name="external-link" size={14} color="#fff" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }

  // Version normale (liste verticale)
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.85}
    >
      <View style={styles.cardInner}>
        {/* Image intelligente */}
        <View style={styles.imageContainer}>
          <SmartProductImage 
            product={product} 
            style={styles.image}
            size="normal"
          />
          {renderEssentialIndicator()}
        </View>

        {/* Contenu */}
        <View style={styles.content}>
          {/* Badge + Ingrédient */}
          <View style={styles.topRow}>
            {renderBadge()}
            <Text style={styles.ingredientName}>{product.ingredientName}</Text>
          </View>

          {/* Titre */}
          <Text style={styles.title} numberOfLines={2}>
            {product.title}
          </Text>

          {/* Sous-titre */}
          {product.subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {product.subtitle}
            </Text>
          )}

          {/* Description */}
          {product.description && (
            <Text style={styles.description} numberOfLines={2}>
              {product.description}
            </Text>
          )}

          {/* Prix + Bouton */}
          <View style={styles.bottomRow}>
            {product.priceLabel && (
              <Text style={styles.price}>{product.priceLabel}</Text>
            )}
            <TouchableOpacity style={styles.amazonButton} onPress={handlePress}>
              <Text style={styles.amazonButtonText}>Voir sur Amazon</Text>
              <Feather name="external-link" size={14} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // ============================================
  // VERSION NORMALE
  // ============================================
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  cardInner: {
    flexDirection: 'row',
    padding: spacing.md,
  },
  imageContainer: {
    width: 90,
    height: 90,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  imageOverlay: {
    borderRadius: borderRadius.md,
  },
  categoryIconContainer: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 8,
    padding: 3,
  },
  essentialIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 2,
  },
  content: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  ingredientName: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  description: {
    fontSize: 11,
    color: colors.textMuted,
    lineHeight: 16,
    marginBottom: spacing.sm,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.accentSecondary,
  },
  amazonButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9900', // Couleur Amazon
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  amazonButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },

  // ============================================
  // VERSION COMPACTE
  // ============================================
  cardCompact: {
    width: 140,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.md,
    overflow: 'hidden',
    position: 'relative',
  },
  imageContainerCompact: {
    width: '100%',
    height: 100,
    position: 'relative',
  },
  imageCompact: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholderCompact: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.surfaceHighlight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentCompact: {
    padding: spacing.sm,
  },
  titleCompact: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: spacing.xs,
    lineHeight: 16,
  },
  priceCompact: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accentSecondary,
    marginTop: spacing.xs,
  },
  amazonButtonCompact: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: '#FF9900',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      web: { boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)' },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
      },
    }),
  },
});

export default AffiliateProductCard;
