import { useState } from "react";
import { Link } from "wouter";
import { 
  Star, 
  StarHalf, 
  Bookmark, 
  BookmarkCheck, 
  ShoppingCart, 
  ExternalLink, 
  Calendar, 
  Tag 
} from "lucide-react";
import { Book } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { rateBook, saveBook, unsaveBook } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface BookDetailProps {
  book: Book & { isSaved: boolean };
  isLoading?: boolean;
}

export default function BookDetail({ book, isLoading = false }: BookDetailProps) {
  const { 
    id, 
    title, 
    author, 
    description, 
    cover, 
    rating, 
    ratingCount, 
    genre, 
    isFree, 
    publishDate, 
    url, 
    isSaved 
  } = book || {};
  
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [isRating, setIsRating] = useState(false);
  const [isBookSaved, setIsBookSaved] = useState(isSaved);
  const [currentRating, setCurrentRating] = useState(rating);
  const [currentRatingCount, setCurrentRatingCount] = useState(ratingCount);
  const [hoveredRating, setHoveredRating] = useState(0);

  // Fallback cover image
  const coverImage = cover || `https://ui-avatars.com/api/?name=${encodeURIComponent(title || "Book Title")}&size=512&background=random`;

  const handleToggleSave = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to save books",
        variant: "destructive",
      });
      return;
    }
    
    setIsSaving(true);
    try {
      if (isBookSaved) {
        await unsaveBook(id);
        setIsBookSaved(false);
        toast({
          title: "Book removed",
          description: `"${title}" has been removed from your saved books`,
        });
      } else {
        await saveBook(id);
        setIsBookSaved(true);
        toast({
          title: "Book saved",
          description: `"${title}" has been added to your saved books`,
        });
      }
      // Invalidate saved books query
      queryClient.invalidateQueries({ queryKey: ["/api/saved-books"] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update saved status",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRating = async (value: number) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to rate books",
        variant: "destructive",
      });
      return;
    }
    
    setIsRating(true);
    try {
      const response = await rateBook(id, value);
      setCurrentRating(response.book.rating);
      setCurrentRatingCount(response.book.ratingCount);
      toast({
        title: "Rating submitted",
        description: `You've rated "${title}" with ${value} stars`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit rating",
        variant: "destructive",
      });
    } finally {
      setIsRating(false);
      setHoveredRating(0);
    }
  };

  const renderRatingStars = () => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            disabled={isRating}
            onClick={() => handleRating(value)}
            onMouseEnter={() => setHoveredRating(value)}
            onMouseLeave={() => setHoveredRating(0)}
            className="focus:outline-none disabled:opacity-70"
          >
            <Star 
              className={`h-6 w-6 ${
                hoveredRating >= value 
                  ? "fill-accent text-accent" 
                  : value <= currentRating 
                  ? "fill-accent text-accent" 
                  : value - 0.5 <= currentRating 
                  ? "fill-accent text-accent" 
                  : "text-gray-300"
              }`} 
            />
          </button>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/3">
            <Skeleton className="w-full aspect-[2/3] rounded-lg" />
          </div>
          <div className="md:w-2/3 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-1/4" />
            <div className="flex space-x-2 pt-2">
              <Skeleton className="h-6 w-6" />
              <Skeleton className="h-6 w-6" />
              <Skeleton className="h-6 w-6" />
              <Skeleton className="h-6 w-6" />
              <Skeleton className="h-6 w-6" />
            </div>
            <Skeleton className="h-4 w-1/3" />
            <div className="space-y-2 pt-4">
              <Skeleton className="h-20 w-full" />
            </div>
            <div className="flex space-x-3 pt-4">
              <Skeleton className="h-10 w-32 rounded-full" />
              <Skeleton className="h-10 w-32 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3">
          <div className="relative">
            <img 
              src={coverImage} 
              alt={`${title} cover`} 
              className="w-full rounded-lg shadow-lg"
              onError={(e) => {
                // If image fails to load, show a fallback
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(title)}&size=512&background=random`;
              }}
            />
            {isFree && (
              <Badge className="absolute top-3 right-3 bg-accent text-foreground">
                FREE
              </Badge>
            )}
          </div>
        </div>
        
        <div className="md:w-2/3">
          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2">{title}</h1>
          <p className="text-xl text-muted-foreground mb-4">by {author}</p>
          
          <div className="flex items-center mb-4">
            <div className="flex space-x-1 mr-3">
              {renderRatingStars()}
            </div>
            <span className="text-sm text-muted-foreground">
              {currentRating.toFixed(1)} ({currentRatingCount} ratings)
            </span>
          </div>
          
          <div className="flex flex-wrap gap-3 mb-6">
            {genre && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Tag className="h-3 w-3" />
                {genre}
              </Badge>
            )}
            {publishDate && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {publishDate}
              </Badge>
            )}
          </div>
          
          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-2">Description</h3>
            <p className="text-muted-foreground">
              {description || "No description available for this book."}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Button
              variant={isBookSaved ? "secondary" : "default"}
              className="rounded-full"
              disabled={isSaving}
              onClick={handleToggleSave}
            >
              {isBookSaved ? (
                <>
                  <BookmarkCheck className="mr-2 h-5 w-5" />
                  Saved
                </>
              ) : (
                <>
                  <Bookmark className="mr-2 h-5 w-5" />
                  Save Book
                </>
              )}
            </Button>
            
            {url && (
              <Button
                variant="outline"
                className="rounded-full"
                asChild
              >
                <a href={url} target="_blank" rel="noopener noreferrer">
                  {isFree ? (
                    <>
                      <ExternalLink className="mr-2 h-5 w-5" />
                      Read Now
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Buy Now
                    </>
                  )}
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
