// ============================================
// SERVICE PREMIUM
// Gestion de l'abonnement premium et des publicités
// ============================================

import AsyncStorage from '@react-native-async-storage/async-storage';

const PREMIUM_KEY = '@premium_status';
const PREMIUM_EXPIRY_KEY = '@premium_expiry';

// ============================================
// TYPES
// ============================================

export interface PremiumStatus {
  isPremium: boolean;
  plan: 'free' | 'monthly' | 'yearly' | 'lifetime';
  expiresAt: string | null;
  features: PremiumFeature[];
}

export type PremiumFeature =
  | 'no_ads'
  | 'essential_oils'
  | 'advanced_routines'
  | 'unlimited_favorites'
  | 'wellness_history'
  | 'export_pdf'
  | 'priority_support';

// ============================================
// PLANS PREMIUM
// ============================================

export const PREMIUM_PLANS = {
  monthly: {
    id: 'monthly',
    name: 'Mensuel',
    price: '2,99 €',
    priceValue: 2.99,
    period: '/mois',
    features: ['no_ads', 'essential_oils', 'advanced_routines', 'unlimited_favorites'] as PremiumFeature[],
    popular: false,
  },
  yearly: {
    id: 'yearly',
    name: 'Annuel',
    price: '19,99 €',
    priceValue: 19.99,
    period: '/an',
    savings: '45%',
    features: ['no_ads', 'essential_oils', 'advanced_routines', 'unlimited_favorites', 'wellness_history', 'export_pdf'] as PremiumFeature[],
    popular: true,
  },
  lifetime: {
    id: 'lifetime',
    name: 'À vie',
    price: '39,99 €',
    priceValue: 39.99,
    period: 'une seule fois',
    features: ['no_ads', 'essential_oils', 'advanced_routines', 'unlimited_favorites', 'wellness_history', 'export_pdf', 'priority_support'] as PremiumFeature[],
    popular: false,
  },
};

export const FEATURE_LABELS: Record<PremiumFeature, { label: string; icon: string }> = {
  no_ads: { label: 'Sans publicités', icon: '🚫' },
  essential_oils: { label: 'Huiles essentielles', icon: '🫧' },
  advanced_routines: { label: 'Routines avancées', icon: '🧘' },
  unlimited_favorites: { label: 'Favoris illimités', icon: '❤️' },
  wellness_history: { label: 'Historique bien-être', icon: '📊' },
  export_pdf: { label: 'Export PDF', icon: '📄' },
  priority_support: { label: 'Support prioritaire', icon: '⭐' },
};

// ============================================
// FUNCTIONS
// ============================================

export async function getPremiumStatus(): Promise<PremiumStatus> {
  try {
    const stored = await AsyncStorage.getItem(PREMIUM_KEY);
    if (stored) {
      const status: PremiumStatus = JSON.parse(stored);
      // Vérifier si l'abonnement a expiré
      if (status.expiresAt && new Date(status.expiresAt) < new Date()) {
        return getFreePlan();
      }
      return status;
    }
  } catch (e) {
    console.warn('[Premium] Error reading status:', e);
  }
  return getFreePlan();
}

export function getFreePlan(): PremiumStatus {
  return {
    isPremium: false,
    plan: 'free',
    expiresAt: null,
    features: [],
  };
}

export async function activatePremium(plan: 'monthly' | 'yearly' | 'lifetime'): Promise<boolean> {
  try {
    const now = new Date();
    let expiresAt: string | null = null;

    if (plan === 'monthly') {
      const expiry = new Date(now);
      expiry.setMonth(expiry.getMonth() + 1);
      expiresAt = expiry.toISOString();
    } else if (plan === 'yearly') {
      const expiry = new Date(now);
      expiry.setFullYear(expiry.getFullYear() + 1);
      expiresAt = expiry.toISOString();
    }
    // lifetime = null (jamais expiré)

    const planDef = PREMIUM_PLANS[plan];
    const status: PremiumStatus = {
      isPremium: true,
      plan,
      expiresAt,
      features: planDef.features,
    };

    await AsyncStorage.setItem(PREMIUM_KEY, JSON.stringify(status));
    return true;
  } catch (e) {
    console.error('[Premium] Error activating:', e);
    return false;
  }
}

export async function deactivatePremium(): Promise<void> {
  await AsyncStorage.removeItem(PREMIUM_KEY);
}

export async function hasFeature(feature: PremiumFeature): Promise<boolean> {
  const status = await getPremiumStatus();
  return status.features.includes(feature);
}

export function shouldShowAds(premiumStatus: PremiumStatus): boolean {
  return !premiumStatus.isPremium;
}
