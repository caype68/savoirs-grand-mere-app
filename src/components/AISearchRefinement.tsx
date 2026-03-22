import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../theme/colors';
import { SearchResult } from '../utils/search';

interface RefinementQuestion {
  id: string;
  question: string;
  options: {
    id: string;
    label: string;
    filterFn: (result: SearchResult) => boolean;
  }[];
}

interface AISearchRefinementProps {
  visible: boolean;
  searchTerm: string;
  results: SearchResult[];
  onClose: () => void;
  onRefinedResults: (results: SearchResult[]) => void;
}

// Questions d'affinage basées sur les caractéristiques des remèdes
const generateQuestions = (results: SearchResult[], searchTerm: string): RefinementQuestion[] => {
  const questions: RefinementQuestion[] = [];
  
  // Question sur la voie d'administration
  const routes = new Set(results.map(r => r.remede.route));
  if (routes.size > 1) {
    questions.push({
      id: 'route',
      question: 'Comment souhaitez-vous utiliser le remède ?',
      options: [
        { id: 'orale', label: '🍵 À boire (infusion, tisane)', filterFn: (r: SearchResult) => r.remede.route === 'orale' },
        { id: 'cutanee', label: '🧴 Application sur la peau', filterFn: (r: SearchResult) => r.remede.route === 'cutanee' },
        { id: 'inhalation', label: '💨 Inhalation', filterFn: (r: SearchResult) => r.remede.route === 'inhalation' },
        { id: 'all', label: '📋 Voir toutes les options', filterFn: () => true },
      ].filter(opt => opt.id === 'all' || routes.has(opt.id as any)),
    });
  }

  // Question sur le nombre d'ingrédients (simplicité)
  const hasSimple = results.some(r => r.remede.ingredients.length <= 2);
  const hasComplex = results.some(r => r.remede.ingredients.length > 3);
  if (hasSimple && hasComplex) {
    questions.push({
      id: 'complexity',
      question: 'Quel niveau de préparation préférez-vous ?',
      options: [
        { id: 'simple', label: '⚡ Rapide (1-2 ingrédients)', filterFn: (r: SearchResult) => r.remede.ingredients.length <= 2 },
        { id: 'medium', label: '🌿 Modéré (3 ingrédients)', filterFn: (r: SearchResult) => r.remede.ingredients.length === 3 },
        { id: 'complex', label: '🧪 Élaboré (4+ ingrédients)', filterFn: (r: SearchResult) => r.remede.ingredients.length >= 4 },
        { id: 'all', label: '📋 Peu importe', filterFn: () => true },
      ],
    });
  }

  // Question sur les contre-indications
  const hasContraindications = results.some(r => r.remede.contreIndications.length > 0);
  if (hasContraindications) {
    questions.push({
      id: 'safety',
      question: 'Avez-vous des précautions particulières ?',
      options: [
        { id: 'pregnant', label: '🤰 Je suis enceinte/allaitante', filterFn: (r: SearchResult) => !r.remede.contreIndications.some(c => c.toLowerCase().includes('grossesse') || c.toLowerCase().includes('enceinte') || c.toLowerCase().includes('allaitement')) },
        { id: 'child', label: '👶 C\'est pour un enfant', filterFn: (r: SearchResult) => !r.remede.contreIndications.some(c => c.toLowerCase().includes('enfant')) },
        { id: 'aspirin', label: '💊 Allergie à l\'aspirine', filterFn: (r: SearchResult) => !r.remede.contreIndications.some(c => c.toLowerCase().includes('aspirine')) },
        { id: 'none', label: '✅ Aucune précaution', filterFn: () => true },
      ],
    });
  }

  // Question sur l'intensité des symptômes
  questions.push({
    id: 'intensity',
    question: 'Quelle est l\'intensité de vos symptômes ?',
    options: [
      { id: 'mild', label: '😊 Légers (prévention)', filterFn: (r: SearchResult) => r.remede.verifie },
      { id: 'moderate', label: '😐 Modérés', filterFn: () => true },
      { id: 'severe', label: '😣 Intenses', filterFn: (r: SearchResult) => r.score >= 5 },
    ],
  });

  return questions.slice(0, 3); // Maximum 3 questions
};

export const AISearchRefinement: React.FC<AISearchRefinementProps> = ({
  visible,
  searchTerm,
  results,
  onClose,
  onRefinedResults,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [filteredResults, setFilteredResults] = useState<SearchResult[]>(results);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [fadeAnim] = useState(new Animated.Value(0));

  const questions = generateQuestions(results, searchTerm);

  useEffect(() => {
    if (visible) {
      setCurrentQuestionIndex(0);
      setFilteredResults(results);
      setAnswers({});
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, results]);

  const handleOptionSelect = (questionId: string, optionId: string, filterFn: (r: SearchResult) => boolean) => {
    const newAnswers = { ...answers, [questionId]: optionId };
    setAnswers(newAnswers);

    // Appliquer le filtre
    const newFiltered = filteredResults.filter(filterFn);
    setFilteredResults(newFiltered);

    // Passer à la question suivante ou terminer
    if (currentQuestionIndex < questions.length - 1 && newFiltered.length > 3) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Terminer et retourner les résultats
      onRefinedResults(newFiltered);
      onClose();
    }
  };

  const handleSkip = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      onRefinedResults(filteredResults);
      onClose();
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
            <Text style={styles.headerTitle}>Assistant IA</Text>
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
            <Feather name="filter" size={14} color={colors.accentPrimary} />
            <Text style={styles.resultsInfoText}>
              {filteredResults.length} remède{filteredResults.length > 1 ? 's' : ''} correspondant{filteredResults.length > 1 ? 's' : ''}
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
                onPress={() => handleOptionSelect(currentQuestion.id, option.id, option.filterFn)}
                activeOpacity={0.7}
              >
                <Text style={styles.optionText}>{option.label}</Text>
                <Feather name="chevron-right" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Skip button */}
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipText}>Passer cette question</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  container: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: colors.surfaceCard,
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
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accentPrimaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginLeft: spacing.md,
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
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 28,
  },
  optionsContainer: {
    maxHeight: 280,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionText: {
    fontSize: 16,
    color: colors.textPrimary,
    flex: 1,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.md,
  },
  skipText: {
    fontSize: 14,
    color: colors.textMuted,
    textDecorationLine: 'underline',
  },
});

export default AISearchRefinement;
