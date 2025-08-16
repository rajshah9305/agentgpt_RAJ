'use client';

import { useState, useEffect } from 'react';
import { useAgentStore, Task, Log } from '@/lib/stores/agentStore';
import { DownloadPanel } from './DownloadPanel';

interface AgentDashboardProps {
  onBackToConfig: () => void;
}

export function AgentDashboard({ onBackToConfig }: AgentDashboardProps) {
  const { 
    agent, 
    isExecuting, 
    tasks, 
    logs, 
    currentTaskIndex, 
    clearLogs, 
    resetExecution 
  } = useAgentStore();

  const [currentTask, setCurrentTask] = useState<string | null>(null);

  // Simulate task execution
  useEffect(() => {
    if (isExecuting && tasks.length === 0) {
      // Create initial tasks based on agent goal
      const initialTasks = [
        'Analyzing goal and breaking down into tasks',
        'Researching information and gathering context',
        'Executing primary objectives',
        'Reviewing results and generating insights',
        'Finalizing outputs and preparing summary'
      ];

      // Add tasks to store
      initialTasks.forEach((taskText, index) => {
        useAgentStore.getState().addTask({
          id: `task-${Date.now()}-${index}`,
          text: taskText,
          status: 'pending',
          timestamp: new Date().toISOString()
        });
      });

      // Start executing tasks
      executeTasks();
    }
  }, [isExecuting, tasks.length]);

  const executeTasks = async () => {
    const currentTasks = useAgentStore.getState().tasks;
    
    for (let i = 0; i < Math.min(currentTasks.length, agent.maxIterations); i++) {
      if (currentTasks[i]) {
        // Update task status to running
        useAgentStore.getState().updateTask(currentTasks[i].id, { status: 'running' });
        setCurrentTask(currentTasks[i].text);
        
        // Simulate work
        await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
        
        // Update task as completed
        useAgentStore.getState().updateTask(currentTasks[i].id, {
          status: 'completed',
          result: `Completed: ${currentTasks[i].text}. Generated insights and moved to next phase.`
        });
        
        // Add log entry
        useAgentStore.getState().addLog({
          message: `Completed: ${currentTasks[i].text}`,
          type: 'info'
        });
      }
    }
    
    setCurrentTask(null);
    useAgentStore.getState().stopExecution();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'border-l-green-500 bg-green-50';
      case 'failed': return 'border-l-red-500 bg-red-50';
      case 'running': return 'border-l-blue-500 bg-blue-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium';
      case 'failed': return 'bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium';
      case 'running': return 'bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium';
      default: return 'bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅';
      case 'failed': return '❌';
      case 'running': return '🔄';
      default: return '⏳';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🤖 Agent Dashboard</h1>
          <p className="text-gray-600">Monitor your AI agent's execution progress</p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={onBackToConfig}
            className="btn-secondary px-6 py-3 hover-glow"
          >
            ⚙️ Back to Config
          </button>
          <button
            onClick={resetExecution}
            className="btn-secondary px-6 py-3 hover-glow"
          >
            🔄 Reset
          </button>
        </div>
      </div>

      {/* Current Task */}
      {currentTask && (
        <div className="card bg-blue-50 border-blue-200">
          <div className="flex items-center space-x-4">
            <div className="text-3xl">🔄</div>
            <div>
              <h3 className="text-xl font-semibold text-blue-900">Currently Executing</h3>
              <p className="text-blue-700">{currentTask}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tasks */}
      {tasks.length > 0 && (
        <div className="card hover-lift">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="mr-3 text-3xl">📋</span>
            Task Execution
          </h3>
          <div className="space-y-5">
            {tasks.map((task: Task, index: number) => (
              <div 
                key={task.id} 
                className={`rounded-xl p-5 border-l-4 transition-all duration-300 ${getStatusColor(task.status)} hover:shadow-lg hover:scale-[1.02]`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900 text-lg">{task.text}</h4>
                  <span className={getStatusBadge(task.status)}>
                    {getStatusIcon(task.status)} {task.status}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-3">
                  {task.timestamp} • {task.status === 'completed' ? '✅ Completed' : 
                                    task.status === 'failed' ? '❌ Failed' :
                                    task.status === 'running' ? '🔄 Running' : '⏳ Pending'}
                </p>
                {task.result && (
                  <div className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-all duration-300 hover:shadow-md">
                    <p className="text-gray-800 text-sm leading-relaxed">{task.result}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Logs */}
      {logs.length > 0 && (
        <div className="card hover-lift">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="mr-3 text-3xl">📝</span>
            Execution Logs
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin">
            {logs.map((log: Log) => (
              <div key={log.id} className={`text-sm p-3 rounded-lg transition-all duration-300 hover:scale-[1.02] ${
                log.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200 hover:bg-red-100' :
                log.type === 'warning' ? 'bg-yellow-50 text-yellow-800 border border-yellow-200 hover:bg-yellow-100' :
                'bg-gray-50 text-gray-800 border border-gray-200 hover:bg-gray-100'
              }`}>
                <span className="text-gray-500 font-mono">[{log.timestamp}]</span> {log.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Download Panel */}
      <DownloadPanel />

      {/* Agent Info */}
      <div className="card hover-lift">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <span className="mr-3 text-3xl">🤖</span>
          Agent Information
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="group">
            <h4 className="font-semibold text-gray-800 mb-4 text-lg group-hover:text-blue-600 transition-colors duration-200">Configuration</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-100 group-hover:border-blue-200 transition-colors duration-200">
                <span className="text-gray-600 font-medium">Name:</span>
                <span className="text-gray-900 font-semibold">{agent.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 group-hover:border-blue-200 transition-colors duration-200">
                <span className="text-gray-600 font-medium">Provider:</span>
                <span className="text-gray-900 font-semibold capitalize">{agent.provider}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 group-hover:border-blue-200 transition-colors duration-200">
                <span className="text-gray-600 font-medium">Model:</span>
                <span className="text-gray-900 font-semibold">{agent.model}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 group-hover:border-blue-200 transition-colors duration-200">
                <span className="text-gray-600 font-medium">Max Iterations:</span>
                <span className="text-gray-900 font-semibold">{agent.maxIterations}</span>
              </div>
              <div className="flex justify-between py-2 group-hover:border-blue-200 transition-colors duration-200">
                <span className="text-gray-600 font-medium">Temperature:</span>
                <span className="text-gray-900 font-semibold">{agent.temperature}</span>
              </div>
            </div>
          </div>
          <div className="group">
            <h4 className="font-semibold text-gray-800 mb-4 text-lg group-hover:text-blue-600 transition-colors duration-200">Goal</h4>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 group-hover:border-blue-300 transition-all duration-300 hover:shadow-md">
              <p className="text-gray-800 text-sm leading-relaxed">{agent.goal}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {tasks.length === 0 && logs.length === 0 && !currentTask && (
        <div className="card text-center py-16 hover-lift">
          <div className="animate-float">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Deploy
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Your agent is configured and ready to execute. Click deploy to start the autonomous task execution.
            </p>
            <button
              onClick={onBackToConfig}
              className="btn-primary text-lg px-8 py-4 hover-glow"
            >
              ⚙️ Back to Configuration
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
