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
  const [currentRating, setCurrentRating] = useState<number | null>(rating || null);
  const [currentRatingCount, setCurrentRatingCount] = useState(ratingCount || 0);
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
      setCurrentRating(response.book.rating || null);
      setCurrentRatingCount(response.book.ratingCount || 0);
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
                  : (currentRating && value <= currentRating)
                  ? "fill-accent text-accent" 
                  : (currentRating && value - 0.5 <= currentRating)
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
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-accent/30 rounded-lg blur-md opacity-75 group-hover:opacity-100 transition duration-1000"></div>
            <div className="relative">
              <img 
                src={coverImage} 
                alt={`${title} cover`} 
                className="w-full rounded-lg shadow-lg group-hover:shadow-xl transition-all duration-300"
                onError={(e) => {
                  // If image fails to load, show a fallback
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(title)}&size=512&background=random`;
                }}
              />
              {isFree && (
                <Badge className="absolute top-3 right-3 bg-gradient-to-r from-accent to-accent/80 text-white font-bold px-3 py-1 shadow-md">
                  FREE
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="md:w-2/3">
          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-dark">{title}</h1>
          <p className="text-xl text-muted-foreground mb-4">by {author}</p>
          
          <div className="flex items-center mb-4 bg-card p-3 rounded-lg border shadow-sm">
            <div className="flex space-x-1 mr-3">
              {renderRatingStars()}
            </div>
            <span className="text-sm font-medium">
              {currentRating ? (
                <span className="flex items-center">
                  <span className="font-bold text-primary">{currentRating.toFixed(1)}</span>
                  <span className="mx-1 text-muted-foreground">•</span>
                  <span className="text-muted-foreground">{currentRatingCount || 0} ratings</span>
                </span>
              ) : (
                <span className="text-muted-foreground italic">No ratings yet</span>
              )}
            </span>
          </div>
          
          <div className="flex flex-wrap gap-3 mb-6">
            {genre && (
              <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1 font-medium">
                <Tag className="h-3.5 w-3.5" />
                {genre}
              </Badge>
            )}
            {publishDate && (
              <Badge variant="outline" className="flex items-center gap-1 px-3 py-1 font-medium">
                <Calendar className="h-3.5 w-3.5" />
                {publishDate}
              </Badge>
            )}
          </div>
          
          <div className="mb-8 bg-card/50 border rounded-lg p-4 shadow-sm">
            <h3 className="font-semibold text-lg mb-2 flex items-center">
              <span className="bg-primary/10 p-1 rounded-md mr-2">
                <span className="block w-4 h-0.5 bg-primary mb-1"></span>
                <span className="block w-4 h-0.5 bg-primary"></span>
              </span>
              Description
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {description || "No description available for this book."}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Button
              variant={isBookSaved ? "secondary" : "default"}
              className={`rounded-full px-6 py-2 h-auto ${
                isBookSaved 
                  ? "bg-secondary/90 hover:bg-secondary border-secondary" 
                  : "bg-gradient-to-r from-primary to-primary-dark hover:shadow-lg border-0"
              }`}
              disabled={isSaving}
              onClick={handleToggleSave}
            >
              {isBookSaved ? (
                <>
                  <BookmarkCheck className="mr-2 h-5 w-5" />
                  <span className="font-medium">Saved to Library</span>
                </>
              ) : (
                <>
                  <Bookmark className="mr-2 h-5 w-5" />
                  <span className="font-medium">Save to Library</span>
                </>
              )}
            </Button>
            
            {url && (
              <Button
                variant={isFree ? "default" : "outline"}
                className={`rounded-full px-6 py-2 h-auto ${isFree ? "bg-gradient-to-r from-accent to-accent/80 text-white border-0 hover:shadow-lg" : "border-2"}`}
                asChild
              >
                <a href={url} target="_blank" rel="noopener noreferrer">
                  {isFree ? (
                    <>
                      <ExternalLink className="mr-2 h-5 w-5" />
                      <span className="font-medium">Read Now</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      <span className="font-medium">Buy Now</span>
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
