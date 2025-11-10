// src/presentation/controllers/DetalleController.js

import { CardRepositoryImpl } from '../../infrastructure/repositories/cardRepositoryImpl.js';
import { GetCardDetail } from '../../core/usecases/getCardDetail.js';
import { ManageCart } from '../../core/usecases/manageCart.js';
import { LocalStorageCart } from '../../infrastructure/storage/LocalStorageCart.js';
import { CardComponent } from '../components/cardComponent.js';
import { LoadingComponent } from '../components/loadingComponent.js';
import { STORAGE_KEYS, ROUTES } from '../../shared/config/constants.js';
import { buildImageUrl } from '../../shared/utils/imageBuilder.js';

export class DetalleController {
  constructor() {
    this.cardRepository = new CardRepositoryImpl();
    this.getCardDetailUseCase = new GetCardDetail(this.cardRepository);
    this.manageCartUseCase = new ManageCart(new LocalStorageCart());
    
    this.container = document.getElementById('detalleContainer');
    this.loading = new LoadingComponent('loading');
    
    this.cardId = localStorage.getItem(STORAGE_KEYS.SELECTED_CARD);
  }

  async init() {
    if (!this.cardId) {
      this.showNoCardSelected();
      return;
    }

    try {
      this.loading.show();
      
      const result = await this.getCardDetailUseCase.execute(this.cardId);
      
      if (result.success) {
        this.renderCardDetail(result.card);
        await this.loadRecommendedCards();
      } else {
        this.showError();
      }
    } catch (error) {
      console.error('Error loading card detail:', error);
      this.showError();
    } finally {
      this.loading.hide();
    }
  }

  renderCardDetail(card) {
    if (!this.container) return;
    
    const imgUrl = buildImageUrl(card.image);
    
    this.container.innerHTML = `
      <div class="detalle-card">
        <div class="detalle-img">
          <img src="${imgUrl}" alt="${card.name}"
               onerror="this.src='../assets/no-imagen.png'">
        </div>
        <div class="detalle-info">
          <h1>${card.name}</h1>
          <p><strong>Rareza:</strong> ${card.rarity}</p>
          <p><strong>Tipo:</strong> ${card.getTypesString()}</p>
          <p><strong>Set:</strong> ${card.getSetName()}</p>
          <p><strong>HP:</strong> ${card.hp || '—'}</p>
          <p><strong>Etapa:</strong> ${card.stage || '—'}</p>
          <p><strong>Descripción:</strong> ${card.description || 'Sin descripción disponible.'}</p>
          ${this.renderAttacks(card)}
          <div class="detalle-buttons">
            <button class="btn add-cart">Agregar al carrito</button>
            <button class="btn back-btn">⬅ Volver</button>
          </div>
        </div>
      </div>

      <section class="section-related">
        <h2>Otras cartas que podrían interesarte</h2>
        <div id="relatedGrid" class="grid"></div>
      </section>
    `;

    // Event listeners
    this.container.querySelector('.add-cart')?.addEventListener('click', () => {
      this.addToCart(card);
    });

    this.container.querySelector('.back-btn')?.addEventListener('click', () => {
      window.history.back();
    });
  }

  renderAttacks(card) {
    if (!card.hasAttacks()) return '';
    
    return `
      <div class="detalle-attacks">
        <h3>Ataques</h3>
        <ul>
          ${card.attacks.map(attack => `
            <li>
              <strong>${attack.name}</strong> — ${attack.damage || ''}<br>
              <em>${attack.effect || ''}</em>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  }

  async loadRecommendedCards() {
    try {
      const result = await this.getCardDetailUseCase.getRecommended(this.cardId);
      
      if (result.success) {
        this.renderRecommendedCards(result.cards);
      }
    } catch (error) {
      console.warn('No se pudieron cargar cartas recomendadas:', error);
    }
  }

  renderRecommendedCards(cards) {
    const relatedGrid = document.getElementById('relatedGrid');
    if (!relatedGrid) return;

    relatedGrid.innerHTML = '';
    
    cards.forEach(card => {
      const cardElement = CardComponent.render(card, {
        showAddToCart: false,
        showViewDetail: true,
        onViewDetail: (card) => this.goToDetail(card)
      });
      
      relatedGrid.appendChild(cardElement);
    });
  }

  addToCart(card) {
    const result = this.manageCartUseCase.addCard(card);
    if (result.success) {
      alert(result.message);
    }
  }

  goToDetail(card) {
    localStorage.setItem(STORAGE_KEYS.SELECTED_CARD, card.id);
    window.location.reload();
  }

  showNoCardSelected() {
    if (this.container) {
      this.container.innerHTML = 
        '<p style="text-align:center; color:white;">No se ha seleccionado ninguna carta.</p>';
    }
  }

  showError() {
    if (this.container) {
      this.container.innerHTML = 
        '<p style="color:red; text-align:center;">Error al cargar el detalle.</p>';
    }
  }
}