'use client';

import { useState } from 'react';
import { AgentConfiguration } from '@/components/AgentConfiguration';
import { AgentDashboard } from '@/components/AgentDashboard';
import { useAgentStore } from '@/lib/stores/agentStore';

export default function Home() {
  const [currentView, setCurrentView] = useState<'config' | 'dashboard'>('config');
  const { isExecuting, startExecution } = useAgentStore();

  const handleDeploy = () => {
    startExecution();
    setCurrentView('dashboard');
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="text-center py-8">
        <div className="animate-float">
          <h1 className="text-5xl font-bold text-gray-900 mb-3 text-shadow">🤖 AgentGPT</h1>
          <p className="text-xl text-gray-700 mb-2">
            Powered by <span className="gradient-text font-semibold">Cerebras</span> & <span className="gradient-text font-semibold">Sambanova</span>
          </p>
          <p className="text-sm text-gray-600">Autonomous AI Agents for Complex Tasks</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {currentView === 'config' ? (
          <AgentConfiguration onDeploy={handleDeploy} />
        ) : (
          <AgentDashboard onBackToConfig={() => setCurrentView('config')} />
        )}
      </main>
    </div>
  );
}
