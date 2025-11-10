// src/shared/config/constants.js

export const API_CONFIG = {
  BASE_URL: 'https://api.tcgdex.net/v2/es',
  ENDPOINTS: {
    CARDS: '/cards',
    CARD_DETAIL: (id) => `/cards/${id}`
  }
};

export const APP_CONFIG = {
  POOL_SIZE: 500,
  PAGE_SIZE: 40,
  MAX_CONCURRENCY: 8,
  FEATURED_CARDS: 7,
  NEW_CARDS: 7,
  RECOMMENDED_CARDS: 8
};

export const STORAGE_KEYS = {
  CART: 'carrito',
  THEME: 'theme',
  SELECTED_CARD: 'selectedCardId'
};

export const ROUTES = {
  HOME: 'index.html',
  CATALOG: 'catalogo.html',
  DETAIL: 'detalle.html',
  CART: 'carrito.html',
  ABOUT: 'about.html'
};

export const TYPE_TRANSLATIONS = {
  Fire: 'Fuego',
  Water: 'Agua',
  Grass: 'Planta',
  Electric: 'Eléctrico',
  Psychic: 'Psíquico',
  Darkness: 'Siniestro',
  Fighting: 'Lucha',
  Colorless: 'Normal',
  Metal: 'Metal',
  Dragon: 'Dragón',
  Fairy: 'Hada'
};

export const TYPE_TRANSLATIONS_REVERSE = {
  fuego: 'Fire',
  agua: 'Water',
  planta: 'Grass',
  eléctrico: 'Electric',
  electrico: 'Electric',
  psíquico: 'Psychic',
  psiquico: 'Psychic',
  siniestro: 'Darkness',
  lucha: 'Fighting',
  normal: 'Colorless',
  metal: 'Metal',
  dragón: 'Dragon',
  dragon: 'Dragon',
  hada: 'Fairy'
};