// ============================================
// EXPORTS SERVICES SUPABASE
// ============================================

// Configuration
export {
  getSupabaseClient,
  isBackendAvailable,
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  BACKEND_ENABLED,
} from './config';

// Backend Provider (mode hybride)
export {
  initializeBackend,
  getBackendState,
  isUsingRemote,
  forceLocalMode,
  refreshConnection,
  hybridQuery,
  clearCache,
  type BackendState,
} from './backendProvider';

// API Remèdes
export {
  getRemedies,
  getRemedyById,
  searchRemedies,
  getFeaturedRemedies,
} from './remediesApi';

// API Wellness
export {
  saveWellnessLogToBackend,
  getTodayWellnessLogFromBackend,
  getWellnessLogByDate,
  getRecentWellnessLogs,
  generateDailyRecommendationFromLog,
  getTodayRecommendation,
  markRecommendationViewed,
  formatDateKey,
  generateId,
} from './wellnessApi';

// API Auth
export {
  signUp,
  signIn,
  signOut,
  getCurrentUser,
  isAuthenticated,
  getUserProfileFromBackend,
  updateUserProfile,
  updateUserGoals,
  type AuthState,
  type SignUpData,
  type SignInData,
} from './authApi';

// API Streak & Badges
export {
  getUserStreak,
  updateUserStreak,
  getUserBadges,
  BADGE_DEFINITIONS,
  type UserStreak,
  type UserBadge,
  type BadgeDefinition,
} from './streakApi';

// Migration Service
export {
  migrateLocalDataToSupabase,
  isMigrationCompleted,
  getMigrationStatus,
  checkAndMigrate,
  resetMigrationStatus,
  type MigrationStatus,
  type MigrationResult,
} from './migrationService';
