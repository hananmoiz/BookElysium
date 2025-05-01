import { useState } from "react";
import { Link } from "wouter";
import { Star, StarHalf, Bookmark, BookmarkCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Book } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { saveBook, unsaveBook } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";

interface BookCardProps {
  book: Book & { isSaved?: boolean };
  className?: string;
}

export default function BookCard({ book, className }: BookCardProps) {
  const { id, title, author, rating, ratingCount, genre, isFree, description, cover, isSaved } = book;
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isBookSaved, setIsBookSaved] = useState(isSaved || false);
  const [isSaving, setIsSaving] = useState(false);

  // Fallback cover image
  const coverImage = cover || `https://ui-avatars.com/api/?name=${encodeURIComponent(title)}&size=512&background=random`;

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
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
      // Update book detail query if it exists
      queryClient.invalidateQueries({ queryKey: [`/api/books/${id}`] });
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

  const renderRatingStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`star-${i}`} className="fill-accent text-accent h-4 w-4" />);
    }
    
    if (hasHalfStar) {
      stars.push(<StarHalf key="half-star" className="fill-accent text-accent h-4 w-4" />);
    }
    
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="text-gray-300 h-4 w-4" />);
    }
    
    return stars;
  };

  return (
    <Link href={`/books/${id}`}>
      <div className={cn("book-card w-56 flex-shrink-0", className)}>
        <div className="relative">
          <img 
            src={coverImage} 
            alt={`${title} cover`} 
            className="w-full h-72 object-cover"
            onError={(e) => {
              // If image fails to load, show a fallback
              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(title)}&size=512&background=random`;
            }}
          />
          {isFree && (
            <span className="absolute top-3 right-3 bg-accent text-xs font-bold py-1 px-2 rounded-full">
              FREE
            </span>
          )}
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center p-4">
            <p className="text-white text-sm">
              {description || `Discover "${title}" by ${author}`}
            </p>
          </div>
          <Button
            variant="secondary"
            size="icon"
            className="absolute bottom-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 text-primary"
            onClick={handleToggleSave}
            disabled={isSaving}
          >
            {isBookSaved ? (
              <BookmarkCheck className="h-4 w-4" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </Button>
        </div>
        <div className="p-4">
          <div className="flex items-center mb-2">
            <div className="flex">
              {renderRatingStars()}
            </div>
            <span className="text-sm text-muted-foreground ml-2">
              {rating.toFixed(1)} ({ratingCount})
            </span>
          </div>
          <h3 className="font-bold mb-1 truncate">{title}</h3>
          <p className="text-sm text-muted-foreground mb-2">{author}</p>
          <div className="flex justify-between items-center">
            <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
              {genre || "General"}
            </span>
            <span className="text-sm text-primary font-semibold hover:underline">
              View Details
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
