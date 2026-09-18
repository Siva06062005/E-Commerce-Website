import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  SlidersHorizontal,
  Plus,
  Minus,
  AlertTriangle,
  History,
  CheckCircle,
  FileText,
  ShieldAlert,
  Search,
  RefreshCw
} from 'lucide-react';
import { supplierService } from '../../services/supplierService';
import { productService } from '../../services/productService';
import { formatIndianDateTime } from '../../utils/indianCommerceUtils';
import { useAuth } from '../../context/AuthContext';

const SupplierInventory = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showAdjustModal, setShowAdjustModal] = useState(false);

  // Adjustment Form State
  const [adjustForm, setAdjustForm] = useState({
    productId: '',
    sizeName: 'M',
    transactionType: 'ADJUSTMENT',
    quantity: 1,
    isDeduction: false,
    reason: ''
  });
  const [adjustError, setAdjustError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    loadInventoryData();
  }, []);

  const loadInventoryData = async () => {
    try {
      setLoading(true);
      const [allProducts, txList] = await Promise.all([
        productService.getAllProducts(),
        supplierService.getInventoryTransactions()
      ]);
      setProducts(allProducts);
      setTransactions(txList);
      if (allProducts.length > 0 && !selectedProduct) {
        setSelectedProduct(allProducts[0]);
        setAdjustForm(prev => ({ ...prev, productId: allProducts[0].id }));
      }
    } catch (err) {
      console.error('Failed to load inventory data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdjust = (product, size) => {
    setSelectedProduct(product);
    setAdjustForm({
      productId: product.id,
      sizeName: size || (product.sizes?.[0]?.size || 'M'),
      transactionType: 'ADJUSTMENT',
      quantity: 5,
      isDeduction: false,
      reason: ''
    });
    setAdjustError('');
    setShowAdjustModal(true);
  };

  const handleExecuteAdjustment = async (e) => {
    e.preventDefault();
    setAdjustError('');

    if (!adjustForm.reason.trim()) {
      setAdjustError('A valid audit reason is mandatory for all inventory transactions.');
      return;
    }

    const delta = adjustForm.isDeduction
      ? -Math.abs(parseInt(adjustForm.quantity) || 1)
      : Math.abs(parseInt(adjustForm.quantity) || 1);

    try {
      await supplierService.adjustInventory({
        productId: adjustForm.productId,
        sizeName: adjustForm.sizeName,
        transactionType: adjustForm.transactionType,
        quantity: delta,
        reason: adjustForm.reason.trim(),
        actorEmail: user?.email || 'vendor@teezone.in'
      });

      setSuccessMsg(`Inventory transaction recorded for size ${adjustForm.sizeName} (${delta > 0 ? '+' : ''}${delta} units).`);
      setShowAdjustModal(false);
      await loadInventoryData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setAdjustError('Transaction failed: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading inventory ledger...</p>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ padding: '2.5rem 1.5rem 6rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <Link to="/supplier" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            <ArrowLeft size={16} /> Back to Supplier Dashboard
          </Link>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 900 }}>Auditable Inventory Ledger</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Ledger-based stock architecture: On-Hand, Reserved, and Available Stock
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => handleOpenAdjust(selectedProduct || products[0])}
        >
          <SlidersHorizontal size={16} /> Record Stock Adjustment
        </button>
      </div>

      {successMsg && (
        <div style={{
          padding: '1rem 1.25rem',
          borderRadius: 'var(--radius-sm)',
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: 'var(--accent-emerald)',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <CheckCircle size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Stock Overview Table */}
      <div className="card" style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.35rem' }}>
          Current SKU Stock Allocations
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          Real-time variant availability. Stock levels are driven by recorded ledger entries.
        </p>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '0.75rem 1rem' }}>PRODUCT & COLOR</th>
                <th style={{ padding: '0.75rem 1rem' }}>SIZE VARIANT</th>
                <th style={{ padding: '0.75rem 1rem' }}>ON-HAND</th>
                <th style={{ padding: '0.75rem 1rem' }}>RESERVED</th>
                <th style={{ padding: '0.75rem 1rem' }}>AVAILABLE</th>
                <th style={{ padding: '0.75rem 1rem' }}>STATUS</th>
                <th style={{ padding: '0.75rem 1rem' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {products.flatMap(p => {
                const sizes = p.sizes && p.sizes.length > 0 ? p.sizes : [{ size: 'M', stock: 10 }];
                return sizes.map((s, idx) => {
                  const onHand = s.stock || 0;
                  const reserved = Math.min(2, Math.floor(onHand * 0.1)); // Simulated reserved for checkout
                  const available = Math.max(0, onHand - reserved);
                  const isLow = available <= 5;
                  const isOut = available === 0;

                  return (
                    <tr key={`${p.id}-${s.size}`} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <img
                            src={p.image}
                            alt={p.name}
                            style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover' }}
                          />
                          <div>
                            <div style={{ fontWeight: 700 }}>{p.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.color} • SKU-{p.id}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 800 }}>
                        <span className="badge badge-primary">Size {s.size}</span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>{onHand}</td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>{reserved}</td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 800, color: isOut ? 'var(--accent-rose)' : isLow ? 'var(--accent-amber)' : 'var(--accent-emerald)' }}>
                        {available} units
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        {isOut ? (
                          <span className="badge badge-sale">OUT OF STOCK</span>
                        ) : isLow ? (
                          <span className="badge badge-warning">LOW STOCK (&le;5)</span>
                        ) : (
                          <span className="badge badge-success">IN STOCK</span>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <button
                          type="button"
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleOpenAdjust(p, s.size)}
                        >
                          Adjust
                        </button>
                      </td>
                    </tr>
                  );
                });
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction History Ledger */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Audit Trail: Stock Transactions</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Every stock change is logged with mandatory operator audit reasons.
            </p>
          </div>
          <button className="btn btn-sm btn-secondary" onClick={loadInventoryData}>
            <RefreshCw size={14} /> Refresh Ledger
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '0.75rem' }}>TXN ID</th>
                <th style={{ padding: '0.75rem' }}>TIMESTAMP</th>
                <th style={{ padding: '0.75rem' }}>PRODUCT & SIZE</th>
                <th style={{ padding: '0.75rem' }}>TYPE</th>
                <th style={{ padding: '0.75rem' }}>DELTA</th>
                <th style={{ padding: '0.75rem' }}>STOCK AFTER</th>
                <th style={{ padding: '0.75rem' }}>AUDIT REASON</th>
                <th style={{ padding: '0.75rem' }}>ACTOR</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(tx => {
                const isPositive = tx.quantity > 0;
                return (
                  <tr key={tx.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.75rem', fontFamily: 'monospace', color: 'var(--accent-primary)', fontWeight: 700 }}>
                      {tx.id}
                    </td>
                    <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>
                      {formatIndianDateTime(tx.createdAt)}
                    </td>
                    <td style={{ padding: '0.75rem', fontWeight: 600 }}>
                      {tx.productName || `Product #${tx.productId}`} ({tx.sizeName})
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span className={`badge ${
                        tx.transactionType === 'OPENING' || tx.transactionType === 'PURCHASE'
                          ? 'badge-primary'
                          : tx.transactionType === 'SALE'
                          ? 'badge-success'
                          : tx.transactionType === 'DAMAGE'
                          ? 'badge-sale'
                          : 'badge-warning'
                      }`}>
                        {tx.transactionType}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', fontWeight: 800, color: isPositive ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                      {isPositive ? `+${tx.quantity}` : tx.quantity}
                    </td>
                    <td style={{ padding: '0.75rem', fontWeight: 700 }}>
                      {tx.stockAfter}
                    </td>
                    <td style={{ padding: '0.75rem', color: 'var(--text-secondary)', maxWidth: '280px' }}>
                      {tx.reason}
                    </td>
                    <td style={{ padding: '0.75rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {tx.createdBy}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      {showAdjustModal && (
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
          <div className="card" style={{ maxWidth: '520px', width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Record Stock Adjustment
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Every stock change will be committed as an auditable ledger record.
            </p>

            {adjustError && (
              <div style={{ padding: '0.75rem', background: 'rgba(244, 63, 94, 0.15)', color: 'var(--accent-rose)', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.85rem' }}>
                {adjustError}
              </div>
            )}

            <form onSubmit={handleExecuteAdjustment}>
              <div className="form-group">
                <label className="form-label">Selected Product</label>
                <select
                  className="form-select"
                  value={adjustForm.productId}
                  onChange={e => {
                    const prod = products.find(p => String(p.id) === e.target.value);
                    setSelectedProduct(prod);
                    setAdjustForm(prev => ({
                      ...prev,
                      productId: e.target.value,
                      sizeName: prod?.sizes?.[0]?.size || 'M'
                    }));
                  }}
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.color})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Size Variant</label>
                  <select
                    className="form-select"
                    value={adjustForm.sizeName}
                    onChange={e => setAdjustForm(prev => ({ ...prev, sizeName: e.target.value }))}
                  >
                    {selectedProduct?.sizes?.map(s => (
                      <option key={s.size} value={s.size}>Size {s.size} (Current: {s.stock})</option>
                    )) || <option value="M">Size M</option>}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Transaction Type</label>
                  <select
                    className="form-select"
                    value={adjustForm.transactionType}
                    onChange={e => {
                      const type = e.target.value;
                      const isDed = ['DAMAGE', 'SALE'].includes(type);
                      setAdjustForm(prev => ({ ...prev, transactionType: type, isDeduction: isDed }));
                    }}
                  >
                    <option value="ADJUSTMENT">Manual Adjustment</option>
                    <option value="PURCHASE">Purchase / Factory Receipt</option>
                    <option value="DAMAGE">Damaged / Defective (-)</option>
                    <option value="RETURN">Customer Return (+)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Adjustment Direction & Quantity</label>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => setAdjustForm(prev => ({ ...prev, isDeduction: false }))}
                    style={{
                      padding: '0.65rem 1.25rem',
                      borderRadius: '6px',
                      background: !adjustForm.isDeduction ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-primary)',
                      color: !adjustForm.isDeduction ? 'var(--accent-emerald)' : 'var(--text-secondary)',
                      border: `1px solid ${!adjustForm.isDeduction ? 'var(--accent-emerald)' : 'var(--border-subtle)'}`,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}
                  >
                    <Plus size={15} /> Add Stock (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustForm(prev => ({ ...prev, isDeduction: true }))}
                    style={{
                      padding: '0.65rem 1.25rem',
                      borderRadius: '6px',
                      background: adjustForm.isDeduction ? 'rgba(244, 63, 94, 0.2)' : 'var(--bg-primary)',
                      color: adjustForm.isDeduction ? 'var(--accent-rose)' : 'var(--text-secondary)',
                      border: `1px solid ${adjustForm.isDeduction ? 'var(--accent-rose)' : 'var(--border-subtle)'}`,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}
                  >
                    <Minus size={15} /> Deduct Stock (-)
                  </button>
                  <input
                    type="number"
                    min="1"
                    className="form-input"
                    style={{ width: '100px' }}
                    value={adjustForm.quantity}
                    onChange={e => setAdjustForm(prev => ({ ...prev, quantity: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Mandatory Audit Reason *</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="e.g. Physical cycle count discrepancy, water stain damage, or batch arrival from Tirupur factory..."
                  value={adjustForm.reason}
                  onChange={e => setAdjustForm(prev => ({ ...prev, reason: e.target.value }))}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAdjustModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Commit to Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierInventory;
