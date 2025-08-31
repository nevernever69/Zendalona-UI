import React, { useState, useEffect } from 'react';
import { Loader, AlertCircle, Trash2, RefreshCw, X, Edit, Save, ArrowRight } from 'lucide-react';

const FeedbackManager = () => {
  const [feedbackEntries, setFeedbackEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [editMode, setEditMode] = useState(null);
  const [editedQuestion, setEditedQuestion] = useState('');
  const [editedAnswer, setEditedAnswer] = useState('');

  useEffect(() => {
    fetchFeedbackEntries();
  }, []);

  const fetchFeedbackEntries = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('https://chatapi.zendalona.com/feedback/');
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      const data = await response.json();
      setFeedbackEntries(data);
      setIsLoading(false);
    } catch (err) {
      setError(`Failed to fetch feedback entries: ${err.message}`);
      setIsLoading(false);
    }
  };

  const handleDelete = async (itemId) => {
    // Find the entry for better messaging
    const entry = feedbackEntries.find(e => e._id === itemId);
    const question = entry ? entry.question : 'the selected item';
    
    if (!window.confirm(`Are you sure you want to delete feedback for "${question}"?`)) return;
    try {
      setIsLoading(true);
      const response = await fetch(`https://chatapi.zendalona.com/feedback/${itemId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      const data = await response.json();
      setResponseMessage(`Successfully deleted feedback for "${question}"`);
      // Clear the response message after 3 seconds
      setTimeout(() => {
        setResponseMessage('');
      }, 3000);
      fetchFeedbackEntries();
      setIsLoading(false);
    } catch (err) {
      setError(`Failed to delete item: ${err.message}`);
      setIsLoading(false);
    }
  };

  const handleUpdateAndMove = async (itemId) => {
    // Find the entry for better messaging
    const entry = feedbackEntries.find(e => e._id === itemId);
    const question = entry ? entry.question : 'the selected item';
    
    if (!window.confirm(`Are you sure you want to update and move feedback for "${question}" to the permanent cache?`)) return;
    try {
      setIsLoading(true);
      const response = await fetch(`https://chatapi.zendalona.com/feedback/move-to-cache/${itemId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: editedQuestion, answer: editedAnswer }),
        }
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      const data = await response.json();
      setResponseMessage(`Successfully updated and moved feedback for "${question}" to permanent cache`);
      // Clear the response message after 3 seconds
      setTimeout(() => {
        setResponseMessage('');
      }, 3000);
      setEditMode(null);
      fetchFeedbackEntries();
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
          <label className="block text-sm font-medium">Feedback</label>
          <p className="mt-1 text-sm">{selectedEntry.feedback}</p>
        </div>
        {selectedEntry.user_name && (
          <div>
            <label className="block text-sm font-medium">User Name</label>
            <p className="mt-1 text-sm">{selectedEntry.user_name}</p>
          </div>
        )}
        {selectedEntry.user_email && (
          <div>
            <label className="block text-sm font-medium">User Email</label>
            <p className="mt-1 text-sm">{selectedEntry.user_email}</p>
          </div>
        )}
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => setEditMode(selectedEntry._id)}
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 flex items-center"
          >
            <Edit size={18} className="mr-2" />
            Edit & Move
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Feedback</h2>
        <button
          onClick={fetchFeedbackEntries}
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
          aria-label="Refresh feedback entries"
        >
          <RefreshCw size={20} />
        </button>
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
      ) : feedbackEntries.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Question</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Answer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Feedback</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {feedbackEntries.map((entry) => (
                <tr
                  key={entry._id}
                  onClick={() => openModal(entry)}
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">{entry.question}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 truncate max-w-md">{entry.answer}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">{entry.feedback}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                    {entry.user_name || entry.user_email || 'Anonymous'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(entry._id);
                      }}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      aria-label={`Delete feedback entry ${entry._id}`}
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
        <p className="text-gray-500 dark:text-gray-400">No feedback entries found.</p>
      )}
      {selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Feedback Entry Details</h3>
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

export default FeedbackManager;