import { db } from "../db.js";

/**
 * Migration to add verification and password reset fields to users table
 */
export async function addVerificationFields() {
  console.log("Adding verification fields to users table...");
  
  try {
    // Add new columns to the users table
    await db.execute(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS verification_token TEXT,
      ADD COLUMN IF NOT EXISTS reset_password_token TEXT,
      ADD COLUMN IF NOT EXISTS reset_password_expires TIMESTAMP
    `);
    
    console.log("Successfully added verification fields to users table.");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}

// Execute if run directly
if (import.meta.url === import.meta.resolve('./add_verification_fields.ts')) {
  addVerificationFields()
    .then(() => {
      console.log("Migration completed successfully.");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Migration failed:", error);
      process.exit(1);
    });
}