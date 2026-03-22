// ============================================
// SERVICE API AUTH - SUPABASE
// Authentification et gestion du profil utilisateur
// ============================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSupabaseClient } from './config';
import { isUsingRemote } from './backendProvider';
import { UserProfile, HealthGoal, Gender, ProfileType, ExperienceLevel, NotificationFrequency, RemedyFormat } from '../../types';

// ============================================
// CONSTANTES
// ============================================

const USER_PROFILE_KEY = '@user_profile';
const AUTH_STATE_KEY = '@auth_state';

// ============================================
// TYPES
// ============================================

export interface AuthState {
  isAuthenticated: boolean;
  userId: string | null;
  email: string | null;
  isGuest: boolean;
}

export interface SignUpData {
  email: string;
  password: string;
  displayName?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

// ============================================
// AUTH FUNCTIONS
// ============================================

/**
 * Inscription d'un nouvel utilisateur
 */
export async function signUp(data: SignUpData): Promise<{ success: boolean; error?: string; userId?: string }> {
  const client = getSupabaseClient();
  
  if (!client) {
    return { success: false, error: 'Backend non configuré' };
  }

  try {
    const { data: authData, error } = await client.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          display_name: data.displayName || data.email.split('@')[0],
        },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (authData.user) {
      // Créer le profil utilisateur
      await createUserProfile(authData.user.id, data.displayName || data.email.split('@')[0]);
      
      // Sauvegarder l'état d'auth localement
      await saveAuthState({
        isAuthenticated: true,
        userId: authData.user.id,
        email: authData.user.email || null,
        isGuest: false,
      });

      return { success: true, userId: authData.user.id };
    }

    return { success: false, error: 'Erreur inconnue' };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Connexion d'un utilisateur existant
 */
export async function signIn(data: SignInData): Promise<{ success: boolean; error?: string; userId?: string }> {
  const client = getSupabaseClient();
  
  if (!client) {
    return { success: false, error: 'Backend non configuré' };
  }

  try {
    const { data: authData, error } = await client.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (authData.user) {
      await saveAuthState({
        isAuthenticated: true,
        userId: authData.user.id,
        email: authData.user.email || null,
        isGuest: false,
      });

      return { success: true, userId: authData.user.id };
    }

    return { success: false, error: 'Erreur inconnue' };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Déconnexion
 */
export async function signOut(): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  
  if (client) {
    try {
      await client.auth.signOut();
    } catch (err) {
      console.warn('Erreur déconnexion Supabase:', err);
    }
  }

  // Toujours nettoyer l'état local
  await saveAuthState({
    isAuthenticated: false,
    userId: null,
    email: null,
    isGuest: true,
  });

  return { success: true };
}

/**
 * Récupère l'utilisateur courant
 */
export async function getCurrentUser(): Promise<AuthState> {
  const client = getSupabaseClient();
  
  if (client && isUsingRemote()) {
    try {
      const { data: { user } } = await client.auth.getUser();
      
      if (user) {
        const state: AuthState = {
          isAuthenticated: true,
          userId: user.id,
          email: user.email || null,
          isGuest: false,
        };
        await saveAuthState(state);
        return state;
      }
    } catch (err) {
      console.warn('Erreur récupération utilisateur:', err);
    }
  }

  // Fallback sur l'état local
  return getLocalAuthState();
}

/**
 * Vérifie si l'utilisateur est connecté
 */
export async function isAuthenticated(): Promise<boolean> {
  const state = await getCurrentUser();
  return state.isAuthenticated;
}

// ============================================
// USER PROFILE
// ============================================

/**
 * Crée un profil utilisateur
 */
async function createUserProfile(userId: string, displayName: string): Promise<void> {
  const client = getSupabaseClient();
  
  if (client) {
    try {
      await client.from('user_profiles').insert({
        id: userId,
        display_name: displayName,
        goals: [],
        preferences: {},
        created_at: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Erreur création profil:', err);
    }
  }
}

/**
 * Récupère le profil utilisateur
 */
export async function getUserProfileFromBackend(): Promise<UserProfile | null> {
  const client = getSupabaseClient();
  
  if (client && isUsingRemote()) {
    try {
      const { data: { user } } = await client.auth.getUser();
      if (!user) return getLocalUserProfile();

      const { data, error } = await client
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return getLocalUserProfile();
        throw error;
      }

      if (data) {
        const profile = convertSupabaseProfile(data);
        await saveLocalUserProfile(profile);
        return profile;
      }
    } catch (err) {
      console.warn('Erreur récupération profil:', err);
    }
  }

  return getLocalUserProfile();
}

/**
 * Met à jour le profil utilisateur
 */
export async function updateUserProfile(updates: Partial<UserProfile>): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  
  if (client && isUsingRemote()) {
    try {
      const { data: { user } } = await client.auth.getUser();
      if (!user) {
        return { success: false, error: 'Non connecté' };
      }

      const { error } = await client
        .from('user_profiles')
        .update({
          nom: updates.nom,
          objectifs: updates.objectifs,
          formats_preferes: updates.formatsPreferes,
          allergies: updates.allergies,
          restrictions: updates.restrictions,
          niveau_experience: updates.niveauExperience,
          notifications_enabled: updates.notificationsEnabled,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  // Toujours mettre à jour localement
  const currentProfile = await getLocalUserProfile();
  const updatedProfile: UserProfile = {
    ...getDefaultProfile(),
    ...currentProfile,
    ...updates,
    id: currentProfile?.id || 'guest',
    updatedAt: new Date().toISOString(),
  };
  
  await saveLocalUserProfile(updatedProfile);
  return { success: true };
}

/**
 * Met à jour les objectifs de l'utilisateur
 */
export async function updateUserGoals(goals: HealthGoal[]): Promise<{ success: boolean; error?: string }> {
  return updateUserProfile({ objectifs: goals });
}

// ============================================
// DEFAULT PROFILE
// ============================================

function getDefaultProfile(): UserProfile {
  return {
    id: 'guest',
    sexe: 'non_precise' as Gender,
    profileType: 'adulte' as ProfileType,
    objectifs: [],
    formatsPreferes: [],
    allergies: [],
    restrictions: [],
    niveauExperience: 'debutant' as ExperienceLevel,
    notificationsEnabled: true,
    notificationFrequency: 'quotidien' as NotificationFrequency,
    notificationHoraires: { matin: '08:00', soir: '21:00' },
    interesseParProduits: true,
    onboardingCompleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// ============================================
// LOCAL STORAGE HELPERS
// ============================================

async function saveAuthState(state: AuthState): Promise<void> {
  await AsyncStorage.setItem(AUTH_STATE_KEY, JSON.stringify(state));
}

async function getLocalAuthState(): Promise<AuthState> {
  try {
    const stored = await AsyncStorage.getItem(AUTH_STATE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (err) {
    console.warn('Erreur lecture état auth:', err);
  }

  return {
    isAuthenticated: false,
    userId: null,
    email: null,
    isGuest: true,
  };
}

async function getLocalUserProfile(): Promise<UserProfile | null> {
  try {
    const stored = await AsyncStorage.getItem(USER_PROFILE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (err) {
    console.warn('Erreur lecture profil local:', err);
  }
  return null;
}

async function saveLocalUserProfile(profile: UserProfile): Promise<void> {
  await AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
}

// ============================================
// CONVERTERS
// ============================================

function convertSupabaseProfile(data: any): UserProfile {
  return {
    id: data.id,
    displayName: data.display_name,
    email: data.email,
    goals: data.goals || [],
    preferences: data.preferences || {},
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

// ============================================
// EXPORTS
// ============================================

export {
  saveAuthState,
  getLocalAuthState,
  getLocalUserProfile,
  saveLocalUserProfile,
};
