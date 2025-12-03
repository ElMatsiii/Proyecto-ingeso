import { STORAGE_KEYS } from '../../shared/config/constants.js';

export class LocalStorageCart {
  constructor() {
    this.storageKey = STORAGE_KEYS.CART;
  }

  getItems() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading cart:', error);
      return [];
    }
  }

  saveItems(items) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(items));
      return true;
    } catch (error) {
      console.error('Error saving cart:', error);
      return false;
    }
  }

  addItem(item) {
    const items = this.getItems();
    items.push(item);
    return this.saveItems(items);
  }

  removeItem(index) {
    const items = this.getItems();
    if (index >= 0 && index < items.length) {
      items.splice(index, 1);
      return this.saveItems(items);
    }
    return false;
  }

  clear() {
    try {
      localStorage.removeItem(this.storageKey);
      return true;
    } catch (error) {
      console.error('Error clearing cart:', error);
      return false;
    }
  }
  getTotal() {
    const items = this.getItems();
    return items.reduce((total, item) => {
      return total + parseFloat(item.precio || 0);
    }, 0);
  }

  getCount() {
    return this.getItems().length;
  }
}