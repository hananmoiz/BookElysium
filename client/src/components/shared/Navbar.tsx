import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  BookOpen, 
  Search, 
  User, 
  Bookmark, 
  LogOut, 
  Menu, 
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function Navbar() {
  const [location, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="font-heading text-2xl font-bold">Bookverse</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className={`font-medium hover:text-primary ${location === '/' ? 'text-primary' : ''}`}>
              Home
            </Link>
            <Link href="/explore" className={`font-medium hover:text-primary ${location === '/explore' ? 'text-primary' : ''}`}>
              Explore
            </Link>
            <Link href="/contact" className={`font-medium hover:text-primary ${location === '/contact' ? 'text-primary' : ''}`}>
              Contact
            </Link>
          </nav>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center relative flex-1 max-w-md mx-8">
            <Input
              type="text"
              placeholder="Search for books, authors, or genres..."
              className="w-full rounded-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button 
              type="submit" 
              variant="ghost" 
              size="icon" 
              className="absolute right-2"
            >
              <Search className="h-4 w-4 text-muted-foreground" />
            </Button>
          </form>
          
          {/* User Actions */}
          <div className="flex items-center space-x-5">
            {user ? (
              <>
                <Link href="/saved">
                  <Button variant="ghost" size="icon" className="hidden md:flex">
                    <Bookmark className="h-5 w-5" />
                  </Button>
                </Link>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild className="hidden md:flex">
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{user.fullName ? getInitials(user.fullName) : user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <div className="flex items-center">
                          <User className="mr-2 h-4 w-4" />
                          <span>Profile</span>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/saved">
                        <div className="flex items-center">
                          <Bookmark className="mr-2 h-4 w-4" />
                          <span>Saved Books</span>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link href="/auth">
                <Button className="bg-primary text-white rounded-full hover:bg-primary/90">
                  Login
                </Button>
              </Link>
            )}
            
            {/* Mobile Menu Button */}
            <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMobileMenu}>
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
        
        {/* Mobile Search */}
        <div className="md:hidden pb-4">
          <form onSubmit={handleSearch} className="relative">
            <Input
              type="text"
              placeholder="Search books..."
              className="w-full rounded-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button 
              type="submit" 
              variant="ghost" 
              size="icon" 
              className="absolute right-2 top-1/2 -translate-y-1/2"
            >
              <Search className="h-4 w-4 text-muted-foreground" />
            </Button>
          </form>
        </div>
        
        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white py-4 px-2 space-y-4 border-t">
            <Link href="/" className={`block py-2 px-4 rounded-md ${location === '/' ? 'bg-primary/10 text-primary' : ''}`}>
              Home
            </Link>
            <Link href="/explore" className={`block py-2 px-4 rounded-md ${location === '/explore' ? 'bg-primary/10 text-primary' : ''}`}>
              Explore
            </Link>
            <Link href="/contact" className={`block py-2 px-4 rounded-md ${location === '/contact' ? 'bg-primary/10 text-primary' : ''}`}>
              Contact
            </Link>
            {user && (
              <>
                <Link href="/saved" className={`block py-2 px-4 rounded-md ${location === '/saved' ? 'bg-primary/10 text-primary' : ''}`}>
                  Saved Books
                </Link>
                <Link href="/profile" className={`block py-2 px-4 rounded-md ${location === '/profile' ? 'bg-primary/10 text-primary' : ''}`}>
                  Profile
                </Link>
                <button 
                  className="w-full text-left block py-2 px-4 rounded-md text-destructive" 
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
