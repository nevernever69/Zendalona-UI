import React, { useState } from 'react';
import ChatbotUI from './ChatbotUI';
import AdminPanel from './components/AdminPanel';

function App() {
  const [isAdmin, setIsAdmin] = useState(false);

  return (
    <div className="w-full h-screen">
      <div className="p-4">
        <button
          onClick={() => setIsAdmin(!isAdmin)}
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {isAdmin ? 'Switch to Chatbot' : 'Switch to Admin Panel'}
        </button>
        {isAdmin ? <AdminPanel /> : <ChatbotUI />}
      </div>
    </div>
  );
}

export default App;