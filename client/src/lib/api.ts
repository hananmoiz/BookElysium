import { Book, BookComment, Category, InsertBookComment } from "@shared/schema";
import { apiRequest } from "./queryClient";

// Pagination types
export interface PaginationData {
  totalBooks: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  offset: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPageOffset: number | null;
  prevPageOffset: number | null;
}

export interface PaginatedResponse<T> {
  books: T[];
  pagination: PaginationData;
}

// Book related API functions
export async function fetchCategories(): Promise<Category[]> {
  const response = await apiRequest("GET", "/api/categories");
  return response.json();
}

export async function fetchBooks(limit = 20, offset = 0): Promise<PaginatedResponse<Book>> {
  const response = await apiRequest("GET", `/api/books?limit=${limit}&offset=${offset}`);
  return response.json();
}

export async function fetchBooksByCategory(category: string, limit = 10, offset = 0): Promise<PaginatedResponse<Book>> {
  console.log(`Fetching books for category: ${category}, limit: ${limit}, offset: ${offset}`);
  const url = `/api/books/category/${encodeURIComponent(category)}?limit=${limit}&offset=${offset}`;
  console.log(`API URL: ${url}`);
  
  try {
    const response = await apiRequest("GET", url);
    const data = await response.json();
    console.log("Category API response:", data);
    return data;
  } catch (error) {
    console.error("Error fetching books by category:", error);
    throw error;
  }
}

export async function fetchTrendingBooks(limit = 10): Promise<Book[]> {
  const response = await apiRequest("GET", `/api/books/trending?limit=${limit}`);
  return response.json();
}

export async function fetchMostPurchasedBooks(limit = 10): Promise<Book[]> {
  const response = await apiRequest("GET", `/api/books/most-purchased?limit=${limit}`);
  return response.json();
}

export async function fetchRecommendedBooks(limit = 10): Promise<Book[]> {
  const response = await apiRequest("GET", `/api/recommendations?limit=${limit}`);
  return response.json();
}

export async function searchBooks(query: string, limit = 20, offset = 0): Promise<PaginatedResponse<Book>> {
  const response = await apiRequest("GET", `/api/books/search?q=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}`);
  return response.json();
}

export async function fetchBookDetails(id: number): Promise<Book & { isSaved: boolean }> {
  const response = await apiRequest("GET", `/api/books/${id}`);
  return response.json();
}

export async function fetchBookComments(bookId: number): Promise<(BookComment & { user: { username: string, fullName?: string } })[]> {
  const response = await apiRequest("GET", `/api/books/${bookId}/comments`);
  return response.json();
}

export async function addBookComment(bookId: number, comment: string): Promise<BookComment & { user: { username: string, fullName?: string } }> {
  const response = await apiRequest("POST", `/api/books/${bookId}/comments`, { comment });
  return response.json();
}

export async function rateBook(bookId: number, rating: number): Promise<{ rating: number, book: Book }> {
  const response = await apiRequest("POST", `/api/books/${bookId}/rate`, { rating });
  return response.json();
}

export async function saveBook(bookId: number): Promise<void> {
  await apiRequest("POST", `/api/books/${bookId}/save`);
}

export async function unsaveBook(bookId: number): Promise<void> {
  await apiRequest("DELETE", `/api/books/${bookId}/save`);
}

export async function fetchSavedBooks(): Promise<Book[]> {
  const response = await apiRequest("GET", `/api/saved-books`);
  return response.json();
}

// User profile related API functions
export async function updateUserProfile(data: { fullName?: string, email?: string }): Promise<void> {
  await apiRequest("PATCH", `/api/user/profile`, data);
}

export async function changePassword(data: { currentPassword: string, newPassword: string }): Promise<void> {
  await apiRequest("POST", `/api/user/change-password`, data);
}
