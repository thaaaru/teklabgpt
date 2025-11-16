export type AIProvider = 'claude' | 'chatgpt' | 'gemini' | 'perplexity';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  provider?: AIProvider;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  provider: AIProvider;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
}

export interface AIProviderConfig {
  name: string;
  enabled: boolean;
  color: string;
  icon: string;
  model: string;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  defaultProvider: AIProvider;
  openRouterApiKey?: string;
  providers: Record<AIProvider, AIProviderConfig>;
  fontSize: 'small' | 'medium' | 'large';
  codeTheme: string;
}
