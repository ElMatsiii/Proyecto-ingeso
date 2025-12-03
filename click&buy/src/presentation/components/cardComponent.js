// src/presentation/components/cardComponent.js - CORREGIDO
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
    
    // ✅ CORREGIDO: Usar imagen directamente sin manipular
    const imgUrl = card.image || '../assets/images/no-imagen.png';
    
    // ✅ VALIDACIÓN DE STOCK
    const hasStock = card.stock && card.stock > 0;
    const stockMessage = hasStock 
      ? `Stock: ${card.stock}` 
      : 'Sin stock';
    
    div.innerHTML = `
      <img src="${imgUrl}" alt="${card.name}"
           onerror="this.src='../assets/images/no-imagen.png'">
      <div class="card-body">
        <h3>${card.name}</h3>
        <p>${card.rarity} • ${card.getTypesString()}</p>
        <p><strong>Set:</strong> ${card.getSetName()}</p>
        <p><strong>Precio:</strong> $${parseFloat(card.price).toFixed(2)}</p>
        <p style="font-weight: 600;">${stockMessage}</p>
        <div class="card-actions">
          ${showViewDetail ? '<button class="btn view-card">Ver Detalle</button>' : ''}
          ${showAddToCart && hasStock ? '<button class="btn add-cart">Agregar</button>' : ''}
          ${showAddToCart && !hasStock ? '<button class="btn" disabled style="opacity: 0.5; cursor: not-allowed;">Sin Stock</button>' : ''}
        </div>
      </div>
    `;

    // Solo agregar event listener si HAY stock
    if (showAddToCart && hasStock && onAddToCart) {
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
    
    // ✅ Usar imagen directamente
    const imgUrl = card.image || '../assets/images/no-imagen.png';
    
    div.innerHTML = `
      <img src="${imgUrl}" alt="${card.name}"
           onerror="this.src='../assets/images/no-imagen.png'">
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
    
    // ✅ Usar imagen directamente
    const imgUrl = card.image || '../assets/images/no-imagen.png';
    
    div.innerHTML = `
      <img src="${imgUrl}" alt="${card.name}"
           onerror="this.src='../assets/images/no-imagen.png'">
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