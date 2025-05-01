import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BookCommentsProps {
  bookId: number;
  comments?: any[];
  isLoading?: boolean;
}

export default function BookComments({ bookId, comments: externalComments, isLoading: externalLoading }: BookCommentsProps) {
  const [_, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");
  
  // Get book comments if not provided externally
  const { data: fetchedComments, isLoading: fetchLoading } = useQuery({
    queryKey: [`/api/books/${bookId}/comments`],
    enabled: !externalComments
  });
  
  // Use external comments if provided, otherwise use fetched comments
  const comments = externalComments || fetchedComments;
  const isLoading = externalLoading !== undefined ? externalLoading : fetchLoading;
  
  // Add comment mutation
  const { mutate: addComment, isPending } = useMutation({
    mutationFn: async (text: string) => {
      const res = await apiRequest("POST", `/api/books/${bookId}/comments`, { text });
      return await res.json();
    },
    onSuccess: () => {
      setComment("");
      queryClient.invalidateQueries({ queryKey: [`/api/books/${bookId}/comments`] });
      toast({
        title: "Comment added",
        description: "Your comment has been posted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add comment",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    }
  });
  
  // Handle comment submission
  const handleSubmitComment = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to comment",
        variant: "destructive",
      });
      setLocation("/auth");
      return;
    }
    
    if (!comment.trim()) {
      toast({
        title: "Empty comment",
        description: "Please write something before posting",
        variant: "destructive",
      });
      return;
    }
    
    addComment(comment);
  };
  
  // Get user initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Comment item animation variants
  const commentVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, height: 0, marginBottom: 0 }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Comments</h2>
      
      {/* Comment form */}
      <div className="space-y-4">
        <Textarea
          placeholder="Share your thoughts about this book..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={isPending || !user}
          className="resize-none min-h-[100px]"
        />
        
        <div className="flex justify-between items-center">
          {!user && (
            <p className="text-sm text-muted-foreground">
              <Button 
                variant="link" 
                className="p-0 h-auto" 
                onClick={() => setLocation("/auth")}
              >
                Sign in
              </Button> to leave a comment
            </p>
          )}
          
          <Button 
            onClick={handleSubmitComment} 
            disabled={isPending || !user || !comment.trim()}
            className="ml-auto"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                Posting...
              </>
            ) : (
              'Post Comment'
            )}
          </Button>
        </div>
      </div>
      
      {/* Comments list */}
      <div className="space-y-6 mt-8">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse flex space-x-4">
                <div className="rounded-full bg-slate-200 h-10 w-10"></div>
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : comments?.length > 0 ? (
          <AnimatePresence>
            {comments.map((comment: any) => (
              <motion.div
                key={comment.id}
                className="flex space-x-4"
                variants={commentVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {comment.user.fullName 
                      ? getInitials(comment.user.fullName) 
                      : comment.user.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center">
                    <h4 className="font-medium">
                      {comment.user.fullName || comment.user.username}
                    </h4>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1 text-muted-foreground">{comment.text}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <p className="text-center text-muted-foreground py-6">
            No comments yet. Be the first to share your thoughts!
          </p>
        )}
      </div>
    </div>
  );
}