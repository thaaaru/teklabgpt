import { useState } from 'react';
import { Zap, FileText, Image, Code2, Newspaper, Globe } from 'lucide-react';

const Tabs = ({ onTabChange }) => {
  const [activeTab, setActiveTab] = useState('all');

  const tabs = [
    { id: 'all', label: 'All', icon: Zap },
    { id: 'threats', label: 'Threats', icon: FileText },
    { id: 'diagrams', label: 'Diagrams', icon: Image },
    { id: 'code', label: 'Code', icon: Code2 },
    { id: 'news', label: 'News', icon: Newspaper },
    { id: 'sources', label: 'Sources', icon: Globe },
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    onTabChange?.(tabId);
  };

  return (
    <div className="w-full border-b border-white/[0.08]">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex items-center space-x-1 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`relative flex items-center space-x-2 px-5 py-4
                           text-sm font-medium whitespace-nowrap
                           transition-all duration-300
                           ${
                             isActive
                               ? 'text-primary'
                               : 'text-dark-muted hover:text-dark-text'
                           }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>

                {/* Active underline */}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Tabs;
