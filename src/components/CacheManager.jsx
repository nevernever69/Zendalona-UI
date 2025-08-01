
import React, { useState, useEffect, useRef } from 'react';
import { Edit, Trash2, Upload, Save, X, AlertCircle } from 'lucide-react';

const CacheManager = () => {
  const [cacheData, setCacheData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editRowId, setEditRowId] = useState(null);
  const [editedQuestion, setEditedQuestion] = useState('');
  const [editedAnswer, setEditedAnswer] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [expandedAnswers, setExpandedAnswers] = useState({});
  const fileInputRef = useRef(null);

  const API_URL = '/api/indexing';

  useEffect(() => {
    fetchCacheData();
  }, []);

  const fetchCacheData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/cache`);
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      if (data && Array.isArray(data.entries)) {
        setCacheData(data.entries);
      } else {
        setError('Received unexpected data format from the server.');
        setCacheData([]);
      }
    } catch (err) {
      setError('Failed to fetch cache data. Please try again.');
      console.error('Error fetching cache data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (entry) => {
    setEditRowId(entry.id);
    setEditedQuestion(entry.question);
    setEditedAnswer(entry.answer);
  };

  const handleCancelEdit = () => {
    setEditRowId(null);
    setEditedQuestion('');
    setEditedAnswer('');
  };

  const handleSaveEdit = async (entryId) => {
    try {
      const response = await fetch(`/api/cache/update/${entryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: editedQuestion,
          answer: editedAnswer,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      setCacheData(prevData =>
        prevData.map(entry =>
          entry.id === entryId
            ? { ...entry, question: editedQuestion, answer: editedAnswer }
            : entry
        )
      );
      handleCancelEdit();
    } catch (err) {
      setError('Failed to update cache entry. Please try again.');
      console.error('Error updating cache entry:', err);
    }
  };

  const handleDeleteClick = async (entryId) => {
    if (window.confirm('Are you sure you want to delete this cache entry?')) {
      try {
        const response = await fetch(`/api/cache/delete/${entryId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        setCacheData(prevData => prevData.filter(entry => entry.id !== entryId));
      } catch (err) {
        setError('Failed to delete cache entry. Please try again.');
        console.error('Error deleting cache entry:', err);
      }
    }
  };

  const handleImportClick = () => {
    setShowImportModal(true);
  };

  const handleFileChange = (e) => {
    setImportFile(e.target.files[0]);
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (!importFile) {
      setError('Please select a file to import.');
      return;
    }

    const formData = new FormData();
    formData.append('file', importFile);

    try {
      const response = await fetch(`${API_URL}/import`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      setShowImportModal(false);
      setImportFile(null);
      fetchCacheData(); // Refresh data after import
    } catch (err) {
      setError('Failed to import file. Please make sure it is a valid CSV file.');
      console.error('Error importing file:', err);
    }
  };

  const toggleAnswerExpansion = (entryId) => {
    setExpandedAnswers(prev => ({ ...prev, [entryId]: !prev[entryId] }));
  };

  const renderAnswer = (entry) => {
    const isExpanded = expandedAnswers[entry.id];
    const isLong = entry.answer.length > 100;

    if (isLong && !isExpanded) {
      return (
        <>
          {`${entry.answer.substring(0, 100)}...`}
          <button
            onClick={() => toggleAnswerExpansion(entry.id)}
            className="text-blue-600 hover:underline ml-2"
          >
            Show more
          </button>
        </>
      );
    }

    return (
      <>
        {entry.answer}
        {isLong && (
          <button
            onClick={() => toggleAnswerExpansion(entry.id)}
            className="text-blue-600 hover:underline ml-2"
          >
            Show less
          </button>
        )}
      </>
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Cache Manager</h1>
          <button
            onClick={handleImportClick}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Upload size={18} />
            Import Q&A
          </button>
        </div>

        {error && (
          <div
            className="flex items-center gap-2 p-3 rounded-lg my-4 bg-red-50 text-red-700"
            role="alert"
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-10">
            <p className="text-gray-500">Loading cache data...</p>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Question
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Answer
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cacheData.map((entry) => (
                  <tr key={entry.id}>
                    <td className="px-6 py-4 whitespace-pre-wrap">
                      {editRowId === entry.id ? (
                        <textarea
                          value={editedQuestion}
                          onChange={(e) => setEditedQuestion(e.target.value)}
                          className="w-full p-2 border rounded-md"
                          rows="6"
                        />
                      ) : (
                        entry.question
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-pre-wrap">
                      {editRowId === entry.id ? (
                        <textarea
                          value={editedAnswer}
                          onChange={(e) => setEditedAnswer(e.target.value)}
                          className="w-full p-2 border rounded-md"
                          rows="10"
                        />
                      ) : (
                        renderAnswer(entry)
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {editRowId === entry.id ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleSaveEdit(entry.id)}
                            className="p-2 text-green-600 hover:text-green-800"
                            aria-label="Save"
                          >
                            <Save size={18} />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-2 text-gray-600 hover:text-gray-800"
                            aria-label="Cancel"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEditClick(entry)}
                            className="p-2 text-blue-600 hover:text-blue-800"
                            aria-label="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(entry.id)}
                            className="p-2 text-red-600 hover:text-red-800"
                            aria-label="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Import Q&A</h2>
              <button
                onClick={() => setShowImportModal(false)}
                className="p-1 rounded-full hover:bg-gray-200"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleImportSubmit}>
              <label htmlFor="import-file" className="block mb-2 font-medium">
                Select CSV file
              </label>
              <input
                id="import-file"
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="w-full p-2 border rounded-md"
              />
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                >
                  Import
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CacheManager;
