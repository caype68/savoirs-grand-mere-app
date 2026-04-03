export { SearchBar } from './SearchBar';
export { SymptomChip } from './SymptomChip';
export { SearchRefinementModal } from './SearchRefinementModal';
export { BodyPainSelector } from './BodyPainSelector';
export { NaturalFrameCard } from './NaturalFrameCard';
export { AIQuestionFlow } from './AIQuestionFlow';

// Fonction utilitaire pour détecter les termes de recherche qui nécessitent l'IA
export const isBroadSearchTerm = (term: string): boolean => {
  const broadTerms = ['douleur', 'mal', 'problème', 'maladie', 'symptôme', 'aide', 'remède', 'toux', 'rhume', 'gorge', 'stress', 'sommeil', 'digestion', 'ventre', 'estomac', 'fièvre'];
  const normalizedTerm = term.toLowerCase().trim();
  return broadTerms.some(broad => normalizedTerm.includes(broad));
};
export { FilterChips, SuggestionChips } from './FilterChips';
export { BadgeSource, BadgeRoute } from './BadgeSource';
export { BadgeConfidence, ConfidenceDetail } from './BadgeConfidence';
export { ResultCard, TrendCard } from './ResultCard';
export { SectionAccordion } from './SectionAccordion';
export { DisclaimerBanner } from './DisclaimerBanner';
export { EmptyState } from './EmptyState';
export { AffiliateProductCard } from './AffiliateProductCard';
export { AffiliateProductsSection } from './AffiliateProductsSection';
export { MedicalWarningCard, SafetyBadge, PregnancyWarning, ChildrenWarning } from './MedicalWarningCard';
export { EssentialOilCard, EssentialOilCardMini } from './EssentialOilCard';
export { DailyRemedyCard, NoRecommendationCard, RecommendationHistoryItem } from './DailyRemedyCard';
export { StreakDisplay, BadgeCard, StreakProgress, NewBadgeAnimation } from './StreakBadge';
export { DailyRoutineCard, NoRoutineCard } from './DailyRoutineCard';
export { BackendStatus, BackendIndicator } from './BackendStatus';
export { AdBanner, MiniAd } from './AdBanner';
