import React, { useState, useEffect } from 'react';
import { Loader, AlertCircle, Trash2, RefreshCw } from 'lucide-react';

const Collections = () => {
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [responseMessage, setResponseMessage] = useState('');

  const fetchCollections = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://127.0.0.1:8000/indexing/collections');
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      const data = await response.json();
      setCollections(data.collections);
      setIsLoading(false);
    } catch (err) {
      setError(`Failed to fetch collections: ${err.message}`);
      setIsLoading(false);
    }
  };

  const fetchDocuments = async (collectionName) => {
    try {
      setIsLoading(true);
      const response = await fetch(`http://127.0.0.1:8000/indexing/collections/${collectionName}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      const data = await response.json();
      if (data.documents) {
        setDocuments(data.documents.map(doc => ({
          id: doc.id,
          content: doc.content || doc.page_content || doc.source || 'No content available',
        })));
      } else {
        setError(`No documents found for collection ${collectionName}`);
      }
      setIsLoading(false);
    } catch (err) {
      setError(`Failed to fetch documents for collection ${collectionName}: ${err.message}`);
      setIsLoading(false);
    }
  };

  const handleDeleteCollection = async (collectionName) => {
    if (collectionName === 'zendalona') {
      alert('The "zendalona" collection cannot be deleted.');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete the collection "${collectionName}"? This action is permanent and cannot be undone.`)) {
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`http://127.0.0.1:8000/indexing/collections/${collectionName}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      const data = await response.json();
      setResponseMessage(data.message);
      setDocuments([]);
      setSelectedCollection(null);
      fetchCollections();
      setIsLoading(false);
    } catch (err) {
      setError(`Failed to delete collection ${collectionName}: ${err.message}`);
      setIsLoading(false);
    }
  };

  const handleDeleteDocument = async (collectionName, documentId) => {
    if (!window.confirm(`Are you sure you want to delete the document "${documentId}" from collection "${collectionName}"?`)) {
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`http://127.0.0.1:8000/indexing/collections/${collectionName}/${documentId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      const data = await response.json();
      setResponseMessage(data.message);
      fetchDocuments(collectionName);
      setIsLoading(false);
    } catch (err) {
      setError(`Failed to delete document ${documentId}: ${err.message}`);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  useEffect(() => {
    if (selectedCollection) {
      fetchDocuments(selectedCollection);
    }
  }, [selectedCollection]);

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">Collections</h2>
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
        <div className="md:col-span-1">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Available Collections</h3>
            <button
              onClick={fetchCollections}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
              aria-label="Refresh collections"
            >
              <RefreshCw size={20} />
            </button>
          </div>
          {isLoading && !collections.length ? (
            <div className="flex items-center justify-center">
              <Loader className="animate-spin" size={24} />
            </div>
          ) : collections.length > 0 ? (
            <ul className="space-y-2">
              {collections.map((collection) => (
                <li
                  key={collection}
                  className={`p-3 rounded-lg cursor-pointer flex justify-between items-center ${
                    selectedCollection === collection
                      ? 'bg-blue-100 dark:bg-blue-900'
                      : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                  onClick={() => setSelectedCollection(collection)}
                >
                  <span className="font-medium text-gray-800 dark:text-white">{collection}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCollection(collection);
                    }}
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    aria-label={`Delete collection ${collection}`}
                  >
                    <Trash2 size={18} />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No collections found.</p>
          )}
        </div>
        <div className="md:col-span-2">
          {selectedCollection ? (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Documents in {selectedCollection}</h3>
                <button
                  onClick={() => fetchDocuments(selectedCollection)}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
                  aria-label={`Refresh documents in ${selectedCollection}`}
                >
                  <RefreshCw size={20} />
                </button>
              </div>
              {isLoading && !documents.length ? (
                <div className="flex items-center justify-center">
                  <Loader className="animate-spin" size={24} />
                </div>
              ) : documents.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Document ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Content</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {documents.map((doc) => (
                        <tr key={doc.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{doc.id}</td>
                          <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 truncate max-w-md">{doc.content}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => handleDeleteDocument(selectedCollection, doc.id)}
                              className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                              aria-label={`Delete document ${doc.id}`}
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
                <p className="text-gray-500 dark:text-gray-400">No documents found in this collection.</p>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 dark:text-gray-400">Select a collection to view its documents.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Collections;
