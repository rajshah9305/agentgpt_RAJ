import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types and Interfaces
export interface Model {
  id: string;
  name: string;
  speed: string;
  description: string;
}

export interface AIProvider {
  name: string;
  models: Model[];
}

export interface Agent {
  name: string;
  goal: string;
  provider: 'cerebras' | 'sambanova';
  model: string;
  apiKey: string;
  maxIterations: number;
  temperature: number;
}

export interface Task {
  id: string;
  text: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  timestamp: string;
  result?: string;
}

export interface Log {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
}

export interface DownloadOptions {
  format: 'json' | 'csv' | 'txt';
  includeLogs: boolean;
  includeTasks: boolean;
  includeConfig: boolean;
}

export type ExportFormat = 'json' | 'csv' | 'txt';

// AI Providers Configuration
export const AI_PROVIDERS: Record<string, AIProvider> = {
  cerebras: {
    name: 'Cerebras',
    models: [
      {
        id: 'cerebras-1',
        name: 'Cerebras-1',
        speed: 'Fast',
        description: 'High-performance model for complex reasoning tasks'
      },
      {
        id: 'cerebras-2',
        name: 'Cerebras-2',
        speed: 'Medium',
        description: 'Balanced model for general AI tasks'
      }
    ]
  },
  sambanova: {
    name: 'Sambanova',
    models: [
      {
        id: 'sambanova-1',
        name: 'Sambanova-1',
        speed: 'Fast',
        description: 'Optimized for enterprise AI workloads'
      },
      {
        id: 'sambanova-2',
        name: 'Sambanova-2',
        speed: 'Medium',
        description: 'Versatile model for various AI applications'
      }
    ]
  }
};

// Store Interface
interface AgentStore {
  // State
  agent: Agent;
  isExecuting: boolean;
  tasks: Task[];
  logs: Log[];
  currentTaskIndex: number;
  savedAgents: Agent[];

  // Actions
  setAgent: (updates: Partial<Agent>) => void;
  saveAgent: () => void;
  loadAgent: (agent: Agent) => void;
  startExecution: () => void;
  stopExecution: () => void;
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  addLog: (log: Omit<Log, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;
  resetExecution: () => void;
  downloadSimple: (format: ExportFormat) => Promise<void>;
  downloadAgentData: (options: DownloadOptions) => Promise<void>;
  generateReport: () => string;
}

// Default Agent Configuration
const defaultAgent: Agent = {
  name: '',
  goal: '',
  provider: 'cerebras',
  model: 'cerebras-1',
  apiKey: '',
  maxIterations: 5,
  temperature: 0.7
};

// Store Implementation
export const useAgentStore = create<AgentStore>()(
  persist(
    (set, get) => ({
      // Initial State
      agent: defaultAgent,
      isExecuting: false,
      tasks: [],
      logs: [],
      currentTaskIndex: 0,
      savedAgents: [],

      // Actions
      setAgent: (updates) => {
        set((state) => ({
          agent: { ...state.agent, ...updates }
        }));
      },

      saveAgent: () => {
        const { agent, savedAgents } = get();
        if (agent.name && agent.goal) {
          const existingIndex = savedAgents.findIndex(a => a.name === agent.name);
          if (existingIndex >= 0) {
            // Update existing
            const updated = [...savedAgents];
            updated[existingIndex] = { ...agent };
            set({ savedAgents: updated });
          } else {
            // Add new
            set({ savedAgents: [...savedAgents, { ...agent }] });
          }
        }
      },

      loadAgent: (agent) => {
        set({ agent: { ...agent } });
      },

      startExecution: () => {
        set({ isExecuting: true, currentTaskIndex: 0, tasks: [], logs: [] });
      },

      stopExecution: () => {
        set({ isExecuting: false });
      },

      addTask: (task) => {
        const newTask: Task = {
          ...task,
          id: task.id || `task-${Date.now()}-${Math.random()}`,
          timestamp: task.timestamp || new Date().toISOString()
        };
        set((state) => ({
          tasks: [...state.tasks, newTask]
        }));
      },

      updateTask: (taskId, updates) => {
        set((state) => ({
          tasks: state.tasks.map(task =>
            task.id === taskId ? { ...task, ...updates } : task
          )
        }));
      },

      addLog: (log) => {
        const newLog: Log = {
          ...log,
          id: `log-${Date.now()}-${Math.random()}`,
          timestamp: new Date().toISOString()
        };
        set((state) => ({
          logs: [...state.logs, newLog]
        }));
      },

      clearLogs: () => {
        set({ logs: [] });
      },

      resetExecution: () => {
        set({
          isExecuting: false,
          tasks: [],
          logs: [],
          currentTaskIndex: 0
        });
      },

      downloadSimple: async (format: ExportFormat) => {
        const { agent, tasks, logs } = get();
        let content = '';
        let filename = '';
        let mimeType = '';

        switch (format) {
          case 'json':
            content = JSON.stringify({ agent, tasks, logs }, null, 2);
            filename = `${agent.name.replace(/\s+/g, '_')}_data.json`;
            mimeType = 'application/json';
            break;
          case 'csv':
            content = generateCSV({ agent, tasks, logs });
            filename = `${agent.name.replace(/\s+/g, '_')}_data.csv`;
            mimeType = 'text/csv';
            break;
          case 'txt':
            content = generateTextReport({ agent, tasks, logs });
            filename = `${agent.name.replace(/\s+/g, '_')}_data.txt`;
            mimeType = 'text/plain';
            break;
        }

        downloadFile(content, filename, mimeType);
      },

      downloadAgentData: async (options: DownloadOptions) => {
        const { agent, tasks, logs } = get();
        let content = '';
        let filename = '';

        if (options.format === 'json') {
          const data: Record<string, unknown> = {};
          if (options.includeConfig) data.agent = agent;
          if (options.includeTasks) data.tasks = tasks;
          if (options.includeLogs) data.logs = logs;
          
          content = JSON.stringify(data, null, 2);
          filename = `${agent.name.replace(/\s+/g, '_')}_export.json`;
        } else if (options.format === 'csv') {
          content = generateCSV({ agent, tasks, logs, options });
          filename = `${agent.name.replace(/\s+/g, '_')}_export.csv`;
        } else {
          content = generateTextReport({ agent, tasks, logs, options });
          filename = `${agent.name.replace(/\s+/g, '_')}_export.txt`;
        }

        downloadFile(content, filename, 'text/plain');
      },

      generateReport: () => {
        const { agent, tasks, logs } = get();
        return generateTextReport({ agent, tasks, logs });
      }
    }),
    {
      name: 'agent-store',
      partialize: (state) => ({
        agent: state.agent,
        savedAgents: state.savedAgents
      })
    }
  )
);

// Helper Functions
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

function generateCSV(data: { agent: Agent; tasks: Task[]; logs: Log[]; options?: DownloadOptions }) {
  const { agent, tasks, logs, options } = data;
  let csv = '';

  if (options?.includeConfig) {
    csv += 'Agent Configuration\n';
    csv += 'Name,Goal,Provider,Model,Max Iterations,Temperature\n';
    csv += `${agent.name},${agent.goal},${agent.provider},${agent.model},${agent.maxIterations},${agent.temperature}\n\n`;
  }

  if (options?.includeTasks) {
    csv += 'Tasks\n';
    csv += 'ID,Text,Status,Timestamp,Result\n';
    tasks.forEach(task => {
      csv += `${task.id},${task.text},${task.status},${task.timestamp},${task.result || ''}\n`;
    });
    csv += '\n';
  }

  if (options?.includeLogs) {
    csv += 'Logs\n';
    csv += 'ID,Message,Type,Timestamp\n';
    logs.forEach(log => {
      csv += `${log.id},${log.message},${log.type},${log.timestamp}\n`;
    });
  }

  return csv;
}

function generateTextReport(data: { agent: Agent; tasks: Task[]; logs: Log[]; options?: DownloadOptions }) {
  const { agent, tasks, logs, options } = data;
  let report = '';

  report += '='.repeat(60) + '\n';
  report += `AGENTGPT EXECUTION REPORT\n`;
  report += '='.repeat(60) + '\n\n';

  if (options?.includeConfig) {
    report += 'AGENT CONFIGURATION\n';
    report += '-'.repeat(30) + '\n';
    report += `Name: ${agent.name}\n`;
    report += `Goal: ${agent.goal}\n`;
    report += `Provider: ${agent.provider}\n`;
    report += `Model: ${agent.model}\n`;
    report += `Max Iterations: ${agent.maxIterations}\n`;
    report += `Temperature: ${agent.temperature}\n\n`;
  }

  if (options?.includeTasks) {
    report += 'TASK EXECUTION SUMMARY\n';
    report += '-'.repeat(30) + '\n';
    const completed = tasks.filter(t => t.status === 'completed').length;
    const failed = tasks.filter(t => t.status === 'failed').length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    
    report += `Total Tasks: ${tasks.length}\n`;
    report += `Completed: ${completed}\n`;
    report += `Failed: ${failed}\n`;
    report += `Pending: ${pending}\n\n`;

    tasks.forEach((task, index) => {
      report += `${index + 1}. ${task.text}\n`;
      report += `   Status: ${task.status.toUpperCase()}\n`;
      report += `   Timestamp: ${new Date(task.timestamp).toLocaleString()}\n`;
      if (task.result) {
        report += `   Result: ${task.result}\n`;
      }
      report += '\n';
    });
  }

  if (options?.includeLogs) {
    report += 'EXECUTION LOGS\n';
    report += '-'.repeat(30) + '\n';
    logs.forEach((log, index) => {
      report += `${index + 1}. [${log.type.toUpperCase()}] ${log.message}\n`;
      report += `   ${new Date(log.timestamp).toLocaleString()}\n\n`;
    });
  }

  report += '='.repeat(60) + '\n';
  report += `Report generated: ${new Date().toLocaleString()}\n`;
  report += '='.repeat(60) + '\n';

  return report;
}
