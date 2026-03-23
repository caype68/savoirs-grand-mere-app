import React, { useState, useEffect } from 'react';
import { Image, StyleSheet, View, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { navIcons } from '../assets';
import {
  HomeScreen,
  ResultsScreen,
  RemedeDetailScreen,
  IngredientDetailScreen,
  ExploreScreen,
  FavorisScreen,
  CompareScreen,
  OnboardingScreen,
  OnboardingQuestionnaireScreen,
  WellnessScreen,
  ProfileScreen,
  EssentialOilsScreen,
  EssentialOilDetailScreen,
} from '../screens';
import { isOnboardingCompleted } from '../services/storage';

export type RootStackParamList = {
  Intro: undefined;
  Onboarding: undefined;
  MainTabs: undefined;
  RemedeDetail: { remedeId: string };
  IngredientDetail: { ingredientId: string };
  Results: { 
    searchTerm?: string; 
    mode?: 'symptom' | 'body' | 'type';
    zone?: string;
    route?: 'orale' | 'cutanee' | 'inhalation';
    subType?: string;
    method?: string;
    filteredIds?: string[]; // IDs des remèdes filtrés par l'IA
  };
  Compare: { remedeIds: string[] };
  Wellness: undefined;
  EssentialOils: undefined;
  EssentialOilDetail: { oilId: string };
  EssentialOilRemedyDetail: { remedyId: string };
};

export type TabParamList = {
  Accueil: undefined;
  Bienetre: undefined;
  Favoris: undefined;
  Explorer: undefined;
  Profil: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0A0A0F',
          borderTopColor: '#1A1A22',
          borderTopWidth: 1,
          paddingTop: 10,
          paddingBottom: 10,
          height: 75,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: colors.accentPrimary,
        tabBarInactiveTintColor: '#8B8B9A',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginTop: 6,
        },
        tabBarIconStyle: {
          marginBottom: -4,
        },
      }}
    >
      <Tab.Screen
        name="Accueil"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Image 
              source={navIcons.chercheur} 
              style={[styles.tabIcon, focused && styles.tabIconActive]} 
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tab.Screen
        name="Bienetre"
        component={WellnessScreen}
        options={{
          tabBarLabel: 'Bien-être',
          tabBarIcon: ({ focused }) => (
            <Feather 
              name="heart" 
              size={24} 
              color={focused ? colors.accentPrimary : '#8B8B9A'} 
            />
          ),
        }}
      />
      <Tab.Screen
        name="Favoris"
        component={FavorisScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Image 
              source={navIcons.favoris} 
              style={[styles.tabIcon, focused && styles.tabIconActive]} 
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tab.Screen
        name="Explorer"
        component={ExploreScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Image 
              source={navIcons.explorateur} 
              style={[styles.tabIcon, focused && styles.tabIconActive]} 
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profil"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profil',
          tabBarIcon: ({ focused }) => (
            <Feather 
              name="user" 
              size={24} 
              color={focused ? colors.accentPrimary : '#8B8B9A'} 
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    console.log('🔍 AppNavigator: Checking onboarding status...');
    const completed = await isOnboardingCompleted();
    console.log('🔍 AppNavigator: Onboarding completed:', completed);
    setHasCompletedOnboarding(completed);
    setIsLoading(false);
  };

  const handleOnboardingComplete = () => {
    console.log('✅ AppNavigator: Onboarding complete, navigating to MainTabs...');
    setHasCompletedOnboarding(true);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accentPrimary} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
      initialRouteName={hasCompletedOnboarding ? 'MainTabs' : 'Intro'}
    >
      <Stack.Screen name="Intro">
        {({ navigation }) => (
          <OnboardingScreen onComplete={() => navigation.replace('Onboarding')} />
        )}
      </Stack.Screen>
      <Stack.Screen name="Onboarding">
        {({ navigation }) => (
          <OnboardingQuestionnaireScreen onComplete={() => {
            handleOnboardingComplete();
            navigation.replace('MainTabs');
          }} />
        )}
      </Stack.Screen>
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen 
        name="Results" 
        component={ResultsScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen 
        name="RemedeDetail" 
        component={RemedeDetailScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen 
        name="IngredientDetail" 
        component={IngredientDetailScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen 
        name="Compare" 
        component={CompareScreen}
        options={{
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen 
        name="Wellness" 
        component={WellnessScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen 
        name="EssentialOils" 
        component={EssentialOilsScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen 
        name="EssentialOilDetail" 
        component={EssentialOilDetailScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  tabIcon: {
    width: 28,
    height: 28,
    opacity: 0.6,
  },
  tabIconActive: {
    opacity: 1,
  },
});
