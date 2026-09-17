import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { CheckCircle2, Package, Truck, ArrowRight, Printer } from 'lucide-react';
import { orderService } from '../services/orderService';

const OrderConfirmation = () => {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!order);

  useEffect(() => {
    if (!order) {
      const fetchOrder = async () => {
        try {
          const data = await orderService.getOrderById(id);
          setOrder(data);
        } catch (e) {
          console.error('Could not load order:', e);
        } finally {
          setLoading(false);
        }
      };
      fetchOrder();
    }
  }, [id, order]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading order receipt...</p>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ padding: '4rem 1.5rem 6rem', display: 'flex', justifyContent: 'center' }}>
      <div className="card" style={{ width: '100%', maxWidth: '640px', padding: '3rem 2.5rem' }}>
        {/* Success Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '2px solid rgba(16, 185, 129, 0.4)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-emerald)',
            marginBottom: '1rem'
          }}>
            <CheckCircle2 size={36} />
          </div>
          <span className="badge badge-success" style={{ marginBottom: '0.5rem' }}>ORDER CONFIRMED</span>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem' }}>
            Thank You For Your Order!
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Order identifier: <strong style={{ color: 'var(--accent-primary)' }}>#{order?.id || id}</strong>
          </p>
        </div>

        {/* Status Tracker */}
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: '12px',
          padding: '1.25rem',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '2rem'
        }}>
          <Truck size={24} color="var(--accent-primary)" />
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Estimated Delivery in 2-4 Business Days</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Current Status: <strong style={{ color: 'var(--accent-cyan)' }}>{order?.status || 'PENDING'}</strong>
            </p>
          </div>
        </div>

        {/* Order Details */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Items Ordered
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {(order?.items || []).map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{item.productName || item.name}</h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Size: {item.size} • Color: {item.color} • Qty: {item.quantity}
                  </span>
                </div>
                <span style={{ fontWeight: 700 }}>
                  ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping summary */}
        {order?.shippingAddress && (
          <div style={{ background: 'var(--bg-secondary)', padding: '1rem 1.25rem', borderRadius: '8px', marginBottom: '2rem', fontSize: '0.85rem' }}>
            <strong style={{ display: 'block', color: 'var(--text-primary)', marginBottom: '4px' }}>Shipping To:</strong>
            <p style={{ color: 'var(--text-secondary)' }}>{order.customerName}</p>
            <p style={{ color: 'var(--text-secondary)' }}>{order.shippingAddress}</p>
            <p style={{ color: 'var(--text-secondary)' }}>Phone: {order.shippingPhone}</p>
          </div>
        )}

        {/* Total breakdown */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', marginBottom: '2rem' }}>
          <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>Total Paid</span>
          <span style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--accent-primary)' }}>
            ${(order?.totalAmount || 0).toFixed(2)}
          </span>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/products" className="btn btn-primary" style={{ flex: 1 }}>
            Continue Shopping <ArrowRight size={16} />
          </Link>
          <button onClick={() => window.print()} className="btn btn-secondary">
            <Printer size={16} /> Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
