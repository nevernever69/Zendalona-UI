import React, { useState } from 'react';

function IndexManager() {
  const [url, setUrl] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [message, setMessage] = useState('');

  const handleCrawl = async () => {
    if (!url) return setMessage('⚠️ Please enter a URL');
    setMessage('Crawling website...');

    try {
      const response = await fetch('https://chatapi.zendalona.com/indexing/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      if (!response.ok) throw new Error('Failed to crawl');
      const data = await response.json();
      setMessage(`✅ Website indexed successfully.`);
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    }
  };

  const handlePdfUpload = async () => {
    if (!pdfFile) return setMessage('⚠️ Please select a PDF file');
    setMessage('Uploading PDF...');

    const formData = new FormData();
    formData.append('file', pdfFile);

    try {
      const response = await fetch('https://chatapi.zendalona.com/indexing/upload-pdf', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('PDF upload failed');
      const data = await response.json();
      setMessage(`✅ PDF uploaded and indexed successfully.`);
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    }
  };

  return (
    <div className="border p-4 rounded-lg shadow bg-white mb-6">
      <h2 className="text-xl font-semibold mb-4">📡 Index Manager</h2>

      {/* Crawl website */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">🌐 Website URL to crawl:</label>
        <input
          type="text"
          className="w-full p-2 border rounded"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button
          className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={handleCrawl}
        >
          Crawl Website
        </button>
      </div>

      {/* Upload PDF */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">📄 Upload a PDF file:</label>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setPdfFile(e.target.files[0])}
        />
        <button
          className="mt-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          onClick={handlePdfUpload}
        >
          Upload PDF
        </button>
      </div>

      {/* Message/Feedback */}
      {message && <p className="mt-2 text-sm text-gray-700">{message}</p>}
    </div>
  );
}

export default IndexManager;
