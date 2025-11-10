// src/presentation/controllers/CatalogoController.js

import { CardRepositoryImpl } from '../../infrastructure/repositories/cardRepositoryImpl.js';
import { GetCards } from '../../core/usecases/getCardDetail.js';
import { FilterCards } from '../../core/usecases/filterCards.js';
import { ManageCart } from '../../core/usecases/manageCart.js';
import { LocalStorageCart } from '../../infrastructure/storage/LocalStorageCart.js';
import { CardComponent } from '../components/cardComponent.js';
import { LoadingComponent } from '../components/loadingComponent.js';
import { PaginationComponent } from '../components/paginationComponent.js';
import { STORAGE_KEYS, ROUTES, TYPE_TRANSLATIONS } from '../../shared/config/constants.js';
import { takeRandom } from '../../shared/utils/arrayUtils.js';

export class CatalogoController {
  constructor() {
    // Dependencias
    this.cardRepository = new CardRepositoryImpl();
    this.getCardsUseCase = new GetCards(this.cardRepository);
    this.filterCardsUseCase = new FilterCards(this.cardRepository);
    this.manageCartUseCase = new ManageCart(new LocalStorageCart());
    
    // Elementos DOM
    this.gridContainer = document.getElementById('cardsGrid');
    this.loading = new LoadingComponent('loading');
    this.pagination = new PaginationComponent('pagination');
    
    // Filtros
    this.filterNameInput = document.getElementById('filterName');
    this.filterTypeSelect = document.getElementById('filterType');
    this.filterSetInput = document.getElementById('filterSet');
    this.applyFiltersBtn = document.getElementById('applyFilters');
    this.clearFiltersBtn = document.getElementById('clearFilters');
    
    // Estado
    this.allCards = [];
    this.filteredCards = [];
    this.currentPage = 1;
  }

  async init() {
    try {
      this.loading.show();
      
      // Cargar cartas iniciales
      const cardBriefs = await this.getCardsUseCase.execute();
      const sample = takeRandom(cardBriefs, 500);
      this.allCards = await this.getCardsUseCase.executeWithDetails(sample);
      this.filteredCards = [...this.allCards];
      
      // Configurar filtros
      this.populateTypeFilter();
      this.setupEventListeners();
      
      // Renderizar primera página
      this.renderPage(1);
    } catch (error) {
      console.error('Error initializing catalog:', error);
      this.showError();
    } finally {
      this.loading.hide();
    }
  }

  populateTypeFilter() {
    if (!this.filterTypeSelect) return;
    
    const types = this.filterCardsUseCase.getUniqueTypes(this.allCards);
    const firstOption = this.filterTypeSelect.options[0];
    
    this.filterTypeSelect.innerHTML = '';
    if (firstOption) {
      this.filterTypeSelect.appendChild(firstOption);
    }
    
    types.forEach(type => {
      const option = document.createElement('option');
      option.value = type;
      option.textContent = TYPE_TRANSLATIONS[type] || type;
      this.filterTypeSelect.appendChild(option);
    });
  }

  setupEventListeners() {
    this.applyFiltersBtn?.addEventListener('click', () => this.applyFilters());
    this.clearFiltersBtn?.addEventListener('click', () => this.clearFilters());
    this.filterTypeSelect?.addEventListener('change', () => this.applyFilters());
  }

  applyFilters() {
    const filters = {
      name: this.filterNameInput?.value.trim() || '',
      type: this.filterTypeSelect?.value || '',
      set: this.filterSetInput?.value.trim() || ''
    };
    
    this.filteredCards = this.allCards.filter(card => {
      const matchName = !filters.name || 
        card.name.toLowerCase().includes(filters.name.toLowerCase());
      
      const matchType = !filters.type || 
        (card.types && card.types.some(t => t === filters.type));
      
      const matchSet = !filters.set || 
        (card.set?.name && card.set.name.toLowerCase().includes(filters.set.toLowerCase()));
      
      return matchName && matchType && matchSet;
    });
    
    this.renderPage(1);
  }

  clearFilters() {
    if (this.filterNameInput) this.filterNameInput.value = '';
    if (this.filterTypeSelect) this.filterTypeSelect.value = '';
    if (this.filterSetInput) this.filterSetInput.value = '';
    
    this.filteredCards = [...this.allCards];
    this.renderPage(1);
  }

  renderPage(page) {
    if (!this.gridContainer) return;
    
    this.currentPage = page;
    const paginationData = this.filterCardsUseCase.paginate(this.filteredCards, page);
    
    // Limpiar grid
    this.gridContainer.innerHTML = '';
    
    if (paginationData.cards.length === 0) {
      this.gridContainer.innerHTML = 
        '<p style="text-align:center;">No se encontraron cartas.</p>';
      this.pagination.clear();
      return;
    }
    
    // Renderizar cartas
    paginationData.cards.forEach(card => {
      const cardElement = CardComponent.render(card, {
        showAddToCart: true,
        showViewDetail: true,
        onAddToCart: (card) => this.addToCart(card),
        onViewDetail: (card) => this.goToDetail(card)
      });
      
      this.gridContainer.appendChild(cardElement);
    });
    
    // Renderizar paginación
    this.pagination.render(paginationData, (page) => this.renderPage(page));
  }

  addToCart(card) {
    const result = this.manageCartUseCase.addCard(card);
    if (result.success) {
      alert(result.message);
    }
  }

  goToDetail(card) {
    localStorage.setItem(STORAGE_KEYS.SELECTED_CARD, card.id);
    window.location.href = ROUTES.DETAIL;
  }

  showError() {
    if (this.gridContainer) {
      this.gridContainer.innerHTML = 
        '<p style="color:red; text-align:center;">Error al cargar las cartas.</p>';
    }
  }
}