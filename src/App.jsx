import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ChatbotUI from './ChatbotUI';
import AdminPage from './pages/AdminPage';
import AdminLogin from './pages/AdminLogin';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ChatbotUI />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Router>
  );
}

export default App;

