// ============================================
// REMÈDES AROMATHÉRAPIE
// Protocoles d'utilisation des huiles essentielles
// ============================================

import { EssentialOilRemedy, EssentialOilCategory } from '../types';

// ============================================
// BASE DE DONNÉES DES REMÈDES AROMATHÉRAPIE
// ============================================

export const ESSENTIAL_OIL_REMEDIES: EssentialOilRemedy[] = [
  // ============================================
  // RESPIRATION
  // ============================================
  {
    id: 'rhume-inhalation',
    slug: 'rhume-inhalation',
    title: 'Inhalation anti-rhume',
    symptomTargets: ['Rhume', 'Nez bouché', 'Congestion nasale', 'Écoulement nasal'],
    bodyZones: ['nez', 'sinus', 'gorge'],
    category: 'respiration',
    summary: 'Inhalation décongestionnante pour dégager les voies respiratoires en cas de rhume. Associe eucalyptus radié et ravintsara pour une action antivirale et expectorante.',
    essentialOilIds: ['eucalyptus-radie', 'ravintsara'],
    routeOfUse: ['inhalation'],
    preparation: 'Verser 2 gouttes d\'eucalyptus radié et 2 gouttes de ravintsara dans un bol d\'eau chaude (non bouillante). Se pencher au-dessus, tête couverte d\'une serviette, et inhaler les vapeurs pendant 5-10 minutes.',
    dosage: '2-3 fois par jour',
    duration: '5-7 jours maximum',
    precautions: ['Ne pas utiliser chez les asthmatiques', 'Fermer les yeux pendant l\'inhalation', 'Eau chaude mais pas bouillante'],
    contraindications: ['Asthme', 'Épilepsie', 'Enfants de moins de 6 ans', 'Femmes enceintes'],
    profileCompatibility: ['adulte', 'senior'],
    safetyLevel: 'caution',
    searchKeywords: ['rhume', 'nez bouche', 'congestion', 'inhalation', 'eucalyptus', 'ravintsara', 'hiver'],
    tags: ['respiration', 'hiver', 'rhume', 'inhalation'],
    sourceBook: 'Guide Aromathérapie',
    sourceType: 'book',
  },
  {
    id: 'sinusite-massage',
    slug: 'sinusite-massage',
    title: 'Massage sinus dégagés',
    symptomTargets: ['Sinusite', 'Sinus bouchés', 'Douleur sinus', 'Pression faciale'],
    bodyZones: ['sinus', 'front', 'nez'],
    category: 'respiration',
    summary: 'Massage local pour soulager la sinusite et dégager les sinus. L\'eucalyptus radié et la menthe poivrée offrent un effet décongestionnant et rafraîchissant.',
    essentialOilIds: ['eucalyptus-radie', 'menthe-poivree'],
    routeOfUse: ['cutanee', 'massage'],
    preparation: 'Mélanger 1 goutte d\'eucalyptus radié et 1 goutte de menthe poivrée dans 1 cuillère à café d\'huile végétale. Masser délicatement les ailes du nez, le front et les tempes.',
    dosage: '2-3 fois par jour',
    duration: '5-7 jours',
    precautions: ['Éviter le contour des yeux', 'Ne pas utiliser avant de dormir (menthe stimulante)'],
    contraindications: ['Enfants de moins de 6 ans', 'Femmes enceintes/allaitantes', 'Épilepsie'],
    profileCompatibility: ['adulte'],
    safetyLevel: 'caution',
    searchKeywords: ['sinusite', 'sinus', 'massage', 'eucalyptus', 'menthe', 'decongestionnant'],
    tags: ['respiration', 'sinusite', 'massage'],
    sourceBook: 'Guide Aromathérapie',
    sourceType: 'book',
  },
  {
    id: 'toux-grasse-friction',
    slug: 'toux-grasse-friction',
    title: 'Friction pectorale toux grasse',
    symptomTargets: ['Toux grasse', 'Bronchite', 'Encombrement bronchique', 'Mucosités'],
    bodyZones: ['thorax', 'dos', 'bronches'],
    category: 'respiration',
    summary: 'Friction expectorante pour faciliter l\'évacuation des mucosités en cas de toux grasse ou bronchite. Le ravintsara et l\'eucalyptus radié fluidifient les sécrétions.',
    essentialOilIds: ['ravintsara', 'eucalyptus-radie', 'niaouli'],
    routeOfUse: ['cutanee', 'massage'],
    preparation: 'Mélanger 2 gouttes de ravintsara, 2 gouttes d\'eucalyptus radié et 1 goutte de niaouli dans 1 cuillère à soupe d\'huile végétale. Masser le thorax et le haut du dos.',
    dosage: '3 fois par jour',
    duration: '7-10 jours',
    precautions: ['Éviter chez les asthmatiques', 'Ne pas appliquer sur peau lésée'],
    contraindications: ['Asthme', 'Enfants de moins de 6 ans', 'Femmes enceintes'],
    profileCompatibility: ['adulte', 'enfant_6_plus', 'senior'],
    safetyLevel: 'caution',
    searchKeywords: ['toux', 'grasse', 'bronchite', 'expectorant', 'friction', 'thorax'],
    tags: ['respiration', 'toux', 'bronchite'],
    sourceBook: 'Guide Aromathérapie',
    sourceType: 'book',
  },

  // ============================================
  // STRESS & SOMMEIL
  // ============================================
  {
    id: 'stress-diffusion',
    slug: 'stress-diffusion',
    title: 'Diffusion anti-stress',
    symptomTargets: ['Stress', 'Anxiété', 'Nervosité', 'Tension nerveuse'],
    bodyZones: [],
    category: 'stress',
    summary: 'Diffusion apaisante pour créer une atmosphère relaxante et réduire le stress. La lavande et l\'orange douce forment un duo efficace et agréable.',
    essentialOilIds: ['lavande-vraie', 'orange-douce'],
    routeOfUse: ['diffusion'],
    preparation: 'Verser 3 gouttes de lavande vraie et 3 gouttes d\'orange douce dans un diffuseur. Diffuser 15-20 minutes dans la pièce.',
    dosage: '2-3 fois par jour',
    duration: 'Selon besoin',
    precautions: ['Aérer la pièce après diffusion', 'Ne pas diffuser en continu'],
    contraindications: [],
    profileCompatibility: ['adulte', 'enfant_3_plus', 'senior', 'tous'],
    safetyLevel: 'safe',
    searchKeywords: ['stress', 'anxiete', 'relaxation', 'diffusion', 'lavande', 'orange', 'calme'],
    tags: ['stress', 'relaxation', 'diffusion', 'ambiance'],
    sourceBook: 'Guide Aromathérapie',
    sourceType: 'book',
  },
  {
    id: 'insomnie-massage',
    slug: 'insomnie-massage',
    title: 'Massage sommeil réparateur',
    symptomTargets: ['Insomnie', 'Difficultés d\'endormissement', 'Sommeil agité', 'Réveils nocturnes'],
    bodyZones: ['plexus solaire', 'poignets', 'plante des pieds'],
    category: 'sommeil',
    summary: 'Massage relaxant avant le coucher pour favoriser l\'endormissement. La camomille romaine et le petit grain bigarade apaisent le système nerveux.',
    essentialOilIds: ['camomille-romaine', 'petit-grain-bigarade', 'lavande-vraie'],
    routeOfUse: ['cutanee', 'massage'],
    preparation: 'Mélanger 1 goutte de camomille romaine, 2 gouttes de petit grain bigarade et 2 gouttes de lavande vraie dans 1 cuillère à soupe d\'huile végétale. Masser le plexus solaire, les poignets et la plante des pieds.',
    dosage: '1 fois le soir, 30 minutes avant le coucher',
    duration: 'Selon besoin',
    precautions: ['Allergie possible aux Astéracées (camomille)'],
    contraindications: ['Allergie aux Astéracées'],
    profileCompatibility: ['adulte', 'enfant_3_plus', 'senior', 'tous'],
    safetyLevel: 'safe',
    searchKeywords: ['insomnie', 'sommeil', 'endormissement', 'massage', 'camomille', 'lavande', 'nuit'],
    tags: ['sommeil', 'relaxation', 'massage'],
    sourceBook: 'Guide Aromathérapie',
    sourceType: 'book',
  },
  {
    id: 'anxiete-roll-on',
    slug: 'anxiete-roll-on',
    title: 'Roll-on anti-anxiété',
    symptomTargets: ['Anxiété', 'Crise d\'angoisse', 'Panique', 'Stress aigu'],
    bodyZones: ['poignets', 'tempes', 'plexus solaire'],
    category: 'stress',
    summary: 'Application locale rapide pour calmer une crise d\'anxiété ou un moment de stress intense. Le petit grain bigarade et l\'ylang-ylang rééquilibrent le système nerveux.',
    essentialOilIds: ['petit-grain-bigarade', 'ylang-ylang', 'lavande-vraie'],
    routeOfUse: ['cutanee'],
    preparation: 'Dans un flacon roll-on de 10ml, mélanger 5 gouttes de petit grain bigarade, 3 gouttes d\'ylang-ylang, 5 gouttes de lavande vraie et compléter avec de l\'huile végétale de jojoba.',
    dosage: 'Appliquer sur les poignets et respirer profondément, selon besoin',
    duration: 'Selon besoin',
    precautions: ['Ne pas utiliser en cas d\'hypotension (ylang-ylang)'],
    contraindications: ['Hypotension'],
    profileCompatibility: ['adulte', 'senior'],
    safetyLevel: 'safe',
    searchKeywords: ['anxiete', 'angoisse', 'panique', 'roll-on', 'stress', 'calme', 'urgence'],
    tags: ['stress', 'anxiété', 'roll-on', 'urgence'],
    sourceBook: 'Guide Aromathérapie',
    sourceType: 'book',
  },

  // ============================================
  // DOULEURS
  // ============================================
  {
    id: 'douleurs-musculaires-massage',
    slug: 'douleurs-musculaires-massage',
    title: 'Massage muscles douloureux',
    symptomTargets: ['Douleurs musculaires', 'Courbatures', 'Contractures', 'Fatigue musculaire'],
    bodyZones: ['muscles', 'dos', 'jambes', 'épaules'],
    category: 'douleurs',
    summary: 'Massage décontractant et anti-inflammatoire pour soulager les douleurs musculaires. La gaulthérie et la lavande offrent un effet antalgique puissant.',
    essentialOilIds: ['gaultherie', 'lavande-vraie'],
    routeOfUse: ['cutanee', 'massage'],
    preparation: 'Mélanger 3 gouttes de gaulthérie et 3 gouttes de lavande vraie dans 2 cuillères à soupe d\'huile végétale d\'arnica. Masser les zones douloureuses.',
    dosage: '2-3 fois par jour',
    duration: '3-5 jours',
    precautions: ['Ne jamais utiliser la gaulthérie pure', 'Ne pas appliquer sur peau lésée', 'Ne pas utiliser avant effort sportif'],
    contraindications: ['Allergie à l\'aspirine', 'Anticoagulants', 'Femmes enceintes/allaitantes', 'Enfants de moins de 6 ans'],
    profileCompatibility: ['adulte'],
    safetyLevel: 'restricted',
    searchKeywords: ['douleur', 'muscle', 'courbature', 'massage', 'gaultherie', 'sport', 'contracture'],
    tags: ['douleurs', 'muscles', 'sport', 'massage'],
    sourceBook: 'Guide Aromathérapie',
    sourceType: 'book',
  },
  {
    id: 'mal-de-tete-application',
    slug: 'mal-de-tete-application',
    title: 'Application maux de tête',
    symptomTargets: ['Maux de tête', 'Céphalées', 'Migraine légère', 'Tension crânienne'],
    bodyZones: ['tempes', 'front', 'nuque'],
    category: 'douleurs',
    summary: 'Application locale rafraîchissante pour soulager les maux de tête. La menthe poivrée offre un effet antalgique et rafraîchissant immédiat.',
    essentialOilIds: ['menthe-poivree', 'lavande-vraie'],
    routeOfUse: ['cutanee'],
    preparation: 'Mélanger 1 goutte de menthe poivrée et 1 goutte de lavande vraie dans quelques gouttes d\'huile végétale. Appliquer sur les tempes et la nuque en massant délicatement.',
    dosage: 'Renouveler toutes les 30 minutes si nécessaire (max 3 fois)',
    duration: 'Ponctuel',
    precautions: ['Éviter le contour des yeux', 'Ne pas utiliser en cas de migraine avec aura'],
    contraindications: ['Enfants de moins de 6 ans', 'Femmes enceintes/allaitantes', 'Épilepsie'],
    profileCompatibility: ['adulte'],
    safetyLevel: 'caution',
    searchKeywords: ['mal de tete', 'cephalee', 'migraine', 'menthe', 'tempes', 'douleur'],
    tags: ['douleurs', 'maux de tête', 'menthe'],
    sourceBook: 'Guide Aromathérapie',
    sourceType: 'book',
  },

  // ============================================
  // DIGESTION
  // ============================================
  {
    id: 'digestion-difficile-massage',
    slug: 'digestion-difficile-massage',
    title: 'Massage digestif',
    symptomTargets: ['Digestion difficile', 'Ballonnements', 'Lourdeur', 'Inconfort digestif'],
    bodyZones: ['ventre', 'abdomen'],
    category: 'digestion',
    summary: 'Massage abdominal pour faciliter la digestion et soulager les ballonnements. La menthe poivrée et le citron stimulent les fonctions digestives.',
    essentialOilIds: ['menthe-poivree', 'citron'],
    routeOfUse: ['cutanee', 'massage'],
    preparation: 'Mélanger 1 goutte de menthe poivrée et 2 gouttes de citron dans 1 cuillère à soupe d\'huile végétale. Masser le ventre dans le sens des aiguilles d\'une montre.',
    dosage: 'Après les repas, selon besoin',
    duration: 'Ponctuel',
    precautions: ['Ne pas s\'exposer au soleil après application (citron photosensibilisant)'],
    contraindications: ['Enfants de moins de 6 ans', 'Femmes enceintes/allaitantes'],
    profileCompatibility: ['adulte'],
    safetyLevel: 'caution',
    searchKeywords: ['digestion', 'ballonnement', 'ventre', 'massage', 'menthe', 'citron'],
    tags: ['digestion', 'massage', 'ventre'],
    sourceBook: 'Guide Aromathérapie',
    sourceType: 'book',
  },
  {
    id: 'nausees-inhalation',
    slug: 'nausees-inhalation',
    title: 'Inhalation anti-nausées',
    symptomTargets: ['Nausées', 'Mal des transports', 'Envie de vomir', 'Malaise'],
    bodyZones: [],
    category: 'digestion',
    summary: 'Inhalation rapide pour calmer les nausées et le mal des transports. La menthe poivrée et le citron offrent un soulagement immédiat.',
    essentialOilIds: ['menthe-poivree', 'citron'],
    routeOfUse: ['inhalation'],
    preparation: 'Déposer 1 goutte de menthe poivrée sur un mouchoir et respirer profondément. Alternative : 1 goutte de citron.',
    dosage: 'Selon besoin',
    duration: 'Ponctuel',
    precautions: ['Ne pas utiliser chez les enfants de moins de 6 ans'],
    contraindications: ['Enfants de moins de 6 ans', 'Femmes enceintes'],
    profileCompatibility: ['adulte', 'enfant_6_plus'],
    safetyLevel: 'caution',
    searchKeywords: ['nausee', 'vomissement', 'mal des transports', 'menthe', 'citron', 'voyage'],
    tags: ['digestion', 'nausées', 'voyage'],
    sourceBook: 'Guide Aromathérapie',
    sourceType: 'book',
  },

  // ============================================
  // PEAU
  // ============================================
  {
    id: 'acne-application',
    slug: 'acne-application',
    title: 'Soin anti-acné',
    symptomTargets: ['Acné', 'Boutons', 'Peau grasse', 'Imperfections'],
    bodyZones: ['visage'],
    category: 'peau',
    summary: 'Application locale pour traiter les boutons d\'acné. Le tea tree et la lavande assainissent et cicatrisent la peau.',
    essentialOilIds: ['tea-tree', 'lavande-vraie', 'geranium-rosat'],
    routeOfUse: ['cutanee'],
    preparation: 'Appliquer 1 goutte pure de tea tree directement sur le bouton avec un coton-tige. Pour le visage entier : mélanger 2 gouttes de tea tree, 2 gouttes de lavande et 1 goutte de géranium dans 1 cuillère à soupe d\'huile de jojoba.',
    dosage: '1-2 fois par jour',
    duration: 'Jusqu\'à amélioration',
    precautions: ['Test cutané recommandé', 'Ne pas appliquer sur tout le visage sans dilution'],
    contraindications: ['Peau très sensible'],
    profileCompatibility: ['adulte', 'enfant_6_plus'],
    safetyLevel: 'safe',
    searchKeywords: ['acne', 'bouton', 'peau', 'tea tree', 'lavande', 'visage', 'imperfection'],
    tags: ['peau', 'acné', 'beauté'],
    sourceBook: 'Guide Aromathérapie',
    sourceType: 'book',
  },
  {
    id: 'cicatrice-soin',
    slug: 'cicatrice-soin',
    title: 'Soin cicatrisant',
    symptomTargets: ['Cicatrices', 'Plaies', 'Coupures', 'Égratignures'],
    bodyZones: ['peau'],
    category: 'peau',
    summary: 'Soin régénérant pour favoriser la cicatrisation. La lavande et l\'hélichryse accélèrent la réparation cutanée.',
    essentialOilIds: ['lavande-vraie', 'helichryse', 'geranium-rosat'],
    routeOfUse: ['cutanee'],
    preparation: 'Mélanger 2 gouttes de lavande vraie, 1 goutte d\'hélichryse et 1 goutte de géranium rosat dans 1 cuillère à café d\'huile de rose musquée. Appliquer sur la cicatrice 2 fois par jour.',
    dosage: '2 fois par jour',
    duration: 'Plusieurs semaines',
    precautions: ['Ne pas appliquer sur plaie ouverte', 'Attendre la fermeture de la plaie'],
    contraindications: ['Traitement anticoagulant (hélichryse)'],
    profileCompatibility: ['adulte', 'enfant_6_plus', 'senior'],
    safetyLevel: 'safe',
    searchKeywords: ['cicatrice', 'plaie', 'coupure', 'cicatrisation', 'lavande', 'helichryse', 'peau'],
    tags: ['peau', 'cicatrisation', 'régénération'],
    sourceBook: 'Guide Aromathérapie',
    sourceType: 'book',
  },
  {
    id: 'hematome-application',
    slug: 'hematome-application',
    title: 'Soin anti-hématome',
    symptomTargets: ['Hématome', 'Bleu', 'Ecchymose', 'Coup'],
    bodyZones: ['peau'],
    category: 'peau',
    summary: 'Application pour résorber rapidement les hématomes. L\'hélichryse italienne est l\'huile de référence pour les bleus.',
    essentialOilIds: ['helichryse'],
    routeOfUse: ['cutanee'],
    preparation: 'Appliquer 2 gouttes d\'hélichryse italienne pure directement sur l\'hématome. Masser délicatement.',
    dosage: '3-4 fois par jour',
    duration: '3-5 jours',
    precautions: ['Huile précieuse, utiliser avec parcimonie', 'Ne pas appliquer sur plaie ouverte'],
    contraindications: ['Traitement anticoagulant', 'Femmes enceintes/allaitantes'],
    profileCompatibility: ['adulte', 'enfant_6_plus', 'senior'],
    safetyLevel: 'caution',
    searchKeywords: ['hematome', 'bleu', 'coup', 'ecchymose', 'helichryse', 'immortelle'],
    tags: ['peau', 'hématome', 'urgence'],
    sourceBook: 'Guide Aromathérapie',
    sourceType: 'book',
  },

  // ============================================
  // IMMUNITÉ
  // ============================================
  {
    id: 'prevention-hiver-diffusion',
    slug: 'prevention-hiver-diffusion',
    title: 'Diffusion prévention hivernale',
    symptomTargets: ['Prévention', 'Immunité', 'Période hivernale', 'Épidémies'],
    bodyZones: [],
    category: 'immunite',
    summary: 'Diffusion assainissante pour renforcer l\'immunité et prévenir les infections hivernales. Le ravintsara et le citron purifient l\'air et stimulent les défenses.',
    essentialOilIds: ['ravintsara', 'citron', 'eucalyptus-radie'],
    routeOfUse: ['diffusion'],
    preparation: 'Mélanger 3 gouttes de ravintsara, 3 gouttes de citron et 2 gouttes d\'eucalyptus radié dans un diffuseur. Diffuser 15-20 minutes, 2-3 fois par jour.',
    dosage: '2-3 fois par jour',
    duration: 'Tout l\'hiver',
    precautions: ['Aérer régulièrement', 'Ne pas diffuser en présence d\'asthmatiques'],
    contraindications: ['Asthme'],
    profileCompatibility: ['adulte', 'enfant_6_plus', 'senior'],
    safetyLevel: 'safe',
    searchKeywords: ['prevention', 'hiver', 'immunite', 'diffusion', 'ravintsara', 'citron', 'assainir'],
    tags: ['immunité', 'prévention', 'hiver', 'diffusion'],
    sourceBook: 'Guide Aromathérapie',
    sourceType: 'book',
  },
  {
    id: 'boost-immunite-massage',
    slug: 'boost-immunite-massage',
    title: 'Massage boost immunité',
    symptomTargets: ['Fatigue', 'Baisse d\'immunité', 'Convalescence', 'Faiblesse'],
    bodyZones: ['dos', 'thorax', 'plante des pieds'],
    category: 'immunite',
    summary: 'Massage stimulant pour renforcer les défenses immunitaires. Le ravintsara et le tea tree sont de puissants immunostimulants.',
    essentialOilIds: ['ravintsara', 'tea-tree', 'citron'],
    routeOfUse: ['cutanee', 'massage'],
    preparation: 'Mélanger 3 gouttes de ravintsara, 2 gouttes de tea tree et 2 gouttes de citron dans 2 cuillères à soupe d\'huile végétale. Masser le dos, le thorax et la plante des pieds.',
    dosage: '1 fois par jour le matin',
    duration: '1-2 semaines',
    precautions: ['Ne pas s\'exposer au soleil après application (citron)'],
    contraindications: ['Femmes enceintes', 'Enfants de moins de 6 ans'],
    profileCompatibility: ['adulte', 'enfant_6_plus', 'senior'],
    safetyLevel: 'caution',
    searchKeywords: ['immunite', 'defense', 'fatigue', 'massage', 'ravintsara', 'tea tree', 'boost'],
    tags: ['immunité', 'énergie', 'massage'],
    sourceBook: 'Guide Aromathérapie',
    sourceType: 'book',
  },

  // ============================================
  // ÉNERGIE
  // ============================================
  {
    id: 'fatigue-inhalation',
    slug: 'fatigue-inhalation',
    title: 'Inhalation coup de boost',
    symptomTargets: ['Fatigue', 'Manque d\'énergie', 'Somnolence', 'Baisse de concentration'],
    bodyZones: [],
    category: 'energie',
    summary: 'Inhalation tonifiante pour retrouver rapidement de l\'énergie. La menthe poivrée et le romarin stimulent l\'esprit et le corps.',
    essentialOilIds: ['menthe-poivree', 'romarin-cineole', 'citron'],
    routeOfUse: ['inhalation'],
    preparation: 'Déposer 1 goutte de menthe poivrée et 1 goutte de romarin à cinéole sur un mouchoir. Respirer profondément plusieurs fois.',
    dosage: 'Selon besoin, éviter le soir',
    duration: 'Ponctuel',
    precautions: ['Éviter le soir (stimulant)', 'Ne pas utiliser en cas d\'hypertension'],
    contraindications: ['Hypertension', 'Épilepsie', 'Enfants de moins de 6 ans', 'Femmes enceintes'],
    profileCompatibility: ['adulte'],
    safetyLevel: 'caution',
    searchKeywords: ['fatigue', 'energie', 'concentration', 'menthe', 'romarin', 'boost', 'reveil'],
    tags: ['énergie', 'concentration', 'fatigue'],
    sourceBook: 'Guide Aromathérapie',
    sourceType: 'book',
  },
];

// ============================================
// FONCTIONS D'ACCÈS AUX DONNÉES
// ============================================

/**
 * Récupère tous les remèdes aromathérapie
 */
export function getAllEssentialOilRemedies(): EssentialOilRemedy[] {
  return ESSENTIAL_OIL_REMEDIES;
}

/**
 * Récupère un remède par son ID
 */
export function getEssentialOilRemedyById(id: string): EssentialOilRemedy | undefined {
  return ESSENTIAL_OIL_REMEDIES.find(remedy => remedy.id === id);
}

/**
 * Récupère un remède par son slug
 */
export function getEssentialOilRemedyBySlug(slug: string): EssentialOilRemedy | undefined {
  return ESSENTIAL_OIL_REMEDIES.find(remedy => remedy.slug === slug);
}

/**
 * Récupère les remèdes par catégorie
 */
export function getEssentialOilRemediesByCategory(category: EssentialOilCategory): EssentialOilRemedy[] {
  return ESSENTIAL_OIL_REMEDIES.filter(remedy => remedy.category === category);
}

/**
 * Recherche des remèdes par mot-clé
 */
export function searchEssentialOilRemedies(query: string): EssentialOilRemedy[] {
  const normalizedQuery = query.toLowerCase().trim();
  
  if (!normalizedQuery) return [];
  
  return ESSENTIAL_OIL_REMEDIES.filter(remedy => {
    // Recherche dans le titre
    if (remedy.title.toLowerCase().includes(normalizedQuery)) return true;
    
    // Recherche dans les symptômes
    if (remedy.symptomTargets.some(s => s.toLowerCase().includes(normalizedQuery))) return true;
    
    // Recherche dans les mots-clés
    if (remedy.searchKeywords.some(kw => kw.includes(normalizedQuery))) return true;
    
    // Recherche dans les tags
    if (remedy.tags.some(tag => tag.includes(normalizedQuery))) return true;
    
    // Recherche dans le résumé
    if (remedy.summary.toLowerCase().includes(normalizedQuery)) return true;
    
    return false;
  });
}

/**
 * Récupère les remèdes utilisant une huile essentielle spécifique
 */
export function getRemediesForEssentialOil(oilId: string): EssentialOilRemedy[] {
  return ESSENTIAL_OIL_REMEDIES.filter(remedy => 
    remedy.essentialOilIds.includes(oilId)
  );
}

/**
 * Récupère les remèdes compatibles avec un profil
 */
export function getRemediesForProfile(profile: string): EssentialOilRemedy[] {
  return ESSENTIAL_OIL_REMEDIES.filter(remedy => 
    remedy.profileCompatibility.includes(profile as any) ||
    remedy.profileCompatibility.includes('tous')
  );
}

/**
 * Récupère les remèdes sûrs (niveau safe)
 */
export function getSafeRemedies(): EssentialOilRemedy[] {
  return ESSENTIAL_OIL_REMEDIES.filter(remedy => remedy.safetyLevel === 'safe');
}
