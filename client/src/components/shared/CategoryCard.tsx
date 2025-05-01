import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { Category } from "@shared/schema";
import { 
  Rocket, 
  Heart, 
  Ghost, 
  BookOpen, 
  Sword, 
  User, 
  Brain, 
  LandPlot 
} from "lucide-react";

interface CategoryCardProps {
  category: Category;
  className?: string;
}

export default function CategoryCard({ category, className }: CategoryCardProps) {
  const { name, icon, color, bookCount } = category;

  // Map icon string to Lucide component
  const getIcon = () => {
    switch (icon) {
      case "rocket-line":
        return <Rocket className="h-12 w-12 text-white" />;
      case "heart-line":
        return <Heart className="h-12 w-12 text-white" />;
      case "ghost-line":
        return <Ghost className="h-12 w-12 text-white" />;
      case "book-line":
        return <BookOpen className="h-12 w-12 text-white" />;
      case "sword-line":
        return <Sword className="h-12 w-12 text-white" />;
      case "user-line":
        return <User className="h-12 w-12 text-white" />;
      case "mental-health-line":
        return <Brain className="h-12 w-12 text-white" />;
      case "ancient-gate-line":
        return <LandPlot className="h-12 w-12 text-white" />;
      default:
        return <BookOpen className="h-12 w-12 text-white" />;
    }
  };

  // Transform color string to CSS background style
  const getBackgroundStyle = () => {
    const bgColor = color || "#8C5E58"; // Default to primary color
    return { backgroundColor: bgColor };
  };

  const handleCategoryClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Log information for debugging
    console.log(`Clicked on category: ${name}`);
    
    // Navigate to explore page with this category
    const url = `/explore?category=${encodeURIComponent(name)}`;
    console.log(`Navigating to: ${url}`);
    
    // Use setTimeout to ensure we don't cut off console logs
    setTimeout(() => {
      window.location.href = url;
    }, 100);
  };

  return (
    <div 
      className={cn("category-card hover:shadow-lg transition-all duration-300 rounded-lg overflow-hidden cursor-pointer", className)}
      onClick={handleCategoryClick}
    >
      <div className="h-40 flex items-center justify-center" style={getBackgroundStyle()}>
        {getIcon()}
      </div>
      <div className="p-4 text-center">
        <h3 className="font-bold text-lg mb-1">{name}</h3>
        <p className="text-sm text-muted-foreground">{bookCount || 0} books</p>
      </div>
    </div>
  );
}
