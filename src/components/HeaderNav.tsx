'use client';

import { Moon, Sun, Settings, User } from 'lucide-react';
import { useState } from 'react';

const HeaderNav = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [isDark, setIsDark] = useState(true);

  const navItems = [
    { id: 'chat', label: 'Chat' },
    { id: 'search', label: 'Search' },
    { id: 'images', label: 'Images' },
    { id: 'code', label: 'Code' },
    { id: 'news', label: 'News' },
  ];

  const toggleTheme = () => {
    setIsDark(!isDark);
    // Theme toggle logic would be implemented here
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-white/[0.08]">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex items-center justify-between h-[72px]">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <span className="text-xl font-semibold text-gradient">TekLab AI</span>
          </div>

          {/* Center Navigation */}
          <nav className="hidden md:flex items-center space-x-1 bg-dark-card rounded-full px-2 py-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeTab === item.id
                    ? 'bg-primary text-white shadow-glow'
                    : 'text-dark-muted hover:text-dark-text hover:bg-white/[0.05]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right Icons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-white/[0.05] transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Moon className="w-5 h-5 text-dark-muted" />
              ) : (
                <Sun className="w-5 h-5 text-dark-muted" />
              )}
            </button>
            <button
              className="p-2 rounded-lg hover:bg-white/[0.05] transition-colors"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5 text-dark-muted" />
            </button>
            <button
              className="p-2 rounded-lg hover:bg-white/[0.05] transition-colors"
              aria-label="Profile"
            >
              <User className="w-5 h-5 text-dark-muted" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderNav;
