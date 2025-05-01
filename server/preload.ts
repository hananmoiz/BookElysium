import { db } from './db';
import { categories } from '@shared/schema';
import { preloadBooksForCategories } from './openLibraryService';

/**
 * Preload books for all categories in the database
 */
export async function preloadBooks(): Promise<void> {
  try {
    console.log('Starting preloading books for all categories...');
    
    // Get all category names
    const categoryData = await db.select({ name: categories.name }).from(categories);
    const categoryNames = categoryData.map(c => c.name);
    
    if (categoryNames.length === 0) {
      console.log('No categories found. Skipping preloading.');
      return;
    }
    
    // For each category, load 50 books
    console.log(`Found ${categoryNames.length} categories. Preloading books...`);
    await preloadBooksForCategories(categoryNames, 50);
    
    console.log('Successfully preloaded books for all categories!');
  } catch (error) {
    console.error('Error preloading books:', error);
  }
}

// Only run this function if this file is executed directly
// In ESM, we check if the file is being imported or run directly differently
if (import.meta.url === `file://${process.argv[1]}`) {
  preloadBooks().finally(() => {
    process.exit(0);
  });
}