import { AuthService } from '../src/core/services/authService.js';

const API_BASE = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', async () => {
  console.log('Inicializando Click & Buy - Panel Admin');

  if (!AuthService.requireAuth()) return;
  if (!AuthService.requireAdmin()) return;

  document.getElementById('logoutBtn').addEventListener('click', async () => {
    await AuthService.logout();
    window.location.href = '../index.html';
  });

  setupTabs();
  await loadDashboard();

  document.getElementById('applyInventoryFilters').addEventListener('click', loadInventory);
  document.getElementById('filterSales').addEventListener('click', loadSales);
  document.getElementById('clearSalesFilter').addEventListener('click', () => {
    document.getElementById('startDate').value = '';
    document.getElementById('endDate').value = '';
    loadSales();
  });
});

function setupTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.dataset.tab;

      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      document.getElementById(tabName).classList.add('active');

      if (tabName === 'inventory') loadInventory();
      if (tabName === 'sales') loadSales();
      if (tabName === 'users') loadUsers();
    });
  });
}

async function loadDashboard() {
  showLoading(true);
  try {
    const response = await AuthService.makeAuthenticatedRequest(`${API_BASE}/admin/dashboard/stats`);
    const data = await response.json();

    if (data.success) {
      document.getElementById('totalCards').textContent = data.stats.total_cards;
      document.getElementById('cardsInStock').textContent = data.stats.cards_in_stock;
      document.getElementById('cardsOutStock').textContent = data.stats.cards_out_stock;
      document.getElementById('totalSales').textContent = data.stats.total_sales;
      document.getElementById('totalRevenue').textContent = `$${parseFloat(data.stats.total_revenue).toFixed(2)}`;
      document.getElementById('totalCustomers').textContent = data.stats.total_customers;

      renderRecentSales(data.recentSales);
      renderLowStock(data.lowStock);
    }
  } catch (error) {
    console.error('Error cargando dashboard:', error);
    alert('Error al cargar estadísticas');
  } finally {
    showLoading(false);
  }
}

function renderRecentSales(sales) {
  const container = document.getElementById('recentSalesList');
  
  if (!sales || sales.length === 0) {
    container.innerHTML = '<p style="color: var(--muted);">No hay ventas recientes</p>';
    return;
  }

  container.innerHTML = sales.map(sale => {
    const items = Array.isArray(sale.items) ? sale.items : [];
    return `
      <div class="list-item">
        <div class="item-info">
          <h4>${sale.transaction_id}</h4>
          <p>${new Date(sale.created_at).toLocaleString()}</p>
          <p>${items.length} item(s)</p>
        </div>
        <div class="item-value">$${parseFloat(sale.grand_total).toFixed(2)}</div>
      </div>
    `;
  }).join('');
}

function renderLowStock(cards) {
  const container = document.getElementById('lowStockList');
  
  if (!cards || cards.length === 0) {
    container.innerHTML = '<p style="color: var(--muted);">No hay cartas con stock bajo</p>';
    return;
  }

  container.innerHTML = cards.map(card => `
    <div class="list-item">
      <div class="item-info">
        <h4>${card.name}</h4>
        <p>Stock: ${card.stock} unidades</p>
      </div>
      <span class="stock-badge low">${card.stock}</span>
    </div>
  `).join('');
}

async function loadInventory() {
  showLoading(true);
  try {
    const searchTerm = document.getElementById('searchCard').value.trim();
    const stockFilter = document.getElementById('filterStock').value;

    let url = `${API_BASE}/cards?`;
    if (searchTerm) url += `name=${encodeURIComponent(searchTerm)}&`;

    const response = await fetch(url);
    let cards = await response.json();

    if (stockFilter === 'inStock') {
      cards = cards.filter(c => c.stock > 5);
    } else if (stockFilter === 'lowStock') {
      cards = cards.filter(c => c.stock > 0 && c.stock <= 5);
    } else if (stockFilter === 'noStock') {
      cards = cards.filter(c => c.stock === 0);
    }

    renderInventoryTable(cards);
  } catch (error) {
    console.error('Error cargando inventario:', error);
    alert('Error al cargar inventario');
  } finally {
    showLoading(false);
  }
}

function renderInventoryTable(cards) {
  const container = document.getElementById('inventoryTable');

  if (!cards || cards.length === 0) {
    container.innerHTML = '<p style="padding: 2rem; text-align: center;">No se encontraron cartas</p>';
    return;
  }

  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Set</th>
          <th>Rareza</th>
          <th>Precio</th>
          <th>Stock</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        ${cards.map(card => `
          <tr>
            <td>${card.name}</td>
            <td>${card.set_name || 'N/A'}</td>
            <td>${card.rarity || 'N/A'}</td>
            <td>$${parseFloat(card.price).toFixed(2)}</td>
            <td>
              <span class="stock-badge ${card.stock === 0 ? 'none' : card.stock <= 5 ? 'low' : 'ok'}">
                ${card.stock}
              </span>
            </td>
            <td>
              <button class="action-btn edit" onclick="openEditStock('${card.id}', '${card.name}', ${card.stock})">
                Editar Stock
              </button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

window.openEditStock = function(cardId, cardName, currentStock) {
  const modal = document.getElementById('editStockModal');
  document.getElementById('modalCardName').textContent = cardName;
  document.getElementById('modalCurrentStock').textContent = currentStock;
  document.getElementById('newStock').value = currentStock;

  modal.style.display = 'flex';

  const confirmBtn = document.getElementById('confirmStockBtn');
  const cancelBtn = document.getElementById('cancelStockBtn');

  const newConfirmBtn = confirmBtn.cloneNode(true);
  confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

  newConfirmBtn.addEventListener('click', async () => {
    const newStock = parseInt(document.getElementById('newStock').value);

    if (isNaN(newStock) || newStock < 0) {
      alert('Stock inválido');
      return;
    }

    try {
      const response = await AuthService.makeAuthenticatedRequest(`${API_BASE}/admin/cards/${cardId}/stock`, {
        method: 'PATCH',
        body: JSON.stringify({ stock: newStock })
      });

      const data = await response.json();

      if (data.success) {
        alert('Stock actualizado correctamente');
        modal.style.display = 'none';
        loadInventory();
      } else {
        alert('Error al actualizar stock');
      }
    } catch (error) {
      console.error('Error actualizando stock:', error);
      alert('Error al actualizar stock');
    }
  });

  cancelBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });
};

async function loadSales() {
  showLoading(true);
  try {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    let url = `${API_BASE}/admin/sales?limit=50`;
    if (startDate && endDate) {
      url += `&startDate=${startDate}&endDate=${endDate}`;
    }

    const response = await AuthService.makeAuthenticatedRequest(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();

    if (data.success && data.sales) {
      renderSalesTable(data.sales);
    } else {
      renderSalesTable([]);
    }
  } catch (error) {
    console.error('Error cargando ventas:', error);
    alert('Error al cargar ventas');
    renderSalesTable([]);
  } finally {
    showLoading(false);
  }
}

function renderSalesTable(sales) {
  const container = document.getElementById('salesTable');

  if (!sales || sales.length === 0) {
    container.innerHTML = '<p style="padding: 2rem; text-align: center;">No se encontraron ventas</p>';
    return;
  }

  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>ID Transacción</th>
          <th>Fecha</th>
          <th>Items</th>
          <th>Total</th>
          <th>Método</th>
        </tr>
      </thead>
      <tbody>
        ${sales.map(sale => {
          const items = Array.isArray(sale.items) ? sale.items : [];
          return `
            <tr>
              <td>${sale.transaction_id}</td>
              <td>${new Date(sale.created_at).toLocaleString()}</td>
              <td>${items.length} item(s)</td>
              <td>$${parseFloat(sale.grand_total).toFixed(2)}</td>
              <td>${sale.card_type || 'N/A'} ****${sale.last_four_digits || '****'}</td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;
}

async function loadUsers() {
  showLoading(true);
  try {
    const response = await AuthService.makeAuthenticatedRequest(`${API_BASE}/admin/users`);
    const data = await response.json();

    if (data.success && data.users) {
      renderUsersTable(data.users);
    } else {
      renderUsersTable([]);
    }
  } catch (error) {
    console.error('Error cargando usuarios:', error);
    alert('Error al cargar usuarios');
    renderUsersTable([]);
  } finally {
    showLoading(false);
  }
}

function renderUsersTable(users) {
  const container = document.getElementById('usersTable');

  if (!users || users.length === 0) {
    container.innerHTML = '<p style="padding: 2rem; text-align: center;">No hay usuarios registrados</p>';
    return;
  }

  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Email</th>
          <th>Rol</th>
          <th>Último acceso</th>
          <th>Estado</th>
        </tr>
      </thead>
      <tbody>
        ${users.map(user => `
          <tr>
            <td>${user.id}</td>
            <td>${user.full_name}</td>
            <td>${user.email}</td>
            <td><strong>${user.role === 'admin' ? 'Administrador' : 'Cliente'}</strong></td>
            <td>${user.last_login ? new Date(user.last_login).toLocaleString() : 'Nunca'}</td>
            <td>
              <span class="stock-badge ${user.is_active ? 'ok' : 'none'}">
                ${user.is_active ? 'Activo' : 'Inactivo'}
              </span>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function showLoading(show) {
  const loading = document.getElementById('loading');
  loading.style.display = show ? 'block' : 'none';
}