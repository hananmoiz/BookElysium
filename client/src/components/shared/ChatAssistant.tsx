import { useState, useRef, useEffect } from "react";
import { MessageCircle, Send, X, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sendChatMessage, ChatMessage } from "@/lib/openai";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hello! I'm your Bookverse assistant. How can I help you find your next great read today?"
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim()) return;
    
    const userMessage: ChatMessage = {
      role: "user",
      content: inputMessage
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);
    
    try {
      const response = await sendChatMessage(messages, inputMessage);
      
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: response
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get response from assistant",
        variant: "destructive"
      });
      
      const errorMessage: ChatMessage = {
        role: "assistant",
        content: "I'm sorry, I'm having trouble connecting right now. Please try again later."
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={toggleChat}
        className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center bg-gradient-to-r from-primary to-primary-dark hover:shadow-xl transition-all duration-300"
        aria-label={isOpen ? "Close chat assistant" : "Open chat assistant"}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <div className="relative">
            <MessageCircle className="h-6 w-6 text-white" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-pulse"></span>
          </div>
        )}
      </Button>
      
      <div 
        className={cn(
          "absolute bottom-16 right-0 w-80 sm:w-96 bg-card border border-border rounded-xl shadow-2xl overflow-hidden transition-all duration-300 ease-in-out",
          isOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4 pointer-events-none"
        )}
      >
        <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-4 flex justify-between items-center rounded-t-xl">
          <div className="flex items-center">
            <div className="bg-white/20 p-1.5 rounded-full mr-2">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold block text-sm">Bookverse Assistant</span>
              <span className="text-xs text-white/80">Powered by AI</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={toggleChat} className="text-white hover:bg-white/20 rounded-full">
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="h-80 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-card to-card/60">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                "flex items-end gap-2",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {message.role === "assistant" && (
                <div className="bg-primary/20 p-1 rounded-full flex-shrink-0">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}
              <div
                className={cn(
                  "rounded-2xl p-3 max-w-[75%] shadow-sm",
                  message.role === "user"
                    ? "bg-gradient-to-r from-primary to-primary-dark text-white rounded-tr-none"
                    : "bg-card border border-border rounded-tl-none"
                )}
              >
                <p className="text-sm whitespace-pre-line">{message.content}</p>
              </div>
              {message.role === "user" && (
                <div className="bg-zinc-200 p-1 rounded-full flex-shrink-0">
                  <div className="h-4 w-4 bg-zinc-400 rounded-full"></div>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-card border border-border rounded-2xl rounded-tl-none p-2 max-w-[75%] flex items-center gap-1.5">
                <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
              </div>
            </div>
          )}
        </div>
        
        <form onSubmit={handleSendMessage} className="border-t p-4 bg-background/80 backdrop-blur-sm">
          <div className="flex items-center">
            <Input
              type="text"
              placeholder="Ask about any book or author..."
              className="flex-grow p-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-primary bg-card"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              size="icon"
              className="ml-2 w-10 h-10 rounded-full bg-gradient-to-r from-primary to-primary-dark hover:shadow-md transition-all"
              disabled={isLoading || !inputMessage.trim()}
            >
              <Send className="h-4 w-4 text-white" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
