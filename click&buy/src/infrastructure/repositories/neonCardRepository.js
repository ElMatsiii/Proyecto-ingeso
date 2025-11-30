// src/infrastructure/repositories/neonCardRepository.js
import { CardRepository } from '../../core/domain/repositories/cardRepository.js';
import { Card } from '../../core/domain/entities/card.js';

export class NeonCardRepository extends CardRepository {
  constructor() {
    super();
    // URL de tu backend (ajusta según tu configuración)
    this.baseUrl = 'http://localhost:3000/api';
  }

  async getAllCards() {
    try {
      const response = await fetch(`${this.baseUrl}/cards?inStock=true`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.map(card => this.mapToCard(card));
    } catch (error) {
      console.error('Error fetching all cards:', error);
      throw error;
    }
  }

  async getCardById(id) {
    try {
      const response = await fetch(`${this.baseUrl}/cards/${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return this.mapToCard(data);
    } catch (error) {
      console.error(`Error fetching card ${id}:`, error);
      throw error;
    }
  }

  async getCardsByIds(cardIds) {
    try {
      // Obtener todas las cartas y filtrar por IDs
      const allCards = await this.getAllCards();
      return allCards.filter(card => 
        cardIds.some(brief => brief.id === card.id)
      );
    } catch (error) {
      console.error('Error fetching cards by IDs:', error);
      throw error;
    }
  }

  async searchCards(filters) {
    try {
      const params = new URLSearchParams();
      
      if (filters.name) params.append('name', filters.name);
      if (filters.type) params.append('type', filters.type);
      if (filters.set) params.append('set', filters.set);
      if (filters.rarity) params.append('rarity', filters.rarity);
      params.append('inStock', 'true');
      
      const response = await fetch(`${this.baseUrl}/cards?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.map(card => this.mapToCard(card));
    } catch (error) {
      console.error('Error searching cards:', error);
      throw error;
    }
  }

  async checkStock(cardIds) {
    try {
      const response = await fetch(`${this.baseUrl}/cards/check-stock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cardIds })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error checking stock:', error);
      throw error;
    }
  }

  async processTransaction(transactionData) {
    try {
      const response = await fetch(`${this.baseUrl}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(transactionData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error procesando transacción');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error processing transaction:', error);
      throw error;
    }
  }

  // Mapea los datos de la BD a la entidad Card
  mapToCard(data) {
    return new Card({
      id: data.id,
      name: data.name,
      image: data.image_url,
      rarity: data.rarity,
      types: data.types || [],
      set: {
        name: data.set_name,
        id: data.set_id
      },
      hp: data.hp,
      stage: data.stage,
      description: data.description,
      attacks: data.attacks || [],
      price: parseFloat(data.price),
      stock: data.stock
    });
  }
}