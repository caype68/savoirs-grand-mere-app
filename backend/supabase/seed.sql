-- ============================================
-- DONNÉES INITIALES - SAVOIRS DE GRAND-MÈRE
-- Script de seed pour peupler la base
-- ============================================

-- ============================================
-- CATÉGORIES
-- ============================================

INSERT INTO categories (slug, name, description, icon, color, sort_order, status) VALUES
  ('respiration', 'Respiration', 'Remèdes pour les voies respiratoires', 'wind', '#3B82F6', 1, 'published'),
  ('digestion', 'Digestion', 'Remèdes pour le système digestif', 'coffee', '#F59E0B', 2, 'published'),
  ('sommeil', 'Sommeil', 'Remèdes pour améliorer le sommeil', 'moon', '#8B5CF6', 3, 'published'),
  ('stress', 'Stress & Anxiété', 'Remèdes pour la détente', 'heart', '#EC4899', 4, 'published'),
  ('douleurs', 'Douleurs', 'Remèdes contre les douleurs', 'activity', '#EF4444', 5, 'published'),
  ('peau', 'Peau', 'Remèdes pour la peau', 'droplet', '#10B981', 6, 'published'),
  ('immunite', 'Immunité', 'Renforcer les défenses', 'shield', '#6366F1', 7, 'published'),
  ('energie', 'Énergie', 'Booster la vitalité', 'zap', '#F97316', 8, 'published');

-- ============================================
-- BADGES
-- ============================================

INSERT INTO badges (slug, name, description, icon, badge_type, required_value, color, sort_order, status) VALUES
  ('apprenti_herboriste', 'Apprenti Herboriste', '3 jours consécutifs d''utilisation', '🌱', 'streak', 3, '#22C55E', 1, 'published'),
  ('routine_engagee', 'Routine Engagée', '7 jours consécutifs - Une semaine complète !', '🌿', 'streak', 7, '#16A34A', 2, 'published'),
  ('herboriste_confirme', 'Herboriste Confirmé', '14 jours consécutifs - Deux semaines de bien-être', '🍃', 'streak', 14, '#15803D', 3, 'published'),
  ('maitre_remedes', 'Maître des Remèdes', '30 jours consécutifs - Un mois de sagesse naturelle', '🌳', 'streak', 30, '#166534', 4, 'published'),
  ('routine_parfaite', 'Routine Parfaite', '60 jours consécutifs - Deux mois d''excellence', '✨', 'streak', 60, '#14532D', 5, 'published'),
  ('legende_naturelle', 'Légende Naturelle', '100 jours consécutifs - Vous êtes une inspiration !', '👑', 'streak', 100, '#052E16', 6, 'published'),
  ('explorateur', 'Explorateur', 'A consulté 10 remèdes différents', '🔍', 'exploration', 10, '#3B82F6', 7, 'published'),
  ('connaisseur', 'Connaisseur', 'A consulté 50 remèdes différents', '📚', 'exploration', 50, '#1D4ED8', 8, 'published'),
  ('premier_remede', 'Premier Remède', 'A utilisé son premier remède', '🎯', 'usage', 1, '#8B5CF6', 9, 'published'),
  ('fidele', 'Fidèle', 'A utilisé 10 remèdes', '💚', 'usage', 10, '#7C3AED', 10, 'published');

-- ============================================
-- PARAMÈTRES DE L'APPLICATION
-- ============================================

INSERT INTO app_settings (key, value, description) VALUES
  ('affiliate_tag', '"craype-21"', 'Tag affilié Amazon'),
  ('min_app_version', '"1.0.0"', 'Version minimum de l''app requise'),
  ('maintenance_mode', 'false', 'Mode maintenance activé'),
  ('feature_flags', '{"ai_assistant": false, "premium": false, "family_profiles": false}', 'Feature flags'),
  ('daily_content_enabled', 'true', 'Contenu quotidien activé'),
  ('notifications_enabled', 'true', 'Notifications push activées'),
  ('max_free_recommendations', '3', 'Nombre max de recommandations gratuites par jour')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- ============================================
-- EXEMPLE DE REMÈDE
-- ============================================

INSERT INTO remedies (
  slug, name, aliases, route, description,
  preparation_time, usage_duration,
  posology_frequency, posology_duration, posology_notes,
  indications, contraindications, precautions,
  source_book, source_author, source_year,
  difficulty_level, is_verified, status
) VALUES (
  'tisane-thym-miel',
  'Tisane au thym et miel',
  ARRAY['infusion thym', 'thé au thym'],
  'orale',
  'Une tisane traditionnelle aux propriétés antiseptiques et apaisantes, idéale pour les maux de gorge et les refroidissements.',
  '10 min',
  '5-7 jours',
  '3 fois par jour',
  'Pendant 5 à 7 jours',
  'À boire chaude, de préférence après les repas',
  ARRAY['Maux de gorge', 'Toux', 'Refroidissement', 'Digestion difficile'],
  ARRAY['Allergie au thym', 'Enfants de moins de 1 an (miel)'],
  ARRAY['Ne pas dépasser 3 tasses par jour', 'Consulter un médecin si les symptômes persistent'],
  'Remèdes de Grand-Mère',
  'Tradition populaire',
  '2020',
  'debutant',
  true,
  'published'
);

-- ============================================
-- EXEMPLE D'INGRÉDIENT
-- ============================================

INSERT INTO ingredients (slug, name, aliases, type, description, status) VALUES
  ('thym', 'Thym', ARRAY['farigoule', 'farigoulette'], 'plante', 'Plante aromatique aux propriétés antiseptiques', 'published'),
  ('miel', 'Miel', ARRAY['mièl'], 'autre', 'Produit naturel aux propriétés adoucissantes', 'published'),
  ('citron', 'Citron', ARRAY['limon'], 'plante', 'Agrume riche en vitamine C', 'published'),
  ('camomille', 'Camomille', ARRAY['camomille romaine'], 'plante', 'Plante aux propriétés apaisantes', 'published'),
  ('lavande', 'Lavande', ARRAY['lavande vraie'], 'plante', 'Plante aux propriétés relaxantes', 'published');

-- ============================================
-- EXEMPLE D'HUILE ESSENTIELLE
-- ============================================

INSERT INTO essential_oils (
  slug, name, latin_name, aliases,
  plant_part, extraction_method, origin_countries,
  properties, main_components, scent_description,
  usage_methods, dilution_rate,
  contraindications, precautions,
  is_photosensitizing, is_dermocaustic, min_age, pregnancy_safe,
  difficulty_level, status
) VALUES (
  'lavande-vraie',
  'Lavande vraie',
  'Lavandula angustifolia',
  ARRAY['lavande fine', 'lavande officinale'],
  'Sommités fleuries',
  'Distillation à la vapeur d''eau',
  ARRAY['France', 'Bulgarie'],
  ARRAY['Calmante', 'Relaxante', 'Cicatrisante', 'Antispasmodique'],
  ARRAY['Linalol', 'Acétate de linalyle'],
  'Odeur florale, fraîche et herbacée, caractéristique de la Provence',
  ARRAY['Diffusion', 'Massage', 'Bain', 'Application cutanée'],
  '20% dans une huile végétale',
  ARRAY['Premier trimestre de grossesse'],
  ARRAY['Éviter le contact avec les yeux', 'Faire un test cutané avant utilisation'],
  false,
  false,
  3,
  false,
  'debutant',
  'published'
);

-- ============================================
-- EXEMPLE DE PRODUIT AFFILIÉ
-- ============================================

INSERT INTO affiliate_products (
  asin, search_query,
  title, subtitle, description, ingredient_name,
  price_label, category, badge,
  is_essential, sort_order, status
) VALUES
  (NULL, 'thym bio séché cuisine', 'Thym Bio Séché - 100g', 'Qualité supérieure', 'Thym biologique séché, parfait pour infusions et cuisine', 'Thym', '~6,90 €', 'plante', 'bio', true, 1, 'published'),
  (NULL, 'miel bio france', 'Miel de Fleurs Bio - 500g', 'Miel français', 'Miel biologique récolté en France', 'Miel', '~12,90 €', 'autre', 'bio', true, 2, 'published'),
  (NULL, 'huile essentielle lavande vraie bio', 'Huile Essentielle Lavande Vraie Bio - 10ml', 'Certifiée bio', 'Huile essentielle de lavande vraie biologique', 'Lavande', '~8,90 €', 'huile_essentielle', 'bio', true, 1, 'published');

-- ============================================
-- CONTENU DU JOUR (EXEMPLE)
-- ============================================

INSERT INTO daily_content (
  date,
  remedy_of_day_id,
  remedy_of_day_reason,
  tip_title, tip_content, tip_icon,
  mistake_title, mistake_content,
  status
) VALUES (
  CURRENT_DATE,
  (SELECT id FROM remedies WHERE slug = 'tisane-thym-miel' LIMIT 1),
  'Parfait pour la saison ! Le thym renforce les défenses naturelles.',
  'Hydratation',
  'Buvez au moins 1,5L d''eau par jour pour aider votre corps à éliminer les toxines.',
  '💧',
  'Évitez le sucre raffiné',
  'Le sucre blanc affaiblit le système immunitaire. Préférez le miel ou le sirop d''érable.',
  'published'
);

-- ============================================
-- FIN DU SEED
-- ============================================
