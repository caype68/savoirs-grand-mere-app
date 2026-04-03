import React, { useState, useEffect, useRef } from 'react';
import { Image, StyleSheet, View, ActivityIndicator, Platform, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  BeginnerGuideScreen,
  PrivacyPolicyScreen,
  TermsOfUseScreen,
  AuthScreen,
  PremiumScreen,
} from '../screens';
import { isOnboardingCompleted } from '../services/storage';
import { getCurrentUser } from '../services/supabase/authApi';
import { getSupabaseClient } from '../services/supabase/config';

export type RootStackParamList = {
  Intro: undefined;
  Onboarding: undefined;
  Auth: undefined;
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
  BeginnerGuide: undefined;
  PrivacyPolicy: undefined;
  TermsOfUse: undefined;
  Premium: undefined;
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
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 10);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0A0A0F',
          borderTopColor: '#1A1A22',
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: bottomPadding,
          height: 60 + bottomPadding,
          elevation: 8,
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const isPasswordRecovery = useRef(false);

  useEffect(() => {
    checkInitialState();
  }, []);

  // Détecter le mode récupération de mot de passe dans l'URL au démarrage
  useEffect(() => {
    if (Platform.OS === 'web') {
      const hash = window.location.hash || '';
      const search = window.location.search || '';
      if (hash.includes('type=recovery') || search.includes('type=recovery')) {
        console.log('🔑 AppNavigator: Password recovery detected in URL');
        isPasswordRecovery.current = true;
      }
    }
  }, []);

  // Écouter les retours OAuth (Google Sign-In) et PASSWORD_RECOVERY
  useEffect(() => {
    const client = getSupabaseClient();
    if (!client) return;

    const { data: { subscription } } = client.auth.onAuthStateChange(
      (event: string, session: any) => {
        console.log('🔑 AppNavigator: Auth event:', event);

        // Si c'est une récupération de mot de passe, ne PAS rediriger vers MainTabs
        if (event === 'PASSWORD_RECOVERY') {
          console.log('🔑 AppNavigator: PASSWORD_RECOVERY — staying on Auth screen');
          isPasswordRecovery.current = true;
          // On reste sur l'écran Auth pour afficher le formulaire nouveau mdp
          setIsAuthenticated(false);
          return;
        }

        if (event === 'SIGNED_IN' && session?.user) {
          // Vérifier si c'est un recovery — ne pas rediriger
          if (isPasswordRecovery.current) {
            console.log('🔑 AppNavigator: SIGNED_IN during recovery — blocking redirect');
            return;
          }
          console.log('✅ AppNavigator: Auth success via OAuth, navigating to MainTabs...');
          setIsAuthenticated(true);
        } else if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false);
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const checkInitialState = async () => {
    console.log('🔍 AppNavigator: Checking onboarding status...');
    const completed = await isOnboardingCompleted();
    console.log('🔍 AppNavigator: Onboarding completed:', completed);
    setHasCompletedOnboarding(completed);

    // Si on est en mode recovery, ne pas auto-connecter
    if (isPasswordRecovery.current) {
      console.log('🔍 AppNavigator: Recovery mode — skipping auto-auth');
      setIsLoading(false);
      return;
    }

    // Vérifier si l'utilisateur est déjà authentifié
    try {
      const authState = await getCurrentUser();
      console.log('🔍 AppNavigator: Auth state:', authState.isAuthenticated);
      setIsAuthenticated(authState.isAuthenticated);
    } catch (e) {
      console.warn('AppNavigator: Auth check failed', e);
    }

    setIsLoading(false);
  };

  const handleOnboardingComplete = () => {
    console.log('✅ AppNavigator: Onboarding complete, navigating to Auth...');
    setHasCompletedOnboarding(true);
  };

  const handleAuthSuccess = () => {
    console.log('✅ AppNavigator: Auth success, navigating to MainTabs...');
    setIsAuthenticated(true);
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
      initialRouteName={
        !hasCompletedOnboarding ? 'Intro' :
        !isAuthenticated ? 'Auth' :
        'MainTabs'
      }
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
            navigation.replace('Auth');
          }} />
        )}
      </Stack.Screen>
      <Stack.Screen name="Auth">
        {({ navigation }) => (
          <AuthScreen onAuthSuccess={() => {
            handleAuthSuccess();
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
      <Stack.Screen
        name="BeginnerGuide"
        component={BeginnerGuideScreen}
        options={{
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="TermsOfUse"
        component={TermsOfUseScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="Premium"
        component={PremiumScreen}
        options={{
          animation: 'slide_from_bottom',
          presentation: 'modal',
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
