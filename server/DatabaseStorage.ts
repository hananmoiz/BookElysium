import { eq, and, like, desc, asc, sql } from "drizzle-orm";
import { db } from "./db";
import connectPg from "connect-pg-simple";
import session from "express-session";
import { pool } from "./db";

import { 
  users, books, savedBooks, bookComments, 
  userRatings, categories, 
  User, InsertUser, Book, InsertBook, 
  SavedBook, InsertSavedBook, BookComment, 
  InsertBookComment, UserRating, InsertUserRating,
  Category, InsertCategory
} from "@shared/schema";

import { IStorage } from "./storage";

const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User management
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  // Books
  async getBook(id: number): Promise<Book | undefined> {
    try {
      const [book] = await db.select().from(books).where(eq(books.id, id));
      
      if (book) {
        return book;
      }
      
      return undefined;
    } catch (error) {
      console.error(`Error getting book by ID ${id}:`, error);
      return undefined;
    }
  }

  async getBookByOLID(olid: string): Promise<Book | undefined> {
    try {
      // First check if the book is in the database
      const [book] = await db
        .select()
        .from(books)
        .where(eq(books.olid, olid));
      
      if (book) {
        return book;
      }
      
      // If not found, try to fetch from Open Library
      const { getBookByOLID } = await import('./openLibraryService');
      const openLibraryBook = await getBookByOLID(olid);
      
      if (openLibraryBook) {
        // The book was fetched and added to the database, so now we can retrieve it
        const [newBook] = await db
          .select()
          .from(books)
          .where(eq(books.olid, olid));
        
        return newBook;
      }
      
      return undefined;
    } catch (error) {
      console.error(`Error getting book by OLID ${olid}:`, error);
      const [book] = await db
        .select()
        .from(books)
        .where(eq(books.olid, olid));
      
      return book;
    }
  }

  async getBooks(limit: number = 50, offset: number = 0): Promise<Book[]> {
    return await db
      .select()
      .from(books)
      .limit(limit)
      .offset(offset);
  }
  
  async getBooksCount(): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(books);
    
    return result?.count || 0;
  }

  async getBooksByCategory(category: string, limit: number = 10, offset: number = 0): Promise<Book[]> {
    try {
      // First try to get books from our database
      const localBooks = await db
        .select()
        .from(books)
        .where(eq(books.genre, category))
        .limit(limit)
        .offset(offset);
      
      // If we have enough books, return them
      if (localBooks.length >= limit) {
        return localBooks;
      }
      
      // Otherwise, fetch more books from Open Library
      const { getBooksByCategory } = await import('./openLibraryService');
      const openLibraryBooks = await getBooksByCategory(category, limit - localBooks.length, offset);
      
      // Combine and return
      return [...localBooks, ...openLibraryBooks.slice(0, limit - localBooks.length)];
    } catch (error) {
      console.error(`Error getting books by category ${category}:`, error);
      // Fallback to just return what we have in the database
      return await db
        .select()
        .from(books)
        .where(eq(books.genre, category))
        .limit(limit)
        .offset(offset);
    }
  }
  
  async getBooksByCategoryCount(category: string): Promise<number> {
    try {
      // First get the count from our database
      const [result] = await db
        .select({ count: sql<number>`count(*)` })
        .from(books)
        .where(eq(books.genre, category));
      
      const localCount = result?.count || 0;
      
      // For now, we'll return a reasonably large count to represent the potential
      // open library books that could be fetched
      // In a production app, we might query Open Library for the actual count
      return Math.max(localCount, 100);
    } catch (error) {
      console.error(`Error getting books count for category ${category}:`, error);
      return 0;
    }
  }

  async getTrendingBooks(limit: number = 10): Promise<Book[]> {
    try {
      // First try to get books from our database
      const localBooks = await db
        .select()
        .from(books)
        .orderBy(desc(books.rating))
        .limit(limit);
      
      // If we have enough books with ratings, return them
      if (localBooks.length >= limit && localBooks[0].rating > 0) {
        return localBooks;
      }
      
      // Otherwise, fetch trending books from Open Library
      const { getTrendingBooks } = await import('./openLibraryService');
      const openLibraryBooks = await getTrendingBooks(limit);
      
      // Combine and return
      const combinedBooks = [...localBooks, ...openLibraryBooks];
      // Remove duplicates by OLID
      const uniqueBooks = Array.from(
        new Map(combinedBooks.map(book => [book.olid, book])).values()
      );
      
      return uniqueBooks.slice(0, limit);
    } catch (error) {
      console.error(`Error getting trending books:`, error);
      // Fallback to just return what we have in the database
      return await db
        .select()
        .from(books)
        .orderBy(desc(books.rating))
        .limit(limit);
    }
  }

  async getMostPurchasedBooks(limit: number = 10): Promise<Book[]> {
    try {
      // First try to get books from our database
      const localBooks = await db
        .select()
        .from(books)
        .orderBy(desc(books.ratingCount))
        .limit(limit);
      
      // If we have enough books with ratings, return them
      if (localBooks.length >= limit && localBooks[0].ratingCount > 0) {
        return localBooks;
      }
      
      // If we don't have enough rated books, we'll query Open Library for popular books
      // We'll use a predefined search for "bestsellers" sorted by popularity
      const { searchOpenLibrary } = await import('./openLibraryService');
      const openLibraryBooks = await searchOpenLibrary('bestsellers', limit);
      
      // Combine results and remove duplicates
      const combinedBooks = [...localBooks, ...openLibraryBooks];
      const uniqueBooks = Array.from(
        new Map(combinedBooks.map(book => [book.olid, book])).values()
      );
      
      return uniqueBooks.slice(0, limit);
    } catch (error) {
      console.error(`Error getting most purchased books:`, error);
      // Fallback to the database
      return await db
        .select()
        .from(books)
        .orderBy(desc(books.ratingCount))
        .limit(limit);
    }
  }

  async createBook(book: InsertBook): Promise<Book> {
    const [newBook] = await db.insert(books).values(book).returning();
    return newBook;
  }

  async searchBooks(query: string, limit: number = 20, offset: number = 0): Promise<Book[]> {
    try {
      // First search our local database
      const localBooks = await db
        .select()
        .from(books)
        .where(
          sql`${books.title} ILIKE ${'%' + query + '%'} OR ${books.author} ILIKE ${'%' + query + '%'}`
        )
        .limit(limit)
        .offset(offset);
      
      // If we have enough local results, return them
      if (localBooks.length >= limit) {
        return localBooks;
      }
      
      // Otherwise, search Open Library API
      const { searchOpenLibrary } = await import('./openLibraryService');
      const openLibraryBooks = await searchOpenLibrary(
        query, 
        limit - localBooks.length, 
        offset + localBooks.length
      );
      
      // Combine results, filtering out duplicates by olid
      const seenOlids = new Set(localBooks.map(book => book.olid));
      const filteredOpenLibraryBooks = openLibraryBooks.filter(book => !seenOlids.has(book.olid));
      
      return [...localBooks, ...filteredOpenLibraryBooks].slice(0, limit);
    } catch (error) {
      console.error(`Error searching books for "${query}":`, error);
      // Fall back to local database
      return await db
        .select()
        .from(books)
        .where(
          sql`${books.title} ILIKE ${'%' + query + '%'} OR ${books.author} ILIKE ${'%' + query + '%'}`
        )
        .limit(limit)
        .offset(offset);
    }
  }
  
  async searchBooksCount(query: string): Promise<number> {
    try {
      // First get the count from our database
      const [result] = await db
        .select({ count: sql<number>`count(*)` })
        .from(books)
        .where(
          sql`${books.title} ILIKE ${'%' + query + '%'} OR ${books.author} ILIKE ${'%' + query + '%'}`
        );
      
      const localCount = result?.count || 0;
      
      // For most searches, there will be many more results in Open Library
      // We'll return a conservative estimate to represent potential results
      // In a production app, we might query Open Library API for actual count
      return Math.max(localCount, 1000);
    } catch (error) {
      console.error(`Error getting search books count for "${query}":`, error);
      return 0;
    }
  }

  // Saved books
  async getSavedBooks(userId: number): Promise<Book[]> {
    const result = await db
      .select({
        book: books
      })
      .from(savedBooks)
      .innerJoin(books, eq(savedBooks.bookId, books.id))
      .where(eq(savedBooks.userId, userId));
    
    return result.map(r => r.book);
  }

  async saveBook(savedBook: InsertSavedBook): Promise<SavedBook> {
    const [newSavedBook] = await db
      .insert(savedBooks)
      .values(savedBook)
      .returning();
    return newSavedBook;
  }

  async removeSavedBook(userId: number, bookId: number): Promise<void> {
    await db
      .delete(savedBooks)
      .where(
        and(
          eq(savedBooks.userId, userId),
          eq(savedBooks.bookId, bookId)
        )
      );
  }

  async isBookSaved(userId: number, bookId: number): Promise<boolean> {
    const [savedBook] = await db
      .select()
      .from(savedBooks)
      .where(
        and(
          eq(savedBooks.userId, userId),
          eq(savedBooks.bookId, bookId)
        )
      );
    return !!savedBook;
  }

  // Comments
  async getBookComments(bookId: number): Promise<(BookComment & { user: User })[]> {
    const comments = await db
      .select({
        comment: bookComments,
        user: users
      })
      .from(bookComments)
      .innerJoin(users, eq(bookComments.userId, users.id))
      .where(eq(bookComments.bookId, bookId))
      .orderBy(desc(bookComments.createdAt));
    
    return comments.map(c => ({
      ...c.comment,
      user: c.user
    }));
  }

  async createBookComment(comment: InsertBookComment): Promise<BookComment> {
    const [newComment] = await db
      .insert(bookComments)
      .values(comment)
      .returning();
    return newComment;
  }

  // Ratings
  async getUserRating(userId: number, bookId: number): Promise<UserRating | undefined> {
    const [rating] = await db
      .select()
      .from(userRatings)
      .where(
        and(
          eq(userRatings.userId, userId),
          eq(userRatings.bookId, bookId)
        )
      );
    return rating;
  }

  async createOrUpdateUserRating(rating: InsertUserRating): Promise<UserRating> {
    const existingRating = await this.getUserRating(rating.userId, rating.bookId);
    
    if (existingRating) {
      const [updatedRating] = await db
        .update(userRatings)
        .set({ rating: rating.rating })
        .where(eq(userRatings.id, existingRating.id))
        .returning();
      
      await this.updateBookRating(rating.bookId);
      return updatedRating;
    } else {
      const [newRating] = await db
        .insert(userRatings)
        .values(rating)
        .returning();
      
      await this.updateBookRating(rating.bookId);
      return newRating;
    }
  }

  private async updateBookRating(bookId: number): Promise<void> {
    const result = await db
      .select({
        avgRating: sql<number>`AVG(${userRatings.rating})`,
        count: sql<number>`COUNT(*)`
      })
      .from(userRatings)
      .where(eq(userRatings.bookId, bookId))
      .groupBy(userRatings.bookId);

    if (result.length > 0) {
      const { avgRating, count } = result[0];
      await db
        .update(books)
        .set({
          rating: Math.round(avgRating),
          ratingCount: count
        })
        .where(eq(books.id, bookId));
    }
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async getCategoryByName(name: string): Promise<Category | undefined> {
    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.name, name));
    return category;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db
      .insert(categories)
      .values(category)
      .returning();
    return newCategory;
  }

  // Recommendations
  async getRecommendedBooks(userId: number, limit: number = 10): Promise<Book[]> {
    // Get books this user rated highly
    const userRatedBooks = await db
      .select({
        bookId: userRatings.bookId,
        rating: userRatings.rating
      })
      .from(userRatings)
      .where(eq(userRatings.userId, userId))
      .orderBy(desc(userRatings.rating))
      .limit(5);
    
    if (userRatedBooks.length === 0) {
      // If no ratings, return trending books
      return this.getTrendingBooks(limit);
    }
    
    // Get genres from books the user liked
    const likedBookIds = userRatedBooks
      .filter(b => b.rating >= 4)
      .map(b => b.bookId);
    
    if (likedBookIds.length === 0) {
      // If no books rated highly, return trending books
      return this.getTrendingBooks(limit);
    }
    
    const likedBooks = await db
      .select({
        genre: books.genre
      })
      .from(books)
      .where(sql`${books.id} IN (${likedBookIds.join(',')})`);
    
    const genres = likedBooks
      .map(b => b.genre)
      .filter((g): g is string => g !== null);
    
    if (genres.length === 0) {
      // If no genres found, return trending books
      return this.getTrendingBooks(limit);
    }
    
    // Get recommendations based on genres
    const genreConditions = genres.map(g => sql`${books.genre} = ${g}`);
    
    const recommendations = await db
      .select()
      .from(books)
      .where(sql`(${sql.join(genreConditions, sql` OR `)})`)
      .orderBy(desc(books.rating))
      .limit(limit);
    
    return recommendations.length > 0 ? recommendations : this.getTrendingBooks(limit);
  }
}