const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'postgresql',
  password: process.env.DB_PASSWORD || 'mtx123!!',
  database: process.env.DB_NAME || 'liveavatarantigravity',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL pool error:', err.message);
});

const query = (text, params) => pool.query(text, params);

async function initializeDatabase() {
  const client = await pool.connect();
  try {
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'user',
        avatar TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Create refresh_tokens table
    await client.query(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token TEXT NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Create settings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id           SERIAL PRIMARY KEY,
        key          VARCHAR(100) UNIQUE NOT NULL,
        value        TEXT,
        label        VARCHAR(255) NOT NULL,
        description  TEXT,
        is_secret    BOOLEAN NOT NULL DEFAULT FALSE,
        category     VARCHAR(100) NOT NULL DEFAULT 'general',
        is_active    BOOLEAN NOT NULL DEFAULT TRUE,
        updated_by   INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at   TIMESTAMPTZ DEFAULT NOW(),
        updated_at   TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Create avatars table (synced from LiveAvatar API)
    await client.query(`
      CREATE TABLE IF NOT EXISTS avatars (
        id          SERIAL PRIMARY KEY,
        avatar_id   VARCHAR(255) UNIQUE NOT NULL,
        name        VARCHAR(255),
        gender      VARCHAR(50),
        language    VARCHAR(100),
        style       VARCHAR(100),
        status      VARCHAR(100),
        thumbnail   TEXT,
        is_public   BOOLEAN NOT NULL DEFAULT FALSE,
        raw_data    JSONB,
        synced_at   TIMESTAMPTZ DEFAULT NOW(),
        created_at  TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Create updated_at trigger function
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Apply trigger to users table (only if not exists)
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_users'
        ) THEN
          CREATE TRIGGER set_updated_at_users
          BEFORE UPDATE ON users
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        END IF;
      END;
      $$;
    `);

    // Apply trigger to settings table (only if not exists)
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_settings'
        ) THEN
          CREATE TRIGGER set_updated_at_settings
          BEFORE UPDATE ON settings
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        END IF;
      END;
      $$;
    `);

    // Seed admin user if not exists
    const { rows } = await client.query(
      'SELECT id FROM users WHERE email = $1',
      ['admin@liveavatar.com']
    );

    if (rows.length === 0) {
      const hashedPassword = await bcrypt.hash('Admin@123', 12);
      await client.query(
        `INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)`,
        ['Administrator', 'admin@liveavatar.com', hashedPassword, 'admin']
      );
      console.log('✅ Admin user seeded: admin@liveavatar.com / Admin@123');
    }

    // Seed default settings
    const defaultSettings = [
      {
        key: 'liveavatar_api_key',
        value: 'lva_' + crypto.randomBytes(24).toString('hex'),
        label: 'LiveAvatar API Key',
        description: 'API Key utama untuk mengakses layanan LiveAvatar. Jaga kerahasiaannya.',
        is_secret: true,
        category: 'api',
      },
      {
        key: 'liveavatar_api_url',
        value: 'https://api.liveavatar.com',
        label: 'LiveAvatar API URL',
        description: 'Base URL endpoint API LiveAvatar (tanpa trailing slash dan tanpa /v1).',
        is_secret: false,
        category: 'api',
      },
      {
        key: 'liveavatar_model',
        value: 'avatar-pro-v3',
        label: 'Default Avatar Model',
        description: 'Model avatar default yang digunakan untuk sesi baru.',
        is_secret: false,
        category: 'avatar',
      },
      {
        key: 'liveavatar_max_sessions',
        value: '10',
        label: 'Maksimum Sesi Bersamaan',
        description: 'Jumlah maksimum sesi avatar yang dapat berjalan bersamaan.',
        is_secret: false,
        category: 'avatar',
      },
      {
        key: 'liveavatar_url',
        value: '',
        label: 'LiveAvatar URL',
        description: 'URL publik layanan LiveAvatar (misalnya: https://avatar.example.com). Digunakan sebagai tautan akses utama.',
        is_secret: false,
        category: 'general',
      },
    ];

    for (const setting of defaultSettings) {
      if (setting.key === 'liveavatar_api_key') {
        // API Key: hanya insert jika belum ada (jangan overwrite yang sudah ada)
        await client.query(
          `INSERT INTO settings (key, value, label, description, is_secret, category)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (key) DO NOTHING`,
          [setting.key, setting.value, setting.label, setting.description, setting.is_secret, setting.category]
        );
      } else {
        // Setting non-secret: update label & description jika sudah ada, tapi jaga nilai yang sudah diubah user
        await client.query(
          `INSERT INTO settings (key, value, label, description, is_secret, category)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (key) DO UPDATE SET
             label = EXCLUDED.label,
             description = EXCLUDED.description,
             is_secret = EXCLUDED.is_secret,
             category = EXCLUDED.category`,
          [setting.key, setting.value, setting.label, setting.description, setting.is_secret, setting.category]
        );
      }
    }
    console.log('✅ Default settings seeded');

    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

module.exports = { pool, query, initializeDatabase };
