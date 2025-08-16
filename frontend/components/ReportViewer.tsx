'use client';

import { useState } from 'react';
import { useAgentStore, Task } from '@/lib/stores/agentStore';

interface ReportViewerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReportViewer({ isOpen, onClose }: ReportViewerProps) {
  const { generateReport, agent, tasks, logs } = useAgentStore();
  const [report, setReport] = useState<string>('');

  const handleGenerateReport = () => {
    const generatedReport = generateReport();
    setReport(generatedReport);
  };

  const handleDownloadReport = () => {
    if (!report) return;
    
    const blob = new Blob([report], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${agent.name.replace(/\s+/g, '_')}_report_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">📊</div>
              <div>
                <h2 className="text-2xl font-bold">AgentGPT Report Viewer</h2>
                <p className="text-blue-100">View and analyze your agent execution reports</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-100 transition-colors duration-200 p-2 rounded-full hover:bg-white hover:bg-opacity-20"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {!report ? (
            <div className="text-center py-16">
              <div className="text-8xl mb-6 animate-bounce">📋</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Generate Your Report</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Create a comprehensive execution report to analyze your agent&apos;s performance, 
                view detailed task breakdowns, and get actionable insights.
              </p>
              <button
                onClick={handleGenerateReport}
                className="btn-primary text-lg px-8 py-4 flex items-center mx-auto"
              >
                <span className="mr-3">🚀</span>
                Generate Report
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Report Actions */}
              <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">📊</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Report Generated</h4>
                    <p className="text-sm text-gray-600">
                      {agent.name} - {new Date().toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleDownloadReport}
                    className="btn-secondary flex items-center"
                  >
                    <span className="mr-2">📥</span>
                    Download
                  </button>
                  <button
                    onClick={() => setReport('')}
                    className="btn-secondary flex items-center"
                  >
                    <span className="mr-2">🔄</span>
                    Regenerate
                  </button>
                </div>
              </div>

              {/* Report Content */}
              <div className="bg-gray-900 text-green-400 rounded-xl p-6 font-mono text-sm overflow-x-auto">
                <pre className="whitespace-pre-wrap">{report}</pre>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-200">
                  <div className="text-blue-900 font-bold text-2xl">{tasks.length}</div>
                  <div className="text-blue-700 text-sm">Total Tasks</div>
                </div>
                <div className="bg-green-50 rounded-xl p-4 text-center border border-green-200">
                  <div className="text-green-900 font-bold text-2xl">
                    {tasks.filter((t: Task) => t.status === 'completed').length}
                  </div>
                  <div className="text-green-700 text-sm">Completed</div>
                </div>
                <div className="bg-red-50 rounded-xl p-4 text-center border border-red-200">
                  <div className="text-red-900 font-bold text-2xl">
                    {tasks.filter((t: Task) => t.status === 'failed').length}
                  </div>
                  <div className="text-red-700 text-sm">Failed</div>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 text-center border border-purple-200">
                  <div className="text-purple-900 font-bold text-2xl">{logs.length}</div>
                  <div className="text-purple-700 text-sm">Log Entries</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
