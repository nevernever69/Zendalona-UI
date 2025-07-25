import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ChatbotUI from './ChatbotUI';
import AdminPanel from './components/AdminPanel';
import Layout from './pages/Layout';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<ChatbotUI />} />
          <Route path="admin" element={<AdminPanel />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;