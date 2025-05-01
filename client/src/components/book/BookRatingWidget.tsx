import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRateBook } from "@/hooks/use-ratings";
import { cn } from "@/lib/utils";
import { EmojiRating } from "./EmojiRating";
import { StarRating } from "./StarRating";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

interface BookRatingWidgetProps {
  bookId: number;
  title: string;
}

export function BookRatingWidget({ bookId, title }: BookRatingWidgetProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"emoji" | "stars">("emoji");
  const [rating, setRating] = useState<number>(0);
  const rateBookMutation = useRateBook();
  
  const handleTabChange = (value: string) => {
    setActiveTab(value as "emoji" | "stars");
  };
  
  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
    
    // We don't need to call the API here as the child components will do it
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } }
  };
  
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Rate "{title}"</CardTitle>
          <CardDescription>Share your opinion about this book</CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs
            defaultValue="emoji"
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full"
          >
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="emoji">Emoji Rating</TabsTrigger>
              <TabsTrigger value="stars">Star Rating</TabsTrigger>
            </TabsList>
            
            <TabsContent value="emoji" className="pt-6 flex justify-center">
              <div className="max-w-xs w-full">
                <EmojiRating 
                  bookId={bookId} 
                  initialRating={(rating > 0 ? rating : undefined) as 1 | 2 | 3 | 4 | 5 | undefined}
                  onRatingChange={handleRatingChange}
                  size="md"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="stars" className="pt-6 flex justify-center items-center">
              <div className="flex flex-col items-center gap-4">
                <p className={cn(
                  "text-2xl font-medium",
                  rating === 1 && "text-red-500",
                  rating === 2 && "text-orange-500",
                  rating === 3 && "text-yellow-500",
                  rating === 4 && "text-green-500",
                  rating === 5 && "text-indigo-500"
                )}>
                  {rating === 1 && "Disappointing"}
                  {rating === 2 && "Could be better"}
                  {rating === 3 && "Okay"}
                  {rating === 4 && "Good"}
                  {rating === 5 && "Excellent"}
                  {rating === 0 && "Tap a star to rate"}
                </p>
                
                <StarRating 
                  bookId={bookId} 
                  value={rating} 
                  onChange={handleRatingChange} 
                  size="lg" 
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
}