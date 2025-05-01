import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import BookCard from "@/components/shared/BookCard";
import { useQuery } from "@tanstack/react-query";
import { fetchRecommendedBooks } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";

export default function PersonalizedRecommendations() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  
  const { data: books, isLoading, error } = useQuery({
    queryKey: ["/api/recommendations"],
    queryFn: () => fetchRecommendedBooks(10),
    enabled: !!user, // Only fetch if user is logged in
  });

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef;
      const scrollAmount = direction === "left" ? -300 : 300;
      current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const renderBookCardSkeleton = () => (
    <div className="w-56 flex-shrink-0">
      <Skeleton className="w-full h-72" />
      <div className="p-4">
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-5 w-full mb-1" />
        <Skeleton className="h-4 w-3/4 mb-2" />
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  );

  // Don't render this section if user is not logged in
  if (!user) return null;

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-10">
          <h2 className="font-heading text-3xl font-bold">Recommended For You</h2>
          <div className="flex space-x-2">
            <Button 
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={() => scroll("left")}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button 
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={() => scroll("right")}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <div className="mb-8">
          <p className="text-muted-foreground">Based on your reading history and preferences</p>
        </div>
        
        {/* Scrollable Book Cards */}
        <div className="relative">
          <div 
            ref={scrollContainerRef}
            className="overflow-x-auto pb-6 hide-scrollbar"
          >
            <div className="inline-flex space-x-6 min-w-full">
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <div key={i}>{renderBookCardSkeleton()}</div>
                ))
              ) : error ? (
                <div className="w-full text-center py-10 text-destructive">
                  <p>Failed to load recommendations. Please try again later.</p>
                </div>
              ) : books?.length === 0 ? (
                <div className="w-full text-center py-10 text-muted-foreground">
                  <p>
                    Save some books to get personalized recommendations!{" "}
                    <Link href="/explore">
                      <a className="text-primary font-semibold hover:underline">
                        Explore books
                      </a>
                    </Link>
                  </p>
                </div>
              ) : (
                books?.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
