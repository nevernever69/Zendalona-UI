import React, { useState, useRef } from 'react';
import { Loader, AlertCircle } from 'lucide-react';

const Crawl = () => {
  const [crawlUrl, setCrawlUrl] = useState('');
  const [maxPages, setMaxPages] = useState(10);
  const [depth, setDepth] = useState(2);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [responseMessage, setResponseMessage] = useState('');
  const crawlFormRef = useRef(null);

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
    } catch (err) {
      setError(`Failed to crawl website: ${err.message}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">Crawl Website</h2>
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
      <form ref={crawlFormRef} onSubmit={handleCrawlSubmit} className="space-y-4">
        <div>
          <label htmlFor="crawl-url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Website URL
          </label>
          <input
            id="crawl-url"
            type="url"
            value={crawlUrl}
            onChange={(e) => setCrawlUrl(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="https://example.com"
            required
          />
        </div>
        <div>
          <label htmlFor="max-pages" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Maximum Pages
          </label>
          <input
            id="max-pages"
            type="number"
            value={maxPages}
            onChange={(e) => setMaxPages(Number(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            min="1"
            required
          />
        </div>
        <div>
          <label htmlFor="depth" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Crawl Depth
          </label>
          <input
            id="depth"
            type="number"
            value={depth}
            onChange={(e) => setDepth(Number(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            min="1"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          {isLoading ? (
            <Loader className="animate-spin mx-auto" size={20} />
          ) : (
            'Start Crawling'
          )}
        </button>
      </form>
    </div>
  );
};

export default Crawl;
