import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../theme/colors';
import { remedes } from '../data/remedes';
import { Remede } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface QuestionOption {
  id: string;
  label: string;
  emoji: string;
  keywords: string[]; // Mots-clés stricts pour filtrer les indications
}

interface Question {
  id: string;
  question: string;
  options: QuestionOption[];
}

interface AIQuestionFlowProps {
  visible: boolean;
  searchTerm: string;
  onClose: () => void;
  onComplete: (refinedSearchTerm: string, filteredIds: string[]) => void;
  onSkip: () => void;
}

// Fonction de filtrage strict par indications
const filterRemedesByKeywords = (remedesList: Remede[], keywords: string[]): Remede[] => {
  if (keywords.length === 0) return remedesList;
  
  return remedesList.filter(remede => {
    // Vérifier si au moins un mot-clé correspond à une indication
    return keywords.some(keyword => {
      const keywordLower = keyword.toLowerCase();
      return remede.indications.some(indication => 
        indication.toLowerCase().includes(keywordLower)
      ) || remede.nom.toLowerCase().includes(keywordLower);
    });
  });
};

// Questions intelligentes basées sur le terme de recherche avec filtrage strict
const getQuestionsForTerm = (term: string): Question[] => {
  const termLower = term.toLowerCase();
  
  // Questions pour la toux
  if (termLower.includes('toux')) {
    return [
      {
        id: 'toux-type',
        question: 'Quel type de toux avez-vous ?',
        options: [
          { id: 'seche', label: 'Toux sèche / Irritation', emoji: '🌬️', keywords: ['toux sèche', 'sèche', 'irritation'] },
          { id: 'grasse', label: 'Toux grasse / Mucosités', emoji: '💧', keywords: ['toux grasse', 'grasse', 'expectorant', 'mucus'] },
          { id: 'gorge', label: 'Toux avec mal de gorge', emoji: '🤧', keywords: ['gorge', 'angine'] },
        ],
      },
      {
        id: 'toux-moment',
        question: 'Quand toussez-vous le plus ?',
        options: [
          { id: 'nuit', label: 'La nuit', emoji: '🌙', keywords: ['nuit', 'sommeil', 'nocturne'] },
          { id: 'matin', label: 'Le matin', emoji: '☀️', keywords: ['matin', 'réveil'] },
          { id: 'toujours', label: 'Tout le temps', emoji: '�', keywords: ['toux', 'bronche'] },
        ],
      },
    ];
  }
  
  // Questions pour le mal de gorge / rhume
  if (termLower.includes('gorge') || termLower.includes('rhume')) {
    return [
      {
        id: 'gorge-symptome',
        question: 'Quel est votre symptôme principal ?',
        options: [
          { id: 'douleur', label: 'Douleur à avaler', emoji: '😣', keywords: ['gorge', 'angine', 'avaler'] },
          { id: 'irritation', label: 'Irritation / Grattement', emoji: '🤧', keywords: ['irritation', 'grattement', 'gorge'] },
          { id: 'infection', label: 'Infection (fièvre)', emoji: '🤒', keywords: ['infection', 'fièvre', 'angine'] },
        ],
      },
    ];
  }
  
  // Questions pour les douleurs
  if (termLower.includes('douleur') || termLower.includes('mal')) {
    return [
      {
        id: 'douleur-zone',
        question: 'Où se situe la douleur ?',
        options: [
          { id: 'tete', label: 'Tête / Migraine', emoji: '🤕', keywords: ['migraine', 'tête', 'céphalée'] },
          { id: 'ventre', label: 'Ventre / Estomac', emoji: '🤢', keywords: ['estomac', 'digestion', 'ventre', 'abdomen'] },
          { id: 'articulation', label: 'Articulations', emoji: '🦴', keywords: ['articulation', 'rhumatisme', 'arthrite', 'genou'] },
          { id: 'dos', label: 'Dos / Lombaires', emoji: '�', keywords: ['dos', 'lombaire', 'dorsale'] },
          { id: 'muscle', label: 'Muscles / Courbatures', emoji: '�', keywords: ['muscle', 'courbature', 'crampe'] },
        ],
      },
    ];
  }
  
  // Questions pour le stress / sommeil
  if (termLower.includes('stress') || termLower.includes('sommeil') || termLower.includes('anxiété')) {
    return [
      {
        id: 'stress-type',
        question: 'Quel est votre besoin principal ?',
        options: [
          { id: 'dormir', label: 'Mieux dormir', emoji: '😴', keywords: ['sommeil', 'insomnie', 'dormir'] },
          { id: 'calmer', label: 'Me calmer / Détendre', emoji: '🧘', keywords: ['stress', 'anxiété', 'calme', 'relaxation', 'détente'] },
          { id: 'nervosite', label: 'Nervosité / Agitation', emoji: '😰', keywords: ['nervosité', 'agitation', 'nerveux'] },
        ],
      },
    ];
  }
  
  // Questions pour la digestion
  if (termLower.includes('digestion') || termLower.includes('ventre') || termLower.includes('estomac')) {
    return [
      {
        id: 'digestion-symptome',
        question: 'Quel symptôme vous gêne ?',
        options: [
          { id: 'ballonnement', label: 'Ballonnements / Gaz', emoji: '🎈', keywords: ['ballonnement', 'gaz', 'flatulence'] },
          { id: 'brulure', label: 'Brûlures d\'estomac', emoji: '🔥', keywords: ['brûlure', 'acidité', 'reflux', 'estomac'] },
          { id: 'nausee', label: 'Nausées', emoji: '🤢', keywords: ['nausée', 'vomissement', 'mal au coeur'] },
          { id: 'transit', label: 'Transit difficile', emoji: '🚽', keywords: ['constipation', 'transit', 'intestin'] },
          { id: 'lourdeur', label: 'Digestion lente', emoji: '🐢', keywords: ['digestion', 'lourdeur', 'lent'] },
        ],
      },
    ];
  }

  // Questions pour fièvre
  if (termLower.includes('fièvre') || termLower.includes('fievre')) {
    return [
      {
        id: 'fievre-symptome',
        question: 'Quels symptômes accompagnent la fièvre ?',
        options: [
          { id: 'rhume', label: 'Rhume / Nez bouché', emoji: '🤧', keywords: ['rhume', 'nez', 'congestion'] },
          { id: 'gorge', label: 'Mal de gorge', emoji: '🤒', keywords: ['gorge', 'angine'] },
          { id: 'courbatures', label: 'Courbatures', emoji: '💪', keywords: ['courbature', 'muscle', 'grippe'] },
          { id: 'seul', label: 'Fièvre seule', emoji: '🌡️', keywords: ['fièvre', 'température'] },
        ],
      },
    ];
  }
  
  // Questions génériques - route d'administration
  return [
    {
      id: 'general-usage',
      question: 'Comment souhaitez-vous utiliser le remède ?',
      options: [
        { id: 'boire', label: 'À boire (tisane, infusion)', emoji: '🍵', keywords: ['infusion', 'tisane', 'décoction'] },
        { id: 'appliquer', label: 'À appliquer sur la peau', emoji: '🧴', keywords: ['cataplasme', 'huile', 'baume', 'friction'] },
        { id: 'inhaler', label: 'À inhaler', emoji: '💨', keywords: ['inhalation', 'vapeur', 'fumigation'] },
      ],
    },
  ];
};

export const AIQuestionFlow: React.FC<AIQuestionFlowProps> = ({
  visible,
  searchTerm,
  onClose,
  onComplete,
  onSkip,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [collectedKeywords, setCollectedKeywords] = useState<string[]>([]);
  const [filteredRemedes, setFilteredRemedes] = useState<Remede[]>([]);
  const [fadeAnim] = useState(new Animated.Value(0));

  const questions = getQuestionsForTerm(searchTerm);

  // Filtrage initial basé sur le terme de recherche
  useEffect(() => {
    if (visible) {
      setCurrentQuestionIndex(0);
      setCollectedKeywords([]);
      
      // Filtrage initial strict
      const initialFiltered = filterRemedesByKeywords(remedes, [searchTerm]);
      setFilteredRemedes(initialFiltered);
      
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, searchTerm]);

  const handleOptionSelect = (option: QuestionOption) => {
    const newKeywords = [...collectedKeywords, ...option.keywords];
    setCollectedKeywords(newKeywords);

    // Filtrer strictement avec les nouveaux mots-clés
    const newFiltered = filterRemedesByKeywords(remedes, newKeywords);
    setFilteredRemedes(newFiltered);

    // Passer à la question suivante ou terminer
    if (currentQuestionIndex < questions.length - 1 && newFiltered.length > 3) {
      // Continuer seulement s'il reste plus de 3 résultats
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Terminer avec le mot-clé le plus spécifique et les IDs filtrés
      const refinedTerm = option.keywords[0] || searchTerm;
      const filteredIds = newFiltered.map(r => r.id);
      onComplete(refinedTerm, filteredIds);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  if (!visible || questions.length === 0) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.aiIcon}>
              <Feather name="cpu" size={24} color={colors.accentPrimary} />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Assistant IA</Text>
              <Text style={styles.headerSubtitle}>Recherche : {searchTerm}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={24} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Progress */}
          <View style={styles.progressContainer}>
            {questions.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  index === currentQuestionIndex && styles.progressDotActive,
                  index < currentQuestionIndex && styles.progressDotCompleted,
                ]}
              />
            ))}
          </View>

          {/* Results count */}
          <View style={styles.resultsInfo}>
            <Feather name="search" size={14} color={colors.accentPrimary} />
            <Text style={styles.resultsInfoText}>
              {filteredRemedes.length} remède{filteredRemedes.length > 1 ? 's' : ''} trouvé{filteredRemedes.length > 1 ? 's' : ''}
            </Text>
          </View>

          {/* Question */}
          <Text style={styles.question}>{currentQuestion?.question}</Text>

          {/* Options */}
          <ScrollView style={styles.optionsContainer} showsVerticalScrollIndicator={false}>
            {currentQuestion?.options.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.optionButton}
                onPress={() => handleOptionSelect(option)}
                activeOpacity={0.7}
              >
                <Text style={styles.optionEmoji}>{option.emoji}</Text>
                <Text style={styles.optionText}>{option.label}</Text>
                <Feather name="chevron-right" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Skip button */}
          <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
            <Text style={styles.skipText}>Voir tous les résultats ({filteredRemedes.length})</Text>
            <Feather name="arrow-right" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  container: {
    width: SCREEN_WIDTH - 32,
    maxHeight: '85%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  aiIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accentPrimaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    marginLeft: spacing.md,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  closeButton: {
    padding: spacing.xs,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  progressDotActive: {
    backgroundColor: colors.accentPrimary,
    width: 24,
  },
  progressDotCompleted: {
    backgroundColor: colors.success,
  },
  resultsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginBottom: spacing.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.accentPrimaryMuted,
    borderRadius: borderRadius.md,
    alignSelf: 'center',
  },
  resultsInfoText: {
    fontSize: 13,
    color: colors.accentPrimary,
    fontWeight: '500',
  },
  question: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 30,
  },
  optionsContainer: {
    maxHeight: 300,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionEmoji: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  optionText: {
    fontSize: 16,
    color: colors.textPrimary,
    flex: 1,
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  skipText: {
    fontSize: 14,
    color: colors.textMuted,
  },
});

export default AIQuestionFlow;
