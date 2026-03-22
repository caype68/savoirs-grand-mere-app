// ============================================
// API PRODUITS AFFILIÉS
// Services pour les produits Amazon
// ============================================

import { supabase } from '../supabase';
import { AffiliateProduct } from '../types/database';

// Tag affilié Amazon
const AFFILIATE_TAG = 'craype-21';

// ============================================
// RÉCUPÉRATION DES PRODUITS
// ============================================

/**
 * Récupère les produits affiliés pour un remède
 */
export async function getProductsForRemedy(remedyId: string): Promise<AffiliateProduct[]> {
  const { data, error } = await supabase
    .from('remedy_affiliate_products')
    .select(`
      relevance_score,
      affiliate_products (*)
    `)
    .eq('remedy_id', remedyId)
    .order('relevance_score', { ascending: false });

  if (error) {
    console.error('[API] Error fetching products for remedy:', error);
    throw error;
  }

  return data?.map((item: { affiliate_products: AffiliateProduct }) => item.affiliate_products).filter(Boolean) || [];
}

/**
 * Récupère les produits affiliés pour une huile essentielle
 */
export async function getProductsForEssentialOil(oilId: string): Promise<AffiliateProduct[]> {
  const { data, error } = await supabase
    .from('essential_oil_affiliate_products')
    .select(`
      relevance_score,
      affiliate_products (*)
    `)
    .eq('essential_oil_id', oilId)
    .order('relevance_score', { ascending: false });

  if (error) {
    console.error('[API] Error fetching products for essential oil:', error);
    throw error;
  }

  return data?.map((item: { affiliate_products: AffiliateProduct }) => item.affiliate_products).filter(Boolean) || [];
}

/**
 * Récupère un produit par son ID
 */
export async function getProductById(id: string): Promise<AffiliateProduct | null> {
  const { data, error } = await supabase
    .from('affiliate_products')
    .select('*')
    .eq('id', id)
    .eq('status', 'published')
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return data;
}

/**
 * Recherche de produits
 */
export async function searchProducts(
  query: string,
  category?: string
): Promise<AffiliateProduct[]> {
  let queryBuilder = supabase
    .from('affiliate_products')
    .select('*')
    .eq('status', 'published')
    .or(`title.ilike.%${query}%,ingredient_name.ilike.%${query}%`);

  if (category) {
    queryBuilder = queryBuilder.eq('category', category);
  }

  const { data, error } = await queryBuilder.limit(20);

  if (error) {
    console.error('[API] Error searching products:', error);
    throw error;
  }

  return data || [];
}

// ============================================
// GÉNÉRATION D'URL AMAZON
// ============================================

/**
 * Génère l'URL Amazon affiliée pour un produit
 */
export function buildAmazonUrl(product: AffiliateProduct): string {
  const baseUrl = 'https://www.amazon.fr';

  // Si ASIN valide
  if (product.asin && isValidAsin(product.asin)) {
    return `${baseUrl}/dp/${product.asin}?tag=${AFFILIATE_TAG}`;
  }

  // Si URL Amazon existante
  if (product.amazon_url) {
    const asin = extractAsinFromUrl(product.amazon_url);
    if (asin) {
      return `${baseUrl}/dp/${asin}?tag=${AFFILIATE_TAG}`;
    }
  }

  // Fallback: recherche
  const searchQuery = product.search_query || product.title;
  const encodedQuery = encodeURIComponent(searchQuery);
  return `${baseUrl}/s?k=${encodedQuery}&tag=${AFFILIATE_TAG}`;
}

/**
 * Vérifie si un ASIN est valide
 */
function isValidAsin(asin: string): boolean {
  if (!asin || typeof asin !== 'string') return false;
  const cleaned = asin.trim().toUpperCase();
  return /^[A-Z0-9]{10}$/.test(cleaned);
}

/**
 * Extrait l'ASIN d'une URL Amazon
 */
function extractAsinFromUrl(url: string): string | null {
  if (!url) return null;
  
  const patterns = [
    /\/dp\/([A-Z0-9]{10})/i,
    /\/gp\/product\/([A-Z0-9]{10})/i,
    /\/ASIN\/([A-Z0-9]{10})/i,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1].toUpperCase();
    }
  }

  return null;
}

// ============================================
// TRACKING
// ============================================

/**
 * Enregistre un clic sur un produit affilié
 */
export async function trackProductClick(
  productId: string,
  remedyId?: string,
  source?: string
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase
    .from('affiliate_clicks')
    .insert({
      product_id: productId,
      remedy_id: remedyId || null,
      user_id: user?.id || null,
      source: source || 'unknown',
      session_id: generateSessionId(),
    });

  if (error) {
    console.warn('[API] Error tracking click:', error);
  }

  // Incrémenter le compteur de clics
  await supabase.rpc('increment_product_click_count', { product_id: productId });
}

/**
 * Génère un ID de session anonyme
 */
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================
// EXPORTS
// ============================================

export default {
  getProductsForRemedy,
  getProductsForEssentialOil,
  getProductById,
  searchProducts,
  buildAmazonUrl,
  trackProductClick,
  AFFILIATE_TAG,
};
