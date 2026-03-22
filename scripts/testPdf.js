const fs = require('fs');
const pdfParse = require('pdf-parse');

const pdfPath = 'C:\\Users\\user\\Desktop\\Grimoire\\Bible perdue des remèdes du médecin oublié\\110_merged_merged.pdf';

async function test() {
  console.log('📖 Lecture du PDF...');
  const dataBuffer = fs.readFileSync(pdfPath);
  const data = await pdfParse(dataBuffer);
  
  console.log(`Pages: ${data.numpages}`);
  console.log(`Longueur texte: ${data.text.length} caractères`);
  console.log('\n--- Premiers 2000 caractères ---\n');
  console.log(data.text.slice(0, 2000));
}

test().catch(console.error);
