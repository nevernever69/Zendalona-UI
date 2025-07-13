import React, { useState, useEffect, useRef } from 'react';
import { Loader, AlertCircle, Trash2, RefreshCw, X } from 'lucide-react';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('crawl');
  const [crawlUrl, setCrawlUrl] = useState('');
  const [maxPages, setMaxPages] = useState(10);
  const [depth, setDepth] = useState(2);
  const [pdfFile, setPdfFile] = useState(null);
  const [cacheQuestion, setCacheQuestion] = useState('');
  const [cacheAnswer, setCacheAnswer] = useState('');
  const [cacheSource, setCacheSource] = useState('manual');
  const [cacheEntries, setCacheEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState('');
  const [documents, setDocuments] = useState([]);
  const [systemInfo, setSystemInfo] = useState(null);
  const [healthStatus, setHealthStatus] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showSecondDeleteConfirm, setShowSecondDeleteConfirm] = useState(null);
  const [selectedCacheEntry, setSelectedCacheEntry] = useState(null);

  const crawlFormRef = useRef(null);
  const pdfFormRef = useRef(null);
  const cacheFormRef = useRef(null);

  useEffect(() => {
    fetchCollections();
    fetchSystemInfo();
    fetchHealthStatus();
    if (activeTab === 'cache') {
      fetchCacheEntries();
    }
    if (activeTab === 'collections' && selectedCollection) {
      fetchDocuments(selectedCollection);
    }
  }, [activeTab, selectedCollection]);

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

  const fetchSystemInfo = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/system/info');
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      const data = await response.json();
      setSystemInfo(data);
    } catch (err) {
      setError(`Failed to fetch system info: ${err.message}`);
    }
  };

  const fetchHealthStatus = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/system/health');
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      const data = await response.json();
      setHealthStatus(data);
    } catch (err) {
      setError(`Failed to fetch health status: ${err.message}`);
    }
  };

  const fetchCacheEntries = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://127.0.0.1:8000/indexing/cache');
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      const data = await response.json();
      const entries = data.entries || data.questions || [];
      if (entries.length) {
        setCacheEntries(entries);
      } else {
        setError('No cache entries found in response');
      }
      setIsLoading(false);
    } catch (err) {
      console.error('Cache fetch error:', err);
      setError(`Failed to fetch cache entries: ${err.message}`);
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

  const handleDeleteCacheEntry = async (entryId) => {
    if (!window.confirm(`Are you sure you want to delete the cache entry with ID "${entryId}"?`)) {
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`http://127.0.0.1:8000/indexing/cache/${entryId}`, {
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

  const handleDeleteCollection = async (collectionName) => {
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
      setSelectedCollection('');
      fetchCollections();
      setIsLoading(false);
    } catch (err) {
      setError(`Failed to delete collection ${collectionName}: ${err.message}`);
      setIsLoading(false);
    } finally {
      setShowDeleteConfirm(null);
      setShowSecondDeleteConfirm(null);
    }
  };

  const initiateDeleteCollection = (collectionName) => {
    setShowDeleteConfirm(collectionName);
  };

  const confirmDeleteCollection = (collectionName) => {
    setShowDeleteConfirm(null);
    setShowSecondDeleteConfirm(collectionName);
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

  const handleCrawlSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResponseMessage('');
    try {
      const response = await fetch('http://127.0.0.1:8000/indexing/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: crawlUrl, max_pages: maxPages, depth }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      const data = await response.json();
      setResponseMessage(data.message);
      setIsLoading(false);
      crawlFormRef.current.reset();
      setCrawlUrl('');
      setMaxPages(10);
      setDepth(2);
      fetchCollections();
    } catch (err) {
      setError(`Failed to crawl website: ${err.message}`);
      setIsLoading(false);
    }
  };

  const handlePdfUpload = async (e) => {
    e.preventDefault();
    if (!pdfFile) {
      setError('Please select a PDF file');
      return;
    }
    setIsLoading(true);
    setError(null);
    setResponseMessage('');
    try {
      const formData = new FormData();
      formData.append('file', pdfFile);
      const response = await fetch('http://127.0.0.1:8000/indexing/upload-pdf', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      const data = await response.json();
      setResponseMessage(data.message);
      setIsLoading(false);
      pdfFormRef.current.reset();
      setPdfFile(null);
      fetchCollections();
    } catch (err) {
      setError(`Failed to upload PDF: ${err.message}`);
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
      const response = await fetch('http://127.0.0.1:8000/cache/add', {
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

  const openCacheEntryModal = (entry) => {
    setSelectedCacheEntry(entry);
  };

  const closeCacheEntryModal = () => {
    setSelectedCacheEntry(null);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'crawl':
        return (
          <form ref={crawlFormRef} onSubmit={handleCrawlSubmit} className="space-y-4">
            <div>
              <label htmlFor="crawl-url" className="block text-sm font-medium">
                Website URL
              </label>
              <input
                id="crawl-url"
                type="url"
                value={crawlUrl}
                onChange={(e) => setCrawlUrl(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com"
                required
              />
            </div>
            <div>
              <label htmlFor="max-pages" className="block text-sm font-medium">
                Maximum Pages
              </label>
              <input
                id="max-pages"
                type="number"
                value={maxPages}
                onChange={(e) => setMaxPages(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                min="1"
                required
              />
            </div>
            <div>
              <label htmlFor="depth" className="block text-sm font-medium">
                Crawl Depth
              </label>
              <input
                id="depth"
                type="number"
                value={depth}
                onChange={(e) => setDepth(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                min="1"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isLoading ? (
                <Loader className="animate-spin mx-auto" size={20} />
              ) : (
                'Start Crawling'
              )}
            </button>
          </form>
        );
      case 'pdf':
        return (
          <form ref={pdfFormRef} onSubmit={handlePdfUpload} className="space-y-4">
            <div>
              <label htmlFor="pdf-file" className="block text-sm font-medium">
                PDF File
              </label>
              <input
                id="pdf-file"
                type="file"
                accept=".pdf"
                onChange={(e) => setPdfFile(e.target.files[0])}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isLoading ? (
                <Loader className="animate-spin mx-auto" size={20} />
              ) : (
                'Upload PDF'
              )}
            </button>
          </form>
        );
      case 'cache':
        return (
          <div className="space-y-8">
            <form ref={cacheFormRef} onSubmit={handleCacheSubmit} className="space-y-4">
              <h3 className="text-lg font-semibold">Add Cache Entry</h3>
              <div>
                <label htmlFor="cache-question" className="block text-sm font-medium">
                  Question
                </label>
                <input
                  id="cache-question"
                  type="text"
                  value={cacheQuestion}
                  onChange={(e) => setCacheQuestion(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter the question"
                  required
                />
              </div>
              <div>
                <label htmlFor="cache-answer" className="block text-sm font-medium">
                  Answer
                </label>
                <textarea
                  id="cache-answer"
                  value={cacheAnswer}
                  onChange={(e) => setCacheAnswer(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  rows="4"
                  placeholder="Enter the answer"
                  required
                />
              </div>
              <div>
                <label htmlFor="cache-source" className="block text-sm font-medium">
                  Source
                </label>
                <input
                  id="cache-source"
                  type="text"
                  value={cacheSource}
                  onChange={(e) => setCacheSource(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="manual"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              >
                {isLoading ? (
                  <Loader className="animate-spin mx-auto" size={20} />
                ) : (
                  'Add to Cache'
                )}
              </button>
            </form>
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Cache Entries</h3>
                <button
                  onClick={fetchCacheEntries}
                  className="text-blue-600 hover:text-blue-800 flex items-center"
                  aria-label="Refresh cache entries"
                >
                  <RefreshCw size={20} className="mr-2" />
                  Refresh
                </button>
              </div>
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <Loader className="animate-spin" size={24} />
                </div>
              ) : cacheEntries.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Question</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Answer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {cacheEntries.map((entry) => (
                        <tr
                          key={entry.id}
                          onClick={() => openCacheEntryModal(entry)}
                          className="cursor-pointer hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.id}</td>
                          <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">{entry.question || 'No question'}</td>
                          <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-md">{entry.answer || 'No answer'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.source || 'manual'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent row click
                                handleDeleteCacheEntry(entry.id);
                              }}
                              className="text-red-600 hover:text-red-800"
                              aria-label={`Delete cache entry ${entry.id}`}
                            >
                              <Trash2 size={20} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">No cache entries found.</p>
              )}
            </div>
            {selectedCacheEntry && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Cache Entry Details</h3>
                    <button onClick={closeCacheEntryModal} className="text-gray-500 hover:text-gray-700">
                      <X size={24} />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">ID</label>
                      <p className="mt-1 text-sm text-gray-500">{selectedCacheEntry.id}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Question</label>
                      <p className="mt-1 text-sm text-gray-500">{selectedCacheEntry.question || 'No question'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Answer</label>
                      <p className="mt-1 text-sm text-gray-500">{selectedCacheEntry.answer || 'No answer'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Source</label>
                      <p className="mt-1 text-sm text-gray-500">{selectedCacheEntry.source || 'manual'}</p>
                    </div>
                    <div className="flex justify-end space-x-4">
                      <button
                        onClick={() => handleDeleteCacheEntry(selectedCacheEntry.id)}
                        className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
                      >
                        Delete Entry
                      </button>
                      <button
                        onClick={closeCacheEntryModal}
                        className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case 'collections':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Collections</h3>
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <Loader className="animate-spin" size={24} />
                </div>
              ) : collections.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Collection Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {collections.map((collection) => (
                        <tr key={collection}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{collection}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => setSelectedCollection(collection)}
                              className="text-blue-600 hover:text-blue-800 mr-4"
                              aria-label={`View documents in collection ${collection}`}
                            >
                              View Documents
                            </button>
                            <button
                              onClick={() => initiateDeleteCollection(collection)}
                              className="text-red-600 hover:text-red-800"
                              aria-label={`Delete collection ${collection}`}
                            >
                              <Trash2 size={20} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">No collections found.</p>
              )}
            </div>
            {showDeleteConfirm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                  <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Are you sure you want to delete the collection "{showDeleteConfirm}"? This action cannot be undone.
                  </p>
                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={() => confirmDeleteCollection(showDeleteConfirm)}
                      className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(null)}
                      className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
            {showSecondDeleteConfirm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                  <h3 className="text-lg font-semibold mb-4">Final Confirmation</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Please confirm again to delete the collection "{showSecondDeleteConfirm}". This action is permanent.
                  </p>
                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={() => handleDeleteCollection(showSecondDeleteConfirm)}
                      className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
                    >
                      Delete Permanently
                    </button>
                    <button
                      onClick={() => setShowSecondDeleteConfirm(null)}
                      className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
            {selectedCollection && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Documents in {selectedCollection}</h3>
                  <button
                    onClick={() => fetchDocuments(selectedCollection)}
                    className="text-blue-600 hover:text-blue-800 flex items-center"
                    aria-label={`Refresh documents in ${selectedCollection}`}
                  >
                    <RefreshCw size={20} className="mr-2" />
                    Refresh
                  </button>
                </div>
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <Loader className="animate-spin" size={24} />
                  </div>
                ) : documents.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source/Content</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {documents.map((doc) => (
                          <tr key={doc.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.id}</td>
                            <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-md">{doc.content}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <button
                                onClick={() => handleDeleteDocument(selectedCollection, doc.id)}
                                className="text-red-600 hover:text-red-800"
                                aria-label={`Delete document ${doc.id}`}
                              >
                                <Trash2 size={20} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500">No documents found in this collection.</p>
                )}
              </div>
            )}
          </div>
        );
      case 'system':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">System Information</h3>
            {healthStatus && (
              <div>
                <p><strong>Status:</strong> {healthStatus.status}</p>
                <p><strong>Version:</strong> {healthStatus.version}</p>
              </div>
            )}
            {systemInfo && (
              <div>
                <p><strong>Python Version:</strong> {systemInfo.python_version}</p>
                <p><strong>OS Info:</strong> {systemInfo.os_info}</p>
                <p><strong>CPU Usage:</strong> {systemInfo.cpu_usage}%</p>
                <p><strong>Memory Usage:</strong> {systemInfo.memory_usage.percent}% ({systemInfo.memory_usage.available} available)</p>
                <p><strong>Storage Info:</strong> {systemInfo.storage_info.free} free of {systemInfo.storage_info.total}</p>
                <p><strong>Config:</strong></p>
                <ul className="list-disc pl-5">
                  {Object.entries(systemInfo.config).map(([key, value]) => (
                    <li key={key}>{key}: {value}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>
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
        <div className="flex mb-6 border-b border-gray-200">
          {['crawl', 'pdf', 'cache', 'collections', 'system'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 -mb-px text-sm font-medium border-b-2 ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        <div className="mt-4">{renderTabContent()}</div>
      </div>
    </div>
  );
};

export default AdminPanel;