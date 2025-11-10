// src/presentation/components/CardComponent.js

import { buildImageUrl } from '../../shared/utils/imageBuilder.js';

export class CardComponent {
  /**
   * Renderiza una carta estándar
   */
  static render(card, options = {}) {
    const {
      showAddToCart = true,
      showViewDetail = true,
      onAddToCart = null,
      onViewDetail = null
    } = options;

    const div = document.createElement('div');
    div.className = 'card';
    
    const imgUrl = buildImageUrl(card.image);
    
    div.innerHTML = `
      <img src="${imgUrl}" alt="${card.name}"
           onerror="this.src='../assets/no-imagen.png'">
      <div class="card-body">
        <h3>${card.name}</h3>
        <p>${card.rarity} • ${card.getTypesString()}</p>
        <p class="price"><strong>Set:</strong> ${card.getSetName()}</p>
        <div class="card-actions">
          ${showViewDetail ? '<button class="btn view-card">Ver Detalle</button>' : ''}
          ${showAddToCart ? '<button class="btn add-cart">Agregar</button>' : ''}
        </div>
      </div>
    `;

    // Event listeners
    if (showAddToCart && onAddToCart) {
      div.querySelector('.add-cart')?.addEventListener('click', () => onAddToCart(card));
    }

    if (showViewDetail && onViewDetail) {
      div.querySelector('.view-card')?.addEventListener('click', () => onViewDetail(card));
    }

    return div;
  }

  /**
   * Renderiza una carta mini (para destacados)
   */
  static renderMini(card, onViewDetail) {
    const div = document.createElement('div');
    div.className = 'featured-mini';
    
    const imgUrl = buildImageUrl(card.image);
    
    div.innerHTML = `
      <img src="${imgUrl}" alt="${card.name}"
           onerror="this.src='../assets/no-imagen.png'">
      <p>${card.name}</p>
      <button class="btn-mini view-card">Ver</button>
    `;

    if (onViewDetail) {
      div.querySelector('.view-card')?.addEventListener('click', () => onViewDetail(card));
    }

    return div;
  }

  /**
   * Renderiza una carta grande (destacada principal)
   */
  static renderFeatured(card, onViewDetail) {
    const div = document.createElement('div');
    div.className = 'featured-main';
    
    const imgUrl = buildImageUrl(card.image);
    
    div.innerHTML = `
      <img src="${imgUrl}" alt="${card.name}"
           onerror="this.src='../assets/no-imagen.png'">
      <div class="card-body">
        <h3>${card.name}</h3>
        <p><strong>Set:</strong> ${card.getSetName()}</p>
        <button class="btn view-card">Ver Detalle</button>
      </div>
    `;

    if (onViewDetail) {
      div.querySelector('.view-card')?.addEventListener('click', () => onViewDetail(card));
    }

    return div;
  }
}