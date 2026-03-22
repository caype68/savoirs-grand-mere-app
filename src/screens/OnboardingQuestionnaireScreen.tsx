import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, typography } from '../theme/colors';
import {
  UserProfile,
  HealthGoal,
  RemedyFormat,
  ProfileType,
  ExperienceLevel,
  Gender,
  NotificationFrequency,
} from '../types';
import { createDefaultProfile, saveUserProfile } from '../services/storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============================================
// CONFIGURATION DES ÉTAPES DU QUESTIONNAIRE
// ============================================

interface QuestionOption {
  id: string;
  label: string;
  emoji: string;
  description?: string;
}

interface QuestionStep {
  id: string;
  title: string;
  subtitle: string;
  type: 'single' | 'multiple' | 'input' | 'slider';
  field: keyof UserProfile;
  options?: QuestionOption[];
  placeholder?: string;
  required?: boolean;
  maxSelections?: number;
}

const QUESTIONNAIRE_STEPS: QuestionStep[] = [
  {
    id: 'welcome',
    title: 'Bienvenue !',
    subtitle: 'Personnalisons votre expérience en quelques questions',
    type: 'single',
    field: 'profileType',
    options: [
      { id: 'adulte', label: 'Adulte', emoji: '👤', description: '18-65 ans' },
      { id: 'senior', label: 'Senior', emoji: '👴', description: '65+ ans' },
      { id: 'enceinte', label: 'Enceinte', emoji: '🤰', description: 'Grossesse en cours' },
      { id: 'allaitante', label: 'Allaitante', emoji: '🤱', description: 'Allaitement en cours' },
    ],
    required: true,
  },
  {
    id: 'age',
    title: 'Quel est votre âge ?',
    subtitle: 'Pour adapter les recommandations',
    type: 'input',
    field: 'age',
    placeholder: 'Votre âge',
  },
  {
    id: 'sexe',
    title: 'Vous êtes...',
    subtitle: 'Pour personnaliser certains conseils',
    type: 'single',
    field: 'sexe',
    options: [
      { id: 'femme', label: 'Une femme', emoji: '👩' },
      { id: 'homme', label: 'Un homme', emoji: '👨' },
      { id: 'non_precise', label: 'Je préfère ne pas préciser', emoji: '🙂' },
    ],
  },
  {
    id: 'objectifs',
    title: 'Quels sont vos objectifs ?',
    subtitle: 'Sélectionnez jusqu\'à 5 objectifs principaux',
    type: 'multiple',
    field: 'objectifs',
    maxSelections: 5,
    options: [
      { id: 'sommeil', label: 'Mieux dormir', emoji: '😴' },
      { id: 'digestion', label: 'Améliorer la digestion', emoji: '🍃' },
      { id: 'stress', label: 'Réduire le stress', emoji: '🧘' },
      { id: 'immunite', label: 'Renforcer l\'immunité', emoji: '🛡️' },
      { id: 'peau', label: 'Prendre soin de ma peau', emoji: '✨' },
      { id: 'douleurs', label: 'Soulager les douleurs', emoji: '💪' },
      { id: 'energie', label: 'Retrouver de l\'énergie', emoji: '⚡' },
      { id: 'respiration', label: 'Améliorer la respiration', emoji: '🌬️' },
      { id: 'circulation', label: 'Favoriser la circulation', emoji: '❤️' },
      { id: 'detox', label: 'Détoxifier l\'organisme', emoji: '🌿' },
    ],
    required: true,
  },
  {
    id: 'formats',
    title: 'Quels formats préférez-vous ?',
    subtitle: 'Les types de remèdes que vous aimez utiliser',
    type: 'multiple',
    field: 'formatsPreferes',
    options: [
      { id: 'infusion', label: 'Infusions', emoji: '🍵' },
      { id: 'tisane', label: 'Tisanes', emoji: '🫖' },
      { id: 'sirop', label: 'Sirops', emoji: '🍯' },
      { id: 'inhalation', label: 'Inhalations', emoji: '💨' },
      { id: 'cataplasme', label: 'Cataplasmes', emoji: '🩹' },
      { id: 'friction', label: 'Frictions', emoji: '🤲' },
      { id: 'bain', label: 'Bains', emoji: '🛁' },
      { id: 'gargarisme', label: 'Gargarismes', emoji: '💧' },
    ],
  },
  {
    id: 'experience',
    title: 'Votre niveau d\'expérience',
    subtitle: 'Avec les remèdes naturels',
    type: 'single',
    field: 'niveauExperience',
    options: [
      { id: 'debutant', label: 'Débutant', emoji: '🌱', description: 'Je découvre les remèdes naturels' },
      { id: 'intermediaire', label: 'Intermédiaire', emoji: '🌿', description: 'J\'en utilise occasionnellement' },
      { id: 'expert', label: 'Expert', emoji: '🌳', description: 'Je pratique régulièrement' },
    ],
    required: true,
  },
  {
    id: 'allergies',
    title: 'Avez-vous des allergies ?',
    subtitle: 'Pour éviter les remèdes incompatibles',
    type: 'multiple',
    field: 'allergies',
    options: [
      { id: 'abeilles', label: 'Produits de la ruche', emoji: '🐝' },
      { id: 'asteracees', label: 'Astéracées (camomille...)', emoji: '🌼' },
      { id: 'lamiacees', label: 'Lamiacées (menthe, thym...)', emoji: '🌿' },
      { id: 'agrumes', label: 'Agrumes', emoji: '🍋' },
      { id: 'fruits_a_coque', label: 'Fruits à coque', emoji: '🥜' },
    ],
  },
  {
    id: 'notifications',
    title: 'Notifications',
    subtitle: 'Recevez des conseils personnalisés',
    type: 'single',
    field: 'notificationFrequency',
    options: [
      { id: 'quotidien', label: 'Quotidien', emoji: '📱', description: 'Un conseil par jour' },
      { id: '2-3_semaine', label: '2-3 fois/semaine', emoji: '📬', description: 'Quelques rappels' },
      { id: 'hebdomadaire', label: 'Hebdomadaire', emoji: '📅', description: 'Un résumé par semaine' },
      { id: 'jamais', label: 'Jamais', emoji: '🔕', description: 'Pas de notifications' },
    ],
  },
  {
    id: 'produits',
    title: 'Recommandations produits',
    subtitle: 'Souhaitez-vous voir des produits recommandés ?',
    type: 'single',
    field: 'interesseParProduits',
    options: [
      { id: 'true', label: 'Oui, avec plaisir', emoji: '🛒', description: 'Voir les produits utiles' },
      { id: 'false', label: 'Non merci', emoji: '🚫', description: 'Juste les remèdes' },
    ],
  },
];

interface OnboardingQuestionnaireScreenProps {
  onComplete: () => void;
}

export const OnboardingQuestionnaireScreen: React.FC<OnboardingQuestionnaireScreenProps> = ({
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [profile, setProfile] = useState<Partial<UserProfile>>(createDefaultProfile());
  const [inputValue, setInputValue] = useState('');
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const step = QUESTIONNAIRE_STEPS[currentStep];
  const progress = (currentStep + 1) / QUESTIONNAIRE_STEPS.length;

  const animateTransition = (direction: 'next' | 'prev', callback: () => void) => {
    const toValue = direction === 'next' ? -SCREEN_WIDTH : SCREEN_WIDTH;
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      callback();
      slideAnim.setValue(direction === 'next' ? SCREEN_WIDTH : -SCREEN_WIDTH);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const handleNext = async () => {
    if (currentStep < QUESTIONNAIRE_STEPS.length - 1) {
      animateTransition('next', () => setCurrentStep(currentStep + 1));
    } else {
      // Sauvegarder le profil et terminer
      console.log('🎉 Onboarding: Saving final profile...');
      const finalProfile: UserProfile = {
        ...createDefaultProfile(),
        ...profile,
        onboardingCompleted: true,
        updatedAt: new Date().toISOString(),
      };
      console.log('🎉 Onboarding: Final profile:', JSON.stringify(finalProfile, null, 2));
      await saveUserProfile(finalProfile);
      console.log('🎉 Onboarding: Profile saved, calling onComplete...');
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      animateTransition('prev', () => setCurrentStep(currentStep - 1));
    }
  };

  const handleSkip = () => {
    handleNext();
  };

  const handleSingleSelect = (optionId: string) => {
    const field = step.field;
    let value: any = optionId;
    
    // Convertir les valeurs spéciales
    if (optionId === 'true') value = true;
    if (optionId === 'false') value = false;
    
    setProfile(prev => ({ ...prev, [field]: value }));
    
    // Auto-avancer après sélection
    setTimeout(() => handleNext(), 300);
  };

  const handleMultipleSelect = (optionId: string) => {
    const field = step.field;
    const currentValues = (profile[field] as string[] | undefined) || [];
    const maxSelections = step.maxSelections || 10;
    
    let newValues: string[];
    if (currentValues.includes(optionId)) {
      newValues = currentValues.filter(v => v !== optionId);
    } else if (currentValues.length < maxSelections) {
      newValues = [...currentValues, optionId];
    } else {
      return; // Max atteint
    }
    
    setProfile(prev => ({ ...prev, [field]: newValues as any }));
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    if (step.field === 'age') {
      const age = parseInt(value, 10);
      if (!isNaN(age)) {
        setProfile(prev => ({ ...prev, age }));
      }
    }
  };

  const isOptionSelected = (optionId: string): boolean => {
    const value = profile[step.field] as unknown;
    if (Array.isArray(value)) {
      return (value as string[]).includes(optionId);
    }
    if (typeof value === 'boolean') {
      return optionId === String(value);
    }
    return value === optionId;
  };

  const canProceed = (): boolean => {
    if (!step.required) return true;
    const value = profile[step.field];
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== null && value !== '';
  };

  const renderOption = (option: QuestionOption) => {
    const selected = isOptionSelected(option.id);
    const isMultiple = step.type === 'multiple';
    
    return (
      <TouchableOpacity
        key={option.id}
        style={[
          styles.optionCard,
          selected && styles.optionCardSelected,
        ]}
        onPress={() => {
          if (isMultiple) {
            handleMultipleSelect(option.id);
          } else {
            handleSingleSelect(option.id);
          }
        }}
        activeOpacity={0.7}
      >
        <View style={styles.optionContent}>
          <Text style={styles.optionEmoji}>{option.emoji}</Text>
          <View style={styles.optionTextContainer}>
            <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>
              {option.label}
            </Text>
            {option.description && (
              <Text style={styles.optionDescription}>{option.description}</Text>
            )}
          </View>
        </View>
        {isMultiple && (
          <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
            {selected && <Feather name="check" size={14} color="#fff" />}
          </View>
        )}
        {!isMultiple && selected && (
          <Feather name="check-circle" size={22} color={colors.accentPrimary} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header avec progression */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handlePrev}
            disabled={currentStep === 0}
          >
            {currentStep > 0 && (
              <Feather name="arrow-left" size={24} color={colors.textPrimary} />
            )}
          </TouchableOpacity>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <Animated.View 
                style={[
                  styles.progressFill,
                  { width: `${progress * 100}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {currentStep + 1} / {QUESTIONNAIRE_STEPS.length}
            </Text>
          </View>
          
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipText}>Passer</Text>
          </TouchableOpacity>
        </View>

        {/* Contenu de l'étape */}
        <KeyboardAvoidingView 
          style={styles.content}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Animated.View 
            style={[
              styles.stepContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateX: slideAnim }],
              }
            ]}
          >
            <Text style={styles.stepTitle}>{step.title}</Text>
            <Text style={styles.stepSubtitle}>{step.subtitle}</Text>

            {step.type === 'input' ? (
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  value={inputValue}
                  onChangeText={handleInputChange}
                  placeholder={step.placeholder}
                  placeholderTextColor={colors.textMuted}
                  keyboardType={step.field === 'age' ? 'numeric' : 'default'}
                  maxLength={step.field === 'age' ? 3 : 100}
                />
              </View>
            ) : (
              <ScrollView 
                style={styles.optionsContainer}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.optionsContent}
              >
                {step.options?.map(renderOption)}
              </ScrollView>
            )}
          </Animated.View>
        </KeyboardAvoidingView>

        {/* Footer avec bouton continuer */}
        <View style={styles.footer}>
          {step.type === 'multiple' && (
            <Text style={styles.selectionCount}>
              {((profile[step.field] as string[]) || []).length} sélectionné(s)
              {step.maxSelections && ` (max ${step.maxSelections})`}
            </Text>
          )}
          
          <TouchableOpacity
            style={[
              styles.continueButton,
              !canProceed() && styles.continueButtonDisabled,
            ]}
            onPress={handleNext}
            disabled={!canProceed() && step.required}
          >
            <LinearGradient
              colors={canProceed() ? [colors.accentPrimary, '#7C3AED'] : ['#374151', '#374151']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.continueButtonGradient}
            >
              <Text style={styles.continueButtonText}>
                {currentStep === QUESTIONNAIRE_STEPS.length - 1 ? 'Terminer' : 'Continuer'}
              </Text>
              <Feather name="arrow-right" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: colors.surfaceHighlight,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accentPrimary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  skipButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  skipText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  content: {
    flex: 1,
  },
  stepContainer: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  stepSubtitle: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  optionsContainer: {
    flex: 1,
  },
  optionsContent: {
    paddingBottom: spacing.xl,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardSelected: {
    borderColor: colors.accentPrimary,
    backgroundColor: colors.accentPrimaryMuted,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionEmoji: {
    fontSize: 28,
    marginRight: spacing.md,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  optionLabelSelected: {
    color: colors.accentPrimary,
  },
  optionDescription: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.accentPrimary,
    borderColor: colors.accentPrimary,
  },
  inputContainer: {
    marginTop: spacing.xl,
  },
  textInput: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    fontSize: 18,
    color: colors.textPrimary,
    textAlign: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  selectionCount: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  continueButton: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg + 2,
    gap: spacing.sm,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});

export default OnboardingQuestionnaireScreen;
