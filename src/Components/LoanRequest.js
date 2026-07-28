import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoanRequest = () => {
  const [amount, setAmount] = useState('');
  const [term, setTerm] = useState('');
  const [purpose, setPurpose] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{"name":"Usuario"}');

  useEffect(() => {
    if (!token) { 
      navigate('/login'); 
      return; 
    }
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      const res = await axios.get('https://miniloan-backend.onrender.com/api/loans', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLoans(res.data);
    } catch (err) {
      console.error('Error fetching loans:', err);
      setLoans([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    setMessageType('');
    
    try {
      const response = await axios.post('https://miniloan-backend.onrender.com/api/loans', {
        amount: Number(amount), 
        term: Number(term), 
        purpose
      }, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      setMessage('✅ ¡Préstamo solicitado exitosamente!');
      setMessageType('success');
      setAmount('');
      setTerm('');
      setPurpose('');
      fetchLoans();
    } catch (err) {
      setMessage('❌ Error al solicitar el préstamo: ' + (err.response?.data?.message || err.message));
      setMessageType('error');
    } finally { 
      setSubmitting(false); 
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getStatusBadge = (status) => {
    const configs = {
      'approved': { label: 'Aprobado', color: '#10b981', bg: '#d1fae5' },
      'rejected': { label: 'Rechazado', color: '#ef4444', bg: '#fce4e4' },
      'pending': { label: 'Pendiente', color: '#f59e0b', bg: '#fef3c7' },
      'pre-approved': { label: 'Pre-aprobado', color: '#4338ca', bg: '#e0e7ff' },
    };
    const config = configs[status] || configs.pending;
    return <span style={{...styles.badge, color: config.color, backgroundColor: config.bg}}>{config.label}</span>;
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.headerLeft}>
            <span style={styles.logo}>🏦</span>
            <span style={styles.brand}>Vallarta Préstamos</span>
            <span style={styles.badge}>PRO</span>
          </div>
          <div style={styles.headerRight}>
            <span style={styles.userGreeting}>👋 {user.name}</span>
            <button onClick={() => navigate('/')} style={styles.btnSecondary}>📊 Dashboard</button>
            <button onClick={handleLogout} style={styles.btnLogout}>Cerrar Sesión</button>
          </div>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.grid}>
          <div style={styles.formCard}>
            <div style={styles.formHeader}>
              <h2 style={styles.formTitle}>📝 Solicitar Préstamo</h2>
              <p style={styles.formSub}>Completa los datos para solicitar tu préstamo</p>
            </div>
            
            {message && (
              <div style={{...styles.message, backgroundColor: messageType === 'success' ? '#d1fae5' : '#fce4e4', color: messageType === 'success' ? '#065f46' : '#991b1b'}}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={styles.group}>
                <label style={styles.label}>💰 Monto del Préstamo</label>
                <div style={styles.inputWrapper}>
                  <span style={styles.inputPrefix}>$</span>
                  <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" required style={styles.input} min="100" />
                </div>
                <small style={styles.hint}>Monto mínimo: $100 · Máximo: $100,000</small>
              </div>

              <div style={styles.group}>
                <label style={styles.label}>📅 Plazo del Préstamo</label>
                <select value={term} onChange={e => setTerm(e.target.value)} required style={styles.select}>
                  <option value="">Selecciona un plazo</option>
                  {[3,6,9,12,18,24].map(t => <option key={t} value={t}>{t} meses</option>)}
                </select>
              </div>

              <div style={styles.group}>
                <label style={styles.label}>🎯 Propósito del Préstamo</label>
                <select value={purpose} onChange={e => setPurpose(e.target.value)} required style={styles.select}>
                  <option value="">Selecciona un propósito</option>
                  {['personal','negocio','educación','médico','hogar','vehículo','viaje','otro'].map(p => 
                    <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                  )}
                </select>
              </div>

              <button type="submit" style={styles.btnSubmit} disabled={submitting}>
                {submitting ? '⏳ Enviando...' : '🚀 Solicitar Préstamo'}
              </button>
            </form>
          </div>

          <div style={styles.listCard}>
            <div style={styles.listHeader}>
              <h3 style={styles.listTitle}>📋 Mis Préstamos</h3>
              <span style={styles.listCount}>{loans.length}</span>
            </div>
            
            {loading ? (
              <div style={styles.loading}>Cargando...</div>
            ) : loans.length === 0 ? (
              <div style={styles.empty}>
                <span style={styles.emptyIcon}>📭</span>
                <p>No tienes préstamos</p>
                <p style={styles.emptySub}>Solicita tu primer préstamo ahora</p>
              </div>
            ) : (
              loans.map((loan, i) => (
                <div key={loan._id || i} style={styles.loanItem}>
                  <div>
                    <span style={styles.loanAmount}>${loan.amount.toLocaleString()}</span>
                    <span style={styles.loanTerm}>{loan.term} meses</span>
                    <span style={styles.loanPurpose}>{loan.purpose}</span>
                  </div>
                  <div>
                    {getStatusBadge(loan.status)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f1f5f9', fontFamily: "'Segoe UI', sans-serif" },
  header: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    padding: '0 24px',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '72px',
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  logo: { fontSize: '28px' },
  brand: { fontSize: '20px', fontWeight: 700, color: '#0f172a' },
  badge: {
    fontSize: '10px',
    fontWeight: 700,
    color: '#fff',
    backgroundColor: '#6366f1',
    padding: '2px 10px',
    borderRadius: '12px',
    letterSpacing: '0.5px',
  },
  headerRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  userGreeting: { fontSize: '14px', color: '#0f172a', fontWeight: 500 },
  btnSecondary: {
    padding: '10px 20px',
    backgroundColor: '#f1f5f9',
    color: '#0f172a',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 500,
  },
  btnLogout: {
    padding: '10px 20px',
    backgroundColor: '#ef4444',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 500,
  },
  main: { maxWidth: '1200px', margin: '0 auto', padding: '24px' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  formHeader: { marginBottom: '24px' },
  formTitle: { fontSize: '24px', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' },
  formSub: { fontSize: '14px', color: '#64748b', margin: 0 },
  message: {
    padding: '12px 16px',
    borderRadius: '10px',
    marginBottom: '16px',
    fontSize: '14px',
    fontWeight: 500,
  },
  group: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '14px', fontWeight: 600, color: '#0f172a', marginBottom: '4px' },
  inputWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
  inputPrefix: {
    position: 'absolute',
    left: '14px',
    fontSize: '18px',
    fontWeight: 600,
    color: '#94a3b8',
  },
  input: {
    width: '100%',
    padding: '12px 16px 12px 32px',
    borderRadius: '10px',
    border: '2px solid #e2e8f0',
    fontSize: '16px',
    backgroundColor: '#f8fafc',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'all 0.2s',
  },
  hint: { fontSize: '12px', color: '#94a3b8', display: 'block', marginTop: '4px' },
  select: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '10px',
    border: '2px solid #e2e8f0',
    fontSize: '16px',
    backgroundColor: '#f8fafc',
    outline: 'none',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2394a3b8' stroke-width='2' fill='none'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 16px center',
  },
  btnSubmit: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#0f172a',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginTop: '4px',
  },
  listCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  listHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  listTitle: { fontSize: '18px', fontWeight: 600, color: '#0f172a', margin: 0 },
  listCount: {
    fontSize: '13px',
    color: '#64748b',
    backgroundColor: '#f1f5f9',
    padding: '2px 12px',
    borderRadius: '12px',
  },
  loading: { textAlign: 'center', padding: '40px 0', color: '#94a3b8' },
  empty: { textAlign: 'center', padding: '40px 0' },
  emptyIcon: { fontSize: '48px', display: 'block', marginBottom: '8px' },
  emptySub: { fontSize: '14px', color: '#94a3b8', margin: 0 },
  loanItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 16px',
    borderRadius: '10px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    marginBottom: '8px',
    flexWrap: 'wrap',
    gap: '8px',
  },
  loanAmount: { fontSize: '16px', fontWeight: 700, color: '#0f172a', marginRight: '12px' },
  loanTerm: { fontSize: '13px', color: '#64748b', backgroundColor: '#e2e8f0', padding: '2px 10px', borderRadius: '12px', marginRight: '8px' },
  loanPurpose: { fontSize: '13px', color: '#94a3b8', textTransform: 'capitalize' },
  badge: { padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 },
};

export default LoanRequest;
