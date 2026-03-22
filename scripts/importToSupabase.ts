// ============================================
// SCRIPT D'IMPORT DES DONNÉES VERS SUPABASE
// Exécuter avec: npx ts-node scripts/importToSupabase.ts
// ============================================

import { createClient } from '@supabase/supabase-js';
import { remedes } from '../src/data/remedes';
import { ESSENTIAL_OILS } from '../src/data/essentialOils';

// Note: Les produits affiliés seront importés via getAffiliateProductsForRemedy pour chaque remède

// ============================================
// CONFIGURATION
// ============================================

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || ''; // Clé service role

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Variables SUPABASE_URL et SUPABASE_SERVICE_KEY requises');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ============================================
// UTILITAIRES
// ============================================

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprimer accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function mapRoute(route: string): string {
  const mapping: Record<string, string> = {
    'orale': 'orale',
    'cutanee': 'cutanee',
    'inhalation': 'inhalation',
    'gargarisme': 'gargarisme',
    'nasale': 'nasale',
  };
  return mapping[route] || 'orale';
}

// ============================================
// IMPORT DES CATÉGORIES
// ============================================

async function importCategories() {
  console.log('\n📁 Import des catégories...');

  const categories = [
    { slug: 'respiration', name: 'Respiration', icon: 'wind', color: '#3B82F6' },
    { slug: 'digestion', name: 'Digestion', icon: 'coffee', color: '#F59E0B' },
    { slug: 'sommeil', name: 'Sommeil', icon: 'moon', color: '#8B5CF6' },
    { slug: 'stress', name: 'Stress & Anxiété', icon: 'heart', color: '#EC4899' },
    { slug: 'douleurs', name: 'Douleurs', icon: 'activity', color: '#EF4444' },
    { slug: 'peau', name: 'Peau', icon: 'droplet', color: '#10B981' },
    { slug: 'immunite', name: 'Immunité', icon: 'shield', color: '#6366F1' },
    { slug: 'energie', name: 'Énergie', icon: 'zap', color: '#F97316' },
    { slug: 'gorge', name: 'Gorge', icon: 'mic', color: '#06B6D4' },
  ];

  for (const cat of categories) {
    const { error } = await supabase
      .from('categories')
      .upsert({
        ...cat,
        status: 'published',
        sort_order: categories.indexOf(cat) + 1,
      }, { onConflict: 'slug' });

    if (error) {
      console.error(`  ❌ Erreur catégorie ${cat.name}:`, error.message);
    } else {
      console.log(`  ✅ ${cat.name}`);
    }
  }

  console.log(`✅ ${categories.length} catégories importées`);
}

// ============================================
// IMPORT DES REMÈDES
// ============================================

async function importRemedies() {
  console.log('\n🌿 Import des remèdes...');

  let imported = 0;
  let errors = 0;

  for (const remede of remedes) {
    const slug = generateSlug(remede.nom);

    const remedyData = {
      slug,
      name: remede.nom,
      aliases: remede.alias || null,
      common_misspellings: remede.fautesFrequentes || null,
      route: mapRoute(remede.route),
      description: null,
      preparation_time: null,
      usage_duration: remede.posologie.duree || null,
      posology_frequency: remede.posologie.frequence,
      posology_duration: remede.posologie.duree || null,
      posology_notes: remede.posologie.remarques || null,
      indications: remede.indications,
      contraindications: remede.contreIndications,
      precautions: remede.precautions || null,
      source_book: remede.source.livre,
      source_author: null,
      source_year: null,
      source_page: remede.source.page,
      source_confidence: remede.source.confianceGlobale,
      difficulty_level: 'debutant',
      is_verified: remede.verifie,
      status: 'published',
    };

    const { error } = await supabase
      .from('remedies')
      .upsert(remedyData, { onConflict: 'slug' });

    if (error) {
      console.error(`  ❌ ${remede.nom}:`, error.message);
      errors++;
    } else {
      imported++;
      if (imported % 20 === 0) {
        console.log(`  📊 ${imported} remèdes importés...`);
      }
    }
  }

  console.log(`✅ ${imported} remèdes importés, ${errors} erreurs`);
}

// ============================================
// IMPORT DES INGRÉDIENTS
// ============================================

async function importIngredients() {
  console.log('\n🌱 Import des ingrédients...');

  // Extraire tous les ingrédients uniques des remèdes
  const ingredientsMap = new Map<string, any>();

  for (const remede of remedes) {
    for (const ing of remede.ingredients) {
      if (!ingredientsMap.has(ing.nom.toLowerCase())) {
        ingredientsMap.set(ing.nom.toLowerCase(), {
          slug: generateSlug(ing.nom),
          name: ing.nom,
          aliases: ing.alias || null,
          type: ing.type || 'plante',
          description: ing.remarques || null,
          interactions: ing.interactions || null,
          contraindications: ing.contreIndications || null,
          status: 'published',
        });
      }
    }
  }

  let imported = 0;
  for (const [, ingredient] of ingredientsMap) {
    const { error } = await supabase
      .from('ingredients')
      .upsert(ingredient, { onConflict: 'slug' });

    if (!error) imported++;
  }

  console.log(`✅ ${imported} ingrédients importés`);
}

// ============================================
// IMPORT DES HUILES ESSENTIELLES
// ============================================

async function importEssentialOils() {
  console.log('\n💧 Import des huiles essentielles...');

  if (!ESSENTIAL_OILS || ESSENTIAL_OILS.length === 0) {
    console.log('  ⚠️ Aucune huile essentielle à importer');
    return;
  }

  let imported = 0;

  for (const oil of ESSENTIAL_OILS) {
    const slug = oil.slug || generateSlug(oil.name);

    const oilData = {
      slug,
      name: oil.name,
      latin_name: oil.nameLatin || null,
      aliases: null,
      plant_part: null,
      extraction_method: null,
      origin_countries: null,
      properties: oil.mainProperties || [],
      main_components: null,
      scent_description: oil.shortDescription || null,
      usage_methods: [],
      dilution_rate: null,
      contraindications: oil.contraindications || [],
      precautions: oil.precautions || [],
      is_photosensitizing: oil.isPhotosensitizing || false,
      is_dermocaustic: oil.isDermocaustic || false,
      min_age: oil.minAge || null,
      pregnancy_safe: oil.pregnancySafe || false,
      difficulty_level: 'intermediaire',
      status: 'published',
    };

    const { error } = await supabase
      .from('essential_oils')
      .upsert(oilData, { onConflict: 'slug' });

    if (error) {
      console.error(`  ❌ ${oil.name}:`, error.message);
    } else {
      imported++;
    }
  }

  console.log(`✅ ${imported} huiles essentielles importées`);
}

// ============================================
// IMPORT DES PRODUITS AFFILIÉS
// ============================================

async function importAffiliateProducts() {
  console.log('\n🛒 Import des produits affiliés...');
  console.log('  ℹ️ Les produits affiliés sont gérés dynamiquement via getAffiliateProductsForRemedy()');
  console.log('  ℹ️ Aucune importation nécessaire - les données sont générées à la volée');
}

// ============================================
// IMPORT DES BADGES
// ============================================

async function importBadges() {
  console.log('\n🏆 Import des badges...');

  const badges = [
    { slug: 'apprenti_herboriste', name: 'Apprenti Herboriste', description: '3 jours consécutifs', icon: '🌱', badge_type: 'streak', required_value: 3 },
    { slug: 'routine_engagee', name: 'Routine Engagée', description: '7 jours consécutifs', icon: '🌿', badge_type: 'streak', required_value: 7 },
    { slug: 'herboriste_confirme', name: 'Herboriste Confirmé', description: '14 jours consécutifs', icon: '🍃', badge_type: 'streak', required_value: 14 },
    { slug: 'maitre_remedes', name: 'Maître des Remèdes', description: '30 jours consécutifs', icon: '🌳', badge_type: 'streak', required_value: 30 },
    { slug: 'routine_parfaite', name: 'Routine Parfaite', description: '60 jours consécutifs', icon: '✨', badge_type: 'streak', required_value: 60 },
    { slug: 'legende_naturelle', name: 'Légende Naturelle', description: '100 jours consécutifs', icon: '👑', badge_type: 'streak', required_value: 100 },
  ];

  for (const badge of badges) {
    const { error } = await supabase
      .from('badges')
      .upsert({ ...badge, status: 'published', sort_order: badges.indexOf(badge) + 1 }, { onConflict: 'slug' });

    if (error) {
      console.error(`  ❌ Badge ${badge.name}:`, error.message);
    }
  }

  console.log(`✅ ${badges.length} badges importés`);
}

// ============================================
// MAIN
// ============================================

async function main() {
  console.log('🚀 Début de l\'import vers Supabase');
  console.log(`📍 URL: ${SUPABASE_URL}`);
  console.log('');

  try {
    // Test de connexion
    const { error: testError } = await supabase.from('app_settings').select('key').limit(1);
    if (testError) {
      throw new Error(`Connexion échouée: ${testError.message}`);
    }
    console.log('✅ Connexion à Supabase établie\n');

    // Import dans l'ordre
    await importCategories();
    await importIngredients();
    await importRemedies();
    await importEssentialOils();
    await importAffiliateProducts();
    await importBadges();

    console.log('\n🎉 Import terminé avec succès !');
  } catch (error) {
    console.error('\n❌ Erreur fatale:', error);
    process.exit(1);
  }
}

main();
