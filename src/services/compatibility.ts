import { 
  UserProfile, 
  Remede, 
  RemedeExtended,
  RemedyCompatibility, 
  CompatibilityStatus,
  HealthGoal,
  ProfileType,
} from '../types';

// ============================================
// MOTEUR DE COMPATIBILITÉ PROFIL / REMÈDE
// ============================================

// Allergies communes et leurs ingrédients associés
const ALLERGY_INGREDIENTS: Record<string, string[]> = {
  'abeilles': ['miel', 'propolis', 'cire d\'abeille', 'gelée royale'],
  'asteracees': ['camomille', 'arnica', 'echinacea', 'pissenlit', 'artichaut'],
  'lamiacees': ['menthe', 'thym', 'romarin', 'lavande', 'sauge', 'mélisse'],
  'agrumes': ['citron', 'orange', 'pamplemousse', 'bergamote'],
  'fruits_a_coque': ['amande', 'noix', 'noisette'],
  'gluten': ['avoine', 'orge', 'blé'],
  'lactose': ['lait', 'beurre', 'crème'],
};

// Contre-indications par profil
const PROFILE_CONTRAINDICATIONS: Record<ProfileType, string[]> = {
  'enfant': ['alcool', 'huile essentielle pure', 'café', 'guarana', 'ginseng'],
  'senior': ['réglisse haute dose', 'ginkgo avec anticoagulants'],
  'enceinte': ['sauge', 'romarin forte dose', 'menthe poivrée', 'réglisse', 'ginseng', 'aloe vera interne'],
  'allaitante': ['sauge', 'menthe poivrée', 'persil forte dose'],
  'adulte': [],
};

// Mapping objectifs -> indications recherchées
const GOAL_KEYWORDS: Record<HealthGoal, string[]> = {
  'sommeil': ['sommeil', 'insomnie', 'dormir', 'relaxant', 'calmant', 'nuit'],
  'digestion': ['digestion', 'estomac', 'intestin', 'ballonnement', 'transit', 'foie'],
  'stress': ['stress', 'anxiété', 'nervosité', 'calme', 'relaxation', 'tension'],
  'immunite': ['immunité', 'défenses', 'rhume', 'grippe', 'infection', 'fièvre'],
  'peau': ['peau', 'acné', 'eczéma', 'cicatrisation', 'dermatite', 'irritation cutanée'],
  'douleurs': ['douleur', 'anti-inflammatoire', 'arthrite', 'migraine', 'courbature'],
  'energie': ['énergie', 'fatigue', 'tonique', 'vitalité', 'stimulant'],
  'respiration': ['respiration', 'toux', 'bronche', 'gorge', 'sinus', 'rhume'],
  'circulation': ['circulation', 'jambes lourdes', 'varices', 'hémorroïdes'],
  'detox': ['détox', 'drainage', 'foie', 'reins', 'purification'],
};

/**
 * Calcule la compatibilité d'un remède avec le profil utilisateur
 */
export const calculateCompatibility = (
  remede: Remede | RemedeExtended,
  profile: UserProfile
): RemedyCompatibility => {
  const raisons: string[] = [];
  let score = 100;
  let status: CompatibilityStatus = 'compatible';

  // 1. Vérifier les allergies
  const allergyIssues = checkAllergies(remede, profile.allergies);
  if (allergyIssues.length > 0) {
    raisons.push(...allergyIssues);
    score -= 50;
    status = 'deconseille';
  }

  // 2. Vérifier les contre-indications du profil
  const profileIssues = checkProfileContraindications(remede, profile.profileType);
  if (profileIssues.length > 0) {
    raisons.push(...profileIssues);
    score -= 40;
    if (status !== 'deconseille') status = 'attention';
  }

  // 3. Vérifier les restrictions personnelles
  const restrictionIssues = checkRestrictions(remede, profile.restrictions);
  if (restrictionIssues.length > 0) {
    raisons.push(...restrictionIssues);
    score -= 30;
    if (status !== 'deconseille') status = 'attention';
  }

  // 4. Bonus si correspond aux objectifs
  const goalMatch = checkGoalMatch(remede, profile.objectifs);
  if (goalMatch > 0) {
    score += goalMatch * 5;
    if (goalMatch >= 2) {
      raisons.push('Correspond à vos objectifs');
    }
  }

  // 5. Bonus si format préféré
  if (profile.formatsPreferes.length > 0) {
    const routeToFormat: Record<string, string> = {
      'orale': 'infusion',
      'cutanee': 'cataplasme',
      'inhalation': 'inhalation',
      'gargarisme': 'gargarisme',
    };
    const format = routeToFormat[remede.route];
    if (format && profile.formatsPreferes.includes(format as any)) {
      score += 10;
    }
  }

  // Normaliser le score
  score = Math.max(0, Math.min(100, score));

  return {
    remedeId: remede.id,
    status,
    raisons,
    scorePersonnalise: score,
  };
};

/**
 * Vérifie les allergies potentielles
 */
const checkAllergies = (remede: Remede, allergies: string[]): string[] => {
  const issues: string[] = [];
  
  for (const allergy of allergies) {
    const allergyLower = allergy.toLowerCase();
    const relatedIngredients = ALLERGY_INGREDIENTS[allergyLower] || [allergyLower];
    
    for (const ingredient of remede.ingredients) {
      const ingredientName = ingredient.nom.toLowerCase();
      if (relatedIngredients.some(ri => ingredientName.includes(ri))) {
        issues.push(`Contient ${ingredient.nom} (allergie: ${allergy})`);
      }
    }
  }
  
  return issues;
};

/**
 * Vérifie les contre-indications liées au profil
 */
const checkProfileContraindications = (remede: Remede, profileType: ProfileType): string[] => {
  const issues: string[] = [];
  const contraindications = PROFILE_CONTRAINDICATIONS[profileType] || [];
  
  // Vérifier dans les ingrédients
  for (const ingredient of remede.ingredients) {
    const ingredientName = ingredient.nom.toLowerCase();
    for (const contra of contraindications) {
      if (ingredientName.includes(contra.toLowerCase())) {
        issues.push(`${ingredient.nom} déconseillé pour profil ${profileType}`);
      }
    }
  }
  
  // Vérifier dans les contre-indications du remède
  for (const ci of remede.contreIndications) {
    const ciLower = ci.toLowerCase();
    if (profileType === 'enceinte' && (ciLower.includes('grossesse') || ciLower.includes('enceinte'))) {
      issues.push('Déconseillé pendant la grossesse');
    }
    if (profileType === 'allaitante' && ciLower.includes('allaitement')) {
      issues.push('Déconseillé pendant l\'allaitement');
    }
    if (profileType === 'enfant' && ciLower.includes('enfant')) {
      issues.push('Déconseillé aux enfants');
    }
  }
  
  return issues;
};

/**
 * Vérifie les restrictions personnelles
 */
const checkRestrictions = (remede: Remede, restrictions: string[]): string[] => {
  const issues: string[] = [];
  
  for (const restriction of restrictions) {
    const restrictionLower = restriction.toLowerCase();
    
    // Vérifier dans les ingrédients
    for (const ingredient of remede.ingredients) {
      if (ingredient.nom.toLowerCase().includes(restrictionLower)) {
        issues.push(`Contient ${ingredient.nom} (restriction personnelle)`);
      }
    }
    
    // Vérifier dans les contre-indications
    for (const ci of remede.contreIndications) {
      if (ci.toLowerCase().includes(restrictionLower)) {
        issues.push(`Contre-indication: ${ci}`);
      }
    }
  }
  
  return issues;
};

/**
 * Vérifie la correspondance avec les objectifs
 */
const checkGoalMatch = (remede: Remede, objectifs: HealthGoal[]): number => {
  let matchCount = 0;
  
  for (const objectif of objectifs) {
    const keywords = GOAL_KEYWORDS[objectif] || [];
    
    // Chercher dans les indications
    for (const indication of remede.indications) {
      const indicationLower = indication.toLowerCase();
      if (keywords.some(kw => indicationLower.includes(kw))) {
        matchCount++;
        break;
      }
    }
  }
  
  return matchCount;
};

/**
 * Filtre et trie les remèdes selon le profil
 */
export const filterAndSortByCompatibility = (
  remedes: Remede[],
  profile: UserProfile
): Array<{ remede: Remede; compatibility: RemedyCompatibility }> => {
  const results = remedes.map(remede => ({
    remede,
    compatibility: calculateCompatibility(remede, profile),
  }));
  
  // Trier par score décroissant
  results.sort((a, b) => b.compatibility.scorePersonnalise - a.compatibility.scorePersonnalise);
  
  return results;
};

/**
 * Obtient les remèdes recommandés pour le profil
 */
export const getRecommendedRemedies = (
  remedes: Remede[],
  profile: UserProfile,
  limit: number = 10
): Remede[] => {
  const sorted = filterAndSortByCompatibility(remedes, profile);
  
  return sorted
    .filter(r => r.compatibility.status === 'compatible')
    .slice(0, limit)
    .map(r => r.remede);
};

/**
 * Obtient les remèdes à éviter pour le profil
 */
export const getRemedesToAvoid = (
  remedes: Remede[],
  profile: UserProfile
): Array<{ remede: Remede; raisons: string[] }> => {
  const sorted = filterAndSortByCompatibility(remedes, profile);
  
  return sorted
    .filter(r => r.compatibility.status === 'deconseille')
    .map(r => ({ remede: r.remede, raisons: r.compatibility.raisons }));
};

/**
 * Obtient le texte de statut de compatibilité
 */
export const getCompatibilityLabel = (status: CompatibilityStatus): string => {
  switch (status) {
    case 'compatible':
      return 'Compatible avec votre profil';
    case 'attention':
      return 'À vérifier selon votre profil';
    case 'deconseille':
      return 'Non recommandé pour votre profil';
  }
};

/**
 * Obtient la couleur du statut de compatibilité
 */
export const getCompatibilityColor = (status: CompatibilityStatus): string => {
  switch (status) {
    case 'compatible':
      return '#4ADE80'; // Vert
    case 'attention':
      return '#FBBF24'; // Orange
    case 'deconseille':
      return '#F87171'; // Rouge
  }
};
