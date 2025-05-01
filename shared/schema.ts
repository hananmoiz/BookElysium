import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const books = pgTable("books", {
  id: serial("id").primaryKey(),
  olid: text("olid").notNull().unique(), // Open Library ID
  title: text("title").notNull(),
  author: text("author").notNull(),
  description: text("description"),
  cover: text("cover"),
  rating: real("rating").default(0),
  ratingCount: integer("rating_count").default(0),
  genre: text("genre"),
  isFree: boolean("is_free").default(false),
  publishDate: text("publish_date"),
  url: text("url"),
});

export const savedBooks = pgTable("saved_books", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  bookId: integer("book_id").notNull().references(() => books.id),
  savedAt: timestamp("saved_at").defaultNow().notNull(),
});

export const bookComments = pgTable("book_comments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  bookId: integer("book_id").notNull().references(() => books.id),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userRatings = pgTable("user_ratings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  bookId: integer("book_id").notNull().references(() => books.id),
  rating: integer("rating").notNull(),
  ratedAt: timestamp("rated_at").defaultNow().notNull(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  icon: text("icon"),
  color: text("color"),
  bookCount: integer("book_count").default(0),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
});

export const insertBookSchema = createInsertSchema(books).omit({
  id: true,
});

export const insertSavedBookSchema = createInsertSchema(savedBooks).omit({
  id: true,
  savedAt: true,
});

export const insertBookCommentSchema = createInsertSchema(bookComments).omit({
  id: true,
  createdAt: true,
});

export const insertUserRatingSchema = createInsertSchema(userRatings).omit({
  id: true,
  ratedAt: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
});

// Login schema
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertBook = z.infer<typeof insertBookSchema>;
export type InsertSavedBook = z.infer<typeof insertSavedBookSchema>;
export type InsertBookComment = z.infer<typeof insertBookCommentSchema>;
export type InsertUserRating = z.infer<typeof insertUserRatingSchema>;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type LoginData = z.infer<typeof loginSchema>;

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  savedBooks: many(savedBooks),
  bookComments: many(bookComments),
  userRatings: many(userRatings),
}));

export const booksRelations = relations(books, ({ many }) => ({
  savedBooks: many(savedBooks),
  bookComments: many(bookComments),
  userRatings: many(userRatings),
}));

export const savedBooksRelations = relations(savedBooks, ({ one }) => ({
  user: one(users, {
    fields: [savedBooks.userId],
    references: [users.id],
  }),
  book: one(books, {
    fields: [savedBooks.bookId],
    references: [books.id],
  }),
}));

export const bookCommentsRelations = relations(bookComments, ({ one }) => ({
  user: one(users, {
    fields: [bookComments.userId],
    references: [users.id],
  }),
  book: one(books, {
    fields: [bookComments.bookId],
    references: [books.id],
  }),
}));

export const userRatingsRelations = relations(userRatings, ({ one }) => ({
  user: one(users, {
    fields: [userRatings.userId],
    references: [users.id],
  }),
  book: one(books, {
    fields: [userRatings.bookId],
    references: [books.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type Book = typeof books.$inferSelect;
export type SavedBook = typeof savedBooks.$inferSelect;
export type BookComment = typeof bookComments.$inferSelect;
export type UserRating = typeof userRatings.$inferSelect;
export type Category = typeof categories.$inferSelect;
