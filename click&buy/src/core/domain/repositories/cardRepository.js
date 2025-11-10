// src/core/domain/repositories/CardRepository.js

/**
 * Interfaz del repositorio de cartas
 * Define el contrato que debe cumplir cualquier implementación
 */
export class CardRepository {
  /**
   * Obtiene todas las cartas disponibles
   * @returns {Promise<Array>}
   */
  async getAllCards() {
    throw new Error('Method not implemented');
  }

  /**
   * Obtiene el detalle de una carta específica
   * @param {string} id - ID de la carta
   * @returns {Promise<Card>}
   */
  async getCardById(id) {
    throw new Error('Method not implemented');
  }

  /**
   * Obtiene múltiples cartas detalladas
   * @param {Array} ids - Array de IDs
   * @returns {Promise<Array<Card>>}
   */
  async getCardsByIds(ids) {
    throw new Error('Method not implemented');
  }

  /**
   * Busca cartas que coincidan con los criterios
   * @param {Object} filters - Filtros de búsqueda
   * @returns {Promise<Array<Card>>}
   */
  async searchCards(filters) {
    throw new Error('Method not implemented');
  }
}