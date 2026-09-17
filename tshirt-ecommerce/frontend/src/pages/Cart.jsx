import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, subtotal, shippingFee, estimatedTax, total } = useCart();
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <div className="container animate-fade-in" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <div className="card" style={{ maxWidth: '540px', margin: '0 auto', padding: '4rem 2rem' }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: 'var(--bg-tertiary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            color: 'var(--text-muted)'
          }}>
            <ShoppingBag size={36} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.75rem' }}>Your Bag is Empty</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.6 }}>
            You haven't added any graphic or developer tees to your shopping bag yet. Explore our latest drops.
          </p>
          <Link to="/products" className="btn btn-primary btn-lg">
            Browse All T-Shirts <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ padding: '3rem 1.5rem 6rem' }}>
      {/* Page Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 900, marginBottom: '0.35rem' }}>
            Shopping Bag
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Review your items and proceed to fast checkout.
          </p>
        </div>
        <button
          onClick={clearCart}
          className="btn btn-secondary btn-sm"
          style={{ color: 'var(--accent-rose)' }}
        >
          <Trash2 size={14} /> Clear Cart
        </button>
      </div>

      {/* Cart Grid: Items List + Order Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', alignItems: 'start' }}>
        {/* Cart Items List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {cartItems.map((item) => (
            <div
              key={`${item.id}-${item.selectedSize}-${item.selectedColor}`}
              className="card"
              style={{
                display: 'grid',
                gridTemplateColumns: '100px 1fr auto',
                gap: '1.5rem',
                alignItems: 'center',
                padding: '1.25rem'
              }}
            >
              {/* Product Thumbnail */}
              <Link to={`/products/${item.id}`} style={{ borderRadius: 'var(--radius-sm)', overflow: 'hidden', aspectRatio: '1/1', background: 'var(--bg-secondary)' }}>
                <img
                  src={item.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=300&q=80'}
                  alt={item.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Link>

              {/* Product Info */}
              <div>
                <Link to={`/products/${item.id}`}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                    {item.name}
                  </h3>
                </Link>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                  <span className="badge badge-primary">Size: {item.selectedSize}</span>
                  <span className="badge badge-secondary" style={{ background: 'var(--bg-tertiary)' }}>{item.selectedColor}</span>
                </div>

                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  ${item.price.toFixed(2)}
                </div>
              </div>

              {/* Quantity & Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1rem' }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  padding: '2px'
                }}>
                  <button
                    onClick={() => updateQuantity(item.id, item.selectedSize, item.selectedColor, item.quantity - 1)}
                    className="btn-icon"
                    style={{ padding: '6px' }}
                    aria-label="Decrease quantity"
                  >
                    <Minus size={14} />
                  </button>
                  <span style={{ width: '32px', textAlign: 'center', fontWeight: 700, fontSize: '0.9rem' }}>
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.selectedSize, item.selectedColor, item.quantity + 1)}
                    disabled={item.quantity >= item.maxStock}
                    className="btn-icon"
                    style={{ padding: '6px', opacity: item.quantity >= item.maxStock ? 0.4 : 1 }}
                    aria-label="Increase quantity"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontWeight: 800, fontSize: '1rem' }}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                  <button
                    onClick={() => removeFromCart(item.id, item.selectedSize, item.selectedColor)}
                    style={{ color: 'var(--text-muted)', transition: 'color 0.15s ease' }}
                    aria-label="Remove item"
                    title="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          <Link to="/products" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--accent-primary)', fontWeight: 600, fontSize: '0.9rem', marginTop: '0.5rem' }}>
            <ArrowLeft size={16} /> Continue Shopping
          </Link>
        </div>

        {/* Order Summary Card */}
        <aside className="card" style={{ padding: '2rem', position: 'sticky', top: '90px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
            Order Summary
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem', fontSize: '0.925rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Subtotal</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>${subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Estimated Shipping</span>
              <span style={{ color: shippingFee === 0 ? 'var(--accent-emerald)' : 'var(--text-primary)', fontWeight: 600 }}>
                {shippingFee === 0 ? 'FREE' : `$${shippingFee.toFixed(2)}`}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Estimated Sales Tax (8%)</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>${estimatedTax.toFixed(2)}</span>
            </div>
            {subtotal < 70 && (
              <p style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)', background: 'rgba(6, 182, 212, 0.1)', padding: '6px 10px', borderRadius: '6px' }}>
                Add ${(70 - subtotal).toFixed(2)} more to qualify for FREE Shipping!
              </p>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)', marginBottom: '2rem' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>Total</span>
            <span style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--accent-primary)' }}>
              ${total.toFixed(2)}
            </span>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginBottom: '1rem' }}
          >
            Proceed to Checkout <ArrowRight size={18} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <ShieldCheck size={16} color="var(--accent-emerald)" />
            <span>Encrypted 256-Bit SSL Checkout</span>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Cart;
