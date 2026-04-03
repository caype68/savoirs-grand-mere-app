// ============================================
// DONNÉES DES PRODUITS AFFILIÉS AMAZON
// Tag affilié : craype-21
// ============================================
// 
// Ce fichier contient les produits Amazon associés à chaque remède.
// Pour ajouter un produit :
// 1. Trouver le produit sur Amazon.fr
// 2. Copier l'ASIN (code à 10 caractères dans l'URL après /dp/)
// 3. Ajouter une entrée dans le tableau correspondant au remède
//
// ============================================

import { RemedyAffiliateProducts, AffiliateProduct } from '../types';

// ============================================
// PRODUITS PAR REMÈDE
// ============================================

export const AFFILIATE_PRODUCTS_DATA: RemedyAffiliateProducts[] = [
  // ============================================
  // INFUSION DE THYM (ID: infusion-thym)
  // ============================================
  {
    remedyId: 'infusion-thym',
    products: [
      {
        id: 'thym-bio-1',
        ingredientName: 'Thym',
        title: 'Thym Bio Séché - 200g',
        subtitle: 'Herboristerie de qualité',
        description: 'Thym de Provence bio, idéal pour infusions et préparations culinaires. Séché naturellement.',
        asin: 'B07CZKFR3J',
        searchQuery: 'thym bio sechees feuilles infusion',
        priceLabel: '~9,90 €',
        badge: 'bio',
        category: 'plante',
        isEssential: true,
        sortOrder: 1,
      },
      {
        id: 'miel-thym-1',
        ingredientName: 'Miel',
        title: 'Miel de Thym Bio - 500g',
        subtitle: 'Apiculteur français',
        description: 'Miel de thym artisanal, parfait pour adoucir vos infusions. Propriétés apaisantes.',
        asin: 'B08WRQM5YZ',
        searchQuery: 'miel de thym bio 500g france',
        priceLabel: '~14,90 €',
        badge: 'recommande',
        category: 'miel',
        isEssential: false,
        sortOrder: 2,
      },
      {
        id: 'citron-seche-1',
        ingredientName: 'Citron',
        title: 'Citron Séché Bio - Tranches',
        description: 'Tranches de citron déshydratées bio, parfaites pour agrémenter vos infusions.',
        asin: 'B09MDKFR5N',
        searchQuery: 'citron seche bio tranches infusion',
        priceLabel: '~7,50 €',
        badge: 'bio',
        category: 'ingredient',
        sortOrder: 3,
      },
      {
        id: 'infuseur-inox-1',
        ingredientName: 'Infuseur',
        title: 'Infuseur à Thé Inox avec Couvercle',
        subtitle: 'Accessoire pratique',
        description: 'Infuseur en acier inoxydable avec couvercle. Maille fine pour une infusion parfaite.',
        asin: 'B0773LZFBG',
        searchQuery: 'infuseur the inox couvercle',
        priceLabel: '~8,90 €',
        badge: 'populaire',
        category: 'accessoire',
        sortOrder: 4,
      },
      {
        id: 'tasse-filtre-1',
        ingredientName: 'Tasse',
        title: 'Tasse à Infusion avec Filtre Intégré',
        description: 'Tasse en verre borosilicate avec filtre inox intégré. Capacité 400ml.',
        asin: 'B01LXN1GBG',
        searchQuery: 'tasse infusion verre filtre integre',
        priceLabel: '~15,90 €',
        category: 'accessoire',
        sortOrder: 5,
      },
    ],
  },

  // ============================================
  // CATAPLASME D'ARGILE (ID: argile-cataplasme)
  // ============================================
  {
    remedyId: 'argile-cataplasme',
    products: [
      {
        id: 'argile-verte-1',
        ingredientName: 'Argile verte',
        title: 'Argile Verte Surfine - 1kg',
        subtitle: 'Qualité cosmétique',
        description: 'Argile verte montmorillonite surfine. Idéale pour cataplasmes et soins naturels.',
        asin: 'B00GWKKYHA',
        searchQuery: 'argile verte surfine montmorillonite 1kg',
        priceLabel: '~12,90 €',
        badge: 'essentiel',
        category: 'ingredient',
        isEssential: true,
        sortOrder: 1,
      },
      {
        id: 'argile-verte-tube-1',
        ingredientName: 'Argile verte',
        title: 'Argile Verte en Tube Prête à l\'Emploi',
        description: 'Argile verte prête à l\'emploi, pratique pour une utilisation immédiate.',
        asin: 'B01N9SPQAS',
        searchQuery: 'argile verte tube prete emploi cataplasme',
        priceLabel: '~8,50 €',
        badge: 'populaire',
        category: 'ingredient',
        sortOrder: 2,
      },
      {
        id: 'bande-coton-1',
        ingredientName: 'Bande de maintien',
        title: 'Bandes de Gaze Coton - Lot de 10',
        description: 'Bandes de gaze en coton naturel pour maintenir vos cataplasmes.',
        asin: 'B07D3FZNK8',
        searchQuery: 'bande gaze coton medical',
        priceLabel: '~6,90 €',
        category: 'accessoire',
        sortOrder: 3,
      },
      {
        id: 'bol-preparation-1',
        ingredientName: 'Bol',
        title: 'Bol en Verre pour Préparation',
        description: 'Bol en verre résistant pour préparer vos mélanges d\'argile.',
        asin: 'B07PRJB8WT',
        searchQuery: 'bol verre preparation cosmetique',
        priceLabel: '~9,90 €',
        category: 'ustensile',
        sortOrder: 4,
      },
      {
        id: 'spatule-bois-1',
        ingredientName: 'Spatule',
        title: 'Spatule en Bois - Lot de 3',
        subtitle: 'Bois naturel non traité',
        description: 'Spatules en bois pour mélanger l\'argile. Évitez le métal qui altère les propriétés.',
        asin: 'B08CXMT1QZ',
        searchQuery: 'spatule bois cosmetique naturel',
        priceLabel: '~5,90 €',
        badge: 'petit_budget',
        category: 'ustensile',
        sortOrder: 5,
      },
    ],
  },

  // ============================================
  // INHALATION LAVANDE (ID: lavande-inhalation)
  // ============================================
  {
    remedyId: 'lavande-inhalation',
    products: [
      {
        id: 'he-eucalyptus-1',
        ingredientName: 'Huile essentielle d\'eucalyptus',
        title: 'Huile Essentielle Eucalyptus Radiata Bio',
        subtitle: '100% pure et naturelle',
        description: 'HE d\'eucalyptus radiata bio. Idéale pour les inhalations respiratoires.',
        asin: 'B06XGRQKZR',
        searchQuery: 'huile essentielle eucalyptus radiata bio',
        priceLabel: '~7,90 €',
        badge: 'bio',
        category: 'huile_essentielle',
        isEssential: true,
        sortOrder: 1,
      },
      {
        id: 'he-lavande-1',
        ingredientName: 'Huile essentielle de lavande',
        title: 'Huile Essentielle Lavande Fine Bio',
        subtitle: 'Provence',
        description: 'HE de lavande fine de Provence bio. Apaisante et relaxante.',
        asin: 'B06XHPKM3Y',
        searchQuery: 'huile essentielle lavande fine bio provence',
        priceLabel: '~9,90 €',
        badge: 'recommande',
        category: 'huile_essentielle',
        isEssential: true,
        sortOrder: 2,
      },
      {
        id: 'inhalateur-1',
        ingredientName: 'Inhalateur',
        title: 'Inhalateur Vapeur pour Huiles Essentielles',
        description: 'Inhalateur électrique avec réservoir. Diffusion douce et efficace.',
        asin: 'B0BYM9DCCS',
        searchQuery: 'inhalateur vapeur huiles essentielles',
        priceLabel: '~24,90 €',
        badge: 'populaire',
        category: 'accessoire',
        sortOrder: 3,
      },
      {
        id: 'bol-inhalation-1',
        ingredientName: 'Bol',
        title: 'Bol Inhalation Traditionnel',
        subtitle: 'Méthode classique',
        description: 'Bol en céramique résistant à la chaleur pour inhalations traditionnelles.',
        asin: 'B00JGXIQ0M',
        searchQuery: 'bol inhalation ceramique',
        priceLabel: '~12,90 €',
        badge: 'petit_budget',
        category: 'ustensile',
        sortOrder: 4,
      },
      {
        id: 'pack-he-respiration-1',
        ingredientName: 'Pack huiles essentielles',
        title: 'Coffret Huiles Essentielles Respiration',
        subtitle: 'Eucalyptus + Lavande + Menthe',
        description: 'Pack de 3 huiles essentielles bio pour le confort respiratoire.',
        asin: 'B07L9RN8VT',
        searchQuery: 'coffret huiles essentielles respiration bio',
        priceLabel: '~19,90 €',
        badge: 'pack',
        category: 'pack',
        sortOrder: 5,
      },
    ],
  },

  // ============================================
  // INFUSION CAMOMILLE (ID: camomille-sommeil)
  // ============================================
  {
    remedyId: 'camomille-sommeil',
    products: [
      {
        id: 'camomille-bio-1',
        ingredientName: 'Camomille',
        title: 'Fleurs de Camomille Bio - 100g',
        subtitle: 'Matricaire',
        description: 'Fleurs de camomille matricaire bio séchées. Apaisantes pour un sommeil serein.',
        asin: 'B07N8HBLFD',
        searchQuery: 'camomille matricaire bio fleurs sechees infusion',
        priceLabel: '~8,90 €',
        badge: 'bio',
        category: 'plante',
        isEssential: true,
        sortOrder: 1,
      },
      {
        id: 'miel-lavande-1',
        ingredientName: 'Miel',
        title: 'Miel de Lavande Bio - 250g',
        description: 'Miel de lavande doux et parfumé. Complément idéal pour vos tisanes du soir.',
        asin: 'B08GFX2PFJ',
        searchQuery: 'miel lavande bio france',
        priceLabel: '~11,90 €',
        badge: 'premium',
        category: 'miel',
        sortOrder: 2,
      },
      {
        id: 'theiere-verre-1',
        ingredientName: 'Théière',
        title: 'Théière en Verre avec Infuseur - 600ml',
        description: 'Théière élégante en verre borosilicate avec infuseur amovible.',
        asin: 'B07JNQKJLZ',
        searchQuery: 'theiere verre borosilicate infuseur',
        priceLabel: '~18,90 €',
        badge: 'recommande',
        category: 'accessoire',
        sortOrder: 3,
      },
    ],
  },

  // ============================================
  // MIEL & CITRON (ID: miel-citron)
  // ============================================
  {
    remedyId: 'miel-citron',
    products: [
      {
        id: 'miel-acacia-1',
        ingredientName: 'Miel',
        title: 'Miel d\'Acacia Bio - 500g',
        subtitle: 'Doux et liquide',
        description: 'Miel d\'acacia bio, naturellement liquide. Parfait pour les préparations.',
        asin: 'B01LXKH042',
        searchQuery: 'miel acacia bio 500g france',
        priceLabel: '~12,90 €',
        badge: 'bio',
        category: 'miel',
        isEssential: true,
        sortOrder: 1,
      },
      {
        id: 'citrons-bio-1',
        ingredientName: 'Citron',
        title: 'Jus de Citron Bio - 250ml',
        description: 'Jus de citron bio pur, idéal pour vos préparations maison.',
        asin: 'B075DDGPBN',
        searchQuery: 'jus citron bio pur',
        priceLabel: '~5,90 €',
        badge: 'bio',
        category: 'ingredient',
        isEssential: true,
        sortOrder: 2,
      },
      {
        id: 'presse-citron-1',
        ingredientName: 'Presse-citron',
        title: 'Presse-Citron Manuel en Inox',
        description: 'Presse-agrumes manuel robuste en acier inoxydable.',
        asin: 'B07BFSS9LK',
        searchQuery: 'presse citron manuel inox',
        priceLabel: '~9,90 €',
        badge: 'populaire',
        category: 'ustensile',
        sortOrder: 3,
      },
      {
        id: 'bocal-conservation-1',
        ingredientName: 'Bocal',
        title: 'Bocaux en Verre Hermétiques - Lot de 3',
        description: 'Bocaux en verre avec fermeture hermétique pour conserver vos sirops.',
        asin: 'B07D6L27XF',
        searchQuery: 'bocaux verre hermetique conservation',
        priceLabel: '~14,90 €',
        category: 'contenant',
        sortOrder: 4,
      },
    ],
  },

  // ============================================
  // VINAIGRE EN FRICTION (ID: vinaigre-friction)
  // ============================================
  {
    remedyId: 'vinaigre-friction',
    products: [
      {
        id: 'vinaigre-cidre-bio-1',
        ingredientName: 'Vinaigre de cidre',
        title: 'Vinaigre de Cidre Bio Non Filtré - 1L',
        subtitle: 'Avec la mère',
        description: 'Vinaigre de cidre bio non pasteurisé, idéal pour frictions et soins naturels.',
        asin: 'B078GZ5LBZ',
        searchQuery: 'vinaigre cidre bio non filtre mere',
        priceLabel: '~9,90 €',
        badge: 'bio',
        category: 'ingredient',
        isEssential: true,
        sortOrder: 1,
      },
      {
        id: 'linge-coton-1',
        ingredientName: 'Linge',
        title: 'Compresses en Coton Bio - Lot de 10',
        description: 'Compresses réutilisables en coton bio pour applications et frictions.',
        asin: 'B07JMHKFP5',
        searchQuery: 'compresses coton bio reutilisable',
        priceLabel: '~12,90 €',
        badge: 'bio',
        category: 'accessoire',
        sortOrder: 2,
      },
      {
        id: 'flacon-spray-1',
        ingredientName: 'Flacon',
        title: 'Flacon Spray en Verre Ambré - 100ml',
        description: 'Flacon spray pour préparer et conserver vos mélanges de friction.',
        asin: 'B07B8R45QZ',
        searchQuery: 'flacon spray verre ambre 100ml',
        priceLabel: '~7,90 €',
        category: 'contenant',
        sortOrder: 3,
      },
    ],
  },

  // ============================================
  // INFUSION MENTHE POIVRÉE (ID: menthe-digestion)
  // ============================================
  {
    remedyId: 'menthe-digestion',
    products: [
      {
        id: 'menthe-poivree-bio-1',
        ingredientName: 'Menthe poivrée',
        title: 'Menthe Poivrée Bio Séchée - 100g',
        subtitle: 'Feuilles entières',
        description: 'Feuilles de menthe poivrée bio séchées. Parfaites pour infusions digestives.',
        asin: 'B07GDK8ZG6',
        searchQuery: 'menthe poivree bio feuilles sechees infusion',
        priceLabel: '~7,90 €',
        badge: 'bio',
        category: 'plante',
        isEssential: true,
        sortOrder: 1,
      },
      {
        id: 'he-menthe-1',
        ingredientName: 'Huile essentielle de menthe',
        title: 'Huile Essentielle Menthe Poivrée Bio',
        subtitle: '100% pure',
        description: 'HE de menthe poivrée bio. Usage alimentaire possible (1 goutte dans tisane).',
        asin: 'B06XH5TRMN',
        searchQuery: 'huile essentielle menthe poivree bio',
        priceLabel: '~8,90 €',
        badge: 'premium',
        category: 'huile_essentielle',
        sortOrder: 2,
      },
      {
        id: 'infuseur-double-1',
        ingredientName: 'Infuseur',
        title: 'Infuseur Double Paroi avec Couvercle',
        description: 'Infuseur en verre double paroi pour garder votre tisane chaude plus longtemps.',
        asin: 'B07FMJ73J3',
        searchQuery: 'mug infuseur double paroi verre',
        priceLabel: '~14,90 €',
        badge: 'populaire',
        category: 'accessoire',
        sortOrder: 3,
      },
    ],
  },

  // ============================================
  // FRICTION HUILE DE MILLEPERTUIS (exemple supplémentaire)
  // ============================================
  {
    remedyId: 'friction-millepertuis',
    products: [
      {
        id: 'huile-millepertuis-1',
        ingredientName: 'Huile de millepertuis',
        title: 'Huile de Millepertuis Bio - 100ml',
        subtitle: 'Macérât huileux',
        description: 'Macérât de millepertuis bio dans huile de tournesol. Usage externe.',
        asin: 'B00IWGMJXY',
        searchQuery: 'huile millepertuis bio macerat',
        priceLabel: '~12,90 €',
        badge: 'bio',
        category: 'huile_essentielle',
        isEssential: true,
        sortOrder: 1,
      },
      {
        id: 'flacon-pompe-1',
        ingredientName: 'Flacon',
        title: 'Flacons Pompe en Verre Ambré - Lot de 2',
        description: 'Flacons en verre ambré avec pompe pour conserver et appliquer vos huiles.',
        asin: 'B07BSL2S58',
        searchQuery: 'flacon pompe verre ambre cosmetique',
        priceLabel: '~8,90 €',
        category: 'contenant',
        sortOrder: 2,
      },
    ],
  },

  // ============================================
  // GARGARISME EAU SALÉE
  // ============================================
  {
    remedyId: 'gargarisme-eau-salee',
    products: [
      {
        id: 'sel-mer-1',
        ingredientName: 'Sel de mer',
        title: 'Sel de Mer Gris de Guérande - 1kg',
        subtitle: 'Non raffiné',
        description: 'Sel de mer gris non raffiné, riche en minéraux. Idéal pour gargarismes.',
        asin: 'B00DUK0WMW',
        searchQuery: 'sel guerande gris non raffine',
        priceLabel: '~6,90 €',
        badge: 'recommande',
        category: 'ingredient',
        isEssential: true,
        sortOrder: 1,
      },
      {
        id: 'bicarbonate-1',
        ingredientName: 'Bicarbonate',
        title: 'Bicarbonate de Soude Alimentaire - 500g',
        description: 'Bicarbonate de soude alimentaire pur. Complément pour gargarismes.',
        asin: 'B00I9VU5TC',
        searchQuery: 'bicarbonate soude alimentaire',
        priceLabel: '~4,90 €',
        badge: 'petit_budget',
        category: 'ingredient',
        sortOrder: 2,
      },
    ],
  },
];

// ============================================
// FONCTIONS D'ACCÈS AUX DONNÉES
// ============================================

/**
 * Récupère les produits affiliés pour un remède donné
 */
export function getAffiliateProductsForRemedy(remedyId: string): AffiliateProduct[] {
  const entry = AFFILIATE_PRODUCTS_DATA.find(e => e.remedyId === remedyId);
  
  if (!entry) {
    return [];
  }
  
  // Trier par sortOrder puis par isEssential
  return [...entry.products].sort((a, b) => {
    // Les essentiels d'abord
    if (a.isEssential && !b.isEssential) return -1;
    if (!a.isEssential && b.isEssential) return 1;
    // Puis par ordre
    return (a.sortOrder || 99) - (b.sortOrder || 99);
  });
}

/**
 * Récupère tous les produits affiliés
 */
export function getAllAffiliateProducts(): AffiliateProduct[] {
  return AFFILIATE_PRODUCTS_DATA.flatMap(entry => entry.products);
}

/**
 * Récupère un produit par son ID
 */
export function getAffiliateProductById(productId: string): AffiliateProduct | null {
  for (const entry of AFFILIATE_PRODUCTS_DATA) {
    const product = entry.products.find(p => p.id === productId);
    if (product) return product;
  }
  return null;
}

/**
 * Vérifie si un remède a des produits affiliés
 */
export function hasAffiliateProducts(remedyId: string): boolean {
  const entry = AFFILIATE_PRODUCTS_DATA.find(e => e.remedyId === remedyId);
  return entry !== undefined && entry.products.length > 0;
}

/**
 * Compte le nombre de produits pour un remède
 */
export function countAffiliateProducts(remedyId: string): number {
  const entry = AFFILIATE_PRODUCTS_DATA.find(e => e.remedyId === remedyId);
  return entry ? entry.products.length : 0;
}

// ============================================
// TODO V2 - AMÉLIORATIONS FUTURES
// ============================================

// TODO V2: Charger les produits depuis une API backend
// TODO V2: Mise à jour automatique des prix via Amazon API
// TODO V2: Système de cache avec expiration
// TODO V2: Suggestions automatiques basées sur les ingrédients du remède
// TODO V2: Import/export des données produits
// TODO V2: Interface admin pour gérer les produits
