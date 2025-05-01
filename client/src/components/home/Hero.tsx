import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export default function Hero() {
  const { user } = useAuth();
  
  return (
    <section className="relative bg-gradient-to-r from-primary to-secondary text-white py-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-12 md:mb-0">
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Discover Your Next Great Adventure
            </h1>
            <p className="text-lg md:text-xl mb-8 opacity-90">
              Explore thousands of books - from bestsellers to hidden gems, all in one place. Find your perfect read today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild className="px-6 py-6 bg-accent text-foreground font-semibold rounded-full hover:bg-accent/90">
                <Link href="/explore">
                  Explore Books
                </Link>
              </Button>
              {!user && (
                <Button asChild className="px-6 py-6 bg-transparent border-2 border-white font-semibold rounded-full hover:bg-white hover:text-primary">
                  <Link href="/auth">
                    Sign Up Free
                  </Link>
                </Button>
              )}
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center md:justify-end">
            <div className="relative w-80 h-96">
              {/* Book stack visualization */}
              <img 
                src="https://images.unsplash.com/photo-1495446815901-a7297e633e8d" 
                alt="Stack of books" 
                className="absolute top-8 left-0 w-48 h-64 object-cover rounded-lg shadow-lg transform -rotate-6 z-10" 
              />
              <img 
                src="https://images.unsplash.com/photo-1544947950-fa07a98d237f" 
                alt="Open book" 
                className="absolute top-0 right-0 w-48 h-64 object-cover rounded-lg shadow-lg transform rotate-6 z-20" 
              />
              <img 
                src="https://images.unsplash.com/photo-1512820790803-83ca734da794" 
                alt="Book with coffee" 
                className="absolute bottom-0 left-10 w-48 h-64 object-cover rounded-lg shadow-lg z-30" 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Decorative patterns */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-16">
          <path fill="#F8F5F2" d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25"></path>
          <path fill="#F8F5F2" d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5"></path>
          <path fill="#F8F5F2" d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"></path>
        </svg>
      </div>
    </section>
  );
}
