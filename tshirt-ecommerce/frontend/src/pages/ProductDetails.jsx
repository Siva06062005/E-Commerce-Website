import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, ShieldCheck, Truck, ArrowLeft, Plus, Minus, ShoppingBag, Zap, Check, AlertCircle } from 'lucide-react';
import { productService } from '../services/productService';
import { useCart } from '../context/CartContext';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // User Selections
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [sizeError, setSizeError] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await productService.getProductById(id);
        setProduct(data);
        // Default color and size
        setSelectedColor(data.color || 'Black');
        if (data.sizes && data.sizes.length > 0) {
          const inStockSize = data.sizes.find(s => s.stock > 0);
          if (inStockSize) {
            setSelectedSize(inStockSize.size);
          } else {
            setSelectedSize(data.sizes[0].size);
          }
        }
      } catch (err) {
        console.error('Failed to fetch product details:', err);
        setError('The requested T-shirt could not be found or has been discontinued.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <div className="card" style={{ maxWidth: '520px', margin: '0 auto', padding: '3rem 2rem' }}>
          <AlertCircle size={48} color="var(--accent-rose)" style={{ margin: '0 auto 1.5rem' }} />
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.75rem' }}>Product Not Found</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            {error || 'We could not locate this item.'}
          </p>
          <Link to="/products" className="btn btn-primary">
            <ArrowLeft size={16} /> Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  // Stock calculations
  const currentSizeObj = product.sizes?.find(s => s.size === selectedSize);
  const availableStock = currentSizeObj ? currentSizeObj.stock : (product.stock || 50);
  const price = typeof product.price === 'number' ? product.price : parseFloat(product.price || 0);
  const originalPrice = product.originalPrice || (price * 1.25);

  const handleAddToCart = () => {
    if (!selectedSize) {
      setSizeError(true);
      return;
    }
    setSizeError(false);
    addToCart(product, selectedSize, quantity, selectedColor);
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      setSizeError(true);
      return;
    }
    setSizeError(false);
    const success = addToCart(product, selectedSize, quantity, selectedColor);
    if (success) {
      navigate('/checkout');
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 1.5rem 6rem' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
        <Link to="/" style={{ color: 'var(--text-secondary)' }}>Home</Link>
        <span>/</span>
        <Link to="/products" style={{ color: 'var(--text-secondary)' }}>T-Shirts</Link>
        <span>/</span>
        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{product.name}</span>
      </div>

      {/* Main Details Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3.5rem', alignItems: 'start' }}>
        {/* Product Media Column */}
        <div>
          <div style={{
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-glass)',
            boxShadow: 'var(--shadow-lg)',
            aspectRatio: '1 / 1.15'
          }}>
            <img
              src={product.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80'}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          {/* Guarantee Badges */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
            <div className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Truck size={20} color="var(--accent-primary)" />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Dispatches in 24 hours</span>
            </div>
            <div className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldCheck size={20} color="var(--accent-emerald)" />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Zero-shrink guarantee</span>
            </div>
          </div>
        </div>

        {/* Product Information Column */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.75rem' }}>
            <span className="badge badge-primary">{product.category || 'Apparel'}</span>
            {product.badge && <span className="badge badge-sale">{product.badge}</span>}
          </div>

          <h1 style={{ fontSize: 'clamp(1.85rem, 3.5vw, 2.75rem)', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
            {product.name}
          </h1>

          {/* Rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
            <div className="star-rating">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill="#fbbf24" stroke="none" />
              ))}
            </div>
            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{product.rating || '4.9'}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>({product.reviewCount || 142} verified customer reviews)</span>
          </div>

          {/* Price */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '1.75rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--text-primary)' }}>
              ${price.toFixed(2)}
            </span>
            {originalPrice > price && (
              <span style={{ fontSize: '1.15rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                ${Number(originalPrice).toFixed(2)}
              </span>
            )}
            <span className="badge badge-success" style={{ marginLeft: 'auto' }}>
              In Stock & Ready to Ship
            </span>
          </div>

          {/* Description */}
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.7, marginBottom: '2rem' }}>
            {product.description}
          </p>

          {/* Color Selector */}
          <div style={{ marginBottom: '1.75rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
              Color: <span style={{ color: 'var(--text-primary)' }}>{selectedColor}</span>
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[product.color || 'Black', 'Heather Grey', 'Navy'].filter((v, i, a) => a.indexOf(v) === i).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedColor(c)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    background: selectedColor === c ? 'var(--bg-tertiary)' : 'transparent',
                    border: selectedColor === c ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                    color: selectedColor === c ? 'var(--text-primary)' : 'var(--text-secondary)'
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Size Selector */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                Select Size: {selectedSize && <span style={{ color: 'var(--accent-primary)' }}>{selectedSize}</span>}
              </label>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {availableStock > 0 ? (
                  <span style={{ color: availableStock < 10 ? 'var(--accent-amber)' : 'var(--accent-emerald)', fontWeight: 600 }}>
                    {availableStock} left in stock
                  </span>
                ) : (
                  <span style={{ color: 'var(--accent-rose)' }}>Out of stock</span>
                )}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {(product.sizes || [
                { size: 'S', stock: 10 },
                { size: 'M', stock: 20 },
                { size: 'L', stock: 15 },
                { size: 'XL', stock: 8 },
                { size: 'XXL', stock: 5 }
              ]).map((sz) => {
                const isSelected = selectedSize === sz.size;
                const isOutOfStock = sz.stock === 0;

                return (
                  <button
                    key={sz.size}
                    type="button"
                    disabled={isOutOfStock}
                    onClick={() => {
                      setSelectedSize(sz.size);
                      setSizeError(false);
                      if (quantity > sz.stock) setQuantity(1);
                    }}
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '10px',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: isSelected ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                      color: isSelected ? '#ffffff' : isOutOfStock ? 'var(--text-muted)' : 'var(--text-primary)',
                      border: isSelected ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                      opacity: isOutOfStock ? 0.4 : 1,
                      cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span>{sz.size}</span>
                  </button>
                );
              })}
            </div>

            {sizeError && (
              <p style={{ color: 'var(--accent-rose)', fontSize: '0.85rem', marginTop: '0.6rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <AlertCircle size={14} /> Please pick a size before adding to cart.
              </p>
            )}
          </div>

          {/* Quantity & CTA Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              {/* Quantity Picker */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                padding: '4px'
              }}>
                <button
                  type="button"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="btn-icon"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <Minus size={16} />
                </button>
                <span style={{ width: '42px', textAlign: 'center', fontWeight: 700, fontSize: '1rem' }}>
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(q => Math.min(availableStock, q + 1))}
                  disabled={quantity >= availableStock}
                  className="btn-icon"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Add to Cart */}
              <button
                type="button"
                onClick={handleAddToCart}
                className="btn btn-primary btn-lg"
                style={{ flex: 1 }}
              >
                <ShoppingBag size={18} /> Add to Cart
              </button>
            </div>

            {/* Buy Now Button */}
            <button
              type="button"
              onClick={handleBuyNow}
              className="btn btn-secondary btn-lg"
              style={{ width: '100%', borderColor: 'var(--accent-primary)', color: 'var(--text-primary)' }}
            >
              <Zap size={18} color="var(--accent-amber)" /> Buy Now with 1-Click Checkout
            </button>
          </div>

          {/* Fabric & Fit Details */}
          <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
              Fabric Specifications & Fit
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={14} color="var(--accent-emerald)" /> 240 GSM 100% Combed Compact Ring-Spun Cotton
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={14} color="var(--accent-emerald)" /> High-Density Screen Print / Soft-Hand Touch
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={14} color="var(--accent-emerald)" /> Pre-shrunk to maintain perfect fit after repeated washing
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={14} color="var(--accent-emerald)" /> Boxy streetwear cut with structured drop-shoulder
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
