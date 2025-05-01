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
        className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center bg-primary hover:bg-primary/90"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>
      
      <div 
        className={cn(
          "absolute bottom-16 right-0 w-80 sm:w-96 bg-white rounded-lg shadow-xl overflow-hidden transition-all duration-300 ease-in-out",
          isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
        )}
      >
        <div className="bg-primary text-white p-4 flex justify-between items-center">
          <div className="flex items-center">
            <Bot className="mr-2 h-5 w-5" />
            <span className="font-semibold">Bookverse Assistant</span>
          </div>
          <Button variant="ghost" size="icon" onClick={toggleChat} className="text-white hover:bg-primary-dark">
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="h-80 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                "flex",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "rounded-lg p-3 max-w-[75%]",
                  message.role === "user"
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-foreground"
                )}
              >
                <p className="text-sm whitespace-pre-line">{message.content}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        <form onSubmit={handleSendMessage} className="border-t p-4">
          <div className="flex items-center">
            <Input
              type="text"
              placeholder="Ask about any book or author..."
              className="flex-grow p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              className="ml-2 p-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              disabled={isLoading || !inputMessage.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
