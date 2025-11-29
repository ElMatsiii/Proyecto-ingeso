// src/core/usecases/processPayment.js

import { CreditCard, Payment } from '../domain/entities/payment.js';
import { ValidateCard } from './validateCard.js';

export class ProcessPayment {
  constructor(cartStorage) {
    this.cartStorage = cartStorage;
    this.validateCard = new ValidateCard();
  }

  /**
   * Procesa un pago
   */
  async execute(cardData, billingData = null) {
    try {
      // 1. Validar la tarjeta
      const validation = this.validateCard.execute(cardData);
      
      if (!validation.valid) {
        return {
          success: false,
          errors: validation.errors
        };
      }

      // 2. Obtener el total del carrito
      const total = this.cartStorage.getTotal();
      
      if (total <= 0) {
        return {
          success: false,
          errors: ['El carrito está vacío']
        };
      }

      // 3. Crear objetos de dominio
      const creditCard = new CreditCard(cardData);
      const payment = new Payment({
        amount: total,
        currency: 'USD',
        creditCard,
        billingAddress: billingData
      });

      // 4. Simular procesamiento del pago (en producción, aquí iría la integración real)
      const paymentResult = await this.simulatePaymentProcessing(payment);

      if (paymentResult.success) {
        payment.markAsCompleted();
        
        // Limpiar el carrito después del pago exitoso
        this.cartStorage.clear();

        return {
          success: true,
          payment,
          message: 'Pago procesado exitosamente',
          transactionId: payment.id
        };
      } else {
        payment.markAsFailed(paymentResult.reason);
        
        return {
          success: false,
          errors: [paymentResult.reason || 'Error al procesar el pago']
        };
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      return {
        success: false,
        errors: ['Error inesperado al procesar el pago']
      };
    }
  }

  /**
   * Simula el procesamiento de un pago (simulación de pasarela de pago)
   */
  async simulatePaymentProcessing(payment) {
    // Simular delay de procesamiento
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulación: 95% de éxito
    const success = Math.random() > 0.05;

    if (success) {
      return { success: true };
    } else {
      return { 
        success: false, 
        reason: 'Fondos insuficientes o tarjeta rechazada' 
      };
    }
  }

  /**
   * Obtiene el resumen del carrito
   */
  getCartSummary() {
    const items = this.cartStorage.getItems();
    const total = this.cartStorage.getTotal();
    const count = this.cartStorage.getCount();

    return {
      items,
      total,
      count,
      tax: total * 0.19, // IVA 19%
      grandTotal: total * 1.19
    };
  }
}