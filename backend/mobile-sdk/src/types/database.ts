// ============================================
// TYPES GÉNÉRÉS DEPUIS LE SCHÉMA SUPABASE
// ============================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      // ============================================
      // REMÈDES
      // ============================================
      remedies: {
        Row: {
          id: string;
          slug: string;
          name: string;
          aliases: string[] | null;
          common_misspellings: string[] | null;
          route: 'orale' | 'cutanee' | 'inhalation' | 'gargarisme' | 'nasale' | 'diffusion' | 'bain';
          description: string | null;
          preparation_time: string | null;
          usage_duration: string | null;
          posology_frequency: string | null;
          posology_duration: string | null;
          posology_notes: string | null;
          indications: string[];
          contraindications: string[];
          precautions: string[] | null;
          source_book: string | null;
          source_author: string | null;
          source_year: string | null;
          source_page: number | null;
          source_confidence: number | null;
          difficulty_level: 'debutant' | 'intermediaire' | 'expert';
          is_verified: boolean;
          view_count: number;
          status: 'draft' | 'published' | 'archived';
          published_at: string | null;
          featured: boolean;
          featured_until: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['remedies']['Row'], 'id' | 'created_at' | 'updated_at' | 'view_count'>;
        Update: Partial<Database['public']['Tables']['remedies']['Insert']>;
      };

      // ============================================
      // INGRÉDIENTS
      // ============================================
      ingredients: {
        Row: {
          id: string;
          slug: string;
          name: string;
          aliases: string[] | null;
          type: 'plante' | 'mineral' | 'animal' | 'autre';
          description: string | null;
          interactions: string[] | null;
          contraindications: string[] | null;
          image_url: string | null;
          status: 'draft' | 'published' | 'archived';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['ingredients']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['ingredients']['Insert']>;
      };

      // ============================================
      // HUILES ESSENTIELLES
      // ============================================
      essential_oils: {
        Row: {
          id: string;
          slug: string;
          name: string;
          latin_name: string | null;
          aliases: string[] | null;
          plant_part: string | null;
          extraction_method: string | null;
          origin_countries: string[] | null;
          properties: string[] | null;
          main_components: string[] | null;
          scent_description: string | null;
          usage_methods: string[] | null;
          dilution_rate: string | null;
          contraindications: string[] | null;
          precautions: string[] | null;
          is_photosensitizing: boolean;
          is_dermocaustic: boolean;
          min_age: number | null;
          pregnancy_safe: boolean;
          image_url: string | null;
          difficulty_level: 'debutant' | 'intermediaire' | 'expert';
          view_count: number;
          status: 'draft' | 'published' | 'archived';
          published_at: string | null;
          featured: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['essential_oils']['Row'], 'id' | 'created_at' | 'updated_at' | 'view_count'>;
        Update: Partial<Database['public']['Tables']['essential_oils']['Insert']>;
      };

      // ============================================
      // PRODUITS AFFILIÉS
      // ============================================
      affiliate_products: {
        Row: {
          id: string;
          asin: string | null;
          search_query: string | null;
          title: string;
          subtitle: string | null;
          description: string | null;
          ingredient_name: string | null;
          price_label: string | null;
          price_min: number | null;
          price_max: number | null;
          category: string;
          badge: string | null;
          amazon_url: string | null;
          image_url: string | null;
          is_essential: boolean;
          sort_order: number;
          click_count: number;
          impression_count: number;
          status: 'draft' | 'published' | 'archived';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['affiliate_products']['Row'], 'id' | 'created_at' | 'updated_at' | 'click_count' | 'impression_count'>;
        Update: Partial<Database['public']['Tables']['affiliate_products']['Insert']>;
      };

      // ============================================
      // PROFILS UTILISATEURS
      // ============================================
      user_profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          age: number | null;
          gender: string | null;
          profile_type: 'adulte' | 'enfant' | 'senior' | 'enceinte' | 'allaitante';
          experience_level: 'debutant' | 'intermediaire' | 'expert';
          preferred_formats: string[] | null;
          allergies: string[] | null;
          restrictions: string[] | null;
          notifications_enabled: boolean;
          notification_frequency: 'jamais' | 'quotidien' | 'hebdomadaire' | '2-3_semaine';
          notification_morning_time: string;
          notification_evening_time: string;
          is_premium: boolean;
          premium_plan: string | null;
          premium_expires_at: string | null;
          onboarding_completed: boolean;
          onboarding_completed_at: string | null;
          timezone: string;
          locale: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['user_profiles']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['user_profiles']['Insert']>;
      };

      // ============================================
      // OBJECTIFS UTILISATEURS
      // ============================================
      user_goals: {
        Row: {
          id: string;
          user_id: string;
          goal_type: string;
          name: string;
          icon: string | null;
          priority: number;
          is_active: boolean;
          progress: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['user_goals']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['user_goals']['Insert']>;
      };

      // ============================================
      // JOURNAL BIEN-ÊTRE
      // ============================================
      wellness_logs: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          sleep_quality: number | null;
          stress_level: number | null;
          energy_level: number | null;
          mood_level: number | null;
          hydration_level: number | null;
          digestion_level: number | null;
          sleep_hours: number | null;
          sleep_difficulty: boolean;
          night_wakings: boolean;
          symptoms: string[] | null;
          notes: string | null;
          is_validated: boolean;
          validated_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['wellness_logs']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['wellness_logs']['Insert']>;
      };

      // ============================================
      // RECOMMANDATIONS QUOTIDIENNES
      // ============================================
      daily_recommendations: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          remedy_id: string | null;
          essential_oil_id: string | null;
          category: string | null;
          reason: string;
          matched_tags: string[] | null;
          match_score: number;
          priority: number;
          is_viewed: boolean;
          viewed_at: string | null;
          is_saved: boolean;
          saved_at: string | null;
          wellness_log_id: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['daily_recommendations']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['daily_recommendations']['Insert']>;
      };

      // ============================================
      // ROUTINES QUOTIDIENNES
      // ============================================
      daily_routines: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          morning_remedy_ids: string[] | null;
          morning_tips: string[] | null;
          morning_duration: string | null;
          morning_completed: boolean;
          morning_completed_at: string | null;
          evening_remedy_ids: string[] | null;
          evening_tips: string[] | null;
          evening_duration: string | null;
          evening_completed: boolean;
          evening_completed_at: string | null;
          based_on_goals: string[] | null;
          based_on_wellness_log: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['daily_routines']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['daily_routines']['Insert']>;
      };

      // ============================================
      // STREAKS
      // ============================================
      streaks: {
        Row: {
          id: string;
          user_id: string;
          current_streak: number;
          best_streak: number;
          total_active_days: number;
          last_active_date: string | null;
          streak_start_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['streaks']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['streaks']['Insert']>;
      };

      // ============================================
      // BADGES
      // ============================================
      badges: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          icon: string | null;
          badge_type: 'streak' | 'usage' | 'exploration' | 'special';
          required_value: number | null;
          color: string | null;
          image_url: string | null;
          status: 'draft' | 'published' | 'archived';
          sort_order: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['badges']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['badges']['Insert']>;
      };

      // ============================================
      // CONTENU QUOTIDIEN
      // ============================================
      daily_content: {
        Row: {
          id: string;
          date: string;
          remedy_of_day_id: string | null;
          remedy_of_day_reason: string | null;
          tip_title: string | null;
          tip_content: string | null;
          tip_icon: string | null;
          mistake_title: string | null;
          mistake_content: string | null;
          status: 'draft' | 'published' | 'archived';
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['daily_content']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['daily_content']['Insert']>;
      };

      // ============================================
      // CATÉGORIES
      // ============================================
      categories: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          icon: string | null;
          color: string | null;
          parent_id: string | null;
          sort_order: number;
          status: 'draft' | 'published' | 'archived';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['categories']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['categories']['Insert']>;
      };
    };
  };
}

// ============================================
// TYPES UTILITAIRES
// ============================================

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

// Alias pour faciliter l'utilisation
export type Remedy = Tables<'remedies'>;
export type Ingredient = Tables<'ingredients'>;
export type EssentialOil = Tables<'essential_oils'>;
export type AffiliateProduct = Tables<'affiliate_products'>;
export type UserProfile = Tables<'user_profiles'>;
export type UserGoal = Tables<'user_goals'>;
export type WellnessLog = Tables<'wellness_logs'>;
export type DailyRecommendation = Tables<'daily_recommendations'>;
export type DailyRoutine = Tables<'daily_routines'>;
export type Streak = Tables<'streaks'>;
export type Badge = Tables<'badges'>;
export type DailyContent = Tables<'daily_content'>;
export type Category = Tables<'categories'>;
