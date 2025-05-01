import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { StarRating } from "./StarRating";
import { BookRatingWidget } from "./BookRatingWidget";
import BookComments from "./BookComments";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Heart, BookOpen, Clock, Share2, ArrowLeft, Star, ThumbsUp } from "lucide-react";
import { formatDate, calculateReadingTime, truncateText } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { rateBook } from "@/lib/api";

interface BookDetailProps {
  bookId: number;
}

export default function BookDetail({ bookId }: BookDetailProps) {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [showRatingWidget, setShowRatingWidget] = useState(false);
  
  // Get book details
  const { data: book, isLoading: isBookLoading } = useQuery({
    queryKey: [`/api/books/${bookId}`],
  });
  
  // Check if book is saved by user
  const { data: savedStatus } = useQuery({
    queryKey: [`/api/books/${bookId}/saved`],
    enabled: !!user,
  });
  
  // Set saved status when data is loaded
  useState(() => {
    if (savedStatus) {
      setIsSaved(savedStatus.isSaved);
    }
  });
  
  // Save or unsave book
  const toggleSaveBook = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to save books",
        variant: "destructive",
      });
      setLocation("/auth");
      return;
    }
    
    try {
      if (isSaved) {
        // Unsave book
        await fetch(`/api/books/${bookId}/save`, {
          method: "DELETE",
          credentials: "include",
        });
        setIsSaved(false);
        toast({
          title: "Book removed",
          description: "Book removed from your saved list",
        });
      } else {
        // Save book
        await fetch(`/api/books/${bookId}/save`, {
          method: "POST",
          credentials: "include",
        });
        setIsSaved(true);
        toast({
          title: "Book saved",
          description: "Book added to your saved list",
        });
      }
    } catch (error) {
      toast({
        title: "Action failed",
        description: "Failed to update saved status",
        variant: "destructive",
      });
    }
  };
  
  // Handle book reading
  const readBook = () => {
    if (book?.url) {
      window.open(book.url, "_blank");
    } else {
      toast({
        title: "Book not available",
        description: "This book is not available for reading online",
        variant: "destructive",
      });
    }
  };
  
  // Handle rating button click
  const handleRateClick = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to rate books",
        variant: "destructive",
      });
      setLocation("/auth");
      return;
    }
    
    setShowRatingWidget(prev => !prev);
  };
  
  // Loading skeleton
  if (isBookLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-3/4 bg-gray-200 rounded"></div>
        <div className="flex space-x-4">
          <div className="h-48 w-32 bg-gray-200 rounded"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
            <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
            <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    );
  }
  
  if (!book) {
    return <div>Book not found</div>;
  }
  
  // Estimate reading time
  const readingTime = calculateReadingTime(book.description || "");

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button
        variant="ghost"
        className="flex items-center text-muted-foreground hover:text-foreground"
        onClick={() => window.location.href = "/explore"}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to books
      </Button>
      
      {/* Book header */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Book cover */}
        <motion.div 
          className="w-full lg:w-1/3 xl:w-1/4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="relative aspect-[2/3] overflow-hidden rounded-lg shadow-lg">
            {book.cover ? (
              <img
                src={book.cover}
                alt={book.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                <span className="text-slate-400 text-lg">{book.title}</span>
              </div>
            )}
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-2 mt-4">
            <Button
              className="flex-1"
              variant={book.isFree ? "default" : "outline"}
              onClick={readBook}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              {book.isFree ? "Read Free" : "Preview"}
            </Button>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className={isSaved ? "text-red-500" : ""}
                    onClick={toggleSaveBook}
                  >
                    <Heart className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isSaved ? "Remove from saved" : "Save book"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast({
                      title: "Link copied",
                      description: "Book link copied to clipboard",
                    });
                  }}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Share book</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </motion.div>
        
        {/* Book details */}
        <motion.div 
          className="flex-1"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <h1 className="text-3xl font-bold">{book.title}</h1>
          
          <div className="flex items-center gap-2 mt-2">
            <p className="text-lg text-muted-foreground">By {book.author}</p>
          </div>
          
          <div className="flex items-center mt-2 gap-4">
            <div className="flex items-center">
              <StarRating value={book.rating || 0} readOnly showValue />
              <span className="text-sm text-muted-foreground ml-2">
                ({book.ratingCount || 0} ratings)
              </span>
            </div>
            
            <Button variant="link" className="p-0 h-auto" onClick={handleRateClick}>
              Rate this book
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4">
            {book.genre && (
              <Badge variant="outline">{book.genre}</Badge>
            )}
            
            {book.publishDate && (
              <Badge variant="outline">
                Published: {formatDate(book.publishDate)}
              </Badge>
            )}
            
            {book.description && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mr-1" />
                {readingTime}
              </div>
            )}
          </div>
          
          <Separator className="my-4" />
          
          <div className="prose prose-slate max-w-none dark:prose-invert">
            <h3 className="text-xl font-medium">About this book</h3>
            <p>{book.description || "No description available."}</p>
          </div>
        </motion.div>
      </div>
      
      {/* Rating widget */}
      {showRatingWidget && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="my-8"
        >
          <BookRatingWidget bookId={book.id} title={book.title} />
        </motion.div>
      )}
      
      <Separator className="my-8" />
      
      {/* Book comments */}
      <BookComments bookId={book.id} />
    </div>
  );
}