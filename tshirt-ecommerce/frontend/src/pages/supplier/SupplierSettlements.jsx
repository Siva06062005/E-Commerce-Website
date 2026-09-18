import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Wallet,
  CheckCircle,
  Clock,
  Download,
  Building,
  ShieldCheck,
  TrendingUp,
  Percent,
  Receipt
} from 'lucide-react';
import { supplierService } from '../../services/supplierService';
import { formatINR, formatIndianDateTime } from '../../utils/indianCommerceUtils';

const SupplierSettlements = () => {
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettlements();
  }, []);

  const loadSettlements = async () => {
    try {
      setLoading(true);
      const data = await supplierService.getSettlements();
      setSettlements(data);
    } catch (err) {
      console.error('Failed to load settlements:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalPaid = settlements
    .filter(s => s.status === 'PAID')
    .reduce((sum, s) => sum + (s.netSettlement || 0), 0);

  const totalPending = settlements
    .filter(s => s.status === 'PENDING')
    .reduce((sum, s) => sum + (s.netSettlement || 0), 0);

  if (loading) {
    return (
      <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading financial settlements...</p>
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
          <h1 style={{ fontSize: '1.875rem', fontWeight: 900 }}>Vendor Payments & Settlements</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Audited financial disbursements, platform commission deductions, and GST remittances
          </p>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.75rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-glass)'
        }}>
          <Building size={20} color="var(--accent-primary)" />
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PRIMARY PAYOUT ACCOUNT</div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700 }}>HDFC Bank • A/C Ending in 8421</div>
          </div>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2.5rem'
      }}>
        <div className="card" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(17, 24, 39, 0.85) 100%)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>TOTAL DISBURSED (PAID)</span>
            <CheckCircle size={18} color="var(--accent-emerald)" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--accent-emerald)' }}>
            {formatINR(totalPaid)}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Directly credited via NEFT/RTGS
          </div>
        </div>

        <div className="card" style={{ borderColor: 'rgba(245, 158, 11, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>PENDING SETTLEMENT</span>
            <Clock size={18} color="var(--accent-amber)" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--accent-amber)' }}>
            {formatINR(totalPending)}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Scheduled for processing on next cycle (Bi-weekly)
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>PLATFORM COMMISSION</span>
            <Percent size={18} color="var(--accent-primary)" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--text-primary)' }}>
            10.0% Flat
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Covers payment gateway, hosting, and platform infrastructure
          </div>
        </div>
      </div>

      {/* Settlements Table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Settlement Disbursement History</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Transparent financial audit breakdowns for every payout batch.
            </p>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '0.85rem 1rem' }}>SETTLEMENT BATCH</th>
                <th style={{ padding: '0.85rem 1rem' }}>CYCLE PERIOD</th>
                <th style={{ padding: '0.85rem 1rem' }}>GROSS SALES</th>
                <th style={{ padding: '0.85rem 1rem' }}>COMMISSION (10%)</th>
                <th style={{ padding: '0.85rem 1rem' }}>REFUND DEDUCTIONS</th>
                <th style={{ padding: '0.85rem 1rem' }}>TAX DEDUCTIONS</th>
                <th style={{ padding: '0.85rem 1rem' }}>NET DISBURSED</th>
                <th style={{ padding: '0.85rem 1rem' }}>STATUS</th>
                <th style={{ padding: '0.85rem 1rem' }}>REFERENCE</th>
              </tr>
            </thead>
            <tbody>
              {settlements.map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '1rem', fontFamily: 'monospace', fontWeight: 800, color: 'var(--accent-primary)' }}>
                    {item.settlementNumber}
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                    {item.period || 'Bi-Weekly'}
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 700 }}>
                    {formatINR(item.grossSales)}
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--accent-rose)' }}>
                    -{formatINR(item.commissionAmount)}
                  </td>
                  <td style={{ padding: '1rem', color: item.refundDeductions > 0 ? 'var(--accent-rose)' : 'var(--text-muted)' }}>
                    -{formatINR(item.refundDeductions)}
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                    -{formatINR(item.taxDeductions)}
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 900, color: 'var(--accent-emerald)', fontSize: '1rem' }}>
                    {formatINR(item.netSettlement)}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span className={`badge ${item.status === 'PAID' ? 'badge-success' : 'badge-warning'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {item.paymentReference || 'Scheduled'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SupplierSettlements;
