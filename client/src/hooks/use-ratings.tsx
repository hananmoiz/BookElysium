import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Types
export interface UserRating {
  id: number;
  userId: number;
  bookId: number;
  rating: number;
  createdAt: string;
}

export interface UserRatingWithBook extends UserRating {
  book?: {
    id: number;
    title: string;
    author: string;
    cover: string | null;
  };
}

// Get user ratings with a custom hook
export function useUserRatings(userId?: number) {
  const { toast } = useToast();
  const [sortBy, setSortBy] = useState<"recent" | "highest" | "lowest">("recent");
  
  // Query user ratings
  const { 
    data: ratingsData,
    isLoading,
    error
  } = useQuery({
    queryKey: ["/api/user/ratings", sortBy],
    enabled: !!userId,
    // @ts-ignore
    onError: (err: Error) => {
      toast({
        title: "Error loading ratings",
        description: err.message,
        variant: "destructive",
      });
    }
  });
  
  // Process and sort ratings
  const ratings = ratingsData || [];
  
  const sortedRatings = [...ratings].sort((a, b) => {
    if (sortBy === "recent") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sortBy === "highest") {
      return b.rating - a.rating;
    } else {
      return a.rating - b.rating;
    }
  });
  
  return {
    ratings: sortedRatings,
    isLoading,
    error,
    sortBy,
    setSortBy,
  };
}

// Hook for rating a book
export function useRateBook() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ 
      bookId, 
      rating 
    }: { 
      bookId: number, 
      rating: number 
    }) => {
      const res = await apiRequest("POST", `/api/books/${bookId}/rate`, { rating });
      return await res.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: [`/api/books/${variables.bookId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/ratings"] });
      
      toast({
        title: "Rating submitted",
        description: "Thank you for your rating!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Rating failed",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    }
  });
}

// Hook to get a user's rating for a specific book
export function useBookRating(userId?: number, bookId?: number) {
  const { toast } = useToast();
  
  const {
    data,
    isLoading,
    error
  } = useQuery({
    queryKey: [`/api/books/${bookId}/user-rating`],
    enabled: !!userId && !!bookId,
  });
  
  // Find the rating in the user's ratings
  const userRating = data?.find?.(rating => rating.bookId === bookId);
  
  return {
    rating: userRating?.rating || 0,
    isLoading,
    error,
  };
}