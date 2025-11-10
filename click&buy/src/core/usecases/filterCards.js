// src/core/usecases/FilterCards.js

import { APP_CONFIG } from '../../shared/config/constants.js';

export class FilterCards {
  constructor(cardRepository) {
    this.cardRepository = cardRepository;
  }

  /**
   * Aplica filtros a las cartas
   */
  async execute(filters) {
    try {
      const cards = await this.cardRepository.searchCards(filters);
      return {
        success: true,
        cards,
        total: cards.length
      };
    } catch (error) {
      console.error('Error filtering cards:', error);
      return {
        success: false,
        cards: [],
        total: 0,
        error: 'No se pudieron filtrar las cartas'
      };
    }
  }

  /**
   * Pagina los resultados
   */
  paginate(cards, page = 1) {
    const pageSize = APP_CONFIG.PAGE_SIZE;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    
    return {
      cards: cards.slice(start, end),
      currentPage: page,
      totalPages: Math.ceil(cards.length / pageSize),
      totalCards: cards.length,
      pageSize
    };
  }

  /**
   * Obtiene los tipos únicos de un conjunto de cartas
   */
  getUniqueTypes(cards) {
    const types = new Set();
    cards.forEach(card => {
      if (card.types) {
        card.types.forEach(type => types.add(type));
      }
    });
    return Array.from(types).sort();
  }
}