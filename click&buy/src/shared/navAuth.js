import { AuthService } from './core/services/authService.js';

function updateNavigation() {
  const authLink = document.getElementById('authLink');
  
  if (!authLink) {
    console.warn('authLink no encontrado en la navegación');
    return;
  }

  if (AuthService.isAuthenticated()) {
    const user = AuthService.getUser();
    
    const userMenu = document.createElement('div');
    userMenu.className = 'user-menu';
    userMenu.innerHTML = `
      <span class="user-greeting">Hola, ${user.full_name}</span>
      ${user.role === 'admin' ? '<a href="pages/admin.html" class="nav-admin">Panel Admin</a>' : ''}
      <button class="btn-logout" id="logoutBtn">Cerrar Sesión</button>
    `;

    authLink.replaceWith(userMenu);

    document.getElementById('logoutBtn').addEventListener('click', async () => {
      if (confirm('¿Deseas cerrar sesión?')) {
        await AuthService.logout();
        window.location.href = window.location.pathname.includes('/pages/') 
          ? '../index.html' 
          : 'index.html';
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', updateNavigation);

export { updateNavigation };