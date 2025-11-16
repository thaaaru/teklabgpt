import { Search, Sparkles } from 'lucide-react';
import { useState } from 'react';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch?.(query);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-[1100px] mx-auto">
      <div className="relative group">
        {/* Search Icon */}
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-dark-muted group-focus-within:text-primary transition-colors">
          <Search className="w-5 h-5" />
        </div>

        {/* Input Field */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask anything about cybersecurity, threats, or AI..."
          className="w-full h-[56px] pl-14 pr-40 rounded-xl glass-panel
                     text-dark-text placeholder-dark-muted
                     focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white/[0.06]
                     transition-all duration-300"
        />

        {/* AI Search Button */}
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2
                     flex items-center space-x-2 px-5 py-2.5
                     bg-gradient-to-r from-primary to-primary-dark
                     text-white font-medium rounded-lg
                     hover:shadow-glow-hover transition-all duration-300
                     disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!query.trim()}
        >
          <Sparkles className="w-4 h-4" />
          <span>AI Search</span>
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
