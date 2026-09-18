import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedAdminRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Authenticating credentials...</p>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/login" state={{ from: location, message: 'Admin access required.' }} replace />;
  }

  return children;
};

export const ProtectedCustomerRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading session...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location, message: 'Please sign in to proceed.' }} replace />;
  }

  return children;
};

export const ProtectedSupplierRoute = ({ children }) => {
  const { user, isSupplier, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Authenticating supplier portal...</p>
      </div>
    );
  }

  if (!user || (!isSupplier && !isAdmin)) {
    return <Navigate to="/login" state={{ from: location, message: 'Supplier portal access required. Sign in as a vendor.' }} replace />;
  }

  return children;
};

export const ProtectedPermissionRoute = ({ permission, children }) => {
  const { user, hasPermission, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Checking permissions...</p>
      </div>
    );
  }

  if (!user || !hasPermission(permission)) {
    return <Navigate to="/login" state={{ from: location, message: `Access denied. Required permission: ${permission}` }} replace />;
  }

  return children;
};
