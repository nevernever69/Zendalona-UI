import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import React, { useState, useEffect, useRef } from 'react';
import remarkGfm from 'remark-gfm';
import { ArrowUp, Loader, AlertCircle, Bot, User, Moon, Sun, ExternalLink, Info, X, MicIcon } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
const API_URL = import.meta.env.VITE_API_URL

const ChatbotUI = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sessionId, setSessionId] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState('medium'); // small, medium, large, xlarge
  const [showAccessibilityMenu, setShowAccessibilityMenu] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // or if using Vite:
  // const API_URL = import.meta.env.VITE_API_URL;
  
  const renderMessageContent = (message) => (
    <ReactMarkdown
      children={message.content}
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-2" {...props} />,
        h2: ({node, ...props}) => <h2 className="text-xl font-semibold mb-2" {...props} />,
        h3: ({node, ...props}) => <h3 className="text-lg font-semibold mb-2" {...props} />,
        p: ({node, ...props}) => <p className="mb-2" {...props} />,
        strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
        li: ({node, ...props}) => <li className="list-disc ml-5" {...props} />,
        ul: ({node, ...props}) => <ul className="mb-2" {...props} />,
        a: ({node, ...props}) => <a className="text-blue-500 underline" target="_blank" rel="noopener noreferrer" {...props} />,
      }}
    />
  );
  // Generate a unique session ID when component mounts
  useEffect(() => {
    setSessionId(uuidv4());
    
    // Check system preference for dark mode
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => setDarkMode(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    
    // Check for saved accessibility preferences in localStorage
    const savedFontSize = localStorage.getItem('chatbot-font-size');
    const savedHighContrast = localStorage.getItem('chatbot-high-contrast') === 'true';
    const savedDarkMode = localStorage.getItem('chatbot-dark-mode') === 'true';
    
    if (savedFontSize) setFontSize(savedFontSize);
    if (savedHighContrast !== null) setHighContrast(savedHighContrast);
    if (savedDarkMode !== null) setDarkMode(savedDarkMode);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Save accessibility preferences when they change
  useEffect(() => {
    localStorage.setItem('chatbot-font-size', fontSize);
    localStorage.setItem('chatbot-high-contrast', highContrast.toString());
    localStorage.setItem('chatbot-dark-mode', darkMode.toString());
  }, [fontSize, highContrast, darkMode]);

  // Scroll to bottom when messages update
 useEffect(() => {
  scrollToBottom();
    // Get the last message
    const last = messages[messages.length - 1];
    if (last && !last.isUser && last.content) {
      const srDiv = document.getElementById('screenreader-latest');
      if (srDiv) {
        srDiv.textContent = ''; 
        setTimeout(() => {
          srDiv.textContent = last.content.slice(0, 300); 
        }, 100); 
      }
    }
  }, [messages]);



  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  // Format sources to ensure they appear as links
  const formatSources = (sources) => {
    if (!sources || !Array.isArray(sources) || sources.length === 0) return [];
    
    return sources.map(source => {
      // If source is already a URL, return it as is
      if (source.startsWith('http')) return source;
      // Otherwise, try to make it a valid URL
      return source.trim();
    }).filter(Boolean);
  };

  const addMessage = (content, isUser = false, sources = []) => {
    const newMessage = {
      id: Date.now().toString(),
      content,
      isUser,
      sources: formatSources(sources),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    // Announce theme change to screen readers
    document.getElementById('announcement').textContent = `${darkMode ? 'Light' : 'Dark'} mode activated`;
    setTimeout(() => {
      document.getElementById('announcement').textContent = '';
    }, 1000);
  };

  const toggleHighContrast = () => {
    setHighContrast(!highContrast);
    // Announce contrast change to screen readers
    document.getElementById('announcement').textContent = `High contrast mode ${highContrast ? 'deactivated' : 'activated'}`;
    setTimeout(() => {
      document.getElementById('announcement').textContent = '';
    }, 1000);
  };

  const changeFontSize = (size) => {
    setFontSize(size);
    // Announce font size change to screen readers
    document.getElementById('announcement').textContent = `Font size set to ${size}`;
    setTimeout(() => {
      document.getElementById('announcement').textContent = '';
    }, 1000);
  };
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === '+') {
        e.preventDefault();
        changeFontSize('large');
      } else if (e.ctrlKey && e.key === '-') {
        e.preventDefault();
        changeFontSize('small');
      } else if (e.ctrlKey && e.key === '0') {
        e.preventDefault();
        changeFontSize('medium');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);


  const toggleAccessibilityMenu = () => {
    setShowAccessibilityMenu(!showAccessibilityMenu);
  };

  const clearChat = () => {
    if (window.confirm('Are you sure you want to clear the chat history?')) {
      setMessages([]);
      document.getElementById('announcement').textContent = 'Chat history cleared';
      setTimeout(() => {
        document.getElementById('announcement').textContent = '';
      }, 1000);

      inputRef.current.focus(); // 🔥 important focus line
    }
  };


  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!input.trim()) {
      // Announce to screen readers that the input is empty
      const announcement = document.getElementById('announcement');
      announcement.textContent = 'Please enter a message before sending.';
      setTimeout(() => {
        announcement.textContent = '';
      }, 2000);
      return;
    }

    const userMessage = input;
    addMessage(userMessage, true);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(import.meta.env.VITE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream'
        },
        body: JSON.stringify({
          query: userMessage,
          session_id: sessionId
        })
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      // Handle streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let botMessage = '';
      let sources = [];

      addMessage('', false); // Add empty message to start
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        let eventType = null;
        for (const line of lines) {
          if (!line.trim()) continue;
          
          if (line.startsWith('event:')) {
            eventType = line.replace('event:', '').trim();
          } else if (line.startsWith('data:')) {
            const data = line.replace('data:', '').trim();
            
            if (eventType === 'message') {
              // Ensure proper spacing with spaces between words
              if (botMessage && !botMessage.endsWith(' ') && !data.startsWith(' ')) {
                botMessage += ' ';
              }
              botMessage += data;
              
              // Update the last message
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1].content = botMessage;
                return updated;
              });
            } else if (eventType === 'sources') {
              sources = data.split(',').filter(Boolean);
              // Format sources to ensure they're usable
              sources = formatSources(sources);
              
              // Screen reader announcement for sources
              if (sources.length > 0) {
                document.getElementById('announcement').textContent = `${sources.length} sources available`;
              }
            } else if (eventType === 'done') {
              // Completion announcement
              document.getElementById('announcement').textContent = 'Response completed';
              setTimeout(() => {
                document.getElementById('announcement').textContent = '';
              }, 1500);
              break;
            }
          }
        }
      }

      // If there are sources, append them to the message
      if (sources.length > 0) {
        setMessages(prev => {
          const updated = [...prev];
          const lastMsg = updated[updated.length - 1];
          lastMsg.sources = sources;
          return updated;
        });
      }
      
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
      document.getElementById('announcement').textContent = 'Error sending message. Please try again.';
    } finally {
      setIsLoading(false);
      // Focus back to input for better keyboard navigation
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e) => {
    // Provide keyboard shortcut to submit
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  };

  // Determine font size class based on selected size
  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'small': return 'text-sm';
      case 'large': return 'text-lg';
      case 'xlarge': return 'text-xl';
      default: return 'text-base'; // medium
    }
  };

  // Get theme classes based on selected theme and contrast settings
  const getThemeClasses = () => {
    if (highContrast) {
      return darkMode 
        ? 'bg-black text-white' 
        : 'bg-white text-black';
    }
    
    return darkMode 
      ? 'bg-gray-900 text-gray-100' 
      : 'bg-gray-50 text-gray-800';
  };

  const getHeaderClasses = () => {
    if (highContrast) {
      return darkMode 
        ? 'bg-blue-900 text-white border-yellow-400 border-b-2' 
        : 'bg-blue-700 text-white border-yellow-400 border-b-2';
    }
    
    return darkMode 
      ? 'bg-gray-800 text-white' 
      : 'bg-blue-600 text-white';
  };

  const getMessageClasses = (isUser) => {
    if (highContrast) {
      return isUser
        ? darkMode ? 'bg-blue-900 text-white border-2 border-white' : 'bg-blue-700 text-white border-2 border-black'
        : darkMode ? 'bg-black text-white border-2 border-white' : 'bg-white text-black border-2 border-black';
    }
    
    return isUser
      ? darkMode ? 'bg-blue-800 text-blue-50' : 'bg-blue-600 text-white'
      : darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800 border border-gray-200';
  };

  return (
    <div className={`flex flex-col h-screen w-full ${getThemeClasses()} transition-colors duration-300 ${getFontSizeClass()}`}>
      {/* Visually hidden announcement for screen readers */}
      <div id="announcement" className="sr-only" aria-live="assertive"></div>
      <div
        id="screenreader-latest"
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      ></div>

      
      {/* Header */}
      <header className={`px-4 sm:px-6 py-4 ${getHeaderClasses()} shadow-md z-10`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Bot size={28} className="text-white" aria-hidden="true" />
            <div>
              <h1 tabIndex="0" className="text-xl font-semibold">Zendalona Assistant</h1>
              <p tabIndex="0" className="text-sm opacity-90">Ask me anything about our accessibility solutions</p>
            </div>
          </div>

              {/* Admin Panel Button */}
              <Link to="/admin">
                <button
                  className="mt-2 bg-white text-blue-600 px-3 py-1 rounded text-sm font-medium hover:bg-blue-100"
                  aria-label="Go to admin panel"
                >
                  Admin Panel
                </button>
              </Link>

          <div className="flex items-center gap-2">
            {/* Accessibility Menu Button */}
            <button 
              onClick={toggleAccessibilityMenu} 
              className={`p-2 rounded-full transition-colors ${
                highContrast
                  ? darkMode ? 'bg-yellow-600 text-white hover:bg-yellow-500' : 'bg-blue-800 text-white hover:bg-blue-700'
                  : darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-blue-500 hover:bg-blue-400'
              }`}
              aria-label="Accessibility options"
              aria-expanded={showAccessibilityMenu}
              aria-controls="accessibility-menu"
              >
                          
              <Info size={20} />
            </button>
            
            {/* Theme Toggle Button */}
            <button 
              onClick={toggleTheme} 
              className={`p-2 rounded-full transition-colors ${
                highContrast
                  ? darkMode ? 'bg-yellow-600 text-white hover:bg-yellow-500' : 'bg-blue-800 text-white hover:bg-blue-700'
                  : darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-blue-500 hover:bg-blue-400'
              }`}
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>
      
      {/* Accessibility Menu */}
      {showAccessibilityMenu && (
        <div 
          id="accessibility-menu"
          className={`border-b ${
            highContrast
              ? darkMode ? 'bg-gray-800 text-white border-yellow-400' : 'bg-white text-black border-blue-700'
              : darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          } transition-all duration-300`}
          role="region"
          aria-label="Accessibility controls"
        >
          <div className="max-w-7xl mx-auto py-4 px-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">Accessibility Options</h2>
              <button 
                onClick={toggleAccessibilityMenu}
                aria-label="Close accessibility menu"
                className={`p-1 rounded-full ${
                  highContrast
                    ? darkMode ? 'bg-yellow-600 text-white hover:bg-yellow-500' : 'bg-blue-700 text-white hover:bg-blue-600'
                    : darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Font Size Controls */}
              <div className="space-y-2">
                <label id="font-size-label" className="block font-medium">Font Size</label>
                <div className="flex flex-wrap gap-2" role="radiogroup" aria-labelledby="font-size-label">
                  {['small', 'medium', 'large', 'xlarge'].map((size) => (
                    <button
                      key={size}
                      onClick={() => changeFontSize(size)}
                      aria-pressed={fontSize === size}
                      className={`px-3 py-1 rounded-md transition-colors ${
                        fontSize === size
                          ? highContrast
                            ? darkMode ? 'bg-yellow-600 text-white' : 'bg-blue-700 text-white'
                            : darkMode ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white'
                          : highContrast
                            ? darkMode ? 'bg-gray-700 text-white border border-white' : 'bg-white text-black border border-black'
                            : darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {size.charAt(0).toUpperCase() + size.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Contrast Options */}
              <div className="space-y-2">
                <label id="contrast-label" className="block font-medium">Display Options</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={toggleHighContrast}
                    aria-pressed={highContrast}
                    className={`px-3 py-1 rounded-md transition-colors ${
                      highContrast
                        ? darkMode ? 'bg-yellow-600 text-white' : 'bg-blue-700 text-white'
                        : darkMode ? 'bg-gray-700 text-gray-200 border border-gray-600' : 'bg-gray-200 text-gray-700 border border-gray-300'
                    }`}
                  >
                    High Contrast {highContrast ? 'On' : 'Off'}
                  </button>
                  
                  <button
                    onClick={clearChat}
                    className={`px-3 py-1 rounded-md transition-colors ${
                      highContrast
                        ? darkMode ? 'bg-red-900 text-white' : 'bg-red-700 text-white'
                        : darkMode ? 'bg-red-800 text-white' : 'bg-red-600 text-white'
                    }`}
                    aria-label="Clear chat history"
                  >
                    Clear Chat
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mt-4 text-sm">
              <p>This chat interface follows WCAG 2.1 AA accessibility guidelines.</p>
              <p>Use keyboard navigation (Tab key) to move between elements.</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Main chat area - full width with max-width content */}
      <main
        id="chat-output"
        role="main"
        aria-label="Chat messages"
        tabIndex="0"
      >
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6">
          {messages.length === 0 ? (
            <div className={`flex flex-col items-center justify-center h-64 text-center p-6 rounded-xl ${
              highContrast
                ? darkMode ? 'bg-gray-800 text-white border-2 border-white' : 'bg-white text-black border-2 border-black'
                : darkMode ? 'bg-gray-800 text-gray-300' : 'bg-blue-50 text-gray-600'
            }`} tabIndex="0">
              <Bot size={48} className={`mb-4 ${
                highContrast
                  ? 'text-white'
                  : darkMode ? 'text-gray-500' : 'text-blue-400'
              }`} aria-hidden="true" />
              <p className="text-lg font-medium">How can I help you</p>
              <p className="mt-2">Send a message to start chatting!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message) => (
                <div 
                  key={message.id}
                  className="animate-fade-in"
                >
                  <div className="flex items-start gap-3 max-w-full">
                    {/* Avatar */}
                    <div className={`flex-shrink-0 mt-1 p-2 rounded-full ${
                      message.isUser
                        ? highContrast
                          ? darkMode ? 'bg-yellow-600 text-white' : 'bg-blue-800 text-white'
                          : darkMode ? 'bg-blue-700' : 'bg-blue-100'
                        : highContrast
                          ? darkMode ? 'bg-gray-700 text-white' : 'bg-gray-800 text-white'
                          : darkMode ? 'bg-gray-700' : 'bg-gray-100'
                    }`}>
                      {message.isUser 
                        ? <User size={16} className={highContrast ? 'text-white' : darkMode ? 'text-blue-300' : 'text-blue-700'} aria-hidden="true" />
                        : <Bot size={16} className={highContrast ? 'text-white' : darkMode ? 'text-gray-300' : 'text-gray-700'} aria-hidden="true" />
                      }
                    </div>
                    
                    {/* Message content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium" id={`sender-${message.id}`}>{message.isUser ? 'You' : 'Assistant'}</span>
                        <span className="opacity-70" aria-label={`Sent at ${message.timestamp}`}>{message.timestamp}</span>
                      </div>
                      
                      <div 
  className={`rounded-lg p-3 whitespace-pre-wrap leading-relaxed ${getMessageClasses(message.isUser)}`}
  aria-labelledby={`sender-${message.id}`}
>
  {message.content ? (
    renderMessageContent(message)
  ) : (
    !message.isUser && isLoading && (
      <span className="flex items-center gap-2 opacity-75">
        <Loader size={14} className="animate-spin" aria-hidden="true" />
        <span>Thinking...</span>
      </span>
    )
  )}
</div>

                      
                      {/* {message.sources && message.sources.length > 0 && (
                        <div className={`mt-3 pt-2 ${
                          highContrast 
                            ? darkMode ? 'border-t-2 border-white' : 'border-t-2 border-black' 
                            : darkMode ? 'border-t border-gray-700' : 'border-t border-gray-200'
                        }`} aria-label="Sources used for this response">
                          <p className="font-semibold mb-1">Sources:</p>
                          <ul className="space-y-1">
                            {message.sources.map((source, idx) => (
                              <li key={idx} className="flex items-center" tabIndex="0">
                                <ExternalLink size={12} className="mr-1 flex-shrink-0" aria-hidden="true" />
                                <a 
                                  href={source} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className={`hover:underline focus:underline overflow-hidden text-ellipsis ${
                                    highContrast
                                      ? darkMode ? 'text-yellow-400' : 'text-blue-800'
                                      : darkMode ? 'text-blue-400' : 'text-blue-600'
                                  }`}
                                >
                                  {source}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )} */}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Error message */}
          {error && (
            <div 
              className={`flex items-center gap-2 p-3 rounded-lg my-4 mx-auto max-w-3xl ${
                highContrast
                  ? darkMode ? 'bg-red-900 text-white border-2 border-white' : 'bg-red-700 text-white border-2 border-black'
                  : darkMode ? 'bg-red-900/50 text-red-200' : 'bg-red-50 text-red-700'
              }`} 
              role="alert" 
              tabIndex="0"
            >
              <AlertCircle size={16} aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}
          
          <div ref={messagesEndRef} aria-hidden="true" />
        </div>
        <div id="screenreader-latest" className="sr-only" aria-live="polite" aria-atomic="true"></div>
      </main>
      
      {/* Message input area - full width with max-width content */}
      <form 
        onSubmit={sendMessage} 
        className={`border-t p-4 sm:p-6 transition-colors duration-300 w-full ${
          highContrast
            ? darkMode ? 'border-white bg-gray-900' : 'border-black bg-white'
            : darkMode ? 'border-gray-800 bg-gray-800' : 'border-gray-200 bg-gray-50'
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <label htmlFor="message-input" className="sr-only">Type your message</label>
              <textarea
                id="message-input"
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                rows="2"
                disabled={isLoading}
                aria-label="Type your message"
                aria-describedby="input-help"
                className={`w-full resize-none rounded-2xl px-4 py-3 outline-none focus:ring-2 ${
                  highContrast
                    ? darkMode 
                      ? 'bg-black text-white border-2 border-white focus:ring-yellow-400' 
                      : 'bg-white text-black border-2 border-black focus:ring-blue-600'
                    : darkMode 
                      ? 'bg-gray-700 text-white placeholder-gray-400 focus:ring-blue-500/70 border-gray-600' 
                      : 'bg-white text-gray-900 placeholder-gray-500 focus:ring-blue-500/50 border border-gray-300'
                } transition-all duration-200`}
              />
              <div id="input-help" className="sr-only">Press Enter to send, Shift+Enter for a new line</div>
            </div>
            
            {/* Voice input button for additional accessibility
            <button
              type="button"
              aria-label="Voice input (feature coming soon)"
              disabled={true}
              className={`flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full ${
                highContrast
                  ? darkMode ? 'bg-gray-700 text-gray-400 border border-white' : 'bg-gray-200 text-gray-500 border border-black' 
                  : darkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-200 text-gray-500'
              }`}
            >
              <MicIcon size={18} aria-hidden="true" />
            </button> */}
            
            <button 
              type="submit" 
              className={`flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full 
                ${isLoading 
                  ? highContrast
                    ? darkMode ? 'bg-gray-700 text-gray-400 border border-white' : 'bg-gray-300 text-gray-500 border border-black'
                    : darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-300 text-gray-500' 
                  : highContrast
                    ? darkMode ? 'bg-yellow-600 text-white border border-white hover:bg-yellow-500' : 'bg-blue-700 text-white border border-black hover:bg-blue-600'
                    : darkMode ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-blue-600 text-white hover:bg-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  highContrast
                    ? darkMode ? 'focus:ring-yellow-400' : 'focus:ring-blue-600'
                    : darkMode ? 'focus:ring-blue-500' : 'focus:ring-blue-600'
                }
                transition-all duration-200 transform ${!isLoading && 'hover:scale-105'}`}
              disabled={isLoading}
              aria-label={isLoading ? "Sending message..." : "Send message"}
              aria-busy={isLoading}
            >
              {isLoading ? <Loader className="animate-spin" size={26} aria-hidden="true" /> : <ArrowUp size={32} aria-hidden="true" />}
            </button>
          </div>
          
          {/* Status indicator */}
          <div className="mt-2">
            <div 
              className={`flex items-center gap-1.5 ${
                highContrast
                  ? darkMode ? 'text-gray-300' : 'text-gray-700'
                  : darkMode ? 'text-gray-400' : 'text-gray-500'
              }`} 
              aria-live="polite"
            >
              {isLoading ? (
                <>
                  <Loader size={12} className="animate-spin" aria-hidden="true" />
                  <span>Assistant is responding...</span>
                </>
              ) : messages.length > 0 ? (
                <>
                  <Bot size={12} aria-hidden="true" />
                  <span>Ready for your next question</span>
                </>
              ) : null}
            </div>
          </div>
          
          {/* Keyboard shortcuts help */}
          <div className={`mt-2 text-xs ${
            highContrast
              ? darkMode ? 'text-gray-300' : 'text-gray-700'
              : darkMode ? 'text-gray-500' : 'text-gray-500'
          }`}>
            Press Enter to send • Shift+Enter for new line • Tab to navigate
          </div>
        </div>
      </form>
    </div>
  );
};

export default ChatbotUI;