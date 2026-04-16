import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, MessageSquare, Send, Bot, User, Trash2 } from 'lucide-react';

const RagQuery = () => {
  const [query, setQuery] = useState('');
  
  // Initialize state from localStorage or use default
  const [messages, setMessages] = useState(() => {
    const savedMessages = localStorage.getItem('ragChatHistory');
    if (savedMessages) {
      try {
        return JSON.parse(savedMessages);
      } catch (e) {
        console.error("Failed to parse chat history:", e);
      }
    }
    return [{ role: 'system', content: 'Hello! I am your AI assistant trained on the loan dataset. How can I help you today?' }];
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Save to localStorage whenever messages change
  useEffect(() => {
    localStorage.setItem('ragChatHistory', JSON.stringify(messages));
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const clearHistory = () => {
    const defaultMessage = [{ role: 'system', content: 'Hello! I am your AI assistant trained on the loan dataset. How can I help you today?' }];
    setMessages(defaultMessage);
    localStorage.setItem('ragChatHistory', JSON.stringify(defaultMessage));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMessage = { role: 'user', content: query };
    setMessages(prev => [...prev, userMessage]);
    setQuery('');
    setIsLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:5000/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userMessage.content }),
      });
      const data = await res.json();
      
      setMessages(prev => [...prev, { role: 'system', content: data.answer }]);
    } catch (error) {
      console.error("Error querying RAG:", error);
      // Fallback if server is not connected
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'system', content: "The lowest FICO score found in the documents is 660.0. (Simulated response)" }]);
      }, 1500);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel"
      style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 250px)', marginTop: '1rem' }}
    >
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Search className="text-gradient" size={24} />
          <h2>Document Query (RAG)</h2>
        </div>
        <button 
          onClick={clearHistory}
          className="btn"
          style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '8px 16px', fontSize: '0.9rem' }}
          title="Clear Chat History"
        >
          <Trash2 size={16} />
          Clear
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {messages.map((msg, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ 
              display: 'flex', 
              gap: '1rem',
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row'
            }}
          >
            <div style={{ 
              width: '40px', height: '40px', borderRadius: '50%', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: msg.role === 'user' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(139, 92, 246, 0.2)',
              color: msg.role === 'user' ? 'var(--accent-primary)' : 'var(--accent-secondary)'
            }}>
              {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
            </div>
            
            <div style={{ 
              background: msg.role === 'user' ? 'var(--accent-gradient)' : 'var(--panel-bg)',
              padding: '1rem 1.5rem',
              borderRadius: '16px',
              borderTopRightRadius: msg.role === 'user' ? '0' : '16px',
              borderTopLeftRadius: msg.role === 'user' ? '16px' : '0',
              maxWidth: '75%',
              color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
              lineHeight: '1.5'
            }}>
              {msg.content}
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ display: 'flex', gap: '1rem' }}
          >
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(139, 92, 246, 0.2)', color: 'var(--accent-secondary)' }}>
              <Bot size={20} />
            </div>
            <div style={{ background: 'var(--panel-bg)', padding: '1rem 1.5rem', borderRadius: '16px', borderTopLeftRadius: '0' }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6 }} style={{ width: 8, height: 8, background: 'var(--text-secondary)', borderRadius: '50%' }} />
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} style={{ width: 8, height: 8, background: 'var(--text-secondary)', borderRadius: '50%' }} />
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} style={{ width: 8, height: 8, background: 'var(--text-secondary)', borderRadius: '50%' }} />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <MessageSquare size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything about the loan data..." 
              className="input-field"
              style={{ width: '100%', paddingLeft: '48px', paddingRight: '16px' }}
              disabled={isLoading}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={isLoading || !query.trim()} style={{ padding: '0 24px' }}>
            <Send size={20} />
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default RagQuery;
