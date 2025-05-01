import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Grid3X3, List, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { 
  fetchBooks, 
  fetchBooksByCategory, 
  fetchCategories, 
  searchBooks,
  PaginationData
} from "@/lib/api";
import BookCard from "@/components/shared/BookCard";
import CategoryCard from "@/components/shared/CategoryCard";
import Pagination from "@/components/shared/Pagination";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import ChatAssistant from "@/components/shared/ChatAssistant";
import { Skeleton } from "@/components/ui/skeleton";

type ViewMode = "grid" | "list";

export default function ExplorePage() {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [offset, setOffset] = useState(0);
  const [limit] = useState(12); // Number of items per page
  
  // Parse query parameters from URL
  const params = new URLSearchParams(location.split('?')[1]);
  const urlQuery = params.get("q");
  const urlCategory = params.get("category");
  const urlOffset = params.get("offset");
  
  useEffect(() => {
    if (urlQuery) {
      setSearchQuery(urlQuery);
    }
    if (urlCategory) {
      setCurrentCategory(urlCategory);
    }
    if (urlOffset) {
      setOffset(parseInt(urlOffset));
    }
  }, [urlQuery, urlCategory, urlOffset]);

  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["/api/categories"],
    queryFn: fetchCategories
  });
  
  // Fetch or search books based on state
  const {
    data: paginatedBooks,
    isLoading: booksLoading,
    error: booksError,
    refetch: refetchBooks
  } = useQuery({
    queryKey: [
      searchQuery ? "/api/books/search" : currentCategory ? `/api/books/category/${currentCategory}` : "/api/books",
      searchQuery,
      currentCategory,
      offset,
      limit
    ],
    queryFn: () => {
      if (searchQuery) {
        return searchBooks(searchQuery, limit, offset);
      } else if (currentCategory) {
        return fetchBooksByCategory(currentCategory, limit, offset);
      } else {
        return fetchBooks(limit, offset);
      }
    }
  });

  const books = paginatedBooks?.books || [];
  const pagination = paginatedBooks?.pagination;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setOffset(0); // Reset to first page when searching
    refetchBooks();
  };

  const handleCategorySelect = (category: string | null) => {
    setCurrentCategory(category);
    setSearchQuery("");
    setOffset(0); // Reset to first page when changing category
  };

  const handlePageChange = (newPage: number) => {
    if (pagination) {
      // Calculate the new offset based on page number
      const newOffset = (newPage - 1) * limit;
      setOffset(newOffset);
    }
  };

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

  const renderCategorySkeleton = () => (
    <div className="w-full">
      <Skeleton className="h-40 w-full mb-4" />
      <Skeleton className="h-6 w-3/4 mx-auto mb-2" />
      <Skeleton className="h-4 w-1/2 mx-auto" />
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Explore Books - Bookverse</title>
        <meta name="description" content="Discover and explore thousands of books across different genres and categories on Bookverse." />
      </Helmet>
      
      <div className="flex flex-col min-h-screen">
        <Navbar />
        
        <main className="flex-grow bg-background py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <h1 className="font-heading text-3xl font-bold">Explore Books</h1>
              
              <div className="flex items-center gap-4 w-full md:w-auto">
                <form onSubmit={handleSearch} className="relative flex-grow md:w-64">
                  <Input
                    type="text"
                    placeholder="Search books..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10 rounded-full"
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
                
                <div className="flex items-center border rounded-md">
                  <Button
                    variant={viewMode === "grid" ? "secondary" : "ghost"}
                    size="icon"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "secondary" : "ghost"}
                    size="icon"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            <Tabs defaultValue="books" className="w-full">
              <TabsList className="w-full justify-start mb-6">
                <TabsTrigger value="books">Books</TabsTrigger>
                <TabsTrigger value="categories">Categories</TabsTrigger>
              </TabsList>
              
              <TabsContent value="books">
                {currentCategory && (
                  <div className="mb-6 flex items-center gap-2">
                    <h2 className="font-heading text-xl">
                      Category: <span className="font-bold">{currentCategory}</span>
                    </h2>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCategorySelect(null)}
                    >
                      Clear
                    </Button>
                  </div>
                )}
                
                {searchQuery && (
                  <div className="mb-6">
                    <h2 className="font-heading text-xl">
                      Search results for: <span className="font-bold">"{searchQuery}"</span>
                    </h2>
                  </div>
                )}
                
                {booksLoading ? (
                  <div className={`grid ${viewMode === "grid" ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" : "grid-cols-1"} gap-6`}>
                    {Array(10).fill(0).map((_, i) => (
                      <div key={i}>{renderBookCardSkeleton()}</div>
                    ))}
                  </div>
                ) : booksError ? (
                  <div className="text-center py-16 text-destructive">
                    <p>Failed to load books. Please try again later.</p>
                  </div>
                ) : books?.length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground">
                    <p>No books found. Try a different search term or category.</p>
                  </div>
                ) : (
                  <>
                    <div className={`grid ${viewMode === "grid" ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" : "grid-cols-1"} gap-6`}>
                      {books?.map((book) => (
                        <BookCard 
                          key={book.id} 
                          book={book} 
                          className={`${viewMode === "list" ? "w-full flex flex-row h-48" : "w-full"}`} 
                        />
                      ))}
                    </div>
                    
                    {pagination && (
                      <Pagination 
                        currentPage={pagination.currentPage}
                        totalPages={pagination.totalPages}
                        hasNextPage={pagination.hasNextPage}
                        hasPrevPage={pagination.hasPrevPage}
                        onPageChange={handlePageChange}
                      />
                    )}
                  </>
                )}
              </TabsContent>
              
              <TabsContent value="categories">
                {categoriesLoading ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {Array(8).fill(0).map((_, i) => (
                      <div key={i}>{renderCategorySkeleton()}</div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {categories?.map((category) => (
                      <CategoryCard 
                        key={category.id} 
                        category={category} 
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
        
        <Footer />
      </div>
      
      <ChatAssistant />
    </>
  );
}
