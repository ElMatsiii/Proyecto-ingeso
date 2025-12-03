export class ManageCart {
  constructor(cartStorage) {
    this.cartStorage = cartStorage;
  }

  addCard(card) {
    try {
      const cartItem = card.toCartItem();
      const success = this.cartStorage.addItem(cartItem);
      
      if (success) {
        return {
          success: true,
          message: `${card.name} fue agregado al carrito`,
          count: this.cartStorage.getCount()
        };
      }
      
      return {
        success: false,
        message: 'No se pudo agregar al carrito'
      };
    } catch (error) {
      console.error('Error adding to cart:', error);
      return {
        success: false,
        message: 'Error al agregar al carrito'
      };
    }
  }

  removeItem(index) {
    try {
      const success = this.cartStorage.removeItem(index);
      return {
        success,
        message: success ? 'Item eliminado' : 'No se pudo eliminar',
        count: this.cartStorage.getCount()
      };
    } catch (error) {
      console.error('Error removing from cart:', error);
      return {
        success: false,
        message: 'Error al eliminar del carrito'
      };
    }
  }

  getItems() {
    return this.cartStorage.getItems();
  }

  getTotal() {
    return this.cartStorage.getTotal();
  }

  getCount() {
    return this.cartStorage.getCount();
  }

  clearCart() {
    try {
      const success = this.cartStorage.clear();
      return {
        success,
        message: success ? 'Carrito limpiado' : 'No se pudo limpiar el carrito'
      };
    } catch (error) {
      console.error('Error clearing cart:', error);
      return {
        success: false,
        message: 'Error al limpiar el carrito'
      };
    }
  }
}