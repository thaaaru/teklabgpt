'use client';

import { Shield, Brain, Network, Map, LucideIcon } from 'lucide-react';

interface SuggestionsProps {
  onSuggestionClick?: (text: string) => void;
}

interface Suggestion {
  id: number;
  text: string;
  icon: LucideIcon;
  gradient: string;
}

const Suggestions = ({ onSuggestionClick }: SuggestionsProps) => {
  const suggestions: Suggestion[] = [
    {
      id: 1,
      text: 'Threat Intelligence',
      icon: Shield,
      gradient: 'from-red-500 to-orange-500',
    },
    {
      id: 2,
      text: 'Explain Zero Trust',
      icon: Brain,
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      id: 3,
      text: 'Generate SOC Diagram',
      icon: Network,
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      id: 4,
      text: 'Cybersecurity Roadmap',
      icon: Map,
      gradient: 'from-green-500 to-emerald-500',
    },
  ];

  return (
    <div className="w-full max-w-[1100px] mx-auto mt-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {suggestions.map((suggestion) => {
          const Icon = suggestion.icon;
          return (
            <button
              key={suggestion.id}
              onClick={() => onSuggestionClick?.(suggestion.text)}
              className="group relative overflow-hidden
                         glass-panel rounded-xl px-4 py-3
                         flex items-center space-x-3
                         hover:bg-white/[0.08] transition-all duration-300
                         hover:scale-[1.02] hover:shadow-glow"
            >
              {/* Icon with gradient background */}
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${suggestion.gradient}
                              flex items-center justify-center flex-shrink-0
                              group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-5 h-5 text-white" />
              </div>

              {/* Text */}
              <span className="text-sm font-medium text-dark-text group-hover:text-white transition-colors">
                {suggestion.text}
              </span>

              {/* Hover glow effect */}
              <div className={`absolute inset-0 bg-gradient-to-r ${suggestion.gradient}
                              opacity-0 group-hover:opacity-5 transition-opacity duration-300 -z-10`} />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Suggestions;
