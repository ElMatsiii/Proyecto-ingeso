// src/main-detalle.js

import { DetalleController } from './presentation/controllers/detalleController.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log('✅ Inicializando Click & Buy - Detalle');
  
  const controller = new DetalleController();
  controller.init();
});