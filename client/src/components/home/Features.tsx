import { BookOpen, Bot, BarChart3 } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export default function Features() {
  const { user } = useAuth();
  
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="font-heading text-3xl font-bold mb-12 text-center">Why Choose Bookverse?</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="feature-card">
            <div className="bg-primary bg-opacity-10 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6">
              <BookOpen className="text-primary text-3xl" />
            </div>
            <h3 className="font-bold text-xl mb-4">Vast Library</h3>
            <p className="text-muted-foreground">Access thousands of books across all genres, both free and premium options.</p>
          </div>
          
          <div className="feature-card">
            <div className="bg-secondary bg-opacity-10 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6">
              <BarChart3 className="text-secondary text-3xl" />
            </div>
            <h3 className="font-bold text-xl mb-4">Smart Recommendations</h3>
            <p className="text-muted-foreground">Our AI-powered system learns your preferences to suggest books you'll love.</p>
          </div>
          
          <div className="feature-card">
            <div className="bg-accent bg-opacity-10 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6">
              <Bot className="text-accent text-3xl" />
            </div>
            <h3 className="font-bold text-xl mb-4">AI Reading Assistant</h3>
            <p className="text-muted-foreground">Get book suggestions, summaries, and answers to your questions with our ChatGPT-powered assistant.</p>
          </div>
        </div>
        
        <div className="mt-16 text-center">
          {user ? (
            <Button asChild className="px-8 py-4 bg-primary text-white font-semibold rounded-full hover:bg-primary/90">
              <Link href="/explore">
                Start Reading Today
              </Link>
            </Button>
          ) : (
            <Button asChild className="px-8 py-4 bg-primary text-white font-semibold rounded-full hover:bg-primary/90">
              <Link href="/auth">
                Start Reading Today
              </Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
