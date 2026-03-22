// Database schema for Savoirs de Grand-Mère
// Tables: plants, symptoms, remedies, books

export const DATABASE_NAME = 'savoirs_grandmere.db';

export const CREATE_TABLES_SQL = `
-- Table des plantes
CREATE TABLE IF NOT EXISTS plants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  image TEXT,
  description TEXT,
  type TEXT DEFAULT 'plante',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Table des symptômes/maladies
CREATE TABLE IF NOT EXISTS symptoms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Table des livres sources
CREATE TABLE IF NOT EXISTS books (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT,
  year TEXT,
  status TEXT DEFAULT 'domaine_public',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Table des remèdes (relation avec plants, symptoms, books)
CREATE TABLE IF NOT EXISTS remedies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  plant_id TEXT,
  symptom_id TEXT,
  preparation TEXT,
  benefits TEXT,
  dosage TEXT,
  warnings TEXT,
  book_id TEXT,
  page_number INTEGER,
  confidence INTEGER DEFAULT 70,
  verified INTEGER DEFAULT 0,
  route TEXT DEFAULT 'orale',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (plant_id) REFERENCES plants(id),
  FOREIGN KEY (symptom_id) REFERENCES symptoms(id),
  FOREIGN KEY (book_id) REFERENCES books(id)
);

-- Table des ingrédients d'un remède
CREATE TABLE IF NOT EXISTS remedy_ingredients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  remedy_id TEXT NOT NULL,
  plant_id TEXT,
  name TEXT NOT NULL,
  quantity TEXT,
  unit TEXT,
  FOREIGN KEY (remedy_id) REFERENCES remedies(id),
  FOREIGN KEY (plant_id) REFERENCES plants(id)
);

-- Table des relations symptômes-remèdes (many-to-many)
CREATE TABLE IF NOT EXISTS remedy_symptoms (
  remedy_id TEXT NOT NULL,
  symptom_id TEXT NOT NULL,
  PRIMARY KEY (remedy_id, symptom_id),
  FOREIGN KEY (remedy_id) REFERENCES remedies(id),
  FOREIGN KEY (symptom_id) REFERENCES symptoms(id)
);

-- Index pour la recherche
CREATE INDEX IF NOT EXISTS idx_remedies_name ON remedies(name);
CREATE INDEX IF NOT EXISTS idx_plants_name ON plants(name);
CREATE INDEX IF NOT EXISTS idx_symptoms_name ON symptoms(name);
`;

// Types TypeScript pour la base de données
export interface DBPlant {
  id: string;
  name: string;
  image: string | null;
  description: string | null;
  type: string;
  created_at: string;
}

export interface DBSymptom {
  id: string;
  name: string;
  icon: string | null;
  created_at: string;
}

export interface DBBook {
  id: string;
  title: string;
  author: string | null;
  year: string | null;
  status: string;
  created_at: string;
}

export interface DBRemedy {
  id: string;
  name: string;
  plant_id: string | null;
  symptom_id: string | null;
  preparation: string | null;
  benefits: string | null;
  dosage: string | null;
  warnings: string | null;
  book_id: string | null;
  page_number: number | null;
  confidence: number;
  verified: number;
  route: string;
  created_at: string;
}

export interface DBRemedyIngredient {
  id: number;
  remedy_id: string;
  plant_id: string | null;
  name: string;
  quantity: string | null;
  unit: string | null;
}
