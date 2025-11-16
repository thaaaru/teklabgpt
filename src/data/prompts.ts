export type PromptCategory =
  | 'Writing'
  | 'Productivity'
  | 'Developer'
  | 'Research'
  | 'Design'
  | 'Strategy';

export type PromptDefinition = {
  id: string;
  title: string;
  category: PromptCategory;
  summary: string;
  prompt: string;
  source?: string;
};

export const PROMPT_LIBRARY: PromptDefinition[] = [
  {
    id: 'ux-writer',
    title: 'Senior UX Writer',
    category: 'Design',
    summary: 'Generate concise, user-friendly interface copy.',
    prompt:
      'You are a senior UX writer. Rewrite the following interface copy so it is clear, confident, and accessible. Return the new copy plus a short rationale. Input:\n\n{{context}}',
    source: 'awesome-chatgpt-prompts',
  },
  {
    id: 'ai-product-manager',
    title: 'AI Product Manager',
    category: 'Strategy',
    summary: 'Translate requirements into AI product strategies.',
    prompt:
      'Act as an AI Product Manager. Given the requirements, produce success metrics, data dependencies, and a phased delivery plan. Requirements:\n\n{{context}}',
    source: 'awesome-chatgpt-prompts',
  },
  {
    id: 'socratic-tutor',
    title: 'Socratic Tutor',
    category: 'Research',
    summary: 'Teach step-by-step by asking guided questions.',
    prompt:
      'You are a Socratic tutor. Lead the learner through the problem using questions. Do not give the answer directly. Topic:\n\n{{context}}',
    source: 'awesome-chatgpt-prompts',
  },
  {
    id: 'code-reviewer',
    title: 'Code Reviewer',
    category: 'Developer',
    summary: 'Offer precise feedback for pull requests.',
    prompt:
      'You are a meticulous code reviewer. Identify bugs, missing tests, and maintainability concerns in the diff below. Respond with bullet points grouped by severity. Diff:\n\n{{context}}',
    source: 'awesome-chatgpt-prompts',
  },
  {
    id: 'meeting-notes',
    title: 'Meeting Notes Synthesizer',
    category: 'Productivity',
    summary: 'Convert transcripts into SMART action items.',
    prompt:
      'You convert raw meeting transcripts into an executive summary, decisions log, and SMART action items. Transcript:\n\n{{context}}',
    source: 'awesome-chatgpt-prompts',
  },
  {
    id: 'idea-machine',
    title: 'Idea Machine',
    category: 'Writing',
    summary: 'Brainstorm themed concepts with insights.',
    prompt:
      'You are an idea machine. Generate five creative concepts on the theme below. For each idea provide a short description and one potential pitfall. Theme:\n\n{{context}}',
    source: 'awesome-chatgpt-prompts',
  },
];

export type PromptCategoryFilter = 'All' | PromptCategory;

export const PROMPT_CATEGORIES: PromptCategoryFilter[] = [
  'All',
  'Writing',
  'Productivity',
  'Developer',
  'Research',
  'Design',
  'Strategy',
];
