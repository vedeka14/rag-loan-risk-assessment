import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Database, BrainCircuit, ArrowRight } from 'lucide-react';

const Home = ({ onNavigate }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel"
      style={{ padding: '3rem', textAlign: 'center', marginTop: '2rem' }}
    >
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
        <div style={{ background: 'var(--accent-gradient)', padding: '20px', borderRadius: '24px', boxShadow: '0 8px 32px rgba(59, 130, 246, 0.4)' }}>
          <Database size={48} color="white" />
        </div>
      </div>
      
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Welcome to the AI Loan Processor</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '700px', margin: '0 auto 3rem', lineHeight: '1.6' }}>
        A state-of-the-art platform that leverages Machine Learning for instant loan risk assessment and Retrieval-Augmented Generation (RAG) for intelligent document querying.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', maxWidth: '900px', margin: '0 auto 3rem' }}>
        <div style={{ background: 'var(--panel-bg)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-color)', textAlign: 'left' }}>
          <ShieldCheck size={32} className="text-gradient" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Smart Risk Assessment</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5' }}>
            Our predictive ML model analyzes applicant data including Annual Income, Existing Debt, and Credit Score to instantly calculate the Debt-to-Income (DTI) ratio, predict loan approval probability, and generate estimated EMI schedules.
          </p>
        </div>

        <div style={{ background: 'var(--panel-bg)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-color)', textAlign: 'left' }}>
          <BrainCircuit size={32} className="text-gradient" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Intelligent RAG Querying</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5' }}>
            Powered by FAISS vector databases and Large Language Models, our Document Query feature allows you to chat directly with historical loan datasets. Ask complex questions and get natural-language answers instantly.
          </p>
        </div>
      </div>

      <button onClick={() => onNavigate('dashboard')} className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '1.1rem' }}>
        Enter Dashboard
        <ArrowRight size={20} style={{ marginLeft: '8px' }} />
      </button>
    </motion.div>
  );
};

export default Home;
