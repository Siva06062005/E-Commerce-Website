import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Flame, Shield, Terminal, ArrowUpRight } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { productService } from '../services/productService';
import { CATEGORIES } from '../utils/mockData';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const products = await productService.getAllProducts();
        setFeaturedProducts(products.slice(0, 6));
      } catch (e) {
        console.error('Failed to load featured products', e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section style={{
        position: 'relative',
        padding: '5rem 0 6rem',
        overflow: 'hidden',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'radial-gradient(circle at 50% -20%, rgba(99, 102, 241, 0.25) 0%, rgba(10, 14, 23, 0) 70%)'
      }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '3.5rem',
            alignItems: 'center'
          }}>
            {/* Hero Copy */}
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
                <span className="badge badge-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                  <Sparkles size={14} /> NEW SEASON DROP 2026
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>240 GSM Luxury Cotton</span>
              </div>

              <h1 style={{
                fontSize: 'clamp(2.5rem, 5vw, 4.25rem)',
                fontWeight: 900,
                lineHeight: 1.08,
                letterSpacing: '-0.03em',
                marginBottom: '1.5rem',
                background: 'linear-gradient(180deg, #ffffff 30%, #94a3b8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                ENGINEERED COMFORT.<br />
                UNCOMPROMISED DRAPE.
              </h1>

              <p style={{
                fontSize: '1.125rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                maxWidth: '540px',
                marginBottom: '2.25rem'
              }}>
                Discover premium heavyweight t-shirts crafted for developers, creators, and modern minimalists. Built to withstand endless terminal sessions and high-profile meetups.
              </p>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
                <Link to="/products" className="btn btn-primary btn-lg">
                  Shop All T-Shirts <ArrowRight size={18} />
                </Link>
                <Link to="/products?category=developer" className="btn btn-secondary btn-lg">
                  <Terminal size={18} /> Developer Series
                </Link>
              </div>

              {/* Quality Indicators */}
              <div style={{
                display: 'flex',
                gap: '2rem',
                flexWrap: 'wrap',
                paddingTop: '1.5rem',
                borderTop: '1px solid var(--border-subtle)'
              }}>
                <div>
                  <h4 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>100%</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Supima & Organic Cotton</p>
                </div>
                <div>
                  <h4 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>240 GSM</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Boxy Heavyweight Fit</p>
                </div>
                <div>
                  <h4 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>50+ Washes</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Zero Shrink & Fade Guarantee</p>
                </div>
              </div>
            </div>

            {/* Hero Visual Card */}
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'relative',
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px rgba(99, 102, 241, 0.25)',
                border: '1px solid var(--border-glass)'
              }}>
                <img
                  src="https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80"
                  alt="Doom Black Premium Graphic T-Shirt"
                  style={{ width: '100%', height: 'auto', display: 'block', transform: 'scale(1.02)' }}
                />
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: '2rem',
                  background: 'linear-gradient(to top, rgba(10, 14, 23, 0.95) 0%, rgba(10, 14, 23, 0) 100%)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end'
                }}>
                  <div>
                    <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>FEATURED DROP</span>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff' }}>Doom Black Heavyweight</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Brutalist typography • Oversized boxy cut</p>
                  </div>
                  <Link to="/products/1" className="btn btn-primary btn-sm">
                    View Drop <ArrowUpRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span className="badge badge-new" style={{ marginBottom: '0.5rem' }}>CURATED LINES</span>
              <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Explore By Category</h2>
            </div>
            <Link to="/products" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--accent-primary)', fontWeight: 600, fontSize: '0.95rem' }}>
              View All Categories <ArrowRight size={16} />
            </Link>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.5rem'
          }}>
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.id}`}
                className="card"
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  borderRadius: 'var(--radius-sm)',
                  overflow: 'hidden',
                  aspectRatio: '16/10',
                  marginBottom: '1rem',
                  position: 'relative'
                }}>
                  <img
                    src={cat.image}
                    alt={cat.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                  />
                  <span className="badge badge-primary" style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '0.7rem' }}>
                    {cat.itemCount}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.35rem' }}>{cat.name}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {cat.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section style={{ padding: '4rem 0 5rem', background: 'rgba(17, 24, 39, 0.4)', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span className="badge badge-sale" style={{ marginBottom: '0.5rem' }}>
                <Flame size={13} /> HIGH VELOCITY
              </span>
              <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Featured T-Shirts</h2>
            </div>
            <Link to="/products" className="btn btn-secondary btn-sm">
              Explore Store <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>
              Loading featured drops...
            </div>
          ) : (
            <div className="product-grid">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Call To Action Banner */}
      <section style={{ padding: '6rem 0' }}>
        <div className="container">
          <div className="glass-panel" style={{
            borderRadius: '24px',
            padding: '4rem 2rem',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 0 35px rgba(99, 102, 241, 0.15)'
          }}>
            <div style={{ maxWidth: '650px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
              <span className="badge badge-primary" style={{ marginBottom: '1rem' }}>THE TEEZONE SYNDICATE</span>
              <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, marginBottom: '1.25rem', letterSpacing: '-0.02em' }}>
                Level Up Your Everyday Uniform
              </h2>
              <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginBottom: '2.25rem', lineHeight: 1.6 }}>
                Every tee is backed by our zero-shrink promise, reinforced collar ribbing, and luxury double-needle stitching. Experience true heavyweight quality.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <Link to="/products" className="btn btn-primary btn-lg">
                  Shop All Collections <ArrowRight size={18} />
                </Link>
                <Link to="/register" className="btn btn-secondary btn-lg">
                  Create Member Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
