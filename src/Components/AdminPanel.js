import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminPanel = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchAllLoans();
  }, []);

  const fetchAllLoans = async () => {
    try {
      const response = await axios.get('https://miniloan-backend.onrender.com/api/loans/admin', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLoans(response.data);
    } catch (error) {
      console.error('Error fetching loans:', error);
      if (error.response?.status === 403) {
        setMessage('❌ No tienes permisos de administrador.');
      } else {
        setMessage('❌ Error al cargar los préstamos.');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateLoanStatus = async (loanId, newStatus) => {
    try {
      await axios.put(`https://miniloan-backend.onrender.com/api/loans/${loanId}`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLoans(loans.map(loan => 
        loan._id === loanId ? { ...loan, status: newStatus } : loan
      ));
      const statusMap = {
        'approved': 'aprobado',
        'rejected': 'rechazado',
        'pre-approved': 'pre-aprobado'
      };
      setMessage(`✅ Préstamo ${statusMap[newStatus] || newStatus} correctamente.`);
    } catch (error) {
      console.error('Error updating loan:', error);
      setMessage('❌ Error al actualizar el préstamo.');
    }
  };

  const deleteLoan = async (loanId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este préstamo?')) return;
    try {
      await axios.delete(`https://miniloan-backend.onrender.com/api/loans/${loanId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLoans(loans.filter(loan => loan._id !== loanId));
      setMessage('✅ Préstamo eliminado correctamente.');
    } catch (error) {
      console.error('Error deleting loan:', error);
      setMessage('❌ Error al eliminar el préstamo.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const user = JSON.parse(localStorage.getItem('user') || '{"name":"Admin"}');

  const getStatusBadge = (status) => {
    const configs = {
      'approved': { label: 'Aprobado', color: '#10b981', bg: '#d1fae5' },
      'rejected': { label: 'Rechazado', color: '#ef4444', bg: '#fce4e4' },
      'pending': { label: 'Pendiente', color: '#f59e0b', bg: '#fef3c7' },
      'pre-approved': { label: 'Pre-aprobado', color: '#6366f1', bg: '#e0e7ff' },
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
            <span style={styles.brand}>MiniLoan</span>
            <span style={styles.badge}>ADMIN</span>
          </div>
          <div style={styles.headerRight}>
            <span style={styles.userGreeting}>👋 {user.name || 'Admin'}</span>
            <button onClick={() => navigate('/')} style={styles.btnSecondary}>📊 Dashboard</button>
            <button onClick={handleLogout} style={styles.btnLogout}>Cerrar Sesión</button>
          </div>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.card}>
          <h2 style={styles.title}>Panel de Administración</h2>
          <p style={styles.subtitle}>Gestiona todas las solicitudes de préstamos</p>
          
          {message && <div style={styles.message}>{message}</div>}
          
          {loading ? (
            <div style={styles.loading}>Cargando préstamos...</div>
          ) : loans.length === 0 ? (
            <div style={styles.empty}>
              <span style={styles.emptyIcon}>📭</span>
              <p>No hay solicitudes de préstamos.</p>
            </div>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Email</th>
                    <th>Teléfono</th>
                    <th>Monto</th>
                    <th>Plazo</th>
                    <th>Propósito</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loans.map(loan => (
                    <tr key={loan._id}>
                      <td>{loan.userId?.name || 'N/A'}</td>
                      <td>{loan.userId?.email || 'N/A'}</td>
                      <td>{loan.userId?.phone || 'N/A'}</td>
                      <td>${loan.amount.toLocaleString()}</td>
                      <td>{loan.term} meses</td>
                      <td>{loan.purpose}</td>
                      <td>{getStatusBadge(loan.status)}</td>
                      <td>
                        {loan.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => updateLoanStatus(loan._id, 'pre-approved')}
                              style={styles.preApproveBtn}
                            >
                              ⏳ Pre-aprobar
                            </button>
                            <button 
                              onClick={() => updateLoanStatus(loan._id, 'approved')}
                              style={styles.approveBtn}
                            >
                              ✅ Aprobar
                            </button>
                            <button 
                              onClick={() => updateLoanStatus(loan._id, 'rejected')}
                              style={styles.rejectBtn}
                            >
                              ❌ Rechazar
                            </button>
                          </>
                        )}
                        {loan.status === 'pre-approved' && (
                          <>
                            <button 
                              onClick={() => updateLoanStatus(loan._id, 'approved')}
                              style={styles.approveBtn}
                            >
                              ✅ Aprobar
                            </button>
                            <button 
                              onClick={() => updateLoanStatus(loan._id, 'rejected')}
                              style={styles.rejectBtn}
                            >
                              ❌ Rechazar
                            </button>
                          </>
                        )}
                        {loan.status !== 'pending' && loan.status !== 'pre-approved' && (
                          <span style={styles.noAction}>✓ Procesado</span>
                        )}
                        <button 
                          onClick={() => deleteLoan(loan._id)}
                          style={styles.deleteBtn}
                        >
                          🗑️ Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
  headerLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  logo: { fontSize: '28px' },
  brand: { fontSize: '20px', fontWeight: 700, color: '#0f172a' },
  badge: {
    fontSize: '10px',
    fontWeight: 700,
    color: '#fff',
    backgroundColor: '#ef4444',
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
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  title: { fontSize: '24px', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' },
  subtitle: { fontSize: '14px', color: '#64748b', margin: '0 0 20px 0' },
  message: {
    padding: '12px 16px',
    borderRadius: '10px',
    marginBottom: '16px',
    backgroundColor: '#d1fae5',
    color: '#065f46',
    fontSize: '14px',
  },
  loading: { textAlign: 'center', padding: '40px 0', color: '#94a3b8' },
  empty: { textAlign: 'center', padding: '40px 0' },
  emptyIcon: { fontSize: '48px', display: 'block', marginBottom: '8px' },
  tableWrapper: { overflowX: 'auto' },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
  },
  badge: { padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 },
  approveBtn: {
    padding: '6px 12px',
    backgroundColor: '#10b981',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    marginRight: '4px',
  },
  preApproveBtn: {
    padding: '6px 12px',
    backgroundColor: '#6366f1',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    marginRight: '4px',
  },
  rejectBtn: {
    padding: '6px 12px',
    backgroundColor: '#ef4444',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    marginRight: '4px',
  },
  deleteBtn: {
    padding: '6px 12px',
    backgroundColor: '#6b7280',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  noAction: {
    color: '#94a3b8',
    fontSize: '12px',
  },
};

export default AdminPanel;
