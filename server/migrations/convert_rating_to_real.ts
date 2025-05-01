import { db } from "../db";

/**
 * Migration to convert book ratings from INTEGER to REAL
 */
export async function convertRatingToReal() {
  console.log("Starting migration to convert book ratings from INTEGER to REAL...");
  
  try {
    // Use raw SQL to alter the table column type
    await db.execute(`
      ALTER TABLE books 
      ALTER COLUMN rating TYPE REAL USING rating::REAL
    `);
    
    console.log("Successfully converted book ratings to REAL type.");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}

// If this file is executed directly (not imported)
if (require.main === module) {
  convertRatingToReal()
    .then(() => {
      console.log("Migration completed successfully.");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Migration failed:", error);
      process.exit(1);
    });
}