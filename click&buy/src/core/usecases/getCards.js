import { shuffle } from '../../shared/utils/arrayUtils.js';
import { APP_CONFIG } from '../../shared/config/constants.js';

export class GetCards {
  constructor(cardRepository) {
    this.cardRepository = cardRepository;
  }

  async execute(count = APP_CONFIG.POOL_SIZE) {
    try {
      const allCards = await this.cardRepository.getAllCards();
      const shuffled = shuffle(allCards);
      return shuffled.slice(0, count);
    } catch (error) {
      console.error('Error in GetCards:', error);
      throw new Error('No se pudieron cargar las cartas');
    }
  }

  async executeForHome() {
    try {
      const allCards = await this.cardRepository.getAllCards();
      const shuffled = shuffle(allCards);
      
      return {
        newCards: shuffled.slice(0, APP_CONFIG.NEW_CARDS),
        featuredCards: shuffled.slice(
          APP_CONFIG.NEW_CARDS,
          APP_CONFIG.NEW_CARDS + APP_CONFIG.FEATURED_CARDS
        )
      };
    } catch (error) {
      console.error('Error in GetCards for home:', error);
      throw new Error('No se pudieron cargar las cartas');
    }
  }

  async executeWithDetails(cardBriefs) {
    try {
      return await this.cardRepository.getCardsByIds(cardBriefs);
    } catch (error) {
      console.error('Error getting card details:', error);
      throw new Error('No se pudieron cargar los detalles');
    }
  }
}