import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  ShieldCheck,
  Search,
  ChevronRight,
  Printer,
  ExternalLink,
  RotateCcw
} from 'lucide-react';
import { supplierService } from '../../services/supplierService';
import { formatINR, formatIndianDateTime } from '../../utils/indianCommerceUtils';

const STATUS_STEPS = ['NEW', 'CONFIRMED', 'PACKED', 'READY_TO_SHIP', 'SHIPPED', 'DELIVERED'];

const SupplierOrders = () => {
  const [orders, setOrders] = useState([]);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [awbTracking, setAwbTracking] = useState('');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await supplierService.getSupplierOrders();
      setOrders(data);
      if (data.length > 0 && !selectedOrder) {
        setSelectedOrder(data[0]);
      }
    } catch (err) {
      console.error('Failed to load supplier orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await supplierService.updateFulfillmentStatus(orderId, newStatus);
      await loadOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus, fulfillmentStatus: newStatus }));
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesFilter = activeFilter === 'ALL' || o.status === activeFilter || o.fulfillmentStatus === activeFilter;
    const matchesSearch = !searchQuery || String(o.id).toLowerCase().includes(searchQuery.toLowerCase()) || (o.customerName && o.customerName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="container animate-fade-in" style={{ padding: '2.5rem 1.5rem 6rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <Link to="/supplier" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            <ArrowLeft size={16} /> Back to Supplier Dashboard
          </Link>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 900 }}>Vendor Order Fulfillment</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Multi-vendor dispatch pipeline • Privacy Protected Customer Delivery Information
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="badge badge-success">
            <ShieldCheck size={13} /> Customer PII Masked
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        overflowX: 'auto',
        paddingBottom: '0.75rem',
        marginBottom: '1.5rem',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        {['ALL', 'NEW', 'CONFIRMED', 'PACKED', 'READY_TO_SHIP', 'SHIPPED', 'DELIVERED'].map(tab => (
          <button
            key={tab}
            className={`btn btn-sm ${activeFilter === tab ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveFilter(tab)}
          >
            {tab.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Main Content Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 420px) 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left: Orders List */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search Order # or Destination..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '680px', overflowY: 'auto' }}>
            {filteredOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                No orders found in this status queue.
              </div>
            ) : (
              filteredOrders.map(order => {
                const isSelected = selectedOrder?.id === order.id;
                return (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      background: isSelected ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-secondary)',
                      border: `1px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>{order.orderNumber || `Order #${order.id}`}</span>
                      <span className={`badge ${
                        order.status === 'DELIVERED' ? 'badge-success' :
                        order.status === 'SHIPPED' ? 'badge-primary' :
                        order.status === 'NEW' ? 'badge-sale' : 'badge-warning'
                      }`}>
                        {order.status || 'NEW'}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      Customer: {order.customerName}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <span>{order.items?.length || 1} Item(s)</span>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{formatINR(order.totalAmount || order.total)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Order Detail & Dispatch Operations */}
        {selectedOrder ? (
          <div className="card animate-fade-in" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>
                  {selectedOrder.paymentMethod || 'PREPAID UPI'}
                </span>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 900 }}>
                  {selectedOrder.orderNumber || `Order #${selectedOrder.id}`}
                </h2>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Placed on: {formatIndianDateTime(selectedOrder.createdAt)}
                </div>
              </div>

              {/* Status Action Buttons */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {selectedOrder.status === 'NEW' && (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'CONFIRMED')}
                  >
                    Confirm Order
                  </button>
                )}
                {selectedOrder.status === 'CONFIRMED' && (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'PACKED')}
                  >
                    Mark as Packed
                  </button>
                )}
                {selectedOrder.status === 'PACKED' && (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'READY_TO_SHIP')}
                  >
                    Generate Shipping Label
                  </button>
                )}
                {selectedOrder.status === 'READY_TO_SHIP' && (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'SHIPPED')}
                  >
                    Dispatch Courier (Ship)
                  </button>
                )}
                {selectedOrder.status === 'SHIPPED' && (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'DELIVERED')}
                  >
                    Mark Delivered
                  </button>
                )}
              </div>
            </div>

            {/* Visual Fulfillment Pipeline */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.25rem',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '2rem',
              overflowX: 'auto'
            }}>
              {STATUS_STEPS.map((st, i) => {
                const currentIdx = STATUS_STEPS.indexOf(selectedOrder.status || 'NEW');
                const isPassed = i <= currentIdx;
                return (
                  <div key={st} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: isPassed ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                      color: isPassed ? 'white' : 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.75rem'
                    }}>
                      {isPassed ? <CheckCircle size={15} /> : i + 1}
                    </div>
                    <span style={{
                      fontSize: '0.8rem',
                      fontWeight: isPassed ? 700 : 500,
                      color: isPassed ? 'var(--text-primary)' : 'var(--text-muted)'
                    }}>
                      {st.replace(/_/g, ' ')}
                    </span>
                    {i < STATUS_STEPS.length - 1 && (
                      <div style={{ width: '24px', height: '2px', background: i < currentIdx ? 'var(--accent-primary)' : 'var(--border-subtle)', margin: '0 0.5rem' }} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Delivery Destination & Customer Privacy Note */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
              <div className="card" style={{ background: 'var(--bg-secondary)', padding: '1.25rem' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                  Delivery Destination
                </h3>
                <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{selectedOrder.customerName}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {selectedOrder.shippingAddress}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', marginTop: '0.5rem', fontFamily: 'monospace' }}>
                  Contact: {selectedOrder.shippingPhone} (Protected)
                </div>
              </div>

              <div className="card" style={{ background: 'var(--bg-secondary)', padding: '1.25rem' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                  GST Tax Invoice & Payout
                </h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Item Subtotal:</span>
                  <span>{formatINR(selectedOrder.subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>GST (12% Included):</span>
                  <span>{formatINR(selectedOrder.tax || (selectedOrder.subtotal * 0.12))}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Platform Fee (10%):</span>
                  <span style={{ color: 'var(--accent-rose)' }}>-{formatINR((selectedOrder.subtotal || 0) * 0.1)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', fontWeight: 800, borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                  <span>Net Supplier Payout:</span>
                  <span style={{ color: 'var(--accent-emerald)' }}>{formatINR((selectedOrder.subtotal || 0) * 0.9)}</span>
                </div>
              </div>
            </div>

            {/* Ordered Items Table */}
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1rem' }}>Order Items to Dispatch</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                      <th style={{ padding: '0.5rem 0' }}>ITEM</th>
                      <th style={{ padding: '0.5rem 0' }}>SIZE / COLOR</th>
                      <th style={{ padding: '0.5rem 0' }}>QTY</th>
                      <th style={{ padding: '0.5rem 0' }}>UNIT PRICE</th>
                      <th style={{ padding: '0.5rem 0' }}>TOTAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedOrder.items || []).map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '0.75rem 0' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <img
                              src={item.image}
                              alt={item.productName}
                              style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover' }}
                            />
                            <span style={{ fontWeight: 700 }}>{item.productName}</span>
                          </div>
                        </td>
                        <td style={{ padding: '0.75rem 0' }}>{item.size || 'M'} / {item.color || 'Black'}</td>
                        <td style={{ padding: '0.75rem 0', fontWeight: 700 }}>x{item.quantity}</td>
                        <td style={{ padding: '0.75rem 0' }}>{formatINR(item.price)}</td>
                        <td style={{ padding: '0.75rem 0', fontWeight: 800 }}>{formatINR(item.price * item.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="card" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Select an order to view dispatch details and customer delivery specs.
          </div>
        )}
      </div>
    </div>
  );
};

export default SupplierOrders;
