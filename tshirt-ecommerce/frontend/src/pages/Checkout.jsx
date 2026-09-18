import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Banknote,
  Smartphone,
  CheckCircle,
  ArrowLeft,
  Building,
  QrCode,
  MapPin,
  AlertCircle
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';
import {
  formatINR,
  INDIAN_STATES,
  checkPincodeServiceability,
  validateIndianPhone,
  calculateGST
} from '../utils/indianCommerceUtils';

const Checkout = () => {
  const { cartItems, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [shippingInfo, setShippingInfo] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    houseFlat: '',
    streetArea: '',
    landmark: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560001',
    paymentMethod: 'UPI', // 'UPI', 'COD', 'CARD', 'NETBANKING'
    upiId: 'user@okhdfcbank'
  });

  const [pincodeStatus, setPincodeStatus] = useState(() => checkPincodeServiceability('560001'));
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

    if (name === 'pincode') {
      if (value.length === 6) {
        const result = checkPincodeServiceability(value);
        setPincodeStatus(result);
        if (result.valid && result.city) {
          setShippingInfo(prev => ({
            ...prev,
            pincode: value,
            city: result.city,
            state: result.state
          }));
        }
      } else {
        setPincodeStatus({ valid: false, message: 'Enter 6-digit Indian PIN code' });
      }
    }
  };

  // Indian GST & Delivery Calculation
  const isInterState = shippingInfo.state !== 'Karnataka'; // Warehouse origin simulated in Bengaluru, KA
  const gstBreakdown = calculateGST(subtotal, 12, isInterState);
  const shippingFee = subtotal >= 999 ? 0 : 99;
  const totalAmount = subtotal + gstBreakdown.totalTax + shippingFee;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError('');

    if (!shippingInfo.fullName.trim()) {
      setError('Please provide recipient full name.');
      return;
    }

    if (!validateIndianPhone(shippingInfo.phone)) {
      setError('Please provide a valid 10-digit Indian mobile number (+91).');
      return;
    }

    if (!shippingInfo.pincode || shippingInfo.pincode.length !== 6) {
      setError('Please provide a valid 6-digit Indian PIN code.');
      return;
    }

    const fullAddress = `${shippingInfo.houseFlat}, ${shippingInfo.streetArea}, Landmark: ${shippingInfo.landmark || 'N/A'}, ${shippingInfo.city}, ${shippingInfo.state} - ${shippingInfo.pincode}, India`;

    try {
      setLoading(true);
      const orderPayload = {
        userId: user?.id || null,
        customerName: shippingInfo.fullName,
        customerEmail: shippingInfo.email || (user ? user.email : 'guest@teezone.in'),
        shippingPhone: '+91 ' + shippingInfo.phone.replace(/^(\+?91)/, '').trim(),
        shippingAddress: fullAddress,
        paymentMethod: shippingInfo.paymentMethod,
        items: cartItems.map(item => ({
          productId: item.id,
          productName: item.name,
          size: item.selectedSize,
          color: item.selectedColor,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          hsnCode: '61091000',
          gstRate: 12
        })),
        subtotal,
        shippingFee,
        tax: gstBreakdown.totalTax,
        totalAmount
      };

      const createdOrder = await orderService.createOrder(orderPayload);
      clearCart();
      navigate(`/order-confirmation/${createdOrder.id}`, { state: { order: createdOrder } });
    } catch (err) {
      console.error('Checkout error:', err);
      setError('Failed to place order. Please check inputs and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '3rem 1.5rem 6rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 900, marginBottom: '0.35rem' }}>
          Checkout & GST Invoice
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Pan-India express delivery • Standard Indian GST 12% apparel invoicing
        </p>
      </div>

      <form onSubmit={handlePlaceOrder}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', lg: '1fr 380px', gap: '2.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {error && (
              <div style={{
                padding: '1rem',
                borderRadius: '8px',
                background: 'rgba(244, 63, 94, 0.15)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                color: 'var(--accent-rose)',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            {/* Indian Delivery Address */}
            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={20} color="var(--accent-primary)" /> Delivery Destination (India)
                </h2>
                <span className="badge badge-primary">Standard Indian Address</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    required
                    name="fullName"
                    value={shippingInfo.fullName}
                    onChange={handleInputChange}
                    placeholder="e.g. Aarav Sharma"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">10-Digit Mobile Number (+91) *</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ padding: '0.75rem 0.9rem', background: 'var(--bg-tertiary)', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 700 }}>
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      name="phone"
                      value={shippingInfo.phone}
                      onChange={handleInputChange}
                      placeholder="98765 43210"
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Flat / House No. / Building *</label>
                  <input
                    type="text"
                    required
                    name="houseFlat"
                    value={shippingInfo.houseFlat}
                    onChange={handleInputChange}
                    placeholder="e.g. Flat 402, Royal Residency"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Street / Colony / Locality *</label>
                  <input
                    type="text"
                    required
                    name="streetArea"
                    value={shippingInfo.streetArea}
                    onChange={handleInputChange}
                    placeholder="e.g. 100 Feet Road, Indiranagar"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Landmark (Optional)</label>
                  <input
                    type="text"
                    name="landmark"
                    value={shippingInfo.landmark}
                    onChange={handleInputChange}
                    placeholder="e.g. Near Metro Station"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">6-Digit PIN Code *</label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    name="pincode"
                    value={shippingInfo.pincode}
                    onChange={handleInputChange}
                    placeholder="560001"
                    className="form-input"
                  />
                  {pincodeStatus && (
                    <div style={{
                      fontSize: '0.8rem',
                      marginTop: '0.35rem',
                      color: pincodeStatus.serviceable ? 'var(--accent-emerald)' : 'var(--accent-rose)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}>
                      <CheckCircle size={13} /> {pincodeStatus.message}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">City / District *</label>
                  <input
                    type="text"
                    required
                    name="city"
                    value={shippingInfo.city}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">State / Union Territory *</label>
                  <select
                    name="state"
                    value={shippingInfo.state}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    {INDIAN_STATES.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Indian Payment Modes */}
            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CreditCard size={20} color="var(--accent-primary)" /> Payment Methods (India)
                </h2>
                <span className="badge badge-success">256-Bit SSL Encrypted</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* UPI Option */}
                <label style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  padding: '1.25rem',
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
                    style={{ marginTop: '4px', accentColor: 'var(--accent-primary)' }}
                  />
                  <Smartphone size={24} color="var(--accent-secondary)" />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <strong style={{ fontSize: '1rem' }}>UPI (Google Pay, PhonePe, Paytm, QR)</strong>
                      <span className="badge badge-primary">RECOMMENDED</span>
                    </div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Zero transaction fee • Instant UPI autopay or dynamic QR code scan
                    </span>

                    {shippingInfo.paymentMethod === 'UPI' && (
                      <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--bg-primary)', borderRadius: '8px' }}>
                        <label className="form-label" style={{ fontSize: '0.8rem' }}>Enter UPI VPA / ID</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. mobile@upi or username@okaxis"
                          value={shippingInfo.upiId}
                          onChange={e => setShippingInfo({ ...shippingInfo, upiId: e.target.value })}
                        />
                      </div>
                    )}
                  </div>
                </label>

                {/* COD Option */}
                <label style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  padding: '1.25rem',
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
                    style={{ marginTop: '4px', accentColor: 'var(--accent-primary)' }}
                  />
                  <Banknote size={24} color="var(--accent-emerald)" />
                  <div style={{ flex: 1 }}>
                    <strong style={{ fontSize: '1rem', display: 'block', marginBottom: '0.25rem' }}>
                      Cash on Delivery (COD)
                    </strong>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Pay with cash or UPI QR at your doorstep upon delivery
                    </span>
                  </div>
                </label>

                {/* Cards Option */}
                <label style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  padding: '1.25rem',
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
                    style={{ marginTop: '4px', accentColor: 'var(--accent-primary)' }}
                  />
                  <CreditCard size={24} color="var(--accent-primary)" />
                  <div style={{ flex: 1 }}>
                    <strong style={{ fontSize: '1rem', display: 'block', marginBottom: '0.25rem' }}>
                      RuPay / Credit / Debit Cards
                    </strong>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      All Indian RuPay, Visa, and Mastercard cards accepted with OTP verification
                    </span>
                  </div>
                </label>

                {/* Net Banking Option */}
                <label style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  padding: '1.25rem',
                  borderRadius: '10px',
                  background: shippingInfo.paymentMethod === 'NETBANKING' ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-secondary)',
                  border: shippingInfo.paymentMethod === 'NETBANKING' ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                  cursor: 'pointer'
                }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="NETBANKING"
                    checked={shippingInfo.paymentMethod === 'NETBANKING'}
                    onChange={handleInputChange}
                    style={{ marginTop: '4px', accentColor: 'var(--accent-primary)' }}
                  />
                  <Building size={24} color="var(--accent-cyan)" />
                  <div style={{ flex: 1 }}>
                    <strong style={{ fontSize: '1rem', display: 'block', marginBottom: '0.25rem' }}>
                      Net Banking
                    </strong>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Direct checkout via SBI, HDFC, ICICI, Axis, PNB and 50+ Indian banks
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Order Review & GST Breakdown */}
          <aside className="card" style={{ padding: '2rem', height: 'fit-content', position: 'sticky', top: '90px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
              Your Bag ({cartItems.reduce((s, i) => s + i.quantity, 0)} Items)
            </h2>

            {/* Mini Items List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '240px', overflowY: 'auto', marginBottom: '1.5rem' }}>
              {cartItems.map((item) => (
                <div key={`${item.id}-${item.selectedSize}`} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{ width: '48px', height: '48px', borderRadius: '6px', objectFit: 'cover' }}
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
                    {formatINR(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* GST Tax Breakdown Card */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Taxable Value (Items)</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{formatINR(subtotal)}</span>
              </div>

              {!isInterState ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>CGST (6%)</span>
                    <span>{formatINR(gstBreakdown.cgst)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>SGST (6%)</span>
                    <span>{formatINR(gstBreakdown.sgst)}</span>
                  </div>
                </>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>IGST (12% Interstate)</span>
                  <span>{formatINR(gstBreakdown.igst)}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Delivery Logistics</span>
                <span style={{ color: shippingFee === 0 ? 'var(--accent-emerald)' : 'var(--text-primary)', fontWeight: 600 }}>
                  {shippingFee === 0 ? 'FREE (Orders > ₹999)' : formatINR(shippingFee)}
                </span>
              </div>
            </div>

            {/* Total Invoiced */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', marginBottom: '1.75rem' }}>
              <div>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, display: 'block' }}>Total Invoiced</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Includes all Indian taxes</span>
              </div>
              <span style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--accent-primary)' }}>
                {formatINR(totalAmount)}
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
                  <ShieldCheck size={18} /> Confirm Order & Pay {formatINR(totalAmount)}
                </>
              )}
            </button>

            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Compliant with GSTIN 29AABCU9603R1Z7. HSN 61091000.
            </p>
          </aside>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
