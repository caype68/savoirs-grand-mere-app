// ============================================
// API REMÈDES
// Services pour récupérer les remèdes depuis Supabase
// ============================================

import { supabase } from '../supabase';
import { Remedy } from '../types/database';

// ============================================
// RÉCUPÉRATION DES REMÈDES
// ============================================

/**
 * Récupère tous les remèdes publiés
 */
export async function getRemedies(options?: {
  limit?: number;
  offset?: number;
  category?: string;
  search?: string;
  featured?: boolean;
}): Promise<Remedy[]> {
  let query = supabase
    .from('remedies')
    .select('*')
    .eq('status', 'published')
    .order('name', { ascending: true });

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
  }

  if (options?.featured) {
    query = query.eq('featured', true);
  }

  if (options?.search) {
    query = query.or(`name.ilike.%${options.search}%,indications.cs.{${options.search}}`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[API] Error fetching remedies:', error);
    throw error;
  }

  return data || [];
}

/**
 * Récupère un remède par son ID
 */
export async function getRemedyById(id: string): Promise<Remedy | null> {
  const { data, error } = await supabase
    .from('remedies')
    .select('*')
    .eq('id', id)
    .eq('status', 'published')
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    console.error('[API] Error fetching remedy:', error);
    throw error;
  }

  // Incrémenter le compteur de vues
  if (data) {
    await incrementRemedyViewCount(id);
  }

  return data;
}

/**
 * Récupère un remède par son slug
 */
export async function getRemedyBySlug(slug: string): Promise<Remedy | null> {
  const { data, error } = await supabase
    .from('remedies')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }

  if (data) {
    await incrementRemedyViewCount(data.id);
  }

  return data;
}

/**
 * Récupère les remèdes par catégorie
 */
export async function getRemediesByCategory(categoryId: string): Promise<Remedy[]> {
  const { data, error } = await supabase
    .from('remedy_categories')
    .select(`
      remedy_id,
      remedies (*)
    `)
    .eq('category_id', categoryId);

  if (error) {
    console.error('[API] Error fetching remedies by category:', error);
    throw error;
  }

  return data?.map(item => item.remedies).filter(Boolean) as Remedy[] || [];
}

/**
 * Récupère les remèdes mis en avant
 */
export async function getFeaturedRemedies(limit: number = 5): Promise<Remedy[]> {
  const { data, error } = await supabase
    .from('remedies')
    .select('*')
    .eq('status', 'published')
    .eq('featured', true)
    .order('featured_until', { ascending: false, nullsFirst: false })
    .limit(limit);

  if (error) {
    console.error('[API] Error fetching featured remedies:', error);
    throw error;
  }

  return data || [];
}

/**
 * Recherche de remèdes
 */
export async function searchRemedies(query: string, limit: number = 20): Promise<Remedy[]> {
  const searchTerms = query.toLowerCase().trim();

  const { data, error } = await supabase
    .from('remedies')
    .select('*')
    .eq('status', 'published')
    .or(`name.ilike.%${searchTerms}%,aliases.cs.{${searchTerms}},indications.cs.{${searchTerms}}`)
    .limit(limit);

  if (error) {
    console.error('[API] Error searching remedies:', error);
    throw error;
  }

  return data || [];
}

/**
 * Récupère les remèdes par indication
 */
export async function getRemediesByIndication(indication: string): Promise<Remedy[]> {
  const { data, error } = await supabase
    .from('remedies')
    .select('*')
    .eq('status', 'published')
    .contains('indications', [indication])
    .order('view_count', { ascending: false });

  if (error) {
    console.error('[API] Error fetching remedies by indication:', error);
    throw error;
  }

  return data || [];
}

// ============================================
// ACTIONS
// ============================================

/**
 * Incrémente le compteur de vues d'un remède
 */
async function incrementRemedyViewCount(id: string): Promise<void> {
  const { error } = await supabase.rpc('increment_remedy_view_count', { remedy_id: id });
  
  if (error) {
    console.warn('[API] Error incrementing view count:', error);
  }
}

// ============================================
// INGRÉDIENTS
// ============================================

/**
 * Récupère les ingrédients d'un remède
 */
export async function getRemedyIngredients(remedyId: string) {
  const { data, error } = await supabase
    .from('remedy_ingredients')
    .select(`
      *,
      ingredients (*)
    `)
    .eq('remedy_id', remedyId)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('[API] Error fetching remedy ingredients:', error);
    throw error;
  }

  return data || [];
}

/**
 * Récupère les étapes de préparation d'un remède
 */
export async function getRemedyPreparationSteps(remedyId: string) {
  const { data, error } = await supabase
    .from('preparation_steps')
    .select('*')
    .eq('remedy_id', remedyId)
    .order('step_number', { ascending: true });

  if (error) {
    console.error('[API] Error fetching preparation steps:', error);
    throw error;
  }

  return data || [];
}

// ============================================
// EXPORTS
// ============================================

export default {
  getRemedies,
  getRemedyById,
  getRemedyBySlug,
  getRemediesByCategory,
  getFeaturedRemedies,
  searchRemedies,
  getRemediesByIndication,
  getRemedyIngredients,
  getRemedyPreparationSteps,
};
