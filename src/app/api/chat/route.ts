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

export async function POST(request: Request) {
  try {
    // Get API key from various possible environment variables
    const apiKey = process.env.GROK_API_KEY || process.env.XAI_API_KEY || '';
    console.log('API Key present:', !!apiKey);
    console.log('API Key length:', apiKey.length);
    console.log('API Key prefix:', apiKey.substring(0, 6));
    
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
    if (!requestData.messages || !Array.isArray(requestData.messages)) {
      return NextResponse.json(
        { error: 'Invalid request format. Messages array is required.' },
        { status: 400 }
      );
    }
    
    // Log request data (for debugging)
    console.log('Request messages length:', requestData.messages.length);
    
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