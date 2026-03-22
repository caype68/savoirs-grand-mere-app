/* ========================================
   SAVOIRS DE GRAND-MÈRE - MOTEUR DE RECHERCHE
   Recherche et affichage des remèdes
======================================== */

// ========================================
// DONNÉES GLOBALES
// ========================================
let remediesData = [];
let categoriesData = {};
let methodsData = [];
let currentFilters = {
    query: '',
    symptom: null,
    bodyZone: null,
    method: null,
    route: null
};

// ========================================
// CHARGEMENT DES DONNÉES
// ========================================
async function loadData() {
    try {
        const [remediesRes, categoriesRes, methodsRes] = await Promise.all([
            fetch('data/remedies.json'),
            fetch('data/categories.json'),
            fetch('data/methods.json')
        ]);
        
        const remedies = await remediesRes.json();
        const categories = await categoriesRes.json();
        const methods = await methodsRes.json();
        
        remediesData = remedies.remedies;
        categoriesData = categories;
        methodsData = methods.methods;
        
        console.log(`✅ Données chargées: ${remediesData.length} remèdes`);
        
        // Initialiser l'interface
        initializeSearchInterface();
        // Ne pas afficher de remèdes par défaut
        displayEmptyState();
        
    } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
    }
}

// ========================================
// INITIALISATION DE L'INTERFACE
// ========================================
function initializeSearchInterface() {
    // Créer les filtres de symptômes
    const symptomsContainer = document.getElementById('symptomFilters');
    if (symptomsContainer && categoriesData.symptoms) {
        symptomsContainer.innerHTML = categoriesData.symptoms.map(symptom => `
            <button class="filter-chip" data-filter="symptom" data-value="${symptom.id}">
                <span class="filter-icon">${symptom.icone}</span>
                <span>${symptom.nom}</span>
            </button>
        `).join('');
    }
    
    // Créer les filtres de zones du corps
    const bodyZonesContainer = document.getElementById('bodyZoneFilters');
    if (bodyZonesContainer && categoriesData.bodyZones) {
        bodyZonesContainer.innerHTML = categoriesData.bodyZones.map(zone => `
            <button class="filter-chip" data-filter="bodyZone" data-value="${zone.id}">
                <span class="filter-icon">${zone.icone}</span>
                <span>${zone.nom}</span>
            </button>
        `).join('');
    }
    
    // Créer les filtres de méthodes
    const methodsContainer = document.getElementById('methodFilters');
    if (methodsContainer && methodsData) {
        methodsContainer.innerHTML = methodsData.map(method => `
            <button class="filter-chip" data-filter="method" data-value="${method.id}">
                <span class="filter-icon">${method.icone}</span>
                <span>${method.nom}</span>
            </button>
        `).join('');
    }
    
    // Ajouter les événements
    setupEventListeners();
}

// ========================================
// ÉVÉNEMENTS
// ========================================
function setupEventListeners() {
    // Barre de recherche
    const searchInput = document.getElementById('remedySearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });
    }
    
    // Bouton de recherche
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', handleSearch);
    }
    
    // Filtres
    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.addEventListener('click', handleFilterClick);
    });
    
    // Bouton réinitialiser
    const resetBtn = document.getElementById('resetFilters');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetFilters);
    }
    
    // Fermer la modal
    const modalClose = document.getElementById('modalClose');
    if (modalClose) {
        modalClose.addEventListener('click', closeRemedyModal);
    }
    
    const modalOverlay = document.getElementById('remedyModal');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeRemedyModal();
            }
        });
    }
    
    // Échap pour fermer la modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeRemedyModal();
        }
    });
}

// ========================================
// RECHERCHE
// ========================================
function handleSearch() {
    const searchInput = document.getElementById('remedySearchInput');
    if (searchInput) {
        currentFilters.query = searchInput.value.trim().toLowerCase();
    }
    performSearch();
}

function handleFilterClick(e) {
    const chip = e.currentTarget;
    const filterType = chip.dataset.filter;
    const filterValue = chip.dataset.value;
    
    // Toggle le filtre
    if (currentFilters[filterType] === filterValue) {
        currentFilters[filterType] = null;
        chip.classList.remove('active');
    } else {
        // Désactiver les autres chips du même type
        document.querySelectorAll(`.filter-chip[data-filter="${filterType}"]`).forEach(c => {
            c.classList.remove('active');
        });
        currentFilters[filterType] = filterValue;
        chip.classList.add('active');
    }
    
    performSearch();
}

function performSearch() {
    let results = [...remediesData];
    
    // Filtre par texte
    if (currentFilters.query) {
        const query = currentFilters.query.toLowerCase();
        results = results.filter(remedy => {
            const searchableText = [
                remedy.nom,
                ...(remedy.alias || []),
                ...(remedy.indicationsTexte || []),
                ...(remedy.ingredients?.map(i => i.nom) || [])
            ].join(' ').toLowerCase();
            
            return searchableText.includes(query);
        });
    }
    
    // Filtre par symptôme
    if (currentFilters.symptom) {
        results = results.filter(remedy => 
            remedy.indications?.includes(currentFilters.symptom)
        );
    }
    
    // Filtre par zone du corps
    if (currentFilters.bodyZone) {
        const zone = categoriesData.bodyZones?.find(z => z.id === currentFilters.bodyZone);
        if (zone && zone.symptoms) {
            results = results.filter(remedy => 
                remedy.indications?.some(ind => zone.symptoms.includes(ind))
            );
        }
    }
    
    // Filtre par méthode/type
    if (currentFilters.method) {
        results = results.filter(remedy => 
            remedy.type === currentFilters.method
        );
    }
    
    // Filtre par voie d'administration
    if (currentFilters.route) {
        results = results.filter(remedy => 
            remedy.route === currentFilters.route
        );
    }
    
    displaySearchResults(results);
}

function resetFilters() {
    currentFilters = {
        query: '',
        symptom: null,
        bodyZone: null,
        method: null,
        route: null
    };
    
    // Réinitialiser l'input
    const searchInput = document.getElementById('remedySearchInput');
    if (searchInput) {
        searchInput.value = '';
    }
    
    // Désactiver tous les chips
    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.classList.remove('active');
    });
    
    // Afficher l'état vide
    displayEmptyState();
}

// ========================================
// AFFICHAGE DES RÉSULTATS
// ========================================
function displaySearchResults(results) {
    const container = document.getElementById('searchResults');
    const countEl = document.getElementById('resultsCount');
    
    if (!container) return;
    
    // Mettre à jour le compteur
    if (countEl) {
        const hasFilters = currentFilters.query || currentFilters.symptom || 
                          currentFilters.bodyZone || currentFilters.method;
        if (hasFilters) {
            countEl.textContent = `${results.length} remède${results.length > 1 ? 's' : ''} trouvé${results.length > 1 ? 's' : ''}`;
            countEl.style.display = 'block';
        } else {
            countEl.style.display = 'none';
        }
    }
    
    if (results.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <div class="no-results-icon">🔍</div>
                <h3>Aucun remède trouvé</h3>
                <p>Essayez de modifier vos critères de recherche ou explorez nos catégories.</p>
                <button class="btn btn-secondary" onclick="resetFilters()">Réinitialiser les filtres</button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = results.map(remedy => createRemedyCard(remedy)).join('');
    
    // Ajouter les événements de clic
    container.querySelectorAll('.remedy-card-search').forEach(card => {
        card.addEventListener('click', () => {
            const remedyId = card.dataset.remedyId;
            openRemedyModal(remedyId);
        });
    });
}

function displayEmptyState() {
    const container = document.getElementById('searchResults');
    const countEl = document.getElementById('resultsCount');
    
    if (!container) return;
    
    if (countEl) {
        countEl.style.display = 'none';
    }
    
    container.innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon">🌿</div>
            <h3>Recherchez un remède</h3>
            <p>Tapez un mot-clé pour trouver des remèdes traditionnels : symptôme, ingrédient, type de préparation...</p>
        </div>
    `;
}

// Mapping des types vers les images
const typeImages = {
    'infusion': 'assets/images/Infusions.png',
    'tisane': 'assets/images/tisanes.png',
    'cataplasme': 'assets/images/Cataplasmes.png',
    'compresse': 'assets/images/compresses.png',
    'inhalation': 'assets/images/fumigations.png',
    'friction': 'assets/images/frictions.png',
    'sirop': 'assets/images/sirop.png',
    'bain': 'assets/images/mélanges à boire.png',
    'gargarisme': 'assets/images/Infusions.png'
};

function createRemedyCard(remedy) {
    const methodInfo = methodsData.find(m => m.id === remedy.type);
    const methodIcon = methodInfo?.icone || '🌿';
    const methodName = methodInfo?.nom || remedy.type;
    
    // Utiliser l'image selon le type de remède
    const imageUrl = typeImages[remedy.type] || 'assets/images/Infusions.png';
    
    const difficultyClass = remedy.difficulte === 'facile' ? 'easy' : 
                           remedy.difficulte === 'moyen' ? 'medium' : 'hard';
    
    return `
        <article class="remedy-card-search" data-remedy-id="${remedy.id}">
            ${remedy.populaire ? '<div class="remedy-badge">Populaire</div>' : ''}
            <div class="remedy-card-image">
                <img src="${imageUrl}" alt="${remedy.nom}" loading="lazy" 
                     onerror="this.src='assets/images/Infusions.png'">
            </div>
            <div class="remedy-card-content">
                <div class="remedy-card-type">
                    <span class="type-icon">${methodIcon}</span>
                    <span>${methodName}</span>
                </div>
                <h3 class="remedy-card-title">${remedy.nom}</h3>
                <p class="remedy-card-indications">${remedy.indicationsTexte?.slice(0, 3).join(' • ') || ''}</p>
                <div class="remedy-card-meta">
                    <span class="remedy-duration">⏱ ${remedy.duree}</span>
                    <span class="remedy-difficulty ${difficultyClass}">${remedy.difficulte}</span>
                </div>
            </div>
        </article>
    `;
}

// ========================================
// MODAL DÉTAIL REMÈDE
// ========================================
function openRemedyModal(remedyId) {
    const remedy = remediesData.find(r => r.id === remedyId);
    if (!remedy) return;
    
    const modal = document.getElementById('remedyModal');
    const content = document.getElementById('remedyModalContent');
    
    if (!modal || !content) return;
    
    const methodInfo = methodsData.find(m => m.id === remedy.type);
    const routeInfo = categoriesData.routes?.find(r => r.id === remedy.route);
    
    content.innerHTML = `
        <div class="remedy-detail">
            <div class="remedy-detail-header">
                <div class="remedy-detail-image">
                    <img src="${remedy.image}" alt="${remedy.nom}"
                         onerror="this.src='assets/illustrations/cover_guide.png'">
                </div>
                <div class="remedy-detail-info">
                    <div class="remedy-detail-badges">
                        ${remedy.populaire ? '<span class="badge badge-popular">⭐ Populaire</span>' : ''}
                        ${remedy.verifie ? '<span class="badge badge-verified">✓ Vérifié</span>' : ''}
                    </div>
                    <h2 class="remedy-detail-title">${remedy.nom}</h2>
                    ${remedy.alias?.length ? `<p class="remedy-detail-alias">Aussi appelé : ${remedy.alias.join(', ')}</p>` : ''}
                    <div class="remedy-detail-meta">
                        <span class="meta-item">
                            <span class="meta-icon">${methodInfo?.icone || '🌿'}</span>
                            ${methodInfo?.nom || remedy.type}
                        </span>
                        <span class="meta-item">
                            <span class="meta-icon">💊</span>
                            ${routeInfo?.nom || remedy.route}
                        </span>
                        <span class="meta-item">
                            <span class="meta-icon">⏱</span>
                            ${remedy.duree}
                        </span>
                        <span class="meta-item difficulty-${remedy.difficulte}">
                            <span class="meta-icon">📊</span>
                            ${remedy.difficulte}
                        </span>
                    </div>
                </div>
            </div>
            
            <div class="remedy-detail-section">
                <h3>🎯 Indications</h3>
                <div class="indication-tags">
                    ${remedy.indicationsTexte?.map(ind => `<span class="indication-tag">${ind}</span>`).join('') || ''}
                </div>
            </div>
            
            <div class="remedy-detail-section">
                <h3>🧪 Ingrédients</h3>
                <ul class="ingredients-list">
                    ${remedy.ingredients?.map(ing => `
                        <li class="ingredient-item">
                            <span class="ingredient-name">${ing.nom}</span>
                            <span class="ingredient-qty">${ing.quantite}${ing.optionnel ? ' (optionnel)' : ''}</span>
                        </li>
                    `).join('') || '<li>Non spécifié</li>'}
                </ul>
            </div>
            
            <div class="remedy-detail-section">
                <h3>📝 Préparation</h3>
                <ol class="preparation-steps">
                    ${remedy.preparation?.map(step => `<li>${step}</li>`).join('') || '<li>Non spécifié</li>'}
                </ol>
            </div>
            
            <div class="remedy-detail-section">
                <h3>💊 Posologie</h3>
                <div class="posology-info">
                    <p><strong>Fréquence :</strong> ${remedy.posologie?.frequence || 'Non spécifié'}</p>
                    <p><strong>Durée :</strong> ${remedy.posologie?.duree || 'Non spécifié'}</p>
                </div>
            </div>
            
            ${remedy.contreIndications?.length ? `
                <div class="remedy-detail-section warning-section">
                    <h3>⚠️ Contre-indications</h3>
                    <ul class="warning-list">
                        ${remedy.contreIndications.map(ci => `<li>${ci}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
            
            ${remedy.precautions?.length ? `
                <div class="remedy-detail-section caution-section">
                    <h3>⚡ Précautions</h3>
                    <ul class="caution-list">
                        ${remedy.precautions.map(p => `<li>${p}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
            
            <div class="remedy-detail-disclaimer">
                <p>⚕️ Les informations présentées sont issues de savoirs traditionnels et ne remplacent pas un avis médical professionnel.</p>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeRemedyModal() {
    const modal = document.getElementById('remedyModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// ========================================
// UTILITAIRES
// ========================================
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ========================================
// INITIALISATION
// ========================================
document.addEventListener('DOMContentLoaded', loadData);
