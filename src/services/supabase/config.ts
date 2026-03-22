// ============================================
// CONFIGURATION SUPABASE
// Client et configuration pour l'app mobile
// ============================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// ============================================
// CONFIGURATION
// ============================================

// Variables d'environnement (à configurer dans app.config.js ou .env)
const SUPABASE_URL = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Flag pour activer/désactiver le backend
export const BACKEND_ENABLED = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

// ============================================
// CLIENT SUPABASE
// ============================================

let supabaseClient: SupabaseClient | null = null;

/**
 * Récupère le client Supabase (singleton)
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (!BACKEND_ENABLED) {
    return null;
  }

  if (!supabaseClient) {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }

  return supabaseClient;
}

/**
 * Vérifie si le backend est disponible
 */
export async function isBackendAvailable(): Promise<boolean> {
  if (!BACKEND_ENABLED) {
    return false;
  }

  try {
    const client = getSupabaseClient();
    if (!client) return false;

    // Test simple de connexion
    const { error } = await client.from('app_settings').select('key').limit(1);
    return !error;
  } catch {
    return false;
  }
}

/**
 * Récupère l'utilisateur courant
 */
export async function getCurrentUser() {
  const client = getSupabaseClient();
  if (!client) return null;

  const { data: { user } } = await client.auth.getUser();
  return user;
}

/**
 * Récupère la session courante
 */
export async function getSession() {
  const client = getSupabaseClient();
  if (!client) return null;

  const { data: { session } } = await client.auth.getSession();
  return session;
}

// ============================================
// EXPORTS
// ============================================

export {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  supabaseClient,
};

export default getSupabaseClient;
