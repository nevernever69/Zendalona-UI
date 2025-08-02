
import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Settings, Shield, FileText, Database, UploadCloud, Cpu, MessageSquare, Bell } from 'lucide-react';

const AdminLayout = () => {
  const location = useLocation();
  const [feedbackCount, setFeedbackCount] = useState(0);

  const fetchFeedbackCount = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/feedback/');
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      const data = await response.json();
      setFeedbackCount(data.length);
    } catch (err) {
      console.error(`Failed to fetch feedback count: ${err.message}`);
    }
  };

  useEffect(() => {
    fetchFeedbackCount();
    const interval = setInterval(fetchFeedbackCount, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { to: '/admin/system', icon: Cpu, label: 'System' },
    { to: '/admin/crawl', icon: Home, label: 'Crawl' },
    { to: '/admin/pdf', icon: FileText, label: 'PDF' },
    { to: '/admin/collections', icon: Database, label: 'Collections' },
    { to: '/admin/cache', icon: Shield, label: 'Cache' },
    { to: '/admin/temp-cache', icon: Settings, label: 'Temp Cache' },
    { to: '/admin/feedback', icon: MessageSquare, label: 'Feedback', count: feedbackCount },
  ];

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <aside className="w-64 flex-shrink-0 bg-white dark:bg-gray-800 border-r dark:border-gray-700">
        <div className="h-full flex flex-col">
          <div className="px-6 py-4 border-b dark:border-gray-700">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Admin Panel</h2>
          </div>
          <nav className="flex-grow p-4">
            <ul>
              {navItems.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className={`flex items-center justify-between px-4 py-2 mt-2 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 ${
                      location.pathname === item.to ? 'bg-gray-200 dark:bg-gray-700' : ''
                    }`}
                  >
                    <div className="flex items-center">
                      <item.icon className="w-6 h-6" />
                      <span className="ml-4">{item.label}</span>
                    </div>
                    {item.count > 0 && (
                      <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                        {item.count}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>
      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
