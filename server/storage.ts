import { users, books, savedBooks, bookComments, userRatings, categories } from "@shared/schema";
import type { 
  User, 
  InsertUser, 
  Book, 
  InsertBook, 
  SavedBook, 
  InsertSavedBook, 
  BookComment, 
  InsertBookComment, 
  UserRating, 
  InsertUserRating,
  Category,
  InsertCategory
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User | undefined>;
  
  // Books
  getBook(id: number): Promise<Book | undefined>;
  getBookByOLID(olid: string): Promise<Book | undefined>;
  getBooks(limit?: number, offset?: number): Promise<Book[]>;
  getBooksByCategory(category: string, limit?: number, offset?: number): Promise<Book[]>;
  getTrendingBooks(limit?: number): Promise<Book[]>;
  getMostPurchasedBooks(limit?: number): Promise<Book[]>;
  createBook(book: InsertBook): Promise<Book>;
  searchBooks(query: string, limit?: number, offset?: number): Promise<Book[]>;
  
  // Saved books
  getSavedBooks(userId: number): Promise<Book[]>;
  saveBook(savedBook: InsertSavedBook): Promise<SavedBook>;
  removeSavedBook(userId: number, bookId: number): Promise<void>;
  isBookSaved(userId: number, bookId: number): Promise<boolean>;
  
  // Comments
  getBookComments(bookId: number): Promise<(BookComment & { user: User })[]>;
  createBookComment(comment: InsertBookComment): Promise<BookComment>;
  
  // Ratings
  getUserRating(userId: number, bookId: number): Promise<UserRating | undefined>;
  createOrUpdateUserRating(rating: InsertUserRating): Promise<UserRating>;
  
  // Categories
  getCategories(): Promise<Category[]>;
  getCategoryByName(name: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Recommendations
  getRecommendedBooks(userId: number, limit?: number): Promise<Book[]>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private books: Map<number, Book>;
  private savedBooks: Map<number, SavedBook>;
  private bookComments: Map<number, BookComment>;
  private userRatings: Map<number, UserRating>;
  private categories: Map<number, Category>;
  
  private currentUserId: number;
  private currentBookId: number;
  private currentSavedBookId: number;
  private currentCommentId: number;
  private currentRatingId: number;
  private currentCategoryId: number;
  
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.books = new Map();
    this.savedBooks = new Map();
    this.bookComments = new Map();
    this.userRatings = new Map();
    this.categories = new Map();
    
    this.currentUserId = 1;
    this.currentBookId = 1;
    this.currentSavedBookId = 1;
    this.currentCommentId = 1;
    this.currentRatingId = 1;
    this.currentCategoryId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
    
    // Initialize some categories
    this.initializeCategories();
  }

  // Initialize with default categories
  private async initializeCategories() {
    await this.createCategory({ 
      name: "Science Fiction", 
      icon: "rocket-line", 
      color: "#4A6D7C", 
      bookCount: 1234 
    });
    await this.createCategory({ 
      name: "Romance", 
      icon: "heart-line", 
      color: "#8C5E58", 
      bookCount: 2567 
    });
    await this.createCategory({ 
      name: "Mystery & Thriller", 
      icon: "ghost-line", 
      color: "#F9A826", 
      bookCount: 1892 
    });
    await this.createCategory({ 
      name: "Non-Fiction", 
      icon: "book-line", 
      color: "#4CAF50", 
      bookCount: 3421 
    });
    await this.createCategory({ 
      name: "Fantasy", 
      icon: "sword-line", 
      color: "#9C27B0", 
      bookCount: 2145 
    });
    await this.createCategory({ 
      name: "Biography", 
      icon: "user-line", 
      color: "#3F51B5", 
      bookCount: 1567 
    });
    await this.createCategory({ 
      name: "Self-Help", 
      icon: "mental-health-line", 
      color: "#FF5722", 
      bookCount: 1876 
    });
    await this.createCategory({ 
      name: "History", 
      icon: "ancient-gate-line", 
      color: "#795548", 
      bookCount: 1432 
    });
  }

  // User management
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Books
  async getBook(id: number): Promise<Book | undefined> {
    return this.books.get(id);
  }

  async getBookByOLID(olid: string): Promise<Book | undefined> {
    return Array.from(this.books.values()).find(
      (book) => book.olid === olid,
    );
  }

  async getBooks(limit: number = 50, offset: number = 0): Promise<Book[]> {
    return Array.from(this.books.values())
      .slice(offset, offset + limit);
  }

  async getBooksByCategory(category: string, limit: number = 10, offset: number = 0): Promise<Book[]> {
    return Array.from(this.books.values())
      .filter(book => book.genre === category)
      .slice(offset, offset + limit);
  }

  async getTrendingBooks(limit: number = 10): Promise<Book[]> {
    return Array.from(this.books.values())
      .sort((a, b) => (b.rating * b.ratingCount) - (a.rating * a.ratingCount))
      .slice(0, limit);
  }

  async getMostPurchasedBooks(limit: number = 10): Promise<Book[]> {
    // In a real app, we'd track purchases
    // Here, just return by highest rating count
    return Array.from(this.books.values())
      .sort((a, b) => b.ratingCount - a.ratingCount)
      .slice(0, limit);
  }

  async createBook(insertBook: InsertBook): Promise<Book> {
    const id = this.currentBookId++;
    const book: Book = {
      ...insertBook,
      id
    };
    this.books.set(id, book);
    return book;
  }

  async searchBooks(query: string, limit: number = 20, offset: number = 0): Promise<Book[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.books.values())
      .filter(book => 
        book.title.toLowerCase().includes(lowerQuery) || 
        book.author.toLowerCase().includes(lowerQuery) ||
        (book.description && book.description.toLowerCase().includes(lowerQuery)) ||
        (book.genre && book.genre.toLowerCase().includes(lowerQuery))
      )
      .slice(offset, offset + limit);
  }

  // Saved books
  async getSavedBooks(userId: number): Promise<Book[]> {
    const userSavedBooks = Array.from(this.savedBooks.values())
      .filter(saved => saved.userId === userId);
    
    const bookIds = userSavedBooks.map(saved => saved.bookId);
    
    return Array.from(this.books.values())
      .filter(book => bookIds.includes(book.id));
  }

  async saveBook(insertSavedBook: InsertSavedBook): Promise<SavedBook> {
    const id = this.currentSavedBookId++;
    const savedBook: SavedBook = {
      ...insertSavedBook,
      id,
      savedAt: new Date()
    };
    this.savedBooks.set(id, savedBook);
    return savedBook;
  }

  async removeSavedBook(userId: number, bookId: number): Promise<void> {
    const savedBookEntry = Array.from(this.savedBooks.values())
      .find(saved => saved.userId === userId && saved.bookId === bookId);
    
    if (savedBookEntry) {
      this.savedBooks.delete(savedBookEntry.id);
    }
  }

  async isBookSaved(userId: number, bookId: number): Promise<boolean> {
    return Array.from(this.savedBooks.values())
      .some(saved => saved.userId === userId && saved.bookId === bookId);
  }

  // Comments
  async getBookComments(bookId: number): Promise<(BookComment & { user: User })[]> {
    const comments = Array.from(this.bookComments.values())
      .filter(comment => comment.bookId === bookId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return Promise.all(comments.map(async comment => {
      const user = await this.getUser(comment.userId);
      return {
        ...comment,
        user: user as User
      };
    }));
  }

  async createBookComment(insertComment: InsertBookComment): Promise<BookComment> {
    const id = this.currentCommentId++;
    const comment: BookComment = {
      ...insertComment,
      id,
      createdAt: new Date()
    };
    this.bookComments.set(id, comment);
    return comment;
  }

  // Ratings
  async getUserRating(userId: number, bookId: number): Promise<UserRating | undefined> {
    return Array.from(this.userRatings.values())
      .find(rating => rating.userId === userId && rating.bookId === bookId);
  }

  async createOrUpdateUserRating(insertRating: InsertUserRating): Promise<UserRating> {
    // Check if rating already exists
    const existingRating = await this.getUserRating(insertRating.userId, insertRating.bookId);
    
    if (existingRating) {
      // Update existing rating
      const updatedRating: UserRating = {
        ...existingRating,
        rating: insertRating.rating,
        ratedAt: new Date()
      };
      this.userRatings.set(existingRating.id, updatedRating);
      
      // Update book rating
      await this.updateBookRating(insertRating.bookId);
      
      return updatedRating;
    } else {
      // Create new rating
      const id = this.currentRatingId++;
      const rating: UserRating = {
        ...insertRating,
        id,
        ratedAt: new Date()
      };
      this.userRatings.set(id, rating);
      
      // Update book rating
      await this.updateBookRating(insertRating.bookId);
      
      return rating;
    }
  }

  // Helper to update book rating
  private async updateBookRating(bookId: number): Promise<void> {
    const book = await this.getBook(bookId);
    if (!book) return;
    
    const bookRatings = Array.from(this.userRatings.values())
      .filter(rating => rating.bookId === bookId);
    
    if (bookRatings.length === 0) return;
    
    const averageRating = bookRatings.reduce((sum, rating) => sum + rating.rating, 0) / bookRatings.length;
    
    const updatedBook: Book = {
      ...book,
      rating: Math.round(averageRating * 10) / 10, // round to 1 decimal place
      ratingCount: bookRatings.length
    };
    
    this.books.set(bookId, updatedBook);
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategoryByName(name: string): Promise<Category | undefined> {
    return Array.from(this.categories.values())
      .find(category => category.name.toLowerCase() === name.toLowerCase());
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.currentCategoryId++;
    const category: Category = {
      ...insertCategory,
      id
    };
    this.categories.set(id, category);
    return category;
  }

  // Recommendations - simple implementation
  async getRecommendedBooks(userId: number, limit: number = 10): Promise<Book[]> {
    // Get user's saved books to find genres they like
    const savedBooks = await this.getSavedBooks(userId);
    
    if (savedBooks.length === 0) {
      // If user has no saved books, return trending books
      return this.getTrendingBooks(limit);
    }
    
    // Get genres from saved books
    const genres = savedBooks
      .map(book => book.genre)
      .filter((genre): genre is string => genre !== undefined && genre !== null);
    
    if (genres.length === 0) {
      return this.getTrendingBooks(limit);
    }
    
    // Count genre occurrences
    const genreCounts: Record<string, number> = {};
    genres.forEach(genre => {
      genreCounts[genre] = (genreCounts[genre] || 0) + 1;
    });
    
    // Sort genres by count
    const preferredGenres = Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([genre]) => genre);
    
    // Get highly rated books from preferred genres
    let recommendedBooks: Book[] = [];
    
    for (const genre of preferredGenres) {
      const genreBooks = Array.from(this.books.values())
        .filter(book => 
          book.genre === genre && 
          !savedBooks.some(saved => saved.id === book.id)
        )
        .sort((a, b) => b.rating - a.rating);
      
      recommendedBooks.push(...genreBooks);
      
      if (recommendedBooks.length >= limit) {
        break;
      }
    }
    
    // If we still need more books, add trending ones that user hasn't saved
    if (recommendedBooks.length < limit) {
      const savedBookIds = savedBooks.map(book => book.id);
      const trendingBooks = await this.getTrendingBooks(limit * 2);
      
      const additionalBooks = trendingBooks
        .filter(book => 
          !savedBookIds.includes(book.id) && 
          !recommendedBooks.some(rec => rec.id === book.id)
        )
        .slice(0, limit - recommendedBooks.length);
      
      recommendedBooks.push(...additionalBooks);
    }
    
    return recommendedBooks.slice(0, limit);
  }
}

export const storage = new MemStorage();
