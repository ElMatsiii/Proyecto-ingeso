// src/presentation/components/PaginationComponent.js

export class PaginationComponent {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
  }

  render(paginationData, onPageChange) {
    if (!this.container) return;

    const { currentPage, totalPages } = paginationData;

    this.container.innerHTML = `
      <button 
        class="btn" 
        id="prevPage" 
        ${currentPage === 1 ? 'disabled' : ''}>
        ⬅ Anterior
      </button>
      <span>Página ${currentPage} / ${totalPages}</span>
      <button 
        class="btn" 
        id="nextPage" 
        ${currentPage >= totalPages ? 'disabled' : ''}>
        Siguiente ➡
      </button>
    `;

    // Event listeners
    const prevBtn = this.container.querySelector('#prevPage');
    const nextBtn = this.container.querySelector('#nextPage');

    if (prevBtn && currentPage > 1) {
      prevBtn.addEventListener('click', () => onPageChange(currentPage - 1));
    }

    if (nextBtn && currentPage < totalPages) {
      nextBtn.addEventListener('click', () => onPageChange(currentPage + 1));
    }
  }

  clear() {
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}