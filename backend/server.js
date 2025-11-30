// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';

dotenv.config();

const app = express();
const sql = neon(process.env.DATABASE_URL);

// Middleware
app.use(cors());
app.use(express.json());

// ============ ENDPOINTS DE CARTAS ============

// Obtener todas las cartas con stock disponible
app.get('/api/cards', async (req, res) => {
  try {
    const { type, rarity, set, name, inStock } = req.query;
    
    let query = 'SELECT * FROM cards WHERE 1=1';
    const params = [];
    let paramCount = 1;
    
    // IMPORTANTE: Filtrar por stock PRIMERO
    if (inStock === 'true') {
      query += ' AND stock > 0';
    }
    
    if (type) {
      query += ` AND $${paramCount} = ANY(types)`;
      params.push(type);
      paramCount++;
    }
    
    if (rarity) {
      query += ` AND LOWER(rarity) LIKE LOWER($${paramCount})`;
      params.push(`%${rarity}%`);
      paramCount++;
    }
    
    if (set) {
      query += ` AND LOWER(set_name) LIKE LOWER($${paramCount})`;
      params.push(`%${set}%`);
      paramCount++;
    }
    
    if (name) {
      query += ` AND LOWER(name) LIKE LOWER($${paramCount})`;
      params.push(`%${name}%`);
      paramCount++;
    }
    
    query += ' ORDER BY created_at DESC';
    
    const cards = await sql(query, params);
    res.json(cards);
  } catch (error) {
    console.error('Error fetching cards:', error);
    res.status(500).json({ error: 'Error al obtener cartas' });
  }
});

// Obtener una carta específica
app.get('/api/cards/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const cards = await sql`
      SELECT * FROM cards WHERE id = ${id}
    `;
    
    if (cards.length === 0) {
      return res.status(404).json({ error: 'Carta no encontrada' });
    }
    
    // Obtener ataques de la carta
    const attacks = await sql`
      SELECT name, damage, effect 
      FROM card_attacks 
      WHERE card_id = ${id}
    `;
    
    const card = { ...cards[0], attacks };
    res.json(card);
  } catch (error) {
    console.error('Error fetching card:', error);
    res.status(500).json({ error: 'Error al obtener carta' });
  }
});

// Verificar stock disponible
app.post('/api/cards/check-stock', async (req, res) => {
  try {
    const { cardIds } = req.body;
    
    const cards = await sql`
      SELECT id, name, stock 
      FROM cards 
      WHERE id = ANY(${cardIds})
    `;
    
    const stockStatus = cards.map(card => ({
      id: card.id,
      name: card.name,
      available: card.stock > 0,
      stock: card.stock
    }));
    
    res.json(stockStatus);
  } catch (error) {
    console.error('Error checking stock:', error);
    res.status(500).json({ error: 'Error al verificar stock' });
  }
});

// ============ ENDPOINTS DE TRANSACCIONES ============

// Procesar compra
app.post('/api/transactions', async (req, res) => {
  try {
    const {
      transactionId,
      items,
      totalAmount,
      taxAmount,
      grandTotal,
      cardType,
      lastFourDigits
    } = req.body;
    
    // Verificar stock disponible
    const cardIds = items.map(item => item.id);
    const cards = await sql`
      SELECT id, stock FROM cards WHERE id = ANY(${cardIds})
    `;
    
    // Validar stock
    for (const item of items) {
      const card = cards.find(c => c.id === item.id);
      if (!card || card.stock < 1) {
        return res.status(400).json({
          error: `Sin stock disponible para ${item.nombre}`
        });
      }
    }
    
    // Iniciar transacción
    // 1. Crear registro de transacción
    const transaction = await sql`
      INSERT INTO transactions (
        transaction_id, total_amount, tax_amount, grand_total,
        payment_status, card_type, last_four_digits
      )
      VALUES (
        ${transactionId}, ${totalAmount}, ${taxAmount}, ${grandTotal},
        'completed', ${cardType}, ${lastFourDigits}
      )
      RETURNING id
    `;
    
    const transId = transaction[0].id;
    
    // 2. Crear items de transacción y reducir stock
    for (const item of items) {
      // Insertar item
      await sql`
        INSERT INTO transaction_items (
          transaction_id, card_id, card_name, price, quantity
        )
        VALUES (
          ${transId}, ${item.id}, ${item.nombre}, ${item.precio}, 1
        )
      `;
      
      // Reducir stock
      await sql`
        UPDATE cards 
        SET stock = stock - 1 
        WHERE id = ${item.id} AND stock > 0
      `;
    }
    
    res.json({
      success: true,
      transactionId,
      message: 'Compra procesada exitosamente'
    });
    
  } catch (error) {
    console.error('Error processing transaction:', error);
    res.status(500).json({ error: 'Error al procesar la compra' });
  }
});

// Obtener historial de transacciones
app.get('/api/transactions', async (req, res) => {
  try {
    const transactions = await sql`
      SELECT 
        t.*,
        json_agg(
          json_build_object(
            'card_name', ti.card_name,
            'price', ti.price,
            'quantity', ti.quantity
          )
        ) as items
      FROM transactions t
      LEFT JOIN transaction_items ti ON t.id = ti.transaction_id
      GROUP BY t.id
      ORDER BY t.created_at DESC
      LIMIT 100
    `;
    
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Error al obtener transacciones' });
  }
});

// ============ ENDPOINTS DE ADMINISTRACIÓN ============

// Actualizar stock de una carta
app.patch('/api/cards/:id/stock', async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;
    
    const result = await sql`
      UPDATE cards 
      SET stock = ${stock}
      WHERE id = ${id}
      RETURNING *
    `;
    
    if (result.length === 0) {
      return res.status(404).json({ error: 'Carta no encontrada' });
    }
    
    res.json(result[0]);
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({ error: 'Error al actualizar stock' });
  }
});

// Estadísticas
app.get('/api/stats', async (req, res) => {
  try {
    const stats = await sql`
      SELECT 
        COUNT(*) as total_cards,
        SUM(stock) as total_stock,
        COUNT(*) FILTER (WHERE stock > 0) as cards_in_stock,
        COUNT(*) FILTER (WHERE stock = 0) as cards_out_of_stock
      FROM cards
    `;
    
    const salesStats = await sql`
      SELECT 
        COUNT(*) as total_transactions,
        SUM(grand_total) as total_revenue
      FROM transactions
    `;
    
    res.json({
      ...stats[0],
      ...salesStats[0]
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});