import { HomeController } from './presentation/controllers/homeController.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log('Inicializando Click & Buy - Home');
  
  const controller = new HomeController();
  controller.init();
});