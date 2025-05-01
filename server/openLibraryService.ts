import fetch from 'node-fetch';
import { db } from './db';
import { books, InsertBook } from '@shared/schema';
import { eq } from 'drizzle-orm';

// Open Library API endpoints
const OL_SEARCH_URL = 'https://openlibrary.org/search.json';
const OL_BOOK_URL = 'https://openlibrary.org/works/';
const OL_COVER_URL = 'https://covers.openlibrary.org/b/id/';

interface OpenLibraryBook {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
  subject?: string[];
  language?: string[];
  ebook_access?: string;
}

interface OpenLibrarySearchResult {
  numFound: number;
  start: number;
  docs: OpenLibraryBook[];
}

interface OpenLibraryWorkResponse {
  description?: {
    value?: string;
    type?: string;
  } | string;
}

/**
 * Search for books in Open Library
 */
export async function searchOpenLibrary(
  query: string, 
  limit: number = 20, 
  offset: number = 0
): Promise<InsertBook[]> {
  try {
    // Search Open Library
    const searchParams = new URLSearchParams({
      q: query,
      limit: limit.toString(),
      offset: offset.toString(),
      fields: 'key,title,author_name,first_publish_year,cover_i,subject,language,ebook_access',
    });

    const response = await fetch(`${OL_SEARCH_URL}?${searchParams}`);
    if (!response.ok) {
      throw new Error(`Open Library search failed: ${response.statusText}`);
    }

    const data = await response.json() as OpenLibrarySearchResult;
    const books = await processOpenLibraryResults(data.docs);
    
    return books;
  } catch (error) {
    console.error('Error searching Open Library:', error);
    throw error;
  }
}

/**
 * Get books by category/genre
 */
export async function getBooksByCategory(
  category: string, 
  limit: number = 20, 
  offset: number = 0
): Promise<InsertBook[]> {
  try {
    const searchParams = new URLSearchParams({
      q: `subject:${category}`,
      limit: limit.toString(),
      offset: offset.toString(),
      fields: 'key,title,author_name,first_publish_year,cover_i,subject,language,ebook_access',
    });

    const response = await fetch(`${OL_SEARCH_URL}?${searchParams}`);
    if (!response.ok) {
      throw new Error(`Open Library category search failed: ${response.statusText}`);
    }

    const data = await response.json() as OpenLibrarySearchResult;
    const books = await processOpenLibraryResults(data.docs);
    
    return books;
  } catch (error) {
    console.error('Error getting books by category:', error);
    throw error;
  }
}

/**
 * Get recent best selling books
 */
export async function getTrendingBooks(limit: number = 20): Promise<InsertBook[]> {
  try {
    // Using a predefined list of trending books (could be replaced with actual trending data)
    const searchParams = new URLSearchParams({
      q: 'subject:bestseller',
      sort: 'new',
      limit: limit.toString(),
      fields: 'key,title,author_name,first_publish_year,cover_i,subject,language,ebook_access',
    });

    const response = await fetch(`${OL_SEARCH_URL}?${searchParams}`);
    if (!response.ok) {
      throw new Error(`Open Library trending search failed: ${response.statusText}`);
    }

    const data = await response.json() as OpenLibrarySearchResult;
    const books = await processOpenLibraryResults(data.docs);
    
    return books;
  } catch (error) {
    console.error('Error getting trending books:', error);
    throw error;
  }
}

/**
 * Process results from Open Library API
 */
async function processOpenLibraryResults(results: OpenLibraryBook[]): Promise<InsertBook[]> {
  const processedBooks: InsertBook[] = [];

  for (const book of results) {
    try {
      if (!book.key || !book.title) continue;

      // Extract work ID from key (format: /works/OL123W)
      const olid = book.key.split('/').pop() || '';
      
      // Check if book already exists in database
      const [existingBook] = await db
        .select()
        .from(books)
        .where(eq(books.olid, olid));

      if (existingBook) {
        // Book already exists, use it instead of creating a new one
        processedBooks.push(existingBook);
        continue;
      }

      // Get additional book details
      let description: string | null = null;
      try {
        const workResponse = await fetch(`${OL_BOOK_URL}${olid}.json`);
        if (workResponse.ok) {
          const workData = await workResponse.json() as OpenLibraryWorkResponse;
          if (workData.description) {
            if (typeof workData.description === 'string') {
              description = workData.description;
            } else if (workData.description.value) {
              description = workData.description.value;
            }
          }
        }
      } catch (error) {
        console.error(`Error fetching work details for ${olid}:`, error);
      }

      // Determine if the book is free
      const isFree = book.ebook_access === 'public' || book.ebook_access === 'borrowable';

      // Create book object
      const newBook: InsertBook = {
        olid,
        title: book.title,
        author: book.author_name?.join(', ') || 'Unknown',
        description,
        cover: book.cover_i ? `${OL_COVER_URL}${book.cover_i}-L.jpg` : null,
        genre: book.subject?.[0] || null,
        isFree,
        rating: 0,
        ratingCount: 0,
        publishDate: book.first_publish_year ? book.first_publish_year.toString() : null,
        url: `https://openlibrary.org${book.key}`
      };

      // Insert book into database
      const [insertedBook] = await db.insert(books).values(newBook).returning();
      processedBooks.push(insertedBook);
    } catch (error) {
      console.error(`Error processing book ${book.key}:`, error);
      // Continue with next book
    }
  }

  return processedBooks;
}

/**
 * Get book details by Open Library ID
 */
export async function getBookByOLID(olid: string): Promise<InsertBook | null> {
  try {
    // Check if book already exists in database
    const [existingBook] = await db
      .select()
      .from(books)
      .where(eq(books.olid, olid));

    if (existingBook) {
      return existingBook;
    }

    // Fetch book details from Open Library
    const response = await fetch(`${OL_BOOK_URL}${olid}.json`);
    if (!response.ok) {
      throw new Error(`Open Library book fetch failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Get book details
    const title = data.title || 'Unknown';
    
    // Get author info
    let author = 'Unknown';
    if (data.authors) {
      const authorKeys = data.authors.map((a: any) => a.author.key.split('/').pop());
      if (authorKeys.length > 0) {
        const authorResponses = await Promise.all(
          authorKeys.map((key: string) => 
            fetch(`https://openlibrary.org/authors/${key}.json`).then(res => res.json())
          )
        );
        author = authorResponses.map((a: any) => a.name).join(', ');
      }
    }
    
    // Get description
    let description: string | null = null;
    if (data.description) {
      if (typeof data.description === 'string') {
        description = data.description;
      } else if (data.description.value) {
        description = data.description.value;
      }
    }
    
    // Get cover
    const cover = data.covers && data.covers.length > 0 
      ? `${OL_COVER_URL}${data.covers[0]}-L.jpg` 
      : null;
    
    // Get publish date
    const publishDate = data.first_publish_date || null;
    
    // Get genre
    const genre = data.subjects && data.subjects.length > 0 
      ? data.subjects[0] 
      : null;
    
    // Determine if free
    const isFree = data.ebook_access === 'public' || data.ebook_access === 'borrowable';
    
    // Create book object
    const newBook: InsertBook = {
      olid,
      title,
      author,
      description,
      cover,
      genre,
      isFree,
      rating: 0,
      ratingCount: 0,
      publishDate,
      url: `https://openlibrary.org/works/${olid}`
    };
    
    // Insert into database
    const [insertedBook] = await db.insert(books).values(newBook).returning();
    return insertedBook;
  } catch (error) {
    console.error(`Error getting book by OLID ${olid}:`, error);
    return null;
  }
}

// Function to preload books for categories
export async function preloadBooksForCategories(categories: string[], booksPerCategory: number = 20): Promise<void> {
  for (const category of categories) {
    try {
      console.log(`Preloading books for category: ${category}`);
      await getBooksByCategory(category, booksPerCategory);
      console.log(`Completed preloading for category: ${category}`);
    } catch (error) {
      console.error(`Error preloading books for category ${category}:`, error);
    }
  }
}