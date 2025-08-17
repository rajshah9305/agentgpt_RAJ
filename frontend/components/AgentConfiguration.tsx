'use client';

import { useState } from 'react';
import { useAgentStore, Agent } from '@/lib/stores/agentStore';
import { AI_PROVIDERS } from '@/lib/stores/agentStore';

interface AgentConfigurationProps {
  onDeploy: () => void;
}

export function AgentConfiguration({ onDeploy }: AgentConfigurationProps) {
  const { agent, setAgent, saveAgent, savedAgents, loadAgent } = useAgentStore();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);



  const handleInputChange = (field: keyof Agent, value: string | number) => {
    setAgent({ [field]: value } as Partial<Agent>);
  };

  const handleProviderChange = (provider: 'cerebras' | 'sambanova') => {
    setAgent({ 
      provider, 
      model: AI_PROVIDERS[provider].models[0].id 
    } as Partial<Agent>);
  };

  const handleSave = () => {
    saveAgent();
  };

  const handleLoad = (savedAgent: Agent) => {
    loadAgent(savedAgent);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!agent.name.trim()) {
      newErrors.name = 'Agent name is required';
    }
    
    if (!agent.goal.trim()) {
      newErrors.goal = 'Goal is required';
    }
    
    if (!agent.apiKey.trim()) {
      newErrors.apiKey = 'API key is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDeploy = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      onDeploy();
    } catch (error) {
      console.error('Deployment failed:', error);
      setErrors({ submit: 'Deployment failed. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
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
      {/* Update Notification */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-center space-x-2">
          <span className="text-2xl">✨</span>
          <span className="text-green-800 font-medium">UI Updated: Enhanced model selection, validation, and task generation!</span>
          <span className="text-2xl">✨</span>
        </div>
      </div>

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
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900 flex items-center">
            <span className="mr-3 text-3xl">⚙️</span>
            Agent Settings
          </h3>
          <div className="flex space-x-2">
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">Enhanced</span>
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">Validated</span>
          </div>
        </div>
        
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
                className={`input-field group-hover:border-blue-400 group-hover:shadow-md transition-all duration-300 ${
                  errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                }`}
                required
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div className="group">
              <label className="block text-gray-700 text-sm font-semibold mb-2 group-hover:text-blue-600 transition-colors duration-200">
                Goal *
              </label>
              <textarea
                value={agent.goal}
                onChange={(e) => handleInputChange('goal', e.target.value)}
                placeholder="Describe what you want the agent to accomplish..."
                className={`input-field min-h-[120px] resize-none group-hover:border-blue-400 group-hover:shadow-md transition-all duration-300 ${
                  errors.goal ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                }`}
                required
              />
              {errors.goal && (
                <p className="text-red-500 text-sm mt-1">{errors.goal}</p>
              )}
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
              <div className="flex items-center justify-between mb-2">
                <label className="block text-gray-700 text-sm font-semibold group-hover:text-blue-600 transition-colors duration-200">
                  Model * 
                  <span className="ml-2 text-xs text-gray-500 font-normal">
                    (Speed: Fast = Quick responses, Medium = Balanced, Slow = Most accurate)
                  </span>
                </label>
                <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full font-medium">Enhanced</span>
              </div>
              <select
                value={agent.model}
                onChange={(e) => handleInputChange('model', e.target.value)}
                className="input-field group-hover:border-blue-400 group-hover:shadow-md transition-all duration-300"
              >
                {AI_PROVIDERS[agent.provider]?.models?.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name} ({model.speed}) - {model.description}
                  </option>
                )) || []}
              </select>
              {AI_PROVIDERS[agent.provider]?.models?.find(m => m.id === agent.model) && (
                <p className="text-gray-500 text-sm mt-2">
                  {AI_PROVIDERS[agent.provider].models.find(m => m.id === agent.model)?.description}
                </p>
              )}
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
                className={`input-field group-hover:border-blue-400 group-hover:shadow-md transition-all duration-300 ${
                  errors.apiKey ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                }`}
                required
              />
              {errors.apiKey && (
                <p className="text-red-500 text-sm mt-1">{errors.apiKey}</p>
              )}
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
          onClick={handleDeploy}
          disabled={!agent.name || !agent.goal || !agent.apiKey || isSubmitting}
          className="btn-primary text-lg px-12 py-4 disabled:opacity-50 disabled:cursor-not-allowed hover-glow"
        >
          <span className="mr-3 text-2xl">{isSubmitting ? '⏳' : '🚀'}</span>
          {isSubmitting ? 'Deploying...' : 'Deploy Agent'}
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
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full group-hover:bg-purple-200 transition-colors duration-200">
                    {AI_PROVIDERS[savedAgent.provider]?.models?.find(m => m.id === savedAgent.model)?.name || savedAgent.model}
                  </span>
                </div>
                {AI_PROVIDERS[savedAgent.provider]?.models?.find(m => m.id === savedAgent.model) && (
                  <div className="text-xs text-gray-500 mb-3">
                    Speed: <span className="font-medium">
                      {AI_PROVIDERS[savedAgent.provider].models.find(m => m.id === savedAgent.model)?.speed}
                    </span>
                  </div>
                )}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleLoad(savedAgent)}
                    className="btn-secondary text-sm px-4 py-2 flex-1 hover-glow"
                  >
                    Load
                  </button>
                  <button
                    onClick={() => {
                      const configData = {
                        ...savedAgent,
                        exportTimestamp: new Date().toISOString(),
                        version: '1.0.0'
                      };
                      
                      const blob = new Blob([JSON.stringify(configData, null, 2)], { 
                        type: 'application/json' 
                      });
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${savedAgent.name.replace(/\s+/g, '_')}_config_${new Date().toISOString().slice(0, 10)}.json`;
                      document.body.appendChild(a);
                      a.click();
                      window.URL.revokeObjectURL(url);
                      document.body.removeChild(a);
                    }}
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

      {/* Model Comparison Guide */}
      <div className="card hover-lift border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900 flex items-center">
            <span className="mr-3 text-3xl">📊</span>
            Model Comparison Guide
          </h3>
          <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-medium border border-blue-300">NEW FEATURE</span>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-blue-900 mb-2">How to Choose Your Model:</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-green-100 p-3 rounded-lg">
              <div className="font-medium text-green-800 mb-1">🚀 Fast Models</div>
              <div className="text-green-700">Quick responses, good for real-time applications and simple tasks</div>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <div className="font-medium text-yellow-800 mb-1">⚖️ Medium Models</div>
              <div className="text-yellow-700">Balanced performance, recommended for most use cases</div>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <div className="font-medium text-red-800 mb-1">🎯 Slow Models</div>
              <div className="text-red-700">Highest accuracy, best for research and critical analysis</div>
            </div>
          </div>
        </div>
      </div>

      {/* Provider Information */}
      <div className="card hover-lift border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900 flex items-center">
            <span className="mr-3 text-3xl">ℹ️</span>
            Provider Information
          </h3>
          <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-medium border border-green-300">ENHANCED</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {Object.entries(AI_PROVIDERS).map(([key, provider]) => (
            <div key={key} className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:border-blue-300 transition-all duration-300 hover:shadow-lg">
              <h4 className="font-semibold text-gray-900 mb-4 text-lg">{provider.name}</h4>
              <div className="space-y-4">
                {provider.models?.map((model) => (
                  <div key={model.id} className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-all duration-300 hover:shadow-md hover:scale-105">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-gray-900">{model.name}</div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        model.speed === 'Fast' ? 'bg-green-100 text-green-800' :
                        model.speed === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {model.speed}
                      </span>
                    </div>
                    <div className="text-gray-600 text-sm">{model.description}</div>
                  </div>
                )) || []}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
