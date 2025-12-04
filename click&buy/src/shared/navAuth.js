import { AuthService } from '../core/services/authService.js';

function updateNavigation() {
  const authLink = document.getElementById('authLink');
  
  if (!authLink) {
    return;
  }

  if (AuthService.isAuthenticated()) {
    const user = AuthService.getUser();
    
    const userMenu = document.createElement('div');
    userMenu.className = 'user-menu';
    
    const isInPagesFolder = window.location.pathname.includes('/pages/');
    const adminLink = isInPagesFolder ? 'admin.html' : 'pages/admin.html';
    const profileLink = isInPagesFolder ? 'profile.html' : 'pages/profile.html';
    
    userMenu.innerHTML = `
      ${user.role === 'admin' 
        ? `<a href="${adminLink}" class="nav-link">Panel Admin</a>` 
        : `<a href="${profileLink}" class="nav-link">Mi Perfil</a>`
      }
      <button class="btn-logout" id="logoutBtn">Cerrar Sesión</button>
    `;

    authLink.replaceWith(userMenu);

    document.getElementById('logoutBtn').addEventListener('click', async () => {
      if (confirm('¿Deseas cerrar sesión?')) {
        await AuthService.logout();
        window.location.href = isInPagesFolder ? '../index.html' : 'index.html';
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', updateNavigation);

export { updateNavigation };