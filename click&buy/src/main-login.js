import { AuthService } from '../src/core/services/authService.js';

document.addEventListener('DOMContentLoaded', async () => {
  console.log('Inicializando Click & Buy - Login');

  if (AuthService.isAuthenticated()) {
    const isSessionValid = await AuthService.verifySession();
    if (isSessionValid) {
      if (AuthService.isAdmin()) {
        window.location.href = 'admin.html';
      } else {
        window.location.href = '../index.html';
      }
      return;
    }
  }

  const form = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const errorMessage = document.getElementById('errorMessage');
  const loadingOverlay = document.getElementById('loadingOverlay');
  const submitBtn = document.getElementById('submitBtn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      showError('Por favor, completa todos los campos');
      return;
    }

    try {
      submitBtn.disabled = true;
      loadingOverlay.style.display = 'flex';
      errorMessage.classList.remove('show');

      const result = await AuthService.login(email, password);

      console.log('Login exitoso:', result.user);

      if (result.user.role === 'admin') {
        window.location.href = 'admin.html';
      } else {
        window.location.href = '../index.html';
      }
    } catch (error) {
      console.error('Error en login:', error);
      showError(error.message);
      submitBtn.disabled = false;
      loadingOverlay.style.display = 'none';
    }
  });

  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
  }
});