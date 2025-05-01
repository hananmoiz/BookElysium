import { useUserRatings } from "@/hooks/use-ratings";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

// Simple star rating display component
function StarRating({ value, readOnly = false }: { value: number, readOnly?: boolean }) {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`h-4 w-4 ${
            star <= value ? "text-yellow-400 fill-current" : "text-gray-300 fill-current"
          }`}
          viewBox="0 0 24 24"
        >
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      ))}
    </div>
  );
}

export function UserRatings() {
  const { data: ratings, isLoading, error } = useUserRatings();
  const [_, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6 text-center">
        <p className="text-destructive">Error loading your ratings</p>
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()} 
          className="mt-2"
        >
          Try again
        </Button>
      </div>
    );
  }

  if (!ratings || ratings.length === 0) {
    return (
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle>Your Book Ratings</CardTitle>
          <CardDescription>You haven't rated any books yet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">
              Rate books to track your reading preferences and get better recommendations
            </p>
            <Button onClick={() => navigate("/explore")}>
              Explore Books
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort ratings by rating value, highest first
  const sortedRatings = [...ratings].sort((a, b) => b.rating - a.rating);

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle>Your Book Ratings</CardTitle>
        <CardDescription>Books you've rated ({ratings.length})</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[450px] pr-4">
          <div className="space-y-4">
            {sortedRatings.map((rating) => (
              <div key={rating.id} className="flex items-start space-x-4 border-b pb-4">
                {rating.book ? (
                  <>
                    <Avatar 
                      className="h-16 w-12 rounded-md cursor-pointer"
                      onClick={() => navigate(`/books/${rating.bookId}`)}
                    >
                      <AvatarImage 
                        src={rating.book.cover || undefined} 
                        alt={rating.book.title} 
                        className="object-cover" 
                      />
                      <AvatarFallback className="rounded-md text-xs">
                        {rating.book.title.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between">
                        <h4 
                          className="font-medium hover:text-primary cursor-pointer"
                          onClick={() => navigate(`/books/${rating.bookId}`)}
                        >
                          {rating.book.title}
                        </h4>
                        <span className="text-xs text-muted-foreground">
                          {new Date(rating.ratedAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        by {rating.book.author}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <StarRating value={rating.rating} readOnly />
                        {rating.book.genre && (
                          <Badge variant="outline" className="ml-2">
                            {rating.book.genre}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1">
                    <p className="text-muted-foreground">Book details unavailable</p>
                    <StarRating value={rating.rating} readOnly />
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}