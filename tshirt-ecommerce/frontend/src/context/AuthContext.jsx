import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('teezone_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('teezone_token') || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token && user) {
      localStorage.setItem('teezone_token', token);
      localStorage.setItem('teezone_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('teezone_token');
      localStorage.removeItem('teezone_user');
    }
  }, [token, user]);

  // Login handler
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      // Try backend Spring Boot endpoint first
      const res = await axios.post(`${API_BASE_URL}/auth/login`, { email, password }, { timeout: 3000 });
      const data = res.data;
      setToken(data.token);
      const authenticatedUser = {
        id: data.id,
        name: data.name || data.fullName,
        email: data.email,
        role: data.role // 'ROLE_ADMIN', 'ROLE_SUPPLIER', or 'ROLE_CUSTOMER'
      };

      // If supplier, attach status
      if (authenticatedUser.role === 'ROLE_SUPPLIER') {
        const suppliers = JSON.parse(localStorage.getItem('teezone_admin_suppliers') || '[]');
        const supp = suppliers.find(s => s.email?.toLowerCase() === email.toLowerCase());
        authenticatedUser.status = supp ? supp.status : 'APPROVED';
        authenticatedUser.storeName = supp?.storeName || authenticatedUser.name;
        authenticatedUser.gstin = supp?.gstin;
      }

      setUser(authenticatedUser);
      setLoading(false);
      return { success: true, user: authenticatedUser };
    } catch (err) {
      console.warn('Backend login unavailable or credentials invalid, verifying built-in credentials:', err.message);
      
      // Fallback verification for demo/testing without Spring Boot running
      if (email.toLowerCase() === 'admin@teezone.com' && password === 'AdminSecret123!') {
        const adminUser = {
          id: 1,
          name: 'Chief Universal Admin',
          email: 'admin@teezone.com',
          role: 'ROLE_ADMIN'
        };
        const mockJwt = 'mock-jwt-admin-token-' + Date.now();
        setToken(mockJwt);
        setUser(adminUser);
        setLoading(false);
        return { success: true, user: adminUser };
      } else if (email.toLowerCase() === 'vendor@teezone.in' && (password === 'VendorPass123!' || password === 'Password123!')) {
        // Look up supplier status from admin suppliers storage
        const suppliers = JSON.parse(localStorage.getItem('teezone_admin_suppliers') || '[]');
        const supp = suppliers.find(s => s.email?.toLowerCase() === 'vendor@teezone.in');
        const supplierUser = {
          id: 3,
          name: 'Rajesh V. Patel (Vendor)',
          email: 'vendor@teezone.in',
          role: 'ROLE_SUPPLIER',
          storeName: supp?.storeName || 'Bharat Cotton Mills',
          companyName: 'Bharat Weaves & Textiles Pvt Ltd',
          ownerName: 'Rajesh V. Patel',
          gstin: supp?.gstin || '29AABCU9603R1Z7',
          city: supp?.city || 'Bengaluru',
          state: supp?.state || 'Karnataka',
          status: supp?.status || 'APPROVED' // Admin approved verified vendor
        };
        const mockJwt = 'mock-jwt-supplier-token-' + Date.now();
        setToken(mockJwt);
        setUser(supplierUser);
        setLoading(false);
        return { success: true, user: supplierUser };
      } else if (email.toLowerCase() === 'demo@example.com' && password === 'Password123!') {
        const custUser = {
          id: 2,
          name: 'Aarav Sharma',
          email: 'demo@example.com',
          role: 'ROLE_CUSTOMER'
        };
        const mockJwt = 'mock-jwt-customer-token-' + Date.now();
        setToken(mockJwt);
        setUser(custUser);
        setLoading(false);
        return { success: true, user: custUser };
      } else {
        // Check dynamically registered users from localStorage
        const registeredUsers = JSON.parse(localStorage.getItem('teezone_registered_users') || '[]');
        const found = registeredUsers.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
        if (found) {
          // Check if supplier has been approved/updated by admin
          let supplierStatus = found.status || (found.role === 'ROLE_SUPPLIER' ? 'PENDING' : 'APPROVED');
          let storeName = found.storeName;
          if (found.role === 'ROLE_SUPPLIER') {
            const suppliers = JSON.parse(localStorage.getItem('teezone_admin_suppliers') || '[]');
            const supp = suppliers.find(s => s.email?.toLowerCase() === found.email.toLowerCase());
            if (supp) {
              supplierStatus = supp.status;
              storeName = supp.storeName;
            }
          }

          const authUser = {
            id: found.id,
            name: found.name,
            email: found.email,
            role: found.role || 'ROLE_CUSTOMER',
            storeName: storeName || found.name,
            gstin: found.gstin,
            status: supplierStatus
          };
          const mockJwt = 'mock-jwt-token-' + Date.now();
          setToken(mockJwt);
          setUser(authUser);
          setLoading(false);
          return { success: true, user: authUser };
        }
      }

      setError('Invalid email or password. Demo accounts: admin@teezone.com (AdminSecret123!), vendor@teezone.in (VendorPass123!), or demo@example.com (Password123!)');
      setLoading(false);
      return { success: false, message: 'Invalid credentials' };
    }
  };

  // Register handler with role support and vendor metadata
  const register = async (name, email, password, role = 'ROLE_CUSTOMER', extraData = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/register?role=${role}`, { name, email, password, ...extraData }, { timeout: 3000 });
      const data = res.data;
      setToken(data.token);
      const newUser = {
        id: data.id,
        name: data.name || name,
        email: data.email || email,
        role: data.role || role,
        storeName: extraData.storeName || name,
        status: role === 'ROLE_SUPPLIER' ? 'PENDING' : 'APPROVED',
        ...extraData
      };
      setUser(newUser);
      setLoading(false);
      return { success: true, user: newUser };
    } catch (err) {
      console.warn('Backend register unavailable, saving locally for immediate session:', err.message);
      const isVendor = role === 'ROLE_SUPPLIER';
      const newUser = {
        id: Date.now(),
        name,
        email,
        password,
        role,
        storeName: extraData.storeName || name,
        companyName: extraData.companyName || extraData.storeName || name,
        ownerName: extraData.ownerName || name,
        phone: extraData.phone || '',
        gstin: extraData.gstin || '',
        pan: extraData.pan || '',
        city: extraData.city || 'Bengaluru',
        state: extraData.state || 'Karnataka',
        pincode: extraData.pincode || '560001',
        status: isVendor ? 'PENDING' : 'APPROVED' // Vendors must be approved by Universal Admin
      };

      // Save to registered users
      const existingList = JSON.parse(localStorage.getItem('teezone_registered_users') || '[]');
      existingList.push(newUser);
      localStorage.setItem('teezone_registered_users', JSON.stringify(existingList));

      // If supplier, register in Universal Admin suppliers queue so admin can inspect & verify
      if (isVendor) {
        const suppliers = JSON.parse(localStorage.getItem('teezone_admin_suppliers') || '[]');
        const newSupplierRecord = {
          id: newUser.id,
          storeName: newUser.storeName,
          companyName: newUser.companyName,
          ownerName: newUser.ownerName,
          email: newUser.email,
          phone: newUser.phone,
          gstin: newUser.gstin,
          pan: newUser.pan,
          city: newUser.city,
          state: newUser.state,
          pincode: newUser.pincode,
          status: 'PENDING',
          commissionRate: 10,
          totalProducts: 0,
          totalSales: 0,
          rating: 5.0,
          joinedAt: new Date().toISOString()
        };
        suppliers.push(newSupplierRecord);
        localStorage.setItem('teezone_admin_suppliers', JSON.stringify(suppliers));
      }

      const mockJwt = 'mock-jwt-token-' + Date.now();
      setToken(mockJwt);
      setUser(newUser);
      setLoading(false);
      return { success: true, user: newUser };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('teezone_token');
    localStorage.removeItem('teezone_user');
  };

  const isAdmin = user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN';
  const isSupplier = user?.role === 'ROLE_SUPPLIER' || user?.role === 'SUPPLIER';
  const isCustomer = !isAdmin && !isSupplier;

  // RBAC granular permissions checker independent of UI role
  const hasPermission = (permission) => {
    if (isAdmin) return true;
    if (isSupplier) {
      const supplierPerms = [
        'PRODUCT_VIEW', 'PRODUCT_CREATE', 'PRODUCT_UPDATE',
        'INVENTORY_VIEW', 'INVENTORY_UPDATE', 'INVENTORY_ADJUST',
        'ORDER_VIEW', 'ORDER_UPDATE',
        'PAYMENT_VIEW', 'SETTLEMENT_VIEW'
      ];
      return supplierPerms.includes(permission);
    }
    const customerPerms = ['PRODUCT_VIEW', 'ORDER_VIEW'];
    return customerPerms.includes(permission);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      error,
      login,
      register,
      logout,
      isAdmin,
      isSupplier,
      isCustomer,
      hasPermission,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};
