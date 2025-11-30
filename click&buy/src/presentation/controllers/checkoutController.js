// src/presentation/controllers/checkoutController.js - ACTUALIZADO
import { ProcessPayment } from '../../core/usecases/processPayment.js';
import { ValidateCard } from '../../core/usecases/validateCard.js';
import { LocalStorageCart } from '../../infrastructure/storage/LocalStorageCart.js';
import { NeonCardRepository } from '../../infrastructure/repositories/neonCardRepository.js';
import { buildImageUrl } from '../../shared/utils/imageBuilder.js';

export class CheckoutController {
  constructor() {
    const cartStorage = new LocalStorageCart();
    const cardRepository = new NeonCardRepository();
    
    this.processPaymentUseCase = new ProcessPayment(cartStorage, cardRepository);
    this.validateCardUseCase = new ValidateCard();
    this.cardRepository = cardRepository;
    
    // Elementos DOM
    this.form = document.getElementById('paymentForm');
    this.orderItemsContainer = document.getElementById('orderItems');
    this.subtotalElement = document.getElementById('subtotal');
    this.taxElement = document.getElementById('tax');
    this.grandTotalElement = document.getElementById('grandTotal');
    this.processingOverlay = document.getElementById('processingOverlay');
    this.successModal = document.getElementById('successModal');
    
    // Inputs
    this.cardNumberInput = document.getElementById('cardNumber');
    this.cardHolderInput = document.getElementById('cardHolder');
    this.expiryMonthSelect = document.getElementById('expiryMonth');
    this.expiryYearSelect = document.getElementById('expiryYear');
    this.cvvInput = document.getElementById('cvv');
    
    // Error messages
    this.cardNumberError = document.getElementById('cardNumberError');
    this.cardHolderError = document.getElementById('cardHolderError');
    this.expiryError = document.getElementById('expiryError');
    this.cvvError = document.getElementById('cvvError');
    
    this.cardTypeIcon = document.getElementById('cardTypeIcon');
  }

  async init() {
    // Verificar si hay items en el carrito
    const summary = this.processPaymentUseCase.getCartSummary();
    
    if (summary.count === 0) {
      alert('Tu carrito está vacío');
      window.location.href = 'carrito.html';
      return;
    }

    // Verificar stock disponible
    await this.verifyStock(summary.items);

    // Renderizar resumen del pedido
    this.renderOrderSummary(summary);
    
    // Poblar años de expiración
    this.populateExpiryYears();
    
    // Configurar event listeners
    this.setupEventListeners();
  }

  async verifyStock(items) {
    try {
      const cardIds = items.map(item => item.id);
      const stockStatus = await this.cardRepository.checkStock(cardIds);
      
      const outOfStock = stockStatus.filter(item => !item.available);
      
      if (outOfStock.length > 0) {
        alert(`⚠️ Los siguientes productos ya no tienen stock:\n${outOfStock.map(i => i.name).join('\n')}\n\nSerás redirigido al carrito.`);
        window.location.href = 'carrito.html';
      }
    } catch (error) {
      console.error('Error verificando stock:', error);
      alert('Error al verificar disponibilidad. Por favor, intenta nuevamente.');
    }
  }

  renderOrderSummary(summary) {
    // Renderizar items
    if (this.orderItemsContainer) {
      this.orderItemsContainer.innerHTML = summary.items.map(item => {
        let imageUrl = item.imagen;
        if (imageUrl && !imageUrl.endsWith('.jpg') && !imageUrl.endsWith('.png')) {
          imageUrl = buildImageUrl(imageUrl);
        }
        
        return `
          <div class="order-item">
            <img src="${imageUrl}" 
                 alt="${item.nombre}"
                 onerror="this.src='../assets/images/no-imagen.png'">
            <div class="order-item-info">
              <h4>${item.nombre}</h4>
              <span class="price">$${parseFloat(item.precio).toFixed(2)}</span>
            </div>
          </div>
        `;
      }).join('');
    }

    // Actualizar totales
    if (this.subtotalElement) {
      this.subtotalElement.textContent = `$${summary.total.toFixed(2)}`;
    }
    if (this.taxElement) {
      this.taxElement.textContent = `$${summary.tax.toFixed(2)}`;
    }
    if (this.grandTotalElement) {
      this.grandTotalElement.textContent = `$${summary.grandTotal.toFixed(2)}`;
    }
  }

  populateExpiryYears() {
    if (!this.expiryYearSelect) return;
    
    const currentYear = new Date().getFullYear();
    const firstOption = this.expiryYearSelect.options[0];
    
    this.expiryYearSelect.innerHTML = '';
    if (firstOption) {
      this.expiryYearSelect.appendChild(firstOption);
    }
    
    for (let i = 0; i < 15; i++) {
      const year = currentYear + i;
      const option = document.createElement('option');
      option.value = year;
      option.textContent = year;
      this.expiryYearSelect.appendChild(option);
    }
  }

  setupEventListeners() {
    this.cardNumberInput?.addEventListener('input', (e) => {
      this.formatCardNumber(e);
      this.updateCardTypeIcon();
      this.validateField('cardNumber');
    });

    this.cardHolderInput?.addEventListener('blur', () => {
      this.validateField('cardHolder');
    });

    this.expiryMonthSelect?.addEventListener('change', () => {
      this.validateField('expiry');
    });
    
    this.expiryYearSelect?.addEventListener('change', () => {
      this.validateField('expiry');
    });

    this.cvvInput?.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/\D/g, '');
      this.validateField('cvv');
    });

    this.form?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });
  }

  formatCardNumber(e) {
    let value = e.target.value.replace(/\s/g, '');
    value = value.replace(/\D/g, '');
    
    const formatted = this.validateCardUseCase.formatCardNumber(value);
    e.target.value = formatted;
  }

  updateCardTypeIcon() {
    if (!this.cardTypeIcon) return;
    
    const cardType = this.validateCardUseCase.getCardType(this.cardNumberInput.value);
    
    const icons = {
      'Visa': '💳',
      'Mastercard': '💳',
      'American Express': '💳',
      'Discover': '💳'
    };
    
    this.cardTypeIcon.textContent = icons[cardType] || '';
  }

  validateField(fieldName) {
    const cardData = this.getCardData();
    let validation;
    let errorElement;
    let inputElement;

    switch (fieldName) {
      case 'cardNumber':
        validation = this.validateCardUseCase.validateCardNumber(cardData.cardNumber);
        errorElement = this.cardNumberError;
        inputElement = this.cardNumberInput;
        break;
      
      case 'cardHolder':
        validation = this.validateCardUseCase.validateCardHolder(cardData.cardHolder);
        errorElement = this.cardHolderError;
        inputElement = this.cardHolderInput;
        break;
      
      case 'expiry':
        validation = this.validateCardUseCase.validateExpiry(
          cardData.expiryMonth,
          cardData.expiryYear
        );
        errorElement = this.expiryError;
        inputElement = this.expiryMonthSelect;
        break;
      
      case 'cvv':
        validation = this.validateCardUseCase.validateCVV(
          cardData.cvv,
          cardData.cardNumber
        );
        errorElement = this.cvvError;
        inputElement = this.cvvInput;
        break;
    }

    if (errorElement) {
      errorElement.textContent = validation.valid ? '' : validation.error;
    }

    if (inputElement) {
      inputElement.classList.remove('error', 'success');
      if (inputElement.value) {
        inputElement.classList.add(validation.valid ? 'success' : 'error');
      }
    }

    return validation.valid;
  }

  validateAllFields() {
    const validations = [
      this.validateField('cardNumber'),
      this.validateField('cardHolder'),
      this.validateField('expiry'),
      this.validateField('cvv')
    ];

    return validations.every(v => v === true);
  }

  getCardData() {
    return {
      cardNumber: this.cardNumberInput?.value || '',
      cardHolder: this.cardHolderInput?.value || '',
      expiryMonth: this.expiryMonthSelect?.value || '',
      expiryYear: this.expiryYearSelect?.value || '',
      cvv: this.cvvInput?.value || ''
    };
  }

  async handleSubmit() {
    if (!this.validateAllFields()) {
      alert('Por favor, corrige los errores en el formulario');
      return;
    }

    this.showProcessing(true);

    const cardData = this.getCardData();
    const result = await this.processPaymentUseCase.execute(cardData);

    this.showProcessing(false);

    if (result.success) {
      this.showSuccessModal(result.transactionId);
    } else {
      const errorMessage = result.errors.join('\n');
      alert(`Error en el pago:\n${errorMessage}`);
    }
  }

  showProcessing(show) {
    if (this.processingOverlay) {
      this.processingOverlay.style.display = show ? 'flex' : 'none';
    }
  }

  showSuccessModal(transactionId) {
    if (this.successModal) {
      const transactionIdElement = document.getElementById('transactionId');
      if (transactionIdElement) {
        transactionIdElement.textContent = transactionId;
      }
      this.successModal.style.display = 'flex';
    }
  }
}