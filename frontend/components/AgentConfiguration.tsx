'use client';

import { useAgentStore, Agent } from '@/lib/stores/agentStore';
import { AI_PROVIDERS } from '@/lib/stores/agentStore';

interface AgentConfigurationProps {
  onDeploy: () => void;
}

export function AgentConfiguration({ onDeploy }: AgentConfigurationProps) {
  const { agent, setAgent, saveAgent, savedAgents, loadAgent } = useAgentStore();

  const handleInputChange = (field: keyof typeof agent, value: string | number) => {
    setAgent({ [field]: value });
  };

  const handleProviderChange = (provider: 'cerebras' | 'sambanova') => {
    setAgent({ 
      provider, 
      model: AI_PROVIDERS[provider].models[0].id 
    });
  };

  const handleSave = () => {
    saveAgent();
  };

  const handleLoad = (savedAgent: Agent) => {
    loadAgent(savedAgent);
  };

  const handleDownloadConfig = () => {
    const configData = {
      ...agent,
      exportTimestamp: new Date().toISOString(),
      version: '1.0.0'
    };
    
    const blob = new Blob([JSON.stringify(configData, null, 2)], { 
      type: 'application/json' 
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${agent.name.replace(/\s+/g, '_')}_config_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="animate-float mb-4">
          <div className="text-8xl">🤖</div>
        </div>
        <h2 className="text-5xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Agent Configuration
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Configure your autonomous AI agent with advanced settings and unleash its potential
        </p>
      </div>

      {/* Configuration Form */}
      <div className="card hover-lift">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <span className="mr-3 text-3xl">⚙️</span>
          Agent Settings
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Basic Settings */}
          <div className="space-y-5">
            <div className="group">
              <label className="block text-gray-700 text-sm font-semibold mb-2 group-hover:text-blue-600 transition-colors duration-200">
                Agent Name *
              </label>
              <input
                type="text"
                value={agent.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Research Assistant, Code Reviewer"
                className="input-field group-hover:border-blue-400 group-hover:shadow-md transition-all duration-300"
                required
              />
            </div>

            <div className="group">
              <label className="block text-gray-700 text-sm font-semibold mb-2 group-hover:text-blue-600 transition-colors duration-200">
                Goal *
              </label>
              <textarea
                value={agent.goal}
                onChange={(e) => handleInputChange('goal', e.target.value)}
                placeholder="Describe what you want the agent to accomplish..."
                className="input-field min-h-[120px] resize-none group-hover:border-blue-400 group-hover:shadow-md transition-all duration-300"
                required
              />
            </div>
          </div>

          {/* AI Provider Settings */}
          <div className="space-y-5">
            <div className="group">
              <label className="block text-gray-700 text-sm font-semibold mb-2 group-hover:text-blue-600 transition-colors duration-200">
                AI Provider *
              </label>
              <select
                value={agent.provider}
                onChange={(e) => handleProviderChange(e.target.value as 'cerebras' | 'sambanova')}
                className="input-field group-hover:border-blue-400 group-hover:shadow-md transition-all duration-300"
              >
                {Object.entries(AI_PROVIDERS).map(([key, provider]) => (
                  <option key={key} value={key}>
                    {provider.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="group">
              <label className="block text-gray-700 text-sm font-semibold mb-2 group-hover:text-blue-600 transition-colors duration-200">
                Model *
              </label>
              <select
                value={agent.model}
                onChange={(e) => handleInputChange('model', e.target.value)}
                className="input-field group-hover:border-blue-400 group-hover:shadow-md transition-all duration-300"
              >
                {AI_PROVIDERS[agent.provider as keyof typeof AI_PROVIDERS].models.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name} - {model.speed}
                  </option>
                ))}
              </select>
            </div>

            <div className="group">
              <label className="block text-gray-700 text-sm font-semibold mb-2 group-hover:text-blue-600 transition-colors duration-200">
                API Key *
              </label>
              <input
                type="password"
                value={agent.apiKey}
                onChange={(e) => handleInputChange('apiKey', e.target.value)}
                placeholder="Enter your API key"
                className="input-field group-hover:border-blue-400 group-hover:shadow-md transition-all duration-300"
                required
              />
            </div>
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <h4 className="text-xl font-semibold text-gray-900 mb-5 flex items-center">
            <span className="mr-2 text-2xl">🔧</span>
            Advanced Settings
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="group">
              <label className="block text-gray-700 text-sm font-semibold mb-2 group-hover:text-blue-600 transition-colors duration-200">
                Max Iterations
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={agent.maxIterations}
                onChange={(e) => handleInputChange('maxIterations', parseInt(e.target.value))}
                className="input-field group-hover:border-blue-400 group-hover:shadow-md transition-all duration-300"
              />
              <p className="text-gray-500 text-sm mt-2 group-hover:text-blue-600 transition-colors duration-200">
                Maximum number of task execution cycles (1-10)
              </p>
            </div>

            <div className="group">
              <label className="block text-gray-700 text-sm font-semibold mb-2 group-hover:text-blue-600 transition-colors duration-200">
                Temperature
              </label>
              <input
                type="number"
                min="0"
                max="1"
                step="0.1"
                value={agent.temperature}
                onChange={(e) => handleInputChange('temperature', parseFloat(e.target.value))}
                className="input-field group-hover:border-blue-400 group-hover:shadow-md transition-all duration-300"
              />
              <p className="text-gray-500 text-sm mt-2 group-hover:text-blue-600 transition-colors duration-200">
                Controls randomness (0 = focused, 1 = creative)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={onDeploy}
          disabled={!agent.name || !agent.goal || !agent.apiKey}
          className="btn-primary text-lg px-12 py-4 disabled:opacity-50 disabled:cursor-not-allowed hover-glow"
        >
          <span className="mr-3 text-2xl">🚀</span>
          Deploy Agent
        </button>
        
        <button
          onClick={handleSave}
          className="btn-secondary text-lg px-8 py-4 hover-glow"
        >
          <span className="mr-3 text-xl">💾</span>
          Save Configuration
        </button>
        
        <button
          onClick={handleDownloadConfig}
          className="btn-secondary text-lg px-8 py-4 hover-glow"
        >
          <span className="mr-3 text-xl">📥</span>
          Download Config
        </button>
      </div>

      {/* Saved Configurations */}
      {savedAgents.length > 0 && (
        <div className="card hover-lift">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="mr-3 text-3xl">💾</span>
            Saved Configurations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedAgents.map((savedAgent: Agent, index: number) => (
              <div key={index} className="bg-gray-50 rounded-xl p-5 border border-gray-200 hover:border-blue-300 transition-all duration-300 hover:shadow-lg hover:scale-105 group">
                <h4 className="font-semibold text-gray-900 mb-3 text-lg group-hover:text-blue-600 transition-colors duration-200">{savedAgent.name}</h4>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2 group-hover:text-gray-800 transition-colors duration-200">
                  {savedAgent.goal}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full group-hover:bg-blue-200 transition-colors duration-200">{savedAgent.provider}</span>
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full group-hover:bg-purple-200 transition-colors duration-200">{savedAgent.model}</span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleLoad(savedAgent)}
                    className="btn-secondary text-sm px-4 py-2 flex-1 hover-glow"
                  >
                    Load
                  </button>
                  <button
                    onClick={() => handleDownloadConfig()}
                    className="btn-secondary text-sm px-4 py-2 flex-1 hover-glow"
                  >
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Provider Information */}
      <div className="card hover-lift">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <span className="mr-3 text-3xl">ℹ️</span>
          Provider Information
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {Object.entries(AI_PROVIDERS).map(([key, provider]) => (
            <div key={key} className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:border-blue-300 transition-all duration-300 hover:shadow-lg">
              <h4 className="font-semibold text-gray-900 mb-4 text-lg">{provider.name}</h4>
              <div className="space-y-4">
                {provider.models.map((model) => (
                  <div key={model.id} className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-all duration-300 hover:shadow-md hover:scale-105">
                    <div className="font-medium text-gray-900 mb-1">{model.name}</div>
                    <div className="text-blue-600 text-sm font-medium mb-1">{model.speed}</div>
                    <div className="text-gray-600 text-sm">{model.description}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
