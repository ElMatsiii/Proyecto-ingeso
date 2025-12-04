import { AuthService } from '../src/core/services/authService.js';

const API_BASE = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', async () => {
  console.log('Inicializando Click & Buy - Mi Perfil');

  if (!AuthService.requireAuth()) return;

  await loadProfile();
  await loadPurchaseHistory();
});

async function loadProfile() {
  try {
    const user = AuthService.getUser();

    document.getElementById('userName').textContent = user.full_name || '-';
    document.getElementById('userEmail').textContent = user.email || '-';
    document.getElementById('userRole').textContent = user.role === 'admin' ? 'Administrador' : 'Cliente';
    document.getElementById('userSince').textContent = 'Usuario registrado';

  } catch (error) {
    console.error('Error cargando perfil:', error);
  }
}

async function loadPurchaseHistory() {
  showLoading(true);
  try {
    const user = AuthService.getUser();
    const response = await AuthService.makeAuthenticatedRequest(`${API_BASE}/user/purchases`);
    
    if (!response.ok) {
      throw new Error('Error al cargar historial');
    }

    const data = await response.json();

    if (data.success && data.purchases) {
      renderPurchaseStats(data.purchases);
      renderPurchaseHistory(data.purchases);
    } else {
      renderPurchaseHistory([]);
    }
  } catch (error) {
    console.error('Error cargando historial:', error);
    renderPurchaseHistory([]);
  } finally {
    showLoading(false);
  }
}

function renderPurchaseStats(purchases) {
  const totalPurchases = purchases.length;
  const totalSpent = purchases.reduce((sum, p) => sum + parseFloat(p.grand_total), 0);

  document.getElementById('totalPurchases').textContent = totalPurchases;
  document.getElementById('totalSpent').textContent = `$${totalSpent.toFixed(2)}`;
}

function renderPurchaseHistory(purchases) {
  const container = document.getElementById('purchaseHistoryTable');

  if (!purchases || purchases.length === 0) {
    container.innerHTML = '<p style="padding: 2rem; text-align: center;">No tienes compras registradas aún</p>';
    return;
  }

  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>ID Transacción</th>
          <th>Fecha</th>
          <th>Artículos</th>
          <th>Total</th>
          <th>Estado</th>
          <th>Acción</th>
        </tr>
      </thead>
      <tbody>
        ${purchases.map(purchase => {
          const items = Array.isArray(purchase.items) ? purchase.items : [];
          return `
            <tr class="purchase-row">
              <td>${purchase.transaction_id}</td>
              <td>${new Date(purchase.created_at).toLocaleDateString()}</td>
              <td>${items.length} item(s)</td>
              <td>$${parseFloat(purchase.grand_total).toFixed(2)}</td>
              <td><span class="stock-badge ok">Completado</span></td>
              <td>
                <button class="action-btn edit" onclick="showPurchaseDetail('${purchase.transaction_id}')">
                  Ver Detalle
                </button>
              </td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;
}

window.showPurchaseDetail = async function(transactionId) {
  showLoading(true);
  try {
    const response = await AuthService.makeAuthenticatedRequest(
      `${API_BASE}/user/purchases/${transactionId}`
    );
    
    const data = await response.json();

    if (data.success && data.purchase) {
      openPurchaseModal(data.purchase);
    } else {
      alert('No se pudo cargar el detalle de la compra');
    }
  } catch (error) {
    console.error('Error cargando detalle:', error);
    alert('Error al cargar el detalle de la compra');
  } finally {
    showLoading(false);
  }
};

function openPurchaseModal(purchase) {
  const modal = document.getElementById('purchaseDetailModal');
  
  document.getElementById('modalTransactionId').textContent = purchase.transaction_id;
  document.getElementById('modalTransactionDate').textContent = 
    new Date(purchase.created_at).toLocaleString();
  
  const itemsContainer = document.getElementById('modalItems');
  const items = Array.isArray(purchase.items) ? purchase.items : [];
  
  itemsContainer.innerHTML = items.map(item => `
    <div class="modal-item">
      <span>${item.card_name}</span>
      <span>$${parseFloat(item.price).toFixed(2)}</span>
    </div>
  `).join('');

  document.getElementById('modalSubtotal').textContent = 
    `$${parseFloat(purchase.total_amount).toFixed(2)}`;
  document.getElementById('modalTax').textContent = 
    `$${parseFloat(purchase.tax_amount).toFixed(2)}`;
  document.getElementById('modalTotal').textContent = 
    `$${parseFloat(purchase.grand_total).toFixed(2)}`;

  modal.style.display = 'flex';

  document.getElementById('closeModalBtn').onclick = () => {
    modal.style.display = 'none';
  };
}

function showLoading(show) {
  const loading = document.getElementById('loading');
  loading.style.display = show ? 'block' : 'none';
}