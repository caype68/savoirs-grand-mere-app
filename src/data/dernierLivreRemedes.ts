import { Remede } from '../types';
import remedesData from './dernier_livre_remedes.json';

// Convertir les remèdes du dernier livre au format de l'application
export const dernierLivreRemedes: Remede[] = remedesData.remedes.map((r: any) => ({
  id: r.id,
  nom: r.nom,
  alias: [],
  fautesFrequentes: [],
  route: r.route === 'topique' ? 'cutanee' : (r.route || 'orale'),
  ingredients: (r.ingredients || []).map((ing: any) => ({
    id: ing.nom?.toLowerCase().replace(/\s+/g, '-') || 'ingredient',
    nom: ing.nom || 'Ingrédient',
    type: 'plante' as const,
    quantite: ing.quantite || '',
    unite: ing.unite || '',
    remarques: '',
  })),
  preparation: (r.preparation || []).map((p: any, idx: number) => ({
    numero: p.etape || idx + 1,
    instruction: p.instruction || '',
  })),
  posologie: {
    frequence: r.posologie?.frequence || '',
    duree: r.posologie?.duree || '',
    unite: r.posologie?.dose || '',
    remarques: r.posologie?.moment || '',
  },
  indications: r.indications || [],
  contreIndications: r.contreIndications || [],
  precautions: r.precautions || [],
  source: {
    livre: r.source?.livre || 'Savoirs de Grand-Mère',
    page: r.source?.page || null,
    confianceOCR: 0.70,
    confianceParsing: 0.70,
    confianceGlobale: r.source?.confianceGlobale || 0.70,
    extrait: r.description || '',
  },
  verifie: false,
}));

export const dernierLivreInfo = {
  id: 'dernier-livre',
  nom: remedesData.livre.titre,
  auteur: remedesData.livre.auteur,
  annee: String(remedesData.livre.annee),
  statutDroits: 'non_specifie' as const,
  nombreRemedes: remedesData.nombreRemedes,
};
