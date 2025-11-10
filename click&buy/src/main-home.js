// src/main-home.js

import { HomeController } from './presentation/controllers/homeController.js';

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  console.log('✅ Inicializando Click & Buy - Home');
  
  const controller = new HomeController();
  controller.init();
});