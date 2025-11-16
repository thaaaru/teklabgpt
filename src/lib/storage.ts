import { Conversation, UserSettings, AIProvider } from '@/types';

const CONVERSATIONS_KEY = 'elintgpt_conversations';
const SETTINGS_KEY = 'elintgpt_settings';

export const defaultSettings: UserSettings = {
  theme: 'system',
  defaultProvider: 'claude',
  fontSize: 'medium',
  codeTheme: 'github-dark',
  openRouterApiKey: undefined,
  providers: {
    claude: {
      name: 'Claude',
      enabled: true,
      color: '#CC9B7A',
      icon: '🤖',
      model: 'anthropic/claude-3.5-sonnet',
    },
    chatgpt: {
      name: 'ChatGPT',
      enabled: true,
      color: '#10A37F',
      icon: '💬',
      model: 'openai/gpt-4-turbo',
    },
    gemini: {
      name: 'Gemini',
      enabled: true,
      color: '#8E75F5',
      icon: '✨',
      model: 'google/gemini-pro-1.5',
    },
    perplexity: {
      name: 'Perplexity',
      enabled: true,
      color: '#20808D',
      icon: '🔍',
      model: 'perplexity/llama-3.1-sonar-large-128k-online',
    },
  },
};

export const getConversations = (): Conversation[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(CONVERSATIONS_KEY);
  if (!stored) return [];
  const parsed = JSON.parse(stored);
  return parsed.map((conv: Conversation) => ({
    ...conv,
    createdAt: new Date(conv.createdAt),
    updatedAt: new Date(conv.updatedAt),
    messages: conv.messages.map((msg) => ({
      ...msg,
      timestamp: new Date(msg.timestamp),
    })),
  }));
};

export const saveConversations = (conversations: Conversation[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
};

export const getSettings = (): UserSettings => {
  if (typeof window === 'undefined') return defaultSettings;
  const stored = localStorage.getItem(SETTINGS_KEY);
  if (!stored) return defaultSettings;
  return { ...defaultSettings, ...JSON.parse(stored) };
};

export const saveSettings = (settings: UserSettings) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

export const createConversation = (provider: AIProvider, title?: string): Conversation => {
  return {
    id: crypto.randomUUID(),
    title: title || 'New Conversation',
    messages: [],
    provider,
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: [],
  };
};

export const exportConversation = (conversation: Conversation, format: 'json' | 'markdown' | 'txt') => {
  const fileName = `${conversation.title.replace(/[^a-z0-9]/gi, '_')}_${conversation.id.slice(0, 8)}`;

  let content = '';
  let mimeType = 'text/plain';

  if (format === 'json') {
    content = JSON.stringify(conversation, null, 2);
    mimeType = 'application/json';
  } else if (format === 'markdown') {
    content = `# ${conversation.title}\n\n`;
    content += `**Provider:** ${conversation.provider}\n`;
    content += `**Created:** ${conversation.createdAt.toLocaleString()}\n\n`;
    content += `---\n\n`;
    conversation.messages.forEach((msg) => {
      content += `### ${msg.role === 'user' ? 'User' : 'Assistant'}\n\n`;
      content += `${msg.content}\n\n`;
    });
    mimeType = 'text/markdown';
  } else {
    content = `${conversation.title}\n${'='.repeat(conversation.title.length)}\n\n`;
    conversation.messages.forEach((msg) => {
      content += `[${msg.role.toUpperCase()}]\n${msg.content}\n\n`;
    });
  }

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileName}.${format}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
