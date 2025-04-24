import React from 'react';

function Message({ text, sender, sources }) {
  const isUser = sender === 'user';
  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      role="listitem"
    >
      <div
        className={`max-w-xs md:max-w-md p-3 rounded-lg ${
          isUser ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
        }`}
        aria-label={isUser ? 'User message' : 'Bot message'}
      >
        <p>{text}</p>
        {sources && sources.length > 0 && (
          <div className="mt-2">
            <p className="text-sm font-semibold">Sources:</p>
            <ul className="list-disc list-inside text-sm">
              {sources.map((source, index) => (
                <li key={index}>{source}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default Message;