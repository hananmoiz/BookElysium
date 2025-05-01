import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate a newsletter subscription
    setTimeout(() => {
      toast({
        title: "Subscribed!",
        description: "You've successfully subscribed to our newsletter.",
      });
      setEmail("");
      setIsSubmitting(false);
    }, 1000);
  };
  
  return (
    <section className="py-16 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto text-white">
          <h2 className="font-heading text-3xl font-bold mb-4">Join Our Newsletter</h2>
          <p className="mb-8 opacity-90">Subscribe to get updates on new book releases, exclusive deals, and reading recommendations.</p>
          
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
            <Input
              type="email"
              placeholder="Your email address"
              className="flex-grow px-4 py-3 rounded-full focus:outline-none text-foreground"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button 
              type="submit" 
              className="px-6 py-3 bg-accent text-foreground font-semibold rounded-full hover:bg-accent/90 transition-colors"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Subscribing..." : "Subscribe"}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
