// src/shared/services/cacheService.js

import { CardRepositoryImpl } from '../../infrastructure/repositories/cardRepositoryImpl.js';
import { GetCards } from '../../core/usecases/getCards.js';
import { STORAGE_KEYS } from '../config/constants.js';

class CacheService {
  constructor() {
    this.cardRepository = new CardRepositoryImpl();
    this.getCardsUseCase = new GetCards(this.cardRepository);
    this.cacheKey = STORAGE_KEYS.CATALOG_CACHE;
    this.cacheTimeKey = STORAGE_KEYS.CATALOG_CACHE_TIME;
    this.cacheExpiration = 30 * 60 * 1000; // 30 minutos
  }

  /**
   * Verifica si el cache es válido
   */
  isCacheValid() {
    try {
      const cacheTime = localStorage.getItem(this.cacheTimeKey);
      if (!cacheTime) return false;
      
      const timeDiff = Date.now() - parseInt(cacheTime);
      return timeDiff < this.cacheExpiration;
    } catch (error) {
      console.error('Error checking cache validity:', error);
      return false;
    }
  }

  /**
   * Obtiene las cartas del cache
   */
  getFromCache() {
    try {
      if (!this.isCacheValid()) {
        return null;
      }
      
      const data = localStorage.getItem(this.cacheKey);
      if (!data) return null;
      
      const parsed = JSON.parse(data);
      console.log(`✅ Cartas cargadas desde cache: ${parsed.length}`);
      return parsed;
    } catch (error) {
      console.error('Error reading from cache:', error);
      return null;
    }
  }

  /**
   * Guarda las cartas en el cache
   */
  saveToCache(cards) {
    try {
      localStorage.setItem(this.cacheKey, JSON.stringify(cards));
      localStorage.setItem(this.cacheTimeKey, Date.now().toString());
      console.log(`💾 ${cards.length} cartas guardadas en cache`);
      return true;
    } catch (error) {
      console.error('Error saving to cache:', error);
      return false;
    }
  }

  /**
   * Pre-carga las cartas del catálogo en segundo plano
   */
  async preloadCatalog() {
    try {
      // Si ya hay cache válido, no hacer nada
      if (this.isCacheValid()) {
        console.log('⚡ Cache válido, no es necesario pre-cargar');
        return;
      }

      console.log('🔄 Iniciando pre-carga del catálogo en segundo plano...');
      
      // Obtener cartas básicas
      const cardBriefs = await this.getCardsUseCase.execute(500);
      
      // Obtener detalles completos
      const cardsDetailed = await this.getCardsUseCase.executeWithDetails(cardBriefs);
      
      // Guardar en cache
      this.saveToCache(cardsDetailed);
      
      console.log('✅ Pre-carga del catálogo completada');
    } catch (error) {
      console.error('❌ Error en pre-carga del catálogo:', error);
    }
  }

  /**
   * Obtiene las cartas (desde cache o API)
   */
  async getCatalogCards() {
    // Intentar desde cache primero
    const cached = this.getFromCache();
    if (cached) {
      return cached;
    }

    // Si no hay cache, cargar desde API
    console.log('📡 Cargando cartas desde API...');
    const cardBriefs = await this.getCardsUseCase.execute(500);
    const cardsDetailed = await this.getCardsUseCase.executeWithDetails(cardBriefs);
    
    // Guardar en cache para la próxima vez
    this.saveToCache(cardsDetailed);
    
    return cardsDetailed;
  }

  /**
   * Limpia el cache
   */
  clearCache() {
    try {
      localStorage.removeItem(this.cacheKey);
      localStorage.removeItem(this.cacheTimeKey);
      console.log('🗑️ Cache limpiado');
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }
}

// Exportar una instancia singleton
export const cacheService = new CacheService();