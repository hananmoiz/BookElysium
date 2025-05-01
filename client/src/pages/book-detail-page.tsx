import { useEffect } from "react";
import { useRoute } from "wouter";
import { Helmet } from "react-helmet";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import BookDetail from "@/components/book/BookDetail";
import ChatAssistant from "@/components/shared/ChatAssistant";

export default function BookDetailPage() {
  const [match, params] = useRoute("/books/:id");
  const bookId = params?.id ? parseInt(params.id) : 0;
  
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
        <title>Book Details - Bookverse</title>
        <meta 
          name="description" 
          content="View book details, ratings, and reviews on Bookverse." 
        />
      </Helmet>
      
      <div className="flex flex-col min-h-screen">
        <Navbar />
        
        <main className="flex-grow py-12 bg-background">
          <div className="container mx-auto px-4">
            <BookDetail bookId={bookId} />
          </div>
        </main>
        
        <Footer />
      </div>
      
      <ChatAssistant />
    </>
  );
}
