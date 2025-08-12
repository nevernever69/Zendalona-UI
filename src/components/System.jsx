import React, { useState, useEffect } from 'react';
import { Loader, AlertCircle } from 'lucide-react';

const System = () => {
  const [systemInfo, setSystemInfo] = useState(null);
  const [healthStatus, setHealthStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSystemInfo();
    fetchHealthStatus();
  }, []);

  const fetchSystemInfo = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('https://ai-agent-zendalona-1.onrender.com/system/info');
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      const data = await response.json();
      setSystemInfo(data);
      setIsLoading(false);
    } catch (err) {
      setError(`Failed to fetch system info: ${err.message}`);
      setIsLoading(false);
    }
  };

  const fetchHealthStatus = async () => {
    try {
      const response = await fetch('https://ai-agent-zendalona-1.onrender.com/system/health');
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      const data = await response.json();
      setHealthStatus(data);
    } catch (err) {
      setError(`Failed to fetch health status: ${err.message}`);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">System Information</h2>
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md flex items-center">
          <AlertCircle size={20} className="mr-2" />
          {error}
        </div>
      )}
      {isLoading ? (
        <div className="flex items-center justify-center">
          <Loader className="animate-spin" size={24} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {healthStatus && (
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="font-semibold text-lg text-gray-800 dark:text-white">Health Status</h3>
              <p className="text-gray-600 dark:text-gray-300"><strong>Status:</strong> {healthStatus.status}</p>
              <p className="text-gray-600 dark:text-gray-300"><strong>Version:</strong> {healthStatus.version}</p>
            </div>
          )}
          {systemInfo && (
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg col-span-1 md:col-span-2">
              <h3 className="font-semibold text-lg text-gray-800 dark:text-white">System Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <p className="text-gray-600 dark:text-gray-300"><strong>Python Version:</strong> {systemInfo.python_version}</p>
                <p className="text-gray-600 dark:text-gray-300"><strong>OS Info:</strong> {systemInfo.os_info}</p>
                <p className="text-gray-600 dark:text-gray-300"><strong>CPU Usage:</strong> {systemInfo.cpu_usage}%</p>
                <p className="text-gray-600 dark:text-gray-300"><strong>Memory Usage:</strong> {systemInfo.memory_usage.percent}% ({systemInfo.memory_usage.available} available)</p>
                <p className="text-gray-600 dark:text-gray-300"><strong>Storage Info:</strong> {systemInfo.storage_info.free} free of {systemInfo.storage_info.total}</p>
              </div>
              <div className="mt-4">
                <h4 className="font-semibold text-md text-gray-800 dark:text-white">Config:</h4>
                <ul className="list-disc pl-5 mt-2 text-gray-600 dark:text-gray-300">
                  {Object.entries(systemInfo.config).map(([key, value]) => (
                    <li key={key}>{key}: {String(value)}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default System;
