// src/presentation/controllers/carritoController.js

import { ManageCart } from '../../core/usecases/manageCart.js';
import { LocalStorageCart } from '../../infrastructure/storage/LocalStorageCart.js';
import { buildImageUrl } from '../../shared/utils/imageBuilder.js';

export class CarritoController {
  constructor() {
    this.manageCartUseCase = new ManageCart(new LocalStorageCart());
    
    this.container = document.getElementById('cartItems');
    this.totalElement = document.getElementById('totalPrice');
    this.checkoutBtn = document.getElementById('checkoutBtn');
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
      this.container.innerHTML = `
        <div style="text-align: center; padding: 3rem; color: var(--muted);">
          <p style="font-size: 3rem; margin-bottom: 1rem;">🛒</p>
          <p style="font-size: 1.2rem; margin-bottom: 0.5rem;">Tu carrito está vacío</p>
          <p>Agrega algunas cartas para comenzar</p>
          <button class="btn" style="margin-top: 1.5rem;" onclick="window.location.href='catalogo.html'">
            Ver Catálogo
          </button>
        </div>
      `;
      this.totalElement.textContent = '$0.00';
      
      // Deshabilitar botón de checkout
      if (this.checkoutBtn) {
        this.checkoutBtn.disabled = true;
        this.checkoutBtn.style.opacity = '0.5';
        this.checkoutBtn.style.cursor = 'not-allowed';
      }
      return;
    }

    // Habilitar botón de checkout
    if (this.checkoutBtn) {
      this.checkoutBtn.disabled = false;
      this.checkoutBtn.style.opacity = '1';
      this.checkoutBtn.style.cursor = 'pointer';
    }

    // Renderizar items
    this.container.innerHTML = items.map((item, index) => {
      let imageUrl = item.imagen;
      
      if (imageUrl && !imageUrl.endsWith('.jpg') && !imageUrl.endsWith('.png')) {
        imageUrl = buildImageUrl(imageUrl);
      }
      
      return `
        <div class="cart-item">
          <img src="${imageUrl}" 
               alt="${item.nombre}"
               onerror="this.onerror=null; this.src='../assets/images/no-imagen.png'">
          <div style="flex: 1;">
            <h3>${item.nombre}</h3>
            <p class="price">$${parseFloat(item.precio).toFixed(2)}</p>
          </div>
          <button class="btn" data-index="${index}">
            Eliminar
          </button>
        </div>
      `;
    }).join('');

    const total = this.manageCartUseCase.getTotal();
    this.totalElement.textContent = `$${total.toFixed(2)}`;
    
    // Agregar event listeners a los botones de eliminar
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