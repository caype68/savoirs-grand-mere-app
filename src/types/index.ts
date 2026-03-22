export interface Ingredient {
  id: string;
  nom: string;
  alias?: string[];
  type: 'plante' | 'mineral' | 'animal' | 'autre';
  quantite?: string;
  unite?: string;
  remarques?: string;
  interactions?: string[];
  contreIndications?: string[];
}

export interface EtapePreparation {
  numero: number;
  instruction: string;
}

export interface Posologie {
  frequence: string;
  duree?: string;
  unite?: string;
  remarques?: string;
}

export interface Source {
  livre: string;
  edition?: string;
  page: number;
  confianceOCR: number;
  confianceParsing: number;
  confianceGlobale: number;
  extrait?: string;
}

export interface Remede {
  id: string;
  nom: string;
  alias?: string[];
  fautesFrequentes?: string[];
  route: 'orale' | 'cutanee' | 'inhalation' | 'gargarisme' | 'nasale';
  ingredients: Ingredient[];
  preparation: EtapePreparation[];
  posologie: Posologie;
  indications: string[];
  contreIndications: string[];
  precautions?: string[];
  source: Source;
  verifie: boolean;
}

export interface Livre {
  id: string;
  nom: string;
  auteur?: string;
  annee?: string;
  statutDroits: 'domaine_public' | 'non_specifie' | 'protege';
  nombreRemedes: number;
}

export interface Usage {
  id: string;
  nom: string;
  icone: string;
  nombreRemedes: number;
}

export interface Plante {
  id: string;
  nom: string;
  alias?: string[];
  type: 'plante' | 'mineral' | 'animal' | 'autre';
  nombreRemedes: number;
  interactions?: string[];
  contreIndications?: string[];
}

export interface FavoriNote {
  remedeId: string;
  note?: string;
  dateAjout: string;
}

export interface UserPreferences {
  onboardingComplete: boolean;
  analyticsEnabled: boolean;
  langue: 'fr' | 'en';
}

// ============================================
// V2 - PROFIL UTILISATEUR COMPLET
// ============================================

export type HealthGoal = 
  | 'sommeil' 
  | 'digestion' 
  | 'stress' 
  | 'immunite' 
  | 'peau' 
  | 'douleurs' 
  | 'energie' 
  | 'respiration' 
  | 'circulation'
  | 'detox';

export type RemedyFormat = 
  | 'infusion' 
  | 'tisane' 
  | 'sirop' 
  | 'inhalation' 
  | 'cataplasme' 
  | 'friction' 
  | 'compresse'
  | 'bain'
  | 'gargarisme';

export type ProfileType = 'adulte' | 'enfant' | 'senior' | 'enceinte' | 'allaitante';

export type ExperienceLevel = 'debutant' | 'intermediaire' | 'expert';

export type NotificationFrequency = 'jamais' | 'quotidien' | 'hebdomadaire' | '2-3_semaine';

export type Gender = 'homme' | 'femme' | 'autre' | 'non_precise';

export interface UserProfile {
  id: string;
  nom?: string;
  email?: string;
  age?: number;
  sexe: Gender;
  profileType: ProfileType;
  objectifs: HealthGoal[];
  formatsPreferes: RemedyFormat[];
  allergies: string[];
  restrictions: string[];
  niveauExperience: ExperienceLevel;
  notificationsEnabled: boolean;
  notificationFrequency: NotificationFrequency;
  notificationHoraires: {
    matin: string; // "08:00"
    soir: string;  // "21:00"
  };
  interesseParProduits: boolean;
  onboardingCompleted: boolean;
  cycleTracking?: boolean; // Pour suivi menstruel
  avatarUri?: string; // Photo de profil
  createdAt: string;
  updatedAt: string;
}

// ============================================
// V2 - PRODUITS SPONSORISÉS / AFFILIATION
// ============================================

export type ProductBadge = 
  | 'recommande' 
  | 'bio' 
  | 'meilleur_rapport' 
  | 'premium' 
  | 'local' 
  | 'nouveau';

export type ProductCategory = 
  | 'plante' 
  | 'huile_essentielle' 
  | 'tisane' 
  | 'accessoire' 
  | 'contenant' 
  | 'diffuseur'
  | 'livre';

export interface SponsoredProduct {
  id: string;
  remedeIds: string[]; // Peut être lié à plusieurs remèdes
  nom: string;
  image: string;
  description: string;
  prix: string; // "12,90 €"
  prixOriginal?: string; // Pour afficher une promo
  affiliateUrl: string;
  fournisseur: string;
  badges: ProductBadge[];
  categorie: ProductCategory;
  actif: boolean;
  ordre: number; // Pour trier l'affichage
  trackingClicks: number;
  trackingImpressions: number;
}

// ============================================
// V2 - SUIVI BIEN-ÊTRE
// ============================================

export type MoodLevel = 1 | 2 | 3 | 4 | 5;
export type StressLevel = 1 | 2 | 3 | 4 | 5;
export type SleepQuality = 1 | 2 | 3 | 4 | 5;
export type EnergyLevel = 1 | 2 | 3 | 4 | 5;

export interface WellnessLog {
  id: string;
  userId: string;
  date: string; // ISO date
  dateKey: string; // YYYY-MM-DD pour identification unique par jour
  sommeil: {
    qualite: SleepQuality;
    heures?: number;
    difficulteEndormissement?: boolean;
    reveilsNocturnes?: boolean;
  };
  stress: StressLevel;
  humeur: MoodLevel;
  energie: EnergyLevel;
  hydratation?: number; // verres d'eau
  digestion?: 1 | 2 | 3 | 4 | 5;
  symptomes: string[];
  cycleInfo?: {
    jourCycle?: number;
    regles?: boolean;
    douleurs?: boolean;
  };
  noteLibre?: string;
  remedesUtilises: string[]; // IDs des remèdes
  isValidated: boolean; // Journal validé pour la journée
  createdAt: string;
  updatedAt?: string;
}

// ============================================
// V2 - RECOMMANDATIONS QUOTIDIENNES
// ============================================

export type WellnessCategory = 
  | 'sommeil'
  | 'stress'
  | 'energie'
  | 'humeur'
  | 'digestion'
  | 'respiration'
  | 'immunite'
  | 'detente'
  | 'concentration'
  | 'douleurs'
  | 'bien_etre_general';

export interface DailyRecommendation {
  id: string;
  dateKey: string; // YYYY-MM-DD
  wellnessLogId: string;
  remedyId: string;
  remedyName: string;
  category: WellnessCategory;
  reason: string; // Explication pour l'utilisateur
  matchScore: number; // Score de pertinence 0-100
  matchedTags: string[]; // Tags qui ont matché
  priority: number; // 1 = haute, 2 = moyenne, 3 = basse
  isViewed: boolean;
  isSavedToFavorites: boolean;
  generatedAt: string;
}

export interface RecommendationRule {
  id: string;
  name: string;
  priority: number; // Plus bas = plus prioritaire
  conditions: {
    sleepMax?: number; // sommeil <= X
    sleepMin?: number; // sommeil >= X
    stressMax?: number; // stress <= X (1=très stressé, 5=calme)
    stressMin?: number;
    energyMax?: number;
    energyMin?: number;
    moodMax?: number;
    moodMin?: number;
    symptoms?: string[]; // Au moins un de ces symptômes
  };
  targetTags: string[]; // Tags de remèdes à cibler
  targetCategories: WellnessCategory[];
  reason: string; // Template de raison
}

export interface WellnessStats {
  averageSleep: number;
  averageStress: number;
  averageEnergy: number;
  averageMood: number;
  totalLogs: number;
  streak: number; // Jours consécutifs
  lastLogDate: string;
  topSymptoms: { symptom: string; count: number }[];
  recommendationsFollowed: number;
}

// ============================================
// V2 - NOTIFICATIONS INTELLIGENTES
// ============================================

export type NotificationType = 
  | 'rappel_remede' 
  | 'suggestion_quotidienne' 
  | 'routine_matin' 
  | 'routine_soir'
  | 'saison'
  | 'objectif'
  | 'produit';

export interface NotificationRule {
  id: string;
  type: NotificationType;
  titre: string;
  message: string;
  condition: {
    heure?: string;
    joursSemaine?: number[];
    saison?: 'printemps' | 'ete' | 'automne' | 'hiver';
    objectif?: HealthGoal;
    symptome?: string;
  };
  action: {
    type: 'open_remede' | 'open_search' | 'open_product' | 'open_wellness';
    payload?: string;
  };
  actif: boolean;
  derniereExecution?: string;
}

export interface NotificationHistory {
  id: string;
  userId: string;
  ruleId: string;
  titre: string;
  message: string;
  sentAt: string;
  clicked: boolean;
  clickedAt?: string;
}

// ============================================
// V2 - COMPATIBILITÉ REMÈDE / PROFIL
// ============================================

export type CompatibilityStatus = 'compatible' | 'attention' | 'deconseille';

export interface RemedyCompatibility {
  remedeId: string;
  status: CompatibilityStatus;
  raisons: string[];
  scorePersonnalise: number; // 0-100
}

// ============================================
// V2 - EXTENSION DU REMÈDE EXISTANT
// ============================================

export interface RemedeExtended extends Remede {
  // Métadonnées de compatibilité
  profilsCompatibles: ProfileType[];
  allergiesDeconseillees: string[];
  niveauDifficulte: 'facile' | 'moyen' | 'avance';
  dureePreparation: string; // "10 min"
  dureeUtilisation?: string; // "7 jours"
  
  // Catégorisation
  objectifsCibles: HealthGoal[];
  saison?: 'printemps' | 'ete' | 'automne' | 'hiver' | 'toutes';
  momentJournee?: 'matin' | 'midi' | 'soir' | 'nuit' | 'tous';
  
  // Popularité et scoring
  scorePopularite: number;
  nombreVues: number;
  nombreFavoris: number;
  
  // Produits associés
  produitsRecommandes?: string[]; // IDs des SponsoredProduct
  
  // Disclaimer spécifique
  disclaimerSpecifique?: string;
}

// ============================================
// V2 - ANALYTICS / TRACKING
// ============================================

export interface AnalyticsEvent {
  id: string;
  userId?: string;
  type: 'view_remede' | 'click_product' | 'search' | 'favorite' | 'share' | 'notification_click';
  payload: Record<string, unknown>;
  timestamp: string;
}

export interface ProductClickTracking {
  productId: string;
  remedeId?: string;
  userId?: string;
  timestamp: string;
  source: 'fiche_remede' | 'boutique' | 'notification';
}

// ============================================
// V2 - AFFILIATION AMAZON
// ============================================

export type AffiliateProductBadge = 
  | 'recommande' 
  | 'bio' 
  | 'populaire' 
  | 'petit_budget' 
  | 'premium' 
  | 'essentiel'
  | 'pack';

export type AffiliateProductCategory = 
  | 'ingredient' 
  | 'plante' 
  | 'huile_essentielle' 
  | 'miel' 
  | 'accessoire' 
  | 'ustensile'
  | 'contenant'
  | 'pack'
  | 'livre';

export interface AffiliateProduct {
  id: string;
  ingredientName: string; // Nom de l'ingrédient lié
  title: string;
  subtitle?: string;
  description?: string;
  image?: string; // Image directe du produit
  generatedImage?: string; // Image générée automatiquement (Unsplash)
  amazonUrl?: string; // URL Amazon complète (optionnel si ASIN fourni)
  asin?: string; // Code ASIN Amazon (doit être vérifié comme valide)
  searchQuery?: string; // Requête de recherche Amazon si pas d'ASIN fiable
  priceLabel?: string; // "~8,90 €" ou "À partir de 5 €"
  badge?: AffiliateProductBadge;
  category: AffiliateProductCategory;
  isEssential?: boolean; // Ingrédient principal
  sortOrder?: number;
}

export interface RemedyAffiliateProducts {
  remedyId: string;
  products: AffiliateProduct[];
}

export interface AffiliateClickStats {
  productId: string;
  remedyId: string;
  clickCount: number;
  lastClickedAt: string;
}

export interface AffiliateTrackingData {
  clicks: AffiliateClickStats[];
  totalClicks: number;
  lastUpdated: string;
}

// ============================================
// V2 - HUILES ESSENTIELLES / AROMATHÉRAPIE
// ============================================

export type EssentialOilUsageRoute = 
  | 'diffusion' 
  | 'inhalation' 
  | 'cutanee' 
  | 'massage' 
  | 'bain' 
  | 'orale' 
  | 'gargarisme';

export type EssentialOilCategory = 
  | 'respiration' 
  | 'digestion' 
  | 'stress' 
  | 'sommeil' 
  | 'douleurs' 
  | 'peau' 
  | 'circulation' 
  | 'immunite' 
  | 'energie' 
  | 'femmes' 
  | 'enfants' 
  | 'voyage';

export type ProfileCompatibility = 
  | 'adulte' 
  | 'enfant_6_plus' 
  | 'enfant_3_plus' 
  | 'femme_enceinte' 
  | 'femme_allaitante' 
  | 'senior' 
  | 'tous';

export type SafetyLevel = 
  | 'safe' 
  | 'caution' 
  | 'restricted' 
  | 'expert_only';

export interface EssentialOil {
  id: string;
  slug: string;
  name: string;
  nameLatin?: string;
  familyBotanical?: string;
  shortDescription: string;
  longDescription?: string;
  mainProperties: string[];
  therapeuticProperties?: string[];
  commonUses: string[];
  usageRoutes: EssentialOilUsageRoute[];
  dilutionRecommended?: string;
  precautions: string[];
  contraindications: string[];
  compatibleProfiles: ProfileCompatibility[];
  incompatibleProfiles?: ProfileCompatibility[];
  safetyLevel: SafetyLevel;
  synergies?: string[]; // IDs d'autres HE qui se combinent bien
  searchKeywords: string[];
  tags: string[];
  sourceBook: string;
  sourceType: 'book' | 'expert' | 'tradition';
  icon?: string;
  color?: string; // Couleur associée pour l'UI
}

export interface EssentialOilRemedy {
  id: string;
  slug: string;
  title: string;
  symptomTargets: string[];
  bodyZones?: string[];
  category: EssentialOilCategory;
  summary: string;
  essentialOilIds: string[];
  routeOfUse: EssentialOilUsageRoute[];
  preparation?: string;
  dosage?: string;
  duration?: string;
  precautions: string[];
  contraindications: string[];
  profileCompatibility: ProfileCompatibility[];
  safetyLevel: SafetyLevel;
  searchKeywords: string[];
  tags: string[];
  sourceBook: string;
  sourceType: 'book' | 'expert' | 'tradition';
}

export interface EssentialOilCategoryInfo {
  id: EssentialOilCategory;
  slug: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  oilCount?: number;
  remedyCount?: number;
}

export interface EssentialOilAffiliateProduct {
  id: string;
  relatedType: 'essential_oil' | 'remedy' | 'accessory';
  relatedId: string;
  oilName?: string;
  title: string;
  subtitle?: string;
  description?: string;
  image?: string;
  asin?: string;
  searchQuery?: string;
  priceLabel?: string;
  badge?: AffiliateProductBadge;
  category: 'huile_essentielle' | 'huile_vegetale' | 'diffuseur' | 'roll_on' | 'inhalateur' | 'flacon' | 'livre' | 'coffret';
  isEssential?: boolean;
  sortOrder?: number;
}

export interface EssentialOilAffiliateProducts {
  relatedType: 'essential_oil' | 'remedy' | 'accessory';
  relatedId: string;
  products: EssentialOilAffiliateProduct[];
}

// Précautions générales aromathérapie
export interface AromatherapySafetyRule {
  id: string;
  title: string;
  description: string;
  icon: string;
  severity: 'info' | 'warning' | 'danger';
  appliesTo: ProfileCompatibility[];
}

// ============================================
// V3 - SYSTÈME DE RÉTENTION & GAMIFICATION
// ============================================

// --- STREAK (Gamification) ---
export interface UserStreak {
  currentStreak: number;
  bestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  totalActiveDays: number;
  streakStartDate: string;
  badges: StreakBadge[];
}

export type StreakBadgeType = 
  | 'apprenti_herboriste'    // 3 jours
  | 'routine_engagee'        // 7 jours
  | 'herboriste_confirme'    // 14 jours
  | 'maitre_remedes'         // 30 jours
  | 'routine_parfaite'       // 60 jours
  | 'legende_naturelle';     // 100 jours

export interface StreakBadge {
  type: StreakBadgeType;
  name: string;
  description: string;
  icon: string;
  requiredDays: number;
  unlockedAt?: string;
  isUnlocked: boolean;
}

// --- ROUTINES QUOTIDIENNES ---
export type RoutineType = 'morning' | 'evening';

export interface DailyRoutine {
  id: string;
  dateKey: string; // YYYY-MM-DD
  morningRoutine: RoutineBlock;
  eveningRoutine: RoutineBlock;
  basedOnGoals: string[];
  basedOnWellnessLog?: string;
  generatedAt: string;
}

export interface RoutineBlock {
  type: RoutineType;
  title: string;
  subtitle: string;
  remedyIds: string[];
  tips: string[];
  duration: string; // "10-15 min"
  isCompleted: boolean;
  completedAt?: string;
}

export interface RoutineRemedy {
  remedyId: string;
  remedyName: string;
  reason: string;
  duration: string;
  order: number;
}

// --- OBJECTIFS UTILISATEUR ---
export type UserGoalType = 
  | 'dormir_mieux'
  | 'reduire_stress'
  | 'booster_energie'
  | 'ameliorer_digestion'
  | 'renforcer_immunite'
  | 'soulager_douleurs'
  | 'ameliorer_peau'
  | 'ameliorer_humeur'
  | 'concentration'
  | 'detox';

export interface UserGoal {
  id: string;
  type: UserGoalType;
  name: string;
  icon: string;
  priority: number; // 1 = haute priorité
  isActive: boolean;
  createdAt: string;
  progress?: number; // 0-100
}

// --- HISTORIQUE REMÈDES ---
export interface UserRemedyHistory {
  remedyId: string;
  remedyName: string;
  viewCount: number;
  usedCount: number;
  lastViewed: string;
  lastUsed?: string;
  effectivenessScore?: number; // 1-5
  isFavorite: boolean;
  notes?: string;
}

export interface RemedyFeedback {
  id: string;
  remedyId: string;
  date: string;
  effectiveness: 1 | 2 | 3 | 4 | 5;
  wouldRecommend: boolean;
  notes?: string;
}

// --- STATISTIQUES ÉVOLUTION ---
export interface WellnessTrends {
  sleepTrend: TrendData;
  stressTrend: TrendData;
  energyTrend: TrendData;
  moodTrend: TrendData;
  period: '7days' | '30days' | '90days';
  calculatedAt: string;
}

export interface TrendData {
  currentAverage: number;
  previousAverage: number;
  changePercent: number;
  direction: 'up' | 'down' | 'stable';
  dataPoints: { date: string; value: number }[];
}

// --- ASSISTANT IA ---
export interface AIConversation {
  id: string;
  userId: string;
  messages: AIMessage[];
  context: AIContext;
  createdAt: string;
  updatedAt: string;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  remedyIds?: string[];
  productIds?: string[];
}

export interface AIContext {
  userGoals: UserGoalType[];
  recentSymptoms: string[];
  profileType: ProfileType;
  allergies: string[];
}

// --- MODE URGENCE ---
export type UrgencyCategory = 
  | 'stress'
  | 'mal_tete'
  | 'insomnie'
  | 'digestion'
  | 'douleur'
  | 'fatigue'
  | 'anxiete'
  | 'rhume';

export interface UrgencyResponse {
  category: UrgencyCategory;
  remedy: {
    id: string;
    name: string;
    quickAction: string;
    duration: string;
  };
  tips: string[];
  products?: string[];
}

// --- CONTENU QUOTIDIEN ---
export interface DailyContent {
  dateKey: string;
  remedyOfTheDay: {
    remedyId: string;
    reason: string;
  };
  tipOfTheDay: {
    title: string;
    content: string;
    icon: string;
  };
  mistakeToAvoid?: {
    title: string;
    content: string;
  };
}

// --- NOTIFICATIONS ---
export interface SmartNotification {
  id: string;
  type: NotificationType | 'streak_reminder' | 'routine_morning' | 'routine_evening' | 'urgency_followup';
  title: string;
  body: string;
  scheduledFor: string;
  data?: Record<string, string>;
  sent: boolean;
  sentAt?: string;
  clicked: boolean;
}

// --- PREMIUM ---
export interface PremiumStatus {
  isPremium: boolean;
  plan?: 'monthly' | 'yearly' | 'lifetime';
  expiresAt?: string;
  features: PremiumFeature[];
}

export type PremiumFeature = 
  | 'unlimited_ai'
  | 'advanced_routines'
  | 'personalized_plans'
  | 'exclusive_content'
  | 'no_ads'
  | 'priority_support';

// --- PROFIL FAMILLE ---
export interface FamilyProfile {
  id: string;
  name: string;
  type: 'enfant' | 'adulte' | 'senior';
  age?: number;
  allergies: string[];
  restrictions: string[];
  isDefault: boolean;
}
