import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { ArrowUp, Loader, AlertCircle, Bot, User, Moon, Sun, ExternalLink, Info, X, ThumbsUp, ThumbsDown } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import SuggestedQuestions from './components/SuggestedQuestions';
import './components/SuggestedQuestions.css';
import { useAuth } from './contexts/AuthContext';
import LoginButton from './components/LoginButton';

const ChatbotUI = () => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sessionId, setSessionId] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState('medium');
  const [showAccessibilityMenu, setShowAccessibilityMenu] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackMessageId, setFeedbackMessageId] = useState(null);
  const [feedbackComments, setFeedbackComments] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const feedbackInputRef = useRef(null);

  // Initialize session ID and preferences
  useEffect(() => {
    setSessionId(uuidv4());
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => setDarkMode(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    const savedFontSize = localStorage.getItem('chatbot-font-size');
    const savedHighContrast = localStorage.getItem('chatbot-high-contrast') === 'true';
    const savedDarkMode = localStorage.getItem('chatbot-dark-mode') === 'true';
    if (savedFontSize) setFontSize(savedFontSize);
    if (savedHighContrast !== null) setHighContrast(savedHighContrast);
    if (savedDarkMode !== null) setDarkMode(savedDarkMode);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Save accessibility preferences
  useEffect(() => {
    localStorage.setItem('chatbot-font-size', fontSize);
    localStorage.setItem('chatbot-high-contrast', highContrast.toString());
    localStorage.setItem('chatbot-dark-mode', darkMode.toString());
  }, [fontSize, highContrast, darkMode]);

  // Scroll to bottom when messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus feedback input when modal opens
  useEffect(() => {
    if (showFeedbackModal && feedbackInputRef.current) {
      feedbackInputRef.current.focus();
    }
  }, [showFeedbackModal]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const formatSources = (sources) => {
    if (!sources || !Array.isArray(sources) || sources.length === 0) return [];
    return sources.map(source => source.trim()).filter(Boolean);
  };

  const addMessage = (content, isUser = false, sources = [], suggestions = []) => {
    const newMessage = {
      id: Date.now().toString(),
      content,
      isUser,
      sources: formatSources(sources),
      suggestions,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      feedback: null, // Track feedback status
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.getElementById('announcement').textContent = `${darkMode ? 'Light' : 'Dark'} mode activated`;
    setTimeout(() => {
      document.getElementById('announcement').textContent = '';
    }, 1000);
  };

  const toggleHighContrast = () => {
    setHighContrast(!highContrast);
    document.getElementById('announcement').textContent = `High contrast mode ${highContrast ? 'deactivated' : 'activated'}`;
    setTimeout(() => {
      document.getElementById('announcement').textContent = '';
    }, 1000);
  };

  const changeFontSize = (size) => {
    setFontSize(size);
    document.getElementById('announcement').textContent = `Font size set to ${size}`;
    setTimeout(() => {
      document.getElementById('announcement').textContent = '';
    }, 1000);
  };

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
    }
  };

  const handleQuestionSelect = (question) => {
    setInput(question);
    inputRef.current.focus();
  };

  const submitFeedback = async (messageId, feedbackType, comments = null) => {
    const message = messages.find(msg => msg.id === messageId);
    if (!message || message.isUser) return;

    // Check if user is logged in
    if (!currentUser) {
      alert('Please login to submit feedback');
      return;
    }

    try {
      const feedbackData = {
        session_id: sessionId,
        query: messages[messages.indexOf(message) - 1]?.content || '',
        response: message.content,
        feedback: feedbackType,
        additional_comments: comments,
        user_id: currentUser.uid,
        user_email: currentUser.email,
        user_name: currentUser.displayName
      };

      const response = await fetch('http://127.0.0.1:8000/chat/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      // Update message with feedback status
      setMessages(prev => prev.map(msg =>
        msg.id === messageId ? { ...msg, feedback: feedbackType } : msg
      ));

      document.getElementById('announcement').textContent = `Feedback submitted: ${feedbackType}`;
      setTimeout(() => {
        document.getElementById('announcement').textContent = '';
      }, 1500);
    } catch (err) {
      console.error('Error submitting feedback:', err);
      document.getElementById('announcement').textContent = 'Error submitting feedback. Please try again.';
      setTimeout(() => {
        document.getElementById('announcement').textContent = '';
      }, 2000);
    }
  };

  const handleFeedbackClick = (messageId, feedbackType) => {
    if (feedbackType === 'negative') {
      setFeedbackMessageId(messageId);
      setShowFeedbackModal(true);
    } else {
      submitFeedback(messageId, feedbackType);
    }
  };

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    submitFeedback(feedbackMessageId, 'negative', feedbackComments);
    setShowFeedbackModal(false);
    setFeedbackComments('');
  };

  // Universal markdown formatter to fix common formatting issues
  const cleanMarkdownFormatting = (content) => {
    let cleanedContent = content
      // Fix malformed bold syntax - remove extra asterisks
      .replace(/\*{3,}/g, '**')
      // Fix list items with malformed bold formatting
      .replace(/\*\s*\*{2,}([^*:]+):\*{2,}/g, '* **$1:**')
      // Fix cases where bold markers are separated incorrectly
      .replace(/\*\s*\*([^*:]+):\*/g, '* **$1:**')
      // Clean up spacing around colons in list items
      // Clean up spacing around colons in list items
      .replace(/(\*\s*\*\*[^:]+):\*\*\s*/g, '$1 ')
      // Remove trailing asterisks at end of lines
      .replace(/\s+\*+\s*$/gm, '')
      // Fix cases where asterisks appear mid-sentence incorrectly
      .replace(/([a-zA-Z])\*+([a-zA-Z])/g, '$1$2')
      // Ensure proper spacing after list item bold text
      .replace(/(\*\s*\*\*[^:]+:\*\*)\s*/g, '$1 ')
      // Clean up multiple consecutive spaces
      .replace(/\s{2,}/g, ' ')
      // Clean up multiple newlines (keep max 2 for paragraph breaks)
      .replace(/\n{3,}/g, '\n\n')
      // Fix orphaned asterisks at start of lines
      .replace(/^\*+\s*$/gm, '')
      // Remove empty list items
      .replace(/^\*\s*$/gm, '')
      // Ensure list items start properly
      .replace(/^\s*\*\s*\*\*/gm, '* **')
      // Fix bold text that spans across line breaks incorrectly
      .replace(/\*\*([^*\n]+)\n([^*\n]+)\*\*/g, '**$1 $2**')
      // Clean up any remaining malformed bold syntax
      .replace(/\*\*\s*\*\*/g, '')
      .trim();

    return cleanedContent;
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) {
      document.getElementById('announcement').textContent = 'Please enter a message before sending.';
      setTimeout(() => {
        document.getElementById('announcement').textContent = '';
      }, 2000);
      return;
    }
  
    const userMessage = input;
    addMessage(userMessage, true);
    setInput('');
    setIsLoading(true);
    setError(null);
  
    try {
      const response = await fetch('http://127.0.0.1:8000/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify({
          query: userMessage,
          session_id: sessionId,
        }),
      });
  
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
  
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let botMessage = '';
      let sources = [];
      let suggestions = [];
  
      addMessage('', false);
  
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
  
        const chunk = decoder.decode(value);
        console.log('Raw SSE chunk:', chunk); // Log raw chunk for debugging
        const lines = chunk.split('\n');
  
        let eventType = null;
        for (const line of lines) {
          if (!line.trim()) continue;
  
          if (line.startsWith('event:')) {
            eventType = line.replace('event:', '').trim();
          } else if (line.startsWith('data:')) {
            const data = line.replace('data:', '').trim();
            if (!data) continue;
  
            if (eventType === 'message') {
              if (botMessage && !botMessage.endsWith(' ') && !data.startsWith(' ')) {
                botMessage += ' ';
              }
              botMessage += data;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1].content = botMessage;
                return updated;
              });
            } else if (eventType === 'sources') {
              sources = data.split(',').filter(Boolean);
              sources = formatSources(sources);
              if (sources.length > 0) {
                document.getElementById('announcement').textContent = `${sources.length} sources available`;
              }
            } else if (eventType === 'suggestions') {
              suggestions = data.split('|').filter(Boolean); // Use a different delimiter
              if (suggestions.length > 0) {
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1].suggestions = suggestions;
                  return updated;
                });
              }
            } else if (eventType === 'metadata') {
              console.log('Metadata data:', data); // Log metadata for debugging
              try {
                const metadata = JSON.parse(data);
                if (metadata.feedback_enabled) {
                  setMessages(prev => {
                    const updated = [...prev];
                    updated[updated.length - 1].feedback_enabled = true;
                    return updated;
                  });
                }
              } catch (parseError) {
                console.error('Error parsing metadata:', parseError, 'Raw data:', data);
                document.getElementById('announcement').textContent = 'Error processing response metadata.';
                setTimeout(() => {
                  document.getElementById('announcement').textContent = '';
                }, 2000);
              }
            } else if (eventType === 'error') {
              setError(data);
              document.getElementById('announcement').textContent = `Error: ${data}`;
              setTimeout(() => {
                document.getElementById('announcement').textContent = '';
              }, 2000);
              break;
            } else if (eventType === 'done') {
              document.getElementById('announcement').textContent = 'Response completed';
              setTimeout(() => {
                document.getElementById('announcement').textContent = '';
              }, 1500);
              break;
            }
          }
        }
      }
  
      if (sources.length > 0) {
        // setMessages(prev => {
        //   const updated = [...prev];
        //   updated[updated.length - 1].sources = sources;
        //   return updated;
        // });
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
      document.getElementById('announcement').textContent = 'Error sending message. Please try again.';
    } finally {
      setIsLoading(false);
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  };

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'small': return 'text-sm';
      case 'large': return 'text-lg';
      case 'xlarge': return 'text-xl';
      default: return 'text-base';
    }
  };

  const getThemeClasses = () => {
    if (highContrast) {
      return darkMode ? 'bg-black text-white' : 'bg-white text-black';
    }
    return darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800';
  };

  const getHeaderClasses = () => {
    if (highContrast) {
      return darkMode ? 'bg-blue-900 text-white border-yellow-400 border-b-2' : 'bg-blue-700 text-white border-yellow-400 border-b-2';
    }
    return darkMode ? 'bg-gray-800 text-white' : 'bg-blue-600 text-white';
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

  const renderMessageContent = (message) => (
    <ReactMarkdown
      children={cleanMarkdownFormatting(message.content)}
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={{
        h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mb-4 mt-4" {...props} />,
        h2: ({ node, ...props }) => <h2 className="text-xl font-semibold mb-3 mt-3" {...props} />,
        h3: ({ node, ...props }) => <h3 className="text-lg font-semibold mb-2 mt-2" {...props} />,
        h4: ({ node, ...props }) => <h4 className="text-base font-semibold mb-2 mt-2" {...props} />,
        h5: ({ node, ...props }) => <h5 className="text-sm font-semibold mb-1 mt-1" {...props} />,
        h6: ({ node, ...props }) => <h6 className="text-xs font-semibold mb-1 mt-1" {...props} />,
        p: ({ node, ...props }) => <p className="mb-4" {...props} />,
        strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
        em: ({ node, ...props }) => <em className="italic" {...props} />,
        ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-4 pl-4" {...props} />,
        ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-4 pl-4" {...props} />,
        li: ({ node, ...props }) => <li className="mb-1" {...props} />,
        blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-gray-500 pl-4 italic my-4" {...props} />,
        pre: ({ node, ...props }) => <pre className="bg-gray-800 text-white p-4 rounded-md my-4 overflow-x-auto" {...props} />,
        code: ({ node, inline, className, children, ...props }) => {
          const match = /language-(\w+)/.exec(className || '');
          return !inline ? (
              <code className={`language-${match ? match[1] : 'plaintext'}`} {...props}>
                {children}
              </code>
          ) : (
            <code className="bg-gray-700 text-white px-1 rounded-md" {...props}>
              {children}
            </code>
          );
        },
        a: ({ node, ...props }) => <a className="text-blue-500 underline" target="_blank" rel="noopener noreferrer" {...props} />,
      }}
    />
  );

  return (
    <div className={`flex flex-col h-screen w-full ${getThemeClasses()} transition-colors duration-300 ${getFontSizeClass()}`}>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-blue-600 focus:text-white">
      Skip to main content
    </a>
    <div id="announcement" className="sr-only" aria-live="assertive"></div>

      <header className={`px-4 sm:px-6 py-4 ${getHeaderClasses()} shadow-md z-10`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Bot size={28} className="text-white" aria-hidden="true" />
            <div>
              <h1 tabIndex="0" className="text-xl font-semibold">Zendalona Assistant</h1>
              <p tabIndex="0" className="text-sm opacity-90">Ask me anything about our accessibility solutions</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LoginButton />
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
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-colors ${
                highContrast
                  ? darkMode ? 'bg-yellow-600 text-white hover:bg-yellow-500' : 'bg-blue-800 text-white hover:bg-blue-700'
                  : darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-blue-500 hover:bg-blue-400'
              }`}
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>

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

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${
            highContrast ? 'border-2 border-white' : ''
          }`}
          role="dialog"
          aria-labelledby="feedback-modal-title"
          aria-modal="true"
        >
          <div
            className={`p-6 rounded-lg max-w-md w-full ${
              highContrast
                ? darkMode ? 'bg-gray-800 text-white border-2 border-white' : 'bg-white text-black border-2 border-black'
                : darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 id="feedback-modal-title" className="text-lg font-semibold">Provide Feedback</h2>
              <button
                onClick={() => {
                  setShowFeedbackModal(false);
                  setFeedbackComments('');
                }}
                aria-label="Close feedback modal"
                className={`p-1 rounded-full ${
                  highContrast
                    ? darkMode ? 'bg-yellow-600 text-white hover:bg-yellow-500' : 'bg-blue-700 text-white hover:bg-blue-600'
                    : darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleFeedbackSubmit}>
              <label htmlFor="feedback-comments" className="block mb-2 font-medium">
                Optional Comments
              </label>
              <textarea
                id="feedback-comments"
                ref={feedbackInputRef}
                value={feedbackComments}
                onChange={(e) => setFeedbackComments(e.target.value)}
                placeholder="Why was this response not helpful?"
                rows="4"
                className={`w-full resize-none rounded-md px-4 py-2 outline-none focus:ring-2 ${
                  highContrast
                    ? darkMode
                      ? 'bg-black text-white border-2 border-white focus:ring-yellow-400'
                      : 'bg-white text-black border-2 border-black focus:ring-blue-600'
                    : darkMode
                      ? 'bg-gray-700 text-white placeholder-gray-400 focus:ring-blue-500/70 border-gray-600'
                      : 'bg-white text-gray-900 placeholder-gray-500 focus:ring-blue-500/50 border border-gray-300'
                }`}
              />
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowFeedbackModal(false);
                    setFeedbackComments('');
                  }}
                  className={`px-4 py-2 rounded-md ${
                    highContrast
                      ? darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-black hover:bg-gray-300'
                      : darkMode ? 'bg-gray-600 text-white hover:bg-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded-md ${
                    highContrast
                      ? darkMode ? 'bg-yellow-600 text-white hover:bg-yellow-500' : 'bg-blue-700 text-white hover:bg-blue-600'
                      : darkMode ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-blue-600 text-white hover:bg-blue-500'
                  }`}
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      <main
        id="main-content"
        className={`flex-1 overflow-y-auto w-full transition-colors duration-300`}
        tabIndex="-1"
        aria-label="Chat messages"
        role="log"
      >
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6">
          {messages.length === 0 ? (
            <div>
              <div
                className={`flex flex-col items-center justify-center h-64 text-center p-6 rounded-xl ${
                  highContrast
                    ? darkMode ? 'bg-gray-800 text-white border-2 border-white' : 'bg-white text-black border-2 border-black'
                    : darkMode ? 'bg-gray-800 text-gray-300' : 'bg-blue-50 text-gray-600'
                }`}
                tabIndex="0"
              >
                <Bot size={48} className={highContrast ? 'text-white' : darkMode ? 'text-gray-500' : 'text-blue-400'} aria-hidden="true" />
                <p className="text-lg font-medium">How can I help you</p>
                <p className="mt-2">Send a message to start chatting!</p>
              </div>
              <SuggestedQuestions onQuestionSelect={handleQuestionSelect} />
            </div>
          ) : (
            <ul className="space-y-6">
              {messages.map((message) => (
                <li key={message.id} className="animate-fade-in" role="listitem">
                  <div className="flex items-start gap-3 max-w-full">
                    <div
                      className={`flex-shrink-0 mt-1 p-2 rounded-full ${
                        message.isUser
                          ? highContrast
                            ? darkMode ? 'bg-yellow-600 text-white' : 'bg-blue-800 text-white'
                            : darkMode ? 'bg-blue-700' : 'bg-blue-100'
                          : highContrast
                            ? darkMode ? 'bg-gray-700 text-white' : 'bg-gray-800 text-white'
                            : darkMode ? 'bg-gray-700' : 'bg-gray-100'
                      }`}
                    >
                      {message.isUser ? (
                        <User size={16} className={highContrast ? 'text-white' : darkMode ? 'text-blue-300' : 'text-blue-700'} aria-hidden="true" />
                      ) : (
                        <Bot size={16} className={highContrast ? 'text-white' : darkMode ? 'text-gray-300' : 'text-gray-700'} aria-hidden="true" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium" id={`sender-${message.id}`}>
                          {message.isUser ? 'You' : 'Assistant'}
                        </span>
                        <span className="opacity-70" aria-label={`Sent at ${message.timestamp}`}>
                          {message.timestamp}
                        </span>
                      </div>
                      <div
                        className={`rounded-lg p-3 leading-relaxed ${getMessageClasses(message.isUser)}`}
                        aria-labelledby={`sender-${message.id}`}
                      >
                        {message.content ? (
                          renderMessageContent(message)
                        ) : (
                          !message.isUser &&
                          isLoading && (
                            <span className="flex items-center gap-2 opacity-75">
                              <Loader size={14} className="animate-spin" aria-hidden="true" />
                              <span>Thinking...</span>
                            </span>
                          )
                        )}
                      </div>
                      {!message.isUser && message.feedback_enabled && message.content && currentUser && (
                        <div className="mt-2 flex gap-2">
                          <button
                            onClick={() => handleFeedbackClick(message.id, 'positive')}
                            disabled={message.feedback !== null}
                            className={`p-2 rounded-full transition-colors ${
                              message.feedback === 'positive'
                                ? highContrast
                                  ? darkMode ? 'bg-yellow-600 text-white' : 'bg-blue-700 text-white'
                                  : darkMode ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white'
                                : highContrast
                                  ? darkMode ? 'bg-gray-700 text-white border border-white' : 'bg-white text-black border border-black'
                                  : darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-700'
                            }`}
                            aria-label="Thumbs up"
                            aria-pressed={message.feedback === 'positive'}
                          >
                            <ThumbsUp size={16} />
                          </button>
                          <button
                            onClick={() => handleFeedbackClick(message.id, 'negative')}
                            disabled={message.feedback !== null}
                            className={`p-2 rounded-full transition-colors ${
                              message.feedback === 'negative'
                                ? highContrast
                                  ? darkMode ? 'bg-yellow-600 text-white' : 'bg-blue-700 text-white'
                                  : darkMode ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white'
                                : highContrast
                                  ? darkMode ? 'bg-gray-700 text-white border border-white' : 'bg-white text-black border border-black'
                                  : darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-700'
                            }`}
                            aria-label="Thumbs down"
                            aria-pressed={message.feedback === 'negative'}
                          >
                            <ThumbsDown size={16} />
                          </button>
                        </div>
                      )}
                      {message.sources && message.sources.length > 0 && (
                        <div
                          className={`mt-3 pt-2 ${
                            highContrast ? (darkMode ? 'border-t-2 border-white' : 'border-t-2 border-black') : darkMode ? 'border-t border-gray-700' : 'border-t border-gray-200'
                          }`}
                          aria-label="Sources used for this response"
                        >
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
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
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
      </main>

      <form
        onSubmit={sendMessage}
        className={`border-t p-4 sm:p-6 transition-colors duration-300 w-full ${
          highContrast ? (darkMode ? 'border-white bg-gray-900' : 'border-black bg-white') : darkMode ? 'border-gray-800 bg-gray-800' : 'border-gray-200 bg-gray-50'
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <label htmlFor="message-input" className="sr-only">
                Type your message
              </label>
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
              <div id="input-help" className="sr-only">
                Press Enter to send, Shift+Enter for a new line
              </div>
            </div>
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
              aria-label={isLoading ? 'Sending message...' : 'Send message'}
              aria-busy={isLoading}
            >
              {isLoading ? <Loader className="animate-spin" size={26} aria-hidden="true" /> : <ArrowUp size={32} aria-hidden="true" />}
            </button>
          </div>
          <div className="mt-2">
            <div
              className={`flex items-center gap-1.5 ${
                highContrast ? (darkMode ? 'text-gray-300' : 'text-gray-700') : darkMode ? 'text-gray-400' : 'text-gray-500'
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
          <div
            className={`mt-2 text-xs ${
              highContrast ? (darkMode ? 'text-gray-300' : 'text-gray-700') : darkMode ? 'text-gray-500' : 'text-gray-500'
            }`}
          >
            Press Enter to send • Shift+Enter for new line • Tab to navigate
          </div>
        </div>
      </form>
    </div>
  );
};

export default ChatbotUI;