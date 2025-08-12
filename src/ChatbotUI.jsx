import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { ArrowUp, Loader, AlertCircle, Bot, User, ExternalLink, X, ThumbsUp, ThumbsDown } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import SuggestedQuestions from './components/SuggestedQuestions';
import { useAuth } from './contexts/AuthContext';

const ChatbotUI = () => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sessionId, setSessionId] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const feedbackInputRef = useRef(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackMessageId, setFeedbackMessageId] = useState(null);
  const [feedbackComments, setFeedbackComments] = useState('');

  // Initialize session ID
  useEffect(() => {
    setSessionId(uuidv4());
  }, []);

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

      const response = await fetch('https://ai-agent-zendalona-1.onrender.com/chat/feedback', {
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
    // Convert plain text list format to proper markdown
    let cleanedContent = content
      // Fix the specific "Z endalona" issue
      .replace(/Z\s*endalona/gi, 'Zendalona')
      .replace(/Z\s*Endalona/g, 'Zendalona')
      // Fix missing spaces after asterisks
      .replace(/\*(\w)/g, '* $1')
      // Convert plain text format to markdown format
      .replace(/^\s*\*\s*([A-Z\s\-0-9]+):\s*/gm, '* **$1**: ')
      // Fix spacing issues
      .replace(/\n{3,}/g, '\n\n')
      // Clean up any trailing spaces at end of lines
      .replace(/\s+$/gm, '')
      // Fix common spacing issues in list items
      .replace(/^\*(\w)/gm, '* $1')
      // Ensure proper spacing in product names
      .replace(/(\w)-\s+(\w)/g, '$1-$2')
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
      const response = await fetch('https://ai-agent-zendalona-1.onrender.com/chat/stream', {
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

  const renderMessageContent = (message) => {
    // Additional preprocessing to fix specific formatting issues
    let content = message.content;
    
    // Fix the "Z endalona" issue before rendering
    content = content.replace(/Z\s*endalona/gi, 'Zendalona');
    
    // Fix missing spaces in list items
    content = content.replace(/\*(\w)/g, '* $1');
    
    // Ensure proper line breaks between list items
    content = content.replace(/\*\s([A-Z])/g, '\n* $1');
    
    // Fix spacing in hyphenated product names
    content = content.replace(/(\w)-\s+(\w)/g, '$1-$2');
    
    return (
      <ReactMarkdown
        children={cleanMarkdownFormatting(content)}
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mb-4 mt-4" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-xl font-semibold mb-3 mt-3" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-lg font-semibold mb-2 mt-2" {...props} />,
          h4: ({ node, ...props }) => <h4 className="text-base font-semibold mb-2 mt-2" {...props} />,
          h5: ({ node, ...props }) => <h5 className="text-sm font-semibold mb-1 mt-1" {...props} />,
          h6: ({ node, ...props }) => <h6 className="text-xs font-semibold mb-1 mt-1" {...props} />,
          p: ({ node, ...props }) => <p className="mb-4 leading-relaxed" {...props} />,
          strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
          em: ({ node, ...props }) => <em className="italic" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-4 pl-4 space-y-2" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-4 pl-4 space-y-2" {...props} />,
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
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          role="dialog"
          aria-labelledby="feedback-modal-title"
          aria-modal="true"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 id="feedback-modal-title" className="text-lg font-semibold">Provide Feedback</h2>
              <button
                onClick={() => {
                  setShowFeedbackModal(false);
                  setFeedbackComments('');
                }}
                aria-label="Close feedback modal"
                className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
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
                className="w-full resize-none rounded-md px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500/50 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              />
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowFeedbackModal(false);
                    setFeedbackComments('');
                  }}
                  className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-500 dark:bg-blue-600 dark:hover:bg-blue-500"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <main className="flex-1 overflow-y-auto w-full">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6">
          {messages.length === 0 ? (
            <div>
              <div
                className="flex flex-col items-center justify-center h-64 text-center p-6 rounded-xl bg-blue-50 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                tabIndex="0"
              >
                <Bot size={48} className="text-blue-400 dark:text-gray-500" aria-hidden="true" />
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
                          ? 'bg-blue-100 dark:bg-blue-700'
                          : 'bg-gray-100 dark:bg-gray-700'
                      }`}
                    >
                      {message.isUser ? (
                        <User size={16} className="text-blue-700 dark:text-blue-300" aria-hidden="true" />
                      ) : (
                        <Bot size={16} className="text-gray-700 dark:text-gray-300" aria-hidden="true" />
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
                        className={`rounded-lg p-3 leading-relaxed ${
                          message.isUser
                            ? 'bg-blue-600 text-white dark:bg-blue-800'
                            : 'bg-white text-gray-800 border border-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700'
                        }`}
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
                                ? 'bg-blue-600 text-white dark:bg-blue-600'
                                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
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
                                ? 'bg-blue-600 text-white dark:bg-blue-600'
                                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
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
                          className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700"
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
                                  className="hover:underline focus:underline overflow-hidden text-ellipsis text-blue-600 dark:text-blue-400"
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
              className="flex items-center gap-2 p-3 rounded-lg my-4 mx-auto max-w-3xl bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-200"
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
        className="border-t p-4 sm:p-6 transition-colors duration-300 w-full border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800"
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
                className="w-full resize-none rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/50 border border-gray-300 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:border-gray-600 transition-all duration-200"
              />
              <div id="input-help" className="sr-only">
                Press Enter to send, Shift+Enter for a new line
              </div>
            </div>
            <button
              type="submit"
              className={`flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full 
                ${isLoading 
                  ? 'bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-400' 
                  : 'bg-blue-600 text-white hover:bg-blue-500 dark:bg-blue-600 dark:hover:bg-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
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
              className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400"
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
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
            Press Enter to send • Shift+Enter for new line • Tab to navigate
          </div>
        </div>
      </form>
    </div>
  );
};

export default ChatbotUI;