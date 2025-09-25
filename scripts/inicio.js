// Variable global para almacenar las cartas
let currentCards = [];
const API_BASE_URL = 'https://api.pokemontcg.io/v2';

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    console.log('Pokemon TCG Store cargado');
    // La página se inicia sin cartas, el usuario debe hacer clic en "Ver Cartas"
});

// Función para mostrar/ocultar loading
function showLoading(show) {
    document.getElementById('loading').style.display = show ? 'block' : 'none';
}

// Función principal para cargar cartas desde la API
async function loadCards() {
    try {
        showLoading(true);
        
        // Obtener cartas aleatorias de la API
        const response = await fetch(`${API_BASE_URL}/cards?pageSize=9`);
        
        if (!response.ok) {
            throw new Error('Error al conectar con la API');
        }
        
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

// Función para mostrar las cartas en la página
function displayCards(cards) {
    const cardsGrid = document.getElementById('cardsGrid');
    
    if (!cards || cards.length === 0) {
        cardsGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: white;">
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

// Función para crear el elemento HTML de cada carta
function createCardElement(card) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card-item';
    
    // Procesar información de la carta
    const types = card.types ? card.types : ['Desconocido'];
    const rarity = card.rarity || 'Común';
    const setName = card.set ? card.set.name : 'Set desconocido';
    const artist = card.artist || 'Artista desconocido';
    
    cardDiv.innerHTML = `
        <div class="card-image">
            <img src="${card.images?.large || card.images?.small || 'https://via.placeholder.com/245x342?text=Pokemon+Card'}" 
                 alt="${card.name}" 
                 onerror="this.src='https://via.placeholder.com/245x342?text=Pokemon+Card'">
        </div>
        <div class="card-content">
            <div class="card-name">${card.name}</div>
            <div class="card-info">
                <div class="card-detail">
                    <span class="card-label">Tipo:</span>
                    <div class="card-types">
                        ${types.map(type => `<span class="type-badge">${type}</span>`).join('')}
                    </div>
                </div>
                <div class="card-detail">
                    <span class="card-label">Rareza:</span>
                    <span class="rarity-badge ${getRarityClass(rarity)}">${rarity}</span>
                </div>
                <div class="card-detail">
                    <span class="card-label">Set:</span>
                    <span class="card-value">${setName}</span>
                </div>
                <div class="card-detail">
                    <span class="card-label">Artista:</span>
                    <span class="card-value">${artist}</span>
                </div>
            </div>
        </div>
    `;
    
    return cardDiv;
}

// Función para obtener la clase CSS según la rareza
function getRarityClass(rarity) {
    const rarityLower = rarity.toLowerCase();
    
    if (rarityLower.includes('common') || rarityLower === 'común') {
        return 'rarity-common';
    } else if (rarityLower.includes('uncommon') || rarityLower === 'poco común') {
        return 'rarity-uncommon';
    } else if (rarityLower.includes('rare') || rarityLower === 'rara') {
        return 'rarity-rare';
    } else if (rarityLower.includes('ultra') || rarityLower.includes('secret')) {
        return 'rarity-ultra';
    } else {
        return 'rarity-common';
    }
}

// Función para mostrar errores
function showError(message) {
    const cardsGrid = document.getElementById('cardsGrid');
    cardsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: white; background: rgba(239, 68, 68, 0.1); border-radius: 10px; border: 2px solid rgba(239, 68, 68, 0.3);">
            <h3 style="color: #ef4444; margin-bottom: 1rem;"> Error</h3>
            <p>${message}</p>
            <button onclick="loadCards()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #ef4444; color: white; border: none; border-radius: 5px; cursor: pointer;">
                Intentar de nuevo
            </button>
        </div>
    `;
}

// Función para recargar cartas (opcional)
function reloadCards() {
    loadCards();
}