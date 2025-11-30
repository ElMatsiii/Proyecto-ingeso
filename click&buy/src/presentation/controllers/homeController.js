// src/presentation/controllers/homeController.js - CORREGIDO
import { NeonCardRepository } from '../../infrastructure/repositories/neonCardRepository.js';
import { GetCards } from '../../core/usecases/getCards.js';
import { ManageCart } from '../../core/usecases/manageCart.js';
import { LocalStorageCart } from '../../infrastructure/storage/LocalStorageCart.js';
import { CardComponent } from '../components/cardComponent.js';
import { LoadingComponent } from '../components/loadingComponent.js';
import { STORAGE_KEYS, ROUTES, HIGH_RARITIES } from '../../shared/config/constants.js';

export class HomeController {
  constructor() {
    // CAMBIO: Usar NeonCardRepository en vez de CardRepositoryImpl
    this.cardRepository = new NeonCardRepository();
    this.getCardsUseCase = new GetCards(this.cardRepository);
    this.manageCartUseCase = new ManageCart(new LocalStorageCart());
    
    this.newCardsContainer = document.getElementById('newCards');
    this.featuredContainer = document.getElementById('featuredCards');
    this.loading = new LoadingComponent('loading');
  }

  async init() {
    try {
      this.loading.show();
      
      // Obtener todas las cartas con stock de Neon
      const allCards = await this.cardRepository.getAllCards();
      
      console.log(`Total cartas con stock: ${allCards.length}`);
      
      // Mezclar aleatoriamente
      const shuffled = this.shuffleArray(allCards);
      
      // Filtrar cartas de alta rareza para destacadas
      const highRarityCards = shuffled.filter(card => {
        if (!card.rarity) return false;
        const cardRarity = card.rarity.toLowerCase();
        return HIGH_RARITIES.some(rarity => 
          cardRarity.includes(rarity.toLowerCase())
        );
      });
      
      console.log(`Cartas de alta rareza encontradas: ${highRarityCards.length}`);
      
      // Seleccionar cartas destacadas
      let featuredCards;
      if (highRarityCards.length >= 7) {
        featuredCards = highRarityCards.slice(0, 7);
      } else {
        // Filtrar al menos las que no sean "Común"
        const nonCommonCards = shuffled.filter(card => 
          card.rarity && 
          !card.rarity.toLowerCase().includes('común') && 
          !card.rarity.toLowerCase().includes('common')
        );
        featuredCards = nonCommonCards.slice(0, 7);
      }
      
      // Productos nuevos (primeras 10 cartas aleatorias)
      const newCards = shuffled.slice(0, 10);
      
      this.renderNewCards(newCards);
      this.renderFeaturedCards(featuredCards);
      
    } catch (error) {
      console.error('Error initializing home:', error);
      this.showError();
    } finally {
      this.loading.hide();
    }
  }

  // Función auxiliar para mezclar array
  shuffleArray(array) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
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
    if (!this.featuredContainer || cards.length < 7) {
      console.warn('No hay suficientes cartas para destacadas');
      return;
    }
    
    this.featuredContainer.innerHTML = '';
    
    // Primera carta grande
    const [mainCard, ...miniCards] = cards;
    const mainElement = CardComponent.renderFeatured(
      mainCard, 
      (card) => this.goToDetail(card)
    );
    this.featuredContainer.appendChild(mainElement);
    
    // Contenedor de cartas mini
    const sideContainer = document.createElement('div');
    sideContainer.className = 'featured-side';
    
    miniCards.forEach(card => {
      const miniElement = CardComponent.renderMini(
        card, 
        (card) => this.goToDetail(card)
      );
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