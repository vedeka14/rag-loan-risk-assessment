import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, ShieldCheck, ShieldAlert, BadgeIndianRupee, ArrowRight, Zap } from 'lucide-react';

const LoanAssessment = () => {
  const [formData, setFormData] = useState({
    name: '',
    annual_inc: '',
    existing_debt: '',
    employment_status: 'Employed',
    loan_amnt: '',
    term: '36'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:5000/api/assess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error("Error assessing risk:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
      
      {/* Form Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel" 
        style={{ padding: '2rem' }}
      >
        <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={24} className="text-gradient" />
          Applicant Details
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Full Name</label>
            <input required type="text" name="name" value={formData.name} onChange={handleChange} className="input-field" placeholder="e.g. John Doe" />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="input-group">
              <label className="input-label">Annual Income (₹)</label>
              <input required type="number" name="annual_inc" value={formData.annual_inc} onChange={handleChange} className="input-field" placeholder="e.g. 600000" />
            </div>
            <div className="input-group">
              <label className="input-label">Existing Monthly Debt (₹)</label>
              <input required type="number" name="existing_debt" value={formData.existing_debt} onChange={handleChange} className="input-field" placeholder="e.g. 15000" />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Employment Status</label>
            <select name="employment_status" value={formData.employment_status} onChange={handleChange} className="input-field" style={{ backgroundColor: 'var(--panel-bg-light)' }}>
              <option value="Employed">Employed</option>
              <option value="Self-Employed">Self-Employed</option>
              <option value="Unemployed">Unemployed</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="input-group">
              <label className="input-label">Loan Amount Requested (₹)</label>
              <input required type="number" name="loan_amnt" value={formData.loan_amnt} onChange={handleChange} className="input-field" placeholder="e.g. 150000" />
            </div>
            <div className="input-group">
              <label className="input-label">Term (Months)</label>
              <input required type="number" name="term" value={formData.term} onChange={handleChange} className="input-field" placeholder="e.g. 36" />
            </div>
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={isLoading}>
            {isLoading ? <Activity className="spin" size={20} /> : "Assess Risk"}
            {!isLoading && <ArrowRight size={20} />}
          </button>
        </form>
      </motion.div>

      {/* Result Section */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-panel" 
        style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '400px' }}
      >
        {!result && !isLoading && (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
            <Activity size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
            <p>Enter applicant details and assess risk to see smart insights here.</p>
          </div>
        )}

        {isLoading && (
          <div style={{ textAlign: 'center' }}>
            <Activity size={48} className="spin text-gradient" style={{ margin: '0 auto 1rem' }} />
            <p style={{ color: 'var(--text-secondary)' }}>Analyzing application via AI Model...</p>
          </div>
        )}

        {result && !isLoading && (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }}
            style={{ width: '100%' }}
          >
            {/* Smart Features Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--accent-secondary)' }}>
              <Zap size={20} />
              <span style={{ fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem' }}>Smart Applicant Profile</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ background: 'var(--card-bg)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Calculated DTI</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{result.calculated_dti?.toFixed(1)}%</div>
              </div>
              <div style={{ background: 'var(--card-bg)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Credit Score</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{result.credit_score}</div>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '2rem', padding: '1.5rem', background: 'var(--panel-bg)', borderRadius: '16px' }}>
              {result.decision.includes('Approved') ? (
                <ShieldCheck size={48} style={{ color: 'var(--success)', margin: '0 auto 1rem' }} />
              ) : (
                <ShieldAlert size={48} style={{ color: 'var(--danger)', margin: '0 auto 1rem' }} />
              )}
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Eligibility</div>
              <h2 style={{ fontSize: '1.75rem', color: result.decision.includes('Approved') ? 'var(--success)' : 'var(--danger)' }}>
                {result.decision.includes('Approved') ? 'Likely Approved' : 'Likely Rejected'}
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.9rem' }}>{result.reason}</p>
            </div>

            <div style={{ background: 'var(--panel-bg)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>AI Risk Probability</span>
                <span style={{ fontWeight: 'bold' }}>{(result.risk_prob * 100).toFixed(2)}%</span>
              </div>
              
              <div style={{ width: '100%', height: '8px', background: 'var(--progress-bg)', borderRadius: '4px', overflow: 'hidden' }}>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${result.risk_prob * 100}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  style={{ 
                    height: '100%', 
                    background: result.risk_prob > 0.5 ? 'var(--danger)' : result.risk_prob > 0.2 ? 'var(--warning)' : 'var(--success)' 
                  }} 
                />
              </div>
            </div>

            {result.emi && (
              <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '12px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: 'var(--accent-gradient)', padding: '12px', borderRadius: '50%' }}>
                  <BadgeIndianRupee size={24} color="white" />
                </div>
                <div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Estimated EMI</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>₹{result.emi.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / month</div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>

    </div>
  );
};

export default LoanAssessment;
