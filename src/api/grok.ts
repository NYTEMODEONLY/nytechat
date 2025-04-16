import axios from 'axios';
import { getSystemPrompt, AIPersona, nytemodePerson } from '../lib/personas';

// Interface for chat message
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

// Function to send message to our server API which proxies to Grok
export const sendMessageToGrok = async (
  userMessage: string, 
  conversationHistory: ChatMessage[] = [],
  persona: AIPersona = nytemodePerson
): Promise<string> => {
  try {
    // Use the provided persona's system prompt
    const systemPrompt = persona.systemPrompt;
    
    // Format the conversation history for the API
    const messages = [
      {
        role: 'system',
        content: systemPrompt
      },
      ...conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      {
        role: 'user',
        content: userMessage
      }
    ];

    console.log('Sending request to API endpoint with message count:', messages.length);
    
    // Call our own server-side API endpoint instead of directly calling xAI
    try {
      const response = await axios.post('/api/chat', { messages });
      console.log('API response received:', !!response.data);
      
      // Extract the assistant's response from our API response
      if (response.data?.response) {
        return response.data.response;
      } 
      
      if (response.data?.error) {
        console.error('API returned error:', response.data.error);
        throw new Error(response.data.error);
      }
      
      console.error('API response format unexpected:', response.data);
      throw new Error('Unexpected API response format');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message
        });
      }
      throw error;
    }
  } catch (error) {
    console.error('Error communicating with API:', error);
    throw new Error('Failed to communicate with AI. Please try again later.');
  }
}; 