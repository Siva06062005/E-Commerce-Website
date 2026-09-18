import React from 'react';
import { CheckCircle, Clock, ShieldCheck, AlertCircle } from 'lucide-react';

/**
 * VerifiedBadge Component
 * Renders a verified tick badge for vendors verified by the Universal Admin.
 * 
 * @param {string} status - 'APPROVED' | 'PENDING' | 'SUSPENDED'
 * @param {'sm'|'md'|'lg'} size - Badge dimensions
 * @param {boolean} showLabel - Whether to show the text label next to the tick
 * @param {string} className - Optional styling classes
 */
const VerifiedBadge = ({ status = 'APPROVED', size = 'md', showLabel = false, className = '' }) => {
  const isApproved = status === 'APPROVED';
  const isPending = status === 'PENDING';
  const isSuspended = status === 'SUSPENDED';

  const iconSizes = {
    sm: 13,
    md: 16,
    lg: 20
  };

  const currentIconSize = iconSizes[size] || 16;

  if (isApproved) {
    return (
      <span
        className={`verified-badge inline-flex items-center gap-1 ${className}`}
        title="Admin Verified Indian Vendor • Validated GSTIN & Quality Authenticated"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          verticalAlign: 'middle',
          color: '#38bdf8',
          fontWeight: 600,
          fontSize: size === 'sm' ? '0.72rem' : size === 'lg' ? '0.9rem' : '0.8rem'
        }}
      >
        {/* Verified Blue-Cyan Checkmark Tick Badge */}
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: size === 'sm' ? '16px' : size === 'lg' ? '22px' : '18px',
            height: size === 'sm' ? '16px' : size === 'lg' ? '22px' : '18px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
            color: '#ffffff',
            boxShadow: '0 2px 6px rgba(6, 182, 212, 0.4)',
            flexShrink: 0
          }}
        >
          <svg
            width={currentIconSize * 0.75}
            height={currentIconSize * 0.75}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
        {showLabel && (
          <span style={{ color: '#38bdf8', letterSpacing: '0.01em' }}>
            Verified
          </span>
        )}
      </span>
    );
  }

  if (isPending) {
    return (
      <span
        className={`pending-badge inline-flex items-center gap-1 ${className}`}
        title="Vendor verification pending Universal Admin review"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          verticalAlign: 'middle',
          color: '#fbbf24',
          fontWeight: 600,
          fontSize: size === 'sm' ? '0.72rem' : size === 'lg' ? '0.9rem' : '0.8rem'
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: size === 'sm' ? '16px' : size === 'lg' ? '22px' : '18px',
            height: size === 'sm' ? '16px' : size === 'lg' ? '22px' : '18px',
            borderRadius: '50%',
            background: 'rgba(245, 158, 11, 0.2)',
            border: '1px solid rgba(245, 158, 11, 0.5)',
            color: '#fbbf24',
            flexShrink: 0
          }}
        >
          <Clock size={currentIconSize * 0.7} />
        </span>
        {showLabel && <span style={{ color: '#fbbf24' }}>Verification Pending</span>}
      </span>
    );
  }

  if (isSuspended) {
    return (
      <span
        className={`suspended-badge inline-flex items-center gap-1 ${className}`}
        title="Vendor account is currently suspended by Universal Admin"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          verticalAlign: 'middle',
          color: '#f43f5e',
          fontWeight: 600,
          fontSize: size === 'sm' ? '0.72rem' : size === 'lg' ? '0.9rem' : '0.8rem'
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: size === 'sm' ? '16px' : size === 'lg' ? '22px' : '18px',
            height: size === 'sm' ? '16px' : size === 'lg' ? '22px' : '18px',
            borderRadius: '50%',
            background: 'rgba(244, 63, 94, 0.2)',
            border: '1px solid rgba(244, 63, 94, 0.5)',
            color: '#f43f5e',
            flexShrink: 0
          }}
        >
          <AlertCircle size={currentIconSize * 0.7} />
        </span>
        {showLabel && <span style={{ color: '#f43f5e' }}>Suspended</span>}
      </span>
    );
  }

  return null;
};

export default VerifiedBadge;
