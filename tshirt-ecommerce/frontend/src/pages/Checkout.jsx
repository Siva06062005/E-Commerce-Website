import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Truck, CreditCard, Banknote, Smartphone, CheckCircle, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';

const Checkout = () => {
  const { cartItems, subtotal, shippingFee, estimatedTax, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [shippingInfo, setShippingInfo] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'United States',
    paymentMethod: 'CARD' // 'CARD', 'COD', 'UPI'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (cartItems.length === 0) {
    return (
      <div className="container animate-fade-in" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <div className="card" style={{ maxWidth: '480px', margin: '0 auto', padding: '3rem 2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>No Items in Bag</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Please add at least one T-shirt before proceeding to checkout.
          </p>
          <Link to="/products" className="btn btn-primary">
            <ArrowLeft size={16} /> Browse T-Shirts
          </Link>
        </div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError('');

    if (!shippingInfo.fullName || !shippingInfo.address || !shippingInfo.phone || !shippingInfo.city) {
      setError('Please fill in all required shipping fields.');
      return;
    }

    try {
      setLoading(true);
      const orderPayload = {
        userId: user?.id || null,
        customerName: shippingInfo.fullName,
        customerEmail: shippingInfo.email || (user ? user.email : 'guest@example.com'),
        shippingPhone: shippingInfo.phone,
        shippingAddress: `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.postalCode}, ${shippingInfo.country}`,
        paymentMethod: shippingInfo.paymentMethod,
        items: cartItems.map(item => ({
          productId: item.id,
          productName: item.name,
          size: item.selectedSize,
          color: item.selectedColor,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        subtotal,
        shippingFee,
        tax: estimatedTax,
        totalAmount: total
      };

      const createdOrder = await orderService.createOrder(orderPayload);
      clearCart();
      navigate(`/order-confirmation/${createdOrder.id}`, { state: { order: createdOrder } });
    } catch (err) {
      console.error('Checkout error:', err);
      setError('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '3rem 1.5rem 6rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 900, marginBottom: '0.35rem' }}>
          Checkout
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Enter your delivery destination and select your preferred payment method.
        </p>
      </div>

      {error && (
        <div style={{ background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', color: 'var(--accent-rose)', padding: '0.85rem', borderRadius: '8px', marginBottom: '2rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handlePlaceOrder}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', alignItems: 'start' }}>
          {/* Left Column: Shipping & Payment */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Delivery Info */}
            <div className="card" style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck size={20} color="var(--accent-primary)" /> Shipping Address
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    required
                    name="fullName"
                    value={shippingInfo.fullName}
                    onChange={handleInputChange}
                    placeholder="Recipient's Name"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    required
                    name="email"
                    value={shippingInfo.email}
                    onChange={handleInputChange}
                    placeholder="email@example.com"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    name="phone"
                    value={shippingInfo.phone}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 019-2834"
                    className="form-input"
                  />
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Street Address *</label>
                  <input
                    type="text"
                    required
                    name="address"
                    value={shippingInfo.address}
                    onChange={handleInputChange}
                    placeholder="123 Tech Boulevard, Suite 400"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">City *</label>
                  <input
                    type="text"
                    required
                    name="city"
                    value={shippingInfo.city}
                    onChange={handleInputChange}
                    placeholder="San Francisco"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Postal / ZIP Code *</label>
                  <input
                    type="text"
                    required
                    name="postalCode"
                    value={shippingInfo.postalCode}
                    onChange={handleInputChange}
                    placeholder="94105"
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="card" style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CreditCard size={20} color="var(--accent-primary)" /> Payment Method
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Credit Card Option */}
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  borderRadius: '10px',
                  background: shippingInfo.paymentMethod === 'CARD' ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-secondary)',
                  border: shippingInfo.paymentMethod === 'CARD' ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                  cursor: 'pointer'
                }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="CARD"
                    checked={shippingInfo.paymentMethod === 'CARD'}
                    onChange={handleInputChange}
                    style={{ accentColor: 'var(--accent-primary)' }}
                  />
                  <CreditCard size={22} color="var(--accent-primary)" />
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.95rem' }}>Credit / Debit Card</strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Instant secure authorization (Visa, Mastercard, Amex)</span>
                  </div>
                </label>

                {/* Cash on Delivery Option */}
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  borderRadius: '10px',
                  background: shippingInfo.paymentMethod === 'COD' ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-secondary)',
                  border: shippingInfo.paymentMethod === 'COD' ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                  cursor: 'pointer'
                }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={shippingInfo.paymentMethod === 'COD'}
                    onChange={handleInputChange}
                    style={{ accentColor: 'var(--accent-primary)' }}
                  />
                  <Banknote size={22} color="var(--accent-emerald)" />
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.95rem' }}>Cash on Delivery</strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Pay cash upon courier arrival</span>
                  </div>
                </label>

                {/* UPI Option */}
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  borderRadius: '10px',
                  background: shippingInfo.paymentMethod === 'UPI' ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-secondary)',
                  border: shippingInfo.paymentMethod === 'UPI' ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                  cursor: 'pointer'
                }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="UPI"
                    checked={shippingInfo.paymentMethod === 'UPI'}
                    onChange={handleInputChange}
                    style={{ accentColor: 'var(--accent-primary)' }}
                  />
                  <Smartphone size={22} color="var(--accent-secondary)" />
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.95rem' }}>UPI / Digital Wallet</strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Scan QR or pay via wallet app</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Order Review */}
          <aside className="card" style={{ padding: '2rem', position: 'sticky', top: '90px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
              Your Order ({cartItems.reduce((s, i) => s + i.quantity, 0)} Items)
            </h2>

            {/* Items Mini List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '280px', overflowY: 'auto', marginBottom: '1.5rem', paddingRight: '4px' }}>
              {cartItems.map((item) => (
                <div key={`${item.id}-${item.selectedSize}`} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{ width: '50px', height: '50px', borderRadius: '6px', objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.name}
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Size: {item.selectedSize} • Qty: {item.quantity}
                    </span>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Subtotal</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>${subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Shipping</span>
                <span style={{ color: shippingFee === 0 ? 'var(--accent-emerald)' : 'var(--text-primary)', fontWeight: 600 }}>
                  {shippingFee === 0 ? 'FREE' : `$${shippingFee.toFixed(2)}`}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Sales Tax (8%)</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>${estimatedTax.toFixed(2)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', marginBottom: '1.75rem' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>Total Due</span>
              <span style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--accent-primary)' }}>
                ${total.toFixed(2)}
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginBottom: '1rem' }}
            >
              {loading ? 'Processing Order...' : (
                <>
                  <CheckCircle size={18} /> Place Order Now
                </>
              )}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <ShieldCheck size={16} color="var(--accent-emerald)" />
              <span>30-Day Money-Back Guarantee & Free Returns</span>
            </div>
          </aside>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
