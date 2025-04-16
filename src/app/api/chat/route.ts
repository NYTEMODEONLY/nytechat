import { NextResponse } from 'next/server';
import axios from 'axios';
import type { AxiosError } from 'axios';

// Type for incoming request data
interface ChatRequest {
  messages: {
    role: string;
    content: string;
  }[];
}

// Interface for API responses
interface GrokApiResponse {
  choices: {
    message: {
      content: string;
      role: string;
    };
    index: number;
    finish_reason: string;
  }[];
  id: string;
  object: string;
  created: number;
  model: string;
}

// Type for xAI API error response
interface XAIErrorResponse {
  error?: {
    message?: string;
    type?: string;
    code?: string;
  };
}

// Simple content filter to check for suspicious content
function containsSuspiciousContent(text: string): boolean {
  // List of patterns that might indicate abuse or harmful content
  const suspiciousPatterns = [
    /^\s*[<{]\s*script/i,  // Script tags
    /^\s*[<{]\s*iframe/i,  // iframes
    /create\s+a\s+(malicious|virus|malware)/i,  // Requesting creation of harmful content
    /\bsql\s+injection\b/i,  // SQL injection attempts
    /\bhack\s+(into|the|a)\b/i,  // Hacking attempts
    /\bexploit\b/i  // General exploitation
  ];
  
  return suspiciousPatterns.some(pattern => pattern.test(text));
}

// In-memory usage tracking (for simple protection - use a database in production)
type UsageTracker = {
  dailyRequests: number; 
  lastReset: number;
}

let usageTracker: UsageTracker = {
  dailyRequests: 0,
  lastReset: Date.now()
};

// Maximum allowed requests per day (adjust as needed)
const MAX_DAILY_REQUESTS = 1000;

// Reset period - 24 hours in milliseconds
const RESET_PERIOD = 24 * 60 * 60 * 1000;

export async function POST(request: Request) {
  try {
    // Check if the usage tracker needs to be reset
    const now = Date.now();
    if (now - usageTracker.lastReset > RESET_PERIOD) {
      usageTracker = {
        dailyRequests: 0,
        lastReset: now
      };
    }
    
    // Check if we've exceeded our daily limit
    if (usageTracker.dailyRequests >= MAX_DAILY_REQUESTS) {
      return NextResponse.json(
        { error: 'Daily API limit exceeded. Service temporarily unavailable.' },
        { status: 429 }
      );
    }
    
    // Get API key from various possible environment variables
    const apiKey = process.env.GROK_API_KEY || process.env.XAI_API_KEY || '';
    
    if (!apiKey) {
      console.error('No API key found in environment variables');
      return NextResponse.json(
        { error: 'API key not configured. Please check server configuration.' },
        { status: 500 }
      );
    }
    
    // Get the request body
    const requestData: ChatRequest = await request.json();
    
    // Validate request data
    if (!requestData.messages || !Array.isArray(requestData.messages) || requestData.messages.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request format. Messages array is required and must not be empty.' },
        { status: 400 }
      );
    }
    
    // Check message length limit
    if (requestData.messages.length > 50) {
      return NextResponse.json(
        { error: 'Too many messages in conversation history. Please start a new conversation.' },
        { status: 400 }
      );
    }

    // Check for suspicious content in the most recent user message
    const userMessages = requestData.messages.filter(msg => msg.role === 'user');
    if (userMessages.length > 0) {
      const lastUserMessage = userMessages[userMessages.length - 1]?.content || '';
      if (containsSuspiciousContent(lastUserMessage)) {
        return NextResponse.json(
          { error: 'Your request contains potentially harmful content and has been blocked.' },
          { status: 400 }
        );
      }
    }
    
    // Log request data (for debugging)
    console.log('Request messages length:', requestData.messages.length);
    
    // Increment the daily request counter
    usageTracker.dailyRequests++;
    
    // Call the xAI Grok API using the server-side environment variable
    try {
      const response = await axios.post<GrokApiResponse>(
        'https://api.x.ai/v1/chat/completions',
        {
          messages: requestData.messages,
          model: 'grok-3-mini-beta',
          stream: false,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      // Log response details (for debugging)
      console.log('API response status:', response.status);
      console.log('Has choices:', !!response.data.choices && response.data.choices.length > 0);
      
      // Extract and return the assistant's response
      const assistantResponse = response.data.choices?.[0]?.message?.content || 
        "I couldn't process that request. Please try again.";
      
      return NextResponse.json({ response: assistantResponse });
    } catch (apiError: unknown) {
      // Detailed API error logging
      const axiosError = apiError as AxiosError<XAIErrorResponse>;
      console.error('xAI API error:');
      console.error('Status:', axiosError.response?.status);
      console.error('Status text:', axiosError.response?.statusText);
      console.error('Response data:', axiosError.response?.data);
      console.error('Request details:', axiosError.config?.url);
      
      throw apiError; // rethrow to be caught by outer catch
    }
  } catch (error: unknown) {
    const genericError = error as Error;
    console.error('Error communicating with Grok API:', genericError.message);
    
    return NextResponse.json(
      { error: 'Failed to communicate with AI service. Please try again later.' },
      { status: 500 }
    );
  }
} 