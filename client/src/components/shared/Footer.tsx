import { Link } from "wouter";
import { BookOpen, Facebook, Twitter, Instagram, Github } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="flex items-center space-x-2 mb-6">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="font-heading text-2xl font-bold">Bookverse</span>
            </Link>
            <p className="text-muted-foreground mb-6">
              Your personal gateway to the world of books. Discover, read, and connect with fellow book lovers.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-6">Discover</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/explore?sort=bestseller">
                  <a className="text-muted-foreground hover:text-primary">Bestsellers</a>
                </Link>
              </li>
              <li>
                <Link href="/explore?sort=new">
                  <a className="text-muted-foreground hover:text-primary">New Releases</a>
                </Link>
              </li>
              <li>
                <Link href="/explore?free=true">
                  <a className="text-muted-foreground hover:text-primary">Free Books</a>
                </Link>
              </li>
              <li>
                <Link href="/explore">
                  <a className="text-muted-foreground hover:text-primary">Book Collections</a>
                </Link>
              </li>
              <li>
                <Link href="/explore?type=author">
                  <a className="text-muted-foreground hover:text-primary">Author Spotlights</a>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-6">Support</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary">Help Center</a>
              </li>
              <li>
                <Link href="/contact">
                  <a className="text-muted-foreground hover:text-primary">Contact Us</a>
                </Link>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary">Privacy Policy</a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary">Terms of Service</a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary">FAQ</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-6">Company</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary">About Us</a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary">Careers</a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary">Blog</a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary">Press</a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary">Partners</a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-12 pt-8 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Bookverse. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
