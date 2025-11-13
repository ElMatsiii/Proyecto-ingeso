import { CardRepository } from '../../core/domain/repositories/cardRepository.js';
import { Card } from '../../core/domain/entities/card.js';
import { TCGdexAPI } from '../api/TCGdexAPI.js';

export class CardRepositoryImpl extends CardRepository {
  constructor() {
    super();
    this.api = new TCGdexAPI();
  }

  async getAllCards() {
    const data = await this.api.fetchAllCards();
    return data.map(card => Card.fromApiResponse(card));
  }

  async getCardById(id) {
    const data = await this.api.fetchCardDetail(id);
    return Card.fromApiResponse(data);
  }

  async getCardsByIds(cardBriefs) {
    const data = await this.api.fetchMultipleCardDetails(cardBriefs);
    return data.map(card => Card.fromApiResponse(card));
  }

  async searchCards(filters) {
    const allCards = await this.getAllCards();
    
    return allCards.filter(card => {
      const matchName = !filters.name || 
        card.name.toLowerCase().includes(filters.name.toLowerCase());
      
      const matchType = !filters.type || 
        (card.types && card.types.some(t => 
          t.toLowerCase() === filters.type.toLowerCase()
        ));
      
      const matchSet = !filters.set || 
        (card.set?.name && 
          card.set.name.toLowerCase().includes(filters.set.toLowerCase())
        );
      
      return matchName && matchType && matchSet;
    });
  }
}