// src/presentation/controllers/HomeController.js

import { CardRepositoryImpl } from '../../infrastructure/repositories/cardRepositoryImpl.js';
import { GetCards } from '../../core/usecases/getCardDetail.js';
import { ManageCart } from '../../core/usecases/manageCart.js';
import { LocalStorageCart } from '../../infrastructure/storage/LocalStorageCart.js';
import { CardComponent } from '../components/cardComponent.js';
import { LoadingComponent } from '../components/loadingComponent.js';
import { STORAGE_KEYS, ROUTES } from '../../shared/config/constants.js';

export class HomeController {
  constructor() {
    // Dependencias
    this.cardRepository = new CardRepositoryImpl();
    this.getCardsUseCase = new GetCards(this.cardRepository);
    this.manageCartUseCase = new ManageCart(new LocalStorageCart());
    
    // Elementos DOM
    this.newCardsContainer = document.getElementById('newCards');
    this.featuredContainer = document.getElementById('featuredCards');
    this.loading = new LoadingComponent('loading');
  }

  async init() {
    try {
      this.loading.show();
      const { newCards, featuredCards } = await this.getCardsUseCase.executeForHome();
      
      this.renderNewCards(newCards);
      this.renderFeaturedCards(featuredCards);
    } catch (error) {
      console.error('Error initializing home:', error);
      this.showError();
    } finally {
      this.loading.hide();
    }
  }

  renderNewCards(cards) {
    if (!this.newCardsContainer) return;
    
    this.newCardsContainer.innerHTML = '';
    
    cards.forEach(card => {
      const cardElement = CardComponent.render(card, {
        showAddToCart: false,
        showViewDetail: true,
        onViewDetail: (card) => this.goToDetail(card)
      });
      
      this.newCardsContainer.appendChild(cardElement);
    });
  }

  renderFeaturedCards(cards) {
    if (!this.featuredContainer || cards.length < 7) return;
    
    this.featuredContainer.innerHTML = '';
    
    // Primera carta grande
    const [mainCard, ...miniCards] = cards;
    const mainElement = CardComponent.renderFeatured(mainCard, (card) => this.goToDetail(card));
    this.featuredContainer.appendChild(mainElement);
    
    // Contenedor de cartas mini
    const sideContainer = document.createElement('div');
    sideContainer.className = 'featured-side';
    
    miniCards.forEach(card => {
      const miniElement = CardComponent.renderMini(card, (card) => this.goToDetail(card));
      sideContainer.appendChild(miniElement);
    });
    
    this.featuredContainer.appendChild(sideContainer);
  }

  goToDetail(card) {
    localStorage.setItem(STORAGE_KEYS.SELECTED_CARD, card.id);
    window.location.href = `pages/${ROUTES.DETAIL}`;
  }

  showError() {
    if (this.newCardsContainer) {
      this.newCardsContainer.innerHTML = 
        '<p style="color:red; text-align:center;">No se pudieron cargar las cartas.</p>';
    }
  }
}