import { CheckoutController } from './presentation/controllers/checkoutController.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log('Inicializando Click & Buy - Checkout');
  
  const controller = new CheckoutController();
  controller.init();
});