const fs = require('fs');
const path = require('path');
const OpenAI = require('openai').default;
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const LIVRE_INFO = {
  titre: "Bible perdue des remèdes du médecin oublié",
  auteur: "Inconnu",
  annee: 2020,
  editeur: "Grimoire"
};

async function extractRemediesFromImage(imageBase64, pageNum) {
  console.log(`🔍 Analyse de la page ${pageNum} avec GPT-4 Vision...`);
  
  const prompt = `Tu es un expert en phytothérapie. Cette image est une page d'un livre de remèdes traditionnels.

Extrais TOUS les remèdes visibles sur cette page. Pour chaque remède, retourne un objet JSON:
{
  "nom": "Nom du remède",
  "description": "Description courte",
  "indications": ["symptôme1", "symptôme2"],
  "ingredients": [{"nom": "ingrédient", "quantite": "100", "unite": "g"}],
  "preparation": [{"etape": 1, "instruction": "...", "duree": "10 min"}],
  "posologie": {"dose": "1 cuillère", "frequence": "3 fois/jour"},
  "precautions": ["précaution1"],
  "route": "orale"
}

IMPORTANT:
- Extrais TOUS les remèdes même partiels
- Utilise des mots-clés simples pour indications (rhume, toux, digestion, stress, sommeil, douleur, fièvre, etc.)
- Si pas de remède visible, retourne []
- Retourne UNIQUEMENT le tableau JSON

Réponds avec le JSON uniquement.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: `data:image/png;base64,${imageBase64}`,
                detail: "high"
              }
            }
          ]
        }
      ],
      max_tokens: 4000,
      temperature: 0.2,
    });

    const content = response.choices[0]?.message?.content || '[]';
    
    // Log pour debug
    if (content.length < 50) {
      console.log(`   Réponse courte: ${content}`);
    }
    
    let cleanContent = content.trim();
    if (cleanContent.startsWith('```json')) cleanContent = cleanContent.slice(7);
    if (cleanContent.startsWith('```')) cleanContent = cleanContent.slice(3);
    if (cleanContent.endsWith('```')) cleanContent = cleanContent.slice(0, -3);
    
    let remedies = [];
    try {
      remedies = JSON.parse(cleanContent.trim());
      // S'assurer que c'est un tableau
      if (!Array.isArray(remedies)) {
        remedies = [remedies];
      }
    } catch (parseError) {
      console.log(`   ⚠️ Pas de JSON valide sur cette page`);
      return [];
    }
    
    if (remedies.length > 0) {
      console.log(`✅ Page ${pageNum}: ${remedies.length} remède(s) trouvé(s)`);
      remedies.forEach(r => console.log(`   - ${r.nom}`));
    }
    return remedies;
  } catch (error) {
    console.error(`❌ Erreur page ${pageNum}:`, error.message);
    return [];
  }
}

async function convertPdfToImages(pdfPath, startPage = 60, maxPages = 100) {
  console.log('📄 Conversion du PDF en images...');
  
  const pdfToImg = await import('pdf-to-img');
  const images = [];
  
  let pageNum = 0;
  const document = await pdfToImg.pdf(pdfPath, { scale: 1.5 });
  
  for await (const image of document) {
    pageNum++;
    
    // Sauter les premières pages (intro, table des matières)
    if (pageNum < startPage) continue;
    
    images.push({
      pageNum,
      buffer: image
    });
    
    // Limiter le nombre de pages
    if (images.length >= maxPages) {
      console.log(`⚠️ Limité à ${maxPages} pages (pages ${startPage} à ${pageNum})`);
      break;
    }
  }
  
  console.log(`✅ ${images.length} pages converties (à partir de la page ${startPage})`);
  return images;
}

function generateRemedyId(nom, index) {
  const slug = nom.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 20);
  return `rem-${slug}-${index}`;
}

async function processAndSaveRemedies(pdfPath, outputPath) {
  console.log('🚀 Démarrage de l\'importation avec OCR Vision...\n');

  // 1. Convertir PDF en images
  const images = await convertPdfToImages(pdfPath);
  
  // 2. Analyser chaque page avec GPT-4 Vision
  const allRemedies = [];
  
  for (const { pageNum, buffer } of images) {
    const base64 = buffer.toString('base64');
    const remedies = await extractRemediesFromImage(base64, pageNum);
    
    remedies.forEach(r => {
      r.sourcePage = pageNum;
    });
    
    allRemedies.push(...remedies);
    
    // Pause pour éviter rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log(`\n📊 Total: ${allRemedies.length} remèdes extraits`);

  // 3. Formater pour l'application
  const remedesFormatted = allRemedies.map((r, index) => ({
    id: generateRemedyId(r.nom || `remede-${index}`, index + 1),
    nom: r.nom || `Remède ${index + 1}`,
    description: r.description || '',
    indications: r.indications || [],
    ingredients: (r.ingredients || []).map(ing => ({
      nom: ing.nom,
      quantite: ing.quantite || '',
      unite: ing.unite || '',
      principal: true,
    })),
    preparation: (r.preparation || []).map(p => ({
      etape: p.etape,
      instruction: p.instruction,
      duree: p.duree,
    })),
    posologie: r.posologie || { dose: '', frequence: '' },
    precautions: r.precautions || [],
    contreIndications: r.contreIndications || [],
    route: r.route || 'orale',
    source: {
      livre: LIVRE_INFO.titre,
      auteur: LIVRE_INFO.auteur,
      annee: LIVRE_INFO.annee,
      page: r.sourcePage,
      confianceGlobale: 70,
      verifie: false,
    },
    tags: [...(r.indications || []).slice(0, 3), r.route || 'orale'],
  }));

  // 4. Sauvegarder
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

const pdfPath = process.argv[2] || 'C:\\Users\\user\\Desktop\\Grimoire\\Bible perdue des remèdes du médecin oublié\\110_merged_merged.pdf';
const outputPath = path.join(__dirname, '..', 'src', 'data', 'remedes_importes.json');

processAndSaveRemedies(pdfPath, outputPath)
  .then((remedes) => {
    console.log('\n🎉 Importation terminée avec succès!');
    console.log(`📚 ${remedes.length} remèdes prêts à être utilisés`);
  })
  .catch((error) => {
    console.error('❌ Erreur:', error);
    process.exit(1);
  });
