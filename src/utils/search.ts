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

const isFuzzyMatch = (query: string, target: string, threshold: number = 1): boolean => {
  const normalizedQuery = normalizeText(query);
  const normalizedTarget = normalizeText(target);

  // Direct inclusion — la cible contient le terme cherché
  if (normalizedTarget.includes(normalizedQuery)) {
    return true;
  }

  // Reverse inclusion — seulement si le mot cible est assez long (≥4 chars)
  // Sinon des mots courts comme "the", "mal" matchent tout
  if (normalizedTarget.length >= 4 && normalizedQuery.includes(normalizedTarget)) {
    return true;
  }

  // Vérifier chaque mot de la cible
  const words = normalizedTarget.split(/\s+/);
  for (const word of words) {
    // Match exact d'un mot
    if (word === normalizedQuery) {
      return true;
    }
    // Un mot de la cible contient le terme (ex: "anti-stress" contient "stress")
    if (word.length >= 4 && word.includes(normalizedQuery)) {
      return true;
    }
    // Levenshtein seulement pour les mots de longueur similaire (±3 chars)
    if (Math.abs(word.length - normalizedQuery.length) <= 3 &&
        word.length >= 4 && normalizedQuery.length >= 4) {
      if (levenshteinDistance(normalizedQuery, word) <= threshold) {
        return true;
      }
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
    // La 1ère indication = catégorie principale → score plus élevé
    let indicationMatched = false;
    for (let idx = 0; idx < remede.indications.length; idx++) {
      const indication = remede.indications[idx];
      const isPrimary = idx === 0; // 1ère indication = catégorie principale
      if (isFuzzyMatch(query, indication)) {
        score += isPrimary ? 6 : 3; // Boost x2 si catégorie principale
        matchReasons.push(isPrimary ? `catégorie: ${indication}` : `usage: ${indication}`);
        indicationMatched = true;
        break;
      }
      // Check expanded terms (synonyms)
      if (!indicationMatched) {
        for (const term of expandedTerms) {
          if (term !== normalizedQuery && isFuzzyMatch(term, indication)) {
            score += isPrimary ? 4 : 2;
            matchReasons.push(`synonyme: ${term}`);
            indicationMatched = true;
            break;
          }
        }
      }
      if (indicationMatched) break;
    }
    
    // Score minimum de 3 pour filtrer les matchs trop faibles (synonymes seuls = 2)
    if (score >= 3) {
      results.push({
        remede,
        score,
        matchReason: matchReasons.join(' + '),
      });
    }
  }

  // Sort by score descending, limiter à 20 résultats max
  return results.sort((a, b) => b.score - a.score).slice(0, 20);
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
