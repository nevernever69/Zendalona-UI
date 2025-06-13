import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ChatbotUI from './ChatbotUI';
import AdminPage from './pages/AdminPage'; // You’ll create this file

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ChatbotUI />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Router>
  );
}

export default App;
