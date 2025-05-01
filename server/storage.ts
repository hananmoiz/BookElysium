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
import { DatabaseStorage } from "./DatabaseStorage";

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
  getBooksCount(): Promise<number>;
  getBooksByCategory(category: string, limit?: number, offset?: number): Promise<Book[]>;
  getBooksByCategoryCount(category: string): Promise<number>;
  getTrendingBooks(limit?: number): Promise<Book[]>;
  getMostPurchasedBooks(limit?: number): Promise<Book[]>;
  createBook(book: InsertBook): Promise<Book>;
  searchBooks(query: string, limit?: number, offset?: number): Promise<Book[]>;
  searchBooksCount(query: string): Promise<number>;
  
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
  sessionStore: any; // Using any to avoid SessionStore type issues
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
  
  sessionStore: any; // Using any type for sessionStore

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
    
    // Initialize some categories and books
    this.initializeCategories().then(() => {
      this.initializeSampleBooks();
    });
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
  
  // Initialize with sample books
  private async initializeSampleBooks() {
    // Science Fiction books
    await this.createBook({
      title: "Dune",
      author: "Frank Herbert",
      description: "Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, heir to a noble family tasked with ruling an inhospitable world where the only thing of value is the 'spice' melange, a drug capable of extending life and enhancing consciousness.",
      cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1555447414i/44767458.jpg",
      genre: "Science Fiction",
      isFree: false,
      rating: 4.5,
      ratingCount: 1203,
      publishDate: "1965-08-01",
      olid: "OL1532243W",
      url: "https://www.goodreads.com/book/show/44767458-dune"
    });
    
    await this.createBook({
      title: "The Hitchhiker's Guide to the Galaxy",
      author: "Douglas Adams",
      description: "Seconds before Earth is demolished to make way for a galactic freeway, Arthur Dent is plucked off the planet by his friend Ford Prefect, a researcher for the revised edition of The Hitchhiker's Guide to the Galaxy.",
      cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1559986152i/386162.jpg",
      genre: "Science Fiction",
      isFree: true,
      rating: 4.2,
      ratingCount: 987,
      publishDate: "1979-10-12",
      olid: "OL7440625M",
      url: "https://www.goodreads.com/book/show/386162.The_Hitchhiker_s_Guide_to_the_Galaxy"
    });

    // Fantasy books
    await this.createBook({
      title: "The Hobbit",
      author: "J.R.R. Tolkien",
      description: "Bilbo Baggins is a hobbit who enjoys a comfortable, unambitious life, rarely traveling any farther than his pantry or cellar. But his contentment is disturbed when the wizard Gandalf and a company of dwarves arrive on his doorstep.",
      cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1546071216i/5907.jpg",
      genre: "Fantasy",
      isFree: true,
      rating: 4.7,
      ratingCount: 1567,
      publishDate: "1937-09-21",
      olid: "OL262458W",
      url: "https://www.goodreads.com/book/show/5907.The_Hobbit"
    });
    
    await this.createBook({
      title: "Harry Potter and the Sorcerer's Stone",
      author: "J.K. Rowling",
      description: "Harry Potter has no idea how famous he is. That's because he's being raised by his miserable aunt and uncle who are terrified Harry will learn that he's really a wizard, just as his parents were.",
      cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1474154022i/3.jpg",
      genre: "Fantasy",
      isFree: false,
      rating: 4.8,
      ratingCount: 2345,
      publishDate: "1997-06-26",
      olid: "OL82586W",
      url: "https://www.goodreads.com/book/show/3.Harry_Potter_and_the_Sorcerer_s_Stone"
    });

    // Romance books
    await this.createBook({
      title: "Pride and Prejudice",
      author: "Jane Austen",
      description: "Since its immediate success in 1813, Pride and Prejudice has remained one of the most popular novels in the English language.",
      cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1320399351i/1885.jpg",
      genre: "Romance",
      isFree: true,
      rating: 4.6,
      ratingCount: 1876,
      publishDate: "1813-01-28",
      olid: "OL1394489M",
      url: "https://www.goodreads.com/book/show/1885.Pride_and_Prejudice"
    });
    
    await this.createBook({
      title: "The Notebook",
      author: "Nicholas Sparks",
      description: "Set amid the austere beauty of the North Carolina coast, The Notebook begins with the story of Noah Calhoun, a rural Southerner recently returned from the Second World War.",
      cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1385738917i/15931.jpg",
      genre: "Romance",
      isFree: false,
      rating: 4.1,
      ratingCount: 1432,
      publishDate: "1996-10-01",
      olid: "OL24626951M",
      url: "https://www.goodreads.com/book/show/15931.The_Notebook"
    });

    // Mystery & Thriller books
    await this.createBook({
      title: "Gone Girl",
      author: "Gillian Flynn",
      description: "On a warm summer morning in North Carthage, Missouri, it is Nick and Amy Dunne's fifth wedding anniversary. Presents are being wrapped and reservations are being made when Nick's clever and beautiful wife disappears.",
      cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1554086139i/19288043.jpg",
      genre: "Mystery & Thriller",
      isFree: false,
      rating: 4.0,
      ratingCount: 1987,
      publishDate: "2012-06-05",
      olid: "OL16665249W",
      url: "https://www.goodreads.com/book/show/19288043-gone-girl"
    });
    
    await this.createBook({
      title: "The Da Vinci Code",
      author: "Dan Brown",
      description: "While in Paris, Harvard symbologist Robert Langdon is awakened by a phone call in the dead of the night. The elderly curator of the Louvre has been murdered inside the museum.",
      cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1579621267i/968.jpg",
      genre: "Mystery & Thriller",
      isFree: true,
      rating: 3.9,
      ratingCount: 1756,
      publishDate: "2003-03-18",
      olid: "OL37926911M",
      url: "https://www.goodreads.com/book/show/968.The_Da_Vinci_Code"
    });

    // Non-Fiction books
    await this.createBook({
      title: "Sapiens: A Brief History of Humankind",
      author: "Yuval Noah Harari",
      description: "100,000 years ago, at least six human species inhabited the earth. Today there is just one. Us. Homo sapiens. How did our species succeed in the battle for dominance?",
      cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1420585954i/23692271.jpg",
      genre: "Non-Fiction",
      isFree: false,
      rating: 4.4,
      ratingCount: 2134,
      publishDate: "2011-01-01",
      olid: "OL28180236M",
      url: "https://www.goodreads.com/book/show/23692271-sapiens"
    });
    
    await this.createBook({
      title: "Educated",
      author: "Tara Westover",
      description: "Tara Westover was 17 the first time she set foot in a classroom. Born to survivalists in the mountains of Idaho, she prepared for the end of the world by stockpiling home-canned peaches.",
      cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1506026635i/35133922.jpg",
      genre: "Non-Fiction",
      isFree: false,
      rating: 4.5,
      ratingCount: 1654,
      publishDate: "2018-02-20",
      olid: "OL26570430M",
      url: "https://www.goodreads.com/book/show/35133922-educated"
    });
    
    // Biography books
    await this.createBook({
      title: "Steve Jobs",
      author: "Walter Isaacson",
      description: "Based on more than forty interviews with Steve Jobs conducted over two years—as well as interviews with more than 100 family members, friends, adversaries, competitors, and colleagues.",
      cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1511288482i/11084145.jpg",
      genre: "Biography",
      isFree: false,
      rating: 4.2,
      ratingCount: 1256,
      publishDate: "2011-10-24",
      olid: "OL25003933M",
      url: "https://www.goodreads.com/book/show/11084145-steve-jobs"
    });

    // Self-Help books
    await this.createBook({
      title: "Atomic Habits",
      author: "James Clear",
      description: "No matter your goals, Atomic Habits offers a proven framework for improving--every day. James Clear, one of the world's leading experts on habit formation, reveals practical strategies that will teach you exactly how to form good habits, break bad ones, and master the tiny behaviors that lead to remarkable results.",
      cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1655988385i/40121378.jpg",
      genre: "Self-Help",
      isFree: false,
      rating: 4.7,
      ratingCount: 2354,
      publishDate: "2018-10-16",
      olid: "OL27543141M",
      url: "https://www.goodreads.com/book/show/40121378-atomic-habits"
    });
    
    // History books
    await this.createBook({
      title: "A People's History of the United States",
      author: "Howard Zinn",
      description: "Known for its lively, clear prose as well as its scholarly research, A People's History of the United States is the only volume to tell America's story from the point of view of—and in the words of—America's women, factory workers, African-Americans, Native Americans, the working poor, and immigrant laborers.",
      cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1494279423i/2767.jpg",
      genre: "History",
      isFree: true,
      rating: 4.3,
      ratingCount: 1345,
      publishDate: "1980-01-01",
      olid: "OL7603419M",
      url: "https://www.goodreads.com/book/show/2767.A_People_s_History_of_the_United_States"
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

// Use the DatabaseStorage instead of MemStorage for persistent storage
export const storage = new DatabaseStorage();
