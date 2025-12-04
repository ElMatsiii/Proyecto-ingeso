import express from 'express';
import { 
  hashPassword, 
  verifyPassword, 
  generateSessionToken 
} from '../middleware/auth.js';

export function createAuthRoutes(sql) {
  const router = express.Router();

  router.post('/register', async (req, res) => {
    try {
      const { email, password, fullName } = req.body;

      if (!email || !password || !fullName) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
      }

      const existing = await sql`
        SELECT id FROM users WHERE email = ${email}
      `;

      if (existing.length > 0) {
        return res.status(400).json({ error: 'El email ya está registrado' });
      }

      const passwordHash = hashPassword(password);

      const result = await sql`
        INSERT INTO users (email, password_hash, full_name, role)
        VALUES (${email}, ${passwordHash}, ${fullName}, 'customer')
        RETURNING id, email, full_name, role, created_at
      `;

      const user = result[0];

      res.status(201).json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Error en registro:', error);
      res.status(500).json({ error: 'Error al registrar usuario' });
    }
  });

  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña son requeridos' });
      }

      const users = await sql`
        SELECT * FROM users 
        WHERE email = ${email} 
        AND is_active = true
      `;

      if (users.length === 0) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      const user = users[0];

      if (!verifyPassword(password, user.password_hash)) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      const sessionToken = generateSessionToken();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await sql`
        INSERT INTO user_sessions (user_id, session_token, expires_at, ip_address, user_agent)
        VALUES (
          ${user.id}, 
          ${sessionToken}, 
          ${expiresAt.toISOString()},
          ${req.ip || 'unknown'},
          ${req.headers['user-agent'] || 'unknown'}
        )
      `;

      await sql`
        UPDATE users 
        SET last_login = NOW()
        WHERE id = ${user.id}
      `;

      res.json({
        success: true,
        token: sessionToken,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({ error: 'Error al iniciar sesión' });
    }
  });

  router.post('/logout', async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');

      if (token) {
        await sql`
          DELETE FROM user_sessions 
          WHERE session_token = ${token}
        `;
      }

      res.json({ success: true, message: 'Sesión cerrada' });
    } catch (error) {
      console.error('Error en logout:', error);
      res.status(500).json({ error: 'Error al cerrar sesión' });
    }
  });

  router.get('/me', async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ error: 'No autorizado' });
      }

      const sessions = await sql`
        SELECT u.id, u.email, u.full_name, u.role
        FROM user_sessions us
        JOIN users u ON us.user_id = u.id
        WHERE us.session_token = ${token}
        AND us.expires_at > NOW()
        AND u.is_active = true
      `;

      if (sessions.length === 0) {
        return res.status(401).json({ error: 'Sesión inválida' });
      }

      res.json({
        success: true,
        user: sessions[0]
      });
    } catch (error) {
      console.error('Error verificando sesión:', error);
      res.status(500).json({ error: 'Error de autenticación' });
    }
  });

  return router;
}

export function createAdminRoutes(sql) {
  const router = express.Router();

  router.get('/dashboard/stats', async (req, res) => {
    try {
      const stats = await sql`
        SELECT 
          (SELECT COUNT(*) FROM cards WHERE stock > 0) as cards_in_stock,
          (SELECT COUNT(*) FROM cards WHERE stock = 0) as cards_out_stock,
          (SELECT COUNT(*) FROM transactions) as total_sales,
          (SELECT COALESCE(SUM(grand_total), 0) FROM transactions) as total_revenue,
          (SELECT COUNT(*) FROM users WHERE role = 'customer') as total_customers,
          (SELECT COUNT(*) FROM cards) as total_cards
      `;

      const recentSales = await sql`
        SELECT 
          t.transaction_id,
          t.grand_total,
          t.created_at,
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
        LIMIT 10
      `;

      const lowStock = await sql`
        SELECT id, name, stock, price
        FROM cards
        WHERE stock > 0 AND stock <= 5
        ORDER BY stock ASC
        LIMIT 20
      `;

      res.json({
        success: true,
        stats: stats[0],
        recentSales,
        lowStock
      });
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
  });

  router.patch('/cards/:id/stock', async (req, res) => {
    try {
      const { id } = req.params;
      const { stock } = req.body;

      if (stock === undefined || stock < 0) {
        return res.status(400).json({ error: 'Stock inválido' });
      }

      const result = await sql`
        UPDATE cards 
        SET stock = ${stock}
        WHERE id = ${id}
        RETURNING *
      `;

      if (result.length === 0) {
        return res.status(404).json({ error: 'Carta no encontrada' });
      }

      res.json({
        success: true,
        card: result[0]
      });
    } catch (error) {
      console.error('Error actualizando stock:', error);
      res.status(500).json({ error: 'Error al actualizar stock' });
    }
  });

  router.get('/sales', async (req, res) => {
    try {
      const { startDate, endDate, limit = 50 } = req.query;

      let query = sql`
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
      `;

      if (startDate && endDate) {
        query = sql`
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
          WHERE t.created_at BETWEEN ${startDate} AND ${endDate}
        `;
      }

      const sales = await sql`
        ${query}
        GROUP BY t.id
        ORDER BY t.created_at DESC
        LIMIT ${limit}
      `;

      res.json({
        success: true,
        sales
      });
    } catch (error) {
      console.error('Error obteniendo ventas:', error);
      res.status(500).json({ error: 'Error al obtener ventas' });
    }
  });

  router.get('/users', async (req, res) => {
    try {
      const users = await sql`
        SELECT 
          id, 
          email, 
          full_name, 
          role, 
          created_at, 
          last_login, 
          is_active
        FROM users
        ORDER BY created_at DESC
      `;

      res.json({
        success: true,
        users
      });
    } catch (error) {
      console.error('Error obteniendo usuarios:', error);
      res.status(500).json({ error: 'Error al obtener usuarios' });
    }
  });

  return router;
}