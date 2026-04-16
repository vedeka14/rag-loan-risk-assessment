import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, FileText, Database, Home as HomeIcon, Sun, Moon } from 'lucide-react';
import Home from './components/Home';
import LoanAssessment from './components/LoanAssessment';
import RagQuery from './components/RagQuery';
import './index.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [activeTab, setActiveTab] = useState('assessment');
  
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true; // Default to dark
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      
      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3rem' }}>
        <div 
          style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}
          onClick={() => setCurrentPage('home')}
        >
          <div style={{ background: 'var(--accent-gradient)', padding: '12px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4)' }}>
            <Database size={28} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '700' }}>AI Loan Processor</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Powered by RAG & Machine Learning</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="btn"
            style={{ 
              background: 'var(--panel-bg-light)', 
              border: '1px solid var(--border-color)', 
              padding: '8px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Toggle Light/Dark Mode"
          >
            {isDarkMode ? <Sun size={20} color="var(--text-primary)" /> : <Moon size={20} color="var(--text-primary)" />}
          </button>

          {/* Global Navigation */}
          <div style={{ display: 'flex', background: 'var(--panel-bg-light)', borderRadius: '12px', padding: '0.5rem', gap: '0.5rem', border: '1px solid var(--border-color)' }}>
            <button 
              onClick={() => setCurrentPage('home')}
              className={`btn ${currentPage === 'home' ? 'btn-primary' : ''}`}
              style={{ 
                background: currentPage === 'home' ? 'var(--accent-gradient)' : 'transparent',
                color: currentPage === 'home' ? 'white' : 'var(--text-secondary)',
                border: 'none',
                boxShadow: currentPage === 'home' ? '0 4px 14px rgba(59, 130, 246, 0.3)' : 'none'
              }}
            >
              <HomeIcon size={18} />
              Home
            </button>

            <button 
              onClick={() => setCurrentPage('dashboard')}
              className={`btn ${currentPage === 'dashboard' ? 'btn-primary' : ''}`}
              style={{ 
                background: currentPage === 'dashboard' ? 'var(--accent-gradient)' : 'transparent',
                color: currentPage === 'dashboard' ? 'white' : 'var(--text-secondary)',
                border: 'none',
                boxShadow: currentPage === 'dashboard' ? '0 4px 14px rgba(59, 130, 246, 0.3)' : 'none'
              }}
            >
              <Database size={18} />
              Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main>
        <AnimatePresence mode="wait">
          {currentPage === 'home' ? (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Home onNavigate={setCurrentPage} />
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Dashboard Sub-Navigation */}
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                <button 
                  onClick={() => setActiveTab('assessment')}
                  className="btn"
                  style={{ 
                    background: 'transparent',
                    color: activeTab === 'assessment' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    borderBottom: activeTab === 'assessment' ? '2px solid var(--accent-primary)' : '2px solid transparent',
                    borderRadius: '0',
                    padding: '8px 16px'
                  }}
                >
                  <Shield size={18} />
                  Risk Assessment
                </button>
                <button 
                  onClick={() => setActiveTab('rag')}
                  className="btn"
                  style={{ 
                    background: 'transparent',
                    color: activeTab === 'rag' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    borderBottom: activeTab === 'rag' ? '2px solid var(--accent-primary)' : '2px solid transparent',
                    borderRadius: '0',
                    padding: '8px 16px'
                  }}
                >
                  <FileText size={18} />
                  Document Query
                </button>
              </div>

              {/* Dashboard Content */}
              <AnimatePresence mode="wait">
                {activeTab === 'assessment' ? (
                  <motion.div
                    key="assessment"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <LoanAssessment />
                  </motion.div>
                ) : (
                  <motion.div
                    key="rag"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <RagQuery />
                  </motion.div>
                )}
              </AnimatePresence>

            </motion.div>
          )}
        </AnimatePresence>
      </main>

    </div>
  );
}

export default App;