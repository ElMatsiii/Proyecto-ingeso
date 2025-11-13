import { shuffle } from '../../shared/utils/arrayUtils.js';
import { APP_CONFIG } from '../../shared/config/constants.js';

export class GetCardDetail {
  constructor(cardRepository) {
    this.cardRepository = cardRepository;
  }

  /*Obtiene el detalle de una carta específica*/
  async execute(cardId) {
    try {
      const card = await this.cardRepository.getCardById(cardId);
      return {
        success: true,
        card
      };
    } catch (error) {
      console.error('Error getting card detail:', error);
      return {
        success: false,
        error: 'No se pudo cargar el detalle de la carta'
      };
    }
  }

  /*Obtiene cartas recomendadas (excluyendo la actual)*/
  async getRecommended(excludeId) {
    try {
      const allCards = await this.cardRepository.getAllCards();
      const filtered = allCards.filter(card => card.id !== excludeId);
      const shuffled = shuffle(filtered);
      const sample = shuffled.slice(0, APP_CONFIG.RECOMMENDED_CARDS);
      
      /*Obtener detalles completos de las recomendadas*/
      const detailedCards = await this.cardRepository.getCardsByIds(sample);
      
      return {
        success: true,
        cards: detailedCards
      };
    } catch (error) {
      console.error('Error getting recommended cards:', error);
      return {
        success: false,
        cards: []
      };
    }
  }
}