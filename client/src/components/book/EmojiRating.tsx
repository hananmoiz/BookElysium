import { useState, useEffect } from "react";
import { useRateBook } from "@/hooks/use-ratings";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

type RatingValue = 1 | 2 | 3 | 4 | 5;

interface EmojiRatingProps {
  bookId: number;
  initialRating?: RatingValue;
  onRatingChange?: (value: number) => void;
  size?: "sm" | "md" | "lg";
}

// Emoji mapping for different rating values
const emojis: Record<RatingValue, { emoji: string; label: string; color: string }> = {
  1: { emoji: "😔", label: "Disappointing", color: "text-red-500" },
  2: { emoji: "🙁", label: "Could be better", color: "text-orange-500" },
  3: { emoji: "😐", label: "Okay", color: "text-yellow-500" },
  4: { emoji: "🙂", label: "Good", color: "text-green-500" },
  5: { emoji: "😄", label: "Excellent", color: "text-indigo-500" },
};

// Size classes for different emoji sizes
const sizeClasses = {
  sm: "text-xl",
  md: "text-3xl",
  lg: "text-5xl",
};

// Size classes for labels
const labelClasses = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

export function EmojiRating({ 
  bookId, 
  initialRating,
  onRatingChange,
  size = "md" 
}: EmojiRatingProps) {
  const [selectedRating, setSelectedRating] = useState<RatingValue | undefined>(initialRating);
  const [hoveredRating, setHoveredRating] = useState<RatingValue | undefined>(undefined);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  
  const rateBookMutation = useRateBook();
  
  // Update internal state when initialRating changes
  useEffect(() => {
    setSelectedRating(initialRating);
  }, [initialRating]);
  
  // Show animation after rating
  useEffect(() => {
    if (selectedRating && selectedRating >= 4) {
      setShowConfetti(true);
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [selectedRating]);
  
  // Handle rating selection
  const handleRatingSelect = (rating: RatingValue) => {
    setSelectedRating(rating);
    setIsAnimating(true);
    
    if (onRatingChange) {
      onRatingChange(rating);
    }
    
    // Submit to API
    rateBookMutation.mutate({ bookId, rating });
    
    // Reset animation state after delay
    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  };
  
  // Current display rating (either hovered or selected)
  const currentRating = hoveredRating || selectedRating;
  
  return (
    <div className="flex flex-col items-center relative">
      {/* Emoji display */}
      <div className="mb-2 relative">
        <AnimatePresence mode="wait">
          {currentRating ? (
            <motion.div
              key={currentRating}
              initial={{ opacity: 0, scale: 0.5, y: 10 }}
              animate={{ 
                opacity: 1, 
                scale: isAnimating ? [1, 1.2, 1] : 1, 
                y: 0,
                rotate: isAnimating ? [0, -10, 10, -5, 5, 0] : 0
              }}
              exit={{ opacity: 0, scale: 0.5, y: -10 }}
              transition={{ duration: 0.3 }}
              className={cn(
                sizeClasses[size],
                "cursor-pointer",
                emojis[currentRating].color
              )}
            >
              {emojis[currentRating].emoji}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={cn(
                sizeClasses[size],
                "text-gray-300 dark:text-gray-600"
              )}
            >
              😶
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Confetti animation for high ratings */}
        {showConfetti && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-yellow-400"
                initial={{ 
                  x: 0, 
                  y: 0, 
                  scale: 0,
                  opacity: 1
                }}
                animate={{ 
                  x: Math.random() * 100 - 50, 
                  y: Math.random() * 100 - 50, 
                  scale: Math.random() * 1.5,
                  opacity: 0
                }}
                transition={{ duration: 1.5 }}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Rating text description */}
      <AnimatePresence mode="wait">
        {currentRating && (
          <motion.p
            key={`label-${currentRating}`}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className={cn(
              labelClasses[size],
              "font-medium",
              emojis[currentRating].color
            )}
          >
            {emojis[currentRating].label}
          </motion.p>
        )}
      </AnimatePresence>
      
      {/* Rating emoji buttons */}
      <div className={cn(
        "flex justify-between mt-4",
        size === "sm" ? "gap-1" : "gap-2",
        size === "lg" ? "gap-4" : ""
      )}>
        {Object.entries(emojis).map(([rating, { emoji }]) => (
          <motion.button
            key={rating}
            className={cn(
              "rounded-full p-2 transition-colors",
              selectedRating === Number(rating) 
                ? "bg-gray-100 dark:bg-gray-800" 
                : "hover:bg-gray-50 dark:hover:bg-gray-900",
              size === "sm" ? "p-1" : "p-2",
              size === "lg" ? "p-3" : ""
            )}
            onClick={() => handleRatingSelect(Number(rating) as RatingValue)}
            onMouseEnter={() => setHoveredRating(Number(rating) as RatingValue)}
            onMouseLeave={() => setHoveredRating(undefined)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className={cn(
              size === "sm" ? "text-lg" : "text-xl",
              size === "lg" ? "text-2xl" : ""
            )}>
              {emoji}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}