import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function initDatabase() {
  try {
    console.log('Inicializando base de datos...\n');

    console.log('Creando tabla cards...');
    await sql`
      CREATE TABLE IF NOT EXISTS cards (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        image_url TEXT,
        rarity VARCHAR(100),
        types TEXT[],
        set_name VARCHAR(255),
        set_id VARCHAR(100),
        hp INTEGER,
        stage VARCHAR(50),
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        stock INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('Tabla cards creada\n');

    console.log('Creando tabla card_attacks...');
    await sql`
      CREATE TABLE IF NOT EXISTS card_attacks (
        id SERIAL PRIMARY KEY,
        card_id VARCHAR(50) REFERENCES cards(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        damage VARCHAR(20),
        effect TEXT
      )
    `;
    console.log('Tabla card_attacks creada\n');

    console.log('Creando tabla users...');
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP,
        is_active BOOLEAN DEFAULT true
      )
    `;
    console.log('Tabla users creada\n');

    console.log('Creando tabla user_sessions...');
    await sql`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        session_token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ip_address VARCHAR(50),
        user_agent TEXT
      )
    `;
    console.log('Tabla user_sessions creada\n');

    console.log('Creando tabla transactions...');
    await sql`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        transaction_id VARCHAR(100) UNIQUE NOT NULL,
        total_amount DECIMAL(10, 2) NOT NULL,
        tax_amount DECIMAL(10, 2) NOT NULL,
        grand_total DECIMAL(10, 2) NOT NULL,
        payment_status VARCHAR(50) DEFAULT 'completed',
        card_type VARCHAR(50),
        last_four_digits VARCHAR(4),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('Tabla transactions creada\n');

    console.log('Creando tabla transaction_items...');
    await sql`
      CREATE TABLE IF NOT EXISTS transaction_items (
        id SERIAL PRIMARY KEY,
        transaction_id INTEGER REFERENCES transactions(id) ON DELETE CASCADE,
        card_id VARCHAR(50) REFERENCES cards(id),
        card_name VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        quantity INTEGER DEFAULT 1
      )
    `;
    console.log('Tabla transaction_items creada\n');

    console.log('Creando índices...');
    await sql`CREATE INDEX IF NOT EXISTS idx_cards_rarity ON cards(rarity)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_cards_set_name ON cards(set_name)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_cards_stock ON cards(stock)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(session_token)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_sessions_user ON user_sessions(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at)`;
    console.log('Índices creados\n');

    console.log('Creando funciones de actualización...');
    await sql`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql'
    `;

    await sql`DROP TRIGGER IF EXISTS update_cards_updated_at ON cards`;
    await sql`
      CREATE TRIGGER update_cards_updated_at 
      BEFORE UPDATE ON cards
      FOR EACH ROW 
      EXECUTE FUNCTION update_updated_at_column()
    `;

    await sql`DROP TRIGGER IF EXISTS update_users_updated_at ON users`;
    await sql`
      CREATE TRIGGER update_users_updated_at 
      BEFORE UPDATE ON users
      FOR EACH ROW 
      EXECUTE FUNCTION update_updated_at_column()
    `;
    console.log('Funciones y triggers creados\n');

    console.log('Insertando usuarios de prueba...');
    const adminHash = hashPassword('admin123');
    const clienteHash = hashPassword('cliente123');

    await sql`
      INSERT INTO users (email, password_hash, full_name, role) 
      VALUES 
        ('admin@clickbuy.com', ${adminHash}, 'Admin Principal', 'admin'),
        ('cliente@ejemplo.com', ${clienteHash}, 'Cliente Ejemplo', 'customer')
      ON CONFLICT (email) DO NOTHING
    `;
    console.log('Usuarios de prueba insertados\n');

    console.log('Verificando tablas...');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;

    console.log('Tablas en la base de datos:');
    tables.forEach(table => {
      console.log(`   ✓ ${table.table_name}`);
    });

    console.log('\n ¡Base de datos inicializada correctamente!\n');
    console.log('Usuarios de prueba creados:');
    console.log('  Admin: admin@clickbuy.com / admin123');
    console.log('  Cliente: cliente@ejemplo.com / cliente123\n');
    console.log('Siguiente paso: ejecuta "npm run seed" para poblar con datos\n');

  } catch (error) {
    console.error('Error inicializando base de datos:', error);
    process.exit(1);
  }
}

initDatabase();