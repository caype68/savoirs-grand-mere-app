// ============================================
// PRODUITS AFFILIÉS AMAZON - HUILES ESSENTIELLES
// Tag affilié : craype-21
// ============================================

import { EssentialOilAffiliateProducts } from '../types';

// ============================================
// PRODUITS PAR HUILE ESSENTIELLE
// ============================================

export const ESSENTIAL_OIL_AFFILIATE_PRODUCTS: EssentialOilAffiliateProducts[] = [
  // ============================================
  // LAVANDE VRAIE
  // ============================================
  {
    relatedType: 'essential_oil',
    relatedId: 'lavande-vraie',
    products: [
      {
        id: 'he-lavande-bio-1',
        relatedType: 'essential_oil',
        relatedId: 'lavande-vraie',
        oilName: 'Lavande vraie',
        title: 'Huile Essentielle Lavande Vraie Bio',
        subtitle: 'Lavandula angustifolia - 10ml',
        description: 'HE de lavande vraie bio de Provence. 100% pure et naturelle, chémotypée.',
        // TODO: remplacer searchQuery par vrai ASIN Amazon
        searchQuery: 'huile essentielle lavande vraie bio 10ml',
        priceLabel: '~8,90 €',
        badge: 'bio',
        category: 'huile_essentielle',
        isEssential: true,
        sortOrder: 1,
      },
      {
        id: 'hv-amande-douce-1',
        relatedType: 'essential_oil',
        relatedId: 'lavande-vraie',
        oilName: 'Huile végétale',
        title: 'Huile Végétale Amande Douce Bio',
        subtitle: 'Pour dilution - 100ml',
        description: 'Huile végétale d\'amande douce bio, idéale pour diluer les huiles essentielles.',
        searchQuery: 'huile vegetale amande douce bio 100ml',
        priceLabel: '~7,90 €',
        badge: 'bio',
        category: 'huile_vegetale',
        sortOrder: 2,
      },
      {
        id: 'diffuseur-ultrason-1',
        relatedType: 'accessory',
        relatedId: 'lavande-vraie',
        title: 'Diffuseur Huiles Essentielles Ultrasonique',
        description: 'Diffuseur à ultrasons silencieux avec lumière d\'ambiance.',
        searchQuery: 'diffuseur huiles essentielles ultrasonique',
        priceLabel: '~24,90 €',
        badge: 'populaire',
        category: 'diffuseur',
        sortOrder: 3,
      },
    ],
  },

  // ============================================
  // TEA TREE
  // ============================================
  {
    relatedType: 'essential_oil',
    relatedId: 'tea-tree',
    products: [
      {
        id: 'he-tea-tree-bio-1',
        relatedType: 'essential_oil',
        relatedId: 'tea-tree',
        oilName: 'Tea tree',
        title: 'Huile Essentielle Tea Tree Bio',
        subtitle: 'Melaleuca alternifolia - 10ml',
        description: 'HE de tea tree bio d\'Australie. Antibactérienne et antifongique puissante.',
        searchQuery: 'huile essentielle tea tree bio 10ml',
        priceLabel: '~6,90 €',
        badge: 'bio',
        category: 'huile_essentielle',
        isEssential: true,
        sortOrder: 1,
      },
      {
        id: 'roll-on-tea-tree-1',
        relatedType: 'accessory',
        relatedId: 'tea-tree',
        title: 'Roll-on Tea Tree Prêt à l\'Emploi',
        description: 'Roll-on pratique avec tea tree dilué, prêt pour application locale.',
        searchQuery: 'roll on tea tree pret emploi',
        priceLabel: '~8,90 €',
        badge: 'populaire',
        category: 'roll_on',
        sortOrder: 2,
      },
      {
        id: 'hv-jojoba-1',
        relatedType: 'essential_oil',
        relatedId: 'tea-tree',
        oilName: 'Huile végétale',
        title: 'Huile Végétale Jojoba Bio',
        subtitle: 'Pour dilution - 50ml',
        description: 'Huile de jojoba bio, parfaite pour les soins du visage et dilution des HE.',
        searchQuery: 'huile vegetale jojoba bio 50ml',
        priceLabel: '~9,90 €',
        badge: 'bio',
        category: 'huile_vegetale',
        sortOrder: 3,
      },
    ],
  },

  // ============================================
  // EUCALYPTUS RADIÉ
  // ============================================
  {
    relatedType: 'essential_oil',
    relatedId: 'eucalyptus-radie',
    products: [
      {
        id: 'he-eucalyptus-radie-bio-1',
        relatedType: 'essential_oil',
        relatedId: 'eucalyptus-radie',
        oilName: 'Eucalyptus radié',
        title: 'Huile Essentielle Eucalyptus Radié Bio',
        subtitle: 'Eucalyptus radiata - 10ml',
        description: 'HE d\'eucalyptus radié bio. Expectorante et décongestionnante.',
        searchQuery: 'huile essentielle eucalyptus radiata bio 10ml',
        priceLabel: '~5,90 €',
        badge: 'bio',
        category: 'huile_essentielle',
        isEssential: true,
        sortOrder: 1,
      },
      {
        id: 'inhalateur-stick-1',
        relatedType: 'accessory',
        relatedId: 'eucalyptus-radie',
        title: 'Inhalateur Stick Vide - Lot de 5',
        description: 'Sticks inhalateurs rechargeables pour emporter vos huiles essentielles.',
        searchQuery: 'inhalateur stick vide huiles essentielles',
        priceLabel: '~6,90 €',
        category: 'inhalateur',
        sortOrder: 2,
      },
      {
        id: 'bol-inhalation-2',
        relatedType: 'accessory',
        relatedId: 'eucalyptus-radie',
        title: 'Bol Inhalateur avec Masque',
        description: 'Bol inhalateur en plastique avec masque intégré pour inhalations.',
        searchQuery: 'bol inhalateur masque huiles essentielles',
        priceLabel: '~12,90 €',
        badge: 'populaire',
        category: 'inhalateur',
        sortOrder: 3,
      },
    ],
  },

  // ============================================
  // RAVINTSARA
  // ============================================
  {
    relatedType: 'essential_oil',
    relatedId: 'ravintsara',
    products: [
      {
        id: 'he-ravintsara-bio-1',
        relatedType: 'essential_oil',
        relatedId: 'ravintsara',
        oilName: 'Ravintsara',
        title: 'Huile Essentielle Ravintsara Bio',
        subtitle: 'Cinnamomum camphora - 10ml',
        description: 'HE de ravintsara bio de Madagascar. Antivirale puissante, immunostimulante.',
        searchQuery: 'huile essentielle ravintsara bio madagascar 10ml',
        priceLabel: '~8,90 €',
        badge: 'bio',
        category: 'huile_essentielle',
        isEssential: true,
        sortOrder: 1,
      },
      {
        id: 'coffret-hiver-1',
        relatedType: 'accessory',
        relatedId: 'ravintsara',
        title: 'Coffret Huiles Essentielles Hiver',
        subtitle: 'Ravintsara + Eucalyptus + Tea Tree',
        description: 'Coffret de 3 huiles essentielles bio pour affronter l\'hiver.',
        searchQuery: 'coffret huiles essentielles hiver bio',
        priceLabel: '~19,90 €',
        badge: 'pack',
        category: 'coffret',
        sortOrder: 2,
      },
    ],
  },

  // ============================================
  // MENTHE POIVRÉE
  // ============================================
  {
    relatedType: 'essential_oil',
    relatedId: 'menthe-poivree',
    products: [
      {
        id: 'he-menthe-poivree-bio-1',
        relatedType: 'essential_oil',
        relatedId: 'menthe-poivree',
        oilName: 'Menthe poivrée',
        title: 'Huile Essentielle Menthe Poivrée Bio',
        subtitle: 'Mentha piperita - 10ml',
        description: 'HE de menthe poivrée bio. Rafraîchissante, digestive, antalgique.',
        searchQuery: 'huile essentielle menthe poivree bio 10ml',
        priceLabel: '~6,90 €',
        badge: 'bio',
        category: 'huile_essentielle',
        isEssential: true,
        sortOrder: 1,
      },
      {
        id: 'roll-on-migraine-1',
        relatedType: 'accessory',
        relatedId: 'menthe-poivree',
        title: 'Roll-on Maux de Tête Menthe',
        description: 'Roll-on prêt à l\'emploi pour soulager les maux de tête.',
        searchQuery: 'roll on maux de tete menthe poivree',
        priceLabel: '~9,90 €',
        badge: 'populaire',
        category: 'roll_on',
        sortOrder: 2,
      },
    ],
  },

  // ============================================
  // CAMOMILLE ROMAINE
  // ============================================
  {
    relatedType: 'essential_oil',
    relatedId: 'camomille-romaine',
    products: [
      {
        id: 'he-camomille-romaine-bio-1',
        relatedType: 'essential_oil',
        relatedId: 'camomille-romaine',
        oilName: 'Camomille romaine',
        title: 'Huile Essentielle Camomille Romaine Bio',
        subtitle: 'Chamaemelum nobile - 5ml',
        description: 'HE de camomille romaine bio. Calmante exceptionnelle, anti-stress.',
        searchQuery: 'huile essentielle camomille romaine bio 5ml',
        priceLabel: '~14,90 €',
        badge: 'premium',
        category: 'huile_essentielle',
        isEssential: true,
        sortOrder: 1,
      },
      {
        id: 'coffret-relaxation-1',
        relatedType: 'accessory',
        relatedId: 'camomille-romaine',
        title: 'Coffret Relaxation & Sommeil',
        subtitle: 'Camomille + Lavande + Orange',
        description: 'Coffret de 3 huiles essentielles bio pour la détente et le sommeil.',
        searchQuery: 'coffret huiles essentielles relaxation sommeil bio',
        priceLabel: '~24,90 €',
        badge: 'pack',
        category: 'coffret',
        sortOrder: 2,
      },
    ],
  },

  // ============================================
  // GAULTHÉRIE
  // ============================================
  {
    relatedType: 'essential_oil',
    relatedId: 'gaultherie',
    products: [
      {
        id: 'he-gaultherie-bio-1',
        relatedType: 'essential_oil',
        relatedId: 'gaultherie',
        oilName: 'Gaulthérie',
        title: 'Huile Essentielle Gaulthérie Couchée Bio',
        subtitle: 'Gaultheria procumbens - 10ml',
        description: 'HE de gaulthérie bio. Anti-inflammatoire et antidouleur puissant.',
        searchQuery: 'huile essentielle gaultherie couchee bio 10ml',
        priceLabel: '~7,90 €',
        badge: 'bio',
        category: 'huile_essentielle',
        isEssential: true,
        sortOrder: 1,
      },
      {
        id: 'hv-arnica-1',
        relatedType: 'essential_oil',
        relatedId: 'gaultherie',
        oilName: 'Huile végétale',
        title: 'Huile Végétale Arnica Bio',
        subtitle: 'Macérât huileux - 100ml',
        description: 'Macérât d\'arnica bio, idéal pour les massages musculaires.',
        searchQuery: 'huile vegetale arnica bio macerat 100ml',
        priceLabel: '~12,90 €',
        badge: 'recommande',
        category: 'huile_vegetale',
        sortOrder: 2,
      },
      {
        id: 'coffret-sport-1',
        relatedType: 'accessory',
        relatedId: 'gaultherie',
        title: 'Coffret Sportif',
        subtitle: 'Gaulthérie + Lavande + Menthe',
        description: 'Coffret de 3 huiles essentielles pour les sportifs.',
        searchQuery: 'coffret huiles essentielles sport massage',
        priceLabel: '~18,90 €',
        badge: 'pack',
        category: 'coffret',
        sortOrder: 3,
      },
    ],
  },

  // ============================================
  // HÉLICHRYSE
  // ============================================
  {
    relatedType: 'essential_oil',
    relatedId: 'helichryse',
    products: [
      {
        id: 'he-helichryse-bio-1',
        relatedType: 'essential_oil',
        relatedId: 'helichryse',
        oilName: 'Hélichryse',
        title: 'Huile Essentielle Hélichryse Italienne Bio',
        subtitle: 'Helichrysum italicum - 5ml',
        description: 'HE d\'hélichryse italienne bio (Immortelle). Anti-hématome exceptionnelle.',
        searchQuery: 'huile essentielle helichryse italienne bio 5ml',
        priceLabel: '~24,90 €',
        badge: 'premium',
        category: 'huile_essentielle',
        isEssential: true,
        sortOrder: 1,
      },
      {
        id: 'hv-rose-musquee-1',
        relatedType: 'essential_oil',
        relatedId: 'helichryse',
        oilName: 'Huile végétale',
        title: 'Huile Végétale Rose Musquée Bio',
        subtitle: 'Pour cicatrices - 30ml',
        description: 'Huile de rose musquée bio, régénérante et cicatrisante.',
        searchQuery: 'huile vegetale rose musquee bio 30ml',
        priceLabel: '~11,90 €',
        badge: 'recommande',
        category: 'huile_vegetale',
        sortOrder: 2,
      },
    ],
  },

  // ============================================
  // CITRON
  // ============================================
  {
    relatedType: 'essential_oil',
    relatedId: 'citron',
    products: [
      {
        id: 'he-citron-bio-1',
        relatedType: 'essential_oil',
        relatedId: 'citron',
        oilName: 'Citron',
        title: 'Huile Essentielle Citron Bio',
        subtitle: 'Citrus limon - 10ml',
        description: 'HE de citron bio. Assainissante, tonique digestif, stimulante.',
        searchQuery: 'huile essentielle citron bio 10ml',
        priceLabel: '~4,90 €',
        badge: 'bio',
        category: 'huile_essentielle',
        isEssential: true,
        sortOrder: 1,
      },
      {
        id: 'diffuseur-voiture-1',
        relatedType: 'accessory',
        relatedId: 'citron',
        title: 'Diffuseur Voiture Huiles Essentielles',
        description: 'Mini diffuseur USB pour voiture ou bureau.',
        searchQuery: 'diffuseur huiles essentielles voiture usb',
        priceLabel: '~14,90 €',
        category: 'diffuseur',
        sortOrder: 2,
      },
    ],
  },

  // ============================================
  // ORANGE DOUCE
  // ============================================
  {
    relatedType: 'essential_oil',
    relatedId: 'orange-douce',
    products: [
      {
        id: 'he-orange-douce-bio-1',
        relatedType: 'essential_oil',
        relatedId: 'orange-douce',
        oilName: 'Orange douce',
        title: 'Huile Essentielle Orange Douce Bio',
        subtitle: 'Citrus sinensis - 10ml',
        description: 'HE d\'orange douce bio. Relaxante, favorise le sommeil.',
        searchQuery: 'huile essentielle orange douce bio 10ml',
        priceLabel: '~4,90 €',
        badge: 'bio',
        category: 'huile_essentielle',
        isEssential: true,
        sortOrder: 1,
      },
      {
        id: 'diffuseur-nebulisation-1',
        relatedType: 'accessory',
        relatedId: 'orange-douce',
        title: 'Diffuseur Nébulisation Verre',
        subtitle: 'Sans eau - Diffusion pure',
        description: 'Diffuseur par nébulisation en verre, diffusion pure sans eau.',
        searchQuery: 'diffuseur nebulisation verre huiles essentielles',
        priceLabel: '~39,90 €',
        badge: 'premium',
        category: 'diffuseur',
        sortOrder: 2,
      },
    ],
  },

  // ============================================
  // GÉRANIUM ROSAT
  // ============================================
  {
    relatedType: 'essential_oil',
    relatedId: 'geranium-rosat',
    products: [
      {
        id: 'he-geranium-rosat-bio-1',
        relatedType: 'essential_oil',
        relatedId: 'geranium-rosat',
        oilName: 'Géranium rosat',
        title: 'Huile Essentielle Géranium Rosat Bio',
        subtitle: 'Pelargonium graveolens - 10ml',
        description: 'HE de géranium rosat bio. Cicatrisante, équilibrante cutanée.',
        searchQuery: 'huile essentielle geranium rosat bio 10ml',
        priceLabel: '~9,90 €',
        badge: 'bio',
        category: 'huile_essentielle',
        isEssential: true,
        sortOrder: 1,
      },
      {
        id: 'coffret-beaute-1',
        relatedType: 'accessory',
        relatedId: 'geranium-rosat',
        title: 'Coffret Beauté Naturelle',
        subtitle: 'Géranium + Lavande + Tea Tree',
        description: 'Coffret de 3 huiles essentielles bio pour les soins de la peau.',
        searchQuery: 'coffret huiles essentielles beaute peau bio',
        priceLabel: '~22,90 €',
        badge: 'pack',
        category: 'coffret',
        sortOrder: 2,
      },
    ],
  },

  // ============================================
  // ACCESSOIRES GÉNÉRAUX
  // ============================================
  {
    relatedType: 'accessory',
    relatedId: 'general',
    products: [
      {
        id: 'flacons-vides-1',
        relatedType: 'accessory',
        relatedId: 'general',
        title: 'Flacons Vides Verre Ambré - Lot de 10',
        subtitle: '10ml avec compte-gouttes',
        description: 'Flacons en verre ambré avec compte-gouttes pour vos mélanges.',
        searchQuery: 'flacons verre ambre 10ml compte gouttes lot',
        priceLabel: '~9,90 €',
        category: 'flacon',
        sortOrder: 1,
      },
      {
        id: 'roll-on-vides-1',
        relatedType: 'accessory',
        relatedId: 'general',
        title: 'Roll-on Vides Verre - Lot de 6',
        subtitle: '10ml avec bille inox',
        description: 'Roll-on en verre ambré avec bille inox pour vos synergies.',
        searchQuery: 'roll on vide verre ambre 10ml lot',
        priceLabel: '~8,90 €',
        category: 'roll_on',
        sortOrder: 2,
      },
      {
        id: 'livre-aromatherapie-1',
        relatedType: 'accessory',
        relatedId: 'general',
        title: 'Ma Bible des Huiles Essentielles',
        subtitle: 'Guide complet aromathérapie',
        description: 'Le guide de référence pour utiliser les huiles essentielles au quotidien.',
        searchQuery: 'ma bible huiles essentielles livre',
        priceLabel: '~23,90 €',
        badge: 'recommande',
        category: 'livre',
        sortOrder: 3,
      },
      {
        id: 'coffret-debutant-1',
        relatedType: 'accessory',
        relatedId: 'general',
        title: 'Coffret Découverte Aromathérapie',
        subtitle: '6 huiles essentielles bio',
        description: 'Coffret de 6 huiles essentielles bio indispensables pour débuter.',
        searchQuery: 'coffret decouverte huiles essentielles bio debutant',
        priceLabel: '~29,90 €',
        badge: 'pack',
        category: 'coffret',
        sortOrder: 4,
      },
    ],
  },
];

// ============================================
// FONCTIONS D'ACCÈS AUX DONNÉES
// ============================================

/**
 * Récupère les produits affiliés pour une huile essentielle
 */
export function getAffiliateProductsForEssentialOil(oilId: string): EssentialOilAffiliateProducts | undefined {
  return ESSENTIAL_OIL_AFFILIATE_PRODUCTS.find(
    p => p.relatedType === 'essential_oil' && p.relatedId === oilId
  );
}

/**
 * Récupère les produits affiliés pour un remède aromathérapie
 */
export function getAffiliateProductsForEssentialOilRemedy(remedyId: string): EssentialOilAffiliateProducts | undefined {
  return ESSENTIAL_OIL_AFFILIATE_PRODUCTS.find(
    p => p.relatedType === 'remedy' && p.relatedId === remedyId
  );
}

/**
 * Récupère les accessoires généraux
 */
export function getGeneralAccessories(): EssentialOilAffiliateProducts | undefined {
  return ESSENTIAL_OIL_AFFILIATE_PRODUCTS.find(
    p => p.relatedType === 'accessory' && p.relatedId === 'general'
  );
}

/**
 * Récupère tous les produits affiliés
 */
export function getAllEssentialOilAffiliateProducts(): EssentialOilAffiliateProducts[] {
  return ESSENTIAL_OIL_AFFILIATE_PRODUCTS;
}
