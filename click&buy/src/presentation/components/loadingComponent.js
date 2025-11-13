export class LoadingComponent {
  constructor(elementId) {
    this.element = document.getElementById(elementId);
  }

  show() {
    if (this.element) {
      this.element.style.display = 'block';
    }
  }

  hide() {
    if (this.element) {
      this.element.style.display = 'none';
    }
  }

  toggle(show) {
    if (show) {
      this.show();
    } else {
      this.hide();
    }
  }

  static create(message = 'Cargando...') {
    const div = document.createElement('div');
    div.className = 'loading';
    div.innerHTML = `
      <div class="spinner"></div>
      <p>${message}</p>
    `;
    return div;
  }
}