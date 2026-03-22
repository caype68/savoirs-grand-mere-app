export * from './storage';
export * from './compatibility';
export * from './products';

// Backend Supabase (mode hybride)
export * from './supabase';

// Export explicite du service affiliate pour éviter les conflits de noms
export {
  AMAZON_AFFILIATE_TAG,
  AMAZON_BASE_URL,
  buildAmazonAffiliateUrl,
  buildBestAmazonAffiliateUrl,
  buildAmazonSearchUrl,
  buildAmazonProductUrl,
  isValidAmazonAsin,
  extractAmazonAsinFromUrl,
  getProductAffiliateUrl,
  trackAffiliateClick,
  getAffiliateStats,
  getMostClickedProducts,
  getProductClickStats,
  openAffiliateLink,
  getAffiliateBadgeLabel,
  getAffiliateBadgeColor,
  getBadgeLabel,
  getBadgeColor,
  AFFILIATE_BADGE_LABELS,
  AFFILIATE_BADGE_COLORS,
} from './affiliate';

export * from './essentialOilSearch';
export * from './imageGenerator';
export * from './productMatching';
export * from './dailyRecommendations';
export * from './streak';
export * from './dailyRoutine';
export * from './remedyHistory';
export * from './wellnessStats';
