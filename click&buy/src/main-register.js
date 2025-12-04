import { AuthService } from '../src/core/services/authService.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log('Inicializando Click & Buy - Registro');

  const form = document.getElementById('registerForm');
  const fullNameInput = document.getElementById('fullName');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const confirmPasswordInput = document.getElementById('confirmPassword');
  const errorMessage = document.getElementById('errorMessage');
  const loadingOverlay = document.getElementById('loadingOverlay');
  const submitBtn = document.getElementById('submitBtn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fullName = fullNameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (!fullName || !email || !password || !confirmPassword) {
      showError('Por favor, completa todos los campos');
      return;
    }

    if (password.length < 6) {
      showError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      showError('Las contraseñas no coinciden');
      return;
    }

    if (!isValidEmail(email)) {
      showError('Por favor, ingresa un email válido');
      return;
    }

    try {
      submitBtn.disabled = true;
      loadingOverlay.style.display = 'flex';
      errorMessage.classList.remove('show');

      await AuthService.register(email, password, fullName);

      alert('Cuenta creada exitosamente. Ahora puedes iniciar sesión.');
      window.location.href = 'login.html';
    } catch (error) {
      console.error('Error en registro:', error);
      showError(error.message);
      submitBtn.disabled = false;
      loadingOverlay.style.display = 'none';
    }
  });

  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
  }

  function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }
});