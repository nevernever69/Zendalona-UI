import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ChatbotUI from './ChatbotUI';
import Layout from './pages/Layout';
import AdminLayout from './pages/AdminLayout';
import System from './components/System';
import Crawl from './components/Crawl';
import PDF from './components/PDF';
import Collections from './components/Collections';
import Cache from './components/Cache';
import TempCacheManager from './components/TempCacheManager';
import FeedbackManager from './components/FeedbackManager';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<ChatbotUI />} />
            <Route path="admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
              <Route path="system" element={<System />} />
              <Route path="crawl" element={<Crawl />} />
              <Route path="pdf" element={<PDF />} />
              <Route path="collections" element={<Collections />} />
              <Route path="cache" element={<Cache />} />
              <Route path="temp-cache" element={<TempCacheManager />} />
              <Route path="feedback" element={<FeedbackManager />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;