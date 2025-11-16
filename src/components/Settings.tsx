'use client';

import { UserSettings, AIProvider } from '@/types';
import { useState } from 'react';

interface SettingsProps {
  settings: UserSettings;
  onSaveSettings: (settings: UserSettings) => void;
  onClose: () => void;
}

export default function Settings({ settings, onSaveSettings, onClose }: SettingsProps) {
  const [localSettings, setLocalSettings] = useState<UserSettings>(settings);

  const handleSave = () => {
    onSaveSettings(localSettings);
    onClose();
  };

  const toggleProvider = (provider: AIProvider) => {
    setLocalSettings({
      ...localSettings,
      providers: {
        ...localSettings.providers,
        [provider]: {
          ...localSettings.providers[provider],
          enabled: !localSettings.providers[provider].enabled,
        },
      },
    });
  };

  const updateProviderModel = (provider: AIProvider, model: string) => {
    setLocalSettings({
      ...localSettings,
      providers: {
        ...localSettings.providers,
        [provider]: {
          ...localSettings.providers[provider],
          model,
        },
      },
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* OpenRouter API Key */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">OpenRouter API Configuration</h3>
            <div className="space-y-3">
              <div className="p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
                <div className="flex items-start gap-3 mb-3">
                  <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-blue-200">
                    <p className="font-medium mb-1">OpenRouter provides unified access to all AI models</p>
                    <p>Get your API key from <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-100">openrouter.ai/keys</a></p>
                  </div>
                </div>
                <input
                  type="password"
                  placeholder="Enter your OpenRouter API key (sk-or-...)"
                  value={localSettings.openRouterApiKey || ''}
                  onChange={(e) => setLocalSettings({ ...localSettings, openRouterApiKey: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-400 mt-2">
                  Your API key is stored locally in your browser and never sent to our servers.
                </p>
              </div>
            </div>
          </div>

          {/* Theme Settings */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Appearance</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Theme</label>
                <select
                  value={localSettings.theme}
                  onChange={(e) => setLocalSettings({ ...localSettings, theme: e.target.value as 'light' | 'dark' | 'system' })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Font Size</label>
                <select
                  value={localSettings.fontSize}
                  onChange={(e) => setLocalSettings({ ...localSettings, fontSize: e.target.value as 'small' | 'medium' | 'large' })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
            </div>
          </div>

          {/* Default Provider */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Default AI Provider</h3>
            <select
              value={localSettings.defaultProvider}
              onChange={(e) => setLocalSettings({ ...localSettings, defaultProvider: e.target.value as AIProvider })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.keys(localSettings.providers).map((provider) => (
                <option key={provider} value={provider}>
                  {localSettings.providers[provider as AIProvider].name}
                </option>
              ))}
            </select>
          </div>

          {/* AI Providers Configuration */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">AI Provider Models</h3>
            <div className="space-y-4">
              {(Object.keys(localSettings.providers) as AIProvider[]).map((provider) => (
                <div key={provider} className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{localSettings.providers[provider].icon}</span>
                      <h4 className="font-semibold text-white">{localSettings.providers[provider].name}</h4>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={localSettings.providers[provider].enabled}
                        onChange={() => toggleProvider(provider)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Model</label>
                    <input
                      type="text"
                      value={localSettings.providers[provider].model}
                      onChange={(e) => updateProviderModel(provider, e.target.value)}
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                      placeholder="model/name"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      See all available models at <a href="https://openrouter.ai/models" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-400">openrouter.ai/models</a>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Code Theme */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Code Highlighting</h3>
            <select
              value={localSettings.codeTheme}
              onChange={(e) => setLocalSettings({ ...localSettings, codeTheme: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="github-dark">GitHub Dark</option>
              <option value="monokai">Monokai</option>
              <option value="dracula">Dracula</option>
              <option value="nord">Nord</option>
            </select>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-900 border-t border-gray-700 p-6 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
