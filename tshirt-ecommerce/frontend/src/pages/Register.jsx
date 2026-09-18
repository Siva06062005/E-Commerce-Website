import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Lock,
  UserPlus,
  Sparkles,
  AlertCircle,
  Building2,
  Phone,
  FileText,
  MapPin,
  ShieldCheck,
  ShoppingBag,
  Store,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { INDIAN_STATES, validateIndianPhone } from '../utils/indianCommerceUtils';
import VerifiedBadge from '../components/VerifiedBadge';

const Register = () => {
  const [role, setRole] = useState('ROLE_CUSTOMER'); // 'ROLE_CUSTOMER' or 'ROLE_SUPPLIER'

  // Common Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Vendor / Supplier Specific Fields
  const [storeName, setStoreName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [gstin, setGstin] = useState('');
  const [pan, setPan] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Karnataka');
  const [pincode, setPincode] = useState('');

  const [validationError, setValidationError] = useState('');
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const isVendor = role === 'ROLE_SUPPLIER';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    // Common validations
    if (!name.trim()) {
      setValidationError('Please enter your full name / contact person name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setValidationError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setValidationError('Passwords do not match.');
      return;
    }

    // Vendor validations
    if (isVendor) {
      if (!storeName.trim()) {
        setValidationError('Please provide your Store / Brand name.');
        return;
      }
      if (!phone.trim() || !validateIndianPhone(phone)) {
        setValidationError('Please provide a valid 10-digit Indian contact phone number.');
        return;
      }
      const cleanGst = gstin.trim().toUpperCase();
      if (!cleanGst || cleanGst.length !== 15) {
        setValidationError('Please enter a valid 15-character Indian GSTIN (e.g., 29AABCU9603R1Z7).');
        return;
      }
      const cleanPan = pan.trim().toUpperCase();
      if (!cleanPan || cleanPan.length !== 10) {
        setValidationError('Please enter a valid 10-character PAN number (e.g., AABCU9603R).');
        return;
      }
      if (!city.trim()) {
        setValidationError('Please specify your dispatch city.');
        return;
      }
      if (!pincode.trim() || !/^\d{6}$/.test(pincode.trim())) {
        setValidationError('Please enter a valid 6-digit Indian PIN code.');
        return;
      }

      const extraData = {
        storeName: storeName.trim(),
        companyName: (companyName.trim() || storeName.trim()),
        ownerName: name.trim(),
        phone: phone.trim(),
        gstin: cleanGst,
        pan: cleanPan,
        city: city.trim(),
        state,
        pincode: pincode.trim(),
        status: 'PENDING'
      };

      const result = await register(name, email, password, 'ROLE_SUPPLIER', extraData);
      if (result.success) {
        navigate('/supplier');
      } else {
        setValidationError(result.message || 'Vendor registration failed.');
      }
    } else {
      // Customer registration
      const result = await register(name, email, password, 'ROLE_CUSTOMER');
      if (result.success) {
        navigate('/products');
      } else {
        setValidationError(result.message || 'Registration failed.');
      }
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '3.5rem 1.5rem 6rem', display: 'flex', justifyContent: 'center' }}>
      <div className="card" style={{ width: '100%', maxWidth: isVendor ? '680px' : '500px', padding: '2.5rem', transition: 'max-width 0.3s ease' }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
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
          <h1 style={{ fontSize: '1.85rem', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>
            {isVendor ? 'Register as Pan-India Vendor' : 'Join TEEZONE'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {isVendor
              ? 'Onboard your apparel mill or design house. Verified vendors get priority placement.'
              : 'Create an account to track orders, save addresses, and discover limited drops.'}
          </p>
        </div>

        {/* Role Switcher Tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
          background: 'var(--bg-secondary)',
          padding: '6px',
          borderRadius: '12px',
          marginBottom: '1.75rem',
          border: '1px solid var(--border-subtle)'
        }}>
          <button
            type="button"
            onClick={() => { setRole('ROLE_CUSTOMER'); setValidationError(''); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: !isVendor ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : 'transparent',
              color: !isVendor ? '#ffffff' : 'var(--text-secondary)',
              border: 'none',
              boxShadow: !isVendor ? '0 4px 12px rgba(99, 102, 241, 0.3)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <ShoppingBag size={16} /> Customer Account
          </button>

          <button
            type="button"
            onClick={() => { setRole('ROLE_SUPPLIER'); setValidationError(''); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: isVendor ? 'linear-gradient(135deg, #059669 0%, #0d9488 100%)' : 'transparent',
              color: isVendor ? '#ffffff' : 'var(--text-secondary)',
              border: 'none',
              boxShadow: isVendor ? '0 4px 12px rgba(5, 150, 105, 0.3)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <Store size={16} /> Vendor / Supplier
          </button>
        </div>

        {/* Vendor Verification Callout */}
        {isVendor && (
          <div style={{
            background: 'rgba(6, 182, 212, 0.08)',
            border: '1px solid rgba(6, 182, 212, 0.25)',
            borderRadius: '10px',
            padding: '1rem',
            marginBottom: '1.5rem',
            display: 'flex',
            gap: '12px'
          }}>
            <VerifiedBadge status="APPROVED" size="md" />
            <div style={{ fontSize: '0.825rem', lineHeight: 1.5 }}>
              <strong style={{ color: '#38bdf8', display: 'block', marginBottom: '2px' }}>
                Universal Admin Verification Policy
              </strong>
              <span style={{ color: 'var(--text-secondary)' }}>
                All supplier accounts are audited by the Universal Admin. Once your GSTIN and business documents are approved, your store receives the official blue verified tick badge (<VerifiedBadge status="APPROVED" size="sm" />) next to your store name across the platform.
              </span>
            </div>
          </div>
        )}

        {validationError && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: 'var(--accent-rose)',
            padding: '0.85rem',
            borderRadius: '8px',
            marginBottom: '1.25rem',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{validationError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* VENDOR SPECIFIC FIELDS */}
          {isVendor ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Store / Brand Name *</label>
                  <div style={{ position: 'relative' }}>
                    <Store size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      required
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      placeholder="e.g., Bharat Cotton Mills"
                      className="form-input"
                      style={{ paddingLeft: '2.5rem' }}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Registered Legal Entity</label>
                  <div style={{ position: 'relative' }}>
                    <Building2 size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g., Bharat Weaves Pvt Ltd"
                      className="form-input"
                      style={{ paddingLeft: '2.5rem' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Owner / Authorized Representative *</label>
                  <div style={{ position: 'relative' }}>
                    <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Rajesh V. Patel"
                      className="form-input"
                      style={{ paddingLeft: '2.5rem' }}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Contact Phone (+91) *</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="98450 12345"
                      className="form-input"
                      style={{ paddingLeft: '2.5rem' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Official GSTIN (15 Digits) *</label>
                  <div style={{ position: 'relative' }}>
                    <FileText size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      required
                      maxLength={15}
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value.toUpperCase())}
                      placeholder="29AABCU9603R1Z7"
                      className="form-input"
                      style={{ paddingLeft: '2.5rem', fontFamily: 'monospace', textTransform: 'uppercase' }}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Company PAN Number (10 Digits) *</label>
                  <div style={{ position: 'relative' }}>
                    <FileText size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      required
                      maxLength={10}
                      value={pan}
                      onChange={(e) => setPan(e.target.value.toUpperCase())}
                      placeholder="AABCU9603R"
                      className="form-input"
                      style={{ paddingLeft: '2.5rem', fontFamily: 'monospace', textTransform: 'uppercase' }}
                    />
                  </div>
                </div>
              </div>

              {/* Address / Location */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">State *</label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="form-input"
                    style={{ cursor: 'pointer' }}
                  >
                    {INDIAN_STATES.map(st => (
                      <option key={st} value={st} style={{ background: '#111827', color: '#ffffff' }}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Bengaluru"
                    className="form-input"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">PIN Code *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="560001"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Business Email Address *</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vendor@bharatcotton.in"
                    className="form-input"
                    style={{ paddingLeft: '2.5rem' }}
                  />
                </div>
              </div>
            </>
          ) : (
            /* CUSTOMER SPECIFIC FIELDS */
            <>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Aarav Sharma"
                    className="form-input"
                    style={{ paddingLeft: '2.5rem' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="aarav@example.com"
                    className="form-input"
                    style={{ paddingLeft: '2.5rem' }}
                  />
                </div>
              </div>
            </>
          )}

          {/* Passwords */}
          <div style={{ display: 'grid', gridTemplateColumns: isVendor ? '1fr 1fr' : '1fr', gap: isVendor ? '1rem' : '0' }}>
            <div className="form-group">
              <label className="form-label">Password *</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`btn ${isVendor ? 'btn-primary' : 'btn-primary'} btn-lg`}
            style={{
              width: '100%',
              marginTop: '0.75rem',
              marginBottom: '1.5rem',
              background: isVendor ? 'linear-gradient(135deg, #059669 0%, #0d9488 100%)' : undefined,
              borderColor: isVendor ? '#059669' : undefined
            }}
          >
            {loading ? 'Creating Account...' : (
              <>
                <UserPlus size={18} /> {isVendor ? 'Register Vendor (Submit for Verification)' : 'Create Customer Account'}
              </>
            )}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
            Sign In Here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
