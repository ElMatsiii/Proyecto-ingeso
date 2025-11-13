import { CardRepositoryImpl } from '../../infrastructure/repositories/cardRepositoryImpl.js';
import { GetCards } from '../../core/usecases/getCards.js';
import { Card } from '../../core/domain/entities/card.js';
import { STORAGE_KEYS } from '../config/constants.js';

class CacheService {
  constructor() {
    this.cardRepository = new CardRepositoryImpl();
    this.getCardsUseCase = new GetCards(this.cardRepository);
    this.cacheKey = STORAGE_KEYS.CATALOG_CACHE;
    this.cacheTimeKey = STORAGE_KEYS.CATALOG_CACHE_TIME;
    this.cacheExpiration = 30 * 60 * 1000; 
  }

  /*Verifica si el cache es válido*/
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

  /*Obtiene las cartas del cache*/
  getFromCache() {
    try {
      if (!this.isCacheValid()) {
        return null;
      }
      
      const data = localStorage.getItem(this.cacheKey);
      if (!data) return null;
      
      const parsed = JSON.parse(data);
      
      const cards = parsed.map(cardData => Card.fromApiResponse(cardData));
      
      console.log(`Cartas cargadas desde cache: ${cards.length}`);
      return cards;
    } catch (error) {
      console.error('Error reading from cache:', error);
      return null;
    }
  }

  /*Guarda las cartas en el cache*/
  saveToCache(cards) {
    try {
      localStorage.setItem(this.cacheKey, JSON.stringify(cards));
      localStorage.setItem(this.cacheTimeKey, Date.now().toString());
      console.log(`${cards.length} cartas guardadas en cache`);
      return true;
    } catch (error) {
      console.error('Error saving to cache:', error);
      return false;
    }
  }

  /*Pre-carga las cartas del catálogo en segundo plano*/
  async preloadCatalog() {
    try {
      if (this.isCacheValid()) {
        console.log('Cache válido, no es necesario pre-cargar');
        return;
      }

      console.log('Iniciando pre-carga del catálogo en segundo plano...');
      
      // Obtener cartas básicas
      const cardBriefs = await this.getCardsUseCase.execute(500);
      
      // Obtener detalles completos
      const cardsDetailed = await this.getCardsUseCase.executeWithDetails(cardBriefs);
      
      // Guardar en cache
      this.saveToCache(cardsDetailed);
      
      console.log('Pre-carga del catálogo completada');
    } catch (error) {
      console.error('Error en pre-carga del catálogo:', error);
    }
  }

  /*Obtiene las cartas (desde cache o API)*/
  async getCatalogCards() {
    const cached = this.getFromCache();
    if (cached) {
      return cached;
    }

    console.log('Cargando cartas desde API...');
    const cardBriefs = await this.getCardsUseCase.execute(500);
    const cardsDetailed = await this.getCardsUseCase.executeWithDetails(cardBriefs);

    this.saveToCache(cardsDetailed);
    
    return cardsDetailed;
  }

  /*Obtiene las cartas de inicio del cache*/
  getHomeFromCache() {
    try {
      const cacheTimeKey = STORAGE_KEYS.HOME_CACHE_TIME;
      const cacheTime = localStorage.getItem(cacheTimeKey);
      
      if (!cacheTime) return null;
      
      const timeDiff = Date.now() - parseInt(cacheTime);
      if (timeDiff >= this.cacheExpiration) {
        return null;
      }
      
      const data = localStorage.getItem(STORAGE_KEYS.HOME_CACHE);
      if (!data) return null;
      
      const parsed = JSON.parse(data);
      
      const newCards = parsed.newCards.map(cardData => Card.fromApiResponse(cardData));
      const featuredCards = parsed.featuredCards.map(cardData => Card.fromApiResponse(cardData));
      
      console.log(`Cartas de inicio cargadas desde cache`);
      return { newCards, featuredCards };
    } catch (error) {
      console.error('Error reading home cache:', error);
      return null;
    }
  }

  /*Guarda las cartas de inicio en el cache*/
  saveHomeToCache(newCards, featuredCards) {
    try {
      const data = { newCards, featuredCards };
      localStorage.setItem(STORAGE_KEYS.HOME_CACHE, JSON.stringify(data));
      localStorage.setItem(STORAGE_KEYS.HOME_CACHE_TIME, Date.now().toString());
      console.log(`Cartas de inicio guardadas en cache`);
      return true;
    } catch (error) {
      console.error('Error saving home cache:', error);
      return false;
    }
  }

  /*Limpia todo el cache*/
  clearCache() {
    try {
      localStorage.removeItem(this.cacheKey);
      localStorage.removeItem(this.cacheTimeKey);
      localStorage.removeItem(STORAGE_KEYS.HOME_CACHE);
      localStorage.removeItem(STORAGE_KEYS.HOME_CACHE_TIME);
      console.log('Cache limpiado');
      return true;
    } catch (error) {
      console.error('Error clearing cache:', error);
      return false;
    }
  }
}

//Exportar una instancia singleton
export const cacheService = new CacheService();