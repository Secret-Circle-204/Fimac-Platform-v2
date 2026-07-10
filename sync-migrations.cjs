const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function syncMigrations() {
  const migrationsToSkip = [
    '20260609_100132_init',
    '20260609_114128_add_currency_fields',
    '20260704_165904',
    '20260704_191146',
    '20260705_082010',
    '20260705_173608'
  ];

  console.log('Syncing old migrations...');

  for (const name of migrationsToSkip) {
    try {
      const res = await pool.query('SELECT id FROM payload_migrations WHERE name = $1', [name]);
      if (res?.rowCount === 0) {
        await pool.query(
          'INSERT INTO payload_migrations (name, batch, updated_at, created_at) VALUES ($1, 1, NOW(), NOW())',
          [name]
        );
        console.log(`✅ Marked ${name} as completed.`);
      } else {
        console.log(`⏩ Skipped ${name} (already exists).`);
      }
    } catch (error) {
      console.error(`❌ Error inserting ${name}:`, error.message);
    }
  }

  console.log('Done! You can now run the payload migrate command safely.');
  process.exit(0);
}

syncMigrations();
