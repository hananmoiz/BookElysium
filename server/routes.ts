import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { getChatbotResponse, getBookRecommendations } from "./openai";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { 
  createVerificationToken, 
  verifyUser, 
  createPasswordResetToken, 
  verifyPasswordResetToken, 
  resetPassword 
} from "./utils/auth-utils";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}
import { insertBookCommentSchema, insertSavedBookSchema, insertUserRatingSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Get categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  // Get books with pagination support
  app.get("/api/books", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      const books = await storage.getBooks(limit, offset);
      
      // Get total count for pagination
      const count = await storage.getBooksCount();
      
      // Calculate pagination info
      const totalPages = Math.ceil(count / limit);
      const currentPage = Math.floor(offset / limit) + 1;
      const hasNextPage = currentPage < totalPages;
      const hasPrevPage = currentPage > 1;
      
      res.json({
        books,
        pagination: {
          totalBooks: count,
          totalPages,
          currentPage,
          limit,
          offset,
          hasNextPage,
          hasPrevPage,
          nextPageOffset: hasNextPage ? offset + limit : null,
          prevPageOffset: hasPrevPage ? Math.max(0, offset - limit) : null
        }
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch books" });
    }
  });

  // Get books by category with pagination
  app.get("/api/books/category/:category", async (req, res) => {
    try {
      const { category } = req.params;
      console.log(`Received request for category: "${category}"`);
      
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      
      console.log(`Fetching books for category: "${category}" with limit: ${limit}, offset: ${offset}`);
      const books = await storage.getBooksByCategory(category, limit, offset);
      console.log(`Found ${books.length} books for category "${category}"`);
      
      // Get total count for pagination
      const count = await storage.getBooksByCategoryCount(category);
      console.log(`Total books in category "${category}": ${count}`);
      
      // Calculate pagination info
      const totalPages = Math.ceil(count / limit);
      const currentPage = Math.floor(offset / limit) + 1;
      const hasNextPage = currentPage < totalPages;
      const hasPrevPage = currentPage > 1;
      
      const response = {
        books,
        pagination: {
          totalBooks: count,
          totalPages,
          currentPage,
          limit,
          offset,
          hasNextPage,
          hasPrevPage,
          nextPageOffset: hasNextPage ? offset + limit : null,
          prevPageOffset: hasPrevPage ? Math.max(0, offset - limit) : null
        }
      };
      
      console.log(`Sending response for category "${category}" with pagination:`, {
        totalBooks: count,
        totalPages,
        currentPage,
        limit,
        offset,
        hasNextPage,
        hasPrevPage
      });
      
      res.json(response);
    } catch (error) {
      console.error(`Error fetching books for category:`, error);
      res.status(500).json({ error: "Failed to fetch books for category" });
    }
  });

  // Get trending books
  app.get("/api/books/trending", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const books = await storage.getTrendingBooks(limit);
      res.json(books);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch trending books" });
    }
  });

  // Get most purchased books
  app.get("/api/books/most-purchased", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const books = await storage.getMostPurchasedBooks(limit);
      res.json(books);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch most purchased books" });
    }
  });

  // Search books with pagination
  app.get("/api/books/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ error: "Search query is required" });
      }
      
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      
      const books = await storage.searchBooks(query, limit, offset);
      
      // Get total count for pagination
      const count = await storage.searchBooksCount(query);
      
      // Calculate pagination info
      const totalPages = Math.ceil(count / limit);
      const currentPage = Math.floor(offset / limit) + 1;
      const hasNextPage = currentPage < totalPages;
      const hasPrevPage = currentPage > 1;
      
      res.json({
        books,
        pagination: {
          totalBooks: count,
          totalPages,
          currentPage,
          limit,
          offset,
          hasNextPage,
          hasPrevPage,
          nextPageOffset: hasNextPage ? offset + limit : null,
          prevPageOffset: hasPrevPage ? Math.max(0, offset - limit) : null
        }
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to search books" });
    }
  });

  // Get book details
  app.get("/api/books/:id", async (req, res) => {
    try {
      const bookId = parseInt(req.params.id);
      const book = await storage.getBook(bookId);
      
      if (!book) {
        return res.status(404).json({ error: "Book not found" });
      }
      
      // Check if the book is saved by the current user
      let isSaved = false;
      if (req.isAuthenticated()) {
        isSaved = await storage.isBookSaved(req.user.id, bookId);
      }
      
      res.json({ ...book, isSaved });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch book details" });
    }
  });

  // Get book comments
  app.get("/api/books/:id/comments", async (req, res) => {
    try {
      const bookId = parseInt(req.params.id);
      const comments = await storage.getBookComments(bookId);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch book comments" });
    }
  });

  // Add book comment
  app.post("/api/books/:id/comments", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "You must be logged in to post comments" });
    }
    
    try {
      const bookId = parseInt(req.params.id);
      const validatedData = insertBookCommentSchema.parse({
        ...req.body,
        userId: req.user.id,
        bookId
      });
      
      const comment = await storage.createBookComment(validatedData);
      const user = await storage.getUser(req.user.id);
      
      res.status(201).json({
        ...comment,
        user
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid comment data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to add comment" });
    }
  });

  // Rate a book
  app.post("/api/books/:id/rate", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "You must be logged in to rate books" });
    }
    
    try {
      const bookId = parseInt(req.params.id);
      const validatedData = insertUserRatingSchema.parse({
        userId: req.user.id,
        bookId,
        rating: req.body.rating
      });
      
      // Rating should be between 1 and 5
      if (validatedData.rating < 1 || validatedData.rating > 5) {
        return res.status(400).json({ error: "Rating must be between 1 and 5" });
      }
      
      const rating = await storage.createOrUpdateUserRating(validatedData);
      
      // Get the updated book
      const book = await storage.getBook(bookId);
      
      res.json({
        rating,
        book
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid rating data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to rate book" });
    }
  });

  // Get a specific user's rating for a book
  app.get("/api/books/:id/rating", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "You must be logged in to get your rating" });
    }
    
    try {
      const bookId = parseInt(req.params.id);
      const rating = await storage.getUserRating(req.user.id, bookId);
      res.json(rating || null);
    } catch (error) {
      console.error('Error fetching book rating:', error);
      res.status(500).json({ error: "Failed to get rating" });
    }
  });
  
  // Get all ratings for the current user with book details
  app.get("/api/user/ratings", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "You must be logged in to get your ratings" });
    }
    
    try {
      const ratings = await storage.getUserRatings(req.user.id);
      res.json(ratings);
    } catch (error) {
      console.error("Error fetching user ratings:", error);
      res.status(500).json({ error: "Failed to get user ratings" });
    }
  });

  // Get user's saved books
  app.get("/api/saved-books", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "You must be logged in to view saved books" });
    }
    
    try {
      const books = await storage.getSavedBooks(req.user.id);
      res.json(books);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch saved books" });
    }
  });

  // Save a book
  app.post("/api/books/:id/save", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "You must be logged in to save books" });
    }
    
    try {
      const bookId = parseInt(req.params.id);
      
      // Check if book exists
      const book = await storage.getBook(bookId);
      if (!book) {
        return res.status(404).json({ error: "Book not found" });
      }
      
      // Check if book is already saved
      const isAlreadySaved = await storage.isBookSaved(req.user.id, bookId);
      if (isAlreadySaved) {
        return res.status(400).json({ error: "Book is already saved" });
      }
      
      const validatedData = insertSavedBookSchema.parse({
        userId: req.user.id,
        bookId
      });
      
      const savedBook = await storage.saveBook(validatedData);
      res.status(201).json(savedBook);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to save book" });
    }
  });

  // Remove a saved book
  app.delete("/api/books/:id/save", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "You must be logged in to unsave books" });
    }
    
    try {
      const bookId = parseInt(req.params.id);
      
      await storage.removeSavedBook(req.user.id, bookId);
      res.status(200).json({ message: "Book removed from saved books" });
    } catch (error) {
      res.status(500).json({ error: "Failed to remove book from saved books" });
    }
  });

  // Get personalized book recommendations
  app.get("/api/recommendations", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "You must be logged in to get recommendations" });
    }
    
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const books = await storage.getRecommendedBooks(req.user.id, limit);
      res.json(books);
    } catch (error) {
      console.error("Error in /api/recommendations:", error);
      res.status(500).json({ error: "Failed to fetch recommendations" });
    }
  });
  
  // AI-powered book recommendations using OpenAI
  app.post("/api/ai-recommendations", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "You must be logged in to get AI recommendations" });
    }
    
    try {
      const { preferences, previouslyRead = [] } = req.body;
      
      if (!preferences) {
        return res.status(400).json({ error: "Preferences are required" });
      }
      
      // Generate user profile for more accurate recommendations
      let userProfile = preferences;
      
      // Add information about user's reading history if available
      if (req.user) {
        // Get user's saved and rated books for context
        const [savedBooks, userRatings] = await Promise.all([
          storage.getSavedBooks(req.user.id),
          storage.getUserRatings(req.user.id)
        ]);
        
        // Add user's favorite genres from their saved books
        const genres = savedBooks
          .map(book => book.genre)
          .filter(genre => genre)
          .filter((genre, index, self) => self.indexOf(genre) === index); // Unique genres
        
        if (genres.length > 0) {
          userProfile += ` The user enjoys these genres: ${genres.join(', ')}.`;
        }
        
        // Add information about highly rated books
        const highlyRatedBooks = userRatings
          .filter(rating => rating.rating >= 4)
          .map(rating => rating.book)
          .filter(book => book);
        
        if (highlyRatedBooks.length > 0) {
          const topRatedTitles = highlyRatedBooks
            .slice(0, 3)
            .map(book => `"${book.title}" by ${book.author}`)
            .join(', ');
            
          userProfile += ` The user highly rates these books: ${topRatedTitles}.`;
        }
        
        // Add books user has already read to avoid recommending them
        const readBooks = [...new Set([
          ...previouslyRead,
          ...savedBooks.map(book => `"${book.title}" by ${book.author}`),
          ...highlyRatedBooks.map(book => `"${book.title}" by ${book.author}`)
        ])];
        
        const { recommendations } = await getBookRecommendations(userProfile, readBooks);
        return res.json({ recommendations });
      } else {
        // Fallback if user data isn't available
        const { recommendations } = await getBookRecommendations(preferences, previouslyRead);
        return res.json({ recommendations });
      }
    } catch (error) {
      console.error("Error in /api/ai-recommendations:", error);
      res.status(500).json({ 
        error: "Failed to generate AI recommendations",
        message: error.message || "An unexpected error occurred"
      });
    }
  });

  // Chat with AI assistant
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, message } = req.body;
      
      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Message is required" });
      }
      
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Messages array is required" });
      }
      
      const response = await getChatbotResponse(messages, message);
      
      res.json({ response });
    } catch (error) {
      res.status(500).json({ error: "Failed to get chat response" });
    }
  });



  // Update user profile
  app.patch("/api/user/profile", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "You must be logged in to update profile" });
    }
    
    try {
      const { fullName, email } = req.body;
      
      // Validate email is unique if changing
      if (email && email !== req.user.email) {
        const existingUser = await storage.getUserByEmail(email);
        if (existingUser) {
          return res.status(400).json({ error: "Email is already in use" });
        }
      }
      
      const updatedUser = await storage.updateUser(req.user.id, {
        fullName,
        email
      });
      
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Remove password from returned user
      const { password, ...userWithoutPassword } = updatedUser;
      
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  // Change password
  app.post("/api/user/change-password", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "You must be logged in to change password" });
    }
    
    try {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: "Current password and new password are required" });
      }
      
      // Use the local password functions
      
      // Verify current password
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const isPasswordValid = await comparePasswords(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Current password is incorrect" });
      }
      
      // Update password
      const hashedPassword = await hashPassword(newPassword);
      await storage.updateUser(req.user.id, { password: hashedPassword });
      
      res.json({ message: "Password updated successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to change password" });
    }
  });

  // Request a password reset
  app.post("/api/reset-password", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }
      
      const result = await createPasswordResetToken(email);
      
      if (!result) {
        // Always return success even if the email doesn't exist
        // This prevents user enumeration attacks
        return res.json({ 
          success: true, 
          message: "If an account with that email exists, a password reset link has been sent." 
        });
      }
      
      // For local development, we return the token in the response
      // In production, this would send an email instead
      res.json({ 
        success: true, 
        message: "Password reset request received",
        // Only include this token in development
        token: result.token
      });
    } catch (error) {
      console.error("Password reset error:", error);
      res.status(500).json({ error: "Failed to process password reset" });
    }
  });

  // Verify a password reset token
  app.get("/api/reset-password/:token", async (req, res) => {
    try {
      const { token } = req.params;
      const user = await verifyPasswordResetToken(token);
      
      if (!user) {
        return res.status(400).json({ error: "Invalid or expired reset token" });
      }
      
      // Token is valid
      res.json({ 
        success: true, 
        message: "Token is valid",
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to verify reset token" });
    }
  });

  // Reset password with a valid token
  app.post("/api/reset-password/:token", async (req, res) => {
    try {
      const { token } = req.params;
      const { password } = req.body;
      
      if (!password) {
        return res.status(400).json({ error: "New password is required" });
      }
      
      // Hash the new password
      const hashedPassword = await hashPassword(password);
      
      // Attempt to reset the password
      const success = await resetPassword(token, hashedPassword);
      
      if (!success) {
        return res.status(400).json({ error: "Invalid or expired reset token" });
      }
      
      res.json({ 
        success: true, 
        message: "Password has been reset successfully. You can now log in with your new password." 
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to reset password" });
    }
  });

  // Verify a user account
  app.get("/api/verify/:token", async (req, res) => {
    try {
      const { token } = req.params;
      const success = await verifyUser(token);
      
      if (!success) {
        return res.status(400).json({ error: "Invalid verification token" });
      }
      
      res.json({ 
        success: true, 
        message: "Your account has been verified successfully. You can now log in." 
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to verify account" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
