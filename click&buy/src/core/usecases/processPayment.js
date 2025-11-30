// src/core/usecases/processPayment.js - ACTUALIZADO
import { CreditCard, Payment } from '../domain/entities/payment.js';
import { ValidateCard } from './validateCard.js';

export class ProcessPayment {
  constructor(cartStorage, cardRepository) {
    this.cartStorage = cartStorage;
    this.cardRepository = cardRepository; // NeonCardRepository
    this.validateCard = new ValidateCard();
  }

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

      // 2. Obtener el carrito
      const items = this.cartStorage.getItems();
      const total = this.cartStorage.getTotal();
      
      if (total <= 0 || items.length === 0) {
        return {
          success: false,
          errors: ['El carrito está vacío']
        };
      }

      // 3. Verificar stock disponible
      const cardIds = items.map(item => item.id);
      const stockStatus = await this.cardRepository.checkStock(cardIds);
      
      const outOfStock = stockStatus.filter(item => !item.available);
      if (outOfStock.length > 0) {
        return {
          success: false,
          errors: [`Sin stock disponible: ${outOfStock.map(i => i.name).join(', ')}`]
        };
      }

      // 4. Crear objetos de dominio
      const creditCard = new CreditCard(cardData);
      const payment = new Payment({
        amount: total,
        currency: 'USD',
        creditCard,
        billingAddress: billingData
      });

      // 5. Simular procesamiento del pago
      const paymentResult = await this.simulatePaymentProcessing(payment);

      if (!paymentResult.success) {
        payment.markAsFailed(paymentResult.reason);
        return {
          success: false,
          errors: [paymentResult.reason || 'Error al procesar el pago']
        };
      }

      // 6. Registrar transacción en la BD y actualizar stock
      try {
        const tax = total * 0.19;
        const grandTotal = total + tax;
        
        const transactionData = {
          transactionId: payment.id,
          items: items,
          totalAmount: total,
          taxAmount: tax,
          grandTotal: grandTotal,
          cardType: creditCard.getCardType(),
          lastFourDigits: creditCard.getLastFourDigits()
        };
        
        const result = await this.cardRepository.processTransaction(transactionData);
        
        if (result.success) {
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
          throw new Error('Error registrando la transacción');
        }
        
      } catch (error) {
        console.error('Error en transacción:', error);
        return {
          success: false,
          errors: [error.message || 'Error al procesar la compra']
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

  getCartSummary() {
    const items = this.cartStorage.getItems();
    const total = this.cartStorage.getTotal();
    const count = this.cartStorage.getCount();

    return {
      items,
      total,
      count,
      tax: total * 0.19,
      grandTotal: total * 1.19
    };
  }
}