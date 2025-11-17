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
  Menu,
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
import { DEFAULT_LLM_CONFIG, pickAccentForModel, type LLMId } from '@/lib/llms';
import { PROMPT_CATEGORIES, PROMPT_LIBRARY, type PromptDefinition, type PromptCategoryFilter } from '@/data/prompts';

type LLMDefinition = {
  id: LLMId;
  label: string;
  description: string;
  accent: string;
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

const iconHints: { match: RegExp; icon: ComponentType<{ className?: string }> }[] = [
  { match: /chatgpt|gpt|openai/i, icon: Sparkles },
  { match: /claude|anthropic/i, icon: Brain },
  { match: /gemini|google/i, icon: Wand2 },
  { match: /perplexity|sonar/i, icon: Workflow },
  { match: /deepseek/i, icon: Bot },
  { match: /mistral/i, icon: BookOpen },
];

const pickIconForModel = (modelId: string): ComponentType<{ className?: string }> => {
  const hint = iconHints.find((entry) => entry.match.test(modelId));
  return hint?.icon ?? Sparkles;
};

const llms: LLMDefinition[] = DEFAULT_LLM_CONFIG.map((config) => ({
  ...config,
  icon: pickIconForModel(config.id),
}));

const INVALID_MODEL_PATTERN = /(no endpoints found|not a valid model)/i;
const FRIENDLY_MODEL_ERROR = 'This model is temporarily unavailable. Please select another model.';
const BOSS_MODEL_ID = 'openai/gpt-4o-mini';

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

const TIMESTAMP_FORMATTER = new Intl.DateTimeFormat('en-US', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
});

const timestamp = () => TIMESTAMP_FORMATTER.format(new Date());

const createIntroMessage = (llmId: string): Message => ({
  id: `intro-${llmId}-${Date.now()}`,
  role: 'assistant',
  content: 'Where should we begin?',
  timestamp: timestamp(),
});

type ProjectModalState =
  | { type: 'action'; payload: ProjectActionDefinition }
  | { type: 'project'; payload: ProjectLink }
  | null;

type MasterPromptResult = {
  prompt: string;
  timestamp: string;
  bossAnswer: string;
  responses: Array<{
    modelId: string;
    label: string;
    content: string;
    agreementScore: number;
    error?: string | null;
  }>;
  mergedSummary: string;
  verificationNotes: string[];
};

export default function MultiLLMInterface() {
  const [activeLLM, setActiveLLM] = useState<LLMId>(llms[0].id);
  const [composerValue, setComposerValue] = useState('');
  const [conversations, setConversations] = useState<Record<string, Message[]>>(() =>
    llms.reduce((acc, llm) => {
      acc[llm.id] = [createIntroMessage(llm.id)];
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
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [masterResult, setMasterResult] = useState<MasterPromptResult | null>(null);
  const [isMasterPrompting, setMasterPrompting] = useState(false);

  const getLLMDefinition = (llmId: string) => llms.find((llm) => llm.id === llmId);

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
    const llmMeta = getLLMDefinition(activeLLM);

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
    setConversations((prev) => ({
      ...prev,
      [activeLLM]: [createIntroMessage(activeLLM)],
    }));
    setProjectModalState(null);
  };

  const handleCreateProjectChat = (projectId: string) => {
    const project = projectLinks.find((link) => link.id === projectId);
    if (!project) return;
    const llmMeta = getLLMDefinition(activeLLM);

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
  const featuredLLMs = llms;
  const masterButtonDisabled = !composerValue.trim() || isMasterPrompting;
  const masterBlockedMessage = null;
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
    const llmMeta = getLLMDefinition(activeLLM);

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
          const readable = formatErrorMessage(
            errorPayload?.error,
            `Model ${llmMeta?.label ?? 'LLM'} is unavailable.`,
          );
          throw new Error(readable);
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
      const readable = formatErrorMessage(error, 'Unknown error occurred.');
      const displayMessage = sanitizeModelError(readable);
      setErrors((prev) => ({
        ...prev,
        [activeLLM]: displayMessage,
      }));
      setConversations((prev) => ({
        ...prev,
        [activeLLM]: [...(prev[activeLLM] ?? updatedThread), fallbackMessage],
      }));
    } finally {
      setPendingLLMs((prev) => ({ ...prev, [activeLLM]: false }));
    }
  };

  const handleMasterPrompt = async () => {
    if (!composerValue.trim() || isMasterPrompting || featuredLLMs.length < 5) return;
    const prompt = composerValue.trim();
    const promptTimestamp = timestamp();
    const targetLLMs = featuredLLMs;
    setComposerValue('');
    setMasterPrompting(true);

    try {
      const responses = await Promise.all(
        targetLLMs.map(async (llm) => {
          const userMessage: Message = {
            id: `master-user-${llm.id}-${Date.now()}`,
            role: 'user',
            content: prompt,
            timestamp: promptTimestamp,
          };
          const existingThread = conversations[llm.id] ?? [createIntroMessage(llm.id)];
          const updatedThread = [...existingThread, userMessage];
          setConversations((prev) => ({
            ...prev,
            [llm.id]: updatedThread,
          }));
          setPendingLLMs((prev) => ({ ...prev, [llm.id]: true }));
          setErrors((prev) => ({ ...prev, [llm.id]: null }));

          try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            modelId: llm.id,
            messages: updatedThread.map((message) => ({
              role: message.role,
              content: message.content,
            })),
          }),
        });

        if (!response.ok) {
          const errorPayload = await response.json().catch(() => ({}));
          const readable = formatErrorMessage(
            errorPayload?.error,
            `Model ${llm.label} is unavailable.`,
          );
          throw new Error(readable);
        }

            const data = await response.json();
            const assistantMessage = data?.message;
            const content = parseAssistantContent(assistantMessage?.content) ?? 'No answer returned.';
            const nextMessage: Message = {
              id: `master-assistant-${llm.id}-${Date.now()}`,
              role: 'assistant',
              content,
              timestamp: timestamp(),
            };

            setConversations((prev) => ({
              ...prev,
              [llm.id]: [...updatedThread, nextMessage],
            }));

            return {
              modelId: llm.id,
              label: llm.label,
              content,
              error: null as string | null,
            };
          } catch (error) {
            const message = formatErrorMessage(
              error,
              'Unknown error occurred while contacting the model.',
            );
            const fallbackMessage: Message = {
              id: `master-error-${llm.id}-${Date.now()}`,
              role: 'assistant',
              content: 'Master prompt failed for this model.',
              timestamp: timestamp(),
            };
            const displayMessage = sanitizeModelError(message);
            setErrors((prev) => ({ ...prev, [llm.id]: displayMessage }));
            setConversations((prev) => ({
              ...prev,
              [llm.id]: [...updatedThread, fallbackMessage],
            }));
            return {
              modelId: llm.id,
              label: llm.label,
              content: '',
              error: displayMessage,
            };
          } finally {
            setPendingLLMs((prev) => ({ ...prev, [llm.id]: false }));
          }
        }),
      );

      const analysis = analyzeMasterResponses(responses);
      const bossAnswer = await generateBossAnswer(prompt, analysis.enrichedResponses);
      setMasterResult({
        prompt,
        timestamp: promptTimestamp,
        bossAnswer,
        responses: analysis.enrichedResponses,
        mergedSummary: analysis.mergedSummary,
        verificationNotes: analysis.verificationNotes,
      });
    } catch (error) {
      setMasterResult({
        prompt,
        timestamp: promptTimestamp,
        bossAnswer: 'Master prompt failed before collecting responses.',
        responses: [],
        mergedSummary: 'Master prompt failed before collecting responses.',
        verificationNotes: [
          formatErrorMessage(error, 'Unknown error occurred while running the master prompt.'),
        ],
      });
    } finally {
      setMasterPrompting(false);
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
    <div className="min-h-screen w-full bg-[#05080f] text-slate-100 flex flex-col lg:flex-row">
      <Sidebar
        className="hidden lg:flex"
        onOpenPromptLibrary={() => setPromptModalOpen(true)}
        promptHistory={promptHistory}
        onSelectPromptHistory={handlePromptHistorySelect}
        onProjectAction={handleProjectAction}
        onProjectSelected={handleProjectLinkClick}
      />

      <div className="flex-1 flex flex-col lg:border-l border-white/5 bg-gradient-to-br from-[#0a101c] via-[#05080f] to-[#020409]">
        <MobileHeader onMenuClick={() => setSidebarOpen(true)} />
        <TopNavigation activeLLM={activeLLM} llms={featuredLLMs} onSelectLLM={setActiveLLM} />

        <ConversationPane
          activeLLM={activeLLM}
          llmMeta={getLLMDefinition(activeLLM)}
          messages={activeConversation}
          isLoading={isThinking}
          error={activeError}
        />

        {masterResult && (
          <MasterPromptSummary result={masterResult} onClear={() => setMasterResult(null)} />
        )}

        <MessageComposer
          value={composerValue}
          onChange={setComposerValue}
          onSubmit={handleSend}
          disabled={isThinking}
          onMasterPrompt={handleMasterPrompt}
          masterDisabled={masterButtonDisabled}
          masterBlockedMessage={masterBlockedMessage}
          isMasterRunning={isMasterPrompting}
        />
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex justify-start items-stretch lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <Sidebar
            variant="mobile"
            onCloseRequest={() => setSidebarOpen(false)}
            onOpenPromptLibrary={() => setPromptModalOpen(true)}
            promptHistory={promptHistory}
            onSelectPromptHistory={handlePromptHistorySelect}
            onProjectAction={handleProjectAction}
            onProjectSelected={handleProjectLinkClick}
          />
        </div>
      )}

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
  variant?: 'desktop' | 'mobile';
  onCloseRequest?: () => void;
  className?: string;
};

function Sidebar({
  onOpenPromptLibrary,
  promptHistory,
  onSelectPromptHistory,
  onProjectAction,
  onProjectSelected,
  variant = 'desktop',
  onCloseRequest,
  className,
}: SidebarProps) {
  const baseWidth = variant === 'mobile' ? 'w-full max-w-xs' : 'w-72';
  const sidebarClasses = [
    baseWidth,
    'bg-[#070b14] flex flex-col p-6 gap-6',
    variant === 'mobile'
      ? 'h-full shadow-2xl border-b border-white/10 overflow-y-auto'
      : 'border-r border-white/5',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <aside
      className={sidebarClasses}
      onClick={variant === 'mobile' ? (event) => event.stopPropagation() : undefined}
    >
      {variant === 'mobile' ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 rounded-2xl bg-white/10 text-white px-4 py-2 font-semibold tracking-[0.3em] uppercase text-xs">
            <span className="text-white/60">TBD</span>
            <span>GPT</span>
          </div>
          <button
            onClick={onCloseRequest}
            className="p-2 rounded-xl border border-white/10 text-white hover:border-white/30 transition"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2 rounded-2xl bg-white/10 text-white py-3 font-semibold tracking-[0.3em] uppercase">
          <span className="text-xs text-white/60">TBD</span>
          <span className="text-sm">GPT</span>
        </div>
      )}

      <div className={`relative ${variant === 'mobile' ? 'mt-4' : ''}`}>
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

type TopNavigationProps = {
  activeLLM: LLMId;
  llms: LLMDefinition[];
  onSelectLLM: (id: LLMId) => void;
};

function TopNavigation({ activeLLM, llms, onSelectLLM }: TopNavigationProps) {
  return (
    <header className="border-b border-white/5 px-4 md:px-8 pt-4 pb-3 backdrop-blur sticky top-12 lg:top-0 z-20 bg-gradient-to-b from-[#05080f]/95 via-[#05080f]/85 to-transparent">
      <div className="flex items-center gap-3 text-sm text-white/70 mb-3">
        <History className="w-4 h-4 text-white/40" />
        <span>Choose a model</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 pb-1">
        {llms.map((llm) => {
          const Icon = llm.icon;
          const isActive = llm.id === activeLLM;
          return (
            <button
              key={llm.id}
              onClick={() => onSelectLLM(llm.id)}
              className={`rounded-2xl border px-4 py-4 text-left transition ${
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
  llmMeta,
  messages,
  isLoading,
  error,
}: {
  activeLLM: string;
  llmMeta?: LLMDefinition;
  messages: Message[];
  isLoading: boolean;
  error?: string | null;
}) {
  return (
    <section className="flex-1 flex flex-col items-center overflow-hidden px-6 md:px-12">
      <div className="w-full max-w-3xl flex-1 overflow-y-auto py-10 space-y-6">
        <div className="text-center space-y-2">
          <p className="uppercase text-xs tracking-[0.4em] text-white/30">Conversation with</p>
          <h1 className="text-3xl md:text-4xl font-semibold">{llmMeta?.label ?? 'Selected model'}</h1>
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

type MasterPromptSummaryProps = {
  result: MasterPromptResult;
  onClear: () => void;
};

function MasterPromptSummary({ result, onClear }: MasterPromptSummaryProps) {
  return (
    <div className="px-6 md:px-12">
      <div className="max-w-3xl mx-auto mt-6 rounded-3xl border border-white/10 bg-white/5 p-6 space-y-5">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="uppercase text-xs tracking-[0.3em] text-white/40">Master prompt</p>
              <h3 className="text-2xl font-semibold text-white">Consensus report</h3>
            </div>
            <button
              onClick={onClear}
              className="px-3 py-1.5 rounded-2xl border border-white/20 text-xs text-white/70 hover:border-white/40 transition"
            >
              Clear
            </button>
          </div>
          <p className="text-xs text-white/50">{result.timestamp}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
          <p className="text-xs uppercase text-white/40 mb-1">Prompt</p>
          <p className="whitespace-pre-wrap">{result.prompt}</p>
        </div>

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-white/40">Boss final answer (ChatGPT)</p>
          <div className="rounded-2xl border border-emerald-300/40 bg-emerald-400/10 p-4 text-sm text-white/90 space-y-2">
            {renderFormattedContent(result.bossAnswer)}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-white/40">Merged summary</p>
          <div className="rounded-2xl border border-white/10 bg-[#070b14] p-4 text-sm text-white/80 space-y-2">
            {renderFormattedContent(result.mergedSummary)}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {result.responses.map((response) => (
            <div key={response.modelId} className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-semibold">{response.label}</p>
                <span
                  className={`text-xs ${
                    response.error ? 'text-red-300' : response.agreementScore > 0.65 ? 'text-emerald-300' : 'text-amber-300'
                  }`}
                >
                  {response.error
                    ? 'Failed'
                    : `Agreement ${(response.agreementScore * 100).toFixed(0)}%`}
                </span>
              </div>
              <div className="max-h-40 overflow-y-auto text-sm text-white/80 space-y-2">
                {response.error ? (
                  <p className="text-red-300">{response.error}</p>
                ) : (
                  renderFormattedContent(response.content)
                )}
              </div>
            </div>
          ))}
        </div>

        {result.verificationNotes.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/40 mb-2">Verification</p>
            <ul className="list-disc pl-5 text-sm text-white/80 space-y-1">
              {result.verificationNotes.map((note, index) => (
                <li key={`${note}-${index}`}>{note}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function MessageComposer({
  value,
  onChange,
  onSubmit,
  disabled,
  onMasterPrompt,
  masterDisabled,
  masterBlockedMessage,
  isMasterRunning,
}: {
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  onMasterPrompt: () => void;
  masterDisabled?: boolean;
  masterBlockedMessage?: string | null;
  isMasterRunning?: boolean;
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

  const handleMasterPrompt = () => {
    if (masterDisabled) return;
    onMasterPrompt();
  };

  return (
    <div className="px-6 md:px-12 pb-10">
      <div className="max-w-3xl mx-auto rounded-3xl border border-white/10 bg-white/5 backdrop-blur-lg">
        <div className="flex items-center gap-3 px-4 pt-4 text-white/50 text-xs">
          <Bot className="w-3.5 h-3.5" />
          <span>Secure client-side context — API keys stay local</span>
        </div>
        <div className="flex flex-col gap-3 px-4 py-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-end">
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
            <div className="flex flex-col gap-2 w-full md:w-auto">
              <button
                onClick={handleSubmit}
                className="px-5 py-3 rounded-2xl bg-white text-black text-sm font-medium hover:bg-slate-100 transition disabled:opacity-40"
                disabled={!value.trim() || disabled}
              >
                {disabled ? 'Thinking…' : 'Send'}
              </button>
              <button
                onClick={handleMasterPrompt}
                className="px-5 py-3 rounded-2xl border border-white/20 text-sm font-medium text-white hover:border-white/40 transition disabled:opacity-40"
                disabled={masterDisabled}
              >
                {isMasterRunning ? 'Mastering…' : 'Master Prompt'}
              </button>
              {masterBlockedMessage ? (
                <p className="text-[11px] text-white/40">{masterBlockedMessage}</p>
              ) : (
                <p className="text-[11px] text-white/40">
                  Master Prompt runs all five featured models and merges their answers.
                </p>
              )}
            </div>
          </div>
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

function MobileHeader({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#05080f]/95 backdrop-blur">
      <button
        onClick={onMenuClick}
        className="p-2 rounded-xl border border-white/15 text-white hover:border-white/40 transition"
        aria-label="Open navigation"
      >
        <Menu className="w-5 h-5" />
      </button>
      <div className="text-sm font-semibold tracking-[0.4em] uppercase text-white">TBD GPT</div>
      <div className="text-[10px] uppercase tracking-[0.3em] text-white/50">AI HUB</div>
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

type RawMasterResponse = {
  modelId: string;
  label: string;
  content: string;
  error: string | null;
};

function analyzeMasterResponses(responses: RawMasterResponse[]) {
  if (!responses.length) {
    return {
      mergedSummary: 'No responses available.',
      verificationNotes: ['Unable to run verification without any model responses.'],
      enrichedResponses: [] as MasterPromptResult['responses'],
    };
  }

  const successful = responses.filter((response) => !response.error && response.content.trim().length > 0);
  const scoreMap = new Map<string, number>();
  const verificationNotes: string[] = [];

  if (successful.length >= 2) {
    for (let i = 0; i < successful.length; i += 1) {
      for (let j = i + 1; j < successful.length; j += 1) {
        const first = successful[i];
        const second = successful[j];
        const similarity = computeTextSimilarity(first.content, second.content);
        verificationNotes.push(formatSimilarityNote(first.label, second.label, similarity));
        scoreMap.set(first.modelId, (scoreMap.get(first.modelId) ?? 0) + similarity);
        scoreMap.set(second.modelId, (scoreMap.get(second.modelId) ?? 0) + similarity);
      }
    }
  } else {
    verificationNotes.push('Need at least two reliable responses to perform cross-verification.');
  }

  responses
    .filter((response) => response.error)
    .forEach((response) => verificationNotes.push(`${response.label} failed: ${response.error}`));

  const enrichedResponses: MasterPromptResult['responses'] = responses.map((response) => {
    if (response.error || !response.content.trim()) {
      return { ...response, agreementScore: 0, error: response.error };
    }
    const denominator = successful.length > 1 ? successful.length - 1 : 1;
    const total = scoreMap.get(response.modelId) ?? 0;
    return {
      ...response,
      agreementScore: total / denominator,
    };
  });

  const mergedSummary =
    successful.length > 0 ? buildConsensusSummary(successful) : 'No successful responses to merge.';

  return {
    mergedSummary,
    verificationNotes,
    enrichedResponses,
  };
}

function formatSimilarityNote(modelA: string, modelB: string, score: number): string {
  if (score > 0.65) {
    return `Strong agreement between ${modelA} and ${modelB} (${Math.round(score * 100)}% overlap).`;
  }
  if (score > 0.35) {
    return `Partial alignment between ${modelA} and ${modelB} (${Math.round(score * 100)}% overlap).`;
  }
  return `Potential conflict between ${modelA} and ${modelB} (${Math.round(score * 100)}% overlap).`;
}

function computeTextSimilarity(a: string, b: string): number {
  const tokensA = new Set(tokenizeText(a));
  const tokensB = new Set(tokenizeText(b));
  if (!tokensA.size || !tokensB.size) return 0;

  let intersection = 0;
  tokensA.forEach((token) => {
    if (tokensB.has(token)) {
      intersection += 1;
    }
  });

  return intersection / Math.min(tokensA.size, tokensB.size);
}

function tokenizeText(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 2);
}

function buildConsensusSummary(responses: RawMasterResponse[]): string {
  const sentenceMap = new Map<string, { text: string; count: number }>();

  responses.forEach((response) => {
    extractSentences(response.content).forEach((sentence) => {
      const key = sentence.toLowerCase();
      if (!sentenceMap.has(key)) {
        sentenceMap.set(key, { text: sentence, count: 1 });
      } else {
        sentenceMap.get(key)!.count += 1;
      }
    });
  });

  if (!sentenceMap.size) {
    return 'No overlapping statements detected between the model outputs.';
  }

  const ranked = Array.from(sentenceMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  return ranked.map((item) => `- ${item.text}${item.count > 1 ? ` (${item.count} models confirm)` : ''}`).join('\n');
}

function extractSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0);
}

function formatErrorMessage(possible: unknown, fallback: string): string {
  if (typeof possible === 'string' && possible.trim()) {
    return possible;
  }
  if (possible instanceof Error) {
    return possible.message || fallback;
  }
  if (possible && typeof possible === 'object') {
    try {
      const serialized = JSON.stringify(possible);
      if (serialized && serialized !== '{}') {
        return serialized;
      }
    } catch {
      // ignore JSON issues
    }
  }
  return fallback;
}

function sanitizeModelError(message: string): string {
  return INVALID_MODEL_PATTERN.test(message) ? FRIENDLY_MODEL_ERROR : message;
}

async function generateBossAnswer(prompt: string, responses: MasterPromptResult['responses']): Promise<string> {
  const successful = responses.filter((response) => response.content.trim() && !response.error);

  if (!successful.length) {
    return 'No reliable responses were available for the boss to review.';
  }

  const summaryBlock = successful
    .map((response, index) => `Response ${index + 1} (${response.label}):\n${response.content}`)
    .join('\n\n');

  const bossPrompt = `You are the Boss AI, tasked with reviewing multiple model responses and drafting one authoritative final answer.

Original prompt:
${prompt}

Team responses:
${summaryBlock}

Deliver a decisive final answer that:
- Synthesizes consensus and highlights unique insights
- Resolves contradictions with clear reasoning
- Adds any critical caveats or next steps
- Writes in a confident, executive voice`;

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        modelId: BOSS_MODEL_ID,
        messages: [
          {
            role: 'system',
            content: 'You are the Boss AI who synthesizes multiple expert responses into one final directive.',
          },
          { role: 'user', content: bossPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => ({}));
      const message = errorPayload?.error ?? 'Boss model is unavailable.';
      throw new Error(message);
    }

    const data = await response.json();
    const assistantMessage = data?.message;
    return parseAssistantContent(assistantMessage?.content) ?? 'Boss could not generate a response.';
  } catch (error) {
    console.error('[master] Boss synthesis failed', error);
    return sanitizeModelError(formatErrorMessage(error, 'Boss synthesis failed.'));
  }
}
