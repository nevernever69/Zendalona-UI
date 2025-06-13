import React, { useEffect, useState } from 'react';

function SessionManager() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('https://chatapi.zendalona.com/chat/sessions');

      const contentType = res.headers.get('content-type');
      if (!res.ok || !contentType?.includes('application/json')) {
        throw new Error('Invalid response from server');
      }

      const data = await res.json();
      console.log('Fetched session data:', data); // Optional debug

      if (Array.isArray(data)) {
        setSessions(data);
      } else {
        throw new Error('Expected an array of session IDs');
      }
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
      setSessions([]); // Prevent crash
    } finally {
      setLoading(false);
    }
  };

  const deleteSession = async (sessionId) => {
    if (!window.confirm(`Are you sure you want to delete session ${sessionId}?`)) return;

    try {
      const res = await fetch(`https://chatapi.zendalona.com/chat/sessions/${sessionId}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('Delete failed');
      setMessage(`✅ Session ${sessionId} deleted successfully`);
      fetchSessions(); // Refresh list
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
    }
  };

  return (
    <div className="border p-4 rounded-lg shadow bg-white mb-6">
      <h2 className="text-xl font-semibold mb-4">🗂️ Session Manager</h2>

      {message && <p className="mb-4 text-sm text-gray-700">{message}</p>}

      {loading ? (
        <p>Loading sessions...</p>
      ) : sessions.length === 0 ? (
        <p>No active sessions found.</p>
      ) : (
        <ul className="space-y-2">
          {sessions.map((sessionId) => (
            <li
              key={sessionId}
              className="flex justify-between items-center border rounded px-3 py-2"
            >
              <span className="font-mono text-sm">{sessionId}</span>
              <button
                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
                onClick={() => deleteSession(sessionId)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SessionManager;
