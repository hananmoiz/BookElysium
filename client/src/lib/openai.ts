import { apiRequest } from "@/lib/queryClient";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function sendChatMessage(messages: ChatMessage[], message: string): Promise<string> {
  try {
    const response = await apiRequest("POST", "/api/chat", { messages, message });
    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error("Error sending chat message:", error);
    return "Sorry, I encountered an error. Please try again later.";
  }
}

export interface BookRecommendation {
  title: string;
  author: string;
  reason: string;
}

export async function getAIBookRecommendations(
  preferences: string,
  previouslyRead: string[] = []
): Promise<BookRecommendation[]> {
  try {
    const response = await apiRequest("POST", "/api/ai-recommendations", {
      preferences,
      previouslyRead,
    });
    const data = await response.json();
    return data.recommendations || [];
  } catch (error) {
    console.error("Error getting AI book recommendations:", error);
    throw new Error("Failed to get book recommendations");
  }
}
