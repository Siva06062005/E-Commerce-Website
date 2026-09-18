import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, LogIn, Sparkles, Shield, User, AlertCircle, Store, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState('');
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectMessage = location.state?.message;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!email.trim() || !password) {
      setValidationError('Please enter both email and password.');
      return;
    }

    const result = await login(email, password);
    if (result.success) {
      const userRole = result.user?.role;
      // Automatic role-based navigation
      if (userRole === 'ROLE_ADMIN' || userRole === 'ADMIN') {
        navigate('/admin');
      } else if (userRole === 'ROLE_SUPPLIER' || userRole === 'SUPPLIER') {
        navigate('/supplier');
      } else {
        const destination = location.state?.from?.pathname || '/products';
        navigate(destination);
      }
    }
  };

  // Quick fill helper for review/testing
  const fillCredentials = (type) => {
    if (type === 'admin') {
      setEmail('admin@teezone.com');
      setPassword('AdminSecret123!');
    } else if (type === 'vendor') {
      setEmail('vendor@teezone.in');
      setPassword('VendorPass123!');
    } else {
      setEmail('demo@example.com');
      setPassword('Password123!');
    }
    setValidationError('');
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '4rem 1.5rem 6rem', display: 'flex', justifyContent: 'center' }}>
      <div className="card" style={{ width: '100%', maxWidth: '480px', padding: '2.5rem' }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            marginBottom: '1rem',
            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)'
          }}>
            <Sparkles size={24} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            Unified Platform Sign In
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Single secure gateway for Customers, Verified Vendors, and Universal Admins.
          </p>
        </div>

        {redirectMessage && (
          <div style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', color: 'var(--accent-amber)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
            {redirectMessage}
          </div>
        )}

        {(error || validationError) && (
          <div style={{ background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', color: 'var(--accent-rose)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertCircle size={16} />
            <span>{validationError || error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Registered Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com or vendor@teezone.in"
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label className="form-label">Password</label>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '0.75rem', marginBottom: '1.5rem' }}
          >
            {loading ? 'Authenticating...' : (
              <>
                <LogIn size={18} /> Sign In & Route
              </>
            )}
          </button>
        </form>

        {/* Quick Testing Profiles Helper */}
        <div style={{ background: 'var(--bg-secondary)', borderRadius: '10px', padding: '1.1rem', border: '1px solid var(--border-subtle)', marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.75rem', fontWeight: 700 }}>
            Instant Role Switcher (Auto-Fills & Demonstrates Routing):
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            <button
              type="button"
              onClick={() => fillCredentials('admin')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.72rem', padding: '0.5rem 0.4rem', flexDirection: 'column', gap: '3px' }}
              title="Universal Admin with master access"
            >
              <Shield size={14} color="var(--accent-secondary)" />
              <span style={{ fontWeight: 700 }}>Admin</span>
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('vendor')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.72rem', padding: '0.5rem 0.4rem', flexDirection: 'column', gap: '3px' }}
              title="Verified Indian Supplier"
            >
              <Store size={14} color="var(--accent-emerald)" />
              <span style={{ fontWeight: 700 }}>Vendor ✓</span>
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('customer')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.72rem', padding: '0.5rem 0.4rem', flexDirection: 'column', gap: '3px' }}
              title="Customer Shopper"
            >
              <User size={14} color="var(--accent-primary)" />
              <span style={{ fontWeight: 700 }}>Customer</span>
            </button>
          </div>
        </div>

        {/* Footer Link */}
        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
            Create Account (Customer or Vendor)
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
