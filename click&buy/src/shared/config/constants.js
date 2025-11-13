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
  NEW_CARDS: 10,
  RECOMMENDED_CARDS: 10
};

export const STORAGE_KEYS = {
  CART: 'carrito',
  THEME: 'theme',
  SELECTED_CARD: 'selectedCardId',
  CATALOG_CACHE: 'catalogCache',
  CATALOG_CACHE_TIME: 'catalogCacheTime',
  HOME_CACHE: 'homeCache',
  HOME_CACHE_TIME: 'homeCacheTime'
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

export const HIGH_RARITIES = [
  'Ultra Rare',
  'Secret Rare',
  'Hyper Rare',
  'Rainbow Rare',
  'Gold Rare',
  'Amazing Rare',
  'Shiny Rare',
  'Rare Holo',
  'Rare Holo EX',
  'Rare Holo GX',
  'Rare Holo V',
  'Rare Holo VMAX',
  'Rare Holo VSTAR',
  'Rare Ultra',
  'Rare Secret',
  'Rare Rainbow',
  'Double Rare',
  'Illustration Rare',
  'Special Illustration Rare',
  'Shiny Ultra Rare',
  'ACE SPEC Rare',

  'Ultra Rara',
  'Secreta Rara',
  'Hiper Rara',
  'Arcoíris Rara',
  'Dorada Rara',
  'Increíble Rara',
  'Brillante Rara',
  'Rara Holo',
  'Rara Holo EX',
  'Rara Holo GX',
  'Rara Holo V',
  'Rara Holo VMAX',
  'Rara Holo VSTAR',
  'Doble Rara',
  'Ilustración Rara',

  'Holo',
  'EX',
  'GX',
  'V ',
  'VMAX',
  'VSTAR',
  'Prime',
  'Legend',
  'BREAK'
];