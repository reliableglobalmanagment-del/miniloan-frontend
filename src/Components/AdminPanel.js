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
      console.error(error);
      setMessage(error.response?.status === 403 ? '❌ No tienes permisos de administrador.' : '❌ Error al cargar los préstamos.');
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
      setMessage(`✅ Préstamo ${newStatus === 'approved' ? 'aprobado' : newStatus === 'rejected' ? 'rechazado' : 'pre-aprobado'} correctamente.`);
    } catch (error) {
      setMessage('❌ Error al actualizar el préstamo.');
    }
  };

  const deleteLoan = async (loanId) => {
    if (!window.confirm('¿Eliminar este préstamo?')) return;
    try {
      await axios.delete(`https://miniloan-backend.onrender.com/api/loans/${loanId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLoans(loans.filter(loan => loan._id !== loanId));
      setMessage('✅ Préstamo eliminado.');
    } catch (error) {
      setMessage('❌ Error al eliminar.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const user = JSON.parse(localStorage.getItem('user') || '{"name":"Admin"}');

  const getStatusBadge = (status) => {
    const map = {
      'approved': { label: 'Aprobado', color: '#10b981', bg: '#d1fae5' },
      'rejected': { label: 'Rechazado', color: '#ef4444', bg: '#fce4e4' },
      'pending': { label: 'Pendiente', color: '#f59e0b', bg: '#fef3c7' },
      'pre-approved': { label: 'Pre-aprobado', color: '#4338ca', bg: '#e0e7ff' },
    };
    const config = map[status] || map.pending;
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
            <span style={styles.userGreeting}>👋 {user.name}</span>
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
            <div style={styles.loading}>Cargando...</div>
          ) : loans.length === 0 ? (
            <div style={styles.empty}>
              <span style={styles.emptyIcon}>📭</span>
              <p>No hay solicitudes.</p>
            </div>
          ) : (
            <div style={styles.tableWrapper}>
              <div className="desktop-table">
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th>Usuario</th>
                      <th>Email</th>
                      <th>Teléfono</th>
                      <th>ID Usuario</th>
                      <th>Folio</th>
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
                        <td style={{fontSize: '11px', color: '#64748b'}}>{loan.userId?._id || 'N/A'}</td>
                        <td style={{fontWeight: 'bold', color: '#4338ca'}}>{loan.folio || '-'}</td>
                        <td>${loan.amount.toLocaleString()}</td>
                        <td>{loan.term} meses</td>
                        <td>{loan.purpose}</td>
                        <td>{getStatusBadge(loan.status)}</td>
                        <td>
                          <div style={styles.actionButtons}>
                            {loan.status === 'pending' && (
                              <>
                                <button onClick={() => updateLoanStatus(loan._id, 'pre-approved')} style={styles.preApproveBtn}>⏳ Pre</button>
                                <button onClick={() => updateLoanStatus(loan._id, 'approved')} style={styles.approveBtn}>✅</button>
                                <button onClick={() => updateLoanStatus(loan._id, 'rejected')} style={styles.rejectBtn}>❌</button>
                              </>
                            )}
                            {loan.status === 'pre-approved' && (
                              <>
                                <button onClick={() => updateLoanStatus(loan._id, 'approved')} style={styles.approveBtn}>✅</button>
                                <button onClick={() => updateLoanStatus(loan._id, 'rejected')} style={styles.rejectBtn}>❌</button>
                              </>
                            )}
                            {loan.status !== 'pending' && loan.status !== 'pre-approved' && (
                              <span style={styles.noAction}>✓</span>
                            )}
                            <button onClick={() => deleteLoan(loan._id)} style={styles.deleteBtn}>🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mobile-cards">
                {loans.map(loan => (
                  <div key={loan._id} style={styles.cardItem}>
                    <div style={styles.cardHeader}>
                      <span style={styles.cardName}>{loan.userId?.name || 'N/A'}</span>
                      <span style={styles.cardFolio}>{loan.folio || 'Sin folio'}</span>
                    </div>
                    <div style={styles.cardBody}>
                      <div><strong>Email:</strong> {loan.userId?.email || 'N/A'}</div>
                      <div><strong>Teléfono:</strong> {loan.userId?.phone || 'N/A'}</div>
                      <div><strong>Monto:</strong> ${loan.amount.toLocaleString()}</div>
                      <div><strong>Plazo:</strong> {loan.term} meses</div>
                      <div><strong>Propósito:</strong> {loan.purpose}</div>
                      <div style={{marginTop: '8px'}}>{getStatusBadge(loan.status)}</div>
                    </div>
                    <div style={styles.cardActions}>
                      {loan.status === 'pending' && (
                        <>
                          <button onClick={() => updateLoanStatus(loan._id, 'pre-approved')} style={styles.preApproveBtn}>⏳ Pre</button>
                          <button onClick={() => updateLoanStatus(loan._id, 'approved')} style={styles.approveBtn}>✅</button>
                          <button onClick={() => updateLoanStatus(loan._id, 'rejected')} style={styles.rejectBtn}>❌</button>
                        </>
                      )}
                      {loan.status === 'pre-approved' && (
                        <>
                          <button onClick={() => updateLoanStatus(loan._id, 'approved')} style={styles.approveBtn}>✅</button>
                          <button onClick={() => updateLoanStatus(loan._id, 'rejected')} style={styles.rejectBtn}>❌</button>
                        </>
                      )}
                      {loan.status !== 'pending' && loan.status !== 'pre-approved' && (
                        <span style={styles.noAction}>✓ Procesado</span>
                      )}
                      <button onClick={() => deleteLoan(loan._id)} style={styles.deleteBtn}>🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
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
    fontFamily: "'Inter', -apple-system, sans-serif",
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
    borderRadius: '10px',
    fontWeight: 500,
  },
  btnLogout: {
    padding: '10px 20px',
    backgroundColor: '#ef4444',
    color: '#fff',
    borderRadius: '10px',
    fontWeight: 500,
  },
  main: { maxWidth: '1200px', margin: '0 auto', padding: '24px' },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
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
    minWidth: '900px',
  },
  badge: { padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 },
  actionButtons: { display: 'flex', gap: '4px', flexWrap: 'wrap' },
  approveBtn: {
    padding: '6px 10px',
    backgroundColor: '#10b981',
    color: '#fff',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
  },
  preApproveBtn: {
    padding: '6px 10px',
    backgroundColor: '#6366f1',
    color: '#fff',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
  },
  rejectBtn: {
    padding: '6px 10px',
    backgroundColor: '#ef4444',
    color: '#fff',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
  },
  deleteBtn: {
    padding: '6px 10px',
    backgroundColor: '#6b7280',
    color: '#fff',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
  },
  noAction: { color: '#94a3b8', fontSize: '14px', fontWeight: 500 },
  cardItem: {
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '12px',
    border: '1px solid #e2e8f0',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  cardName: { fontWeight: 600, color: '#0f172a' },
  cardFolio: { fontSize: '12px', color: '#4338ca', fontWeight: 600 },
  cardBody: { fontSize: '14px', color: '#334155' },
  cardActions: { marginTop: '12px', display: 'flex', gap: '6px', flexWrap: 'wrap' },
};

// CSS dinámico para responsividad
if (typeof document !== 'undefined') {
  const styleTag = document.createElement('style');
  styleTag.innerHTML = `
    @media (max-width: 768px) {
      .desktop-table { display: none !important; }
      .mobile-cards { display: block !important; }
    }
    @media (min-width: 769px) {
      .desktop-table { display: block !important; }
      .mobile-cards { display: none !important; }
    }
  `;
  document.head.appendChild(styleTag);
}

export default AdminPanel;

