import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  UserProfile, 
  WellnessLog, 
  NotificationHistory,
  AnalyticsEvent,
  ProductClickTracking,
} from '../types';

// ============================================
// CLÉS DE STOCKAGE
// ============================================

const STORAGE_KEYS = {
  USER_PROFILE: '@savoirs_user_profile',
  WELLNESS_LOGS: '@savoirs_wellness_logs',
  NOTIFICATION_HISTORY: '@savoirs_notification_history',
  ANALYTICS_EVENTS: '@savoirs_analytics_events',
  PRODUCT_CLICKS: '@savoirs_product_clicks',
  ONBOARDING_COMPLETED: '@savoirs_onboarding_completed',
  FAVORITES: '@savoirs_favorites',
} as const;

// ============================================
// PROFIL UTILISATEUR
// ============================================

export const createDefaultProfile = (): UserProfile => ({
  id: `user_${Date.now()}`,
  sexe: 'non_precise',
  profileType: 'adulte',
  objectifs: [],
  formatsPreferes: [],
  allergies: [],
  restrictions: [],
  niveauExperience: 'debutant',
  notificationsEnabled: true,
  notificationFrequency: 'quotidien',
  notificationHoraires: {
    matin: '08:00',
    soir: '21:00',
  },
  interesseParProduits: true,
  onboardingCompleted: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const getUserProfile = async (): Promise<UserProfile | null> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Erreur lecture profil:', error);
    return null;
  }
};

export const saveUserProfile = async (profile: UserProfile): Promise<boolean> => {
  try {
    const updatedProfile = {
      ...profile,
      updatedAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(updatedProfile));
    return true;
  } catch (error) {
    console.error('Erreur sauvegarde profil:', error);
    return false;
  }
};

export const updateUserProfile = async (updates: Partial<UserProfile>): Promise<UserProfile | null> => {
  try {
    const currentProfile = await getUserProfile();
    if (!currentProfile) {
      const newProfile = { ...createDefaultProfile(), ...updates };
      await saveUserProfile(newProfile);
      return newProfile;
    }
    const updatedProfile = { ...currentProfile, ...updates, updatedAt: new Date().toISOString() };
    await saveUserProfile(updatedProfile);
    return updatedProfile;
  } catch (error) {
    console.error('Erreur mise à jour profil:', error);
    return null;
  }
};

export const isOnboardingCompleted = async (): Promise<boolean> => {
  try {
    const profile = await getUserProfile();
    return profile?.onboardingCompleted ?? false;
  } catch {
    return false;
  }
};

export const completeOnboarding = async (): Promise<void> => {
  await updateUserProfile({ onboardingCompleted: true });
};

// ============================================
// SUIVI BIEN-ÊTRE
// ============================================

export const getWellnessLogs = async (limit?: number): Promise<WellnessLog[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.WELLNESS_LOGS);
    const logs: WellnessLog[] = data ? JSON.parse(data) : [];
    // Trier par date décroissante
    logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return limit ? logs.slice(0, limit) : logs;
  } catch (error) {
    console.error('Erreur lecture wellness logs:', error);
    return [];
  }
};

export const getTodayWellnessLog = async (): Promise<WellnessLog | null> => {
  try {
    const logs = await getWellnessLogs();
    const today = new Date().toISOString().split('T')[0];
    return logs.find(log => log.date.startsWith(today)) || null;
  } catch {
    return null;
  }
};

export const saveWellnessLog = async (log: WellnessLog): Promise<boolean> => {
  try {
    const logs = await getWellnessLogs();
    // Remplacer si même date existe
    const existingIndex = logs.findIndex(l => l.date.split('T')[0] === log.date.split('T')[0]);
    if (existingIndex >= 0) {
      logs[existingIndex] = log;
    } else {
      logs.unshift(log);
    }
    // Garder max 90 jours
    const trimmedLogs = logs.slice(0, 90);
    await AsyncStorage.setItem(STORAGE_KEYS.WELLNESS_LOGS, JSON.stringify(trimmedLogs));
    return true;
  } catch (error) {
    console.error('Erreur sauvegarde wellness log:', error);
    return false;
  }
};

// ============================================
// ANALYTICS & TRACKING
// ============================================

export const trackEvent = async (event: Omit<AnalyticsEvent, 'id' | 'timestamp'>): Promise<void> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.ANALYTICS_EVENTS);
    const events: AnalyticsEvent[] = data ? JSON.parse(data) : [];
    
    const newEvent: AnalyticsEvent = {
      ...event,
      id: `event_${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    
    events.unshift(newEvent);
    // Garder max 500 événements
    const trimmedEvents = events.slice(0, 500);
    await AsyncStorage.setItem(STORAGE_KEYS.ANALYTICS_EVENTS, JSON.stringify(trimmedEvents));
  } catch (error) {
    console.error('Erreur tracking event:', error);
  }
};

export const trackProductClick = async (tracking: Omit<ProductClickTracking, 'timestamp'>): Promise<void> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.PRODUCT_CLICKS);
    const clicks: ProductClickTracking[] = data ? JSON.parse(data) : [];
    
    const newClick: ProductClickTracking = {
      ...tracking,
      timestamp: new Date().toISOString(),
    };
    
    clicks.unshift(newClick);
    await AsyncStorage.setItem(STORAGE_KEYS.PRODUCT_CLICKS, JSON.stringify(clicks));
    
    // Aussi tracker comme événement général
    await trackEvent({
      type: 'click_product',
      payload: tracking,
    });
  } catch (error) {
    console.error('Erreur tracking product click:', error);
  }
};

export const getProductClickStats = async (productId: string): Promise<{ total: number; last30Days: number }> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.PRODUCT_CLICKS);
    const clicks: ProductClickTracking[] = data ? JSON.parse(data) : [];
    
    const productClicks = clicks.filter(c => c.productId === productId);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const last30Days = productClicks.filter(
      c => new Date(c.timestamp) >= thirtyDaysAgo
    ).length;
    
    return { total: productClicks.length, last30Days };
  } catch {
    return { total: 0, last30Days: 0 };
  }
};

// ============================================
// NOTIFICATIONS
// ============================================

export const getNotificationHistory = async (limit?: number): Promise<NotificationHistory[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATION_HISTORY);
    const history: NotificationHistory[] = data ? JSON.parse(data) : [];
    history.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
    return limit ? history.slice(0, limit) : history;
  } catch {
    return [];
  }
};

export const saveNotificationToHistory = async (notification: NotificationHistory): Promise<void> => {
  try {
    const history = await getNotificationHistory();
    history.unshift(notification);
    // Garder max 100 notifications
    const trimmed = history.slice(0, 100);
    await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATION_HISTORY, JSON.stringify(trimmed));
  } catch (error) {
    console.error('Erreur sauvegarde notification:', error);
  }
};

export const markNotificationAsClicked = async (notificationId: string): Promise<void> => {
  try {
    const history = await getNotificationHistory();
    const index = history.findIndex(n => n.id === notificationId);
    if (index >= 0) {
      history[index].clicked = true;
      history[index].clickedAt = new Date().toISOString();
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATION_HISTORY, JSON.stringify(history));
    }
  } catch (error) {
    console.error('Erreur marquage notification:', error);
  }
};

// ============================================
// UTILITAIRES
// ============================================

export const clearAllData = async (): Promise<void> => {
  try {
    const keys = Object.values(STORAGE_KEYS);
    await Promise.all(keys.map(key => AsyncStorage.removeItem(key)));
  } catch (error) {
    console.error('Erreur suppression données:', error);
  }
};

export const exportUserData = async (): Promise<Record<string, unknown>> => {
  try {
    const profile = await getUserProfile();
    const wellnessLogs = await getWellnessLogs();
    const notificationHistory = await getNotificationHistory();
    
    return {
      profile,
      wellnessLogs,
      notificationHistory,
      exportedAt: new Date().toISOString(),
    };
  } catch {
    return {};
  }
};
