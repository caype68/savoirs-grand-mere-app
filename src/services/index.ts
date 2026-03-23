// ============================================
// EXPORTS SERVICES
// Le Supabase hybride prend la priorité sur le local
// pour les fonctions qui existent dans les deux couches.
// ============================================

// Storage local — exports non-conflictuels uniquement
// (updateUserProfile est dans supabase/authApi → on utilise la version hybride)
export {
  createDefaultProfile,
  getUserProfile,
  saveUserProfile,
  getWellnessLogs,
  getTodayWellnessLog,
  saveWellnessLog,
  isOnboardingCompleted,
  completeOnboarding,
  trackEvent,
  trackProductClick,
  getNotificationHistory,
  saveNotificationToHistory,
  markNotificationAsClicked,
  clearAllData,
  exportUserData,
} from './storage';

export * from './compatibility';
export * from './products';

// Backend Supabase (mode hybride) — prend la priorité pour les noms partagés
export * from './supabase';

// Export explicite du service affiliate
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

// dailyRecommendations — exports non-conflictuels uniquement
// (formatDateKey, getWellnessLogByDate, getRecentWellnessLogs, getTodayRecommendation
//  sont déjà exportés par supabase/wellnessApi)
export {
  getTodayKey,
  parseDateKey,
  getDateLabel,
  RECOMMENDATION_RULES,
  getAllWellnessLogs,
  getDailyWellnessLog,
  saveDailyWellnessLog,
  updateWellnessLog,
  generateDailyRecommendation,
  getAllRecommendations,
  getRecommendationByDate,
  saveDailyRecommendation,
  getRecentRecommendations,
  markRecommendationAsViewed,
  markRecommendationAsFavorite,
  getWellnessStats,
  getJournalReminderNotification,
  getRecommendationNotification,
  type WellnessNotification,
} from './dailyRecommendations';

// streak local — exports non-conflictuels uniquement
// (getUserStreak, updateUserStreak sont dans supabase/streakApi)
export {
  STREAK_BADGES,
  getTodayDateKey,
  recordActivity as recordDailyActivity,
  checkAndUpdateStreak,
  getNextBadge,
  getUnlockedBadges,
  getBadgeProgress,
  resetStreak,
  getStreakMessage,
  getEncouragementMessage,
  STREAK_STORAGE_KEY,
} from './streak';

export * from './dailyRoutine';
export * from './remedyHistory';
export * from './wellnessStats';
