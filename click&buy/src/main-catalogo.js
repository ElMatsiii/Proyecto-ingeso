import { CatalogoController } from './presentation/controllers/catalogoController.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log('Inicializando Click & Buy - Catálogo');
  
  const controller = new CatalogoController();
  controller.init();
});