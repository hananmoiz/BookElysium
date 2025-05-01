import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { InsertUserRating, UserRating, Book } from "@shared/schema";

export interface RatingWithBook extends UserRating {
  book?: Book;
}

// Hook to get a user's ratings for all books
export function useUserRatings() {
  return useQuery<RatingWithBook[]>({
    queryKey: ["/api/user/ratings"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Hook to get a user's rating for a specific book
export function useBookRating(bookId: number) {
  return useQuery<UserRating | null>({
    queryKey: ["/api/books", bookId, "rating"],
    enabled: !!bookId,
  });
}

// Hook to rate a book
export function useRateBook() {
  return useMutation({
    mutationFn: async ({ bookId, rating }: { bookId: number; rating: number }) => {
      const response = await fetch(`/api/books/${bookId}/rate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rating }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to rate book");
      }
      
      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate the book rating and all user ratings
      queryClient.invalidateQueries({ queryKey: ["/api/books", variables.bookId, "rating"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/ratings"] });
      
      // Also invalidate the book itself since its overall rating has changed
      queryClient.invalidateQueries({ queryKey: ["/api/books", variables.bookId] });
      
      // Invalidate recommendations as they might change based on ratings
      queryClient.invalidateQueries({ queryKey: ["/api/recommendations"] });
    },
  });
}