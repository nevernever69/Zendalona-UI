import React, { useState, useRef } from 'react';
import { Loader, AlertCircle } from 'lucide-react';

const PDF = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [responseMessage, setResponseMessage] = useState('');
  const pdfFormRef = useRef(null);

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
      const response = await fetch('https://chatapi.zendalona.com/indexing/upload-pdf', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      const data = await response.json();
      setResponseMessage(data.message);
      setIsLoading(false);
      pdfFormRef.current.reset();
      setPdfFile(null);
    } catch (err) {
      setError(`Failed to upload PDF: ${err.message}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">Upload PDF</h2>
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
      <form ref={pdfFormRef} onSubmit={handlePdfUpload} className="space-y-4">
        <div>
          <label htmlFor="pdf-file" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            PDF File
          </label>
          <input
            id="pdf-file"
            type="file"
            accept=".pdf"
            onChange={(e) => setPdfFile(e.target.files[0])}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:text-gray-400 dark:file:bg-blue-500 dark:file:text-white dark:hover:file:bg-blue-600"
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
            'Upload PDF'
          )}
        </button>
      </form>
    </div>
  );
};

export default PDF;
