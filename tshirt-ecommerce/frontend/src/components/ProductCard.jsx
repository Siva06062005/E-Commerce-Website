import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingBag, Eye } from 'lucide-react';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0]?.size || 'M');
  const [isHovered, setIsHovered] = useState(false);

  const price = typeof product.price === 'number' ? product.price : parseFloat(product.price || 0);
  const originalPrice = product.originalPrice || (price * 1.25);
  const totalStock = product.totalStock ?? (product.sizes?.reduce((sum, s) => sum + s.stock, 0) || product.stock || 50);

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, selectedSize, 1, product.color);
  };

  const getBadgeClass = (badge) => {
    switch (badge?.toUpperCase()) {
      case 'BESTSELLER': return 'badge-primary';
      case 'HOT': return 'badge-sale';
      case 'NEW DROP':
      case 'NEW': return 'badge-new';
      case 'LIMITED': return 'badge-warning';
      default: return 'badge-primary';
    }
  };

  return (
    <div
      className="card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        padding: '0.85rem',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        transform: isHovered ? 'translateY(-4px)' : 'none',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease'
      }}
    >
      {/* Badge Overlay */}
      {product.badge && (
        <span
          className={`badge ${getBadgeClass(product.badge)}`}
          style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 10 }}
        >
          {product.badge}
        </span>
      )}

      {/* Stock warning */}
      {totalStock < 15 && totalStock > 0 && (
        <span
          className="badge badge-warning"
          style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10, fontSize: '0.68rem' }}
        >
          Only {totalStock} Left
        </span>
      )}

      {/* Product Image Link */}
      <Link
        to={`/products/${product.id}`}
        style={{
          borderRadius: 'var(--radius-sm)',
          overflow: 'hidden',
          aspectRatio: '1 / 1.15',
          background: 'var(--bg-secondary)',
          display: 'block',
          position: 'relative'
        }}
      >
        <img
          src={product.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'}
          alt={product.name}
          loading="lazy"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: isHovered ? 'scale(1.06)' : 'scale(1.0)',
            transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        />

        {/* Quick View overlay indicator */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(10, 14, 23, 0.4)',
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <span className="btn btn-secondary btn-sm" style={{ backdropFilter: 'blur(8px)' }}>
            <Eye size={15} /> View Details
          </span>
        </div>
      </Link>

      {/* Info Section */}
      <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent-primary)', fontWeight: 700 }}>
            {product.category || 'T-Shirt'}
          </span>
          <div className="star-rating" style={{ fontSize: '0.75rem' }}>
            <Star size={13} fill="#fbbf24" stroke="none" />
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{product.rating || '4.9'}</span>
            <span style={{ color: 'var(--text-muted)' }}>({product.reviewCount || 42})</span>
          </div>
        </div>

        <Link to={`/products/${product.id}`}>
          <h3 style={{
            fontSize: '1.05rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: '0.4rem',
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {product.name}
          </h3>
        </Link>

        <p style={{
          fontSize: '0.8rem',
          color: 'var(--text-secondary)',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          marginBottom: '0.85rem'
        }}>
          {product.description}
        </p>

        {/* Size Selection Pill Group */}
        <div style={{ display: 'flex', gap: '5px', marginBottom: '1rem', flexWrap: 'wrap' }}>
          {(product.sizes || [{ size: 'S' }, { size: 'M' }, { size: 'L' }, { size: 'XL' }]).map((s) => (
            <button
              key={s.size}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setSelectedSize(s.size);
              }}
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: '4px',
                background: selectedSize === s.size ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                color: selectedSize === s.size ? '#ffffff' : 'var(--text-secondary)',
                border: selectedSize === s.size ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                transition: 'all 0.15s ease'
              }}
            >
              {s.size}
            </button>
          ))}
        </div>

        {/* Price & Quick Add Button */}
        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
          <div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Rs.{price.toFixed(2)}
            </span>
            {originalPrice > price && (
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'line-through', marginLeft: '6px' }}>
                ${Number(originalPrice).toFixed(2)}
              </span>
            )}
          </div>

          <button
            onClick={handleQuickAdd}
            className="btn btn-primary btn-sm"
            style={{ padding: '0.45rem 0.85rem' }}
            aria-label={`Add Rs.{product.name} to cart`}
          >
            <ShoppingBag size={14} /> Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
