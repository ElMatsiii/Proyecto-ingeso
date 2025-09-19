// Global Variables
let currentPage = 1;
let totalPages = 1;
let cart = [];
let allCards = [];
let currentFilters = {};

// API Configuration
const API_BASE_URL = 'https://api.pokemontcg.io/v2';
const CARDS_PER_PAGE = 12;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadCartFromStorage();
    updateCartDisplay();
    loadSets();
    loadInitialCards();
});

// API Functions
async function fetchCards(page = 1, filters = {}) {
    try {
        showLoading(true);
        
        let url = `${API_BASE_URL}/cards?pageSize=${CARDS_PER_PAGE}&page=${page}`;
        
        // Build query parameters
        const queryParams = [];
        
        if (filters.name) {
            queryParams.push(`name:"*${filters.name}*"`);
        }
        
        if (filters.type) {
            queryParams.push(`types:${filters.type}`);
        }
        
        if (filters.rarity) {
            queryParams.push(`rarity:"${filters.rarity}"`);
        }
        
        if (filters.set) {
            queryParams.push(`set.id:${filters.set}`);
        }
        
        if (queryParams.length > 0) {
            url += `&q=${encodeURIComponent(queryParams.join(' '))}`;
        }
        
        const response = await fetch(url);
        const data = await response.json();
        
        showLoading(false);
        return data;
    } catch (error) {
        console.error('Error fetching cards:', error);
        showLoading(false);
        return { data: [], totalCount: 0 };
    }
}

async function fetchSets() {
    try {
        const response = await fetch(`${API_BASE_URL}/sets`);
        const data = await response.json();
        return data.data || [];
    } catch (error) {
        console.error('Error fetching sets:', error);
        return [];
    }
}

// UI Functions
function showLoading(show) {
    const loading = document.getElementById('loading');
    loading.style.display = show ? 'block' : 'none';
}

async function loadInitialCards() {
    const data = await fetchCards(1);
    displayCards(data.data || []);
    updatePagination(data.totalCount || 0);
}

async function loadSets() {
    const sets = await fetchSets();
    const setSelect = document.getElementById('filterSet');
    
    sets.forEach(set => {
        const option = document.createElement('option');
        option.value = set.id;
        option.textContent = set.name;
        setSelect.appendChild(option);
    });
}

function displayCards(cards) {
    const cardsGrid = document.getElementById('cardsGrid');
    cardsGrid.innerHTML = '';
    
    if (cards.length === 0) {
        cardsGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: white;">
                <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <h3>No se encontraron cartas</h3>
                <p>Intenta ajustar los filtros de búsqueda</p>
            </div>
        `;
        return;
    }
    
    cards.forEach(card => {
        const cardElement = createCardElement(card);
        cardsGrid.appendChild(cardElement);
    });
}

function createCardElement(card) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card-item';
    
    const price = generateRandomPrice();
    
    cardDiv.innerHTML = `
        <div class="card-image">
            <img src="${card.images?.large || card.images?.small || 'https://via.placeholder.com/245x342?text=Pokemon+Card'}" 
                 alt="${card.name}" 
                 onerror="this.src='https://via.placeholder.com/245x342?text=Pokemon+Card'">
        </div>
        <div class="card-content">
            <h3 class="card-title">${card.name}</h3>
            <div class="card-details">
                ${card.types ? card.types.map(type => `<span class="card-tag type">${type}</span>`).join('') : ''}
                ${card.rarity ? `<span class="card-tag rarity">${card.rarity}</span>` : ''}
                ${card.set ? `<span class="card-tag set">${card.set.name}</span>` : ''}
            </div>
            <div class="card-price">
                <span class="price">$${price}</span>
                <button class="add-to-cart" onclick="addToCart('${card.id}', '${card.name}', '${card.images?.small || ''}', ${price})">
                    <i class="fas fa-cart-plus"></i> Agregar
                </button>
            </div>
        </div>
    `;
    
    return cardDiv;
}

function generateRandomPrice() {
    // Generate realistic Pokemon card prices
    const rarityMultipliers = [
        { min: 1, max: 5 },    // Common
        { min: 3, max: 10 },   // Uncommon  
        { min: 5, max: 25 },   // Rare
        { min: 15, max: 100 }  // Ultra Rare
    ];
    
    const multiplier = rarityMultipliers[Math.floor(Math.random() * rarityMultipliers.length)];
    const price = Math.random() * (multiplier.max - multiplier.min) + multiplier.min;
    return price.toFixed(2);
}

function updatePagination(totalCount) {
    totalPages = Math.ceil(totalCount / CARDS_PER_PAGE);
    
    document.getElementById('pageInfo').textContent = `Página ${currentPage} de ${totalPages}`;
    document.getElementById('prevBtn').disabled = currentPage <= 1;
    document.getElementById('nextBtn').disabled = currentPage >= totalPages;
}

// Search and Filter Functions
async function searchCards() {
    currentFilters = {
        name: document.getElementById('searchName').value.trim(),
        type: document.getElementById('filterType').value,
        rarity: document.getElementById('filterRarity').value,
        set: document.getElementById('filterSet').value
    };
    
    currentPage = 1;
    const data = await fetchCards(currentPage, currentFilters);
    displayCards(data.data || []);
    updatePagination(data.totalCount || 0);
}

function clearFilters() {
    document.getElementById('searchName').value = '';
    document.getElementById('filterType').value = '';
    document.getElementById('filterRarity').value = '';
    document.getElementById('filterSet').value = '';
    
    currentFilters = {};
    currentPage = 1;
    loadInitialCards();
}

async function changePage(direction) {
    const newPage = currentPage + direction;
    if (newPage < 1 || newPage > totalPages) return;
    
    currentPage = newPage;
    const data = await fetchCards(currentPage, currentFilters);
    displayCards(data.data || []);
    updatePagination(data.totalCount || 0);
    
    // Scroll to top of cards section
    document.querySelector('.cards-section').scrollIntoView({ behavior: 'smooth' });
}

// Shopping Cart Functions
function addToCart(id, name, image, price) {
    const existingItem = cart.find(item => item.id === id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: id,
            name: name,
            image: image,
            price: parseFloat(price),
            quantity: 1
        });
    }
    
    updateCartDisplay();
    saveCartToStorage();
    
    // Show feedback
    showAddToCartFeedback();
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    updateCartDisplay();
    saveCartToStorage();
}

function updateQuantity(id, change) {
    const item = cart.find(item => item.id === id);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(id);
        } else {
            updateCartDisplay();
            saveCartToStorage();
        }
    }
}

function updateCartDisplay() {
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    
    // Update cart items
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                <p>Tu carrito está vacío</p>
                <p>Agrega algunas cartas increíbles</p>
            </div>
        `;
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-image">
                    <img src="${item.image || 'https://via.placeholder.com/60x60?text=Pokemon'}" 
                         alt="${item.name}"
                         onerror="this.src='https://via.placeholder.com/60x60?text=Pokemon'">
                </div>
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                    <div class="cart-item-controls">
                        <button class="quantity-btn" onclick="updateQuantity('${item.id}', -1)">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity('${item.id}', 1)">
                            <i class="fas fa-plus"></i>
                        </button>
                        <button class="remove-item" onclick="removeFromCart('${item.id}')">
                            <i class="fas fa-trash"></i> Eliminar
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    // Update total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = total.toFixed(2);
}

function toggleCart() {
    const cart = document.getElementById('cart');
    const overlay = document.getElementById('cartOverlay');
    
    const isActive = cart.classList.contains('active');
    
    if (isActive) {
        cart.classList.remove('active');
        overlay.style.display = 'none';
    } else {
        cart.classList.add('active');
        overlay.style.display = 'block';
    }
}

function checkout() {
    if (cart.length === 0) {
        alert('Tu carrito está vacío');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    alert(`¡Gracias por tu compra!\n\nResumen:\n${itemCount} artículos\nTotal: $${total.toFixed(2)}\n\nEn una implementación real, aquí se procesaría el pago.`);
    
    // Clear cart after checkout
    cart = [];
    updateCartDisplay();
    saveCartToStorage();
    toggleCart();
}

// Local Storage Functions
function saveCartToStorage() {
    localStorage.setItem('pokemonTCGCart', JSON.stringify(cart));
}

function loadCartFromStorage() {
    const savedCart = localStorage.getItem('pokemonTCGCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
}

// Utility Functions
function showAddToCartFeedback() {
    // Create a temporary notification
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        z-index: 3000;
        animation: slideIn 0.3s ease;
    `;
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i> 
        ¡Carta agregada al carrito!
    `;
    
    // Add animation keyframes
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Event Listeners
document.getElementById('searchName').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchCards();
    }
});

// Close cart when clicking outside
document.addEventListener('click', function(e) {
    const cart = document.getElementById('cart');
    const cartIcon = document.querySelector('.cart-icon');
    
    if (cart.classList.contains('active') && 
        !cart.contains(e.target) && 
        !cartIcon.contains(e.target)) {
        toggleCart();
    }
});

// Handle escape key to close cart
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const cart = document.getElementById('cart');
        if (cart.classList.contains('active')) {
            toggleCart();
        }
    }
});