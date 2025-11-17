export type LLMId = string;

export type LLMConfig = {
  id: LLMId;
  label: string;
  description: string;
  accent: string;
};

export const DEFAULT_LLM_CONFIG: LLMConfig[] = [
  {
    id: 'openai/gpt-4o-mini',
    label: 'ChatGPT (GPT-4o mini)',
    description: 'Reasoning & ideation',
    accent: 'from-emerald-500 to-teal-400',
  },
  {
    id: 'google/gemini-2.0-flash-001',
    label: 'Gemini 2.0 Flash',
    description: 'Realtime multimodal',
    accent: 'from-sky-400 to-cyan-500',
  },
  {
    id: 'anthropic/claude-3.5-sonnet',
    label: 'Claude 3.5 Sonnet',
    description: 'Enterprise analysis',
    accent: 'from-indigo-500 to-blue-500',
  },
  {
    id: 'perplexity/sonar',
    label: 'Perplexity Sonar',
    description: 'Search & synthesis',
    accent: 'from-fuchsia-500 to-pink-500',
  },
  {
    id: 'deepseek/deepseek-chat',
    label: 'DeepSeek Chat',
    description: 'Fast pragmatic reasoning',
    accent: 'from-orange-400 to-amber-500',
  },
  {
    id: 'qwen/qwen-2.5-72b-instruct',
    label: 'Qwen 2.5 72B',
    description: 'Multilingual + code',
    accent: 'from-purple-500 to-rose-500',
  },
];

const ACCENT_FALLBACKS = [
  'from-emerald-500 to-lime-500',
  'from-sky-500 to-blue-500',
  'from-fuchsia-500 to-rose-500',
  'from-amber-500 to-orange-600',
  'from-cyan-500 to-blue-500',
  'from-purple-500 to-indigo-500',
  'from-teal-500 to-emerald-500',
];

/**
 * Fallback accent selector that produces a stable gradient per model id.
 */
export function pickAccentForModel(modelId: string): string {
  const hash = Array.from(modelId).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return ACCENT_FALLBACKS[hash % ACCENT_FALLBACKS.length];
}
