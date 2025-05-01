import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// Mock responses for common book-related queries during development
const bookResponses: Record<string, string> = {
  "recommend": "I'd be happy to recommend some great books! Here are a few popular ones across different genres:\n\n• Science Fiction: \"Project Hail Mary\" by Andy Weir\n• Fantasy: \"The Name of the Wind\" by Patrick Rothfuss\n• Mystery: \"The Silent Patient\" by Alex Michaelides\n• Romance: \"The Seven Husbands of Evelyn Hugo\" by Taylor Jenkins Reid\n• Non-fiction: \"Atomic Habits\" by James Clear\n\nWhat kind of books do you enjoy reading?",
  "sci-fi": "Here are some outstanding science fiction books I recommend:\n\n• \"Dune\" by Frank Herbert - An epic tale of politics, religion, and ecology\n• \"The Three-Body Problem\" by Cixin Liu - A mind-bending first contact story\n• \"Neuromancer\" by William Gibson - The classic cyberpunk novel\n• \"Snow Crash\" by Neal Stephenson - A thrilling metaverse adventure\n• \"Hyperion\" by Dan Simmons - A complex, Canterbury Tales-inspired space opera",
  "fantasy": "Fantasy lovers might enjoy these excellent books:\n\n• \"The Way of Kings\" by Brandon Sanderson - Epic fantasy with unique magic systems\n• \"The Fifth Season\" by N.K. Jemisin - Award-winning apocalyptic fantasy\n• \"The Night Circus\" by Erin Morgenstern - A magical competition in a mysterious circus\n• \"The Poppy War\" by R.F. Kuang - Dark military fantasy inspired by Chinese history\n• \"Piranesi\" by Susanna Clarke - A strange and beautiful journey in a mysterious house",
  "romance": "For romance readers, here are some wonderful recommendations:\n\n• \"Beach Read\" by Emily Henry - Writers with opposite styles fall for each other\n• \"Red, White & Royal Blue\" by Casey McQuiston - Romance between the American president's son and a British prince\n• \"The Hating Game\" by Sally Thorne - Workplace enemies to lovers\n• \"It Ends with Us\" by Colleen Hoover - An emotional contemporary romance\n• \"Pride and Prejudice\" by Jane Austen - The classic romance that inspired countless others",
  "mystery": "Mystery fans might enjoy these thrilling reads:\n\n• \"Gone Girl\" by Gillian Flynn - A twist-filled missing person case\n• \"The Thursday Murder Club\" by Richard Osman - Retirement home residents solve crimes\n• \"And Then There Were None\" by Agatha Christie - A classic mystery by the queen of the genre\n• \"The Woman in the Window\" by A.J. Finn - A psychological thriller with an unreliable narrator\n• \"Knives Out\" novelization - Based on the hit mystery film",
  "classics": "Here are some timeless classics worth reading:\n\n• \"To Kill a Mockingbird\" by Harper Lee - A powerful examination of racial injustice\n• \"1984\" by George Orwell - A dystopian warning about totalitarianism\n• \"The Great Gatsby\" by F. Scott Fitzgerald - The American Dream during the Jazz Age\n• \"One Hundred Years of Solitude\" by Gabriel García Márquez - A magical realist masterpiece\n• \"Jane Eyre\" by Charlotte Brontë - A Gothic romance with a strong female protagonist",
  "hello": "Hello! I'm your Bookverse assistant. I'm here to help you discover great books, provide recommendations, and answer questions about authors and genres. What kind of books are you interested in today?",
  "help": "I'd be happy to help! Here are some things I can do for you:\n\n• Recommend books based on your interests or mood\n• Suggest authors similar to ones you already enjoy\n• Tell you about different book genres\n• Help you find your next great read\n• Provide information about bestsellers and new releases\n\nJust let me know what you're looking for!",
  "default": "I'm here to help you discover your next favorite book! You can ask me for recommendations by genre, author, or even mood. What kind of books do you enjoy reading?"
};

export async function getChatbotResponse(
  messages: ChatMessage[],
  userQuery: string
): Promise<string> {
  try {
    // For development, use mock responses when OpenAI API is unavailable
    const lowerQuery = userQuery.toLowerCase();
    
    // Check for keywords in the query to determine the appropriate response
    if (lowerQuery.includes("recommend") || lowerQuery.includes("suggestion")) {
      return bookResponses["recommend"];
    } else if (lowerQuery.includes("sci-fi") || lowerQuery.includes("science fiction")) {
      return bookResponses["sci-fi"];
    } else if (lowerQuery.includes("fantasy")) {
      return bookResponses["fantasy"];
    } else if (lowerQuery.includes("romance")) {
      return bookResponses["romance"];
    } else if (lowerQuery.includes("mystery") || lowerQuery.includes("thriller")) {
      return bookResponses["mystery"];
    } else if (lowerQuery.includes("classic")) {
      return bookResponses["classics"];
    } else if (lowerQuery.includes("hello") || lowerQuery.includes("hi")) {
      return bookResponses["hello"];
    } else if (lowerQuery.includes("help")) {
      return bookResponses["help"];
    }
    
    // If no specific match is found, try with OpenAI API first
    try {
      // Type correctly for OpenAI API
      const formattedMessages: Array<{
        role: "system" | "user" | "assistant";
        content: string;
      }> = [
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

      return response.choices[0].message.content ?? "I'm sorry, I couldn't process that request.";
    } catch (error) {
      // If OpenAI API fails, fall back to the default response
      console.error("Error getting chatbot response from OpenAI:", error);
      return bookResponses["default"];
    }
  } catch (error) {
    console.error("Error in chatbot response function:", error);
    return "I'm having trouble understanding right now. Could you try asking about book recommendations or a specific genre?";
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
      ] as Array<{role: "system" | "user" | "assistant"; content: string}>,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content || "[]";
    const result = JSON.parse(content);
    return { recommendations: result };
  } catch (error) {
    console.error("Error getting book recommendations:", error);
    throw new Error("Failed to get book recommendations");
  }
}
