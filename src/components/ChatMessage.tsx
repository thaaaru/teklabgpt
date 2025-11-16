'use client';

import { Message } from '@/types';
import { useState } from 'react';

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isUser = message.role === 'user';

  return (
    <div className={`group py-6 px-4 ${isUser ? 'bg-transparent' : 'bg-gray-800/50'}`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex gap-4">
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
            isUser
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-200'
          }`}>
            {isUser ? 'U' : 'AI'}
          </div>

          <div className="flex-1 min-w-0">
            <div className="prose prose-invert max-w-none">
              <div className="whitespace-pre-wrap break-words text-gray-100">
                {message.content}
              </div>
            </div>

            <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={copyToClipboard}
                className="p-1.5 hover:bg-gray-700 rounded transition-colors"
                title="Copy message"
              >
                {copied ? (
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>

              <span className="text-xs text-gray-500">
                {message.timestamp.toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
