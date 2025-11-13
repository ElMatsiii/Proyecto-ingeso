import { CarritoController } from './presentation/controllers/carritoController.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log('Inicializando Click & Buy - Carrito');
  
  const controller = new CarritoController();
  controller.init();
});