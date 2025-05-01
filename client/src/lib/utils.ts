import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class names and applies Tailwind's merging
 * This is useful for combining conditional classes with base classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date in a more readable format
 */
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Truncates text to a specified length and adds an ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

/**
 * Generates a random string of specified length
 */
export function generateRandomString(length: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Calculates reading time based on word count
 * Average reading speed: 200 words per minute
 */
export function calculateReadingTime(text: string): string {
  if (!text) return "0 min read";
  const words = text.split(/\s+/).length;
  const minutes = Math.ceil(words / 200);
  return `${minutes} min read`;
}

/**
 * Debounce function to limit how often a function can be called
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}