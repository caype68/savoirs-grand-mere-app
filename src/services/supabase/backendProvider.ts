// ============================================
// BACKEND PROVIDER - SERVICE HYBRIDE
// Gère le basculement local <-> remote
// ============================================

import { getSupabaseClient, isBackendAvailable, BACKEND_ENABLED } from './config';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================
// TYPES
// ============================================

export type DataSource = 'local' | 'remote' | 'hybrid';

export interface BackendState {
  isOnline: boolean;
  dataSource: DataSource;
  lastSync: string | null;
  error: string | null;
}

// ============================================
// ÉTAT GLOBAL
// ============================================

let backendState: BackendState = {
  isOnline: false,
  dataSource: 'local',
  lastSync: null,
  error: null,
};

const STORAGE_KEY_BACKEND_STATE = '@backend_state';
const STORAGE_KEY_LAST_SYNC = '@last_sync';

// ============================================
// INITIALISATION
// ============================================

/**
 * Initialise le backend provider
 * À appeler au démarrage de l'app
 */
export async function initializeBackend(): Promise<BackendState> {
  console.log('[Backend] Initializing...');

  // Charger l'état précédent
  try {
    const savedState = await AsyncStorage.getItem(STORAGE_KEY_BACKEND_STATE);
    if (savedState) {
      backendState = { ...backendState, ...JSON.parse(savedState) };
    }
  } catch (error) {
    console.warn('[Backend] Error loading saved state:', error);
  }

  // Vérifier la disponibilité du backend
  if (BACKEND_ENABLED) {
    const isOnline = await isBackendAvailable();
    backendState.isOnline = isOnline;
    backendState.dataSource = isOnline ? 'remote' : 'local';
    
    if (isOnline) {
      console.log('[Backend] Connected to Supabase');
    } else {
      console.log('[Backend] Supabase unavailable, using local fallback');
    }
  } else {
    console.log('[Backend] Backend not configured, using local data');
    backendState.isOnline = false;
    backendState.dataSource = 'local';
  }

  // Sauvegarder l'état
  await saveBackendState();

  return backendState;
}

/**
 * Sauvegarde l'état du backend
 */
async function saveBackendState(): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY_BACKEND_STATE, JSON.stringify(backendState));
  } catch (error) {
    console.warn('[Backend] Error saving state:', error);
  }
}

// ============================================
// GETTERS
// ============================================

/**
 * Récupère l'état actuel du backend
 */
export function getBackendState(): BackendState {
  return { ...backendState };
}

/**
 * Vérifie si on utilise le backend distant
 */
export function isUsingRemote(): boolean {
  return backendState.isOnline && backendState.dataSource === 'remote';
}

/**
 * Vérifie si on utilise les données locales
 */
export function isUsingLocal(): boolean {
  return backendState.dataSource === 'local';
}

// ============================================
// ACTIONS
// ============================================

/**
 * Force le rafraîchissement de la connexion
 */
export async function refreshConnection(): Promise<boolean> {
  if (!BACKEND_ENABLED) {
    return false;
  }

  const isOnline = await isBackendAvailable();
  backendState.isOnline = isOnline;
  
  if (isOnline && backendState.dataSource === 'local') {
    backendState.dataSource = 'remote';
  } else if (!isOnline) {
    backendState.dataSource = 'local';
  }

  await saveBackendState();
  return isOnline;
}

/**
 * Force le mode local (pour debug ou offline)
 */
export async function forceLocalMode(): Promise<void> {
  backendState.dataSource = 'local';
  await saveBackendState();
  console.log('[Backend] Forced local mode');
}

/**
 * Réactive le mode remote
 */
export async function enableRemoteMode(): Promise<boolean> {
  if (!BACKEND_ENABLED) {
    return false;
  }

  const isOnline = await isBackendAvailable();
  if (isOnline) {
    backendState.dataSource = 'remote';
    backendState.isOnline = true;
    await saveBackendState();
    console.log('[Backend] Remote mode enabled');
    return true;
  }

  return false;
}

/**
 * Marque la dernière synchronisation
 */
export async function markSynced(): Promise<void> {
  const now = new Date().toISOString();
  backendState.lastSync = now;
  await AsyncStorage.setItem(STORAGE_KEY_LAST_SYNC, now);
  await saveBackendState();
}

// ============================================
// HELPER POUR REQUÊTES HYBRIDES
// ============================================

/**
 * Exécute une requête avec fallback local
 * @param remoteQuery Fonction qui fait la requête Supabase
 * @param localFallback Fonction qui retourne les données locales
 * @param options Options de la requête
 */
export async function hybridQuery<T>(
  remoteQuery: () => Promise<T>,
  localFallback: () => T | Promise<T>,
  options?: {
    forceLocal?: boolean;
    forceRemote?: boolean;
    cacheKey?: string;
  }
): Promise<{ data: T; source: DataSource }> {
  // Force local si demandé
  if (options?.forceLocal) {
    const data = await localFallback();
    return { data, source: 'local' };
  }

  // Essayer le remote si disponible
  if (isUsingRemote() || options?.forceRemote) {
    try {
      const data = await remoteQuery();
      
      // Mettre en cache si clé fournie
      if (options?.cacheKey) {
        await cacheData(options.cacheKey, data);
      }
      
      return { data, source: 'remote' };
    } catch (error) {
      console.warn('[Backend] Remote query failed, falling back to local:', error);
      
      // Essayer le cache d'abord
      if (options?.cacheKey) {
        const cached = await getCachedData<T>(options.cacheKey);
        if (cached) {
          return { data: cached, source: 'hybrid' };
        }
      }
      
      // Fallback local
      const data = await localFallback();
      return { data, source: 'local' };
    }
  }

  // Mode local
  const data = await localFallback();
  return { data, source: 'local' };
}

// ============================================
// CACHE LOCAL
// ============================================

const CACHE_PREFIX = '@cache_';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 heures

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

/**
 * Met en cache des données
 */
async function cacheData<T>(key: string, data: T): Promise<void> {
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
  } catch (error) {
    console.warn('[Backend] Cache write error:', error);
  }
}

/**
 * Récupère des données du cache
 */
async function getCachedData<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;

    const entry: CacheEntry<T> = JSON.parse(raw);
    
    // Vérifier l'expiration
    if (Date.now() - entry.timestamp > CACHE_EXPIRY) {
      await AsyncStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }

    return entry.data;
  } catch (error) {
    console.warn('[Backend] Cache read error:', error);
    return null;
  }
}

/**
 * Vide le cache
 */
export async function clearCache(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(k => k.startsWith(CACHE_PREFIX));
    for (const key of cacheKeys) {
      await AsyncStorage.removeItem(key);
    }
    console.log('[Backend] Cache cleared');
  } catch (error) {
    console.warn('[Backend] Error clearing cache:', error);
  }
}

// ============================================
// EXPORTS
// ============================================

export default {
  initializeBackend,
  getBackendState,
  isUsingRemote,
  isUsingLocal,
  refreshConnection,
  forceLocalMode,
  enableRemoteMode,
  markSynced,
  hybridQuery,
  clearCache,
};
