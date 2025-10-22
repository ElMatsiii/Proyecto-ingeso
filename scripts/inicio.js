// Pega tu clave de API aquí, dentro de las comillas
// Pega tu clave de API aquí, dentro de las comillas
const API_KEY = '48a13f81-415e-49f8-b855-56d75f0720ed'; 

// --- VARIABLES GLOBALES ---
const API_BASE_URL = 'https://api.pokemontcg.io/v2';
const CARDS_PER_PAGE = 9;
let currentPage = 1;

// --- EVENT LISTENER ---
document.addEventListener('DOMContentLoaded', function() {
    loadCards(1);
});

// --- FUNCIONES ---

async function loadCards(page = 1) {
    console.log(`Intentando cargar página: ${page}`);
    currentPage = page;

    try {
        showLoading(true);
        document.getElementById('cardsGrid').innerHTML = '';
        document.getElementById('pagination').innerHTML = '';

        const url = `${API_BASE_URL}/cards?pageSize=${CARDS_PER_PAGE}&page=${page}`;
        
        // --- CAMBIO CLAVE AQUÍ ---
        // Añadimos las cabeceras 'Accept' y 'Content-Type' para que la solicitud
        // parezca más estándar y evitar el error 500 del servidor.
        const response = await fetch(url, {
            headers: {
                'X-Api-Key': API_KEY,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Error de la API: ${response.statusText} (código: ${response.status})`);
        }
        
        const data = await response.json();
        
        displayCards(data.data || []);
        displayPagination(data.totalCount);
        
    } catch (error) {
        console.error('Error detallado al cargar cartas:', error); 
        showError('No se pudieron cargar las cartas.');
    } finally {
        showLoading(false);
    }
}

function displayPagination(totalCount) {
    const paginationContainer = document.getElementById('pagination');
    if (!paginationContainer || !totalCount) return;

    paginationContainer.innerHTML = '';
    const totalPages = Math.ceil(totalCount / CARDS_PER_PAGE);
    let startPage = Math.max(1, currentPage - 4);
    let endPage = Math.min(totalPages, startPage + 9);
    if (endPage - startPage < 9) { startPage = Math.max(1, endPage - 9); }
    
    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.innerText = i;
        pageButton.addEventListener('click', () => loadCards(i));
        if (i === currentPage) { pageButton.className = 'active'; }
        paginationContainer.appendChild(pageButton);
    }
}

// --- El resto de funciones auxiliares (sin cambios) ---

function showLoading(show) {
    const el = document.getElementById('loading');
    if (el) el.style.display = show ? 'block' : 'none';
}

function displayCards(cards) {
    const grid = document.getElementById('cardsGrid');
    if (!cards || cards.length === 0) {
        grid.innerHTML = `<div class="loading"><p>No se encontraron cartas.</p></div>`;
        return;
    }
    cards.forEach(card => grid.appendChild(createCardElement(card)));
}

function createCardElement(card) {
    const div = document.createElement('div');
    div.className = 'card-item';
    const types = card.types || ['N/A'];
    const rarity = card.rarity || 'Común';
    const setName = card.set?.name || 'N/A';
    div.innerHTML = `
        <div class="card-image"><img src="${card.images?.large || card.images?.small || ''}" alt="${card.name}" onerror="this.src='https://via.placeholder.com/245x342?text=No+Image'"></div>
        <div class="card-content">
            <h3 class="card-name">${card.name}</h3>
            <div class="card-info">
                <div class="card-detail"><span class="card-label">Tipo:</span><div class="card-types">${types.map(t => `<span class="type-badge">${t}</span>`).join('')}</div></div>
                <div class="card-detail"><span class="card-label">Rareza:</span><span class="rarity-badge ${getRarityClass(rarity)}">${rarity}</span></div>
                <div class="card-detail"><span class="card-label">Set:</span><span class="card-value">${setName}</span></div>
            </div>
        </div>`;
    return div;
}

function getRarityClass(rarity) {
    const r = (rarity || '').toLowerCase();
    if (r.includes('rare')) return 'rarity-rare';
    if (r.includes('uncommon')) return 'rarity-uncommon';
    if (r.includes('ultra') || r.includes('secret')) return 'rarity-ultra';
    return 'rarity-common';
}

function showError(message) {
    const grid = document.getElementById('cardsGrid');
    grid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: white;"><h3 style="color: #ef4444;">Error</h3><p>${message}</p><button onclick="loadCards(1)">Reintentar</button></div>`;
}