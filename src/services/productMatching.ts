// ============================================
// SERVICE DE MATCHING PRODUITS INTELLIGENT
// Associe automatiquement les bons produits Amazon
// aux remèdes basés sur leur composition réelle
// ============================================

import { Remede, Ingredient, AffiliateProduct } from '../types';

// ============================================
// TYPES POUR LE MATCHING
// ============================================

export type IngredientCategory = 
  | 'huile_essentielle'
  | 'plante'
  | 'miel'
  | 'argile'
  | 'agrume'
  | 'vinaigre'
  | 'huile_vegetale'
  | 'epice'
  | 'mineral'
  | 'support'
  | 'accessoire'
  | 'autre';

export type UsageRole = 'main' | 'secondary' | 'support' | 'tool';

export type RemedyType = 
  | 'infusion'
  | 'decoction'
  | 'inhalation'
  | 'diffusion'
  | 'cataplasme'
  | 'friction'
  | 'compresse'
  | 'bain'
  | 'gargarisme'
  | 'sirop'
  | 'autre';

export interface NormalizedIngredient {
  id: string;
  originalName: string;
  normalizedName: string;
  category: IngredientCategory;
  role: UsageRole;
  required: boolean;
  quantity?: string;
  synonyms: string[];
  specificType?: string; // ex: "radiata" pour eucalyptus radiata
}

export interface ProductCatalogItem {
  id: string;
  title: string;
  normalizedTitle: string;
  category: IngredientCategory;
  keywords: string[];
  searchQuery: string;
  asin?: string;
  image?: string;
  badge?: string;
  priceLabel?: string;
  qualityTags: string[];
  matchTargets: string[];
  isAccessory: boolean;
  specificType?: string;
  forRemedyTypes?: RemedyType[];
}

export interface MatchedProduct {
  product: ProductCatalogItem;
  ingredientName: string;
  matchScore: number;
  matchReason: string;
  isDirectMatch: boolean;
  role: UsageRole;
}

export interface MatchingResult {
  remedyId: string;
  remedyType: RemedyType;
  mainProducts: MatchedProduct[];
  supportProducts: MatchedProduct[];
  accessoryProducts: MatchedProduct[];
  alternativeProducts: MatchedProduct[];
}

// ============================================
// NORMALISATION DES NOMS
// ============================================

/**
 * Supprime les accents d'une chaîne
 */
function removeAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Mots à ignorer lors de la normalisation
 */
const STOP_WORDS = [
  'de', 'du', 'des', 'le', 'la', 'les', 'un', 'une',
  'et', 'ou', 'en', 'pour', 'avec', 'sans', 'sur',
  'bio', 'naturel', 'naturelle', 'pur', 'pure',
  'qualite', 'premium', 'artisanal', 'artisanale',
  'francais', 'francaise', 'france', 'provence',
];

/**
 * Normalise un nom d'ingrédient pour le matching
 */
export function normalizeIngredientName(name: string): string {
  let normalized = name.toLowerCase().trim();
  normalized = removeAccents(normalized);
  
  // Remplacer les caractères spéciaux
  normalized = normalized.replace(/[''`]/g, ' ');
  normalized = normalized.replace(/[-_]/g, ' ');
  
  // Supprimer les mots parasites
  const words = normalized.split(/\s+/);
  const filteredWords = words.filter(w => !STOP_WORDS.includes(w) && w.length > 1);
  
  return filteredWords.join(' ').trim();
}

// ============================================
// MAPPING DES SYNONYMES ET CATÉGORIES
// ============================================

const INGREDIENT_SYNONYMS: Record<string, string[]> = {
  // Huiles essentielles
  'huile essentielle': ['he', 'h.e.', 'huile ess', 'essence'],
  'eucalyptus radiata': ['eucalyptus radie', 'eucalyptus radié'],
  'eucalyptus globulus': ['eucalyptus globuleux'],
  'lavande fine': ['lavande vraie', 'lavandula angustifolia'],
  'lavande aspic': ['lavandula latifolia'],
  'lavandin': ['lavandula hybrida'],
  'menthe poivree': ['mentha piperita', 'menthe poivrée'],
  'tea tree': ['arbre a the', 'melaleuca'],
  'ravintsara': ['cinnamomum camphora'],
  'he citron': ['citrus limon', 'essence citron'],
  'orange douce': ['citrus sinensis'],
  
  // Plantes
  'thym': ['thymus', 'farigoule', 'farigoulette'],
  'camomille': ['matricaire', 'chamomille', 'camomile'],
  'camomille romaine': ['anthemis nobilis', 'chamaemelum nobile'],
  'tilleul': ['tilia'],
  'verveine': ['verbena'],
  'romarin': ['rosmarinus'],
  'sauge': ['salvia'],
  
  // Miels
  'miel': ['mièl'],
  'miel thym': ['miel de thym'],
  'miel lavande': ['miel de lavande'],
  'miel acacia': ['miel d acacia'],
  'miel manuka': ['manuka'],
  
  // Agrumes
  'citron': ['limon', 'citrus'],
  'orange': ['agrume orange'],
  'pamplemousse': ['pomelo'],
  
  // Argiles
  'argile verte': ['argile montmorillonite', 'argille verte'],
  'argile blanche': ['kaolin'],
  
  // Vinaigres
  'vinaigre cidre': ['vinaigre de cidre', 'vinaigre pomme'],
  
  // Huiles végétales
  'huile olive': ['huile d olive'],
  'huile amande': ['huile d amande douce'],
  'huile coco': ['huile de coco', 'huile noix coco'],
  'huile jojoba': ['huile de jojoba'],
  'huile argan': ['huile d argan'],
};

const CATEGORY_KEYWORDS: Record<IngredientCategory, string[]> = {
  'huile_essentielle': ['huile essentielle', 'he', 'h.e.', 'essence', 'aromatherapie'],
  'plante': ['plante', 'herbe', 'feuille', 'fleur', 'racine', 'tisane', 'infusion'],
  'miel': ['miel'],
  'argile': ['argile', 'kaolin', 'montmorillonite'],
  'agrume': ['citron', 'orange', 'pamplemousse', 'agrume', 'lime', 'bergamote'],
  'vinaigre': ['vinaigre'],
  'huile_vegetale': ['huile vegetale', 'huile amande', 'huile olive', 'huile coco', 'huile jojoba'],
  'epice': ['gingembre', 'curcuma', 'cannelle', 'clou girofle', 'poivre'],
  'mineral': ['sel', 'bicarbonate', 'charbon'],
  'support': ['eau', 'lait', 'creme'],
  'accessoire': ['infuseur', 'diffuseur', 'inhalateur', 'bol', 'spatule', 'bande', 'compresse'],
  'autre': [],
};

/**
 * Détermine la catégorie d'un ingrédient
 */
export function getIngredientCategory(name: string): IngredientCategory {
  const normalized = normalizeIngredientName(name);
  
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (normalized.includes(removeAccents(keyword))) {
        return category as IngredientCategory;
      }
    }
  }
  
  return 'autre';
}

/**
 * Trouve les synonymes d'un ingrédient
 */
export function getIngredientSynonyms(name: string): string[] {
  const normalized = normalizeIngredientName(name);
  const synonyms: string[] = [normalized];
  
  for (const [key, values] of Object.entries(INGREDIENT_SYNONYMS)) {
    const normalizedKey = removeAccents(key);
    if (normalized.includes(normalizedKey)) {
      synonyms.push(...values.map(v => removeAccents(v)));
    }
    for (const value of values) {
      if (normalized.includes(removeAccents(value))) {
        synonyms.push(normalizedKey);
        synonyms.push(...values.map(v => removeAccents(v)));
        break;
      }
    }
  }
  
  return [...new Set(synonyms)];
}

/**
 * Extrait le type spécifique (ex: "radiata" de "eucalyptus radiata")
 */
export function extractSpecificType(name: string): string | undefined {
  const normalized = normalizeIngredientName(name);
  
  // Patterns pour extraire les types spécifiques
  const patterns = [
    /eucalyptus\s+(radiata|globulus|citronne)/i,
    /lavande\s+(fine|vraie|aspic)/i,
    /menthe\s+(poivree|verte|douce)/i,
    /camomille\s+(romaine|allemande|matricaire)/i,
    /thym\s+(linalol|thymol|vulgaire)/i,
    /miel\s+(thym|lavande|acacia|manuka|foret|montagne)/i,
    /argile\s+(verte|blanche|rouge|rose)/i,
  ];
  
  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return undefined;
}

// ============================================
// EXTRACTION DES INGRÉDIENTS D'UN REMÈDE
// ============================================

/**
 * Extrait et normalise les ingrédients d'un remède
 */
export function extractRemedyIngredients(remedy: Remede): NormalizedIngredient[] {
  const ingredients: NormalizedIngredient[] = [];
  
  for (let i = 0; i < remedy.ingredients.length; i++) {
    const ing = remedy.ingredients[i];
    
    // Ignorer l'eau et les supports basiques
    if (ing.nom.toLowerCase() === 'eau') continue;
    
    const normalizedName = normalizeIngredientName(ing.nom);
    const category = getIngredientCategory(ing.nom);
    const synonyms = getIngredientSynonyms(ing.nom);
    const specificType = extractSpecificType(ing.nom);
    
    // Déterminer le rôle
    let role: UsageRole = 'secondary';
    if (i === 0 || ing.remarques?.toLowerCase().includes('principal')) {
      role = 'main';
    } else if (category === 'support' || category === 'accessoire') {
      role = category === 'accessoire' ? 'tool' : 'support';
    }
    
    // Déterminer si requis
    const required = !ing.remarques?.toLowerCase().includes('optionnel');
    
    ingredients.push({
      id: ing.id,
      originalName: ing.nom,
      normalizedName,
      category,
      role,
      required,
      quantity: ing.quantite ? `${ing.quantite} ${ing.unite || ''}`.trim() : undefined,
      synonyms,
      specificType,
    });
  }
  
  return ingredients;
}

/**
 * Détermine le type de remède basé sur la route et le nom
 */
export function getRemedyType(remedy: Remede): RemedyType {
  const nameLower = remedy.nom.toLowerCase();
  
  if (nameLower.includes('infusion') || nameLower.includes('tisane')) return 'infusion';
  if (nameLower.includes('decoction') || nameLower.includes('décoction')) return 'decoction';
  if (nameLower.includes('inhalation')) return 'inhalation';
  if (nameLower.includes('diffusion')) return 'diffusion';
  if (nameLower.includes('cataplasme')) return 'cataplasme';
  if (nameLower.includes('friction') || nameLower.includes('massage')) return 'friction';
  if (nameLower.includes('compresse')) return 'compresse';
  if (nameLower.includes('bain')) return 'bain';
  if (nameLower.includes('sirop')) return 'sirop';
  
  // Basé sur la route
  if (remedy.route === 'inhalation') return 'inhalation';
  if (remedy.route === 'gargarisme') return 'gargarisme';
  if (remedy.route === 'cutanee') return 'friction';
  
  return 'autre';
}

// ============================================
// CATALOGUE DE PRODUITS
// ============================================

export const PRODUCT_CATALOG: ProductCatalogItem[] = [
  // ============================================
  // HUILES ESSENTIELLES
  // ============================================
  {
    id: 'he-eucalyptus-radiata',
    title: 'Huile Essentielle Eucalyptus Radiata Bio',
    normalizedTitle: 'huile essentielle eucalyptus radiata',
    category: 'huile_essentielle',
    keywords: ['eucalyptus', 'radiata', 'radie', 'respiration', 'rhume', 'toux'],
    searchQuery: 'huile essentielle eucalyptus radiata bio 10ml',
    priceLabel: '~6,90 €',
    badge: 'bio',
    qualityTags: ['bio', 'pure', 'hebbd'],
    matchTargets: ['eucalyptus radiata', 'eucalyptus radie', 'eucalyptus'],
    isAccessory: false,
    specificType: 'radiata',
    forRemedyTypes: ['inhalation', 'diffusion', 'friction'],
  },
  {
    id: 'he-eucalyptus-globulus',
    title: 'Huile Essentielle Eucalyptus Globulus Bio',
    normalizedTitle: 'huile essentielle eucalyptus globulus',
    category: 'huile_essentielle',
    keywords: ['eucalyptus', 'globulus', 'globuleux', 'bronches', 'expectorant'],
    searchQuery: 'huile essentielle eucalyptus globulus bio 10ml',
    priceLabel: '~5,90 €',
    badge: 'bio',
    qualityTags: ['bio', 'pure'],
    matchTargets: ['eucalyptus globulus', 'eucalyptus globuleux'],
    isAccessory: false,
    specificType: 'globulus',
    forRemedyTypes: ['inhalation', 'diffusion', 'friction'],
  },
  {
    id: 'he-lavande-fine',
    title: 'Huile Essentielle Lavande Fine Bio Provence',
    normalizedTitle: 'huile essentielle lavande fine',
    category: 'huile_essentielle',
    keywords: ['lavande', 'fine', 'vraie', 'provence', 'relaxation', 'sommeil', 'stress'],
    searchQuery: 'huile essentielle lavande fine bio provence 10ml',
    priceLabel: '~8,90 €',
    badge: 'bio',
    qualityTags: ['bio', 'pure', 'aop'],
    matchTargets: ['lavande fine', 'lavande vraie', 'lavande', 'lavandula angustifolia'],
    isAccessory: false,
    specificType: 'fine',
    forRemedyTypes: ['inhalation', 'diffusion', 'friction', 'bain'],
  },
  {
    id: 'he-lavande-aspic',
    title: 'Huile Essentielle Lavande Aspic Bio',
    normalizedTitle: 'huile essentielle lavande aspic',
    category: 'huile_essentielle',
    keywords: ['lavande', 'aspic', 'piqure', 'brulure', 'cicatrisant'],
    searchQuery: 'huile essentielle lavande aspic bio 10ml',
    priceLabel: '~7,90 €',
    badge: 'bio',
    qualityTags: ['bio', 'pure'],
    matchTargets: ['lavande aspic', 'lavandula latifolia'],
    isAccessory: false,
    specificType: 'aspic',
    forRemedyTypes: ['friction'],
  },
  {
    id: 'he-menthe-poivree',
    title: 'Huile Essentielle Menthe Poivrée Bio',
    normalizedTitle: 'huile essentielle menthe poivree',
    category: 'huile_essentielle',
    keywords: ['menthe', 'poivree', 'digestif', 'migraine', 'nausee', 'rafraichissant'],
    searchQuery: 'huile essentielle menthe poivree bio 10ml',
    priceLabel: '~6,90 €',
    badge: 'bio',
    qualityTags: ['bio', 'pure'],
    matchTargets: ['menthe poivree', 'menthe', 'mentha piperita'],
    isAccessory: false,
    forRemedyTypes: ['inhalation', 'friction'],
  },
  {
    id: 'he-tea-tree',
    title: 'Huile Essentielle Tea Tree Bio',
    normalizedTitle: 'huile essentielle tea tree',
    category: 'huile_essentielle',
    keywords: ['tea tree', 'arbre the', 'antibacterien', 'antifongique', 'acne', 'peau'],
    searchQuery: 'huile essentielle tea tree bio 10ml',
    priceLabel: '~5,90 €',
    badge: 'bio',
    qualityTags: ['bio', 'pure'],
    matchTargets: ['tea tree', 'arbre a the', 'melaleuca'],
    isAccessory: false,
    forRemedyTypes: ['friction'],
  },
  {
    id: 'he-ravintsara',
    title: 'Huile Essentielle Ravintsara Bio Madagascar',
    normalizedTitle: 'huile essentielle ravintsara',
    category: 'huile_essentielle',
    keywords: ['ravintsara', 'immunite', 'antiviral', 'hiver', 'grippe'],
    searchQuery: 'huile essentielle ravintsara bio madagascar 10ml',
    priceLabel: '~8,90 €',
    badge: 'bio',
    qualityTags: ['bio', 'pure'],
    matchTargets: ['ravintsara', 'cinnamomum camphora'],
    isAccessory: false,
    forRemedyTypes: ['inhalation', 'diffusion', 'friction'],
  },
  {
    id: 'he-citron',
    title: 'Huile Essentielle Citron Bio',
    normalizedTitle: 'huile essentielle citron',
    category: 'huile_essentielle',
    keywords: ['citron', 'digestif', 'detox', 'assainissant', 'tonique'],
    searchQuery: 'huile essentielle citron bio 10ml',
    priceLabel: '~4,90 €',
    badge: 'bio',
    qualityTags: ['bio', 'pure'],
    matchTargets: ['huile essentielle citron', 'essence citron'],
    isAccessory: false,
    forRemedyTypes: ['diffusion'],
  },
  {
    id: 'he-romarin-cineole',
    title: 'Huile Essentielle Romarin à Cinéole Bio',
    normalizedTitle: 'huile essentielle romarin cineole',
    category: 'huile_essentielle',
    keywords: ['romarin', 'cineole', 'respiration', 'concentration', 'fatigue'],
    searchQuery: 'huile essentielle romarin cineole bio 10ml',
    priceLabel: '~6,90 €',
    badge: 'bio',
    qualityTags: ['bio', 'pure'],
    matchTargets: ['romarin', 'romarin cineole', 'rosmarinus'],
    isAccessory: false,
    forRemedyTypes: ['inhalation', 'diffusion', 'friction'],
  },
  {
    id: 'he-camomille-romaine',
    title: 'Huile Essentielle Camomille Romaine Bio',
    normalizedTitle: 'huile essentielle camomille romaine',
    category: 'huile_essentielle',
    keywords: ['camomille', 'romaine', 'stress', 'sommeil', 'apaisant', 'enfant'],
    searchQuery: 'huile essentielle camomille romaine bio 5ml',
    priceLabel: '~14,90 €',
    badge: 'premium',
    qualityTags: ['bio', 'pure'],
    matchTargets: ['camomille romaine', 'chamaemelum nobile'],
    isAccessory: false,
    specificType: 'romaine',
    forRemedyTypes: ['diffusion', 'friction', 'bain'],
  },
  {
    id: 'he-gaultherie',
    title: 'Huile Essentielle Gaulthérie Couchée Bio',
    normalizedTitle: 'huile essentielle gaultherie',
    category: 'huile_essentielle',
    keywords: ['gaultherie', 'douleur', 'muscle', 'articulation', 'sport'],
    searchQuery: 'huile essentielle gaultherie couchee bio 10ml',
    priceLabel: '~7,90 €',
    badge: 'bio',
    qualityTags: ['bio', 'pure'],
    matchTargets: ['gaultherie', 'wintergreen'],
    isAccessory: false,
    forRemedyTypes: ['friction'],
  },
  {
    id: 'he-helichryse',
    title: 'Huile Essentielle Hélichryse Italienne Bio',
    normalizedTitle: 'huile essentielle helichryse',
    category: 'huile_essentielle',
    keywords: ['helichryse', 'immortelle', 'hematome', 'cicatrice', 'bleu'],
    searchQuery: 'huile essentielle helichryse italienne bio 5ml',
    priceLabel: '~24,90 €',
    badge: 'premium',
    qualityTags: ['bio', 'pure'],
    matchTargets: ['helichryse', 'immortelle'],
    isAccessory: false,
    forRemedyTypes: ['friction'],
  },

  // ============================================
  // PLANTES SÉCHÉES
  // ============================================
  {
    id: 'plante-thym',
    title: 'Thym Bio Séché Feuilles - 200g',
    normalizedTitle: 'thym seche',
    category: 'plante',
    keywords: ['thym', 'farigoule', 'infusion', 'tisane', 'gorge', 'toux'],
    searchQuery: 'thym bio seche feuilles infusion 200g',
    priceLabel: '~9,90 €',
    badge: 'bio',
    qualityTags: ['bio', 'france'],
    matchTargets: ['thym', 'farigoule', 'thymus'],
    isAccessory: false,
    forRemedyTypes: ['infusion', 'decoction', 'gargarisme'],
  },
  {
    id: 'plante-camomille',
    title: 'Fleurs de Camomille Matricaire Bio - 100g',
    normalizedTitle: 'camomille matricaire fleurs',
    category: 'plante',
    keywords: ['camomille', 'matricaire', 'sommeil', 'digestion', 'apaisant'],
    searchQuery: 'camomille matricaire bio fleurs sechees infusion 100g',
    priceLabel: '~8,90 €',
    badge: 'bio',
    qualityTags: ['bio'],
    matchTargets: ['camomille', 'matricaire', 'chamomille'],
    isAccessory: false,
    forRemedyTypes: ['infusion'],
  },
  {
    id: 'plante-tilleul',
    title: 'Tilleul Bio Fleurs et Bractées - 100g',
    normalizedTitle: 'tilleul fleurs',
    category: 'plante',
    keywords: ['tilleul', 'sommeil', 'stress', 'relaxation'],
    searchQuery: 'tilleul bio fleurs bractees infusion 100g',
    priceLabel: '~9,90 €',
    badge: 'bio',
    qualityTags: ['bio', 'france'],
    matchTargets: ['tilleul', 'tilia'],
    isAccessory: false,
    forRemedyTypes: ['infusion'],
  },
  {
    id: 'plante-verveine',
    title: 'Verveine Odorante Bio - 100g',
    normalizedTitle: 'verveine',
    category: 'plante',
    keywords: ['verveine', 'digestion', 'relaxation', 'sommeil'],
    searchQuery: 'verveine odorante bio feuilles infusion 100g',
    priceLabel: '~10,90 €',
    badge: 'bio',
    qualityTags: ['bio', 'france'],
    matchTargets: ['verveine', 'verbena'],
    isAccessory: false,
    forRemedyTypes: ['infusion'],
  },
  {
    id: 'plante-romarin',
    title: 'Romarin Bio Feuilles Séchées - 100g',
    normalizedTitle: 'romarin feuilles',
    category: 'plante',
    keywords: ['romarin', 'digestion', 'concentration', 'foie'],
    searchQuery: 'romarin bio feuilles sechees infusion 100g',
    priceLabel: '~7,90 €',
    badge: 'bio',
    qualityTags: ['bio'],
    matchTargets: ['romarin', 'rosmarinus'],
    isAccessory: false,
    forRemedyTypes: ['infusion', 'decoction'],
  },
  {
    id: 'plante-sauge',
    title: 'Sauge Officinale Bio - 100g',
    normalizedTitle: 'sauge',
    category: 'plante',
    keywords: ['sauge', 'gorge', 'digestion', 'transpiration'],
    searchQuery: 'sauge officinale bio feuilles infusion 100g',
    priceLabel: '~8,90 €',
    badge: 'bio',
    qualityTags: ['bio'],
    matchTargets: ['sauge', 'salvia'],
    isAccessory: false,
    forRemedyTypes: ['infusion', 'gargarisme'],
  },
  {
    id: 'plante-menthe',
    title: 'Menthe Poivrée Bio Feuilles - 100g',
    normalizedTitle: 'menthe poivree feuilles',
    category: 'plante',
    keywords: ['menthe', 'poivree', 'digestion', 'rafraichissant'],
    searchQuery: 'menthe poivree bio feuilles sechees infusion 100g',
    priceLabel: '~8,90 €',
    badge: 'bio',
    qualityTags: ['bio'],
    matchTargets: ['menthe', 'menthe poivree', 'mentha'],
    isAccessory: false,
    forRemedyTypes: ['infusion'],
  },
  {
    id: 'plante-gingembre',
    title: 'Gingembre Bio Racine Séchée - 200g',
    normalizedTitle: 'gingembre racine',
    category: 'epice',
    keywords: ['gingembre', 'digestion', 'nausee', 'immunite', 'energie'],
    searchQuery: 'gingembre bio racine sechee 200g',
    priceLabel: '~11,90 €',
    badge: 'bio',
    qualityTags: ['bio'],
    matchTargets: ['gingembre', 'zingiber'],
    isAccessory: false,
    forRemedyTypes: ['infusion', 'decoction'],
  },

  // ============================================
  // MIELS
  // ============================================
  {
    id: 'miel-thym',
    title: 'Miel de Thym Bio France - 500g',
    normalizedTitle: 'miel thym',
    category: 'miel',
    keywords: ['miel', 'thym', 'gorge', 'toux', 'antibacterien'],
    searchQuery: 'miel de thym bio france 500g',
    priceLabel: '~14,90 €',
    badge: 'bio',
    qualityTags: ['bio', 'france', 'artisanal'],
    matchTargets: ['miel thym', 'miel de thym'],
    isAccessory: false,
    specificType: 'thym',
    forRemedyTypes: ['infusion', 'sirop'],
  },
  {
    id: 'miel-lavande',
    title: 'Miel de Lavande Bio Provence - 500g',
    normalizedTitle: 'miel lavande',
    category: 'miel',
    keywords: ['miel', 'lavande', 'provence', 'doux', 'apaisant'],
    searchQuery: 'miel de lavande bio provence 500g',
    priceLabel: '~13,90 €',
    badge: 'bio',
    qualityTags: ['bio', 'france', 'provence'],
    matchTargets: ['miel lavande', 'miel de lavande'],
    isAccessory: false,
    specificType: 'lavande',
    forRemedyTypes: ['infusion', 'sirop'],
  },
  {
    id: 'miel-acacia',
    title: 'Miel d\'Acacia Bio France - 500g',
    normalizedTitle: 'miel acacia',
    category: 'miel',
    keywords: ['miel', 'acacia', 'doux', 'liquide', 'neutre'],
    searchQuery: 'miel acacia bio france 500g',
    priceLabel: '~12,90 €',
    badge: 'bio',
    qualityTags: ['bio', 'france'],
    matchTargets: ['miel acacia', 'miel d acacia', 'miel'],
    isAccessory: false,
    specificType: 'acacia',
    forRemedyTypes: ['infusion', 'sirop'],
  },
  {
    id: 'miel-manuka',
    title: 'Miel de Manuka MGO 400+ - 250g',
    normalizedTitle: 'miel manuka',
    category: 'miel',
    keywords: ['miel', 'manuka', 'antibacterien', 'cicatrisant', 'premium'],
    searchQuery: 'miel manuka mgo 400 250g',
    priceLabel: '~39,90 €',
    badge: 'premium',
    qualityTags: ['premium', 'nouvelle-zelande'],
    matchTargets: ['miel manuka', 'manuka'],
    isAccessory: false,
    specificType: 'manuka',
    forRemedyTypes: ['infusion', 'sirop', 'friction'],
  },

  // ============================================
  // AGRUMES
  // ============================================
  {
    id: 'citron-bio',
    title: 'Citrons Bio Non Traités - 1kg',
    normalizedTitle: 'citron bio',
    category: 'agrume',
    keywords: ['citron', 'bio', 'vitamine c', 'gorge', 'detox'],
    searchQuery: 'citron bio non traite 1kg',
    priceLabel: '~5,90 €',
    badge: 'bio',
    qualityTags: ['bio', 'non-traite'],
    matchTargets: ['citron', 'citrus limon'],
    isAccessory: false,
    forRemedyTypes: ['infusion', 'sirop', 'gargarisme'],
  },
  {
    id: 'citron-seche',
    title: 'Citron Séché Bio Tranches - 100g',
    normalizedTitle: 'citron seche tranches',
    category: 'agrume',
    keywords: ['citron', 'seche', 'tranches', 'infusion'],
    searchQuery: 'citron seche bio tranches infusion 100g',
    priceLabel: '~7,50 €',
    badge: 'bio',
    qualityTags: ['bio'],
    matchTargets: ['citron seche', 'citron'],
    isAccessory: false,
    forRemedyTypes: ['infusion'],
  },

  // ============================================
  // ARGILES
  // ============================================
  {
    id: 'argile-verte-poudre',
    title: 'Argile Verte Surfine Montmorillonite - 1kg',
    normalizedTitle: 'argile verte surfine',
    category: 'argile',
    keywords: ['argile', 'verte', 'montmorillonite', 'cataplasme', 'masque'],
    searchQuery: 'argile verte surfine montmorillonite 1kg',
    priceLabel: '~12,90 €',
    badge: 'essentiel',
    qualityTags: ['naturel', 'france'],
    matchTargets: ['argile verte', 'argile', 'montmorillonite'],
    isAccessory: false,
    forRemedyTypes: ['cataplasme', 'compresse'],
  },
  {
    id: 'argile-verte-tube',
    title: 'Argile Verte en Tube Prête à l\'Emploi - 400g',
    normalizedTitle: 'argile verte tube prete emploi',
    category: 'argile',
    keywords: ['argile', 'verte', 'tube', 'pret', 'pratique'],
    searchQuery: 'argile verte tube prete emploi cataplasme 400g',
    priceLabel: '~8,50 €',
    badge: 'populaire',
    qualityTags: ['pratique'],
    matchTargets: ['argile verte', 'argile'],
    isAccessory: false,
    forRemedyTypes: ['cataplasme'],
  },
  {
    id: 'argile-blanche',
    title: 'Argile Blanche Kaolin - 500g',
    normalizedTitle: 'argile blanche kaolin',
    category: 'argile',
    keywords: ['argile', 'blanche', 'kaolin', 'doux', 'peau sensible'],
    searchQuery: 'argile blanche kaolin 500g',
    priceLabel: '~9,90 €',
    badge: 'bio',
    qualityTags: ['naturel'],
    matchTargets: ['argile blanche', 'kaolin'],
    isAccessory: false,
    forRemedyTypes: ['cataplasme', 'compresse'],
  },

  // ============================================
  // VINAIGRES
  // ============================================
  {
    id: 'vinaigre-cidre',
    title: 'Vinaigre de Cidre Bio avec Mère - 1L',
    normalizedTitle: 'vinaigre cidre mere',
    category: 'vinaigre',
    keywords: ['vinaigre', 'cidre', 'mere', 'digestion', 'detox'],
    searchQuery: 'vinaigre cidre bio mere 1l',
    priceLabel: '~8,90 €',
    badge: 'bio',
    qualityTags: ['bio', 'france', 'avec-mere'],
    matchTargets: ['vinaigre cidre', 'vinaigre de cidre', 'vinaigre'],
    isAccessory: false,
    forRemedyTypes: ['friction', 'gargarisme'],
  },

  // ============================================
  // HUILES VÉGÉTALES
  // ============================================
  {
    id: 'hv-amande-douce',
    title: 'Huile Végétale Amande Douce Bio - 100ml',
    normalizedTitle: 'huile vegetale amande douce',
    category: 'huile_vegetale',
    keywords: ['huile', 'amande', 'douce', 'massage', 'dilution', 'peau'],
    searchQuery: 'huile vegetale amande douce bio 100ml',
    priceLabel: '~7,90 €',
    badge: 'bio',
    qualityTags: ['bio', 'premiere-pression'],
    matchTargets: ['huile amande', 'amande douce', 'huile vegetale'],
    isAccessory: false,
    forRemedyTypes: ['friction', 'bain'],
  },
  {
    id: 'hv-jojoba',
    title: 'Huile Végétale Jojoba Bio - 50ml',
    normalizedTitle: 'huile vegetale jojoba',
    category: 'huile_vegetale',
    keywords: ['huile', 'jojoba', 'visage', 'peau', 'equilibrant'],
    searchQuery: 'huile vegetale jojoba bio 50ml',
    priceLabel: '~9,90 €',
    badge: 'bio',
    qualityTags: ['bio', 'premiere-pression'],
    matchTargets: ['huile jojoba', 'jojoba'],
    isAccessory: false,
    forRemedyTypes: ['friction'],
  },
  {
    id: 'hv-arnica',
    title: 'Huile Végétale Arnica Bio - 100ml',
    normalizedTitle: 'huile vegetale arnica macerat',
    category: 'huile_vegetale',
    keywords: ['huile', 'arnica', 'muscle', 'douleur', 'sport', 'macerat'],
    searchQuery: 'huile vegetale arnica bio macerat 100ml',
    priceLabel: '~12,90 €',
    badge: 'recommande',
    qualityTags: ['bio', 'macerat'],
    matchTargets: ['huile arnica', 'arnica', 'macerat arnica'],
    isAccessory: false,
    forRemedyTypes: ['friction'],
  },
  {
    id: 'hv-calendula',
    title: 'Huile Végétale Calendula Bio - 100ml',
    normalizedTitle: 'huile vegetale calendula macerat',
    category: 'huile_vegetale',
    keywords: ['huile', 'calendula', 'souci', 'peau', 'apaisant', 'bebe'],
    searchQuery: 'huile vegetale calendula bio macerat 100ml',
    priceLabel: '~11,90 €',
    badge: 'bio',
    qualityTags: ['bio', 'macerat'],
    matchTargets: ['huile calendula', 'calendula', 'souci'],
    isAccessory: false,
    forRemedyTypes: ['friction', 'bain'],
  },

  // ============================================
  // ACCESSOIRES - INFUSION
  // ============================================
  {
    id: 'acc-infuseur-inox',
    title: 'Infuseur à Thé Inox avec Couvercle',
    normalizedTitle: 'infuseur the inox',
    category: 'accessoire',
    keywords: ['infuseur', 'the', 'inox', 'tisane', 'filtre'],
    searchQuery: 'infuseur the inox couvercle',
    priceLabel: '~8,90 €',
    badge: 'populaire',
    qualityTags: ['inox', 'durable'],
    matchTargets: ['infuseur'],
    isAccessory: true,
    forRemedyTypes: ['infusion'],
  },
  {
    id: 'acc-theiere-verre',
    title: 'Théière en Verre avec Infuseur - 600ml',
    normalizedTitle: 'theiere verre infuseur',
    category: 'accessoire',
    keywords: ['theiere', 'verre', 'infuseur', 'borosilicate'],
    searchQuery: 'theiere verre borosilicate infuseur 600ml',
    priceLabel: '~18,90 €',
    badge: 'recommande',
    qualityTags: ['verre', 'borosilicate'],
    matchTargets: ['theiere'],
    isAccessory: true,
    forRemedyTypes: ['infusion', 'decoction'],
  },
  {
    id: 'acc-tasse-filtre',
    title: 'Tasse à Infusion avec Filtre Intégré - 400ml',
    normalizedTitle: 'tasse infusion filtre',
    category: 'accessoire',
    keywords: ['tasse', 'infusion', 'filtre', 'verre'],
    searchQuery: 'tasse infusion verre filtre integre 400ml',
    priceLabel: '~15,90 €',
    badge: 'populaire',
    qualityTags: ['verre', 'pratique'],
    matchTargets: ['tasse', 'mug'],
    isAccessory: true,
    forRemedyTypes: ['infusion'],
  },

  // ============================================
  // ACCESSOIRES - INHALATION
  // ============================================
  {
    id: 'acc-inhalateur-vapeur',
    title: 'Inhalateur Vapeur pour Huiles Essentielles',
    normalizedTitle: 'inhalateur vapeur',
    category: 'accessoire',
    keywords: ['inhalateur', 'vapeur', 'huiles essentielles', 'respiration'],
    searchQuery: 'inhalateur vapeur huiles essentielles',
    priceLabel: '~24,90 €',
    badge: 'populaire',
    qualityTags: ['electrique'],
    matchTargets: ['inhalateur'],
    isAccessory: true,
    forRemedyTypes: ['inhalation'],
  },
  {
    id: 'acc-bol-inhalation',
    title: 'Bol Inhalation Traditionnel Céramique',
    normalizedTitle: 'bol inhalation ceramique',
    category: 'accessoire',
    keywords: ['bol', 'inhalation', 'ceramique', 'traditionnel'],
    searchQuery: 'bol inhalation ceramique traditionnel',
    priceLabel: '~12,90 €',
    badge: 'petit_budget',
    qualityTags: ['ceramique', 'traditionnel'],
    matchTargets: ['bol inhalation', 'bol'],
    isAccessory: true,
    forRemedyTypes: ['inhalation'],
  },
  {
    id: 'acc-stick-inhalateur',
    title: 'Sticks Inhalateurs Vides - Lot de 5',
    normalizedTitle: 'stick inhalateur vide',
    category: 'accessoire',
    keywords: ['stick', 'inhalateur', 'vide', 'portable', 'rechargeable'],
    searchQuery: 'stick inhalateur vide huiles essentielles lot 5',
    priceLabel: '~6,90 €',
    badge: 'petit_budget',
    qualityTags: ['rechargeable', 'portable'],
    matchTargets: ['stick inhalateur'],
    isAccessory: true,
    forRemedyTypes: ['inhalation'],
  },

  // ============================================
  // ACCESSOIRES - DIFFUSION
  // ============================================
  {
    id: 'acc-diffuseur-ultrason',
    title: 'Diffuseur Huiles Essentielles Ultrasonique',
    normalizedTitle: 'diffuseur ultrasonique',
    category: 'accessoire',
    keywords: ['diffuseur', 'ultrason', 'huiles essentielles', 'brume'],
    searchQuery: 'diffuseur huiles essentielles ultrasonique',
    priceLabel: '~24,90 €',
    badge: 'populaire',
    qualityTags: ['silencieux', 'led'],
    matchTargets: ['diffuseur'],
    isAccessory: true,
    forRemedyTypes: ['diffusion'],
  },
  {
    id: 'acc-diffuseur-nebulisation',
    title: 'Diffuseur Nébulisation Verre - Sans Eau',
    normalizedTitle: 'diffuseur nebulisation verre',
    category: 'accessoire',
    keywords: ['diffuseur', 'nebulisation', 'verre', 'sans eau', 'pur'],
    searchQuery: 'diffuseur nebulisation verre huiles essentielles',
    priceLabel: '~39,90 €',
    badge: 'premium',
    qualityTags: ['verre', 'sans-eau', 'puissant'],
    matchTargets: ['diffuseur nebulisation'],
    isAccessory: true,
    forRemedyTypes: ['diffusion'],
  },

  // ============================================
  // ACCESSOIRES - CATAPLASME
  // ============================================
  {
    id: 'acc-bande-gaze',
    title: 'Bandes de Gaze Coton - Lot de 10',
    normalizedTitle: 'bande gaze coton',
    category: 'accessoire',
    keywords: ['bande', 'gaze', 'coton', 'cataplasme', 'maintien'],
    searchQuery: 'bande gaze coton medical lot 10',
    priceLabel: '~6,90 €',
    badge: 'essentiel',
    qualityTags: ['coton', 'medical'],
    matchTargets: ['bande', 'gaze', 'compresse'],
    isAccessory: true,
    forRemedyTypes: ['cataplasme', 'compresse'],
  },
  {
    id: 'acc-bol-preparation',
    title: 'Bol en Verre pour Préparation',
    normalizedTitle: 'bol verre preparation',
    category: 'accessoire',
    keywords: ['bol', 'verre', 'preparation', 'melange'],
    searchQuery: 'bol verre preparation cosmetique',
    priceLabel: '~9,90 €',
    badge: 'populaire',
    qualityTags: ['verre', 'resistant'],
    matchTargets: ['bol preparation', 'bol'],
    isAccessory: true,
    forRemedyTypes: ['cataplasme'],
  },
  {
    id: 'acc-spatule-bois',
    title: 'Spatules en Bois Naturel - Lot de 3',
    normalizedTitle: 'spatule bois',
    category: 'accessoire',
    keywords: ['spatule', 'bois', 'naturel', 'melange', 'argile'],
    searchQuery: 'spatule bois naturel cosmetique lot 3',
    priceLabel: '~5,90 €',
    badge: 'petit_budget',
    qualityTags: ['bois', 'naturel'],
    matchTargets: ['spatule'],
    isAccessory: true,
    forRemedyTypes: ['cataplasme'],
  },

  // ============================================
  // ACCESSOIRES - FRICTION / APPLICATION
  // ============================================
  {
    id: 'acc-roll-on-vide',
    title: 'Roll-on Vides Verre Ambré - Lot de 6',
    normalizedTitle: 'roll on vide verre',
    category: 'accessoire',
    keywords: ['roll-on', 'vide', 'verre', 'ambre', 'rechargeable'],
    searchQuery: 'roll on vide verre ambre 10ml lot 6',
    priceLabel: '~8,90 €',
    badge: 'populaire',
    qualityTags: ['verre', 'rechargeable'],
    matchTargets: ['roll-on', 'roll on'],
    isAccessory: true,
    forRemedyTypes: ['friction'],
  },
  {
    id: 'acc-flacon-compte-gouttes',
    title: 'Flacons Compte-Gouttes Verre Ambré - Lot de 10',
    normalizedTitle: 'flacon compte gouttes verre',
    category: 'accessoire',
    keywords: ['flacon', 'compte-gouttes', 'verre', 'ambre'],
    searchQuery: 'flacon compte gouttes verre ambre 10ml lot 10',
    priceLabel: '~9,90 €',
    badge: 'populaire',
    qualityTags: ['verre', 'ambre'],
    matchTargets: ['flacon', 'compte-gouttes'],
    isAccessory: true,
    forRemedyTypes: ['friction'],
  },

  // ============================================
  // ACCESSOIRES - GÉNÉRAL
  // ============================================
  {
    id: 'acc-presse-citron',
    title: 'Presse-Citron Manuel Inox',
    normalizedTitle: 'presse citron inox',
    category: 'accessoire',
    keywords: ['presse', 'citron', 'agrume', 'inox', 'manuel'],
    searchQuery: 'presse citron manuel inox',
    priceLabel: '~9,90 €',
    badge: 'populaire',
    qualityTags: ['inox', 'durable'],
    matchTargets: ['presse-citron', 'presse citron'],
    isAccessory: true,
    forRemedyTypes: ['infusion', 'sirop'],
  },
  {
    id: 'acc-bocaux-verre',
    title: 'Bocaux en Verre Hermétiques - Lot de 3',
    normalizedTitle: 'bocaux verre hermetique',
    category: 'accessoire',
    keywords: ['bocaux', 'verre', 'hermetique', 'conservation'],
    searchQuery: 'bocaux verre hermetique conservation lot 3',
    priceLabel: '~14,90 €',
    badge: 'recommande',
    qualityTags: ['verre', 'hermetique'],
    matchTargets: ['bocal', 'bocaux'],
    isAccessory: true,
    forRemedyTypes: ['sirop', 'infusion'],
  },
];

// ============================================
// MOTEUR DE MATCHING
// ============================================

/**
 * Calcule le score de matching entre un ingrédient et un produit
 */
function calculateMatchScore(
  ingredient: NormalizedIngredient,
  product: ProductCatalogItem
): { score: number; reason: string; isDirectMatch: boolean } {
  let score = 0;
  let reason = '';
  let isDirectMatch = false;

  const ingNorm = ingredient.normalizedName;
  const prodNorm = product.normalizedTitle;

  // Match exact sur le nom normalisé
  if (prodNorm.includes(ingNorm) || ingNorm.includes(prodNorm)) {
    score += 100;
    reason = 'Correspondance exacte';
    isDirectMatch = true;
  }

  // Match sur les cibles de matching
  for (const target of product.matchTargets) {
    const targetNorm = removeAccents(target.toLowerCase());
    if (ingNorm.includes(targetNorm) || targetNorm.includes(ingNorm)) {
      score += 80;
      reason = reason || `Correspond à "${target}"`;
      isDirectMatch = true;
      break;
    }
  }

  // Match sur les synonymes
  for (const synonym of ingredient.synonyms) {
    for (const target of product.matchTargets) {
      const targetNorm = removeAccents(target.toLowerCase());
      if (synonym.includes(targetNorm) || targetNorm.includes(synonym)) {
        score += 60;
        reason = reason || `Synonyme: "${synonym}"`;
        break;
      }
    }
  }

  // Match sur le type spécifique (ex: radiata vs globulus)
  if (ingredient.specificType && product.specificType) {
    if (ingredient.specificType === product.specificType) {
      score += 50;
      reason = reason || `Type exact: ${ingredient.specificType}`;
      isDirectMatch = true;
    } else {
      // Pénalité si le type ne correspond pas
      score -= 30;
    }
  }

  // Match sur la catégorie
  if (ingredient.category === product.category) {
    score += 20;
  }

  // Match sur les mots-clés
  const ingWords = ingNorm.split(' ');
  for (const word of ingWords) {
    if (word.length > 2 && product.keywords.some(kw => kw.includes(word))) {
      score += 10;
    }
  }

  // Bonus qualité
  if (product.qualityTags.includes('bio')) score += 5;
  if (product.qualityTags.includes('france')) score += 3;

  return { score, reason, isDirectMatch };
}

/**
 * Trouve les meilleurs produits pour un remède
 */
export function matchProductsToRemedy(remedy: Remede): MatchingResult {
  const ingredients = extractRemedyIngredients(remedy);
  const remedyType = getRemedyType(remedy);
  
  const mainProducts: MatchedProduct[] = [];
  const supportProducts: MatchedProduct[] = [];
  const accessoryProducts: MatchedProduct[] = [];
  const alternativeProducts: MatchedProduct[] = [];
  
  // Matcher chaque ingrédient
  for (const ingredient of ingredients) {
    const matches: MatchedProduct[] = [];
    
    for (const product of PRODUCT_CATALOG) {
      // Ignorer les accessoires pour le matching d'ingrédients
      if (product.isAccessory && ingredient.category !== 'accessoire') continue;
      
      const { score, reason, isDirectMatch } = calculateMatchScore(ingredient, product);
      
      if (score > 30) {
        matches.push({
          product,
          ingredientName: ingredient.originalName,
          matchScore: score,
          matchReason: reason,
          isDirectMatch,
          role: ingredient.role,
        });
      }
    }
    
    // Trier par score et prendre le meilleur
    matches.sort((a, b) => b.matchScore - a.matchScore);
    
    if (matches.length > 0) {
      const bestMatch = matches[0];
      
      if (ingredient.role === 'main') {
        mainProducts.push(bestMatch);
      } else if (ingredient.role === 'support') {
        supportProducts.push(bestMatch);
      } else {
        supportProducts.push(bestMatch);
      }
      
      // Ajouter des alternatives si disponibles
      if (matches.length > 1 && matches[1].matchScore > 50) {
        alternativeProducts.push(matches[1]);
      }
    }
  }
  
  // Ajouter les accessoires pertinents selon le type de remède
  for (const product of PRODUCT_CATALOG) {
    if (!product.isAccessory) continue;
    if (!product.forRemedyTypes?.includes(remedyType)) continue;
    
    // Vérifier qu'on n'a pas déjà cet accessoire
    const alreadyAdded = accessoryProducts.some(p => p.product.id === product.id);
    if (alreadyAdded) continue;
    
    accessoryProducts.push({
      product,
      ingredientName: product.title,
      matchScore: 50,
      matchReason: `Accessoire utile pour ${remedyType}`,
      isDirectMatch: false,
      role: 'tool',
    });
  }
  
  // Limiter le nombre d'accessoires
  accessoryProducts.splice(3);
  
  return {
    remedyId: remedy.id,
    remedyType,
    mainProducts,
    supportProducts,
    accessoryProducts,
    alternativeProducts: alternativeProducts.slice(0, 2),
  };
}

// ============================================
// CONVERSION EN AFFILIATE PRODUCTS
// ============================================

/**
 * Convertit un MatchedProduct en AffiliateProduct
 */
export function toAffiliateProduct(
  matched: MatchedProduct,
  remedyId: string
): AffiliateProduct {
  const p = matched.product;
  
  return {
    id: `${remedyId}-${p.id}`,
    ingredientName: matched.ingredientName,
    title: p.title,
    subtitle: matched.matchReason,
    description: `Correspond à : ${matched.ingredientName}`,
    searchQuery: p.searchQuery,
    asin: p.asin,
    image: p.image,
    priceLabel: p.priceLabel,
    badge: p.badge as any,
    category: p.isAccessory ? 'accessoire' : (p.category as any),
    isEssential: matched.role === 'main',
    sortOrder: matched.role === 'main' ? 1 : matched.role === 'support' ? 2 : 3,
  };
}

/**
 * Récupère les produits affiliés pour un remède avec matching intelligent
 */
export function getSmartAffiliateProducts(remedy: Remede): AffiliateProduct[] {
  const result = matchProductsToRemedy(remedy);
  const products: AffiliateProduct[] = [];
  
  // Ajouter les produits principaux
  for (const matched of result.mainProducts) {
    products.push(toAffiliateProduct(matched, remedy.id));
  }
  
  // Ajouter les supports
  for (const matched of result.supportProducts) {
    products.push(toAffiliateProduct(matched, remedy.id));
  }
  
  // Ajouter les accessoires
  for (const matched of result.accessoryProducts) {
    const product = toAffiliateProduct(matched, remedy.id);
    product.isEssential = false;
    products.push(product);
  }
  
  return products;
}

// ============================================
// EXPORTS
// ============================================

export {
  removeAccents,
  STOP_WORDS,
  INGREDIENT_SYNONYMS,
  CATEGORY_KEYWORDS,
};
