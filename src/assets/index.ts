// Logo de l'application
export const logo = require('../../assets/logo/grandmere.png');
export const logoComplet = require('../../assets/logo/logo_complet.png');

// Image principale grand-mère remèdes
export const grandMereRemedes = require('../../assets/images/grand-mere-remedes.png');

// Cadre naturel en bois avec feuilles
export const frameNatural = require('../../assets/images/frame-natural.png');

// Image zones de douleur du corps
export const bodyPainZones = require('../../assets/images/body-pain-zones.png');

// Images par type de remède
export const remedeTypeImages = {
  // Orale
  infusion: require('../../assets/images/Infusions.png'),
  tisane: require('../../assets/images/tisanes.png'),
  sirop: require('../../assets/images/sirop.png'),
  melange: require('../../assets/images/mélanges à boire.png'),
  // Cutanée
  cataplasme: require('../../assets/images/Cataplasmes.png'),
  friction: require('../../assets/images/frictions.png'),
  compresse: require('../../assets/images/compresses.png'),
  // Inhalation
  fumigation: require('../../assets/images/fumigations.png'),
};

// Fonction pour obtenir l'image selon le nom du remède
export const getRemedyImage = (nom: string, route: 'orale' | 'cutanee' | 'inhalation' | 'gargarisme' | 'nasale') => {
  const nomLower = nom.toLowerCase();
  
  // Vérifier le nom du remède pour déterminer le type
  if (nomLower.includes('infusion')) return remedeTypeImages.infusion;
  if (nomLower.includes('tisane')) return remedeTypeImages.tisane;
  if (nomLower.includes('sirop')) return remedeTypeImages.sirop;
  if (nomLower.includes('cataplasme') || nomLower.includes('emplâtre')) return remedeTypeImages.cataplasme;
  if (nomLower.includes('friction')) return remedeTypeImages.friction;
  if (nomLower.includes('compresse')) return remedeTypeImages.compresse;
  if (nomLower.includes('inhalation') || nomLower.includes('fumigation') || nomLower.includes('vapeur')) return remedeTypeImages.fumigation;
  
  // Par défaut selon la route
  switch (route) {
    case 'orale':
      return remedeTypeImages.infusion;
    case 'cutanee':
      return remedeTypeImages.cataplasme;
    case 'inhalation':
      return remedeTypeImages.fumigation;
    case 'gargarisme':
      return remedeTypeImages.melange;
    case 'nasale':
      return remedeTypeImages.fumigation;
    default:
      return remedeTypeImages.infusion;
  }
};

// Icônes de navigation
export const navIcons = {
  chercheur: require('../../assets/icons/chercheur.png'),
  favoris: require('../../assets/icons/favoris.png'),
  explorateur: require('../../assets/icons/explorateur.png'),
  parametre: require('../../assets/icons/parametre.png'),
};

// Assets locaux - Illustrations des plantes
export const illustrations = {
  camomille: require('../../assets/illustrations/cover_camomille.png'),
  carnet: require('../../assets/illustrations/cover_carnet.png'),
  curcuma: require('../../assets/illustrations/cover_curcuma.png'),
  eucalyptus: require('../../assets/illustrations/cover_eucalyptus.png'),
  gingembre: require('../../assets/illustrations/cover_gingembre.png'),
  guide: require('../../assets/illustrations/cover_guide.png'),
  immunite: require('../../assets/illustrations/cover_immunite.png'),
  menthe: require('../../assets/illustrations/cover_menthe.png'),
  mielCitron: require('../../assets/illustrations/cover_miel_citron.png'),
  tilleul: require('../../assets/illustrations/cover_tilleul.png'),
};

// Textures de fond
export const textures = {
  amberWarm: require('../../assets/textures/amber_warm_surface.png'),
  grainDark: require('../../assets/textures/bg_grain_dark.png'),
  grainSoft: require('../../assets/textures/bg_grain_soft.png'),
  cardElevated: require('../../assets/textures/card_elevated.png'),
  cardSoft: require('../../assets/textures/card_soft.png'),
  paperDark: require('../../assets/textures/paper_dark.png'),
  parchment: require('../../assets/textures/parchment_subtle.png'),
  vignetteHerbal: require('../../assets/textures/vignette_herbal.png'),
};

// Mapping des illustrations par nom de plante/remède
export const getIllustration = (name: string) => {
  // Toujours retourner l'image de la grand-mère
  return grandMereRemedes;
};
