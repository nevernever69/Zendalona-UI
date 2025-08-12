import React, { useState, useEffect, useRef } from 'react';
import { Loader, AlertCircle, Trash2, RefreshCw, X, Edit, Save, Upload, Download } from 'lucide-react';

const Cache = () => {
  const [cacheQuestion, setCacheQuestion] = useState('');
  const [cacheAnswer, setCacheAnswer] = useState('');
  const [cacheSource, setCacheSource] = useState('manual');
  const [cacheEntries, setCacheEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [selectedCacheEntry, setSelectedCacheEntry] = useState(null);
  const [editMode, setEditMode] = useState(null);
  const [editedQuestion, setEditedQuestion] = useState('');
  const [editedAnswer, setEditedAnswer] = useState('');
  const [csvFile, setCsvFile] = useState(null);
  const cacheFormRef = useRef(null);
  const csvFormRef = useRef(null);

  const fetchCacheEntries = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('https://ai-agent-zendalona-1.onrender.com/indexing/cache');
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      const data = await response.json();
      const entries = data.entries || data.questions || [];
      if (entries.length) {
        setCacheEntries(entries);
      } else {
        setResponseMessage('No cache entries found.');
      }
      setIsLoading(false);
    } catch (err) {
      console.error('Cache fetch error:', err);
      setError(`Failed to fetch cache entries: ${err.message}`);
      setIsLoading(false);
    }
  };

  const handleCacheSubmit = async (e) => {
    e.preventDefault();
    if (!cacheQuestion || !cacheAnswer) {
      setError('Please provide both a question and an answer');
      return;
    }
    setIsLoading(true);
    setError(null);
    setResponseMessage('');
    try {
      const response = await fetch('https://ai-agent-zendalona-1.onrender.com/cache/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: cacheQuestion,
          answer: cacheAnswer,
          source: cacheSource,
        }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      const data = await response.json();
      setResponseMessage(data.message);
      setIsLoading(false);
      cacheFormRef.current.reset();
      setCacheQuestion('');
      setCacheAnswer('');
      setCacheSource('manual');
      fetchCacheEntries();
    } catch (err) {
      setError(`Failed to add cache entry: ${err.message}`);
      setIsLoading(false);
    }
  };

  const handleDeleteCacheEntry = async (entryId) => {
    if (!window.confirm(`Are you sure you want to delete the cache entry with ID "${entryId}"?`)) {
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`https://ai-agent-zendalona-1.onrender.com/indexing/cache/${entryId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      const data = await response.json();
      setResponseMessage(data.message);
      setSelectedCacheEntry(null); // Close modal
      fetchCacheEntries();
      setIsLoading(false);
    } catch (err) {
      setError(`Failed to delete cache entry: ${err.message}`);
      setIsLoading(false);
    }
  };

  const handleUpdateCacheEntry = async (entryId) => {
    if (!window.confirm('Are you sure you want to update this cache entry?')) return;
    try {
      setIsLoading(true);
      const response = await fetch(`https://ai-agent-zendalona-1.onrender.com/cache/update/${entryId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: editedQuestion, answer: editedAnswer }),
        }
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      const data = await response.json();
      setResponseMessage(data.message);
      setEditMode(null);
      fetchCacheEntries();
      setIsLoading(false);
    } catch (err) {
      setError(`Failed to update cache entry: ${err.message}`);
      setIsLoading(false);
    }
  };

  const handleImportCsv = async (e) => {
    e.preventDefault();
    if (!csvFile) {
      setError('Please select a CSV file');
      return;
    }
    setIsLoading(true);
    setError(null);
    setResponseMessage('');
    try {
      const formData = new FormData();
      formData.append('file', csvFile);
      const response = await fetch('https://ai-agent-zendalona-1.onrender.com/cache/import', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      const data = await response.json();
      setResponseMessage(data.message);
      setIsLoading(false);
      csvFormRef.current.reset();
      setCsvFile(null);
      fetchCacheEntries();
    } catch (err) {
      setError(`Failed to import CSV: ${err.message}`);
      setIsLoading(false);
    }
  };

  const handleExportCsv = async () => {
    try {
      const response = await fetch('https://ai-agent-zendalona-1.onrender.com/cache/export');
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'cache_export.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      setError(`Failed to export CSV: ${err.message}`);
    }
  };

  const openCacheEntryModal = (entry) => {
    setSelectedCacheEntry(entry);
    setEditedQuestion(entry.question);
    setEditedAnswer(entry.answer);
  };

  const closeCacheEntryModal = () => {
    setSelectedCacheEntry(null);
    setEditMode(null);
  };

  useEffect(() => {
    fetchCacheEntries();
  }, []);

  const renderModalContent = () => {
    if (!selectedCacheEntry) return null;

    if (editMode === selectedCacheEntry.id) {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Question</label>
            <textarea
              value={editedQuestion}
              onChange={(e) => setEditedQuestion(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              rows="3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Answer</label>
            <textarea
              value={editedAnswer}
              onChange={(e) => setEditedAnswer(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              rows="6"
            />
          </div>
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => handleUpdateCacheEntry(selectedCacheEntry.id)}
              className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 flex items-center"
            >
              <Save size={18} className="mr-2" />
              Save
            </button>
            <button
              onClick={() => setEditMode(null)}
              className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4 text-gray-700 dark:text-gray-300">
        <div>
          <label className="block text-sm font-medium">ID</label>
          <p className="mt-1 text-sm">{selectedCacheEntry.id}</p>
        </div>
        <div>
          <label className="block text-sm font-medium">Question</label>
          <p className="mt-1 text-sm">{selectedCacheEntry.question || 'No question'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium">Answer</label>
          <p className="mt-1 text-sm">{selectedCacheEntry.answer || 'No answer'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium">Source</label>
          <p className="mt-1 text-sm">{selectedCacheEntry.source || 'manual'}</p>
        </div>
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => setEditMode(selectedCacheEntry.id)}
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 flex items-center"
          >
            <Edit size={18} className="mr-2" />
            Edit
          </button>
          <button
            onClick={() => handleDeleteCacheEntry(selectedCacheEntry.id)}
            className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
          >
            Delete Entry
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">Cache Management</h2>
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md flex items-center">
          <AlertCircle size={20} className="mr-2" />
          {error}
        </div>
      )}
      {responseMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
          {responseMessage}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Add Cache Entry</h3>
            <form ref={cacheFormRef} onSubmit={handleCacheSubmit} className="space-y-4">
              <div>
                <label htmlFor="cache-question" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Question</label>
                <input
                  id="cache-question"
                  type="text"
                  value={cacheQuestion}
                  onChange={(e) => setCacheQuestion(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Enter the question"
                  required
                />
              </div>
              <div>
                <label htmlFor="cache-answer" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Answer</label>
                <textarea
                  id="cache-answer"
                  value={cacheAnswer}
                  onChange={(e) => setCacheAnswer(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  rows="4"
                  placeholder="Enter the answer"
                  required
                />
              </div>
              <div>
                <label htmlFor="cache-source" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Source</label>
                <input
                  id="cache-source"
                  type="text"
                  value={cacheSource}
                  onChange={(e) => setCacheSource(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="manual"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                {isLoading ? <Loader className="animate-spin mx-auto" size={20} /> : 'Add to Cache'}
              </button>
            </form>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Import from CSV</h3>
            <form ref={csvFormRef} onSubmit={handleImportCsv} className="space-y-4">
              <div>
                <label htmlFor="csv-file" className="block text-sm font-medium text-gray-700 dark:text-gray-300">CSV File</label>
                <input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files[0])}
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:text-gray-400 dark:file:bg-blue-500 dark:file:text-white dark:hover:file:bg-blue-600"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 dark:bg-green-500 dark:hover:bg-green-600 flex items-center justify-center"
              >
                <Upload size={18} className="mr-2" />
                {isLoading ? <Loader className="animate-spin mx-auto" size={20} /> : 'Import CSV'}
              </button>
            </form>
          </div>
        </div>
        <div className="md:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Cache Entries</h3>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleExportCsv}
                className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 disabled:bg-gray-400 dark:bg-gray-500 dark:hover:bg-gray-600 flex items-center"
              >
                <Download size={18} className="mr-2" />
                Export CSV
              </button>
              <button
                onClick={fetchCacheEntries}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
                aria-label="Refresh cache entries"
              >
                <RefreshCw size={20} />
              </button>
            </div>
          </div>
          {isLoading && !cacheEntries.length ? (
            <div className="flex items-center justify-center">
              <Loader className="animate-spin" size={24} />
            </div>
          ) : cacheEntries.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Question</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Answer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {cacheEntries.map((entry) => (
                    <tr key={entry.id} onClick={() => openCacheEntryModal(entry)} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">{entry.question || 'No question'}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 truncate max-w-md">{entry.answer || 'No answer'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCacheEntry(entry.id);
                          }}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          aria-label={`Delete cache entry ${entry.id}`}
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No cache entries found.</p>
          )}
        </div>
      </div>
      {selectedCacheEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Cache Entry Details</h3>
              <button onClick={closeCacheEntryModal} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                <X size={24} />
              </button>
            </div>
            {renderModalContent()}
          </div>
        </div>
      )}
    </div>
  );
};

export default Cache;