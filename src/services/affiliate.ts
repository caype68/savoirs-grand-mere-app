// ============================================
// SERVICE D'AFFILIATION AMAZON
// Tag affilié : craype-21
// ============================================

import { Linking, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  AffiliateProduct, 
  AffiliateClickStats, 
  AffiliateTrackingData,
  AffiliateProductBadge 
} from '../types';

// ============================================
// CONFIGURATION
// ============================================

export const AMAZON_AFFILIATE_TAG = 'craype-21';
export const AMAZON_BASE_URL = 'https://www.amazon.fr';
const STORAGE_KEY_AFFILIATE_TRACKING = '@affiliate_tracking';

// ============================================
// VALIDATION ASIN
// ============================================

/**
 * Vérifie si un ASIN est valide
 * Un ASIN Amazon valide :
 * - Est une chaîne de 10 caractères
 * - Contient uniquement des caractères alphanumériques
 * - Commence généralement par B0 pour les produits récents
 */
export function isValidAmazonAsin(value: string | undefined | null): boolean {
  if (!value || typeof value !== 'string') {
    return false;
  }
  
  const cleaned = value.trim().toUpperCase();
  
  // Doit être exactement 10 caractères alphanumériques
  if (!/^[A-Z0-9]{10}$/.test(cleaned)) {
    return false;
  }
  
  // Les ASIN fictifs/exemples communs à rejeter
  const fakePatterns = [
    /^B0[0-9]KQXJN/, // Pattern de nos exemples fictifs
    /^B0[0-9]MQXJN/, // Pattern de nos exemples fictifs
    /^XXXXXXXXXX$/,
    /^0{10}$/,
    /^1{10}$/,
  ];
  
  for (const pattern of fakePatterns) {
    if (pattern.test(cleaned)) {
      console.warn('⚠️ Affiliate: ASIN fictif détecté:', cleaned);
      return false;
    }
  }
  
  return true;
}

/**
 * Extrait un ASIN d'une URL Amazon
 */
export function extractAmazonAsinFromUrl(url: string): string | null {
  if (!url || typeof url !== 'string') {
    return null;
  }
  
  // Patterns pour extraire l'ASIN
  const patterns = [
    /\/dp\/([A-Z0-9]{10})/i,
    /\/gp\/product\/([A-Z0-9]{10})/i,
    /\/product\/([A-Z0-9]{10})/i,
    /\/ASIN\/([A-Z0-9]{10})/i,
    /amazon\.[a-z.]+\/([A-Z0-9]{10})(?:\/|$|\?)/i,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      const asin = match[1].toUpperCase();
      if (isValidAmazonAsin(asin)) {
        return asin;
      }
    }
  }
  
  return null;
}

/**
 * Nettoie et valide une URL Amazon
 */
export function sanitizeAmazonUrl(url: string): string | null {
  if (!url || typeof url !== 'string') {
    return null;
  }
  
  try {
    const parsed = new URL(url.trim());
    
    // Vérifier que c'est bien Amazon
    if (!parsed.hostname.includes('amazon')) {
      console.warn('⚠️ Affiliate: URL non-Amazon:', parsed.hostname);
      return null;
    }
    
    return url.trim();
  } catch {
    return null;
  }
}

// ============================================
// CONSTRUCTION DES URLS AMAZON
// ============================================

/**
 * Construit une URL de fiche produit Amazon avec ASIN
 */
export function buildAmazonProductUrl(
  asin: string,
  tag: string = AMAZON_AFFILIATE_TAG
): string {
  const cleanAsin = asin.trim().toUpperCase();
  return `${AMAZON_BASE_URL}/dp/${cleanAsin}?tag=${tag}`;
}

/**
 * Construit une URL de recherche Amazon
 */
export function buildAmazonSearchUrl(
  query: string,
  tag: string = AMAZON_AFFILIATE_TAG
): string {
  if (!query || query.trim() === '') {
    console.warn('⚠️ Affiliate: Requête de recherche vide');
    return `${AMAZON_BASE_URL}?tag=${tag}`;
  }
  
  // Nettoyer la requête
  const cleanQuery = query
    .trim()
    .toLowerCase()
    // Supprimer les caractères spéciaux sauf espaces et tirets
    .replace(/[^\w\sàâäéèêëïîôùûüç-]/gi, '')
    // Remplacer les espaces multiples par un seul
    .replace(/\s+/g, ' ')
    .trim();
  
  const encodedQuery = encodeURIComponent(cleanQuery);
  return `${AMAZON_BASE_URL}/s?k=${encodedQuery}&tag=${tag}`;
}

/**
 * Génère la meilleure URL Amazon affiliée pour un produit
 * Logique de fallback :
 * 1. Si ASIN valide → fiche produit
 * 2. Si amazonUrl contient un ASIN extractible valide → fiche produit
 * 3. Si searchQuery existe → page de recherche
 * 4. Sinon → recherche avec ingredientName + titre simplifié
 */
export function buildBestAmazonAffiliateUrl(product: AffiliateProduct): string {
  const tag = AMAZON_AFFILIATE_TAG;
  
  // CAS 1: ASIN valide fourni
  if (product.asin && isValidAmazonAsin(product.asin)) {
    return buildAmazonProductUrl(product.asin, tag);
  }
  
  // CAS 2: URL Amazon avec ASIN extractible
  if (product.amazonUrl) {
    const extractedAsin = extractAmazonAsinFromUrl(product.amazonUrl);
    if (extractedAsin && isValidAmazonAsin(extractedAsin)) {
      return buildAmazonProductUrl(extractedAsin, tag);
    }
  }
  
  // CAS 3: searchQuery fourni
  if (product.searchQuery && product.searchQuery.trim() !== '') {
    return buildAmazonSearchUrl(product.searchQuery, tag);
  }
  
  // CAS 4: Fallback - construire une recherche intelligente
  const searchTerms: string[] = [];
  
  // Ajouter l'ingrédient
  if (product.ingredientName && product.ingredientName.trim() !== '') {
    searchTerms.push(product.ingredientName.trim());
  }
  
  // Ajouter le titre simplifié (premiers mots significatifs)
  if (product.title) {
    // Extraire les 3-4 premiers mots du titre
    const titleWords = product.title
      .replace(/[-–—]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2)
      .slice(0, 4)
      .join(' ');
    
    if (titleWords && !searchTerms.includes(titleWords)) {
      searchTerms.push(titleWords);
    }
  }
  
  // Ajouter "bio" si badge bio
  if (product.badge === 'bio' && !searchTerms.some(t => t.toLowerCase().includes('bio'))) {
    searchTerms.push('bio');
  }
  
  const fallbackQuery = searchTerms.join(' ').trim();
  
  if (fallbackQuery) {
    const url = buildAmazonSearchUrl(fallbackQuery, tag);
    console.log('[Amazon Final URL] Fallback recherche →', url);
    return url;
  }
  
  // Dernier recours: page d'accueil Amazon
  console.warn('⚠️ Affiliate: Impossible de générer URL pour', product.id);
  return `${AMAZON_BASE_URL}?tag=${tag}`;
}

/**
 * Ancienne fonction conservée pour compatibilité
 * @deprecated Utiliser buildBestAmazonAffiliateUrl à la place
 */
export function buildAmazonAffiliateUrl(
  inputUrlOrAsin: string,
  affiliateTag: string = AMAZON_AFFILIATE_TAG
): string {
  if (!inputUrlOrAsin || inputUrlOrAsin.trim() === '') {
    return '';
  }

  const input = inputUrlOrAsin.trim();

  // Si c'est un ASIN valide
  if (isValidAmazonAsin(input)) {
    return buildAmazonProductUrl(input, affiliateTag);
  }

  // Si c'est une URL Amazon
  const extractedAsin = extractAmazonAsinFromUrl(input);
  if (extractedAsin) {
    return buildAmazonProductUrl(extractedAsin, affiliateTag);
  }

  // Fallback: utiliser comme requête de recherche
  return buildAmazonSearchUrl(input, affiliateTag);
}

/**
 * Génère l'URL affiliée pour un produit (utilise la nouvelle logique)
 */
export function getProductAffiliateUrl(product: AffiliateProduct): string {
  return buildBestAmazonAffiliateUrl(product);
}

// ============================================
// TRACKING DES CLICS
// ============================================

/**
 * Récupère les données de tracking depuis le stockage
 */
async function getTrackingData(): Promise<AffiliateTrackingData> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY_AFFILIATE_TRACKING);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('❌ Affiliate: Erreur lecture tracking:', error);
  }
  
  return {
    clicks: [],
    totalClicks: 0,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Sauvegarde les données de tracking
 */
async function saveTrackingData(data: AffiliateTrackingData): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY_AFFILIATE_TRACKING, JSON.stringify(data));
  } catch (error) {
    console.error('❌ Affiliate: Erreur sauvegarde tracking:', error);
  }
}

/**
 * Enregistre un clic sur un produit affilié
 */
export async function trackAffiliateClick(
  productId: string,
  remedyId: string
): Promise<void> {
  console.log('📊 Affiliate: Tracking clic -', productId, 'depuis', remedyId);
  
  const data = await getTrackingData();
  
  // Chercher si ce produit a déjà des stats
  const existingIndex = data.clicks.findIndex(
    c => c.productId === productId && c.remedyId === remedyId
  );
  
  if (existingIndex >= 0) {
    // Incrémenter le compteur existant
    data.clicks[existingIndex].clickCount += 1;
    data.clicks[existingIndex].lastClickedAt = new Date().toISOString();
  } else {
    // Créer une nouvelle entrée
    data.clicks.push({
      productId,
      remedyId,
      clickCount: 1,
      lastClickedAt: new Date().toISOString(),
    });
  }
  
  data.totalClicks += 1;
  data.lastUpdated = new Date().toISOString();
  
  await saveTrackingData(data);
}

/**
 * Récupère les statistiques de clics
 */
export async function getAffiliateStats(): Promise<AffiliateTrackingData> {
  return getTrackingData();
}

/**
 * Récupère les produits les plus cliqués
 */
export async function getMostClickedProducts(limit: number = 5): Promise<AffiliateClickStats[]> {
  const data = await getTrackingData();
  return data.clicks
    .sort((a, b) => b.clickCount - a.clickCount)
    .slice(0, limit);
}

/**
 * Récupère les stats d'un produit spécifique
 */
export async function getProductClickStats(productId: string): Promise<AffiliateClickStats | null> {
  const data = await getTrackingData();
  return data.clicks.find(c => c.productId === productId) || null;
}

// ============================================
// OUVERTURE DES LIENS
// ============================================

/**
 * Ouvre un lien Amazon affilié et track le clic
 */
export async function openAffiliateLink(
  product: AffiliateProduct,
  remedyId: string
): Promise<boolean> {
  const url = getProductAffiliateUrl(product);
  
  if (!url) {
    console.error('❌ Affiliate: Impossible de générer l\'URL pour', product.id);
    return false;
  }
  
  console.log('🔗 Affiliate: Ouverture -', url);
  
  try {
    // Vérifier si le lien peut être ouvert
    const canOpen = await Linking.canOpenURL(url);
    
    if (!canOpen) {
      console.error('❌ Affiliate: Impossible d\'ouvrir l\'URL:', url);
      return false;
    }
    
    // Tracker le clic
    await trackAffiliateClick(product.id, remedyId);
    
    // Ouvrir le lien
    await Linking.openURL(url);
    
    return true;
  } catch (error) {
    console.error('❌ Affiliate: Erreur ouverture lien:', error);
    return false;
  }
}

// ============================================
// UTILITAIRES UI
// ============================================

/**
 * Labels des badges affiliés en français
 */
export const AFFILIATE_BADGE_LABELS: Record<AffiliateProductBadge, string> = {
  recommande: '⭐ Recommandé',
  bio: '🌿 Bio',
  populaire: '🔥 Populaire',
  petit_budget: '💰 Petit budget',
  premium: '✨ Premium',
  essentiel: '📌 Essentiel',
  pack: '📦 Pack',
};

/**
 * Couleurs des badges affiliés
 */
export const AFFILIATE_BADGE_COLORS: Record<AffiliateProductBadge, string> = {
  recommande: '#78A686', // Vert herb
  bio: '#76B58B', // Vert success
  populaire: '#D2A565', // Amber
  petit_budget: '#7B9FB8', // Bleu info
  premium: '#C49B61', // Or
  essentiel: '#78A686', // Vert herb
  pack: '#9B7748', // Marron
};

/**
 * Retourne le label d'un badge affilié
 */
export function getAffiliateBadgeLabel(badge: AffiliateProductBadge): string {
  return AFFILIATE_BADGE_LABELS[badge] || badge;
}

/**
 * Retourne la couleur d'un badge affilié
 */
export function getAffiliateBadgeColor(badge: AffiliateProductBadge): string {
  return AFFILIATE_BADGE_COLORS[badge] || '#78A686';
}

// Alias pour compatibilité (usage interne au module affiliate)
export const getBadgeLabel = getAffiliateBadgeLabel;
export const getBadgeColor = getAffiliateBadgeColor;

// ============================================
// TODO V2 - AMÉLIORATIONS FUTURES
// ============================================

// TODO V2: Récupération dynamique des prix via Amazon Product Advertising API
// TODO V2: Synchronisation backend des statistiques de clics
// TODO V2: Dashboard admin pour voir les performances
// TODO V2: Suggestions automatiques de produits par IA basées sur les ingrédients
// TODO V2: Comparaison de produits similaires
// TODO V2: Notifications push pour les promotions sur produits favoris
// TODO V2: Cache des images produits pour performance
// TODO V2: A/B testing des présentations produits
