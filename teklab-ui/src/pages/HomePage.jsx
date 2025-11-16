import { useState } from 'react';
import { Shield, Users, Database, Terminal, TrendingUp, AlertTriangle } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import Suggestions from '../components/Suggestions';
import Tabs from '../components/Tabs';
import ResultCard from '../components/ResultCard';

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const handleSearch = (query) => {
    setSearchQuery(query);
    console.log('Searching for:', query);
    // API call would go here
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    handleSearch(suggestion);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    console.log('Active tab:', tab);
  };

  // Sample data for result cards
  const resultCards = [
    {
      id: 1,
      title: 'MITRE ATT&CK Framework',
      description: 'Comprehensive knowledge base of adversary tactics and techniques based on real-world observations. Explore the latest threat patterns and defense strategies used by security teams worldwide.',
      source: 'MITRE.org',
      category: 'Framework',
      icon: Shield,
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      id: 2,
      title: 'APT29 Threat Actor Profile',
      description: 'Advanced persistent threat group attributed to Russian intelligence services. Known for sophisticated spear-phishing campaigns and supply chain compromises targeting government and defense sectors.',
      source: 'Threat Intel',
      category: 'Threat Actor',
      icon: Users,
      gradient: 'from-red-500 to-orange-500',
    },
    {
      id: 3,
      title: 'CVE-2024-Latest Critical RCE',
      description: 'Remote Code Execution vulnerability discovered in popular web frameworks. Allows unauthenticated attackers to execute arbitrary code. Patch immediately if affected.',
      source: 'ExploitDB',
      category: 'Vulnerability',
      icon: AlertTriangle,
      gradient: 'from-yellow-500 to-orange-500',
    },
    {
      id: 4,
      title: 'SOC Automation Best Practices',
      description: 'Modern Security Operations Centers are leveraging AI and automation to reduce alert fatigue and improve response times. Learn how to implement SOAR platforms effectively.',
      source: 'SecurityWeek',
      category: 'Best Practice',
      icon: Terminal,
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      id: 5,
      title: 'Zero Trust Architecture Guide',
      description: 'Comprehensive guide to implementing zero trust security models in enterprise environments. Covers identity verification, least privilege access, and micro-segmentation strategies.',
      source: 'NIST',
      category: 'Architecture',
      icon: Database,
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      id: 6,
      title: 'Q1 2024 Threat Landscape Report',
      description: 'Analysis of emerging cyber threats including ransomware trends, supply chain attacks, and AI-powered social engineering. Data-driven insights from global threat intelligence.',
      source: 'CrowdStrike',
      category: 'Report',
      icon: TrendingUp,
      gradient: 'from-indigo-500 to-blue-500',
    },
  ];

  return (
    <div className="min-h-screen pt-[72px]">
      {/* Hero Section */}
      <section className="relative py-20 px-6">
        {/* Background gradient effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10">
          {/* Main heading */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-dark-text mb-4">
              AI-Powered Cybersecurity Intelligence
            </h1>
            <p className="text-lg text-dark-muted max-w-2xl mx-auto">
              Explore threat intelligence, security frameworks, and cutting-edge research
            </p>
          </div>

          {/* Search bar */}
          <SearchBar onSearch={handleSearch} />

          {/* Suggestions */}
          <Suggestions onSuggestionClick={handleSuggestionClick} />
        </div>
      </section>

      {/* Tabs Section */}
      <section className="sticky top-[72px] z-40 bg-dark-bg/80 backdrop-blur-xl">
        <Tabs onTabChange={handleTabChange} />
      </section>

      {/* Results Section */}
      <section className="py-12 px-6">
        <div className="max-w-[1400px] mx-auto">
          {/* Section header */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-dark-text mb-2">
              {searchQuery ? `Results for "${searchQuery}"` : 'Featured Content'}
            </h2>
            <p className="text-dark-muted">
              {resultCards.length} results found • Updated moments ago
            </p>
          </div>

          {/* Results grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resultCards.map((card) => (
              <ResultCard
                key={card.id}
                title={card.title}
                description={card.description}
                source={card.source}
                category={card.category}
                icon={card.icon}
                gradient={card.gradient}
              />
            ))}
          </div>

          {/* Load more button */}
          <div className="mt-12 text-center">
            <button className="px-8 py-3 rounded-xl glass-panel glass-panel-hover
                             text-dark-text font-medium">
              Load more results
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
