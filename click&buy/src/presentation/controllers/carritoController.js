// src/presentation/controllers/CarritoController.js

import { ManageCart } from '../../core/usecases/manageCart.js';
import { LocalStorageCart } from '../../infrastructure/storage/LocalStorageCart.js';
import { buildImageUrl } from '../../shared/utils/imageBuilder.js';

export class CarritoController {
  constructor() {
    this.manageCartUseCase = new ManageCart(new LocalStorageCart());
    
    this.container = document.getElementById('cartItems');
    this.totalElement = document.getElementById('totalPrice');
  }

  init() {
    this.renderCart();
  }

  renderCart() {
    if (!this.container || !this.totalElement) {
      console.error('Elementos del carrito no encontrados');
      return;
    }

    const items = this.manageCartUseCase.getItems();
    
    if (items.length === 0) {
      this.container.innerHTML = '<p>Tu carrito está vacío.</p>';
      this.totalElement.textContent = '$0.00';
      return;
    }

    // Renderizar items
    this.container.innerHTML = items.map((item, index) => {
      // 🔥 Procesar la URL de imagen correctamente
      let imageUrl = item.imagen;
      
      // Si la imagen no tiene extensión, construirla correctamente
      if (imageUrl && !imageUrl.endsWith('.jpg') && !imageUrl.endsWith('.png')) {
        imageUrl = buildImageUrl(imageUrl);
      }
      
      return `
        <div class="cart-item">
          <img src="${imageUrl}" 
               alt="${item.nombre}"
               onerror="this.onerror=null; this.src='../assets/images/no-imagen.png'">
          <div>
            <h3>${item.nombre}</h3>
            <p>Precio: $${item.precio}</p>
            <button class="btn remove" data-index="${index}">Borrar</button>
          </div>
        </div>
      `;
    }).join('');

    // Actualizar total
    const total = this.manageCartUseCase.getTotal();
    this.totalElement.textContent = `$${total.toFixed(2)}`;

    // Event listeners para botones de eliminar
    this.container.querySelectorAll('.remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.getAttribute('data-index'));
        this.removeItem(index);
      });
    });
  }

  removeItem(index) {
    const result = this.manageCartUseCase.removeItem(index);
    if (result.success) {
      this.renderCart();
    } else {
      alert(result.message);
    }
  }
}