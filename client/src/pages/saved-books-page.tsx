import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import { fetchSavedBooks } from "@/lib/api";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import BookCard from "@/components/shared/BookCard";
import ChatAssistant from "@/components/shared/ChatAssistant";
import { Bookmark, BookOpen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function SavedBooksPage() {
  const { data: books, isLoading, error } = useQuery({
    queryKey: ["/api/saved-books"],
    queryFn: fetchSavedBooks
  });
  
  const renderBookCardSkeleton = () => (
    <div className="w-full">
      <Skeleton className="w-full aspect-[3/4]" />
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
  
  return (
    <>
      <Helmet>
        <title>Saved Books - Bookverse</title>
        <meta name="description" content="View and manage your saved books collection on Bookverse." />
      </Helmet>
      
      <div className="flex flex-col min-h-screen">
        <Navbar />
        
        <main className="flex-grow py-12 bg-background">
          <div className="container mx-auto px-4">
            <div className="flex items-center mb-8">
              <Bookmark className="mr-2 h-6 w-6 text-primary" />
              <h1 className="font-heading text-3xl font-bold">Saved Books</h1>
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {Array(10).fill(0).map((_, i) => (
                  <div key={i}>{renderBookCardSkeleton()}</div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <h2 className="text-xl font-bold text-destructive mb-2">Error Loading Saved Books</h2>
                <p className="text-muted-foreground">
                  Sorry, we couldn't load your saved books. Please try again later.
                </p>
              </div>
            ) : books?.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-bold mb-2">No books saved yet</h2>
                <p className="text-muted-foreground mb-6">
                  Browse our collection and save books you're interested in reading.
                </p>
                <Button asChild>
                  <Link href="/explore">
                    Explore Books
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {books?.map((book) => (
                  <BookCard key={book.id} book={{ ...book, isSaved: true }} />
                ))}
              </div>
            )}
          </div>
        </main>
        
        <Footer />
      </div>
      
      <ChatAssistant />
    </>
  );
}
