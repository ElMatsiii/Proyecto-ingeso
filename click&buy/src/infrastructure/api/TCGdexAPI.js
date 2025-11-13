import { API_CONFIG, APP_CONFIG } from '../../shared/config/constants.js';

export class TCGdexAPI {
  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
    this.maxConcurrency = APP_CONFIG.MAX_CONCURRENCY;
  }

  /*Realiza una petición GET a la API*/
  async get(endpoint) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      throw error;
    }
  }

  /*Obtiene la lista de todas las cartas (versión resumida)*/
  async fetchAllCards() {
    const data = await this.get(API_CONFIG.ENDPOINTS.CARDS);
    return Array.isArray(data) ? data : [];
  }

  /*Obtiene el detalle completo de una carta*/
  async fetchCardDetail(id) {
    return await this.get(API_CONFIG.ENDPOINTS.CARD_DETAIL(id));
  }

  /*Obtiene detalles de múltiples cartas con concurrencia controlada*/
  async fetchMultipleCardDetails(cardBriefs) {
    const results = [];
    let index = 0;

    const worker = async () => {
      while (index < cardBriefs.length) {
        const i = index++;
        const id = cardBriefs[i].id;
        
        try {
          const cardDetail = await this.fetchCardDetail(id);
          results.push(cardDetail);
        } catch (error) {
          console.warn(`Failed to fetch card ${id}:`, error);
        }
      }
    };

    //Ejecutar múltiples workers en paralelo
    const workers = Array.from(
      { length: this.maxConcurrency },
      () => worker()
    );
    
    await Promise.all(workers);
    
    console.log(`Fetched ${results.length} card details`);
    return results;
  }
}