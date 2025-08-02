import React, { useState, useEffect } from 'react';
import { Loader, AlertCircle, Trash2, RefreshCw, X, Edit, Save, ArrowRight, Info } from 'lucide-react';

const TempCacheManager = () => {
  const [tempCacheEntries, setTempCacheEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [editMode, setEditMode] = useState(null);
  const [editedQuestion, setEditedQuestion] = useState('');
  const [editedAnswer, setEditedAnswer] = useState('');

  useEffect(() => {
    fetchTempCacheEntries();
  }, []);

  const fetchTempCacheEntries = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://127.0.0.1:8000/temp-cache/');
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      const data = await response.json();
      setTempCacheEntries(data);
      setIsLoading(false);
    } catch (err) {
      setError(`Failed to fetch temporary cache entries: ${err.message}`);
      setIsLoading(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      setIsLoading(true);
      const response = await fetch(`http://127.0.0.1:8000/temp-cache/${itemId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      const data = await response.json();
      setResponseMessage(data.message);
      fetchTempCacheEntries();
      setIsLoading(false);
    } catch (err) {
      setError(`Failed to delete item: ${err.message}`);
      setIsLoading(false);
    }
  };

  const handleMoveToCache = async (itemId) => {
    if (!window.confirm('Are you sure you want to move this item to the permanent cache?')) return;
    try {
      setIsLoading(true);
      const response = await fetch(`http://127.0.0.1:8000/temp-cache/move/${itemId}`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      const data = await response.json();
      setResponseMessage(data.message);
      fetchTempCacheEntries();
      setIsLoading(false);
    } catch (err) {
      setError(`Failed to move item: ${err.message}`);
      setIsLoading(false);
    }
  };

  const handleUpdate = async (itemId) => {
    if (!window.confirm('Are you sure you want to update this item?')) return;
    try {
      setIsLoading(true);
      const response = await fetch(`http://127.0.0.1:8000/temp-cache/${itemId}`,
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
      fetchTempCacheEntries();
      setIsLoading(false);
    } catch (err) {
      setError(`Failed to update item: ${err.message}`);
      setIsLoading(false);
    }
  };

  const handleUpdateAndMove = async (itemId) => {
    if (!window.confirm('Are you sure you want to update and move this item to the permanent cache?')) return;
    try {
      setIsLoading(true);
      const response = await fetch(`http://127.0.0.1:8000/temp-cache/update-and-move/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: editedQuestion, answer: editedAnswer }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      const data = await response.json();
      setResponseMessage(data.message);
      setEditMode(null);
      fetchTempCacheEntries();
      setIsLoading(false);
    } catch (err) {
      setError(`Failed to update and move item: ${err.message}`);
      setIsLoading(false);
    }
  };

  const openModal = (entry) => {
    setSelectedEntry(entry);
    setEditedQuestion(entry.question);
    setEditedAnswer(entry.answer);
  };

  const closeModal = () => {
    setSelectedEntry(null);
    setEditMode(null);
  };

  const calculateDaysLeft = (createdAt) => {
    const createdDate = new Date(createdAt);
    const expiryDate = new Date(createdDate.getTime() + 8 * 24 * 60 * 60 * 1000);
    const now = new Date();
    const diffTime = expiryDate - now;
    if (diffTime <= 0) return "Expired";
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} day(s)`;
  };

  const renderModalContent = () => {
    if (!selectedEntry) return null;

    if (editMode === selectedEntry._id) {
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
              onClick={() => handleUpdate(selectedEntry._id)}
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 flex items-center"
            >
              <Save size={18} className="mr-2" />
              Save
            </button>
            <button
              onClick={() => handleUpdateAndMove(selectedEntry._id)}
              className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 flex items-center"
            >
              <Save size={18} className="mr-2" />
              Save & Move
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
          <p className="mt-1 text-sm">{selectedEntry._id}</p>
        </div>
        <div>
          <label className="block text-sm font-medium">Question</label>
          <p className="mt-1 text-sm">{selectedEntry.question}</p>
        </div>
        <div>
          <label className="block text-sm font-medium">Answer</label>
          <p className="mt-1 text-sm">{selectedEntry.answer}</p>
        </div>
        <div>
          <label className="block text-sm font-medium">Created At</label>
          <p className="mt-1 text-sm">{new Date(selectedEntry.createdAt).toLocaleString()}</p>
        </div>
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => setEditMode(selectedEntry._id)}
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 flex items-center"
          >
            <Edit size={18} className="mr-2" />
            Edit
          </button>
          <button
            onClick={() => handleMoveToCache(selectedEntry._id)}
            className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 flex items-center"
          >
            <ArrowRight size={18} className="mr-2" />
            Move to Cache
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Temporary Cache</h2>
        <button
          onClick={fetchTempCacheEntries}
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
          aria-label="Refresh temporary cache entries"
        >
          <RefreshCw size={20} />
        </button>
      </div>
      <div className="mb-6 p-4 bg-blue-50 dark:bg-gray-700 rounded-lg flex items-center">
        <Info size={20} className="text-blue-500 dark:text-blue-300 mr-3" />
        <p className="text-sm text-blue-700 dark:text-blue-200">
          Note: Entries in this cache are automatically deleted after 8 days.
        </p>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center">
          <Loader className="animate-spin" size={24} />
        </div>
      ) : error ? (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md flex items-center">
          <AlertCircle size={20} className="mr-2" />
          {error}
        </div>
      ) : responseMessage ? (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
          {responseMessage}
        </div>
      ) : tempCacheEntries.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Question</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Answer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Expires In</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {tempCacheEntries.map((entry) => (
                <tr
                  key={entry._id}
                  onClick={() => openModal(entry)}
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">{entry.question}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 truncate max-w-md">{entry.answer}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{calculateDaysLeft(entry.createdAt)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(entry._id);
                      }}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      aria-label={`Delete temporary cache entry ${entry._id}`}
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
        <p className="text-gray-500 dark:text-gray-400">No temporary cache entries found.</p>
      )}
      {selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Temporary Cache Entry Details</h3>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
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

export default TempCacheManager;
