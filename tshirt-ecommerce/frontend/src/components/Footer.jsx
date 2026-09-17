import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ShieldCheck, Truck, RefreshCw, Send } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{
      background: 'var(--bg-secondary)',
      borderTop: '1px solid var(--border-subtle)',
      marginTop: '5rem',
      padding: '4rem 0 2rem'
    }}>
      <div className="container">
        {/* Value Props Strip */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '2rem',
          paddingBottom: '3rem',
          marginBottom: '3rem',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(99, 102, 241, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-primary)'
            }}>
              <Truck size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Express Delivery</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Free shipping on orders over $70</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(16, 185, 129, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-emerald)'
            }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>100% Organic Cotton</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Heavyweight 240 GSM pre-shrunk</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(236, 72, 153, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-secondary)'
            }}>
              <RefreshCw size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Hassle-Free Returns</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>30-day money-back guarantee</p>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '2.5rem',
          marginBottom: '3.5rem'
        }}>
          {/* Brand Info */}
          <div style={{ gridColumn: 'span 1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #6366f1, #ec4899)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff'
              }}>
                <Sparkles size={18} />
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                TEEZONE
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Engineered luxury graphic apparel for developers, designers, and street-style enthusiasts. Built with premium heavyweight cotton and high-density screen prints.
            </p>
          </div>

          {/* Catalog */}
          <div>
            <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-primary)', marginBottom: '1rem' }}>
              Collections
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <li><Link to="/products?category=developer" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Developer Edition</Link></li>
              <li><Link to="/products?category=streetwear" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Streetwear Drops</Link></li>
              <li><Link to="/products?category=minimalist" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Minimalist Series</Link></li>
              <li><Link to="/products?sort=newest" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>New Arrivals</Link></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-primary)', marginBottom: '1rem' }}>
              Customer Support
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <li><Link to="/orders" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Track My Order</Link></li>
              <li><a href="#size-guide" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Size & Fit Guide</a></li>
              <li><a href="#shipping" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Shipping Policy</a></li>
              <li><a href="#contact" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Contact Us</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-primary)', marginBottom: '1rem' }}>
              Get Drop Alerts
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Subscribe to unlock 15% off your first drop and get early access to limited releases.
            </p>
            <form onSubmit={(e) => { e.preventDefault(); alert('Subscribed to drop alerts!'); }} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="email"
                required
                placeholder="Enter your email"
                className="form-input"
                style={{ padding: '0.6rem 0.8rem', fontSize: '0.85rem' }}
              />
              <button type="submit" className="btn btn-primary btn-sm" aria-label="Subscribe">
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '2rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          fontSize: '0.8125rem',
          color: 'var(--text-muted)'
        }}>
          <p>© {new Date().getFullYear()} TEEZONE Apparel Co. All rights reserved. Crafted for excellence.</p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
