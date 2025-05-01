import { useState } from "react";
import { BookComment } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { addBookComment } from "@/lib/api";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";

interface BookCommentsProps {
  bookId: number;
  comments: (BookComment & { user: { username: string; fullName?: string } })[];
  isLoading?: boolean;
}

export default function BookComments({ bookId, comments, isLoading = false }: BookCommentsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to post comments",
        variant: "destructive",
      });
      return;
    }
    
    if (!comment.trim()) {
      toast({
        title: "Empty comment",
        description: "Please enter a comment",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      await addBookComment(bookId, comment);
      setComment("");
      toast({
        title: "Comment posted",
        description: "Your comment has been posted successfully",
      });
      
      // Refresh comments
      queryClient.invalidateQueries({ queryKey: [`/api/books/${bookId}/comments`] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="font-heading text-2xl font-bold">Comments</h2>
        
        <div className="space-y-2">
          <Skeleton className="h-24 w-full" />
          <div className="flex justify-end">
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
        
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-5 w-1/3 mb-1" />
                <Skeleton className="h-4 w-1/4 mb-3" />
                <Skeleton className="h-20 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="font-heading text-2xl font-bold">Comments</h2>
      
      {user && (
        <form onSubmit={handleSubmitComment} className="space-y-4">
          <Textarea
            placeholder="Share your thoughts about this book..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="h-24"
            disabled={isSubmitting}
          />
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={isSubmitting || !comment.trim()}
              className="bg-primary text-white hover:bg-primary/90"
            >
              {isSubmitting ? "Posting..." : "Post Comment"}
            </Button>
          </div>
        </form>
      )}
      
      <div className="space-y-6">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No comments yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-4">
              <Avatar>
                <AvatarFallback>
                  {comment.user.fullName 
                    ? getInitials(comment.user.fullName) 
                    : comment.user.username.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-baseline gap-2">
                  <h4 className="font-semibold">
                    {comment.user.fullName || comment.user.username}
                  </h4>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(comment.createdAt.toString())}
                  </span>
                </div>
                <p className="mt-2 text-muted-foreground">{comment.comment}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
