import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({ name: 'Usuario' });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error('Error parsing user data', e);
      }
    }

    if (!token) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [location.key]);

  const fetchData = async () => {
    try {
      const response = await axios.get('https://miniloan-backend.onrender.com/api/loans', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLoans(response.data || []);
    } catch (error) {
      console.error('Error fetching loans:', error);
      setLoans([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const stats = {
    total: loans.length,
    approved: loans.filter(l => l.status === 'approved').length,
    pending: loans.filter(l => l.status === 'pending' || !l.status).length,
    preApproved: loans.filter(l => l.status === 'pre-approved').length,
    rejected: loans.filter(l => l.status === 'rejected').length,
  };

  const totalAmount = loans.reduce((sum, l) => sum + (l.amount || 0), 0);

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.headerLeft}>
            <span style={styles.logo}>🏦</span>
            <span style={styles.brand}>MiniLoan</span>
            <span style={styles.badge}>PRO</span>
          </div>
          <div style={styles.headerRight}>
            <span style={styles.userGreeting}>👋 {user.name || 'Usuario'}</span>
            <button onClick={() => navigate('/request-loan')} style={styles.btnPrimary}>
              + Nuevo Préstamo
            </button>
            <button onClick={handleLogout} style={styles.btnLogout}>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.welcomeCard}>
          <div>
            <h1 style={styles.welcomeTitle}>Bienvenido, {user.name || 'Usuario'} 👋</h1>
            <p style={styles.welcomeSub}>Gestiona tus préstamos de manera fácil y rápida</p>
          </div>
          <div style={styles.welcomeBadge}>
            <span style={styles.welcomeBadgeIcon}>✅</span>
            <span>Cuenta Verificada</span>
          </div>
        </div>

        <div style={styles.statsGrid}>
          <div style={{...styles.statCard, borderTop: '3px solid #6366f1'}}>
            <div>
              <span style={styles.statIcon}>📊</span>
              <h3 style={styles.statNumber}>{stats.total}</h3>
              <p style={styles.statLabel}>Total Préstamos</p>
            </div>
          </div>
          <div style={{...styles.statCard, borderTop: '3px solid #10b981'}}>
            <div>
              <span style={styles.statIcon}>✅</span>
              <h3 style={styles.statNumber}>{stats.approved}</h3>
              <p style={styles.statLabel}>Aprobados</p>
            </div>
          </div>
          <div style={{...styles.statCard, borderTop: '3px solid #6366f1'}}>
            <div>
              <span style={styles.statIcon}>⏳</span>
              <h3 style={styles.statNumber}>{stats.preApproved}</h3>
              <p style={styles.statLabel}>Pre-aprobados</p>
            </div>
          </div>
          <div style={{...styles.statCard, borderTop: '3px solid #f59e0b'}}>
            <div>
              <span style={styles.statIcon}>⏳</span>
              <h3 style={styles.statNumber}>{stats.pending}</h3>
              <p style={styles.statLabel}>Pendientes</p>
            </div>
          </div>
          <div style={{...styles.statCard, borderTop: '3px solid #ef4444'}}>
            <div>
              <span style={styles.statIcon}>💰</span>
              <h3 style={styles.statNumber}>${totalAmount.toLocaleString()}</h3>
              <p style={styles.statLabel}>Total Solicitado</p>
            </div>
          </div>
        </div>

        <div style={styles.actionsCard}>
          <h3 style={styles.sectionTitle}>Acciones Rápidas</h3>
          <div style={styles.actionsGrid}>
            <div style={styles.actionItem} onClick={() => navigate('/request-loan')}>
              <span style={styles.actionIcon}>📝</span>
              <h4>Solicitar Préstamo</h4>
              <p>Completa el formulario en 2 minutos</p>
            </div>
            <div style={styles.actionItem} onClick={() => navigate('/request-loan')}>
              <span style={styles.actionIcon}>📋</span>
              <h4>Ver Préstamos</h4>
              <p>Revisa todas tus solicitudes</p>
            </div>
            {user.role === 'admin' && (
              <div style={styles.actionItem} onClick={() => navigate('/admin/loans')}>
                <span style={styles.actionIcon}>🛠️</span>
                <h4>Panel Admin</h4>
                <p>Gestiona préstamos</p>
              </div>
            )}
          </div>
        </div>

        <div style={styles.listCard}>
          <div style={styles.listHeader}>
            <h3 style={styles.sectionTitle}>Mis Préstamos</h3>
            <span style={styles.listBadge}>{loans.length} solicitudes</span>
          </div>
          
          {loading ? (
            <div style={styles.loading}>Cargando tus préstamos...</div>
          ) : loans.length === 0 ? (
            <div style={styles.empty}>
              <span style={styles.emptyIcon}>🏦</span>
              <p style={styles.emptyTitle}>No tienes préstamos</p>
              <p style={styles.emptySub}>Solicita tu primer préstamo ahora</p>
              <button onClick={() => navigate('/request-loan')} style={styles.emptyBtn}>
                Solicitar ahora
              </button>
            </div>
          ) : (
            loans.slice(0, 5).map((loan) => (
              <div key={loan._id} style={styles.loanItem}>
                <div style={styles.loanLeft}>
                  <span style={styles.loanAmount}>${(loan.amount || 0).toLocaleString()}</span>
                  <span style={styles.loanTerm}>{loan.term || 0} meses</span>
                  <span style={styles.loanPurpose}>{loan.purpose || 'General'}</span>
                </div>
                <div style={styles.loanRight}>
                  <span style={{...styles.badge, backgroundColor: 
                    loan.status === 'approved' ? '#d1fae5' : 
                    loan.status === 'rejected' ? '#fce4e4' : 
                    loan.status === 'pre-approved' ? '#e0e7ff' : '#fef3c7',
                    color: 
                    loan.status === 'approved' ? '#065f46' : 
                    loan.status === 'rejected' ? '#991b1b' : 
                    loan.status === 'pre-approved' ? '#4338ca' : '#92400e'
                  }}>
                    {loan.status === 'approved' ? '✅ Aprobado' : 
                     loan.status === 'rejected' ? '❌ Rechazado' : 
                     loan.status === 'pre-approved' ? '⏳ Pre-aprobado' : '⏳ Pendiente'}
                  </span>
                  <span style={styles.loanDate}>
                    {loan.createdAt ? new Date(loan.createdAt).toLocaleDateString('es-MX') : 'Fecha no disponible'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f1f5f9',
    fontFamily: "'Segoe UI', -apple-system, sans-serif",
  },
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
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
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
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  userGreeting: {
    fontSize: '14px',
    color: '#0f172a',
    fontWeight: 500,
  },
  btnPrimary: {
    padding: '10px 20px',
    backgroundColor: '#0f172a',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 500,
    transition: 'all 0.2s',
  },
  btnLogout: {
    padding: '10px 20px',
    backgroundColor: '#f1f5f9',
    color: '#0f172a',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 500,
  },
  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '24px',
  },
  welcomeCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '24px 32px',
    marginBottom: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
  },
  welcomeTitle: { fontSize: '24px', margin: 0, color: '#0f172a' },
  welcomeSub: { fontSize: '14px', color: '#64748b', margin: '4px 0 0 0' },
  welcomeBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#d1fae5',
    color: '#065f46',
    padding: '8px 16px',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: 500,
  },
  welcomeBadgeIcon: { fontSize: '16px' },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '20px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  statIcon: { fontSize: '24px', display: 'block', marginBottom: '4px' },
  statNumber: { fontSize: '24px', fontWeight: 700, margin: 0, color: '#0f172a' },
  statLabel: { fontSize: '13px', color: '#64748b', margin: 0 },
  actionsCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  sectionTitle: { fontSize: '16px', fontWeight: 600, color: '#0f172a', margin: '0 0 16px 0' },
  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '16px',
  },
  actionItem: {
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
    border: '2px solid transparent',
  },
  actionIcon: { fontSize: '28px', display: 'block', marginBottom: '8px' },
  listCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  listHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  listBadge: {
    fontSize: '13px',
    color: '#64748b',
    backgroundColor: '#f1f5f9',
    padding: '2px 12px',
    borderRadius: '12px',
  },
  loading: { textAlign: 'center', padding: '40px 0', color: '#94a3b8' },
  empty: {
    textAlign: 'center',
    padding: '40px 0',
  },
  emptyIcon: { fontSize: '48px', display: 'block', marginBottom: '8px' },
  emptyTitle: { fontSize: '18px', fontWeight: 600, color: '#0f172a', margin: '0 0 4px 0' },
  emptySub: { fontSize: '14px', color: '#94a3b8', margin: '0 0 16px 0' },
  emptyBtn: {
    padding: '10px 24px',
    backgroundColor: '#0f172a',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
  },
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
  loanLeft: { display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' },
  loanAmount: { fontSize: '16px', fontWeight: 700, color: '#0f172a' },
  loanTerm: { fontSize: '13px', color: '#64748b', backgroundColor: '#e2e8f0', padding: '2px 10px', borderRadius: '12px' },
  loanPurpose: { fontSize: '13px', color: '#94a3b8', textTransform: 'capitalize' },
  loanRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  badge: { padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 },
  loanDate: { fontSize: '12px', color: '#94a3b8' },
};

export default Dashboard;
