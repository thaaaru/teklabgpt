'use client';

import { type ComponentType, type KeyboardEvent, type ReactNode, useMemo, useState } from 'react';
import {
  Bot,
  Brain,
  BookOpen,
  Clock3,
  Eye,
  FilePenLine,
  Filter,
  FolderKanban,
  FolderPlus,
  History,
  Mic,
  Paperclip,
  Search,
  Sparkles,
  Trash2,
  Workflow,
  MessageSquare,
  Wand2,
  Loader2,
  X,
} from 'lucide-react';
import { LLM_CONFIG, type LLMId } from '@/lib/llms';
import { PROMPT_CATEGORIES, PROMPT_LIBRARY, type PromptDefinition, type PromptCategoryFilter } from '@/data/prompts';

type LLMDefinition = (typeof LLM_CONFIG)[number] & {
  icon: ComponentType<{ className?: string }>;
};

type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
};

type SidebarLink = {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  meta?: string;
};

type PromptHistoryEntry = {
  id: string;
  title: string;
  prompt: string;
  category: string;
  timestamp: string;
};

type ProjectChatRecord = {
  id: string;
  projectId: string;
  title: string;
  llmId: LLMId;
  createdAt: string;
  messages: Message[];
};

const iconMap: Record<string, ComponentType<{ className?: string }>> = {
  chatgpt: Sparkles,
  claude: Brain,
  gemini: Wand2,
  perplexity: Workflow,
};

const llms: LLMDefinition[] = LLM_CONFIG.map((config) => ({
  ...config,
  icon: iconMap[config.id] ?? Sparkles,
}));

type ProjectLink = SidebarLink & {
  summary: string;
  owner: string;
  status: string;
  lastUpdated: string;
  brief: string;
};

const projectLinks: ProjectLink[] = [
  {
    id: 'atlas',
    label: 'Atlas Workspace',
    icon: FolderKanban,
    summary: 'AI-powered analyst console for cyber teams.',
    owner: 'Nova Ops',
    status: 'Active sprints',
    lastUpdated: 'Yesterday',
    brief: 'Deliver a multi-agent workspace with search, playbooks, and SOC automations prioritized for Q1.',
  },
  {
    id: 'delta',
    label: 'Delta Experiments',
    icon: FolderKanban,
    summary: 'R&D sandbox for frontier models and agents.',
    owner: 'Skunkworks',
    status: 'In discovery',
    lastUpdated: '2 days ago',
    brief: 'Prototype speculative features (voice loops, shared memory) before promotion into the core product.',
  },
];

const recentChats: SidebarLink[] = [
  { id: 'ux-refresh', label: 'UX refresh for AI console', icon: MessageSquare, meta: '2h ago' },
  { id: 'api-design', label: 'Plan bulk ingestion API', icon: MessageSquare, meta: '5h ago' },
  { id: 'research', label: 'Summarize privacy research', icon: MessageSquare, meta: 'Yesterday' },
];

const timestamp = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

type ProjectModalState =
  | { type: 'action'; payload: ProjectActionDefinition }
  | { type: 'project'; payload: ProjectLink }
  | null;

export default function MultiLLMInterface() {
  const [activeLLM, setActiveLLM] = useState<LLMId>(llms[0].id);
  const [composerValue, setComposerValue] = useState('');
  const [conversations, setConversations] = useState<Record<string, Message[]>>(() =>
    llms.reduce((acc, llm) => {
      acc[llm.id] = [
        {
          id: `intro-${llm.id}`,
          role: 'assistant',
          content: 'Where should we begin?',
          timestamp: 'Now',
        },
      ];
      return acc;
    }, {} as Record<string, Message[]>),
  );
  const [pendingLLMs, setPendingLLMs] = useState<Record<string, boolean>>(() =>
    llms.reduce((acc, llm) => {
      acc[llm.id] = false;
      return acc;
    }, {} as Record<string, boolean>),
  );
  const [errors, setErrors] = useState<Record<string, string | null>>(() =>
    llms.reduce((acc, llm) => {
      acc[llm.id] = null;
      return acc;
    }, {} as Record<string, string | null>),
  );
  const [isPromptModalOpen, setPromptModalOpen] = useState(false);
  const [promptSearch, setPromptSearch] = useState('');
  const [promptCategory, setPromptCategory] = useState<PromptCategoryFilter>('All');
  const [promptHistory, setPromptHistory] = useState<PromptHistoryEntry[]>([]);
  const [projectModalState, setProjectModalState] = useState<ProjectModalState>(null);
  const [projectChats, setProjectChats] = useState<Record<string, ProjectChatRecord[]>>({});

  const resetConversationForLLM = (llmId: string) => {
    setConversations((prev) => ({
      ...prev,
      [llmId]: [
        {
          id: `intro-${llmId}-${Date.now()}`,
          role: 'assistant',
          content: 'Where should we begin?',
          timestamp: timestamp(),
        },
      ],
    }));
  };

  const handleMoveChatToProject = (projectId: string) => {
    const currentMessages = conversations[activeLLM] ?? [];
    if (!currentMessages.length) {
      setErrors((prev) => ({
        ...prev,
        [activeLLM]: 'No conversation to move into a project yet.',
      }));
      return;
    }

    const project = projectLinks.find((link) => link.id === projectId);
    if (!project) return;
    const llmMeta = llms.find((llm) => llm.id === activeLLM);

    const newChat: ProjectChatRecord = {
      id: `project-chat-${Date.now()}`,
      projectId,
      title: `${project.label} • ${llmMeta?.label ?? 'Chat'} • ${new Date().toLocaleTimeString()}`,
      llmId: activeLLM,
      createdAt: timestamp(),
      messages: currentMessages.map((message) => ({ ...message })),
    };

    setProjectChats((prev) => ({
      ...prev,
      [projectId]: [newChat, ...(prev[projectId] ?? [])],
    }));
    resetConversationForLLM(activeLLM);
    setProjectModalState(null);
  };

  const handleCreateProjectChat = (projectId: string) => {
    const project = projectLinks.find((link) => link.id === projectId);
    if (!project) return;
    const llmMeta = llms.find((llm) => llm.id === activeLLM);

    const introMessage: Message = {
      id: `project-intro-${projectId}-${Date.now()}`,
      role: 'assistant',
      content: `Starting a ${llmMeta?.label ?? 'model'} chat for ${project.label}. What should we focus on?`,
      timestamp: timestamp(),
    };

    const newChat: ProjectChatRecord = {
      id: `project-chat-${Date.now()}`,
      projectId,
      title: `${project.label} • ${llmMeta?.label ?? 'Chat'} • ${new Date().toLocaleDateString()}`,
      llmId: activeLLM,
      createdAt: timestamp(),
      messages: [introMessage],
    };

    setProjectChats((prev) => ({
      ...prev,
      [projectId]: [newChat, ...(prev[projectId] ?? [])],
    }));
    setConversations((prev) => ({
      ...prev,
      [activeLLM]: newChat.messages.map((message) => ({ ...message })),
    }));
    setProjectModalState(null);
  };

  const handleLoadProjectChat = (projectId: string, chatId: string) => {
    const chats = projectChats[projectId] ?? [];
    const chat = chats.find((entry) => entry.id === chatId);
    if (!chat) return;

    setActiveLLM(chat.llmId);
    setConversations((prev) => ({
      ...prev,
      [chat.llmId]: chat.messages.map((message) => ({ ...message })),
    }));
    setProjectModalState(null);
  };

  const activeConversation = conversations[activeLLM] ?? [];
  const isThinking = pendingLLMs[activeLLM];
  const activeError = errors[activeLLM];
  const filteredPrompts = useMemo(() => {
    const query = promptSearch.trim().toLowerCase();
    return PROMPT_LIBRARY.filter((prompt) => {
      const matchesCategory = promptCategory === 'All' || prompt.category === promptCategory;
      const matchesQuery =
        !query ||
        prompt.title.toLowerCase().includes(query) ||
        prompt.summary.toLowerCase().includes(query) ||
        prompt.prompt.toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });
  }, [promptSearch, promptCategory]);

  const handleSend = async () => {
    if (!composerValue.trim() || isThinking) return;
    const trimmed = composerValue.trim();
    const llmMeta = llms.find((llm) => llm.id === activeLLM);

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: timestamp(),
    };

    const updatedThread = [...(conversations[activeLLM] ?? []), newMessage];

    setConversations((prev) => ({
      ...prev,
      [activeLLM]: updatedThread,
    }));
    setComposerValue('');
    setPendingLLMs((prev) => ({ ...prev, [activeLLM]: true }));
    setErrors((prev) => ({ ...prev, [activeLLM]: null }));

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          modelId: activeLLM,
          messages: updatedThread.map((message) => ({
            role: message.role,
            content: message.content,
          })),
        }),
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error(errorPayload?.error ?? `Model ${llmMeta?.label ?? 'LLM'} is unavailable.`);
      }

      const data = await response.json();
      const assistantMessage = data?.message;
      const content = parseAssistantContent(assistantMessage?.content);

      const nextMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: content ?? `I couldn't generate a response as ${llmMeta?.label ?? 'this model'}.`,
        timestamp: timestamp(),
      };

      setConversations((prev) => ({
        ...prev,
        [activeLLM]: [...(prev[activeLLM] ?? updatedThread), nextMessage],
      }));
    } catch (error) {
      const fallbackMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, something went wrong while contacting OpenRouter.',
        timestamp: timestamp(),
      };
      setErrors((prev) => ({
        ...prev,
        [activeLLM]: error instanceof Error ? error.message : 'Unknown error occurred.',
      }));
      setConversations((prev) => ({
        ...prev,
        [activeLLM]: [...(prev[activeLLM] ?? updatedThread), fallbackMessage],
      }));
    } finally {
      setPendingLLMs((prev) => ({ ...prev, [activeLLM]: false }));
    }
  };

  const handlePromptSelected = (prompt: PromptDefinition) => {
    setComposerValue(prompt.prompt);
    setPromptHistory((prev) => {
      const filtered = prev.filter((entry) => entry.id !== prompt.id);
      const nextEntry: PromptHistoryEntry = {
        id: prompt.id,
        title: prompt.title,
        prompt: prompt.prompt,
        category: prompt.category,
        timestamp: timestamp(),
      };
      return [nextEntry, ...filtered].slice(0, 6);
    });
    setPromptModalOpen(false);
  };

  const handlePromptHistorySelect = (entry: PromptHistoryEntry) => {
    setComposerValue(entry.prompt);
  };

  const handleProjectAction = (action: string) => {
    const payload = projectCrudActions.find((item) => item.id === action);
    if (!payload) return;
    setProjectModalState({ type: 'action', payload });
  };

  const handleProjectLinkClick = (link: SidebarLink) => {
    const project = projectLinks.find((entry) => entry.id === link.id);
    if (!project) return;
    setProjectModalState({ type: 'project', payload: project });
  };

  const handleInsertFromProject = (text: string) => {
    setComposerValue(text);
    setProjectModalState(null);
  };

  return (
    <div className="min-h-screen w-full bg-[#05080f] text-slate-100 flex">
      <Sidebar
        onOpenPromptLibrary={() => setPromptModalOpen(true)}
        promptHistory={promptHistory}
        onSelectPromptHistory={handlePromptHistorySelect}
        onProjectAction={handleProjectAction}
        onProjectSelected={handleProjectLinkClick}
      />

      <div className="flex-1 flex flex-col border-l border-white/5 bg-gradient-to-br from-[#0a101c] via-[#05080f] to-[#020409]">
        <TopNavigation activeLLM={activeLLM} onSelectLLM={setActiveLLM} />

        <ConversationPane activeLLM={activeLLM} messages={activeConversation} isLoading={isThinking} error={activeError} />

        <MessageComposer
          value={composerValue}
          onChange={setComposerValue}
          onSubmit={handleSend}
          disabled={isThinking}
        />
      </div>

      <PromptLibraryModal
        isOpen={isPromptModalOpen}
        onClose={() => setPromptModalOpen(false)}
        prompts={filteredPrompts}
        searchValue={promptSearch}
        onSearchChange={setPromptSearch}
        category={promptCategory}
        onCategoryChange={setPromptCategory}
        onSelectPrompt={handlePromptSelected}
      />

      <ProjectModal
        state={projectModalState}
        onClose={() => setProjectModalState(null)}
        onInsert={handleInsertFromProject}
        projectChats={projectChats}
        onMoveChat={handleMoveChatToProject}
        onCreateChat={handleCreateProjectChat}
        onLoadChat={handleLoadProjectChat}
      />
    </div>
  );
}

function parseAssistantContent(content: unknown): string | null {
  if (!content) return null;
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .map((segment) => {
        if (typeof segment === 'string') return segment;
        if (segment && typeof segment === 'object' && 'text' in segment && typeof segment.text === 'string') {
          return segment.text;
        }
        return '';
      })
      .filter(Boolean)
      .join('\n');
  }
  if (typeof content === 'object' && 'text' in (content as { text?: string })) {
    const segment = content as { text?: string };
    return segment.text ?? null;
  }
  return null;
}

type SidebarProps = {
  onOpenPromptLibrary: () => void;
  promptHistory: PromptHistoryEntry[];
  onSelectPromptHistory: (entry: PromptHistoryEntry) => void;
  onProjectAction: (action: string) => void;
  onProjectSelected: (project: ProjectLink) => void;
};

function Sidebar({
  onOpenPromptLibrary,
  promptHistory,
  onSelectPromptHistory,
  onProjectAction,
  onProjectSelected,
}: SidebarProps) {
  return (
    <aside className="w-72 bg-[#070b14] border-r border-white/5 flex flex-col p-6 gap-6">
      <div className="flex items-center justify-center gap-2 rounded-2xl bg-white/10 text-white py-3 font-semibold tracking-[0.3em] uppercase">
        <span className="text-xs text-white/60">TBD</span>
        <span className="text-sm">GPT</span>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
        <input
          className="w-full bg-white/5 rounded-2xl pl-11 pr-4 py-3 text-sm placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/10"
          placeholder="Search"
        />
      </div>

      <SidebarLibrary onOpenPromptLibrary={onOpenPromptLibrary} />
      <ProjectsSection onAction={onProjectAction} />
      <SidebarSection title="Projects" links={projectLinks} onLinkClick={onProjectSelected} />
      <PromptHistorySection history={promptHistory} onSelect={onSelectPromptHistory} />
      <SidebarSection title="Chats" links={recentChats} stacked />
    </aside>
  );
}

function SidebarSection<TLink extends SidebarLink>({
  title,
  links,
  stacked,
  onLinkClick,
}: {
  title: string;
  links: TLink[];
  stacked?: boolean;
  onLinkClick?: (link: TLink) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs uppercase tracking-[0.2em] text-white/50">{title}</p>
      <div className="space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <button
              key={link.id}
              className={`flex w-full items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-left text-sm hover:border-white/20 hover:bg-white/10 transition ${
                stacked ? 'flex-col items-start gap-1' : 'gap-3'
              }`}
              onClick={() => onLinkClick?.(link)}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 text-white/60" />
                <span>{link.label}</span>
              </div>
              {link.meta && <span className="text-xs text-white/40">{link.meta}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SidebarLibrary({ onOpenPromptLibrary }: { onOpenPromptLibrary: () => void }) {
  return (
    <div className="space-y-3">
      <p className="text-xs uppercase tracking-[0.2em] text-white/50">Library</p>
      <button
        className="w-full rounded-2xl border border-white/5 bg-gradient-to-br from-white/10 to-transparent px-4 py-4 text-left hover:border-white/20 transition"
        onClick={onOpenPromptLibrary}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-white/10">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-semibold">Prompt library</p>
            <p className="text-xs text-white/60">Browse curated prompts</p>
          </div>
        </div>
      </button>
    </div>
  );
}

type ProjectActionDefinition = {
  id: string;
  label: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  template: string;
};

const projectCrudActions: ProjectActionDefinition[] = [
  {
    id: 'create',
    label: 'Create',
    description: 'Spin up a fresh workspace',
    icon: FolderPlus,
    template:
      'Create a new AI workspace project brief with goals, success metrics, risks, and a 30/60/90-day delivery plan.',
  },
  {
    id: 'read',
    label: 'Review',
    description: 'Audit current initiatives',
    icon: Eye,
    template:
      'Summarize project health, blockers, and dependencies for the current sprint across all AI initiatives.',
  },
  {
    id: 'update',
    label: 'Update',
    description: 'Triage backlog & milestones',
    icon: FilePenLine,
    template:
      'Update the roadmap for our AI projects with reprioritized milestones and the rationale behind each change.',
  },
  {
    id: 'delete',
    label: 'Archive',
    description: 'Close or pause a project',
    icon: Trash2,
    template:
      'Draft an archive note for the project, outlining what was learned, what artifacts to keep, and next steps.',
  },
];

function ProjectsSection({ onAction }: { onAction: (action: string) => void }) {
  return (
    <div className="space-y-3">
      <p className="text-xs uppercase tracking-[0.2em] text-white/50">Projects • CRUD</p>
      <div className="grid grid-cols-2 gap-2">
        {projectCrudActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => onAction(action.id)}
              className="rounded-2xl border border-white/5 bg-white/5 px-3 py-3 text-left hover:border-white/20 hover:bg-white/10 transition"
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className="w-4 h-4 text-white/70" />
                <span className="text-sm font-semibold">{action.label}</span>
              </div>
              <p className="text-xs text-white/50">{action.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PromptHistorySection({
  history,
  onSelect,
}: {
  history: PromptHistoryEntry[];
  onSelect: (entry: PromptHistoryEntry) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs uppercase tracking-[0.2em] text-white/50">Prompt history</p>
      {history.length === 0 ? (
        <p className="text-xs text-white/40">Select prompts from the library to build your history.</p>
      ) : (
        <div className="space-y-2">
          {history.map((entry) => (
            <button
              key={entry.id}
              className="w-full rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-left hover:border-white/20 hover:bg-white/10 transition"
              onClick={() => onSelect(entry)}
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">{entry.title}</p>
                  <p className="text-xs text-white/50">{entry.category}</p>
                </div>
                <Clock3 className="w-4 h-4 text-white/30" />
              </div>
              <p className="text-xs text-white/40 mt-1">{entry.timestamp}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function TopNavigation({ activeLLM, onSelectLLM }: { activeLLM: LLMId; onSelectLLM: (id: LLMId) => void }) {
  return (
    <header className="border-b border-white/5 px-8 pt-6 pb-4 backdrop-blur">
      <div className="flex items-center gap-3 mb-4">
        <History className="w-4 h-4 text-white/40" />
        <span className="text-white/70 text-sm">Choose a model</span>
      </div>
      <div className="flex flex-wrap gap-3">
        {llms.map((llm) => {
          const Icon = llm.icon;

          const isActive = llm.id === activeLLM;
          return (
            <button
              key={llm.id}
              onClick={() => onSelectLLM(llm.id)}
              className={`flex-1 min-w-[180px] rounded-2xl border px-4 py-4 text-left transition ${
                isActive ? 'border-white bg-white/10' : 'border-white/10 bg-white/5 hover:border-white/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl bg-gradient-to-br ${llm.accent}`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-semibold">{llm.label}</p>
                  <p className="text-xs text-white/60">{llm.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </header>
  );
}

function ConversationPane({
  activeLLM,
  messages,
  isLoading,
  error,
}: {
  activeLLM: string;
  messages: Message[];
  isLoading: boolean;
  error?: string | null;
}) {
  const llmMeta = useMemo(() => llms.find((llm) => llm.id === activeLLM), [activeLLM]);

  return (
    <section className="flex-1 flex flex-col items-center overflow-hidden px-6 md:px-12">
      <div className="w-full max-w-3xl flex-1 overflow-y-auto py-10 space-y-6">
        <div className="text-center space-y-2">
          <p className="uppercase text-xs tracking-[0.4em] text-white/30">Conversation with</p>
          <h1 className="text-3xl md:text-4xl font-semibold">{llmMeta?.label}</h1>
          <p className="text-white/60">Where should we begin?</p>
        </div>

        {error && (
          <div className="rounded-3xl border border-red-500/40 bg-red-500/10 text-red-100 text-sm px-5 py-4">
            {error}
          </div>
        )}

        {isLoading && (
          <div className="flex items-center gap-2 text-white/60 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{llmMeta?.label ?? 'This model'} is thinking...</span>
          </div>
        )}

        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-3xl px-5 py-4 text-sm leading-relaxed ${
                  message.role === 'user'
                    ? 'bg-white text-black rounded-br-none'
                    : 'bg-white/5 border border-white/10 rounded-bl-none'
                }`}
              >
                <div className={message.role === 'system' ? 'italic text-white/70' : undefined}>
                  {renderFormattedContent(message.content)}
                </div>
                <span className="block text-xs mt-2 text-white/50">{message.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MessageComposer({
  value,
  onChange,
  onSubmit,
  disabled,
}: {
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}) {
  const handleSubmit = () => {
    if (disabled || !value.trim()) return;
    void onSubmit();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="px-6 md:px-12 pb-10">
      <div className="max-w-3xl mx-auto rounded-3xl border border-white/10 bg-white/5 backdrop-blur-lg">
        <div className="flex items-center gap-3 px-4 pt-4 text-white/50 text-xs">
          <Bot className="w-3.5 h-3.5" />
          <span>Secure client-side context — API keys stay local</span>
        </div>
        <div className="flex items-end gap-3 px-4 py-4">
          <div className="flex items-center gap-2">
            <button className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition">
              <Paperclip className="w-4 h-4" />
            </button>
            <button className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition">
              <Mic className="w-4 h-4" />
            </button>
          </div>
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={2}
            placeholder="Ask anything — research, planning, brainstorming..."
            className="flex-1 bg-transparent resize-none outline-none text-sm text-white placeholder:text-white/40"
            onKeyDown={handleKeyDown}
            disabled={disabled}
          />
          <button
            onClick={handleSubmit}
            className="px-5 py-3 rounded-2xl bg-white text-black text-sm font-medium hover:bg-slate-100 transition disabled:opacity-40"
            disabled={!value.trim() || disabled}
          >
            {disabled ? 'Thinking…' : 'Send'}
          </button>
        </div>
        <div className="px-4 pb-4 text-xs text-white/40">
          Powered by OpenRouter — requests stay in your browser until sent.
        </div>
      </div>
    </div>
  );
}

type PromptLibraryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  prompts: PromptDefinition[];
  searchValue: string;
  onSearchChange: (value: string) => void;
  category: PromptCategoryFilter;
  onCategoryChange: (category: PromptCategoryFilter) => void;
  onSelectPrompt: (prompt: PromptDefinition) => void;
};

function PromptLibraryModal({
  isOpen,
  onClose,
  prompts,
  searchValue,
  onSearchChange,
  category,
  onCategoryChange,
  onSelectPrompt,
}: PromptLibraryModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8">
      <div className="w-full max-w-5xl rounded-3xl border border-white/10 bg-[#050a16] shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-white/40">Prompt Library</p>
            <h3 className="text-2xl font-semibold">Browse curated super-prompts</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-2xl border border-white/10 hover:border-white/30 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                value={searchValue}
                onChange={(event) => onSearchChange(event.target.value)}
                className="w-full bg-white/5 rounded-2xl pl-11 pr-4 py-3 text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/15"
                placeholder="Search prompts"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto">
              <Filter className="w-4 h-4 text-white/40" />
              {PROMPT_CATEGORIES.map((option) => (
                <button
                  key={option}
                  onClick={() => onCategoryChange(option)}
                  className={`rounded-2xl px-3 py-2 text-xs uppercase tracking-wide border ${
                    option === category
                      ? 'border-white text-white'
                      : 'border-white/10 text-white/60 hover:border-white/30'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2">
            {prompts.map((prompt) => (
              <button
                key={prompt.id}
                onClick={() => onSelectPrompt(prompt)}
                className="rounded-3xl border border-white/5 bg-white/5 px-4 py-4 text-left hover:border-white/20 hover:bg-white/10 transition"
              >
                <p className="text-xs uppercase tracking-[0.3em] text-white/40">{prompt.category}</p>
                <h4 className="text-lg font-semibold mt-2 mb-1">{prompt.title}</h4>
                <p className="text-sm text-white/60 mb-3">{prompt.summary}</p>
                <p className="text-xs text-white/40 line-clamp-3">{prompt.prompt}</p>
              </button>
            ))}
            {prompts.length === 0 && (
              <div className="col-span-2 text-center text-white/50 py-10">
                No prompts match your search. Try a different keyword or category.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

type ProjectModalProps = {
  state: ProjectModalState;
  onClose: () => void;
  onInsert: (text: string) => void;
  projectChats: Record<string, ProjectChatRecord[]>;
  onMoveChat: (projectId: string) => void;
  onCreateChat: (projectId: string) => void;
  onLoadChat: (projectId: string, chatId: string) => void;
};

function ProjectModal({
  state,
  onClose,
  onInsert,
  projectChats,
  onMoveChat,
  onCreateChat,
  onLoadChat,
}: ProjectModalProps) {
  if (!state) return null;

  const isAction = state.type === 'action';
  const title = isAction ? `${state.payload.label} Project` : state.payload.label;
  const subtitle = isAction
    ? state.payload.description
    : `${state.payload.owner} • ${state.payload.status}`;
  const overview = isAction ? state.payload.description : state.payload.summary;
  const insertText = isAction ? state.payload.template : state.payload.brief;
  const projectId = !isAction ? state.payload.id : null;
  const chats = projectId ? projectChats[projectId] ?? [] : [];

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 px-4 py-8">
      <div className="w-full max-w-3xl rounded-3xl border border-white/10 bg-[#050a16] shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/40">{isAction ? 'Project Action' : 'Project'}</p>
            <h3 className="text-2xl font-semibold">{title}</h3>
            <p className="text-sm text-white/60 mt-1">{subtitle}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-2xl border border-white/10 hover:border-white/30 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <p className="text-sm text-white/70">{overview}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <p className="text-xs uppercase tracking-[0.4em] text-white/40 mb-2">Brief</p>
            <p className="text-sm text-white/80 whitespace-pre-line">{insertText}</p>
          </div>

          {!isAction && projectId && (
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-white/40">Actions</p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => onMoveChat(projectId)}
                  className="flex-1 min-w-[180px] rounded-2xl border border-white/20 px-4 py-3 text-sm text-white/80 hover:border-white/40 transition"
                >
                  Move current chat here
                </button>
                <button
                  onClick={() => onCreateChat(projectId)}
                  className="flex-1 min-w-[180px] rounded-2xl border border-white/20 px-4 py-3 text-sm text-white/80 hover:border-white/40 transition"
                >
                  New project chat
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/40">Project chats</p>
                  <span className="text-xs text-white/50">{chats.length} saved</span>
                </div>
                {chats.length === 0 ? (
                  <p className="text-sm text-white/50">No chats yet—move one or start fresh.</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {chats.map((chat) => (
                      <div
                        key={chat.id}
                        className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 flex items-center justify-between gap-3"
                      >
                        <div>
                          <p className="text-sm font-semibold">{chat.title}</p>
                          <p className="text-xs text-white/50">{chat.createdAt}</p>
                        </div>
                        <button
                          onClick={() => onLoadChat(chat.projectId, chat.id)}
                          className="px-3 py-2 rounded-2xl border border-white/20 text-xs text-white/80 hover:border-white/40 transition"
                        >
                          Open
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 pb-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-2xl border border-white/20 text-sm text-white/70 hover:border-white/40 transition"
          >
            Close
          </button>
          <button
            onClick={() => onInsert(insertText)}
            className="px-4 py-2 rounded-2xl bg-white text-black text-sm font-semibold hover:bg-slate-100 transition"
          >
            Insert into composer
          </button>
        </div>
      </div>
    </div>
  );
}

function renderFormattedContent(content: string): ReactNode[] {
  const lines = content.split('\n');
  const elements: ReactNode[] = [];
  let paragraphBuffer: string[] = [];
  let listBuffer: string[] = [];
  let keyIndex = 0;

  const flushParagraph = () => {
    if (!paragraphBuffer.length) return;
    elements.push(
      <p key={`paragraph-${keyIndex++}`} className="mb-2 last:mb-0">
        {paragraphBuffer.join(' ')}
      </p>,
    );
    paragraphBuffer = [];
  };

  const flushList = () => {
    if (!listBuffer.length) return;
    elements.push(
      <ul key={`list-${keyIndex++}`} className="list-disc pl-5 space-y-1">
        {listBuffer.map((item, index) => (
          <li key={`list-item-${keyIndex}-${index}`}>{item}</li>
        ))}
      </ul>,
    );
    listBuffer = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    if (trimmed.startsWith('- ')) {
      flushParagraph();
      listBuffer.push(trimmed.slice(2).trim());
      continue;
    }

    flushList();
    paragraphBuffer.push(trimmed);
  }

  flushParagraph();
  flushList();

  if (!elements.length) {
    elements.push(content);
  }

  return elements;
}
