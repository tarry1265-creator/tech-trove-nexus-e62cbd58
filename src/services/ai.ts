// AI Service Module
// This module is designed to be modular and swappable with any Gemini-compatible API

export interface AIMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AIServiceConfig {
  apiUrl?: string;
  model?: string;
}

export interface AIResponse {
  content: string;
  error?: string;
}

// Default configuration - can be overridden
const defaultConfig: AIServiceConfig = {
  // Will be replaced with actual Lovable AI Gateway when connected
  apiUrl: "/api/ai/chat",
  model: "google/gemini-2.5-flash",
};

/**
 * Send a message to the AI service
 * This is a placeholder that will be connected to the actual Lovable AI Gateway
 */
export async function sendMessage(
  messages: AIMessage[],
  config: AIServiceConfig = defaultConfig
): Promise<AIResponse> {
  // Placeholder - will be replaced with actual API call
  // The structure follows OpenAI/Gemini-compatible format for easy swapping
  
  try {
    // TODO: Connect to Lovable AI Gateway
    // const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-ai`, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //     Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    //   },
    //   body: JSON.stringify({ messages, model: config.model }),
    // });
    
    // For now, return a placeholder response
    return {
      content: "AI service is ready to be connected. The modular architecture supports Gemini-compatible APIs.",
    };
  } catch (error) {
    return {
      content: "",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Stream a message from the AI service
 * For real-time responses
 */
export async function streamMessage(
  messages: AIMessage[],
  onDelta: (text: string) => void,
  onDone: () => void,
  config: AIServiceConfig = defaultConfig
): Promise<void> {
  // Placeholder for streaming implementation
  // Will be connected to Lovable AI Gateway with SSE
  
  onDelta("Streaming AI responses will be available when connected to the AI service.");
  onDone();
}

/**
 * Generate store insights based on data
 */
export function generateInsightPrompt(context: {
  totalProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
}): string {
  return `You are an e-commerce admin assistant for a tech gadget store. 
Here's the current store status:
- Total Products: ${context.totalProducts}
- Low Stock Items: ${context.lowStockCount}
- Out of Stock: ${context.outOfStockCount}
- Total Orders: ${context.totalOrders}
- Pending Orders: ${context.pendingOrders}
- Total Revenue: ₦${context.totalRevenue.toLocaleString()}

Help the admin with inventory management, sales insights, and promotional suggestions.`;
}
