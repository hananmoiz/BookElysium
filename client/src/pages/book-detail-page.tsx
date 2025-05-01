import { useEffect } from "react";
import { useRoute } from "wouter";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import { fetchBookDetails, fetchBookComments } from "@/lib/api";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import BookDetail from "@/components/book/BookDetail";
import BookComments from "@/components/book/BookComments";
import ChatAssistant from "@/components/shared/ChatAssistant";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

export default function BookDetailPage() {
  const [match, params] = useRoute("/books/:id");
  const bookId = params?.id ? parseInt(params.id) : 0;
  
  const { 
    data: book, 
    isLoading: bookLoading, 
    error: bookError 
  } = useQuery({
    queryKey: [`/api/books/${bookId}`],
    queryFn: () => fetchBookDetails(bookId),
    enabled: !!bookId,
  });
  
  const { 
    data: comments, 
    isLoading: commentsLoading 
  } = useQuery({
    queryKey: [`/api/books/${bookId}/comments`],
    queryFn: () => fetchBookComments(bookId),
    enabled: !!bookId,
  });
  
  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [bookId]);
  
  if (!match) {
    return null; // Let the 404 handler take care of it
  }
  
  return (
    <>
      <Helmet>
        <title>{bookLoading ? "Loading Book..." : book ? `${book.title} by ${book.author}` : "Book Not Found"} - Bookverse</title>
        <meta 
          name="description" 
          content={book?.description || "View book details, ratings, and reviews on Bookverse."} 
        />
      </Helmet>
      
      <div className="flex flex-col min-h-screen">
        <Navbar />
        
        <main className="flex-grow py-12 bg-background">
          <div className="container mx-auto px-4">
            {bookError ? (
              <div className="text-center py-16">
                <h1 className="text-2xl font-bold text-destructive mb-2">Error Loading Book</h1>
                <p className="text-muted-foreground">
                  Sorry, we couldn't load the book details. Please try again later.
                </p>
              </div>
            ) : (
              <>
                <BookDetail book={book!} isLoading={bookLoading} />
                
                <Separator className="my-12" />
                
                <Tabs defaultValue="comments" className="w-full max-w-4xl mx-auto">
                  <TabsList className="w-full justify-start mb-6">
                    <TabsTrigger value="comments">Comments</TabsTrigger>
                    <TabsTrigger value="related">Related Books</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="comments">
                    <BookComments 
                      bookId={bookId} 
                      comments={comments || []} 
                      isLoading={commentsLoading} 
                    />
                  </TabsContent>
                  
                  <TabsContent value="related">
                    <div className="py-8 text-center">
                      <p className="text-muted-foreground">
                        Related books feature coming soon!
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </div>
        </main>
        
        <Footer />
      </div>
      
      <ChatAssistant />
    </>
  );
}
