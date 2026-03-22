-- ============================================
-- SCHÉMA INITIAL - SAVOIRS DE GRAND-MÈRE
-- Base de données PostgreSQL (Supabase)
-- ============================================

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ÉNUMÉRATIONS
-- ============================================

CREATE TYPE ingredient_type AS ENUM ('plante', 'mineral', 'animal', 'autre');
CREATE TYPE remedy_route AS ENUM ('orale', 'cutanee', 'inhalation', 'gargarisme', 'nasale', 'diffusion', 'bain');
CREATE TYPE profile_type AS ENUM ('adulte', 'enfant', 'senior', 'enceinte', 'allaitante');
CREATE TYPE experience_level AS ENUM ('debutant', 'intermediaire', 'expert');
CREATE TYPE notification_frequency AS ENUM ('jamais', 'quotidien', 'hebdomadaire', '2-3_semaine');
CREATE TYPE content_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE badge_type AS ENUM ('streak', 'usage', 'exploration', 'special');
CREATE TYPE wellness_category AS ENUM ('sommeil', 'stress', 'energie', 'humeur', 'digestion', 'respiration', 'immunite', 'detente', 'concentration', 'douleurs', 'bien_etre_general');

-- ============================================
-- TABLE: categories
-- Catégories de remèdes et huiles essentielles
-- ============================================

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(7), -- Hex color
  parent_id UUID REFERENCES categories(id),
  sort_order INTEGER DEFAULT 0,
  status content_status DEFAULT 'published',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: remedies
-- Remèdes de grand-mère
-- ============================================

CREATE TABLE remedies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  aliases TEXT[], -- Noms alternatifs
  common_misspellings TEXT[], -- Fautes fréquentes pour la recherche
  route remedy_route NOT NULL,
  
  -- Contenu
  description TEXT,
  preparation_time VARCHAR(50), -- "10 min"
  usage_duration VARCHAR(50), -- "7 jours"
  
  -- Posologie
  posology_frequency VARCHAR(100),
  posology_duration VARCHAR(100),
  posology_notes TEXT,
  
  -- Indications et précautions
  indications TEXT[] NOT NULL DEFAULT '{}',
  contraindications TEXT[] NOT NULL DEFAULT '{}',
  precautions TEXT[],
  
  -- Source
  source_book VARCHAR(200),
  source_author VARCHAR(100),
  source_year VARCHAR(10),
  source_page INTEGER,
  source_confidence DECIMAL(3,2), -- 0.00 à 1.00
  
  -- Métadonnées
  difficulty_level experience_level DEFAULT 'debutant',
  is_verified BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  
  -- Publication
  status content_status DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  featured BOOLEAN DEFAULT FALSE,
  featured_until TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour la recherche
CREATE INDEX idx_remedies_name ON remedies USING gin(to_tsvector('french', name));
CREATE INDEX idx_remedies_indications ON remedies USING gin(indications);
CREATE INDEX idx_remedies_status ON remedies(status);

-- ============================================
-- TABLE: remedy_categories
-- Relation many-to-many remèdes <-> catégories
-- ============================================

CREATE TABLE remedy_categories (
  remedy_id UUID REFERENCES remedies(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (remedy_id, category_id)
);

-- ============================================
-- TABLE: ingredients
-- Ingrédients des remèdes
-- ============================================

CREATE TABLE ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  aliases TEXT[],
  type ingredient_type NOT NULL,
  description TEXT,
  
  -- Informations de sécurité
  interactions TEXT[],
  contraindications TEXT[],
  
  -- Métadonnées
  image_url TEXT,
  status content_status DEFAULT 'published',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: remedy_ingredients
-- Ingrédients d'un remède avec quantités
-- ============================================

CREATE TABLE remedy_ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  remedy_id UUID REFERENCES remedies(id) ON DELETE CASCADE,
  ingredient_id UUID REFERENCES ingredients(id) ON DELETE CASCADE,
  quantity VARCHAR(50),
  unit VARCHAR(30),
  notes TEXT,
  is_optional BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  UNIQUE(remedy_id, ingredient_id)
);

-- ============================================
-- TABLE: preparation_steps
-- Étapes de préparation d'un remède
-- ============================================

CREATE TABLE preparation_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  remedy_id UUID REFERENCES remedies(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  instruction TEXT NOT NULL,
  duration VARCHAR(50),
  tip TEXT,
  UNIQUE(remedy_id, step_number)
);

-- ============================================
-- TABLE: essential_oils
-- Huiles essentielles
-- ============================================

CREATE TABLE essential_oils (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  latin_name VARCHAR(150),
  aliases TEXT[],
  
  -- Informations botaniques
  plant_part VARCHAR(100), -- Partie de la plante
  extraction_method VARCHAR(100), -- Méthode d'extraction
  origin_countries TEXT[],
  
  -- Propriétés
  properties TEXT[], -- Propriétés thérapeutiques
  main_components TEXT[], -- Composants principaux
  scent_description TEXT, -- Description olfactive
  
  -- Utilisation
  usage_methods TEXT[], -- diffusion, massage, inhalation...
  dilution_rate VARCHAR(50), -- Taux de dilution recommandé
  
  -- Sécurité
  contraindications TEXT[],
  precautions TEXT[],
  is_photosensitizing BOOLEAN DEFAULT FALSE,
  is_dermocaustic BOOLEAN DEFAULT FALSE,
  min_age INTEGER, -- Âge minimum en années
  pregnancy_safe BOOLEAN DEFAULT FALSE,
  
  -- Métadonnées
  image_url TEXT,
  difficulty_level experience_level DEFAULT 'intermediaire',
  view_count INTEGER DEFAULT 0,
  
  -- Publication
  status content_status DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  featured BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_essential_oils_name ON essential_oils USING gin(to_tsvector('french', name));
CREATE INDEX idx_essential_oils_properties ON essential_oils USING gin(properties);

-- ============================================
-- TABLE: essential_oil_categories
-- Relation many-to-many HE <-> catégories
-- ============================================

CREATE TABLE essential_oil_categories (
  essential_oil_id UUID REFERENCES essential_oils(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (essential_oil_id, category_id)
);

-- ============================================
-- TABLE: essential_oil_remedies
-- Remèdes à base d'huiles essentielles
-- ============================================

CREATE TABLE essential_oil_remedies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  
  -- Utilisation
  usage_method VARCHAR(100), -- diffusion, massage, inhalation
  application_area TEXT, -- Zone d'application
  duration VARCHAR(50),
  frequency VARCHAR(100),
  
  -- Sécurité
  contraindications TEXT[],
  precautions TEXT[],
  
  -- Publication
  status content_status DEFAULT 'draft',
  view_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: essential_oil_remedy_oils
-- HE utilisées dans un remède aromathérapie
-- ============================================

CREATE TABLE essential_oil_remedy_oils (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  remedy_id UUID REFERENCES essential_oil_remedies(id) ON DELETE CASCADE,
  essential_oil_id UUID REFERENCES essential_oils(id) ON DELETE CASCADE,
  drops INTEGER, -- Nombre de gouttes
  percentage DECIMAL(5,2), -- Pourcentage dans le mélange
  notes TEXT,
  is_optional BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  UNIQUE(remedy_id, essential_oil_id)
);

-- ============================================
-- TABLE: affiliate_products
-- Produits Amazon affiliés
-- ============================================

CREATE TABLE affiliate_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Identifiants
  asin VARCHAR(10), -- ASIN Amazon
  search_query TEXT, -- Requête de recherche fallback
  
  -- Informations produit
  title VARCHAR(300) NOT NULL,
  subtitle VARCHAR(200),
  description TEXT,
  ingredient_name VARCHAR(100), -- Ingrédient lié
  
  -- Prix
  price_label VARCHAR(50), -- "~8,90 €"
  price_min DECIMAL(10,2),
  price_max DECIMAL(10,2),
  
  -- Catégorisation
  category VARCHAR(50) NOT NULL, -- huile_essentielle, plante, accessoire...
  badge VARCHAR(50), -- bio, recommande, premium...
  
  -- Liens
  amazon_url TEXT,
  image_url TEXT,
  
  -- Métadonnées
  is_essential BOOLEAN DEFAULT FALSE, -- Ingrédient principal
  sort_order INTEGER DEFAULT 0,
  
  -- Tracking
  click_count INTEGER DEFAULT 0,
  impression_count INTEGER DEFAULT 0,
  
  -- Publication
  status content_status DEFAULT 'published',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: remedy_affiliate_products
-- Relation remèdes <-> produits affiliés
-- ============================================

CREATE TABLE remedy_affiliate_products (
  remedy_id UUID REFERENCES remedies(id) ON DELETE CASCADE,
  product_id UUID REFERENCES affiliate_products(id) ON DELETE CASCADE,
  relevance_score INTEGER DEFAULT 50, -- 0-100
  PRIMARY KEY (remedy_id, product_id)
);

-- ============================================
-- TABLE: essential_oil_affiliate_products
-- Relation HE <-> produits affiliés
-- ============================================

CREATE TABLE essential_oil_affiliate_products (
  essential_oil_id UUID REFERENCES essential_oils(id) ON DELETE CASCADE,
  product_id UUID REFERENCES affiliate_products(id) ON DELETE CASCADE,
  relevance_score INTEGER DEFAULT 50,
  PRIMARY KEY (essential_oil_id, product_id)
);

-- ============================================
-- TABLE: user_profiles
-- Profils utilisateurs (extension de auth.users)
-- ============================================

CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Informations personnelles
  display_name VARCHAR(100),
  avatar_url TEXT,
  age INTEGER,
  gender VARCHAR(20),
  profile_type profile_type DEFAULT 'adulte',
  
  -- Préférences
  experience_level experience_level DEFAULT 'debutant',
  preferred_formats TEXT[], -- Formats de remèdes préférés
  allergies TEXT[],
  restrictions TEXT[],
  
  -- Notifications
  notifications_enabled BOOLEAN DEFAULT TRUE,
  notification_frequency notification_frequency DEFAULT 'quotidien',
  notification_morning_time TIME DEFAULT '08:00',
  notification_evening_time TIME DEFAULT '21:00',
  
  -- Premium
  is_premium BOOLEAN DEFAULT FALSE,
  premium_plan VARCHAR(50),
  premium_expires_at TIMESTAMPTZ,
  
  -- Onboarding
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_completed_at TIMESTAMPTZ,
  
  -- Métadonnées
  timezone VARCHAR(50) DEFAULT 'Europe/Paris',
  locale VARCHAR(10) DEFAULT 'fr',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: user_goals
-- Objectifs de santé des utilisateurs
-- ============================================

CREATE TABLE user_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  goal_type VARCHAR(50) NOT NULL, -- dormir_mieux, reduire_stress...
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50),
  priority INTEGER DEFAULT 1, -- 1 = haute priorité
  is_active BOOLEAN DEFAULT TRUE,
  progress INTEGER DEFAULT 0, -- 0-100
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, goal_type)
);

-- ============================================
-- TABLE: wellness_logs
-- Journal bien-être quotidien
-- ============================================

CREATE TABLE wellness_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  -- Métriques principales (1-5)
  sleep_quality INTEGER CHECK (sleep_quality BETWEEN 1 AND 5),
  stress_level INTEGER CHECK (stress_level BETWEEN 1 AND 5),
  energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 5),
  mood_level INTEGER CHECK (mood_level BETWEEN 1 AND 5),
  
  -- Métriques optionnelles
  hydration_level INTEGER CHECK (hydration_level BETWEEN 1 AND 5),
  digestion_level INTEGER CHECK (digestion_level BETWEEN 1 AND 5),
  
  -- Détails sommeil
  sleep_hours DECIMAL(3,1),
  sleep_difficulty BOOLEAN DEFAULT FALSE,
  night_wakings BOOLEAN DEFAULT FALSE,
  
  -- Symptômes et notes
  symptoms TEXT[],
  notes TEXT,
  
  -- Validation
  is_validated BOOLEAN DEFAULT FALSE,
  validated_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, date)
);

CREATE INDEX idx_wellness_logs_user_date ON wellness_logs(user_id, date DESC);

-- ============================================
-- TABLE: daily_recommendations
-- Recommandations quotidiennes générées
-- ============================================

CREATE TABLE daily_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  -- Recommandation
  remedy_id UUID REFERENCES remedies(id),
  essential_oil_id UUID REFERENCES essential_oils(id),
  category wellness_category,
  
  -- Explication
  reason TEXT NOT NULL,
  matched_tags TEXT[],
  match_score INTEGER DEFAULT 0, -- 0-100
  priority INTEGER DEFAULT 1,
  
  -- Interaction
  is_viewed BOOLEAN DEFAULT FALSE,
  viewed_at TIMESTAMPTZ,
  is_saved BOOLEAN DEFAULT FALSE,
  saved_at TIMESTAMPTZ,
  
  -- Lien avec le journal
  wellness_log_id UUID REFERENCES wellness_logs(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, date)
);

-- ============================================
-- TABLE: daily_routines
-- Routines quotidiennes générées
-- ============================================

CREATE TABLE daily_routines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  -- Routine matin
  morning_remedy_ids UUID[],
  morning_tips TEXT[],
  morning_duration VARCHAR(50),
  morning_completed BOOLEAN DEFAULT FALSE,
  morning_completed_at TIMESTAMPTZ,
  
  -- Routine soir
  evening_remedy_ids UUID[],
  evening_tips TEXT[],
  evening_duration VARCHAR(50),
  evening_completed BOOLEAN DEFAULT FALSE,
  evening_completed_at TIMESTAMPTZ,
  
  -- Contexte
  based_on_goals TEXT[],
  based_on_wellness_log UUID REFERENCES wellness_logs(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, date)
);

-- ============================================
-- TABLE: streaks
-- Séries de jours consécutifs
-- ============================================

CREATE TABLE streaks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  total_active_days INTEGER DEFAULT 0,
  
  last_active_date DATE,
  streak_start_date DATE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: badges
-- Définition des badges
-- ============================================

CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  
  badge_type badge_type NOT NULL,
  required_value INTEGER, -- Valeur requise (ex: 7 jours)
  
  -- Visuel
  color VARCHAR(7),
  image_url TEXT,
  
  -- Publication
  status content_status DEFAULT 'published',
  sort_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: user_badges
-- Badges débloqués par les utilisateurs
-- ============================================

CREATE TABLE user_badges (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, badge_id)
);

-- ============================================
-- TABLE: user_remedy_history
-- Historique des remèdes consultés/utilisés
-- ============================================

CREATE TABLE user_remedy_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  remedy_id UUID REFERENCES remedies(id) ON DELETE CASCADE,
  
  view_count INTEGER DEFAULT 0,
  used_count INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  
  -- Feedback
  effectiveness_score INTEGER CHECK (effectiveness_score BETWEEN 1 AND 5),
  would_recommend BOOLEAN,
  notes TEXT,
  
  is_favorite BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, remedy_id)
);

-- ============================================
-- TABLE: daily_content
-- Contenu du jour (remède, astuce, erreur)
-- ============================================

CREATE TABLE daily_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE UNIQUE NOT NULL,
  
  -- Remède du jour
  remedy_of_day_id UUID REFERENCES remedies(id),
  remedy_of_day_reason TEXT,
  
  -- Astuce du jour
  tip_title VARCHAR(200),
  tip_content TEXT,
  tip_icon VARCHAR(50),
  
  -- Erreur à éviter
  mistake_title VARCHAR(200),
  mistake_content TEXT,
  
  -- Publication
  status content_status DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: notification_campaigns
-- Campagnes de notifications
-- ============================================

CREATE TABLE notification_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Contenu
  title VARCHAR(200) NOT NULL,
  body TEXT NOT NULL,
  
  -- Ciblage
  target_all BOOLEAN DEFAULT FALSE,
  target_premium_only BOOLEAN DEFAULT FALSE,
  target_goals TEXT[], -- Objectifs ciblés
  target_profile_types profile_type[],
  
  -- Planification
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  
  -- Action
  action_type VARCHAR(50), -- open_remedy, open_search, open_wellness
  action_payload TEXT,
  
  -- Stats
  sent_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  
  -- Publication
  status content_status DEFAULT 'draft',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: app_settings
-- Paramètres globaux de l'application
-- ============================================

CREATE TABLE app_settings (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Paramètres par défaut
INSERT INTO app_settings (key, value, description) VALUES
  ('affiliate_tag', '"craype-21"', 'Tag affilié Amazon'),
  ('min_app_version', '"1.0.0"', 'Version minimum de l''app'),
  ('maintenance_mode', 'false', 'Mode maintenance'),
  ('feature_flags', '{"ai_assistant": false, "premium": false}', 'Feature flags');

-- ============================================
-- TABLE: affiliate_clicks
-- Tracking des clics affiliés
-- ============================================

CREATE TABLE affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  product_id UUID REFERENCES affiliate_products(id) ON DELETE CASCADE,
  remedy_id UUID REFERENCES remedies(id) ON DELETE SET NULL,
  
  -- Contexte
  source VARCHAR(50), -- remedy_detail, search, routine
  
  -- Tracking
  clicked_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Anonymisation pour RGPD
  session_id VARCHAR(100)
);

CREATE INDEX idx_affiliate_clicks_product ON affiliate_clicks(product_id);
CREATE INDEX idx_affiliate_clicks_date ON affiliate_clicks(clicked_at);

-- ============================================
-- FONCTIONS UTILITAIRES
-- ============================================

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_remedies_updated_at BEFORE UPDATE ON remedies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_essential_oils_updated_at BEFORE UPDATE ON essential_oils
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wellness_logs_updated_at BEFORE UPDATE ON wellness_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_streaks_updated_at BEFORE UPDATE ON streaks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Activer RLS sur les tables utilisateur
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellness_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_remedy_history ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own goals" ON user_goals
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own wellness logs" ON wellness_logs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own recommendations" ON daily_recommendations
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own routines" ON daily_routines
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own streak" ON streaks
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own badges" ON user_badges
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own remedy history" ON user_remedy_history
  FOR ALL USING (auth.uid() = user_id);

-- Contenu public (lecture seule pour tous)
ALTER TABLE remedies ENABLE ROW LEVEL SECURITY;
ALTER TABLE essential_oils ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published remedies" ON remedies
  FOR SELECT USING (status = 'published');

CREATE POLICY "Public can view published essential oils" ON essential_oils
  FOR SELECT USING (status = 'published');

CREATE POLICY "Public can view published products" ON affiliate_products
  FOR SELECT USING (status = 'published');

CREATE POLICY "Public can view published categories" ON categories
  FOR SELECT USING (status = 'published');

CREATE POLICY "Public can view published badges" ON badges
  FOR SELECT USING (status = 'published');

CREATE POLICY "Public can view published daily content" ON daily_content
  FOR SELECT USING (status = 'published');
