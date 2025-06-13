import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SystemStatus from '../components/Admin/SystemStatus';
import IndexManager from '../components/Admin/IndexManager';
import SessionManager from '../components/Admin/SessionManager';

function AdminPage() {
  const [selectedTool, setSelectedTool] = useState(null);

  const renderSelectedTool = () => {
    switch (selectedTool) {
      case 'status':
        return <SystemStatus />;
      case 'index':
        return <IndexManager />;
      case 'sessions':
        return <SessionManager />;
      default:
        return (
          <div className="text-gray-600 text-center py-20 text-lg">
             Please select a tool from above to begin.
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 🔷 Top Navbar */}
      <nav className="bg-blue-700 text-white px-6 py-4 flex justify-between items-center shadow">
        <h1 className="text-xl font-bold">Zendalona Admin Panel</h1>
        <Link to="/">
          <button className="bg-white text-blue-700 px-4 py-1 rounded hover:bg-blue-100 transition">
            ⬅ Back to Chatbot
          </button>
        </Link>
      </nav>

      {/* Tool Buttons */}
      <div className="max-w-5xl mx-auto px-6 mt-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <button
            onClick={() => setSelectedTool('status')}
            className={`rounded-lg px-4 py-3 font-medium shadow transition ${
              selectedTool === 'status'
                ? 'bg-blue-700 text-white'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
          >
            🩺 System Health & Info
          </button>
          <button
            onClick={() => setSelectedTool('index')}
            className={`rounded-lg px-4 py-3 font-medium shadow transition ${
              selectedTool === 'index'
                ? 'bg-green-700 text-white'
                : 'bg-green-100 text-green-800 hover:bg-green-200'
            }`}
          >
            📡 Indexing Tools
          </button>
          <button
            onClick={() => setSelectedTool('sessions')}
            className={`rounded-lg px-4 py-3 font-medium shadow transition ${
              selectedTool === 'sessions'
                ? 'bg-purple-700 text-white'
                : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
            }`}
          >
            🗂 Manage Sessions
          </button>
        </div>

        {/* Tool Card */}
        <div className="bg-white rounded-xl shadow p-6">{renderSelectedTool()}</div>
      </div>
    </div>
  );
}

export default AdminPage;
