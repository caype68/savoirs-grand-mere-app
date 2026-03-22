import * as SQLite from 'expo-sqlite';
import { 
  DATABASE_NAME, 
  CREATE_TABLES_SQL,
  DBPlant,
  DBSymptom,
  DBBook,
  DBRemedy,
  DBRemedyIngredient,
} from './schema';

let db: SQLite.SQLiteDatabase | null = null;

// Initialize database
export const initDatabase = async (): Promise<void> => {
  try {
    db = await SQLite.openDatabaseAsync(DATABASE_NAME);
    await db.execAsync(CREATE_TABLES_SQL);
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Get database instance
export const getDatabase = (): SQLite.SQLiteDatabase => {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
};

// ============ PLANTS ============

export const insertPlant = async (plant: Omit<DBPlant, 'created_at'>): Promise<void> => {
  const database = getDatabase();
  await database.runAsync(
    'INSERT OR REPLACE INTO plants (id, name, image, description, type) VALUES (?, ?, ?, ?, ?)',
    [plant.id, plant.name, plant.image, plant.description, plant.type]
  );
};

export const getAllPlants = async (): Promise<DBPlant[]> => {
  const database = getDatabase();
  return await database.getAllAsync<DBPlant>('SELECT * FROM plants ORDER BY name');
};

export const getPlantById = async (id: string): Promise<DBPlant | null> => {
  const database = getDatabase();
  return await database.getFirstAsync<DBPlant>('SELECT * FROM plants WHERE id = ?', [id]);
};

// ============ SYMPTOMS ============

export const insertSymptom = async (symptom: Omit<DBSymptom, 'created_at'>): Promise<void> => {
  const database = getDatabase();
  await database.runAsync(
    'INSERT OR REPLACE INTO symptoms (id, name, icon) VALUES (?, ?, ?)',
    [symptom.id, symptom.name, symptom.icon]
  );
};

export const getAllSymptoms = async (): Promise<DBSymptom[]> => {
  const database = getDatabase();
  return await database.getAllAsync<DBSymptom>('SELECT * FROM symptoms ORDER BY name');
};

// ============ BOOKS ============

export const insertBook = async (book: Omit<DBBook, 'created_at'>): Promise<void> => {
  const database = getDatabase();
  await database.runAsync(
    'INSERT OR REPLACE INTO books (id, title, author, year, status) VALUES (?, ?, ?, ?, ?)',
    [book.id, book.title, book.author, book.year, book.status]
  );
};

export const getAllBooks = async (): Promise<DBBook[]> => {
  const database = getDatabase();
  return await database.getAllAsync<DBBook>('SELECT * FROM books ORDER BY title');
};

// ============ REMEDIES ============

export const insertRemedy = async (remedy: Omit<DBRemedy, 'created_at'>): Promise<void> => {
  const database = getDatabase();
  await database.runAsync(
    `INSERT OR REPLACE INTO remedies 
     (id, name, plant_id, symptom_id, preparation, benefits, dosage, warnings, book_id, page_number, confidence, verified, route) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      remedy.id, remedy.name, remedy.plant_id, remedy.symptom_id,
      remedy.preparation, remedy.benefits, remedy.dosage, remedy.warnings,
      remedy.book_id, remedy.page_number, remedy.confidence, remedy.verified, remedy.route
    ]
  );
};

export const getAllRemedies = async (): Promise<DBRemedy[]> => {
  const database = getDatabase();
  return await database.getAllAsync<DBRemedy>('SELECT * FROM remedies ORDER BY name');
};

export const getRemedyById = async (id: string): Promise<DBRemedy | null> => {
  const database = getDatabase();
  return await database.getFirstAsync<DBRemedy>('SELECT * FROM remedies WHERE id = ?', [id]);
};

export const getRemediesBySymptom = async (symptomId: string): Promise<DBRemedy[]> => {
  const database = getDatabase();
  return await database.getAllAsync<DBRemedy>(
    `SELECT r.* FROM remedies r
     JOIN remedy_symptoms rs ON r.id = rs.remedy_id
     WHERE rs.symptom_id = ?
     ORDER BY r.confidence DESC`,
    [symptomId]
  );
};

// ============ SEARCH ============

export const searchRemedies = async (query: string): Promise<DBRemedy[]> => {
  const database = getDatabase();
  const searchTerm = `%${query.toLowerCase()}%`;
  
  return await database.getAllAsync<DBRemedy>(
    `SELECT DISTINCT r.* FROM remedies r
     LEFT JOIN remedy_symptoms rs ON r.id = rs.remedy_id
     LEFT JOIN symptoms s ON rs.symptom_id = s.id
     LEFT JOIN plants p ON r.plant_id = p.id
     WHERE LOWER(r.name) LIKE ?
        OR LOWER(r.benefits) LIKE ?
        OR LOWER(s.name) LIKE ?
        OR LOWER(p.name) LIKE ?
     ORDER BY r.confidence DESC`,
    [searchTerm, searchTerm, searchTerm, searchTerm]
  );
};

// ============ IMPORT BOOK FUNCTION ============

export interface BookImportData {
  book: {
    id: string;
    title: string;
    author?: string;
    year?: string;
  };
  plants: Array<{
    id: string;
    name: string;
    description?: string;
    image?: string;
  }>;
  symptoms: Array<{
    id: string;
    name: string;
    icon?: string;
  }>;
  remedies: Array<{
    id: string;
    name: string;
    plantIds: string[];
    symptomIds: string[];
    preparation: string;
    benefits: string;
    dosage: string;
    warnings: string;
    pageNumber: number;
    confidence?: number;
  }>;
}

export const importBook = async (data: BookImportData): Promise<{ success: boolean; message: string }> => {
  try {
    const database = getDatabase();
    
    // Start transaction
    await database.execAsync('BEGIN TRANSACTION');
    
    try {
      // Insert book
      await insertBook({
        id: data.book.id,
        title: data.book.title,
        author: data.book.author || null,
        year: data.book.year || null,
        status: 'domaine_public',
      });
      
      // Insert plants
      for (const plant of data.plants) {
        await insertPlant({
          id: plant.id,
          name: plant.name,
          description: plant.description || null,
          image: plant.image || null,
          type: 'plante',
        });
      }
      
      // Insert symptoms
      for (const symptom of data.symptoms) {
        await insertSymptom({
          id: symptom.id,
          name: symptom.name,
          icon: symptom.icon || null,
        });
      }
      
      // Insert remedies and relations
      for (const remedy of data.remedies) {
        await insertRemedy({
          id: remedy.id,
          name: remedy.name,
          plant_id: remedy.plantIds[0] || null,
          symptom_id: remedy.symptomIds[0] || null,
          preparation: remedy.preparation,
          benefits: remedy.benefits,
          dosage: remedy.dosage,
          warnings: remedy.warnings,
          book_id: data.book.id,
          page_number: remedy.pageNumber,
          confidence: remedy.confidence || 70,
          verified: 0,
          route: 'orale',
        });
        
        // Insert remedy-symptom relations
        for (const symptomId of remedy.symptomIds) {
          await database.runAsync(
            'INSERT OR IGNORE INTO remedy_symptoms (remedy_id, symptom_id) VALUES (?, ?)',
            [remedy.id, symptomId]
          );
        }
        
        // Insert remedy ingredients
        for (const plantId of remedy.plantIds) {
          const plant = data.plants.find(p => p.id === plantId);
          if (plant) {
            await database.runAsync(
              'INSERT INTO remedy_ingredients (remedy_id, plant_id, name) VALUES (?, ?, ?)',
              [remedy.id, plantId, plant.name]
            );
          }
        }
      }
      
      await database.execAsync('COMMIT');
      
      return {
        success: true,
        message: `Livre "${data.book.title}" importé avec succès: ${data.remedies.length} remèdes, ${data.plants.length} plantes`,
      };
    } catch (error) {
      await database.execAsync('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error importing book:', error);
    return {
      success: false,
      message: `Erreur lors de l'import: ${error}`,
    };
  }
};

// ============ SEED DATA ============

export const seedInitialData = async (): Promise<void> => {
  const sampleBookData: BookImportData = {
    book: {
      id: 'book-1',
      title: 'Remèdes de nos grands-mères',
      author: 'Collection traditionnelle',
      year: '1920',
    },
    plants: [
      { id: 'plant-camomille', name: 'Camomille', description: 'Plante aux propriétés apaisantes' },
      { id: 'plant-gingembre', name: 'Gingembre', description: 'Racine aux vertus digestives' },
      { id: 'plant-thym', name: 'Thym', description: 'Herbe aromatique antiseptique' },
      { id: 'plant-menthe', name: 'Menthe', description: 'Plante rafraîchissante' },
      { id: 'plant-miel', name: 'Miel', description: 'Produit naturel aux propriétés antibactériennes' },
      { id: 'plant-citron', name: 'Citron', description: 'Agrume riche en vitamine C' },
    ],
    symptoms: [
      { id: 'symptom-sommeil', name: 'Sommeil', icon: 'moon' },
      { id: 'symptom-digestion', name: 'Digestion', icon: 'coffee' },
      { id: 'symptom-rhume', name: 'Rhume', icon: 'thermometer' },
      { id: 'symptom-gorge', name: 'Mal de gorge', icon: 'mic' },
      { id: 'symptom-stress', name: 'Stress', icon: 'cloud' },
      { id: 'symptom-toux', name: 'Toux', icon: 'wind' },
    ],
    remedies: [
      {
        id: 'remedy-camomille-sommeil',
        name: 'Infusion de Camomille',
        plantIds: ['plant-camomille'],
        symptomIds: ['symptom-sommeil', 'symptom-stress'],
        preparation: 'Faire infuser 1 cuillère à soupe de fleurs de camomille dans 250ml d\'eau chaude pendant 10 minutes.',
        benefits: 'Aide à dormir, calme l\'anxiété, favorise la relaxation',
        dosage: '1 tasse le soir, 30 minutes avant le coucher',
        warnings: 'Éviter en cas d\'allergie aux astéracées',
        pageNumber: 12,
        confidence: 85,
      },
      {
        id: 'remedy-gingembre-digestion',
        name: 'Décoction de Gingembre',
        plantIds: ['plant-gingembre'],
        symptomIds: ['symptom-digestion'],
        preparation: 'Faire bouillir 2cm de gingembre frais râpé dans 300ml d\'eau pendant 10 minutes.',
        benefits: 'Facilite la digestion, réduit les nausées, stimule l\'appétit',
        dosage: '1 tasse après les repas',
        warnings: 'Déconseillé en cas de calculs biliaires',
        pageNumber: 24,
        confidence: 90,
      },
      {
        id: 'remedy-miel-citron-gorge',
        name: 'Miel et Citron',
        plantIds: ['plant-miel', 'plant-citron'],
        symptomIds: ['symptom-gorge', 'symptom-toux', 'symptom-rhume'],
        preparation: 'Mélanger 1 cuillère à soupe de miel avec le jus d\'un demi-citron dans de l\'eau tiède.',
        benefits: 'Apaise les maux de gorge, calme la toux, renforce l\'immunité',
        dosage: '3 fois par jour',
        warnings: 'Ne pas donner aux enfants de moins d\'un an (miel)',
        pageNumber: 36,
        confidence: 95,
      },
      {
        id: 'remedy-thym-toux',
        name: 'Infusion de Thym',
        plantIds: ['plant-thym'],
        symptomIds: ['symptom-toux', 'symptom-rhume'],
        preparation: 'Infuser 1 cuillère à café de thym séché dans 200ml d\'eau bouillante pendant 5 minutes.',
        benefits: 'Antiseptique naturel, calme la toux, dégage les voies respiratoires',
        dosage: '2 à 3 tasses par jour',
        warnings: 'Éviter pendant la grossesse',
        pageNumber: 48,
        confidence: 88,
      },
      {
        id: 'remedy-menthe-digestion',
        name: 'Tisane de Menthe',
        plantIds: ['plant-menthe'],
        symptomIds: ['symptom-digestion', 'symptom-stress'],
        preparation: 'Infuser quelques feuilles de menthe fraîche dans de l\'eau chaude pendant 5 minutes.',
        benefits: 'Facilite la digestion, rafraîchit l\'haleine, apaise les tensions',
        dosage: 'Après les repas',
        warnings: 'Peut aggraver les reflux gastriques',
        pageNumber: 52,
        confidence: 82,
      },
    ],
  };
  
  await importBook(sampleBookData);
};
