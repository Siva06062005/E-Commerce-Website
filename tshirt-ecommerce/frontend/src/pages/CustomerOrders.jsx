import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  ArrowRight,
  RotateCcw,
  ShieldCheck,
  FileText,
  AlertCircle
} from 'lucide-react';
import { orderService } from '../services/orderService';
import { useAuth } from '../context/AuthContext';
import { formatINR, formatIndianDateTime } from '../utils/indianCommerceUtils';

const STATUS_STEPS = ['CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED'];

const getStatusBadge = (status) => {
  switch (status?.toUpperCase()) {
    case 'PENDING':
      return <span className="badge badge-warning"><Clock size={12} /> Pending</span>;
    case 'CONFIRMED':
    case 'PACKED':
    case 'PROCESSING':
      return <span className="badge badge-primary"><Truck size={12} /> {status}</span>;
    case 'SHIPPED':
      return <span className="badge badge-new"><Truck size={12} /> Dispatched</span>;
    case 'DELIVERED':
      return <span className="badge badge-success"><CheckCircle size={12} /> Delivered</span>;
    case 'RETURN_REQUESTED':
      return <span className="badge badge-warning"><RotateCcw size={12} /> Return Requested</span>;
    case 'RETURNED':
      return <span className="badge badge-primary"><RotateCcw size={12} /> Refund Issued</span>;
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
  const [returnModalOrder, setReturnModalOrder] = useState(null);
  const [returnReason, setReturnReason] = useState('Size did not fit as expected');
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getMyOrders();
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

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const handleInitiateReturn = (order) => {
    setReturnModalOrder(order);
  };

  const handleSubmitReturn = async (e) => {
    e.preventDefault();
    if (!returnModalOrder) return;

    // Update locally / in storage
    const raw = localStorage.getItem('teezone_orders');
    if (raw) {
      let list = JSON.parse(raw);
      list = list.map(o => (String(o.id) === String(returnModalOrder.id) ? { ...o, status: 'RETURN_REQUESTED', returnReason } : o));
      localStorage.setItem('teezone_orders', JSON.stringify(list));
    }

    setReturnModalOrder(null);
    showToast(`Return requested for #${returnModalOrder.orderNumber || returnModalOrder.id}. Courier pickup scheduled within 48 hours.`);
    fetchOrders();
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading your Indian commerce orders...</p>
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
          My Orders & Delivery Tracking
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Pan-India live shipment updates, tax invoices, and 7-day hassle-free returns
        </p>
      </div>

      {toastMsg && (
        <div style={{
          padding: '1rem 1.25rem',
          borderRadius: '8px',
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: 'var(--accent-emerald)',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <CheckCircle size={18} />
          <span>{toastMsg}</span>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {orders.map((order) => {
          const currentStatus = order.status || 'CONFIRMED';
          const isDelivered = currentStatus === 'DELIVERED';
          const isReturned = currentStatus === 'RETURN_REQUESTED' || currentStatus === 'RETURNED';

          return (
            <div key={order.id} className="card" style={{ padding: '2rem' }}>
              {/* Header info bar */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid var(--border-subtle)',
                paddingBottom: '1.25rem',
                marginBottom: '1.5rem',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>ORDER NUMBER</span>
                  <strong style={{ fontSize: '1.15rem', color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                    {order.orderNumber || `#${order.id}`}
                  </strong>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>DATE & TIME</span>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {formatIndianDateTime(order.createdAt)}
                  </span>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>PAYMENT METHOD</span>
                  <span className="badge badge-primary">{order.paymentMethod || 'UPI'}</span>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>INVOICED AMOUNT</span>
                  <strong style={{ fontSize: '1.2rem', color: 'var(--accent-primary)' }}>
                    {formatINR(order.totalAmount || order.total)}
                  </strong>
                </div>

                <div>
                  {getStatusBadge(order.status)}
                </div>
              </div>

              {/* Visual Progress Pipeline */}
              {!isReturned && order.status !== 'CANCELLED' && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem 1.25rem',
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1.5rem',
                  overflowX: 'auto'
                }}>
                  {STATUS_STEPS.map((st, i) => {
                    const currentIdx = STATUS_STEPS.indexOf(currentStatus);
                    const isPassed = i <= currentIdx;
                    return (
                      <div key={st} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                        <div style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: isPassed ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                          color: isPassed ? 'white' : 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '0.7rem'
                        }}>
                          {isPassed ? <CheckCircle size={13} /> : i + 1}
                        </div>
                        <span style={{
                          fontSize: '0.78rem',
                          fontWeight: isPassed ? 700 : 500,
                          color: isPassed ? 'var(--text-primary)' : 'var(--text-muted)'
                        }}>
                          {st}
                        </span>
                        {i < STATUS_STEPS.length - 1 && (
                          <div style={{ width: '32px', height: '2px', background: i < currentIdx ? 'var(--accent-primary)' : 'var(--border-subtle)', margin: '0 0.5rem' }} />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Items inside order */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                {(order.items || []).map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.productName || item.name}
                        style={{ width: '56px', height: '56px', borderRadius: '8px', objectFit: 'cover' }}
                      />
                    )}
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>{item.productName || item.name}</h4>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        Size: {item.size || 'M'} • Color: {item.color || 'Black'} • Qty: {item.quantity} • HSN: 61091000
                      </div>
                    </div>
                    <span style={{ fontWeight: 800, fontSize: '1rem' }}>
                      {formatINR((item.price || 0) * (item.quantity || 1))}
                    </span>
                  </div>
                ))}
              </div>

              {/* Bottom Actions Bar */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '1.25rem'
              }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Delivery to: <span style={{ color: 'var(--text-secondary)' }}>{order.shippingAddress}</span>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {isDelivered && !isReturned && (
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => handleInitiateReturn(order)}
                    >
                      <RotateCcw size={14} /> Request 7-Day Return
                    </button>
                  )}
                  <Link to={`/order-confirmation/${order.id}`} state={{ order }} className="btn btn-secondary btn-sm">
                    <FileText size={14} /> View GST Tax Invoice
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Return Workflow Modal */}
      {returnModalOrder && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1.5rem'
        }}>
          <div className="card" style={{ maxWidth: '500px', width: '100%', background: 'var(--bg-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--accent-amber)' }}>
              <RotateCcw size={20} />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Initiate 7-Day Indian Return</h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              Free doorstep pickup via our logistics partners. Refund credited directly to original payment mode upon quality inspection.
            </p>

            <form onSubmit={handleSubmitReturn}>
              <div className="form-group">
                <label className="form-label">Select Reason for Return</label>
                <select
                  className="form-select"
                  value={returnReason}
                  onChange={e => setReturnReason(e.target.value)}
                >
                  <option value="Size did not fit as expected">Size did not fit as expected</option>
                  <option value="Fabric quality differs from description">Fabric quality differs from description</option>
                  <option value="Defective / damaged item arrived">Defective / damaged item arrived</option>
                  <option value="Incorrect color or style received">Incorrect color or style received</option>
                </select>
              </div>

              <div className="card" style={{ background: 'var(--bg-primary)', padding: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', fontWeight: 700, marginBottom: '0.25rem' }}>
                  Doorstep Pickup Address:
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {returnModalOrder.shippingAddress}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setReturnModalOrder(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirm Pickup Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerOrders;
