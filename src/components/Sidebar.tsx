'use client';

import { Conversation, AIProvider } from '@/types';
import { useState } from 'react';

interface SidebarProps {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
  onNewConversation: (provider: AIProvider) => void;
  onDeleteConversation: (id: string) => void;
  onToggleSidebar: () => void;
  isCollapsed: boolean;
}

export default function Sidebar({
  conversations,
  currentConversation,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onToggleSidebar,
  isCollapsed,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<AIProvider | 'all'>('all');

  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch = conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.messages.some((msg) => msg.content.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesProvider = selectedProvider === 'all' || conv.provider === selectedProvider;
    return matchesSearch && matchesProvider;
  });

  const providers: AIProvider[] = ['claude', 'chatgpt', 'gemini', 'perplexity'];
  const providerColors = {
    claude: 'bg-[#CC9B7A]',
    chatgpt: 'bg-[#10A37F]',
    gemini: 'bg-[#8E75F5]',
    perplexity: 'bg-[#20808D]',
  };

  if (isCollapsed) {
    return (
      <div className="w-16 bg-gray-900 border-r border-gray-700 flex flex-col items-center py-4 gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          title="Expand sidebar"
        >
          <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        {providers.map((provider) => (
          <button
            key={provider}
            onClick={() => onNewConversation(provider)}
            className={`w-10 h-10 rounded-lg ${providerColors[provider]} hover:opacity-80 transition-opacity flex items-center justify-center text-white font-semibold text-xs`}
            title={`New ${provider} conversation`}
          >
            {provider[0].toUpperCase()}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="w-80 bg-gray-900 border-r border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-white">ELINT-GPT</h1>
          <button
            onClick={onToggleSidebar}
            className="p-1 hover:bg-gray-800 rounded transition-colors"
            title="Collapse sidebar"
          >
            <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <input
          type="text"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedProvider('all')}
            className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedProvider === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            All
          </button>
          {providers.map((provider) => (
            <button
              key={provider}
              onClick={() => setSelectedProvider(provider)}
              className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedProvider === provider
                  ? `${providerColors[provider]} text-white`
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {provider.charAt(0).toUpperCase() + provider.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 p-4 border-b border-gray-700">
        {providers.map((provider) => (
          <button
            key={provider}
            onClick={() => onNewConversation(provider)}
            className={`flex-1 py-2 rounded-lg ${providerColors[provider]} hover:opacity-80 transition-opacity text-white text-sm font-medium`}
          >
            New {provider.charAt(0).toUpperCase() + provider.slice(1)}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-gray-400">
            {searchQuery || selectedProvider !== 'all'
              ? 'No conversations found'
              : 'No conversations yet'}
          </div>
        ) : (
          <div className="p-2">
            {filteredConversations.map((conv) => (
              <div
                key={conv.id}
                className={`group relative p-3 mb-2 rounded-lg cursor-pointer transition-colors ${
                  currentConversation?.id === conv.id
                    ? 'bg-gray-800 border border-gray-600'
                    : 'hover:bg-gray-800 border border-transparent'
                }`}
                onClick={() => onSelectConversation(conv)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-2 h-2 rounded-full ${providerColors[conv.provider]}`}></span>
                      <h3 className="text-sm font-medium text-white truncate">{conv.title}</h3>
                    </div>
                    <p className="text-xs text-gray-400 truncate">
                      {conv.messages.length > 0
                        ? conv.messages[conv.messages.length - 1].content.slice(0, 50) + '...'
                        : 'No messages yet'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(conv.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteConversation(conv.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-600 rounded transition-all"
                    title="Delete conversation"
                  >
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
