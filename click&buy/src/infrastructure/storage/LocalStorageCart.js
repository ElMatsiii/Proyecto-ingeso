// src/infrastructure/storage/LocalStorageCart.js

import { STORAGE_KEYS } from '../../shared/config/constants.js';

export class LocalStorageCart {
  constructor() {
    this.storageKey = STORAGE_KEYS.CART;
  }

  /**
   * Obtiene todos los items del carrito
   */
  getItems() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading cart:', error);
      return [];
    }
  }

  /**
   * Guarda los items en el carrito
   */
  saveItems(items) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(items));
      return true;
    } catch (error) {
      console.error('Error saving cart:', error);
      return false;
    }
  }

  /**
   * Añade un item al carrito
   */
  addItem(item) {
    const items = this.getItems();
    items.push(item);
    return this.saveItems(items);
  }

  /**
   * Elimina un item del carrito por índice
   */
  removeItem(index) {
    const items = this.getItems();
    if (index >= 0 && index < items.length) {
      items.splice(index, 1);
      return this.saveItems(items);
    }
    return false;
  }

  /**
   * Limpia todo el carrito
   */
  clear() {
    try {
      localStorage.removeItem(this.storageKey);
      return true;
    } catch (error) {
      console.error('Error clearing cart:', error);
      return false;
    }
  }

  /**
   * Calcula el total del carrito
   */
  getTotal() {
    const items = this.getItems();
    return items.reduce((total, item) => {
      return total + parseFloat(item.precio || 0);
    }, 0);
  }

  /**
   * Obtiene la cantidad de items
   */
  getCount() {
    return this.getItems().length;
  }
}