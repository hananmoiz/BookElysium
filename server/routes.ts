import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { getChatbotResponse, getBookRecommendations } from "./openai";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

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

  // Get books with optional limit and offset
  app.get("/api/books", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      const books = await storage.getBooks(limit, offset);
      res.json(books);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch books" });
    }
  });

  // Get books by category
  app.get("/api/books/category/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      const books = await storage.getBooksByCategory(category, limit, offset);
      res.json(books);
    } catch (error) {
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

  // Search books
  app.get("/api/books/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ error: "Search query is required" });
      }
      
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      
      const books = await storage.searchBooks(query, limit, offset);
      res.json(books);
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
      res.status(500).json({ error: "Failed to fetch recommendations" });
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

  // Get AI book recommendations
  app.post("/api/ai-recommendations", async (req, res) => {
    try {
      const { preferences, previouslyRead } = req.body;
      
      if (!preferences || typeof preferences !== "string") {
        return res.status(400).json({ error: "Preferences are required" });
      }
      
      const recommendations = await getBookRecommendations(
        preferences,
        previouslyRead || []
      );
      
      res.json(recommendations);
    } catch (error) {
      res.status(500).json({ error: "Failed to get AI recommendations" });
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

  const httpServer = createServer(app);
  return httpServer;
}
