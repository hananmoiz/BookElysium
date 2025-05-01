import { convertRatingToReal } from "./convert_rating_to_real.js";
import { addVerificationFields } from "./add_verification_fields.js";

/**
 * Run all migrations in sequence
 */
async function runMigrations() {
  try {
    console.log("Starting database migrations...");
    
    // Run all migrations in sequence
    await convertRatingToReal();
    await addVerificationFields();
    
    console.log("All migrations completed successfully.");
  } catch (error) {
    console.error("Migration process failed:", error);
    process.exit(1);
  }
}

// Run migrations
runMigrations()
  .then(() => {
    console.log("Migration process completed.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Unexpected error during migration:", error);
    process.exit(1);
  });