const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const OpenAI = require('openai').default;
const dotenv = require('dotenv');

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface RemedeExtrait {
  nom: string;
  description: string;
  indications: string[];
  ingredients: {
    nom: string;
    quantite: string;
    unite: string;
  }[];
  preparation: {
    etape: number;
    instruction: string;
    duree?: string;
  }[];
  posologie: {
    dose: string;
    frequence: string;
    duree?: string;
    moment?: string;
  };
  precautions: string[];
  contreIndications: string[];
  route: 'orale' | 'cutanee' | 'inhalation' | 'autre';
}

interface LivreInfo {
  titre: string;
  auteur: string;
  annee: number;
  editeur: string;
}

const LIVRE_INFO: LivreInfo = {
  titre: "Bible perdue des remèdes du médecin oublié",
  auteur: "Inconnu",
  annee: 2020,
  editeur: "Grimoire"
};

async function extractTextFromPdf(pdfPath: string): Promise<string> {
  console.log(`📖 Lecture du PDF: ${pdfPath}`);
  const dataBuffer = fs.readFileSync(pdfPath);
  const data = await pdf(dataBuffer);
  console.log(`✅ ${data.numpages} pages extraites`);
  return data.text;
}

async function extractRemediesWithGPT(text: string, chunkIndex: number): Promise<RemedeExtrait[]> {
  console.log(`🤖 Extraction des remèdes (chunk ${chunkIndex})...`);
  
  const prompt = `Tu es un expert en phytothérapie et remèdes traditionnels. Analyse ce texte extrait d'un livre de remèdes anciens et extrais TOUS les remèdes mentionnés.

Pour chaque remède trouvé, retourne un objet JSON avec cette structure exacte:
{
  "nom": "Nom du remède",
  "description": "Description courte du remède et son utilité",
  "indications": ["indication1", "indication2"],
  "ingredients": [{"nom": "ingrédient", "quantite": "100", "unite": "g"}],
  "preparation": [{"etape": 1, "instruction": "...", "duree": "10 min"}],
  "posologie": {"dose": "1 cuillère", "frequence": "3 fois par jour", "duree": "1 semaine", "moment": "après les repas"},
  "precautions": ["précaution1"],
  "contreIndications": ["contre-indication1"],
  "route": "orale"
}

IMPORTANT:
- Extrais TOUS les remèdes, même partiels
- Pour les indications, utilise des mots-clés simples (rhume, toux, digestion, stress, sommeil, douleur, etc.)
- Si une information manque, mets une valeur par défaut raisonnable
- La route peut être: "orale", "cutanee", "inhalation", "autre"
- Retourne un tableau JSON de remèdes

Texte à analyser:
${text}

Réponds UNIQUEMENT avec le tableau JSON, sans markdown ni explication.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Tu es un assistant spécialisé dans l'extraction de données structurées à partir de textes sur les remèdes naturels. Tu réponds uniquement en JSON valide." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 4000,
    });

    const content = response.choices[0]?.message?.content || '[]';
    
    // Nettoyer la réponse (enlever les backticks markdown si présents)
    let cleanContent = content.trim();
    if (cleanContent.startsWith('```json')) {
      cleanContent = cleanContent.slice(7);
    }
    if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.slice(3);
    }
    if (cleanContent.endsWith('```')) {
      cleanContent = cleanContent.slice(0, -3);
    }
    
    const remedies = JSON.parse(cleanContent.trim());
    console.log(`✅ ${remedies.length} remèdes extraits du chunk ${chunkIndex}`);
    return remedies;
  } catch (error) {
    console.error(`❌ Erreur extraction chunk ${chunkIndex}:`, error);
    return [];
  }
}

function chunkText(text: string, maxChunkSize: number = 8000): string[] {
  const chunks: string[] = [];
  const paragraphs = text.split(/\n\n+/);
  let currentChunk = '';

  for (const paragraph of paragraphs) {
    if (currentChunk.length + paragraph.length > maxChunkSize) {
      if (currentChunk) {
        chunks.push(currentChunk);
      }
      currentChunk = paragraph;
    } else {
      currentChunk += '\n\n' + paragraph;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
}

function generateRemedyId(nom: string, index: number): string {
  const slug = nom.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 20);
  return `rem-${slug}-${index}`;
}

async function processAndSaveRemedies(pdfPath: string, outputPath: string) {
  console.log('🚀 Démarrage de l\'importation...\n');

  // 1. Extraire le texte du PDF
  const text = await extractTextFromPdf(pdfPath);
  
  // 2. Découper en chunks
  const chunks = chunkText(text);
  console.log(`📄 Texte découpé en ${chunks.length} chunks\n`);

  // 3. Extraire les remèdes de chaque chunk
  const allRemedies: RemedeExtrait[] = [];
  
  for (let i = 0; i < chunks.length; i++) {
    const remedies = await extractRemediesWithGPT(chunks[i], i + 1);
    allRemedies.push(...remedies);
    
    // Pause pour éviter le rate limiting
    if (i < chunks.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log(`\n📊 Total: ${allRemedies.length} remèdes extraits`);

  // 4. Formater pour l'application
  const remedesFormatted = allRemedies.map((r, index) => ({
    id: generateRemedyId(r.nom, index + 1),
    nom: r.nom,
    description: r.description,
    indications: r.indications,
    ingredients: r.ingredients.map(ing => ({
      nom: ing.nom,
      quantite: ing.quantite,
      unite: ing.unite,
      principal: true,
    })),
    preparation: r.preparation.map(p => ({
      etape: p.etape,
      instruction: p.instruction,
      duree: p.duree,
    })),
    posologie: r.posologie,
    precautions: r.precautions,
    contreIndications: r.contreIndications,
    route: r.route,
    source: {
      livre: LIVRE_INFO.titre,
      auteur: LIVRE_INFO.auteur,
      annee: LIVRE_INFO.annee,
      page: null,
      confianceGlobale: 70,
      verifie: false,
    },
    tags: [...r.indications.slice(0, 3), r.route],
  }));

  // 5. Sauvegarder en JSON
  const output = {
    livre: LIVRE_INFO,
    dateImport: new Date().toISOString(),
    nombreRemedes: remedesFormatted.length,
    remedes: remedesFormatted,
  };

  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`\n✅ Données sauvegardées dans: ${outputPath}`);
  
  return remedesFormatted;
}

// Exécution
const pdfPath = process.argv[2] || 'C:\\Users\\user\\Desktop\\Grimoire\\Bible perdue des remèdes du médecin oublié\\110_merged_merged.pdf';
const outputPath = path.join(__dirname, '..', 'src', 'data', 'remedes_importes.json');

processAndSaveRemedies(pdfPath, outputPath)
  .then((remedes) => {
    console.log('\n🎉 Importation terminée avec succès!');
    console.log(`📚 ${remedes.length} remèdes prêts à être utilisés dans l'application`);
  })
  .catch((error) => {
    console.error('❌ Erreur lors de l\'importation:', error);
    process.exit(1);
  });
