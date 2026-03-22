// ============================================
// SERVICE DE GÉNÉRATION D'IMAGES PRODUITS
// Génère des images automatiques via Unsplash
// ============================================

import { AffiliateProduct } from '../types';

// ============================================
// CONFIGURATION
// ============================================

const UNSPLASH_BASE_URL = 'https://source.unsplash.com';
const DEFAULT_IMAGE_SIZE = '600x600';

// ============================================
// MAPPING INTELLIGENT FRANÇAIS → ANGLAIS
// ============================================

const INGREDIENT_KEYWORD_MAP: Record<string, string> = {
  // Plantes et herbes
  'thym': 'thyme,herbs',
  'romarin': 'rosemary,herbs',
  'lavande': 'lavender,purple flowers',
  'camomille': 'chamomile,flowers',
  'menthe': 'mint,leaves',
  'basilic': 'basil,herbs',
  'sauge': 'sage,herbs',
  'origan': 'oregano,herbs',
  'persil': 'parsley,herbs',
  'coriandre': 'coriander,herbs',
  'estragon': 'tarragon,herbs',
  'laurier': 'bay leaves,herbs',
  'verveine': 'verbena,herbs',
  'tilleul': 'linden,flowers',
  'ortie': 'nettle,green leaves',
  'pissenlit': 'dandelion,yellow flower',
  'sureau': 'elderflower,white flowers',
  'échinacée': 'echinacea,purple flower',
  'millepertuis': 'st johns wort,yellow flowers',
  'valériane': 'valerian,flowers',
  
  // Agrumes
  'citron': 'lemon,citrus',
  'orange': 'orange,citrus fruit',
  'pamplemousse': 'grapefruit,citrus',
  'bergamote': 'bergamot,citrus',
  'mandarine': 'mandarin,orange citrus',
  'lime': 'lime,green citrus',
  
  // Produits de la ruche
  'miel': 'honey,golden jar',
  'propolis': 'propolis,bee products',
  'gelée royale': 'royal jelly,honey',
  'cire': 'beeswax,natural',
  
  // Huiles et graisses
  'huile essentielle': 'essential oil,amber bottle',
  'huile végétale': 'vegetable oil,bottle',
  'huile olive': 'olive oil,bottle',
  'huile coco': 'coconut oil,jar',
  'huile argan': 'argan oil,bottle',
  'huile amande': 'almond oil,bottle',
  'huile jojoba': 'jojoba oil,skincare',
  'huile rose musquée': 'rosehip oil,skincare',
  'beurre karité': 'shea butter,natural',
  
  // Épices
  'gingembre': 'ginger,root spice',
  'curcuma': 'turmeric,yellow spice',
  'cannelle': 'cinnamon,sticks spice',
  'clou de girofle': 'cloves,spice',
  'poivre': 'black pepper,spice',
  'cardamome': 'cardamom,spice',
  'anis': 'anise,star spice',
  'fenouil': 'fennel,seeds',
  
  // Minéraux et argiles
  'argile': 'clay,powder natural',
  'argile verte': 'green clay,powder',
  'argile blanche': 'white clay,kaolin',
  'sel': 'sea salt,crystals',
  'bicarbonate': 'baking soda,powder',
  'charbon': 'activated charcoal,black powder',
  
  // Arbres et résines
  'eucalyptus': 'eucalyptus,green leaves',
  'tea tree': 'tea tree,leaves',
  'pin': 'pine,needles',
  'sapin': 'fir,tree needles',
  'cèdre': 'cedar,wood',
  'cyprès': 'cypress,tree',
  'encens': 'frankincense,resin',
  'myrrhe': 'myrrh,resin',
  
  // Fleurs
  'rose': 'rose,pink flower',
  'jasmin': 'jasmine,white flowers',
  'ylang': 'ylang ylang,tropical flower',
  'géranium': 'geranium,flowers',
  'néroli': 'neroli,orange blossom',
  'immortelle': 'helichrysum,yellow flowers',
  'hélichryse': 'helichrysum,yellow flowers',
  
  // Autres ingrédients
  'aloe vera': 'aloe vera,green plant',
  'aloès': 'aloe vera,succulent',
  'vinaigre': 'apple cider vinegar,bottle',
  'vinaigre cidre': 'apple cider vinegar,amber',
  'avoine': 'oats,grains',
  'riz': 'rice,grains',
  'lin': 'flaxseed,seeds',
  'chia': 'chia seeds,superfood',
  
  // Catégories générales
  'infusion': 'herbal tea,cup',
  'tisane': 'herbal tea,teacup',
  'décoction': 'herbal decoction,pot',
  'cataplasme': 'herbal poultice,natural remedy',
  'inhalation': 'steam inhalation,aromatherapy',
  'diffuseur': 'essential oil diffuser,aromatherapy',
  'roll-on': 'roll on bottle,aromatherapy',
  'spray': 'spray bottle,natural',
  
  // Accessoires
  'flacon': 'amber glass bottle,dropper',
  'bouteille': 'glass bottle,amber',
  'pot': 'glass jar,container',
  'bol': 'ceramic bowl,natural',
  'mortier': 'mortar pestle,herbs',
  'livre': 'herbal book,natural remedies',
  'coffret': 'gift box,essential oils',
};

// ============================================
// CATÉGORIES PAR DÉFAUT
// ============================================

const CATEGORY_FALLBACK_MAP: Record<string, string> = {
  'ingredient': 'natural ingredients,herbs',
  'huile_essentielle': 'essential oil,amber bottle',
  'huile_vegetale': 'carrier oil,natural skincare',
  'accessoire': 'aromatherapy accessories,natural',
  'diffuseur': 'oil diffuser,aromatherapy',
  'roll_on': 'roll on bottle,essential oil',
  'inhalateur': 'inhaler,aromatherapy',
  'flacon': 'amber bottle,dropper',
  'livre': 'herbal medicine book,natural',
  'coffret': 'essential oil set,gift box',
  'default': 'natural remedy,herbs wellness',
};

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

/**
 * Normalise une chaîne pour la recherche
 */
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
    .trim();
}

/**
 * Extrait les mots-clés pertinents d'un texte
 */
function extractKeywords(text: string): string[] {
  const normalized = normalizeString(text);
  const words = normalized.split(/[\s,\-_]+/).filter(w => w.length > 2);
  return words;
}

/**
 * Trouve le meilleur mapping pour un texte donné
 */
function findBestMapping(text: string): string | null {
  const normalized = normalizeString(text);
  
  // Recherche exacte d'abord
  for (const [key, value] of Object.entries(INGREDIENT_KEYWORD_MAP)) {
    if (normalized.includes(normalizeString(key))) {
      return value;
    }
  }
  
  return null;
}

/**
 * Génère une requête Unsplash à partir d'un texte
 */
function generateUnsplashQuery(text: string): string {
  // Essayer le mapping intelligent
  const mapped = findBestMapping(text);
  if (mapped) {
    return mapped.replace(/,/g, ',').replace(/\s+/g, '%20');
  }
  
  // Fallback : extraire les mots-clés et les traduire basiquement
  const keywords = extractKeywords(text);
  const englishKeywords = keywords
    .slice(0, 3) // Max 3 mots-clés
    .map(kw => {
      // Traductions basiques
      const basicTranslations: Record<string, string> = {
        'bio': 'organic',
        'naturel': 'natural',
        'seche': 'dried',
        'frais': 'fresh',
        'poudre': 'powder',
        'feuilles': 'leaves',
        'fleurs': 'flowers',
        'racine': 'root',
        'graines': 'seeds',
      };
      return basicTranslations[kw] || kw;
    });
  
  return englishKeywords.join(',');
}

// ============================================
// FONCTION PRINCIPALE
// ============================================

/**
 * Génère une URL d'image pour un produit
 * @param product Le produit affilié
 * @param size Taille de l'image (défaut: 600x600)
 * @returns URL de l'image Unsplash
 */
export function generateProductImage(
  product: Partial<AffiliateProduct> & { ingredientName?: string; oilName?: string },
  size: string = DEFAULT_IMAGE_SIZE
): string {
  // Construire le texte de recherche à partir des données disponibles
  const searchTexts: string[] = [];
  
  // Priorité 1: ingredientName ou oilName
  if (product.ingredientName) {
    searchTexts.push(product.ingredientName);
  }
  if ((product as any).oilName) {
    searchTexts.push((product as any).oilName);
  }
  
  // Priorité 2: searchQuery
  if (product.searchQuery) {
    searchTexts.push(product.searchQuery);
  }
  
  // Priorité 3: title
  if (product.title) {
    searchTexts.push(product.title);
  }
  
  // Combiner et générer la requête
  const combinedText = searchTexts.join(' ');
  const query = generateUnsplashQuery(combinedText);
  
  // Si aucune requête valide, utiliser le fallback par catégorie
  if (!query || query.length < 3) {
    const categoryKey = product.category?.toString() || 'default';
    const fallbackQuery = CATEGORY_FALLBACK_MAP[categoryKey] || CATEGORY_FALLBACK_MAP['default'];
    return `${UNSPLASH_BASE_URL}/${size}/?${encodeURIComponent(fallbackQuery)}`;
  }
  
  return `${UNSPLASH_BASE_URL}/${size}/?${query}`;
}

/**
 * Génère une URL d'image avec un seed pour consistance
 * Permet d'avoir toujours la même image pour le même produit
 */
export function generateConsistentProductImage(
  product: Partial<AffiliateProduct> & { ingredientName?: string; oilName?: string },
  size: string = DEFAULT_IMAGE_SIZE
): string {
  const baseUrl = generateProductImage(product, size);
  
  // Ajouter un seed basé sur l'ID du produit pour consistance
  const seed = product.id ? `&sig=${hashCode(product.id)}` : '';
  
  return baseUrl + seed;
}

/**
 * Génère un hash simple pour le seed
 */
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// ============================================
// IMAGES DE FALLBACK STATIQUES
// ============================================

/**
 * Images de fallback par catégorie (hébergées localement ou CDN fiable)
 */
export const FALLBACK_IMAGES: Record<string, string> = {
  'huile_essentielle': 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&h=600&fit=crop',
  'huile_vegetale': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&h=600&fit=crop',
  'ingredient': 'https://images.unsplash.com/photo-1515023115689-589c33041d3c?w=600&h=600&fit=crop',
  'diffuseur': 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&h=600&fit=crop',
  'accessoire': 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&h=600&fit=crop',
  'livre': 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&h=600&fit=crop',
  'coffret': 'https://images.unsplash.com/photo-1607006344380-b6775a0824a7?w=600&h=600&fit=crop',
  'default': 'https://images.unsplash.com/photo-1515023115689-589c33041d3c?w=600&h=600&fit=crop',
};

/**
 * Récupère l'image de fallback pour une catégorie
 */
export function getFallbackImage(category?: string): string {
  if (category && FALLBACK_IMAGES[category]) {
    return FALLBACK_IMAGES[category];
  }
  return FALLBACK_IMAGES['default'];
}

// ============================================
// FONCTION D'IMAGE INTELLIGENTE
// ============================================

/**
 * Retourne la meilleure image disponible pour un produit
 * Priorité: image > generatedImage > generateProductImage > fallback
 */
export function getSmartProductImage(
  product: Partial<AffiliateProduct> & { 
    ingredientName?: string; 
    oilName?: string;
    generatedImage?: string;
  }
): string {
  // Priorité 1: Image existante
  if (product.image && product.image.trim() !== '') {
    return product.image;
  }
  
  // Priorité 2: Image pré-générée
  if (product.generatedImage && product.generatedImage.trim() !== '') {
    return product.generatedImage;
  }
  
  // Priorité 3: Générer dynamiquement
  return generateConsistentProductImage(product);
}

// ============================================
// EXPORTS
// ============================================

export {
  INGREDIENT_KEYWORD_MAP,
  CATEGORY_FALLBACK_MAP,
  normalizeString,
  extractKeywords,
  findBestMapping,
  generateUnsplashQuery,
};
