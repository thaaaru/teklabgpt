import { AIProvider, Message } from '@/types';

interface StreamCallback {
  onToken?: (token: string) => void;
  onComplete?: (fullResponse: string) => void;
  onError?: (error: Error) => void;
}

/**
 * OpenRouter model mapping for each provider
 * Full list: https://openrouter.ai/models
 */
const OPENROUTER_MODELS: Record<AIProvider, string> = {
  claude: 'anthropic/claude-3.5-sonnet',
  chatgpt: 'openai/gpt-4-turbo',
  gemini: 'google/gemini-pro-1.5',
  perplexity: 'perplexity/llama-3.1-sonar-large-128k-online',
};

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * Send a message using OpenRouter API
 * OpenRouter provides a unified API for multiple AI providers
 * Docs: https://openrouter.ai/docs
 *
 * @param provider - The AI provider to use
 * @param messages - Array of conversation messages
 * @param apiKey - OpenRouter API key
 * @param callbacks - Optional callbacks for streaming
 * @returns Promise resolving to the AI's response
 */
export async function sendMessage(
  provider: AIProvider,
  messages: Message[],
  apiKey: string,
  callbacks?: StreamCallback
): Promise<string> {
  if (!apiKey) {
    throw new Error('OpenRouter API key is required');
  }

  const model = OPENROUTER_MODELS[provider];
  if (!model) {
    throw new Error(`Unknown provider: ${provider}`);
  }

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://elintgpt.app',
        'X-Title': 'ELINT-GPT',
      },
      body: JSON.stringify({
        model: model,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `OpenRouter API error (${response.status}): ${errorData.error?.message || response.statusText}`
      );
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response from OpenRouter API');
    }

    const content = data.choices[0].message.content;
    callbacks?.onComplete?.(content);
    return content;

  } catch (error) {
    callbacks?.onError?.(error as Error);
    throw error;
  }
}

/**
 * Send a message with streaming support
 * OpenRouter supports SSE streaming for real-time responses
 *
 * @param provider - The AI provider to use
 * @param messages - Array of conversation messages
 * @param apiKey - OpenRouter API key
 * @param callbacks - Callbacks for streaming tokens
 */
export async function sendMessageStreaming(
  provider: AIProvider,
  messages: Message[],
  apiKey: string,
  callbacks: StreamCallback
): Promise<string> {
  if (!apiKey) {
    throw new Error('OpenRouter API key is required');
  }

  const model = OPENROUTER_MODELS[provider];
  if (!model) {
    throw new Error(`Unknown provider: ${provider}`);
  }

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://elintgpt.app',
        'X-Title': 'ELINT-GPT',
      },
      body: JSON.stringify({
        model: model,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `OpenRouter API error (${response.status}): ${errorData.error?.message || response.statusText}`
      );
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body available for streaming');
    }

    const decoder = new TextDecoder();
    let fullContent = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim() !== '');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices[0]?.delta?.content;
            if (content) {
              fullContent += content;
              callbacks?.onToken?.(content);
            }
          } catch (e) {
            // Skip malformed JSON chunks
            console.warn('Failed to parse streaming chunk:', e);
          }
        }
      }
    }

    callbacks?.onComplete?.(fullContent);
    return fullContent;

  } catch (error) {
    callbacks?.onError?.(error as Error);
    throw error;
  }
}

/**
 * Check if OpenRouter is configured (has API key)
 * @param apiKey - API key to validate
 * @returns boolean indicating if OpenRouter is ready to use
 */
export function isProviderConfigured(apiKey?: string): boolean {
  return !!apiKey && apiKey.length > 0;
}

/**
 * Get available models for a provider
 * @param provider - The AI provider
 * @returns The OpenRouter model ID
 */
export function getModelForProvider(provider: AIProvider): string {
  return OPENROUTER_MODELS[provider];
}

/**
 * Verify OpenRouter API key
 * @param apiKey - OpenRouter API key to verify
 * @returns Promise<boolean> indicating if the key is valid
 */
export async function verifyApiKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}
