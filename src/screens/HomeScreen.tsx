import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing } from '../theme/colors';
import { textures } from '../assets';
import {
  AppBrandHeader,
  PrimarySearchBar,
  SearchModeSwitcher,
  SearchMode,
  QuickSymptomChips,
  BodyAreaSelectorCard,
  RemedyTypeGrid,
  MedicalDisclaimerBanner,
  PopularMethodsSection,
  FeaturedRemediesSection,
  DailyRecommendationSection,
} from '../components/home';
import { AIQuestionFlow } from '../components';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

const symptomToSearchTerm: Record<string, string> = {
  gorge: 'gorge',
  toux: 'toux',
  fievre: 'fièvre',
  stress: 'stress',
  sommeil: 'sommeil',
  digestion: 'digestion',
  tete: 'tête',
  muscles: 'douleurs musculaires',
};

const bodyZoneToSearchTerm: Record<string, string> = {
  tete: 'tête',
  gorge: 'gorge',
  poitrine: 'respiration',
  ventre: 'digestion',
  bras: 'douleurs',
  dos: 'dos',
  jambes: 'jambes',
};

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState<SearchMode>('symptom');
  const [selectedSymptom, setSelectedSymptom] = useState<string | null>(null);
  const [selectedBodyZone, setSelectedBodyZone] = useState<string | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<'orale' | 'cutanee' | 'inhalation' | null>(null);
  const [selectedSubType, setSelectedSubType] = useState<string | null>(null);
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [pendingSearchTerm, setPendingSearchTerm] = useState('');

  const handleSearch = (query: string) => {
    if (query.trim()) {
      setPendingSearchTerm(query);
      setShowZoneModal(true);
    }
  };

  const handleZoneSelected = (zone: string) => {
    setShowZoneModal(false);
    if (zone === 'all') {
      navigation.navigate('Results', { searchTerm: pendingSearchTerm });
    } else {
      navigation.navigate('Results', { searchTerm: pendingSearchTerm, zone, mode: 'body' });
    }
    setPendingSearchTerm('');
    setSearchQuery('');
  };

  const handleSymptomSelect = (symptomId: string) => {
    setSelectedSymptom(symptomId);
    const searchTerm = symptomToSearchTerm[symptomId] || symptomId;
    navigation.navigate('Results', { searchTerm, mode: 'symptom' });
  };

  const handleBodyZoneSelect = (zone: string) => {
    setSelectedBodyZone(zone);
    const searchTerm = bodyZoneToSearchTerm[zone] || zone;
    navigation.navigate('Results', { searchTerm, mode: 'body', zone });
  };

  const handleRouteSelect = (route: 'orale' | 'cutanee' | 'inhalation') => {
    setSelectedRoute(route);
    navigation.navigate('Results', { route, mode: 'type' });
  };

  const handleSubTypeSelect = (subType: string) => {
    setSelectedSubType(subType);
    navigation.navigate('Results', { subType, mode: 'type' });
  };

  const handleMethodSelect = (methodId: string) => {
    navigation.navigate('Results', { method: methodId, mode: 'type' });
  };

  const handleRemedySelect = (remedyId: string) => {
    navigation.navigate('RemedeDetail', { remedeId: remedyId });
  };

  const renderSearchModeContent = () => {
    switch (searchMode) {
      case 'symptom':
        return (
          <QuickSymptomChips
            selectedSymptom={selectedSymptom}
            onSelectSymptom={handleSymptomSelect}
          />
        );
      case 'body':
        return (
          <BodyAreaSelectorCard
            selectedZone={selectedBodyZone as any}
            onSelectZone={handleBodyZoneSelect as any}
          />
        );
      case 'type':
        return (
          <RemedyTypeGrid
            selectedRoute={selectedRoute}
            selectedSubType={selectedSubType as any}
            onSelectRoute={handleRouteSelect}
            onSelectSubType={handleSubTypeSelect as any}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={textures.grainDark}
        style={styles.backgroundTexture}
        resizeMode="repeat"
      >
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Brand Header */}
            <AppBrandHeader />

            {/* Primary Search Bar */}
            <PrimarySearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmit={() => handleSearch(searchQuery)}
            />

            {/* Search Mode Switcher */}
            <SearchModeSwitcher
              activeMode={searchMode}
              onModeChange={setSearchMode}
            />

            {/* Dynamic Content Based on Mode */}
            {renderSearchModeContent()}

            {/* Daily Recommendation */}
            <DailyRecommendationSection
              onViewRemedy={handleRemedySelect}
              onFillWellnessLog={() => navigation.navigate('Wellness')}
            />

            {/* Medical Disclaimer */}
            <MedicalDisclaimerBanner />

            {/* Popular Methods */}
            <PopularMethodsSection onSelectMethod={handleMethodSelect} />

            {/* Featured Remedies */}
            <FeaturedRemediesSection onSelectRemedy={handleRemedySelect} />

            {/* Bottom spacing */}
            <View style={styles.bottomSpacer} />
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>

      {/* AI Question Flow Modal */}
      <AIQuestionFlow
        visible={showZoneModal}
        searchTerm={pendingSearchTerm}
        onComplete={(refinedTerm, filteredIds) => {
          setShowZoneModal(false);
          navigation.navigate('Results', { searchTerm: refinedTerm, filteredIds });
          setPendingSearchTerm('');
          setSearchQuery('');
        }}
        onSkip={() => {
          setShowZoneModal(false);
          navigation.navigate('Results', { searchTerm: pendingSearchTerm });
          setPendingSearchTerm('');
          setSearchQuery('');
        }}
        onClose={() => setShowZoneModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backgroundTexture: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  bottomSpacer: {
    height: 100,
  },
});
