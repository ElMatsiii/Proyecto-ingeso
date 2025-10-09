// Variable global para almacenar las cartas 
let currentCards = [];
const API_BASE_URL = 'https://api.pokemontcg.io/v2';

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    console.log('Pokemon TCG Store cargado');
});

// Mostrar/ocultar loading
function showLoading(show) {
    document.getElementById('loading').style.display = show ? 'block' : 'none';
}

// Función principal para cargar cartas desde la API
async function loadCards() {
    try {
        showLoading(true);
        const response = await fetch(`${API_BASE_URL}/cards?pageSize=9`);
        if (!response.ok) throw new Error('Error al conectar con la API');
        
        const data = await response.json();
        currentCards = data.data || [];
        showLoading(false);
        displayCards(currentCards);
    } catch (error) {
        console.error('Error al cargar cartas:', error);
        showLoading(false);
        showError('Error al cargar las cartas. Por favor, intenta de nuevo.');
    }
}

// Mostrar cartas
function displayCards(cards) {
    const cardsGrid = document.getElementById('cardsGrid');
    if (!cards || cards.length === 0) {
        cardsGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: #333;">
                <h3>No se encontraron cartas</h3>
                <p>Intenta cargar de nuevo</p>
            </div>
        `;
        return;
    }
    cardsGrid.innerHTML = '';
    cards.forEach(card => {
        const cardElement = createCardElement(card);
        cardsGrid.appendChild(cardElement);
    });
}

// Crear carta individual
function createCardElement(card) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card';

    const types = card.types || ['Desconocido'];
    const rarity = card.rarity || 'Común';
    const setName = card.set?.name || 'Set desconocido';
    const artist = card.artist || 'Artista desconocido';

    cardDiv.innerHTML = `
        <img class="thumb" src="${card.images?.large || card.images?.small}" alt="${card.name}">
        <div class="card-body">
            <h3 class="card-title">${card.name}</h3>
            <p class="meta">Rareza: <strong>${rarity}</strong></p>
            <p class="meta">Tipo: ${types.join(', ')}</p>
            <p class="meta">Set: ${setName}</p>
            <p class="meta">Artista: ${artist}</p>
        </div>
    `;
    return cardDiv;
}

// Obtener clase CSS según rareza (no estrictamente necesario)
function getRarityClass(rarity) {
    const r = rarity.toLowerCase();
    if (r.includes('rare')) return 'rarity-rare';
    if (r.includes('uncommon')) return 'rarity-uncommon';
    return 'rarity-common';
}

// Mostrar error
function showError(message) {
    const cardsGrid = document.getElementById('cardsGrid');
    cardsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align:center; padding:2rem; border-radius:10px; background:#fee2e2;">
            <h3 style="color:#ef4444;">Error</h3>
            <p>${message}</p>
            <button onclick="loadCards()" class="btn" style="margin-top:1rem;">Reintentar</button>
        </div>
    `;
}