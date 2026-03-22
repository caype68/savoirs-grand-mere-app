import { SponsoredProduct, ProductBadge } from '../types';
import { trackProductClick } from './storage';
import { Linking } from 'react-native';

// ============================================
// DONNÉES DES PRODUITS SPONSORISÉS
// ============================================

// Fichier de configuration des produits - facilement modifiable
export const SPONSORED_PRODUCTS: SponsoredProduct[] = [
  // Plantes et tisanes
  {
    id: 'prod_camomille_bio',
    remedeIds: ['camomille-sommeil', 'camomille-digestion', 'infusion-camomille'],
    nom: 'Camomille Bio - Fleurs séchées',
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=300',
    description: 'Fleurs de camomille matricaire bio, séchées naturellement. Idéal pour infusions relaxantes.',
    prix: '8,90 €',
    prixOriginal: '12,90 €',
    affiliateUrl: 'https://exemple-affiliation.com/camomille-bio?ref=savoirs',
    fournisseur: 'Herboristerie Naturelle',
    badges: ['bio', 'recommande'],
    categorie: 'plante',
    actif: true,
    ordre: 1,
    trackingClicks: 0,
    trackingImpressions: 0,
  },
  {
    id: 'prod_thym_bio',
    remedeIds: ['thym-toux', 'infusion-thym', 'thym-gorge'],
    nom: 'Thym Bio - Feuilles séchées',
    image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=300',
    description: 'Thym de Provence bio, parfait pour les infusions respiratoires et digestives.',
    prix: '7,50 €',
    affiliateUrl: 'https://exemple-affiliation.com/thym-bio?ref=savoirs',
    fournisseur: 'Herboristerie Naturelle',
    badges: ['bio', 'local'],
    categorie: 'plante',
    actif: true,
    ordre: 2,
    trackingClicks: 0,
    trackingImpressions: 0,
  },
  {
    id: 'prod_miel_thym',
    remedeIds: ['miel-toux', 'sirop-miel', 'gorge-miel'],
    nom: 'Miel de Thym Bio',
    image: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=300',
    description: 'Miel de thym artisanal, reconnu pour ses propriétés apaisantes pour la gorge.',
    prix: '14,90 €',
    affiliateUrl: 'https://exemple-affiliation.com/miel-thym?ref=savoirs',
    fournisseur: 'Apiculture Tradition',
    badges: ['bio', 'premium'],
    categorie: 'plante',
    actif: true,
    ordre: 3,
    trackingClicks: 0,
    trackingImpressions: 0,
  },
  // Huiles essentielles
  {
    id: 'prod_he_lavande',
    remedeIds: ['lavande-stress', 'inhalation-lavande', 'massage-lavande'],
    nom: 'Huile Essentielle Lavande Fine Bio',
    image: 'https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?w=300',
    description: 'HE de lavande fine de Provence, 100% pure et naturelle. Relaxante et apaisante.',
    prix: '9,90 €',
    affiliateUrl: 'https://exemple-affiliation.com/he-lavande?ref=savoirs',
    fournisseur: 'Aroma Expert',
    badges: ['bio', 'recommande'],
    categorie: 'huile_essentielle',
    actif: true,
    ordre: 4,
    trackingClicks: 0,
    trackingImpressions: 0,
  },
  {
    id: 'prod_he_eucalyptus',
    remedeIds: ['eucalyptus-rhume', 'inhalation-eucalyptus', 'respiration'],
    nom: 'Huile Essentielle Eucalyptus Radiata Bio',
    image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=300',
    description: 'HE d\'eucalyptus radiata bio, idéale pour dégager les voies respiratoires.',
    prix: '8,50 €',
    affiliateUrl: 'https://exemple-affiliation.com/he-eucalyptus?ref=savoirs',
    fournisseur: 'Aroma Expert',
    badges: ['bio'],
    categorie: 'huile_essentielle',
    actif: true,
    ordre: 5,
    trackingClicks: 0,
    trackingImpressions: 0,
  },
  // Accessoires
  {
    id: 'prod_infuseur',
    remedeIds: [], // Produit générique
    nom: 'Infuseur à Thé en Inox',
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300',
    description: 'Infuseur réutilisable en acier inoxydable, maille fine pour toutes vos tisanes.',
    prix: '6,90 €',
    affiliateUrl: 'https://exemple-affiliation.com/infuseur?ref=savoirs',
    fournisseur: 'Accessoires Bien-être',
    badges: ['meilleur_rapport'],
    categorie: 'accessoire',
    actif: true,
    ordre: 10,
    trackingClicks: 0,
    trackingImpressions: 0,
  },
  {
    id: 'prod_diffuseur',
    remedeIds: ['inhalation-eucalyptus', 'aromatherapie'],
    nom: 'Diffuseur Huiles Essentielles Ultrasonique',
    image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=300',
    description: 'Diffuseur silencieux avec lumière d\'ambiance, capacité 300ml.',
    prix: '29,90 €',
    prixOriginal: '39,90 €',
    affiliateUrl: 'https://exemple-affiliation.com/diffuseur?ref=savoirs',
    fournisseur: 'Accessoires Bien-être',
    badges: ['recommande', 'nouveau'],
    categorie: 'diffuseur',
    actif: true,
    ordre: 11,
    trackingClicks: 0,
    trackingImpressions: 0,
  },
  // Livres
  {
    id: 'prod_livre_plantes',
    remedeIds: [],
    nom: 'Guide des Plantes Médicinales',
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300',
    description: 'Encyclopédie complète des plantes médicinales avec 500 remèdes traditionnels.',
    prix: '24,90 €',
    affiliateUrl: 'https://exemple-affiliation.com/livre-plantes?ref=savoirs',
    fournisseur: 'Éditions Nature',
    badges: ['recommande'],
    categorie: 'livre',
    actif: true,
    ordre: 20,
    trackingClicks: 0,
    trackingImpressions: 0,
  },
];

// ============================================
// FONCTIONS DE GESTION DES PRODUITS
// ============================================

/**
 * Obtient les produits pour un remède spécifique
 */
export const getProductsForRemedy = (remedeId: string): SponsoredProduct[] => {
  return SPONSORED_PRODUCTS
    .filter(p => p.actif && p.remedeIds.includes(remedeId))
    .sort((a, b) => a.ordre - b.ordre);
};

/**
 * Obtient les produits génériques (non liés à un remède spécifique)
 */
export const getGenericProducts = (): SponsoredProduct[] => {
  return SPONSORED_PRODUCTS
    .filter(p => p.actif && p.remedeIds.length === 0)
    .sort((a, b) => a.ordre - b.ordre);
};

/**
 * Obtient tous les produits actifs pour la boutique
 */
export const getAllActiveProducts = (): SponsoredProduct[] => {
  return SPONSORED_PRODUCTS
    .filter(p => p.actif)
    .sort((a, b) => a.ordre - b.ordre);
};

/**
 * Obtient les produits par catégorie
 */
export const getProductsByCategory = (categorie: SponsoredProduct['categorie']): SponsoredProduct[] => {
  return SPONSORED_PRODUCTS
    .filter(p => p.actif && p.categorie === categorie)
    .sort((a, b) => a.ordre - b.ordre);
};

/**
 * Obtient les produits mis en avant (avec badge recommandé)
 */
export const getFeaturedProducts = (limit: number = 4): SponsoredProduct[] => {
  return SPONSORED_PRODUCTS
    .filter(p => p.actif && p.badges.includes('recommande'))
    .sort((a, b) => a.ordre - b.ordre)
    .slice(0, limit);
};

/**
 * Gère le clic sur un produit sponsorisé
 */
export const handleProductClick = async (
  product: SponsoredProduct,
  source: 'fiche_remede' | 'boutique' | 'notification',
  remedeId?: string
): Promise<void> => {
  // Tracker le clic
  await trackProductClick({
    productId: product.id,
    remedeId,
    source,
  });
  
  // Ouvrir le lien
  try {
    const canOpen = await Linking.canOpenURL(product.affiliateUrl);
    if (canOpen) {
      await Linking.openURL(product.affiliateUrl);
    }
  } catch (error) {
    console.error('Erreur ouverture lien produit:', error);
  }
};

/**
 * Obtient le label d'un badge
 */
export const getBadgeLabel = (badge: ProductBadge): string => {
  const labels: Record<ProductBadge, string> = {
    'recommande': 'Recommandé',
    'bio': 'Bio',
    'meilleur_rapport': 'Meilleur rapport qualité/prix',
    'premium': 'Premium',
    'local': 'Local',
    'nouveau': 'Nouveau',
  };
  return labels[badge];
};

/**
 * Obtient la couleur d'un badge
 */
export const getBadgeColor = (badge: ProductBadge): string => {
  const colors: Record<ProductBadge, string> = {
    'recommande': '#4ADE80',
    'bio': '#22C55E',
    'meilleur_rapport': '#FBBF24',
    'premium': '#A78BFA',
    'local': '#60A5FA',
    'nouveau': '#F472B6',
  };
  return colors[badge];
};
