'use client';

import { useState, useRef, KeyboardEvent } from 'react';

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSendMessage(input.trim());
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  return (
    <div className="border-t border-gray-700 bg-gray-900">
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex items-end gap-3 bg-gray-800 rounded-xl p-3 border border-gray-700 focus-within:border-blue-500 transition-colors">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... (Shift+Enter for new line)"
            disabled={disabled}
            className="flex-1 bg-transparent text-white placeholder-gray-400 resize-none outline-none max-h-[200px] min-h-[24px]"
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || disabled}
            className="flex-shrink-0 p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg transition-colors"
            title="Send message (Enter)"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <div className="mt-2 text-xs text-gray-500 text-center">
          Powered by OpenRouter.ai - Add your API key in settings to enable AI responses
        </div>
      </div>
    </div>
  );
}
