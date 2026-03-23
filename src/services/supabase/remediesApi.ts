// ============================================
// API REMÈDES HYBRIDE
// Utilise Supabase si disponible, sinon local
// ============================================

import { getSupabaseClient } from './config';
import { hybridQuery, isUsingRemote } from './backendProvider';
import { Remede } from '../../types';
import { remedes as localRemedes } from '../../data/remedes';

// ============================================
// TYPES SUPABASE
// ============================================

interface SupabaseRemedy {
  id: string;
  slug: string;
  name: string;
  aliases: string[] | null;
  route: string;
  description: string | null;
  preparation_time: string | null;
  usage_duration: string | null;
  posology_frequency: string | null;
  posology_duration: string | null;
  posology_notes: string | null;
  indications: string[];
  contraindications: string[];
  precautions: string[] | null;
  source_book: string | null;
  source_author: string | null;
  source_year: string | null;
  source_page: number | null;
  source_confidence: number | null;
  difficulty_level: string;
  is_verified: boolean;
  view_count: number;
  status: string;
}

// ============================================
// CONVERSION SUPABASE -> LOCAL
// ============================================

function convertSupabaseToLocal(supabaseRemedy: SupabaseRemedy): Remede {
  return {
    id: supabaseRemedy.slug || supabaseRemedy.id,
    nom: supabaseRemedy.name,
    alias: supabaseRemedy.aliases || undefined,
    route: supabaseRemedy.route as Remede['route'],
    ingredients: [], // À charger séparément
    preparation: [], // À charger séparément
    posologie: {
      frequence: supabaseRemedy.posology_frequency || '',
      duree: supabaseRemedy.posology_duration || undefined,
      remarques: supabaseRemedy.posology_notes || undefined,
    },
    indications: supabaseRemedy.indications || [],
    contreIndications: supabaseRemedy.contraindications || [],
    precautions: supabaseRemedy.precautions || undefined,
    source: {
      livre: supabaseRemedy.source_book || 'Inconnu',
      page: supabaseRemedy.source_page || 0,
      confianceOCR: supabaseRemedy.source_confidence || 0.8,
      confianceParsing: supabaseRemedy.source_confidence || 0.8,
      confianceGlobale: supabaseRemedy.source_confidence || 0.8,
    },
    verifie: supabaseRemedy.is_verified,
  };
}

// ============================================
// API REMÈDES
// ============================================

/**
 * Récupère tous les remèdes
 */
export async function getRemedies(options?: {
  limit?: number;
  search?: string;
  category?: string;
  featured?: boolean;
}): Promise<{ data: Remede[]; source: string }> {
  return hybridQuery<Remede[]>(
    // Requête remote
    async () => {
      const client = getSupabaseClient();
      if (!client) throw new Error('No Supabase client');

      let query = client
        .from('remedies')
        .select('*')
        .eq('status', 'published')
        .order('name', { ascending: true });

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      if (options?.search) {
        query = query.or(`name.ilike.%${options.search}%,indications.cs.{${options.search}}`);
      }

      if (options?.featured) {
        query = query.eq('featured', true);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(convertSupabaseToLocal);
    },
    // Fallback local
    () => {
      let result = [...localRemedes];

      if (options?.search) {
        const searchLower = options.search.toLowerCase();
        result = result.filter(r =>
          r.nom.toLowerCase().includes(searchLower) ||
          r.indications.some(i => i.toLowerCase().includes(searchLower))
        );
      }

      if (options?.limit) {
        result = result.slice(0, options.limit);
      }

      return result;
    },
    { cacheKey: `remedies_${JSON.stringify(options || {})}` }
  );
}

/**
 * Récupère un remède par son ID
 */
export async function getRemedyById(id: string): Promise<{ data: Remede | null; source: string }> {
  return hybridQuery<Remede | null>(
    // Requête remote
    async () => {
      const client = getSupabaseClient();
      if (!client) throw new Error('No Supabase client');

      const { data, error } = await client
        .from('remedies')
        .select('*')
        .or(`id.eq.${id},slug.eq.${id}`)
        .eq('status', 'published')
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      // Incrémenter le compteur de vues
      if (data) {
        Promise.resolve(client.rpc('increment_remedy_view_count', { remedy_id: data.id })).catch(() => {});
      }

      return data ? convertSupabaseToLocal(data) : null;
    },
    // Fallback local
    () => {
      return localRemedes.find(r => r.id === id) || null;
    },
    { cacheKey: `remedy_${id}` }
  );
}

/**
 * Recherche de remèdes
 */
export async function searchRemedies(
  query: string,
  limit: number = 20
): Promise<{ data: Remede[]; source: string }> {
  return getRemedies({ search: query, limit });
}

/**
 * Récupère les remèdes par indication
 */
export async function getRemediesByIndication(
  indication: string
): Promise<{ data: Remede[]; source: string }> {
  return hybridQuery<Remede[]>(
    async () => {
      const client = getSupabaseClient();
      if (!client) throw new Error('No Supabase client');

      const { data, error } = await client
        .from('remedies')
        .select('*')
        .eq('status', 'published')
        .contains('indications', [indication])
        .order('view_count', { ascending: false });

      if (error) throw error;
      return (data || []).map(convertSupabaseToLocal);
    },
    () => {
      const indicationLower = indication.toLowerCase();
      return localRemedes.filter(r =>
        r.indications.some(i => i.toLowerCase().includes(indicationLower))
      );
    },
    { cacheKey: `remedies_indication_${indication}` }
  );
}

/**
 * Récupère les remèdes mis en avant
 */
export async function getFeaturedRemedies(
  limit: number = 5
): Promise<{ data: Remede[]; source: string }> {
  return hybridQuery<Remede[]>(
    async () => {
      const client = getSupabaseClient();
      if (!client) throw new Error('No Supabase client');

      const { data, error } = await client
        .from('remedies')
        .select('*')
        .eq('status', 'published')
        .eq('featured', true)
        .limit(limit);

      if (error) throw error;
      return (data || []).map(convertSupabaseToLocal);
    },
    () => {
      // En local, retourner les premiers remèdes vérifiés
      return localRemedes.filter(r => r.verifie).slice(0, limit);
    },
    { cacheKey: `remedies_featured_${limit}` }
  );
}

/**
 * Récupère le nombre total de remèdes
 */
export async function getRemediesCount(): Promise<{ count: number; source: string }> {
  return hybridQuery<number>(
    async () => {
      const client = getSupabaseClient();
      if (!client) throw new Error('No Supabase client');

      const { count, error } = await client
        .from('remedies')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published');

      if (error) throw error;
      return count || 0;
    },
    () => localRemedes.length,
    { cacheKey: 'remedies_count' }
  ).then(result => ({ count: result.data, source: result.source }));
}

// ============================================
// EXPORTS
// ============================================

export default {
  getRemedies,
  getRemedyById,
  searchRemedies,
  getRemediesByIndication,
  getFeaturedRemedies,
  getRemediesCount,
};
