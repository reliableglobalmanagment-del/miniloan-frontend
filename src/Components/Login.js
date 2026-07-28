import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await axios.post('https://miniloan-backend.onrender.com/api/users/login', {
        email,
        password
      });
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        
        // Obtener el perfil del usuario
        try {
          const userResponse = await axios.get('https://miniloan-backend.onrender.com/api/users/me', {
            headers: { Authorization: `Bearer ${response.data.token}` }
          });
          localStorage.setItem('user', JSON.stringify(userResponse.data));
        } catch (err) {
          localStorage.setItem('user', JSON.stringify({ name: email.split('@')[0], email }));
        }
        
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.background}>
        <div style={styles.gradient1}></div>
        <div style={styles.gradient2}></div>
      </div>
      
      <div style={styles.card}>
        <div style={styles.logoContainer}>
          <div style={styles.logoWrapper}>
            <span style={styles.logoIcon}>🏦</span>
          </div>
          <h1 style={styles.title}>Vallarta Préstamos</h1>
          <p style={styles.subtitle}>Plataforma Premium de Préstamos</p>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Correo Electrónico</label>
            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}>✉️</span>
              <input
                type="email"
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                required
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Contraseña</label>
            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}>🔒</span>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                required
              />
            </div>
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Iniciando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            ¿No tienes cuenta?{' '}
            <span 
              onClick={() => navigate('/register')} 
              style={styles.link}
            >
              Regístrate
            </span>
          </p>
          <p style={styles.footerSub}>🔒 Sistema de Gestión de Préstamos v2.0</p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: "'Segoe UI', -apple-system, sans-serif",
    background: '#0f172a',
    position: 'relative',
    overflow: 'hidden',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  gradient1: {
    position: 'absolute',
    top: '-40%',
    right: '-20%',
    width: '70%',
    height: '70%',
    background: 'radial-gradient(ellipse, rgba(99,102,241,0.3) 0%, transparent 70%)',
    animation: 'pulse 8s ease-in-out infinite',
  },
  gradient2: {
    position: 'absolute',
    bottom: '-40%',
    left: '-20%',
    width: '70%',
    height: '70%',
    background: 'radial-gradient(ellipse, rgba(139,92,246,0.2) 0%, transparent 70%)',
    animation: 'pulse 8s ease-in-out infinite reverse',
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(24px)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '32px',
    padding: '40px 32px',
    width: '100%',
    maxWidth: '440px',
    position: 'relative',
    zIndex: 1,
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)',
  },
  logoContainer: {
    textAlign: 'center',
    marginBottom: '28px',
  },
  logoWrapper: {
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '64px',
    height: '64px',
    borderRadius: '20px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    marginBottom: '10px',
    boxShadow: '0 8px 24px rgba(99,102,241,0.4)',
  },
  logoIcon: {
    fontSize: '32px',
  },
  title: {
    fontSize: '26px',
    fontWeight: 700,
    color: '#ffffff',
    margin: 0,
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.5)',
    margin: '2px 0 0 0',
  },
  error: {
    backgroundColor: 'rgba(239,68,68,0.15)',
    border: '1px solid rgba(239,68,68,0.2)',
    color: '#fca5a5',
    padding: '10px 14px',
    borderRadius: '10px',
    marginBottom: '16px',
    fontSize: '14px',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  label: {
    fontSize: '13px',
    fontWeight: 500,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: '0.3px',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '12px',
    fontSize: '15px',
    opacity: 0.5,
  },
  input: {
    width: '100%',
    padding: '12px 14px 12px 38px',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    color: '#ffffff',
    fontSize: '14px',
    transition: 'all 0.3s',
    outline: 'none',
    boxSizing: 'border-box',
  },
  button: {
    padding: '13px 24px',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s',
    marginTop: '6px',
    boxShadow: '0 4px 14px rgba(99,102,241,0.4)',
  },
  footer: {
    marginTop: '24px',
    textAlign: 'center',
  },
  footerText: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.5)',
    margin: '0 0 4px 0',
  },
  link: {
    color: '#818cf8',
    cursor: 'pointer',
    fontWeight: 500,
    textDecoration: 'none',
  },
  footerSub: {
    fontSize: '11px',
    color: 'rgba(255,255,255,0.15)',
    margin: 0,
  },
};

export default Login;
