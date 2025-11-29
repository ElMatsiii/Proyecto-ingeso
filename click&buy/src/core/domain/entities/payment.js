// src/core/domain/entities/payment.js

export class CreditCard {
  constructor({
    cardNumber,
    cardHolder,
    expiryMonth,
    expiryYear,
    cvv
  }) {
    this.cardNumber = cardNumber;
    this.cardHolder = cardHolder;
    this.expiryMonth = expiryMonth;
    this.expiryYear = expiryYear;
    this.cvv = cvv;
  }

  /**
   * Obtiene el tipo de tarjeta basado en el número
   */
  getCardType() {
    const number = this.cardNumber.replace(/\s/g, '');
    
    if (/^4/.test(number)) return 'Visa';
    if (/^5[1-5]/.test(number)) return 'Mastercard';
    if (/^3[47]/.test(number)) return 'American Express';
    if (/^6(?:011|5)/.test(number)) return 'Discover';
    
    return 'Unknown';
  }

  /**
   * Obtiene los últimos 4 dígitos de la tarjeta
   */
  getLastFourDigits() {
    const number = this.cardNumber.replace(/\s/g, '');
    return number.slice(-4);
  }

  /**
   * Formatea el número de tarjeta para mostrar (ocultando dígitos)
   */
  getMaskedNumber() {
    const number = this.cardNumber.replace(/\s/g, '');
    return `**** **** **** ${this.getLastFourDigits()}`;
  }

  /**
   * Verifica si la tarjeta ha expirado
   */
  isExpired() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    const expYear = parseInt(this.expiryYear);
    const expMonth = parseInt(this.expiryMonth);
    
    if (expYear < currentYear) return true;
    if (expYear === currentYear && expMonth < currentMonth) return true;
    
    return false;
  }
}

export class Payment {
  constructor({
    amount,
    currency = 'USD',
    creditCard,
    billingAddress = null
  }) {
    this.id = this.generatePaymentId();
    this.amount = amount;
    this.currency = currency;
    this.creditCard = creditCard;
    this.billingAddress = billingAddress;
    this.status = 'pending';
    this.createdAt = new Date();
  }

  generatePaymentId() {
    return `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  markAsCompleted() {
    this.status = 'completed';
    this.completedAt = new Date();
  }

  markAsFailed(reason) {
    this.status = 'failed';
    this.failureReason = reason;
  }

  getFormattedAmount() {
    return `${this.currency} $${this.amount.toFixed(2)}`;
  }
}