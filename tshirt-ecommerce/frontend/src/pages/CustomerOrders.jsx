import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, Truck, CheckCircle, XCircle, ArrowRight, ShoppingBag } from 'lucide-react';
import { orderService } from '../services/orderService';
import { useAuth } from '../context/AuthContext';

const getStatusBadge = (status) => {
  switch (status?.toUpperCase()) {
    case 'PENDING':
      return <span className="badge badge-warning"><Clock size={12} /> Pending</span>;
    case 'CONFIRMED':
    case 'PROCESSING':
      return <span className="badge badge-primary"><Truck size={12} /> {status}</span>;
    case 'SHIPPED':
      return <span className="badge badge-new"><Truck size={12} /> Shipped</span>;
    case 'DELIVERED':
      return <span className="badge badge-success"><CheckCircle size={12} /> Delivered</span>;
    case 'CANCELLED':
      return <span className="badge badge-sale"><XCircle size={12} /> Cancelled</span>;
    default:
      return <span className="badge badge-primary">{status}</span>;
  }
};

const CustomerOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await orderService.getMyOrders();
        // Filter by current user if logged in and order has userId
        if (user?.id) {
          const userOrders = data.filter(o => !o.userId || o.userId === user.id);
          setOrders(userOrders);
        } else {
          setOrders(data);
        }
      } catch (err) {
        console.error('Failed to load orders', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading your orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container animate-fade-in" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <div className="card" style={{ maxWidth: '480px', margin: '0 auto', padding: '3.5rem 2rem' }}>
          <Package size={48} color="var(--text-muted)" style={{ margin: '0 auto 1.5rem' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>No Orders Found</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.75rem' }}>
            You haven't placed any TEEZONE orders yet.
          </p>
          <Link to="/products" className="btn btn-primary">
            Explore T-Shirts <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ padding: '3rem 1.5rem 6rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 900, marginBottom: '0.35rem' }}>
          My Orders
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Track delivery status and view order receipts.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {orders.map((order) => (
          <div key={order.id} className="card" style={{ padding: '1.75rem' }}>
            {/* Header info bar */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid var(--border-subtle)',
              paddingBottom: '1rem',
              marginBottom: '1.25rem',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Order Identifier</span>
                <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>#{order.id}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Placed Date</span>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Recent'}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Total</span>
                <strong style={{ fontSize: '1.1rem', color: 'var(--accent-primary)' }}>
                  ${(order.totalAmount || 0).toFixed(2)}
                </strong>
              </div>
              <div>
                {getStatusBadge(order.status)}
              </div>
            </div>

            {/* Items inside order */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {(order.items || []).map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.productName || item.name}
                      style={{ width: '48px', height: '48px', borderRadius: '6px', objectFit: 'cover' }}
                    />
                  )}
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{item.productName || item.name}</h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Size: {item.size} • Color: {item.color} • Qty: {item.quantity}
                    </span>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                    ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end' }}>
              <Link to={`/order-confirmation/${order.id}`} state={{ order }} className="btn btn-secondary btn-sm">
                View Detailed Receipt
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomerOrders;
