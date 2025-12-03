document.addEventListener('DOMContentLoaded', () => {
  console.log('Inicializando Click & Buy - About');
  
  const form = document.getElementById('contactForm');
  
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const nombre = document.getElementById('nombre').value.trim();
      const apellido = document.getElementById('apellido').value.trim();
      const email = document.getElementById('email').value.trim();
      const mensaje = document.getElementById('mensaje').value.trim();

      alert(`Gracias ${nombre} ${apellido}, tu mensaje ha sido enviado.\n\nNos contactaremos contigo a: ${email}`);

      form.reset();
    });
  }
});