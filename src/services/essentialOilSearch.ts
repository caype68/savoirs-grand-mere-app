// ============================================
// SERVICE DE RECHERCHE HUILES ESSENTIELLES
// Intégration à la recherche globale
// ============================================

import { EssentialOil, EssentialOilRemedy } from '../types';
import { 
  ESSENTIAL_OILS, 
  searchEssentialOils, 
  getEssentialOilsByCategory 
} from '../data/essentialOils';
import { 
  ESSENTIAL_OIL_REMEDIES, 
  searchEssentialOilRemedies,
  getRemediesForEssentialOil 
} from '../data/essentialOilRemedies';

// ============================================
// TYPES
// ============================================

export interface EssentialOilSearchResult {
  type: 'essential_oil';
  item: EssentialOil;
  score: number;
  matchedOn: string[];
}

export interface EssentialOilRemedySearchResult {
  type: 'essential_oil_remedy';
  item: EssentialOilRemedy;
  score: number;
  matchedOn: string[];
}

export type AromatherapySearchResult = EssentialOilSearchResult | EssentialOilRemedySearchResult;

export interface GlobalSearchResult {
  aromatherapy: AromatherapySearchResult[];
  totalCount: number;
}

// ============================================
// RECHERCHE AVANCÉE
// ============================================

/**
 * Recherche globale dans les huiles essentielles et remèdes aromathérapie
 */
export function searchAromatherapy(query: string): GlobalSearchResult {
  const normalizedQuery = query.toLowerCase().trim();
  
  if (!normalizedQuery || normalizedQuery.length < 2) {
    return { aromatherapy: [], totalCount: 0 };
  }

  const results: AromatherapySearchResult[] = [];

  // Recherche dans les huiles essentielles
  ESSENTIAL_OILS.forEach(oil => {
    const { score, matchedOn } = calculateOilScore(oil, normalizedQuery);
    if (score > 0) {
      results.push({
        type: 'essential_oil',
        item: oil,
        score,
        matchedOn,
      });
    }
  });

  // Recherche dans les remèdes aromathérapie
  ESSENTIAL_OIL_REMEDIES.forEach(remedy => {
    const { score, matchedOn } = calculateRemedyScore(remedy, normalizedQuery);
    if (score > 0) {
      results.push({
        type: 'essential_oil_remedy',
        item: remedy,
        score,
        matchedOn,
      });
    }
  });

  // Trier par score décroissant
  results.sort((a, b) => b.score - a.score);

  return {
    aromatherapy: results,
    totalCount: results.length,
  };
}

/**
 * Calcule le score de pertinence d'une huile essentielle
 */
function calculateOilScore(oil: EssentialOil, query: string): { score: number; matchedOn: string[] } {
  let score = 0;
  const matchedOn: string[] = [];

  // Nom exact (score élevé)
  if (oil.name.toLowerCase() === query) {
    score += 100;
    matchedOn.push('nom');
  } else if (oil.name.toLowerCase().includes(query)) {
    score += 50;
    matchedOn.push('nom');
  }

  // Nom latin
  if (oil.nameLatin?.toLowerCase().includes(query)) {
    score += 30;
    matchedOn.push('nom latin');
  }

  // Mots-clés (score moyen)
  const keywordMatches = oil.searchKeywords.filter(kw => kw.includes(query));
  if (keywordMatches.length > 0) {
    score += 20 * keywordMatches.length;
    matchedOn.push('mots-clés');
  }

  // Tags
  const tagMatches = oil.tags.filter(tag => tag.includes(query));
  if (tagMatches.length > 0) {
    score += 15 * tagMatches.length;
    matchedOn.push('tags');
  }

  // Propriétés
  const propMatches = oil.mainProperties.filter(p => p.toLowerCase().includes(query));
  if (propMatches.length > 0) {
    score += 10 * propMatches.length;
    matchedOn.push('propriétés');
  }

  // Usages
  const useMatches = oil.commonUses.filter(u => u.toLowerCase().includes(query));
  if (useMatches.length > 0) {
    score += 10 * useMatches.length;
    matchedOn.push('usages');
  }

  // Description
  if (oil.shortDescription.toLowerCase().includes(query)) {
    score += 5;
    matchedOn.push('description');
  }

  return { score, matchedOn };
}

/**
 * Calcule le score de pertinence d'un remède aromathérapie
 */
function calculateRemedyScore(remedy: EssentialOilRemedy, query: string): { score: number; matchedOn: string[] } {
  let score = 0;
  const matchedOn: string[] = [];

  // Titre exact
  if (remedy.title.toLowerCase() === query) {
    score += 100;
    matchedOn.push('titre');
  } else if (remedy.title.toLowerCase().includes(query)) {
    score += 50;
    matchedOn.push('titre');
  }

  // Symptômes ciblés (très important)
  const symptomMatches = remedy.symptomTargets.filter(s => s.toLowerCase().includes(query));
  if (symptomMatches.length > 0) {
    score += 30 * symptomMatches.length;
    matchedOn.push('symptômes');
  }

  // Mots-clés
  const keywordMatches = remedy.searchKeywords.filter(kw => kw.includes(query));
  if (keywordMatches.length > 0) {
    score += 20 * keywordMatches.length;
    matchedOn.push('mots-clés');
  }

  // Tags
  const tagMatches = remedy.tags.filter(tag => tag.includes(query));
  if (tagMatches.length > 0) {
    score += 15 * tagMatches.length;
    matchedOn.push('tags');
  }

  // Catégorie
  if (remedy.category.includes(query)) {
    score += 15;
    matchedOn.push('catégorie');
  }

  // Résumé
  if (remedy.summary.toLowerCase().includes(query)) {
    score += 5;
    matchedOn.push('résumé');
  }

  return { score, matchedOn };
}

// ============================================
// SUGGESTIONS DE RECHERCHE
// ============================================

/**
 * Génère des suggestions de recherche basées sur les données
 */
export function getSearchSuggestions(partialQuery: string): string[] {
  const normalized = partialQuery.toLowerCase().trim();
  
  if (normalized.length < 2) return [];

  const suggestions = new Set<string>();

  // Suggestions depuis les noms d'huiles
  ESSENTIAL_OILS.forEach(oil => {
    if (oil.name.toLowerCase().includes(normalized)) {
      suggestions.add(oil.name);
    }
  });

  // Suggestions depuis les symptômes
  ESSENTIAL_OIL_REMEDIES.forEach(remedy => {
    remedy.symptomTargets.forEach(symptom => {
      if (symptom.toLowerCase().includes(normalized)) {
        suggestions.add(symptom);
      }
    });
  });

  // Suggestions depuis les mots-clés populaires
  const popularKeywords = [
    'stress', 'sommeil', 'rhume', 'toux', 'digestion', 'douleur',
    'migraine', 'anxiété', 'fatigue', 'peau', 'acné', 'relaxation',
    'immunité', 'respiration', 'muscle', 'articulation'
  ];
  
  popularKeywords.forEach(kw => {
    if (kw.includes(normalized)) {
      suggestions.add(kw.charAt(0).toUpperCase() + kw.slice(1));
    }
  });

  return Array.from(suggestions).slice(0, 8);
}

// ============================================
// HUILES POPULAIRES / RECOMMANDÉES
// ============================================

/**
 * Récupère les huiles essentielles les plus populaires
 */
export function getPopularEssentialOils(limit: number = 6): EssentialOil[] {
  // Huiles considérées comme "essentielles" pour débuter
  const popularIds = [
    'lavande-vraie',
    'tea-tree',
    'menthe-poivree',
    'eucalyptus-radie',
    'citron',
    'ravintsara',
  ];

  return popularIds
    .map(id => ESSENTIAL_OILS.find(oil => oil.id === id))
    .filter((oil): oil is EssentialOil => oil !== undefined)
    .slice(0, limit);
}

/**
 * Récupère les huiles essentielles sûres pour débutants
 */
export function getBeginnerFriendlyOils(): EssentialOil[] {
  return ESSENTIAL_OILS.filter(oil => oil.safetyLevel === 'safe');
}

/**
 * Récupère les remèdes par catégorie
 */
export function getRemediesByCategory(category: string): EssentialOilRemedy[] {
  return ESSENTIAL_OIL_REMEDIES.filter(remedy => remedy.category === category);
}

// ============================================
// STATISTIQUES
// ============================================

export function getAromatherapyStats() {
  return {
    totalOils: ESSENTIAL_OILS.length,
    totalRemedies: ESSENTIAL_OIL_REMEDIES.length,
    safeOils: ESSENTIAL_OILS.filter(o => o.safetyLevel === 'safe').length,
    cautionOils: ESSENTIAL_OILS.filter(o => o.safetyLevel === 'caution').length,
    restrictedOils: ESSENTIAL_OILS.filter(o => o.safetyLevel === 'restricted').length,
  };
}
