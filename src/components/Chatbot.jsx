import React, { useState, useEffect, useRef } from 'react';
import Message from './Message';

function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    const userMessage = { text: input, sender: 'user', sources: [] };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsStreaming(true);

    try {
      const response = await fetch('https://ai-agent-zendalona.onrender.com/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify({
          query: input,
          session_id: crypto.randomUUID(),
        }),
      });

      if (response.status !== 200) {
        throw new Error(`API error: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let botMessage = { text: '', sender: 'bot', sources: [] };
      setMessages((prev) => [...prev, botMessage]);

      let eventType = null;
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          setIsStreaming(false);
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              text: updated[updated.length - 1].text || 'Stream completed.',
            };
            return updated;
          });
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith('event:')) {
            eventType = line.replace('event:', '').trim();
          } else if (line.startsWith('data:')) {
            const data = line.replace('data:', '').trim();
            if (eventType === 'message') {
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  ...updated[updated.length - 1],
                  text: updated[updated.length - 1].text + data,
                };
                return updated;
              });
            } else if (eventType === 'sources') {
              const sources = data.split(',').filter((s) => s.trim());
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  ...updated[updated.length - 1],
                  sources,
                };
                return updated;
              });
            } else if (eventType === 'done') {
              setIsStreaming(false);
              break;
            }
          }
        }
      }
    } catch (error) {
      setIsStreaming(false);
      setMessages((prev) => [
        ...prev,
        { text: `Error: ${error.message}`, sender: 'bot', sources: [] },
      ]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-4">
    <div id="announcement" className="sr-only" aria-live="assertive"></div>
      <div
        ref={chatContainerRef}
        className="h-[60vh] overflow-y-auto mb-4 p-4 bg-gray-50 rounded-md"
        role="log"
        aria-live="polite"
        tabIndex={0}
      >
      <div role="list">
        {messages.map((message, index) => (
          <Message
            key={index}
            text={message.text}
            sender={message.sender}
            sources={message.sources}
          />
        ))}
        </div>
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-grow p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none"
          placeholder="Type your message..."
          aria-label="Chat input"
          disabled={isStreaming}
          rows={2}
        />
        <button
          type="submit"
          className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-600 ${
            isStreaming ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          aria-label="Send message"
          disabled={isStreaming}
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default Chatbot;