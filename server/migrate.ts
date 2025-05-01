import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db, pool } from './db';

// This will run migrations on the database
async function runMigrations() {
  console.log('Running migrations...');
  
  try {
    await migrate(db, { migrationsFolder: 'drizzle' });
    console.log('Migrations completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();