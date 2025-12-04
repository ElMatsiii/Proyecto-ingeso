const API_BASE = 'http://localhost:3000/api';

export class AuthService {
  static getToken() {
    return localStorage.getItem('authToken');
  }

  static setToken(token) {
    localStorage.setItem('authToken', token);
  }

  static removeToken() {
    localStorage.removeItem('authToken');
  }

  static getUser() {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  }

  static setUser(user) {
    localStorage.setItem('userData', JSON.stringify(user));
  }

  static removeUser() {
    localStorage.removeItem('userData');
  }

  static isAuthenticated() {
    return !!this.getToken();
  }

  static isAdmin() {
    const user = this.getUser();
    return user && user.role === 'admin';
  }

  static async register(email, password, fullName) {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password, fullName })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error al registrar usuario');
    }

    return data;
  }

  static async login(email, password) {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error al iniciar sesión');
    }

    this.setToken(data.token);
    this.setUser(data.user);

    return data;
  }

  static async logout() {
    const token = this.getToken();

    if (token) {
      try {
        await fetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } catch (error) {
        console.error('Error al cerrar sesión:', error);
      }
    }

    this.removeToken();
    this.removeUser();
  }

  static async verifySession() {
    const token = this.getToken();

    if (!token) {
      return false;
    }

    try {
      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        this.removeToken();
        this.removeUser();
        return false;
      }

      const data = await response.json();
      this.setUser(data.user);
      return true;
    } catch (error) {
      console.error('Error verificando sesión:', error);
      this.removeToken();
      this.removeUser();
      return false;
    }
  }

  static requireAuth(redirectTo = '../pages/login.html') {
    if (!this.isAuthenticated()) {
      window.location.href = redirectTo;
      return false;
    }
    return true;
  }

  static requireAdmin(redirectTo = '../index.html') {
    if (!this.isAdmin()) {
      alert('No tienes permisos de administrador');
      window.location.href = redirectTo;
      return false;
    }
    return true;
  }

  static async makeAuthenticatedRequest(url, options = {}) {
    const token = this.getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (response.status === 401) {
      this.removeToken();
      this.removeUser();
      window.location.href = '../pages/login.html';
      throw new Error('Sesión expirada');
    }

    return response;
  }
}