import { Remede } from '../types';

// Synonymes régionaux et termes courants pour la recherche intelligente
const symptomSynonyms: Record<string, string[]> = {
  'rhume': ['refroidissement', 'grippe', 'enrhumé', 'nez bouché', 'nez qui coule'],
  'toux': ['tousser', 'quinte', 'expectoration'],
  'gorge': ['mal de gorge', 'mal gorge', 'angine', 'pharyngite', 'gorge irritée', 'gorge qui gratte'],
  'digestion': ['estomac', 'ventre', 'ballonnement', 'indigestion', 'mal au ventre', 'digérer'],
  'stress': ['anxiété', 'angoisse', 'nervosité', 'tension', 'anxieux', 'nerveux', 'stresser'],
  'sommeil': ['insomnie', 'dormir', 'endormir', 'nuit', 'fatigue', 'repos'],
  'immunité': ['défenses', 'système immunitaire', 'résistance', 'prévention'],
  'tête': ['mal de tête', 'migraine', 'céphalée', 'maux de tête'],
  'peau': ['eczéma', 'irritation', 'démangeaison', 'bouton', 'acné'],
  'fièvre': ['température', 'chaud', 'frissons'],
  'douleur': ['douleurs', 'mal', 'souffrance', 'douloureux'],
};

// Fonction pour trouver les termes associés
const expandSearchTerms = (query: string): string[] => {
  const normalizedQuery = query.toLowerCase();
  const terms = [normalizedQuery];
  
  for (const [key, synonyms] of Object.entries(symptomSynonyms)) {
    if (normalizedQuery.includes(key) || synonyms.some(s => normalizedQuery.includes(s))) {
      terms.push(key, ...synonyms);
    }
  }
  
  return [...new Set(terms)];
};

export interface SearchFilters {
  route?: 'orale' | 'cutanee' | 'inhalation' | null;
  livre?: string | null;
  confianceMin?: number;
  verifieOnly?: boolean;
}

export interface SearchResult {
  remede: Remede;
  score: number;
  matchReason: string;
}

const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
};

const levenshteinDistance = (a: string, b: string): number => {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[b.length][a.length];
};

const isFuzzyMatch = (query: string, target: string, threshold: number = 2): boolean => {
  const normalizedQuery = normalizeText(query);
  const normalizedTarget = normalizeText(target);
  
  // Direct inclusion check
  if (normalizedTarget.includes(normalizedQuery)) {
    return true;
  }
  
  // Check if query is included in target
  if (normalizedQuery.includes(normalizedTarget)) {
    return true;
  }
  
  // Check each word
  const words = normalizedTarget.split(/\s+/);
  for (const word of words) {
    if (word.includes(normalizedQuery) || normalizedQuery.includes(word)) {
      return true;
    }
    if (levenshteinDistance(normalizedQuery, word) <= threshold) {
      return true;
    }
  }
  
  return false;
};

export const searchRemedes = (
  remedes: Remede[],
  query: string,
  filters: SearchFilters = {}
): SearchResult[] => {
  const normalizedQuery = normalizeText(query);
  const expandedTerms = expandSearchTerms(query);
  const results: SearchResult[] = [];
  
  for (const remede of remedes) {
    // Apply filters first
    if (filters.route && remede.route !== filters.route) continue;
    if (filters.livre && remede.source.livre !== filters.livre) continue;
    if (filters.confianceMin && remede.source.confianceGlobale < filters.confianceMin) continue;
    if (filters.verifieOnly && !remede.verifie) continue;
    
    let score = 0;
    const matchReasons: string[] = [];
    
    // Match on name
    if (isFuzzyMatch(query, remede.nom)) {
      score += 10;
      matchReasons.push(`nom: ${remede.nom}`);
    }
    
    // Match on aliases
    if (remede.alias) {
      for (const alias of remede.alias) {
        if (isFuzzyMatch(query, alias)) {
          score += 8;
          matchReasons.push(`alias: ${alias}`);
          break;
        }
      }
    }
    
    // Match on common typos
    if (remede.fautesFrequentes) {
      for (const faute of remede.fautesFrequentes) {
        if (isFuzzyMatch(query, faute, 1)) {
          score += 6;
          matchReasons.push(`faute corrigée: ${faute}`);
          break;
        }
      }
    }
    
    // Match on ingredients
    for (const ingredient of remede.ingredients) {
      if (isFuzzyMatch(query, ingredient.nom)) {
        score += 5;
        matchReasons.push(`ingrédient: ${ingredient.nom}`);
        break;
      }
      if (ingredient.alias) {
        for (const alias of ingredient.alias) {
          if (isFuzzyMatch(query, alias)) {
            score += 4;
            matchReasons.push(`ingrédient alias: ${alias}`);
            break;
          }
        }
      }
    }
    
    // Match on indications (with expanded synonyms)
    for (const indication of remede.indications) {
      if (isFuzzyMatch(query, indication)) {
        score += 3;
        matchReasons.push(`usage: ${indication}`);
        break;
      }
      // Check expanded terms (synonyms)
      for (const term of expandedTerms) {
        if (term !== normalizedQuery && isFuzzyMatch(term, indication)) {
          score += 2;
          matchReasons.push(`synonyme: ${term}`);
          break;
        }
      }
    }
    
    if (score > 0) {
      results.push({
        remede,
        score,
        matchReason: matchReasons.join(' + '),
      });
    }
  }
  
  // Sort by score descending
  return results.sort((a, b) => b.score - a.score);
};

export const sortResults = (
  results: SearchResult[],
  sortBy: 'pertinence' | 'confiance' | 'nom'
): SearchResult[] => {
  const sorted = [...results];
  
  switch (sortBy) {
    case 'pertinence':
      return sorted.sort((a, b) => b.score - a.score);
    case 'confiance':
      return sorted.sort((a, b) => 
        b.remede.source.confianceGlobale - a.remede.source.confianceGlobale
      );
    case 'nom':
      return sorted.sort((a, b) => 
        a.remede.nom.localeCompare(b.remede.nom, 'fr')
      );
    default:
      return sorted;
  }
};
