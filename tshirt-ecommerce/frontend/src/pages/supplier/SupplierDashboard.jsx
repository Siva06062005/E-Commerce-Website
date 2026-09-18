import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  IndianRupee,
  AlertTriangle,
  PackageCheck,
  RotateCcw,
  Wallet,
  PlusCircle,
  SlidersHorizontal,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Eye
} from 'lucide-react';
import { supplierService } from '../../services/supplierService';
import { productService } from '../../services/productService';
import { formatINR } from '../../utils/indianCommerceUtils';
import { useAuth } from '../../context/AuthContext';
import VerifiedBadge from '../../components/VerifiedBadge';

const SupplierDashboard = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Look up latest status from admin suppliers list
  const storedSuppliers = JSON.parse(localStorage.getItem('teezone_admin_suppliers') || '[]');
  const supplierRecord = storedSuppliers.find(s => s.email?.toLowerCase() === user?.email?.toLowerCase());
  const supplierStatus = supplierRecord?.status || user?.status || 'APPROVED';
  const isApproved = supplierStatus === 'APPROVED';
  const isPending = supplierStatus === 'PENDING';
  const isSuspended = supplierStatus === 'SUSPENDED';

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [metricsData, allProducts] = await Promise.all([
        supplierService.getMetrics(),
        productService.getAllProducts()
      ]);
      setMetrics(metricsData);
      setProducts(allProducts);
    } catch (err) {
      console.error('Error loading supplier dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading vendor dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ padding: '2.5rem 1.5rem 6rem' }}>
      {/* Verification Status Notice if Pending */}
      {isPending && (
        <div style={{
          background: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.35)',
          borderRadius: '12px',
          padding: '1.25rem 1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Clock size={28} color="#fbbf24" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                <strong style={{ color: '#fbbf24', fontSize: '1rem' }}>Supplier Verification Pending</strong>
                <span className="badge badge-warning">Awaiting Universal Admin Approval</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
                Your business credentials and GSTIN ({supplierRecord?.gstin || user?.gstin || '29AABCU9603R1Z7'}) are undergoing audit in the Universal Admin Portal. Once approved by the administrator, your store name will automatically receive the official verified blue tick badge (<VerifiedBadge status="APPROVED" size="sm" />) across all customer storefront pages.
              </p>
            </div>
          </div>
          <Link to="/admin" className="btn btn-sm btn-secondary" style={{ fontSize: '0.78rem', gap: '6px' }}>
            <ShieldCheck size={14} color="var(--accent-secondary)" /> Switch to Universal Admin to Approve
          </Link>
        </div>
      )}

      {/* Header Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem',
        marginBottom: '2.5rem',
        padding: '2rem',
        borderRadius: 'var(--radius-lg)',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(236, 72, 153, 0.08) 100%)',
        border: '1px solid var(--border-glass)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
            {isApproved ? (
              <span className="badge badge-success" style={{ gap: '4px' }}>
                <ShieldCheck size={13} /> Verified GST Supplier
              </span>
            ) : isPending ? (
              <span className="badge badge-warning" style={{ gap: '4px' }}>
                <Clock size={13} /> Verification Pending
              </span>
            ) : (
              <span className="badge badge-sale" style={{ gap: '4px' }}>
                <AlertTriangle size={13} /> Account Suspended
              </span>
            )}
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              GSTIN: {supplierRecord?.gstin || user?.gstin || '29AABCU9603R1Z7'} • {supplierRecord?.city || user?.city || 'Bengaluru'} Hub
            </span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span>{user?.storeName || supplierRecord?.storeName || 'Bharat Cotton Mills'}</span>
            <VerifiedBadge status={supplierStatus} size="lg" showLabel={true} />
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Supplier Performance Portal • Real-Time Pan-India Fulfillment & Settlements
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/supplier/products/new" className="btn btn-primary">
            <PlusCircle size={18} /> New Product Wizard
          </Link>
          <Link to="/supplier/inventory" className="btn btn-secondary">
            <SlidersHorizontal size={18} /> Inventory Ledger
          </Link>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        overflowX: 'auto',
        paddingBottom: '0.75rem',
        marginBottom: '2rem',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <Link to="/supplier" className="btn btn-sm btn-primary">DASHBOARD</Link>
        <Link to="/supplier/products/new" className="btn btn-sm btn-secondary">ADD PRODUCT</Link>
        <Link to="/supplier/inventory" className="btn btn-sm btn-secondary">INVENTORY & AUDIT</Link>
        <Link to="/supplier/orders" className="btn btn-sm btn-secondary">ORDERS & DISPATCH</Link>
        <Link to="/supplier/settlements" className="btn btn-sm btn-secondary">PAYMENTS & SETTLEMENTS</Link>
      </div>

      {/* KPI Metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2.5rem'
      }}>
        {/* Today's Sales */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>TODAY'S SALES</span>
            <TrendingUp size={18} color="var(--accent-emerald)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)' }}>
            {formatINR(metrics?.todaySales)}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)', marginTop: '0.25rem' }}>
            +18.4% vs yesterday
          </div>
        </div>

        {/* Total Revenue */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>TOTAL REVENUE</span>
            <IndianRupee size={18} color="var(--accent-primary)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)' }}>
            {formatINR(metrics?.revenue)}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Net sales across all channels
          </div>
        </div>

        {/* Total Orders */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>TOTAL ORDERS</span>
            <ShoppingBag size={18} color="var(--accent-cyan)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)' }}>
            {metrics?.totalOrders}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Lifetime fulfilled orders
          </div>
        </div>

        {/* Pending Dispatch */}
        <div className="card" style={{ borderColor: 'rgba(245, 158, 11, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>PENDING DISPATCH</span>
            <Clock size={18} color="var(--accent-amber)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--accent-amber)' }}>
            {metrics?.pendingDispatch} Orders
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Ready to pack & hand over to courier
          </div>
        </div>

        {/* Low Stock Products */}
        <div className="card" style={{ borderColor: 'rgba(244, 63, 94, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>LOW-STOCK ALERTS</span>
            <AlertTriangle size={18} color="var(--accent-rose)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--accent-rose)' }}>
            {metrics?.lowStockProducts} SKUs
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Stock &le; 5 units remaining
          </div>
        </div>

        {/* Net Settlement Balance */}
        <div className="card" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(17, 24, 39, 0.85) 100%)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>PENDING SETTLEMENT</span>
            <Wallet size={18} color="var(--accent-emerald)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--accent-emerald)' }}>
            {formatINR(metrics?.settlementAmount)}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Next payout: 20 Sep 2026 (HDFC Bank)
          </div>
        </div>
      </div>

      {/* Supplier Catalog Overview */}
      <div className="card" style={{ marginBottom: '2.5rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Vendor Product Catalog</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Manage GST slabs, HSN classification, and multi-size inventory.
            </p>
          </div>
          <Link to="/supplier/products/new" className="btn btn-sm btn-primary">
            <PlusCircle size={15} /> Add New Product
          </Link>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '0.75rem 1rem' }}>PRODUCT</th>
                <th style={{ padding: '0.75rem 1rem' }}>CATEGORY</th>
                <th style={{ padding: '0.75rem 1rem' }}>HSN CODE</th>
                <th style={{ padding: '0.75rem 1rem' }}>PRICE (INR)</th>
                <th style={{ padding: '0.75rem 1rem' }}>GST RATE</th>
                <th style={{ padding: '0.75rem 1rem' }}>TOTAL STOCK</th>
                <th style={{ padding: '0.75rem 1rem' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {products.slice(0, 6).map(p => {
                const totalStock = p.sizes ? p.sizes.reduce((acc, s) => acc + (s.stock || 0), 0) : 0;
                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img
                          src={p.image}
                          alt={p.name}
                          style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }}
                        />
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{p.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SKU: TEE-{p.id}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{p.category}</td>
                    <td style={{ padding: '1rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                      {p.hsnCode || '61091000'}
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 700 }}>{formatINR(p.price)}</td>
                    <td style={{ padding: '1rem' }}>
                      <span className="badge badge-primary">{p.gstRate || 12}% GST</span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        fontWeight: 700,
                        color: totalStock <= 10 ? 'var(--accent-rose)' : 'var(--accent-emerald)'
                      }}>
                        {totalStock} units
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span className="badge badge-success">ACTIVE</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SupplierDashboard;
