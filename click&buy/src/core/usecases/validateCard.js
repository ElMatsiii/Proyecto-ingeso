// src/core/usecases/validateCard.js

export class ValidateCard {
  /**
   * Valida completamente una tarjeta de crédito
   */
  execute(cardData) {
    const errors = [];

    // Validar número de tarjeta
    const numberValidation = this.validateCardNumber(cardData.cardNumber);
    if (!numberValidation.valid) {
      errors.push(numberValidation.error);
    }

    // Validar titular
    const holderValidation = this.validateCardHolder(cardData.cardHolder);
    if (!holderValidation.valid) {
      errors.push(holderValidation.error);
    }

    // Validar fecha de expiración
    const expiryValidation = this.validateExpiry(
      cardData.expiryMonth,
      cardData.expiryYear
    );
    if (!expiryValidation.valid) {
      errors.push(expiryValidation.error);
    }

    // Validar CVV
    const cvvValidation = this.validateCVV(cardData.cvv, cardData.cardNumber);
    if (!cvvValidation.valid) {
      errors.push(cvvValidation.error);
    }

    return {
      valid: errors.length === 0,
      errors,
      cardType: this.getCardType(cardData.cardNumber)
    };
  }

  /**
   * Valida el número de tarjeta usando el algoritmo de Luhn
   */
  validateCardNumber(cardNumber) {
    if (!cardNumber) {
      return { valid: false, error: 'El número de tarjeta es requerido' };
    }

    const cleaned = cardNumber.replace(/\s/g, '');

    // Verificar que solo contenga dígitos
    if (!/^\d+$/.test(cleaned)) {
      return { valid: false, error: 'El número de tarjeta solo debe contener dígitos' };
    }

    // Verificar longitud (13-19 dígitos)
    if (cleaned.length < 13 || cleaned.length > 19) {
      return { valid: false, error: 'El número de tarjeta debe tener entre 13 y 19 dígitos' };
    }

    // Algoritmo de Luhn
    if (!this.luhnCheck(cleaned)) {
      return { valid: false, error: 'El número de tarjeta no es válido' };
    }

    return { valid: true };
  }

  /**
   * Implementación del algoritmo de Luhn
   */
  luhnCheck(cardNumber) {
    let sum = 0;
    let isEven = false;

    // Iterar desde el final hacia el inicio
    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber[i]);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }

  /**
   * Valida el nombre del titular
   */
  validateCardHolder(cardHolder) {
    if (!cardHolder || cardHolder.trim().length === 0) {
      return { valid: false, error: 'El nombre del titular es requerido' };
    }

    const trimmed = cardHolder.trim();

    if (trimmed.length < 3) {
      return { valid: false, error: 'El nombre del titular debe tener al menos 3 caracteres' };
    }

    // Verificar que contenga al menos dos palabras
    const words = trimmed.split(/\s+/);
    if (words.length < 2) {
      return { valid: false, error: 'Ingrese nombre y apellido' };
    }

    // Verificar que solo contenga letras y espacios
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(trimmed)) {
      return { valid: false, error: 'El nombre solo debe contener letras' };
    }

    return { valid: true };
  }

  /**
   * Valida la fecha de expiración
   */
  validateExpiry(month, year) {
    if (!month || !year) {
      return { valid: false, error: 'La fecha de expiración es requerida' };
    }

    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    // Validar formato de mes
    if (monthNum < 1 || monthNum > 12) {
      return { valid: false, error: 'Mes inválido (debe ser entre 01 y 12)' };
    }

    // Validar que no esté en el pasado
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    if (yearNum < currentYear) {
      return { valid: false, error: 'La tarjeta ha expirado' };
    }

    if (yearNum === currentYear && monthNum < currentMonth) {
      return { valid: false, error: 'La tarjeta ha expirado' };
    }

    // Validar que no sea muy lejana (máximo 20 años)
    if (yearNum > currentYear + 20) {
      return { valid: false, error: 'Fecha de expiración inválida' };
    }

    return { valid: true };
  }

  /**
   * Valida el CVV
   */
  validateCVV(cvv, cardNumber) {
    if (!cvv) {
      return { valid: false, error: 'El CVV es requerido' };
    }

    const cleaned = cvv.trim();

    // Verificar que solo contenga dígitos
    if (!/^\d+$/.test(cleaned)) {
      return { valid: false, error: 'El CVV solo debe contener dígitos' };
    }

    // American Express usa 4 dígitos, otros usan 3
    const cardType = this.getCardType(cardNumber);
    const expectedLength = cardType === 'American Express' ? 4 : 3;

    if (cleaned.length !== expectedLength) {
      return { 
        valid: false, 
        error: `El CVV debe tener ${expectedLength} dígitos` 
      };
    }

    return { valid: true };
  }

  /**
   * Detecta el tipo de tarjeta
   */
  getCardType(cardNumber) {
    if (!cardNumber) return 'Unknown';
    
    const cleaned = cardNumber.replace(/\s/g, '');
    
    if (/^4/.test(cleaned)) return 'Visa';
    if (/^5[1-5]/.test(cleaned)) return 'Mastercard';
    if (/^3[47]/.test(cleaned)) return 'American Express';
    if (/^6(?:011|5)/.test(cleaned)) return 'Discover';
    
    return 'Unknown';
  }

  /**
   * Formatea el número de tarjeta para visualización
   */
  formatCardNumber(cardNumber) {
    const cleaned = cardNumber.replace(/\s/g, '');
    const matches = cleaned.match(/\d{1,4}/g);
    return matches ? matches.join(' ') : '';
  }
}