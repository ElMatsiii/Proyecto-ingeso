import crypto from 'crypto';

export const authMiddleware = (sql) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ error: 'No autorizado' });
      }

      const sessions = await sql`
        SELECT us.*, u.id as user_id, u.email, u.role, u.full_name
        FROM user_sessions us
        JOIN users u ON us.user_id = u.id
        WHERE us.session_token = ${token}
        AND us.expires_at > NOW()
        AND u.is_active = true
      `;

      if (sessions.length === 0) {
        return res.status(401).json({ error: 'Sesión inválida o expirada' });
      }

      req.user = {
        id: sessions[0].user_id,
        email: sessions[0].email,
        role: sessions[0].role,
        full_name: sessions[0].full_name
      };

      next();
    } catch (error) {
      console.error('Error en auth middleware:', error);
      res.status(500).json({ error: 'Error de autenticación' });
    }
  };
};

export const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador' });
  }
  next();
};

export function generateSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

export function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export function verifyPassword(password, hash) {
  const passwordHash = hashPassword(password);
  return passwordHash === hash;
}