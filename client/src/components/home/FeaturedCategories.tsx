import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import CategoryCard from "@/components/shared/CategoryCard";
import { fetchCategories } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

export default function FeaturedCategories() {
  const { data: categories, isLoading, error } = useQuery({
    queryKey: ["/api/categories"],
    queryFn: fetchCategories
  });

  const renderCategorySkeleton = () => (
    <div className="w-full">
      <Skeleton className="h-40 w-full mb-4" />
      <Skeleton className="h-6 w-3/4 mx-auto mb-2" />
      <Skeleton className="h-4 w-1/2 mx-auto" />
    </div>
  );

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="font-heading text-3xl font-bold mb-10 text-center">Browse by Category</h2>
        
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Array(4).fill(0).map((_, i) => (
              <div key={i}>{renderCategorySkeleton()}</div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center text-destructive">
            <p>Failed to load categories. Please try again later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories?.slice(0, 4).map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        )}
        
        <div className="text-center mt-10">
          <Button asChild variant="outline" className="px-6 py-3 border-primary text-primary font-semibold rounded-full hover:bg-primary hover:text-white">
            <Link href="/explore">
              View All Categories
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
