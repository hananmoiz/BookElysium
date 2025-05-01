import { useState } from "react";
import { Star } from "lucide-react";
import { useRateBook } from "@/hooks/use-ratings";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface StarRatingProps {
  bookId?: number;
  value: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  showValue?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
  lg: "h-6 w-6",
};

const containerClasses = {
  sm: "gap-1",
  md: "gap-1.5",
  lg: "gap-2",
};

export function StarRating({ 
  bookId, 
  value = 0, 
  onChange, 
  readOnly = false, 
  showValue = false,
  size = "md" 
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState(0);
  const [tempSelected, setTempSelected] = useState(false);
  const rateBookMutation = useRateBook();
  
  // Handle rating submission
  const handleRating = (rating: number) => {
    if (readOnly) return;
    
    setTempSelected(true);
    
    // Handle local state update
    if (onChange) {
      onChange(rating);
    }
    
    // Submit to API if bookId is provided
    if (bookId) {
      rateBookMutation.mutate({ bookId, rating });
    }
    
    // Reset hover state after a brief delay
    setTimeout(() => {
      setTempSelected(false);
      setHoverValue(0);
    }, 500);
  };
  
  // Calculate the visual value to display
  const displayValue = hoverValue || value;
  
  // Create the star array (always 5 stars)
  const stars = Array.from({ length: 5 }, (_, index) => {
    const starValue = index + 1;
    const isFilled = starValue <= displayValue;
    
    return (
      <motion.div
        key={index}
        whileHover={!readOnly ? { scale: 1.2 } : {}}
        whileTap={!readOnly ? { scale: 0.9 } : {}}
        animate={isFilled ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 0.3 }}
        className="cursor-pointer"
        onClick={() => handleRating(starValue)}
        onMouseEnter={() => !readOnly && !tempSelected && setHoverValue(starValue)}
        onMouseLeave={() => !readOnly && !tempSelected && setHoverValue(0)}
      >
        <Star
          className={cn(
            sizeClasses[size],
            isFilled 
              ? "text-yellow-400 fill-yellow-400" 
              : "text-gray-300 dark:text-gray-600",
            !readOnly && "cursor-pointer"
          )}
        />
      </motion.div>
    );
  });

  return (
    <div className="flex items-center">
      <div className={cn("flex", containerClasses[size])}>
        {stars}
      </div>
      
      {showValue && (
        <span className={cn(
          "ml-2 font-medium",
          size === "sm" && "text-xs",
          size === "md" && "text-sm",
          size === "lg" && "text-base"
        )}>
          {value ? value.toFixed(1) : "0.0"}
        </span>
      )}
    </div>
  );
}