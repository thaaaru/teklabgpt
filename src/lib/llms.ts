export type LLMId = 'chatgpt' | 'claude' | 'gemini' | 'perplexity';

export type LLMConfig = {
  id: LLMId;
  label: string;
  description: string;
  accent: string;
  model: string;
};

export const LLM_CONFIG: LLMConfig[] = [
  {
    id: 'chatgpt',
    label: 'ChatGPT',
    description: 'Reasoning & ideation',
    accent: 'from-emerald-500 to-teal-400',
    model: 'openai/gpt-4o-mini',
  },
  {
    id: 'claude',
    label: 'Claude',
    description: 'Enterprise analysis',
    accent: 'from-indigo-500 to-blue-500',
    model: 'anthropic/claude-3.5-sonnet',
  },
  {
    id: 'gemini',
    label: 'Gemini',
    description: 'Multimodal research',
    accent: 'from-sky-400 to-cyan-500',
    model: 'google/gemini-flash-1.5',
  },
  {
    id: 'perplexity',
    label: 'Perplexity',
    description: 'Search & synthesis',
    accent: 'from-fuchsia-500 to-pink-500',
    model: 'perplexity/sonar-large-online',
  },
];

export const getModelIdForLLM = (id: string) => LLM_CONFIG.find((config) => config.id === id)?.model;
