import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function getChatbotResponse(
  messages: ChatMessage[],
  userQuery: string
): Promise<string> {
  try {
    const formattedMessages = [
      {
        role: "system",
        content: `You are a friendly and knowledgeable book recommendation assistant for Bookverse, a book discovery platform. 
        Your name is Bookverse Assistant.
        Help users discover books, recommend titles based on their interests, and answer questions about authors, genres, and book-related topics.
        Be concise, helpful, and enthusiastic about books.
        If asked about non-book related topics, gently redirect the conversation to books.
        Format your responses to be easily readable, using bullet points for lists of books.`,
      },
      ...messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      {
        role: "user",
        content: userQuery,
      },
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: formattedMessages,
      max_tokens: 500,
      temperature: 0.7,
    });

    return response.choices[0].message.content || "I'm sorry, I couldn't process that request.";
  } catch (error) {
    console.error("Error getting chatbot response:", error);
    return "I'm having trouble connecting right now. Please try again later.";
  }
}

export async function getBookRecommendations(
  userPreferences: string,
  previouslyRead: string[] = []
): Promise<{
  recommendations: { title: string; author: string; reason: string }[];
}> {
  try {
    const prompt = `
      Based on the following user preferences and previously read books, recommend 5 books the user might enjoy.
      User preferences: ${userPreferences}
      
      Previously read books: ${previouslyRead.join(", ")}
      
      Provide recommendations in JSON format with the following structure:
      [
        {
          "title": "Book Title",
          "author": "Author Name",
          "reason": "Brief explanation of why this book is recommended"
        }
      ]
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a book recommendation expert. Provide personalized book recommendations based on user preferences.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content);
    return { recommendations: result };
  } catch (error) {
    console.error("Error getting book recommendations:", error);
    throw new Error("Failed to get book recommendations");
  }
}
