// ============================================
// BASE DE DONNÉES DES HUILES ESSENTIELLES
// Source: Savoirs de Grand-Mère - Aromathérapie + connaissances traditionnelles
// ============================================

import { 
  EssentialOil, 
  EssentialOilCategoryInfo, 
  AromatherapySafetyRule 
} from '../types';

// ============================================
// CATÉGORIES D'HUILES ESSENTIELLES
// ============================================

export const ESSENTIAL_OIL_CATEGORIES: EssentialOilCategoryInfo[] = [
  {
    id: 'respiration',
    slug: 'respiration',
    title: 'Respiration',
    description: 'Huiles essentielles pour dégager les voies respiratoires, soulager la toux et les congestions.',
    icon: 'wind',
    color: '#7BC8E8',
  },
  {
    id: 'digestion',
    slug: 'digestion',
    title: 'Digestion',
    description: 'Huiles essentielles pour favoriser la digestion, soulager les ballonnements et les nausées.',
    icon: 'coffee',
    color: '#A8D5BA',
  },
  {
    id: 'stress',
    slug: 'stress',
    title: 'Stress & Anxiété',
    description: 'Huiles essentielles relaxantes pour apaiser le stress, l\'anxiété et les tensions nerveuses.',
    icon: 'heart',
    color: '#D4A5D9',
  },
  {
    id: 'sommeil',
    slug: 'sommeil',
    title: 'Sommeil',
    description: 'Huiles essentielles pour favoriser l\'endormissement et améliorer la qualité du sommeil.',
    icon: 'moon',
    color: '#6B7FD7',
  },
  {
    id: 'douleurs',
    slug: 'douleurs',
    title: 'Douleurs & Muscles',
    description: 'Huiles essentielles pour soulager les douleurs musculaires, articulaires et les tensions.',
    icon: 'activity',
    color: '#E8A87C',
  },
  {
    id: 'peau',
    slug: 'peau',
    title: 'Peau & Beauté',
    description: 'Huiles essentielles pour les soins de la peau, cicatrisation et problèmes cutanés.',
    icon: 'droplet',
    color: '#F5C6D6',
  },
  {
    id: 'immunite',
    slug: 'immunite',
    title: 'Immunité',
    description: 'Huiles essentielles pour renforcer les défenses naturelles et prévenir les infections.',
    icon: 'shield',
    color: '#78A686',
  },
  {
    id: 'energie',
    slug: 'energie',
    title: 'Énergie & Vitalité',
    description: 'Huiles essentielles tonifiantes pour stimuler l\'énergie et combattre la fatigue.',
    icon: 'zap',
    color: '#F9D56E',
  },
  {
    id: 'circulation',
    slug: 'circulation',
    title: 'Circulation',
    description: 'Huiles essentielles pour améliorer la circulation sanguine et lymphatique.',
    icon: 'repeat',
    color: '#E57373',
  },
];

// ============================================
// RÈGLES DE SÉCURITÉ AROMATHÉRAPIE
// ============================================

export const AROMATHERAPY_SAFETY_RULES: AromatherapySafetyRule[] = [
  {
    id: 'dilution',
    title: 'Toujours diluer',
    description: 'Les huiles essentielles doivent être diluées dans une huile végétale avant application cutanée (2-3% maximum).',
    icon: 'droplet',
    severity: 'warning',
    appliesTo: ['tous'],
  },
  {
    id: 'test-cutane',
    title: 'Test cutané',
    description: 'Effectuez toujours un test au pli du coude 24h avant la première utilisation d\'une nouvelle huile.',
    icon: 'check-circle',
    severity: 'info',
    appliesTo: ['tous'],
  },
  {
    id: 'femmes-enceintes',
    title: 'Femmes enceintes',
    description: 'La plupart des huiles essentielles sont déconseillées pendant la grossesse, surtout les 3 premiers mois.',
    icon: 'alert-triangle',
    severity: 'danger',
    appliesTo: ['femme_enceinte'],
  },
  {
    id: 'enfants',
    title: 'Enfants',
    description: 'Certaines huiles sont interdites aux enfants de moins de 6 ans. Toujours vérifier la compatibilité.',
    icon: 'alert-triangle',
    severity: 'danger',
    appliesTo: ['enfant_3_plus', 'enfant_6_plus'],
  },
  {
    id: 'usage-interne',
    title: 'Usage interne',
    description: 'L\'usage interne des huiles essentielles nécessite un avis médical ou d\'un aromathérapeute qualifié.',
    icon: 'alert-circle',
    severity: 'warning',
    appliesTo: ['tous'],
  },
  {
    id: 'photosensibilisation',
    title: 'Photosensibilisation',
    description: 'Certaines huiles (agrumes) sont photosensibilisantes. Évitez l\'exposition au soleil après application.',
    icon: 'sun',
    severity: 'warning',
    appliesTo: ['tous'],
  },
  {
    id: 'qualite',
    title: 'Qualité des huiles',
    description: 'Utilisez uniquement des huiles essentielles 100% pures et naturelles, de préférence bio et chémotypées.',
    icon: 'award',
    severity: 'info',
    appliesTo: ['tous'],
  },
  {
    id: 'conservation',
    title: 'Conservation',
    description: 'Conservez les huiles essentielles à l\'abri de la lumière et de la chaleur, dans des flacons en verre teinté.',
    icon: 'package',
    severity: 'info',
    appliesTo: ['tous'],
  },
];

// ============================================
// BASE DE DONNÉES DES HUILES ESSENTIELLES
// ============================================

export const ESSENTIAL_OILS: EssentialOil[] = [
  // ============================================
  // LAVANDE VRAIE (Lavandula angustifolia)
  // ============================================
  {
    id: 'lavande-vraie',
    slug: 'lavande-vraie',
    name: 'Lavande vraie',
    nameLatin: 'Lavandula angustifolia',
    familyBotanical: 'Lamiacées',
    shortDescription: 'L\'huile essentielle polyvalente par excellence, apaisante et cicatrisante.',
    longDescription: 'La lavande vraie est considérée comme l\'huile essentielle la plus polyvalente. Elle est réputée pour ses propriétés calmantes, cicatrisantes et antiseptiques. C\'est souvent la première huile recommandée pour débuter en aromathérapie.',
    mainProperties: ['Calmante', 'Cicatrisante', 'Antiseptique', 'Antispasmodique'],
    therapeuticProperties: ['Anxiolytique', 'Sédative légère', 'Anti-inflammatoire', 'Régénérante cutanée'],
    commonUses: ['Stress', 'Insomnie', 'Brûlures légères', 'Piqûres d\'insectes', 'Cicatrisation', 'Maux de tête'],
    usageRoutes: ['diffusion', 'cutanee', 'massage', 'bain', 'inhalation'],
    dilutionRecommended: '2-3% dans une huile végétale',
    precautions: ['Éviter en début de grossesse', 'Peut être utilisée pure sur petites surfaces'],
    contraindications: ['Allergie aux Lamiacées'],
    compatibleProfiles: ['adulte', 'enfant_3_plus', 'senior', 'tous'],
    incompatibleProfiles: ['femme_enceinte'],
    safetyLevel: 'safe',
    synergies: ['camomille-romaine', 'ylang-ylang', 'orange-douce'],
    searchKeywords: ['lavande', 'lavandula', 'stress', 'sommeil', 'brulure', 'cicatrice', 'insomnie', 'relaxation', 'calmant'],
    tags: ['polyvalente', 'débutant', 'famille', 'relaxation', 'peau'],
    sourceBook: 'Savoirs de Grand-Mère - Aromathérapie',
    sourceType: 'book',
    icon: '💜',
    color: '#9B7ED9',
  },

  // ============================================
  // TEA TREE (Melaleuca alternifolia)
  // ============================================
  {
    id: 'tea-tree',
    slug: 'tea-tree',
    name: 'Tea tree (Arbre à thé)',
    nameLatin: 'Melaleuca alternifolia',
    familyBotanical: 'Myrtacées',
    shortDescription: 'Puissant antiseptique naturel, idéal pour les problèmes de peau et les infections.',
    longDescription: 'Le tea tree est reconnu pour ses propriétés antibactériennes, antivirales et antifongiques exceptionnelles. C\'est l\'huile de référence pour les problèmes cutanés et le renforcement immunitaire.',
    mainProperties: ['Antibactérien', 'Antiviral', 'Antifongique', 'Immunostimulant'],
    therapeuticProperties: ['Antiseptique puissant', 'Cicatrisant', 'Assainissant', 'Tonique'],
    commonUses: ['Acné', 'Mycoses', 'Infections ORL', 'Plaies', 'Verrues', 'Pellicules'],
    usageRoutes: ['cutanee', 'diffusion', 'bain', 'gargarisme'],
    dilutionRecommended: '1-2% dans une huile végétale',
    precautions: ['Peut être irritant pur sur peau sensible', 'Éviter le contact avec les yeux'],
    contraindications: ['Femmes enceintes (3 premiers mois)', 'Enfants de moins de 3 ans'],
    compatibleProfiles: ['adulte', 'enfant_6_plus', 'senior'],
    incompatibleProfiles: ['femme_enceinte', 'enfant_3_plus'],
    safetyLevel: 'safe',
    synergies: ['lavande-vraie', 'eucalyptus-radie', 'ravintsara'],
    searchKeywords: ['tea tree', 'arbre à thé', 'melaleuca', 'acne', 'mycose', 'infection', 'antiseptique', 'bouton', 'peau'],
    tags: ['antiseptique', 'peau', 'immunité', 'infections'],
    sourceBook: 'Savoirs de Grand-Mère - Aromathérapie',
    sourceType: 'book',
    icon: '🌿',
    color: '#4CAF50',
  },

  // ============================================
  // EUCALYPTUS RADIÉ (Eucalyptus radiata)
  // ============================================
  {
    id: 'eucalyptus-radie',
    slug: 'eucalyptus-radie',
    name: 'Eucalyptus radié',
    nameLatin: 'Eucalyptus radiata',
    familyBotanical: 'Myrtacées',
    shortDescription: 'L\'allié des voies respiratoires, décongestionnant et expectorant.',
    longDescription: 'L\'eucalyptus radié est l\'huile essentielle de référence pour les affections respiratoires. Plus douce que l\'eucalyptus globuleux, elle convient mieux aux enfants et aux personnes sensibles.',
    mainProperties: ['Expectorant', 'Décongestionnant', 'Antiviral', 'Immunostimulant'],
    therapeuticProperties: ['Mucolytique', 'Antibactérien', 'Énergisant', 'Rafraîchissant'],
    commonUses: ['Rhume', 'Sinusite', 'Bronchite', 'Toux grasse', 'Grippe', 'Otite'],
    usageRoutes: ['inhalation', 'diffusion', 'cutanee', 'massage'],
    dilutionRecommended: '2-3% dans une huile végétale',
    precautions: ['Éviter chez les asthmatiques', 'Ne pas appliquer près du visage des bébés'],
    contraindications: ['Asthme', 'Épilepsie', 'Enfants de moins de 3 ans'],
    compatibleProfiles: ['adulte', 'enfant_6_plus', 'senior'],
    incompatibleProfiles: ['femme_enceinte', 'enfant_3_plus'],
    safetyLevel: 'caution',
    synergies: ['ravintsara', 'tea-tree', 'niaouli', 'pin-sylvestre'],
    searchKeywords: ['eucalyptus', 'rhume', 'sinusite', 'toux', 'respiration', 'bronchite', 'grippe', 'nez bouche'],
    tags: ['respiration', 'hiver', 'immunité', 'décongestionnant'],
    sourceBook: 'Savoirs de Grand-Mère - Aromathérapie',
    sourceType: 'book',
    icon: '🌲',
    color: '#26A69A',
  },

  // ============================================
  // RAVINTSARA (Cinnamomum camphora)
  // ============================================
  {
    id: 'ravintsara',
    slug: 'ravintsara',
    name: 'Ravintsara',
    nameLatin: 'Cinnamomum camphora ct cinéole',
    familyBotanical: 'Lauracées',
    shortDescription: 'L\'huile antivirale par excellence, idéale pour prévenir et traiter les infections hivernales.',
    longDescription: 'Le ravintsara est considéré comme l\'une des huiles essentielles antivirales les plus puissantes. Originaire de Madagascar, elle est incontournable pour renforcer l\'immunité et combattre les infections virales.',
    mainProperties: ['Antiviral puissant', 'Immunostimulant', 'Expectorant', 'Énergisant'],
    therapeuticProperties: ['Antibactérien', 'Neurotonique', 'Équilibrant nerveux'],
    commonUses: ['Grippe', 'Rhume', 'Fatigue', 'Zona', 'Herpès', 'Prévention hivernale'],
    usageRoutes: ['cutanee', 'diffusion', 'inhalation', 'orale'],
    dilutionRecommended: '2-5% dans une huile végétale',
    precautions: ['Bien tolérée, peu de précautions'],
    contraindications: ['Femmes enceintes (3 premiers mois)'],
    compatibleProfiles: ['adulte', 'enfant_6_plus', 'senior'],
    incompatibleProfiles: ['femme_enceinte'],
    safetyLevel: 'safe',
    synergies: ['eucalyptus-radie', 'tea-tree', 'niaouli', 'citron'],
    searchKeywords: ['ravintsara', 'antiviral', 'grippe', 'immunite', 'hiver', 'prevention', 'fatigue', 'zona'],
    tags: ['antiviral', 'immunité', 'hiver', 'énergie'],
    sourceBook: 'Savoirs de Grand-Mère - Aromathérapie',
    sourceType: 'book',
    icon: '🍃',
    color: '#66BB6A',
  },

  // ============================================
  // MENTHE POIVRÉE (Mentha piperita)
  // ============================================
  {
    id: 'menthe-poivree',
    slug: 'menthe-poivree',
    name: 'Menthe poivrée',
    nameLatin: 'Mentha piperita',
    familyBotanical: 'Lamiacées',
    shortDescription: 'Rafraîchissante et tonifiante, efficace contre les maux de tête et les troubles digestifs.',
    longDescription: 'La menthe poivrée est une huile essentielle puissante, connue pour son effet rafraîchissant immédiat. Elle est particulièrement efficace contre les maux de tête, les nausées et pour stimuler la concentration.',
    mainProperties: ['Antalgique', 'Digestive', 'Rafraîchissante', 'Tonique mental'],
    therapeuticProperties: ['Antispasmodique', 'Anti-nauséeuse', 'Décongestionnante', 'Stimulante'],
    commonUses: ['Maux de tête', 'Migraine', 'Nausées', 'Digestion difficile', 'Fatigue mentale', 'Mal des transports'],
    usageRoutes: ['cutanee', 'inhalation', 'orale'],
    dilutionRecommended: '1-2% maximum (très puissante)',
    precautions: ['Ne pas utiliser sur grandes surfaces', 'Éviter le soir (stimulante)', 'Tenir éloigné des yeux'],
    contraindications: ['Enfants de moins de 6 ans', 'Femmes enceintes/allaitantes', 'Épilepsie', 'Hypertension'],
    compatibleProfiles: ['adulte'],
    incompatibleProfiles: ['femme_enceinte', 'femme_allaitante', 'enfant_3_plus', 'enfant_6_plus'],
    safetyLevel: 'caution',
    synergies: ['citron', 'lavande-vraie', 'eucalyptus-radie'],
    searchKeywords: ['menthe', 'poivree', 'mal de tete', 'migraine', 'nausee', 'digestion', 'concentration', 'fraicheur'],
    tags: ['digestion', 'maux de tête', 'énergie', 'concentration'],
    sourceBook: 'Savoirs de Grand-Mère - Aromathérapie',
    sourceType: 'book',
    icon: '🌱',
    color: '#4DB6AC',
  },

  // ============================================
  // CITRON (Citrus limon)
  // ============================================
  {
    id: 'citron',
    slug: 'citron',
    name: 'Citron',
    nameLatin: 'Citrus limon',
    familyBotanical: 'Rutacées',
    shortDescription: 'Purifiante et tonifiante, idéale pour assainir l\'air et stimuler l\'organisme.',
    longDescription: 'L\'huile essentielle de citron est appréciée pour ses propriétés assainissantes et son parfum frais. Elle stimule le système immunitaire, favorise la digestion et purifie l\'atmosphère.',
    mainProperties: ['Antiseptique', 'Tonique digestif', 'Assainissant', 'Stimulant immunitaire'],
    therapeuticProperties: ['Fluidifiant sanguin', 'Détoxifiant', 'Antibactérien aérien'],
    commonUses: ['Assainissement air', 'Digestion', 'Fatigue', 'Nausées', 'Concentration', 'Détox'],
    usageRoutes: ['diffusion', 'orale', 'cutanee'],
    dilutionRecommended: '1-2% dans une huile végétale',
    precautions: ['PHOTOSENSIBILISANT - Ne pas s\'exposer au soleil après application cutanée (8h)', 'Peut irriter les peaux sensibles'],
    contraindications: ['Application cutanée avant exposition solaire'],
    compatibleProfiles: ['adulte', 'enfant_6_plus', 'senior'],
    incompatibleProfiles: ['femme_enceinte'],
    safetyLevel: 'caution',
    synergies: ['tea-tree', 'eucalyptus-radie', 'menthe-poivree', 'ravintsara'],
    searchKeywords: ['citron', 'agrume', 'assainir', 'digestion', 'detox', 'energie', 'concentration', 'air pur'],
    tags: ['assainissant', 'digestion', 'énergie', 'agrumes'],
    sourceBook: 'Savoirs de Grand-Mère - Aromathérapie',
    sourceType: 'book',
    icon: '🍋',
    color: '#FFEB3B',
  },

  // ============================================
  // CAMOMILLE ROMAINE (Chamaemelum nobile)
  // ============================================
  {
    id: 'camomille-romaine',
    slug: 'camomille-romaine',
    name: 'Camomille romaine',
    nameLatin: 'Chamaemelum nobile',
    familyBotanical: 'Astéracées',
    shortDescription: 'Apaisante exceptionnelle, idéale pour le stress, l\'anxiété et les troubles du sommeil.',
    longDescription: 'La camomille romaine est l\'une des huiles les plus douces et apaisantes. Elle est particulièrement indiquée pour les états de stress, d\'anxiété et les troubles du sommeil, y compris chez les enfants.',
    mainProperties: ['Calmante puissante', 'Antispasmodique', 'Anti-inflammatoire', 'Sédative'],
    therapeuticProperties: ['Anxiolytique', 'Pré-anesthésiante', 'Antiprurigineuse'],
    commonUses: ['Stress', 'Anxiété', 'Insomnie', 'Chocs émotionnels', 'Coliques bébé', 'Démangeaisons'],
    usageRoutes: ['cutanee', 'diffusion', 'massage', 'orale'],
    dilutionRecommended: '1-2% dans une huile végétale',
    precautions: ['Huile précieuse et coûteuse', 'Allergie possible aux Astéracées'],
    contraindications: ['Allergie aux Astéracées (marguerite, arnica...)'],
    compatibleProfiles: ['adulte', 'enfant_3_plus', 'senior', 'tous'],
    incompatibleProfiles: [],
    safetyLevel: 'safe',
    synergies: ['lavande-vraie', 'ylang-ylang', 'orange-douce', 'petit-grain-bigarade'],
    searchKeywords: ['camomille', 'romaine', 'stress', 'anxiete', 'sommeil', 'calme', 'bebe', 'enfant', 'relaxation'],
    tags: ['relaxation', 'sommeil', 'enfants', 'stress'],
    sourceBook: 'Savoirs de Grand-Mère - Aromathérapie',
    sourceType: 'book',
    icon: '🌼',
    color: '#FFF59D',
  },

  // ============================================
  // GAULTHÉRIE COUCHÉE (Gaultheria procumbens)
  // ============================================
  {
    id: 'gaultherie',
    slug: 'gaultherie',
    name: 'Gaulthérie couchée',
    nameLatin: 'Gaultheria procumbens',
    familyBotanical: 'Éricacées',
    shortDescription: 'Anti-inflammatoire et antidouleur puissant pour les muscles et articulations.',
    longDescription: 'La gaulthérie est l\'huile essentielle de référence pour les douleurs musculaires et articulaires. Riche en salicylate de méthyle (proche de l\'aspirine), elle offre un effet anti-inflammatoire et antalgique remarquable.',
    mainProperties: ['Anti-inflammatoire', 'Antalgique', 'Antispasmodique', 'Chauffante'],
    therapeuticProperties: ['Rubéfiante', 'Vasodilatatrice', 'Décontractante musculaire'],
    commonUses: ['Douleurs musculaires', 'Tendinites', 'Arthrite', 'Courbatures', 'Crampes', 'Rhumatismes'],
    usageRoutes: ['cutanee', 'massage'],
    dilutionRecommended: '5-10% dans une huile végétale (jamais pure)',
    precautions: ['JAMAIS PURE sur la peau', 'Ne pas utiliser avant effort sportif', 'Odeur caractéristique'],
    contraindications: ['Allergie à l\'aspirine', 'Anticoagulants', 'Femmes enceintes/allaitantes', 'Enfants de moins de 6 ans'],
    compatibleProfiles: ['adulte'],
    incompatibleProfiles: ['femme_enceinte', 'femme_allaitante', 'enfant_3_plus', 'enfant_6_plus'],
    safetyLevel: 'restricted',
    synergies: ['eucalyptus-citronne', 'lavande-vraie', 'romarin-camphre'],
    searchKeywords: ['gaultherie', 'douleur', 'muscle', 'articulation', 'tendinite', 'sport', 'courbature', 'anti-inflammatoire'],
    tags: ['douleurs', 'sport', 'muscles', 'articulations'],
    sourceBook: 'Savoirs de Grand-Mère - Aromathérapie',
    sourceType: 'book',
    icon: '💪',
    color: '#EF5350',
  },

  // ============================================
  // YLANG-YLANG (Cananga odorata)
  // ============================================
  {
    id: 'ylang-ylang',
    slug: 'ylang-ylang',
    name: 'Ylang-ylang',
    nameLatin: 'Cananga odorata',
    familyBotanical: 'Annonacées',
    shortDescription: 'Relaxante et sensuelle, régule le rythme cardiaque et apaise les tensions.',
    longDescription: 'L\'ylang-ylang est une huile au parfum envoûtant, réputée pour ses propriétés relaxantes et aphrodisiaques. Elle aide à réguler le rythme cardiaque et à diminuer la tension artérielle.',
    mainProperties: ['Relaxante', 'Hypotensive', 'Antispasmodique', 'Tonique cutané'],
    therapeuticProperties: ['Calmante cardiaque', 'Aphrodisiaque', 'Séborrhégulatrice'],
    commonUses: ['Stress', 'Hypertension', 'Tachycardie', 'Cheveux', 'Peau grasse', 'Libido'],
    usageRoutes: ['diffusion', 'cutanee', 'massage', 'bain'],
    dilutionRecommended: '1-2% dans une huile végétale',
    precautions: ['Parfum puissant - utiliser avec parcimonie', 'Peut provoquer des maux de tête à forte dose'],
    contraindications: ['Hypotension'],
    compatibleProfiles: ['adulte', 'senior'],
    incompatibleProfiles: ['femme_enceinte'],
    safetyLevel: 'safe',
    synergies: ['lavande-vraie', 'orange-douce', 'petit-grain-bigarade'],
    searchKeywords: ['ylang', 'relaxation', 'stress', 'coeur', 'cheveux', 'sensuel', 'tension', 'hypertension'],
    tags: ['relaxation', 'coeur', 'beauté', 'sensualité'],
    sourceBook: 'Savoirs de Grand-Mère - Aromathérapie',
    sourceType: 'book',
    icon: '🌸',
    color: '#FFB74D',
  },

  // ============================================
  // ORANGE DOUCE (Citrus sinensis)
  // ============================================
  {
    id: 'orange-douce',
    slug: 'orange-douce',
    name: 'Orange douce',
    nameLatin: 'Citrus sinensis',
    familyBotanical: 'Rutacées',
    shortDescription: 'Apaisante et joyeuse, parfaite pour la relaxation et l\'ambiance positive.',
    longDescription: 'L\'orange douce est une huile essentielle douce et bien tolérée, appréciée pour son parfum réconfortant. Elle favorise la détente, le sommeil et crée une atmosphère chaleureuse.',
    mainProperties: ['Calmante', 'Sédative légère', 'Digestive', 'Antiseptique aérien'],
    therapeuticProperties: ['Anxiolytique douce', 'Carminative', 'Tonique digestif'],
    commonUses: ['Anxiété légère', 'Insomnie', 'Digestion', 'Ambiance', 'Enfants agités'],
    usageRoutes: ['diffusion', 'cutanee', 'massage', 'bain'],
    dilutionRecommended: '1-2% dans une huile végétale',
    precautions: ['PHOTOSENSIBILISANT - Éviter exposition solaire après application', 'Conservation limitée (oxydation)'],
    contraindications: ['Application cutanée avant exposition solaire'],
    compatibleProfiles: ['adulte', 'enfant_3_plus', 'senior', 'tous'],
    incompatibleProfiles: [],
    safetyLevel: 'safe',
    synergies: ['lavande-vraie', 'ylang-ylang', 'camomille-romaine', 'petit-grain-bigarade'],
    searchKeywords: ['orange', 'douce', 'relaxation', 'sommeil', 'enfant', 'ambiance', 'digestion', 'joie'],
    tags: ['relaxation', 'enfants', 'ambiance', 'agrumes'],
    sourceBook: 'Savoirs de Grand-Mère - Aromathérapie',
    sourceType: 'book',
    icon: '🍊',
    color: '#FF9800',
  },

  // ============================================
  // ROMARIN À CINÉOLE (Rosmarinus officinalis ct cinéole)
  // ============================================
  {
    id: 'romarin-cineole',
    slug: 'romarin-cineole',
    name: 'Romarin à cinéole',
    nameLatin: 'Rosmarinus officinalis ct cinéole',
    familyBotanical: 'Lamiacées',
    shortDescription: 'Tonifiant et expectorant, stimule la concentration et dégage les voies respiratoires.',
    longDescription: 'Le romarin à cinéole est un excellent tonique général et respiratoire. Il stimule la mémoire, la concentration et aide à dégager les voies respiratoires en cas de congestion.',
    mainProperties: ['Expectorant', 'Tonique', 'Mucolytique', 'Stimulant mental'],
    therapeuticProperties: ['Antibactérien', 'Antifongique', 'Énergisant'],
    commonUses: ['Fatigue', 'Concentration', 'Bronchite', 'Sinusite', 'Cheveux', 'Mémoire'],
    usageRoutes: ['diffusion', 'inhalation', 'cutanee', 'massage'],
    dilutionRecommended: '2-3% dans une huile végétale',
    precautions: ['Éviter le soir (stimulant)', 'Ne pas utiliser en cas d\'hypertension'],
    contraindications: ['Épilepsie', 'Hypertension', 'Femmes enceintes/allaitantes', 'Enfants de moins de 6 ans'],
    compatibleProfiles: ['adulte', 'senior'],
    incompatibleProfiles: ['femme_enceinte', 'femme_allaitante', 'enfant_3_plus', 'enfant_6_plus'],
    safetyLevel: 'caution',
    synergies: ['eucalyptus-radie', 'menthe-poivree', 'citron', 'pin-sylvestre'],
    searchKeywords: ['romarin', 'concentration', 'memoire', 'fatigue', 'respiration', 'cheveux', 'tonique'],
    tags: ['concentration', 'respiration', 'énergie', 'cheveux'],
    sourceBook: 'Savoirs de Grand-Mère - Aromathérapie',
    sourceType: 'book',
    icon: '🌿',
    color: '#81C784',
  },

  // ============================================
  // HÉLICHRYSE ITALIENNE (Helichrysum italicum)
  // ============================================
  {
    id: 'helichryse',
    slug: 'helichryse',
    name: 'Hélichryse italienne',
    nameLatin: 'Helichrysum italicum',
    familyBotanical: 'Astéracées',
    shortDescription: 'L\'huile anti-hématome par excellence, cicatrisante et anti-inflammatoire.',
    longDescription: 'L\'hélichryse italienne, aussi appelée Immortelle, est l\'huile la plus efficace contre les hématomes et les problèmes circulatoires. Elle est également remarquable pour la cicatrisation et les soins anti-âge.',
    mainProperties: ['Anti-hématome', 'Cicatrisante', 'Anti-inflammatoire', 'Circulatoire'],
    therapeuticProperties: ['Anticoagulante', 'Régénérante cutanée', 'Antiphlébitique'],
    commonUses: ['Bleus', 'Hématomes', 'Couperose', 'Cicatrices', 'Vergetures', 'Rides'],
    usageRoutes: ['cutanee', 'massage'],
    dilutionRecommended: '2-5% dans une huile végétale (huile précieuse)',
    precautions: ['Huile très précieuse et coûteuse', 'Utiliser avec parcimonie'],
    contraindications: ['Traitement anticoagulant', 'Femmes enceintes/allaitantes'],
    compatibleProfiles: ['adulte', 'enfant_6_plus', 'senior'],
    incompatibleProfiles: ['femme_enceinte', 'femme_allaitante'],
    safetyLevel: 'caution',
    synergies: ['lavande-vraie', 'geranium-rosat', 'rose-damas'],
    searchKeywords: ['helichryse', 'immortelle', 'bleu', 'hematome', 'cicatrice', 'couperose', 'anti-age', 'circulation'],
    tags: ['cicatrisation', 'circulation', 'anti-âge', 'peau'],
    sourceBook: 'Savoirs de Grand-Mère - Aromathérapie',
    sourceType: 'book',
    icon: '✨',
    color: '#FFD54F',
  },

  // ============================================
  // NIAOULI (Melaleuca quinquenervia)
  // ============================================
  {
    id: 'niaouli',
    slug: 'niaouli',
    name: 'Niaouli',
    nameLatin: 'Melaleuca quinquenervia ct cinéole',
    familyBotanical: 'Myrtacées',
    shortDescription: 'Puissant anti-infectieux respiratoire, protecteur cutané lors des traitements.',
    longDescription: 'Le niaouli est une huile essentielle majeure pour les infections respiratoires et la protection de la peau. Elle est particulièrement utilisée pour protéger la peau lors des séances de radiothérapie.',
    mainProperties: ['Antiviral', 'Antibactérien', 'Expectorant', 'Radioprotecteur'],
    therapeuticProperties: ['Immunostimulant', 'Décongestionnant veineux', 'Cicatrisant'],
    commonUses: ['Infections ORL', 'Bronchite', 'Sinusite', 'Herpès', 'Protection radiothérapie', 'Jambes lourdes'],
    usageRoutes: ['cutanee', 'diffusion', 'inhalation'],
    dilutionRecommended: '2-5% dans une huile végétale',
    precautions: ['Bien tolérée', 'Éviter chez les personnes avec antécédents de cancers hormono-dépendants'],
    contraindications: ['Cancers hormono-dépendants (sein, utérus, ovaires)', 'Femmes enceintes (3 premiers mois)'],
    compatibleProfiles: ['adulte', 'enfant_6_plus', 'senior'],
    incompatibleProfiles: ['femme_enceinte'],
    safetyLevel: 'caution',
    synergies: ['eucalyptus-radie', 'ravintsara', 'tea-tree'],
    searchKeywords: ['niaouli', 'respiration', 'infection', 'herpes', 'radiotherapie', 'bronchite', 'sinusite'],
    tags: ['respiration', 'immunité', 'peau', 'infections'],
    sourceBook: 'Savoirs de Grand-Mère - Aromathérapie',
    sourceType: 'book',
    icon: '🌲',
    color: '#4DD0E1',
  },

  // ============================================
  // GÉRANIUM ROSAT (Pelargonium graveolens)
  // ============================================
  {
    id: 'geranium-rosat',
    slug: 'geranium-rosat',
    name: 'Géranium rosat',
    nameLatin: 'Pelargonium graveolens',
    familyBotanical: 'Géraniacées',
    shortDescription: 'Équilibrant cutané et hormonal, anti-infectieux et cicatrisant.',
    longDescription: 'Le géranium rosat est une huile polyvalente, particulièrement appréciée pour les soins de la peau. Elle régule le sébum, cicatrise et possède des propriétés anti-infectieuses et répulsives contre les moustiques.',
    mainProperties: ['Cicatrisant', 'Antibactérien', 'Antifongique', 'Hémostatique'],
    therapeuticProperties: ['Tonique cutané', 'Anti-inflammatoire', 'Répulsif insectes', 'Équilibrant hormonal'],
    commonUses: ['Soins peau', 'Acné', 'Eczéma', 'Mycoses', 'Vergetures', 'Anti-moustiques'],
    usageRoutes: ['cutanee', 'massage', 'diffusion', 'bain'],
    dilutionRecommended: '2-3% dans une huile végétale',
    precautions: ['Peut être sensibilisant chez certaines personnes', 'Test cutané recommandé'],
    contraindications: ['Femmes enceintes (3 premiers mois)', 'Cancers hormono-dépendants'],
    compatibleProfiles: ['adulte', 'enfant_6_plus', 'senior'],
    incompatibleProfiles: ['femme_enceinte'],
    safetyLevel: 'safe',
    synergies: ['lavande-vraie', 'ylang-ylang', 'rose-damas', 'palmarosa'],
    searchKeywords: ['geranium', 'rosat', 'peau', 'cicatrice', 'acne', 'moustique', 'eczema', 'beaute'],
    tags: ['peau', 'beauté', 'cicatrisation', 'anti-moustiques'],
    sourceBook: 'Savoirs de Grand-Mère - Aromathérapie',
    sourceType: 'book',
    icon: '🌺',
    color: '#F48FB1',
  },

  // ============================================
  // PETIT GRAIN BIGARADE (Citrus aurantium)
  // ============================================
  {
    id: 'petit-grain-bigarade',
    slug: 'petit-grain-bigarade',
    name: 'Petit grain bigarade',
    nameLatin: 'Citrus aurantium (feuilles)',
    familyBotanical: 'Rutacées',
    shortDescription: 'Rééquilibrant nerveux, idéal pour le stress, l\'anxiété et les troubles du sommeil.',
    longDescription: 'Le petit grain bigarade est extrait des feuilles de l\'oranger amer. C\'est un excellent rééquilibrant du système nerveux, apaisant sans être sédatif, parfait pour gérer le stress au quotidien.',
    mainProperties: ['Rééquilibrant nerveux', 'Antispasmodique', 'Anti-inflammatoire', 'Cicatrisant'],
    therapeuticProperties: ['Sédatif léger', 'Régulateur cardiaque', 'Antibactérien'],
    commonUses: ['Stress', 'Anxiété', 'Insomnie', 'Palpitations', 'Acné', 'Transpiration excessive'],
    usageRoutes: ['diffusion', 'cutanee', 'massage', 'bain'],
    dilutionRecommended: '2-3% dans une huile végétale',
    precautions: ['Très bien tolérée', 'Légèrement photosensibilisant'],
    contraindications: [],
    compatibleProfiles: ['adulte', 'enfant_3_plus', 'senior', 'tous'],
    incompatibleProfiles: [],
    safetyLevel: 'safe',
    synergies: ['lavande-vraie', 'ylang-ylang', 'orange-douce', 'camomille-romaine'],
    searchKeywords: ['petit grain', 'bigarade', 'stress', 'anxiete', 'sommeil', 'nerfs', 'relaxation', 'equilibre'],
    tags: ['relaxation', 'stress', 'sommeil', 'équilibre'],
    sourceBook: 'Savoirs de Grand-Mère - Aromathérapie',
    sourceType: 'book',
    icon: '🍃',
    color: '#AED581',
  },
];

// ============================================
// FONCTIONS D'ACCÈS AUX DONNÉES
// ============================================

/**
 * Récupère toutes les huiles essentielles
 */
export function getAllEssentialOils(): EssentialOil[] {
  return ESSENTIAL_OILS;
}

/**
 * Récupère une huile essentielle par son ID
 */
export function getEssentialOilById(id: string): EssentialOil | undefined {
  return ESSENTIAL_OILS.find(oil => oil.id === id);
}

/**
 * Récupère une huile essentielle par son slug
 */
export function getEssentialOilBySlug(slug: string): EssentialOil | undefined {
  return ESSENTIAL_OILS.find(oil => oil.slug === slug);
}

/**
 * Recherche des huiles essentielles par mot-clé
 */
export function searchEssentialOils(query: string): EssentialOil[] {
  const normalizedQuery = query.toLowerCase().trim();
  
  if (!normalizedQuery) return [];
  
  return ESSENTIAL_OILS.filter(oil => {
    // Recherche dans le nom
    if (oil.name.toLowerCase().includes(normalizedQuery)) return true;
    if (oil.nameLatin?.toLowerCase().includes(normalizedQuery)) return true;
    
    // Recherche dans les mots-clés
    if (oil.searchKeywords.some(kw => kw.includes(normalizedQuery))) return true;
    
    // Recherche dans les tags
    if (oil.tags.some(tag => tag.includes(normalizedQuery))) return true;
    
    // Recherche dans les usages
    if (oil.commonUses.some(use => use.toLowerCase().includes(normalizedQuery))) return true;
    
    // Recherche dans les propriétés
    if (oil.mainProperties.some(prop => prop.toLowerCase().includes(normalizedQuery))) return true;
    
    return false;
  });
}

/**
 * Récupère les huiles essentielles par catégorie d'usage
 */
export function getEssentialOilsByCategory(category: string): EssentialOil[] {
  const normalizedCategory = category.toLowerCase();
  
  return ESSENTIAL_OILS.filter(oil => 
    oil.tags.includes(normalizedCategory) ||
    oil.commonUses.some(use => use.toLowerCase().includes(normalizedCategory))
  );
}

/**
 * Récupère les huiles essentielles compatibles avec un profil
 */
export function getEssentialOilsForProfile(profile: string): EssentialOil[] {
  return ESSENTIAL_OILS.filter(oil => 
    oil.compatibleProfiles.includes(profile as any) ||
    oil.compatibleProfiles.includes('tous')
  );
}

/**
 * Récupère les huiles essentielles sûres (niveau safe)
 */
export function getSafeEssentialOils(): EssentialOil[] {
  return ESSENTIAL_OILS.filter(oil => oil.safetyLevel === 'safe');
}

/**
 * Récupère les catégories avec le nombre d'huiles
 */
export function getCategoriesWithCounts(): EssentialOilCategoryInfo[] {
  return ESSENTIAL_OIL_CATEGORIES.map(cat => ({
    ...cat,
    oilCount: ESSENTIAL_OILS.filter(oil => 
      oil.tags.includes(cat.id) || 
      oil.commonUses.some(use => use.toLowerCase().includes(cat.id))
    ).length,
  }));
}
