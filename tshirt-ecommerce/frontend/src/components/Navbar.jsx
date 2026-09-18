import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, ShieldAlert, LogOut, Menu, X, Package, Layers, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { itemCount } = useCart();
  const { user, isAdmin, isSupplier, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/login');
  };

  return (
    <header className="glass-nav">
      <div className="container">
        <div className="navbar-container">
          {/* Logo */}
          <Link to="/" className="brand-logo" onClick={() => setMobileOpen(false)}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
            }}>
              <Sparkles size={20} />
            </div>
            <span>TEEZONE</span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav>
            <ul className="nav-links">
              <li>
                <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink to="/products" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  T-Shirts
                </NavLink>
              </li>
              <li>
                <NavLink to="/products?category=developer" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  Collections
                </NavLink>
              </li>
              <li>
                <NavLink to="/products?sort=newest" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  New Arrivals
                </NavLink>
              </li>
              {isSupplier && (
                <li>
                  <NavLink to="/supplier" className="badge badge-success" style={{ textDecoration: 'none', marginLeft: '0.5rem', padding: '0.35rem 0.75rem' }}>
                    <Layers size={13} /> Supplier Portal
                  </NavLink>
                </li>
              )}
              {isAdmin && (
                <li>
                  <NavLink to="/admin" className="badge badge-sale" style={{ textDecoration: 'none', marginLeft: '0.5rem', padding: '0.35rem 0.75rem' }}>
                    <ShieldAlert size={13} /> Admin Portal
                  </NavLink>
                </li>
              )}
            </ul>
          </nav>

          {/* Action Icons */}
          <div className="nav-actions">
            {/* User Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                className="btn-icon btn-secondary"
                aria-label="User Account"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                style={{ borderRadius: '50%', width: '40px', height: '40px' }}
              >
                <User size={19} />
              </button>

              {userMenuOpen && (
                <div
                  className="glass-panel"
                  style={{
                    position: 'absolute',
                    top: '52px',
                    right: 0,
                    width: '230px',
                    borderRadius: '12px',
                    padding: '0.75rem',
                    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.6)',
                    zIndex: 100,
                    animation: 'fadeIn 0.2s ease'
                  }}
                >
                  {user ? (
                    <>
                      <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '0.5rem' }}>
                        <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{user.name}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user.email}</p>
                        {isAdmin && <span className="badge badge-primary" style={{ marginTop: '4px' }}>ADMIN</span>}
                        {isSupplier && <span className="badge badge-success" style={{ marginTop: '4px' }}>SUPPLIER</span>}
                      </div>
                      <Link
                        to="/orders"
                        onClick={() => setUserMenuOpen(false)}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.6rem 0.75rem', borderRadius: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}
                      >
                        <Package size={16} /> My Orders & Tracking
                      </Link>
                      {isSupplier && (
                        <Link
                          to="/supplier"
                          onClick={() => setUserMenuOpen(false)}
                          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.6rem 0.75rem', borderRadius: '6px', fontSize: '0.85rem', color: 'var(--accent-emerald)' }}
                        >
                          <Layers size={16} /> Supplier Dashboard
                        </Link>
                      )}
                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.6rem 0.75rem', borderRadius: '6px', fontSize: '0.85rem', color: 'var(--accent-primary)' }}
                        >
                          <ShieldAlert size={16} /> Admin Portal
                        </Link>
                      )}
                      {!isSupplier && !isAdmin && (
                        <Link
                          to="/supplier"
                          onClick={() => setUserMenuOpen(false)}
                          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.6rem 0.75rem', borderRadius: '6px', fontSize: '0.85rem', color: 'var(--accent-cyan)' }}
                        >
                          <Layers size={16} /> Supplier Mode
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '0.6rem 0.75rem', borderRadius: '6px', fontSize: '0.85rem', color: 'var(--accent-rose)', marginTop: '4px' }}
                      >
                        <LogOut size={16} /> Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setUserMenuOpen(false)}
                        className="btn btn-primary btn-sm"
                        style={{ width: '100%', marginBottom: '0.5rem', textDecoration: 'none' }}
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setUserMenuOpen(false)}
                        className="btn btn-secondary btn-sm"
                        style={{ width: '100%', textDecoration: 'none' }}
                      >
                        Create Account
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Cart Button */}
            <Link
              to="/cart"
              className="btn-icon btn-secondary cart-btn-relative"
              aria-label="View Shopping Cart"
              style={{ borderRadius: '50%', width: '40px', height: '40px' }}
            >
              <ShoppingBag size={19} />
              {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              className="btn-icon btn-secondary mobile-menu-btn"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileOpen && (
          <div
            className="glass-panel"
            style={{
              padding: '1.25rem',
              borderRadius: '12px',
              marginBottom: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}
          >
            <NavLink
              to="/"
              onClick={() => setMobileOpen(false)}
              style={{ padding: '0.6rem', fontWeight: 600, color: 'var(--text-primary)' }}
            >
              Home
            </NavLink>
            <NavLink
              to="/products"
              onClick={() => setMobileOpen(false)}
              style={{ padding: '0.6rem', fontWeight: 600, color: 'var(--text-primary)' }}
            >
              All T-Shirts
            </NavLink>
            <NavLink
              to="/products?category=developer"
              onClick={() => setMobileOpen(false)}
              style={{ padding: '0.6rem', fontWeight: 600, color: 'var(--text-primary)' }}
            >
              Developer Series
            </NavLink>
            <NavLink
              to="/products?sort=newest"
              onClick={() => setMobileOpen(false)}
              style={{ padding: '0.6rem', fontWeight: 600, color: 'var(--text-primary)' }}
            >
              New Arrivals
            </NavLink>
            {isAdmin && (
              <NavLink
                to="/admin"
                onClick={() => setMobileOpen(false)}
                style={{ padding: '0.6rem', fontWeight: 700, color: 'var(--accent-secondary)' }}
              >
                Admin Portal
              </NavLink>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
