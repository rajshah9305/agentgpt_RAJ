'use client';

import { useState } from 'react';
import { useAgentStore, DownloadOptions, ExportFormat, Task } from '@/lib/stores/agentStore';
import { ReportViewer } from './ReportViewer';

export function DownloadPanel() {
  const { downloadAgentData, downloadSimple, generateReport, agent, tasks, logs } = useAgentStore();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showReportViewer, setShowReportViewer] = useState(false);
  const [downloadOptions, setDownloadOptions] = useState<DownloadOptions>({
    format: 'json',
    includeLogs: true,
    includeTasks: true,
    includeConfig: true
  });

  const handleSimpleDownload = async (format: ExportFormat) => {
    await downloadSimple(format);
  };

  const handleAdvancedDownload = async () => {
    await downloadAgentData(downloadOptions);
  };

  const handleViewReport = () => {
    setShowReportViewer(true);
  };

  return (
    <>
      <div className="card hover-lift">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900 flex items-center">
            <span className="mr-3 text-3xl">📥</span>
            Download & Export
          </h3>
          <button
            onClick={handleViewReport}
            className="btn-secondary px-6 py-3 hover-glow"
          >
            📊 View Report
          </button>
        </div>

        {/* Quick Download Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => handleSimpleDownload('json')}
            className="btn-primary py-4 hover-glow flex items-center justify-center"
          >
            <span className="mr-3 text-2xl">📄</span>
            <div className="text-left">
              <div className="font-semibold">JSON Export</div>
              <div className="text-sm opacity-90">Structured data</div>
            </div>
          </button>
          
          <button
            onClick={() => handleSimpleDownload('csv')}
            className="btn-primary py-4 hover-glow flex items-center justify-center"
          >
            <span className="mr-3 text-2xl">📊</span>
            <div className="text-left">
              <div className="font-semibold">CSV Export</div>
              <div className="text-sm opacity-90">Spreadsheet format</div>
            </div>
          </button>
          
          <button
            onClick={() => handleSimpleDownload('txt')}
            className="btn-primary py-4 hover-glow flex items-center justify-center"
          >
            <span className="mr-3 text-2xl">📝</span>
            <div className="text-left">
              <div className="font-semibold">Text Report</div>
              <div className="text-sm opacity-90">Readable format</div>
            </div>
          </button>
        </div>

        {/* Advanced Options */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-800">Advanced Export Options</h4>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline transition-colors duration-200"
            >
              {showAdvanced ? 'Hide Options' : 'Show Options'}
            </button>
          </div>
          
          {showAdvanced && (
            <div className="space-y-6 p-6 bg-gray-50 rounded-xl border border-gray-200 animate-in slide-in-from-top-2 duration-300">
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">Export Format</label>
                <select
                  value={downloadOptions.format}
                  onChange={(e) => setDownloadOptions((prev: DownloadOptions) => ({ ...prev, format: e.target.value as ExportFormat }))}
                  className="input-field"
                >
                  <option value="json">JSON - Structured data</option>
                  <option value="csv">CSV - Spreadsheet format</option>
                  <option value="txt">TXT - Readable report</option>
                </select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={downloadOptions.includeConfig}
                    onChange={(e) => setDownloadOptions((prev: DownloadOptions) => ({ ...prev, includeConfig: e.target.checked }))}
                    className="rounded border-gray-300 bg-white text-blue-600 focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-gray-700 text-sm font-medium">Include Configuration</span>
                </label>
                
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={downloadOptions.includeTasks}
                    onChange={(e) => setDownloadOptions((prev: DownloadOptions) => ({ ...prev, includeTasks: e.target.checked }))}
                    className="rounded border-gray-300 bg-white text-blue-600 focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-gray-700 text-sm font-medium">Include Tasks</span>
                </label>
                
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={downloadOptions.includeLogs}
                    onChange={(e) => setDownloadOptions((prev: DownloadOptions) => ({ ...prev, includeLogs: e.target.checked }))}
                    className="rounded border-gray-300 bg-white text-blue-600 focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-gray-700 text-sm font-medium">Include Logs</span>
                </label>
              </div>
              
              <button
                onClick={handleAdvancedDownload}
                className="btn-primary w-full py-3 hover:scale-105 transition-transform duration-200"
              >
                📥 Download with Options
              </button>
            </div>
          )}
        </div>

        {/* Data Summary */}
        <div className="mb-8">
          <h4 className="font-semibold text-gray-800 mb-4 text-lg">Data Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-200 hover:scale-105 transition-transform duration-200">
              <div className="text-blue-900 font-bold text-xl">{tasks.length}</div>
              <div className="text-blue-700 text-sm">Total Tasks</div>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 text-center border border-purple-200 hover:scale-105 transition-transform duration-200">
              <div className="text-purple-900 font-bold text-xl">{logs.length}</div>
              <div className="text-purple-700 text-sm">Log Entries</div>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center border border-green-200 hover:scale-105 transition-transform duration-200">
              <div className="text-green-900 font-bold text-xl">
                {tasks.filter((t: Task) => t.status === 'completed').length}
              </div>
              <div className="text-green-700 text-sm">Completed</div>
            </div>
            <div className="bg-red-50 rounded-xl p-4 text-center border border-red-200 hover:scale-105 transition-transform duration-200">
              <div className="text-red-900 font-bold text-xl">
                {tasks.filter((t: Task) => t.status === 'failed').length}
              </div>
              <div className="text-red-700 text-sm">Failed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Report Viewer Modal */}
      <ReportViewer 
        isOpen={showReportViewer} 
        onClose={() => setShowReportViewer(false)} 
      />
    </>
  );
}
