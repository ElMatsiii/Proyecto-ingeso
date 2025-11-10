// src/presentation/controllers/HomeController.js

import { CardRepositoryImpl } from '../../infrastructure/repositories/cardRepositoryImpl.js';
import { GetCards } from '../../core/usecases/getCards.js';
import { ManageCart } from '../../core/usecases/manageCart.js';
import { LocalStorageCart } from '../../infrastructure/storage/LocalStorageCart.js';
import { CardComponent } from '../components/cardComponent.js';
import { LoadingComponent } from '../components/loadingComponent.js';
import { STORAGE_KEYS, ROUTES, HIGH_RARITIES } from '../../shared/config/constants.js';
import { cacheService } from '../../shared/services/cacheService.js';

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
      
      // Obtener una muestra más pequeña pero suficiente (200 cartas)
      const allCardsBrief = await this.getCardsUseCase.execute(200);
      
      // Obtener detalles completos de todas para poder filtrar por rareza
      const allCardsDetailed = await this.getCardsUseCase.executeWithDetails(allCardsBrief);
      
      // Filtrar cartas de alta rareza para destacadas
      const highRarityCards = allCardsDetailed.filter(card => {
        if (!card.rarity) return false;
        const cardRarity = card.rarity.toLowerCase();
        return HIGH_RARITIES.some(rarity => 
          cardRarity.includes(rarity.toLowerCase())
        );
      });
      
      console.log(`Cartas de alta rareza encontradas: ${highRarityCards.length}`);
      
      // Si no hay suficientes de alta rareza, usar cartas no comunes
      let featuredCards;
      if (highRarityCards.length >= 7) {
        featuredCards = highRarityCards.slice(0, 7);
      } else {
        // Filtrar al menos las que no sean "Común"
        const nonCommonCards = allCardsDetailed.filter(card => 
          card.rarity && !card.rarity.toLowerCase().includes('común') && !card.rarity.toLowerCase().includes('common')
        );
        featuredCards = nonCommonCards.slice(0, 7);
      }
      
      // Productos nuevos (primeras 10 cartas)
      const newCards = allCardsDetailed.slice(0, 10);
      
      this.renderNewCards(newCards);
      this.renderFeaturedCards(featuredCards);
      
      // 🚀 Iniciar pre-carga del catálogo en segundo plano
      setTimeout(() => {
        cacheService.preloadCatalog().catch(err => 
          console.warn('Pre-carga del catálogo falló:', err)
        );
      }, 1000); // Esperar 1 segundo después de cargar la página
      
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