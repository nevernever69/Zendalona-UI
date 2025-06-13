import React, { useEffect, useState } from 'react';

function SystemStatus() {
  const [health, setHealth] = useState(null);
  const [info, setInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch /system/health
    fetch('https://chatapi.zendalona.com/system/health')
      .then(res => res.json())
      .then(data => setHealth(data))
      .catch(err => setError('Health check failed'));

    // Fetch /system/info
    fetch('https://chatapi.zendalona.com/system/info')
      .then(res => res.json())
      .then(data => setInfo(data))
      .catch(err => setError('System info fetch failed'));
  }, []);

  return (
    <div className="border p-4 rounded-lg shadow bg-white mb-6">
      <h2 className="text-xl font-semibold mb-3">🩺 System Status</h2>

      {error && <p className="text-red-500">{error}</p>}

      {health ? (
        <p className="text-green-600 mb-2"> System is {health.status}</p>
      ) : (
        <p>Loading system health...</p>
      )}

      {info ? (
        <div className="mt-4">
          <h3 className="font-medium"> System Info:</h3>
          <ul className="list-disc list-inside">
            {Object.entries(info).map(([key, value]) => (
              <li key={key}>
                <strong>{key}:</strong> {String(value)}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>Loading system info...</p>
      )}
    </div>
  );
}

export default SystemStatus;
