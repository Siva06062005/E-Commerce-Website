import { apiClient } from './productService';

const STORAGE_KEY_ADMIN_SUPPLIERS = 'teezone_admin_suppliers';
const STORAGE_KEY_AUDIT_LOGS = 'teezone_admin_audit_logs';
const STORAGE_KEY_SETTINGS = 'teezone_system_settings';

export const adminService = {
  // Get all registered suppliers
  async getSuppliers() {
    try {
      const res = await apiClient.get('/admin/suppliers');
      if (res.data?.success && Array.isArray(res.data.data)) {
        return res.data.data;
      }
    } catch (err) {
      console.warn('Backend admin suppliers unavailable, loading local suppliers:', err.message);
    }

    const raw = localStorage.getItem(STORAGE_KEY_ADMIN_SUPPLIERS);
    if (raw) return JSON.parse(raw);

    const initialSuppliers = [
      {
        id: 1,
        storeName: "Bharat Cotton Mills",
        companyName: "Bharat Weaves & Textiles Pvt Ltd",
        ownerName: "Rajesh V. Patel",
        email: "vendor@teezone.in",
        phone: "+91 98450 12345",
        gstin: "29AABCU9603R1Z7",
        pan: "AABCU9603R",
        city: "Bengaluru",
        state: "Karnataka",
        pincode: "560001",
        status: "APPROVED",
        commissionRate: 10,
        totalProducts: 8,
        totalSales: 186400,
        rating: 4.9,
        joinedAt: "2026-08-10T11:00:00Z"
      },
      {
        id: 2,
        storeName: "Surat Silk & Knits",
        companyName: "Surat Knits LLP",
        ownerName: "Deepak Mehta",
        email: "deepak@suratknits.in",
        phone: "+91 98251 67890",
        gstin: "24AAECZ4192P1ZF",
        pan: "AAECZ4192P",
        city: "Surat",
        state: "Gujarat",
        pincode: "395003",
        status: "PENDING",
        commissionRate: 12,
        totalProducts: 4,
        totalSales: 0,
        rating: 5.0,
        joinedAt: "2026-09-15T09:30:00Z"
      },
      {
        id: 3,
        storeName: "Tirupur Apparel Works",
        companyName: "Tirupur Cotton Hub",
        ownerName: "K. Subramaniam",
        email: "subbu@tirupurapparel.com",
        phone: "+91 94432 99881",
        gstin: "33AAGCT1029K1Z4",
        pan: "AAGCT1029K",
        city: "Tirupur",
        state: "Tamil Nadu",
        pincode: "641604",
        status: "APPROVED",
        commissionRate: 10,
        totalProducts: 14,
        totalSales: 342100,
        rating: 4.8,
        joinedAt: "2026-07-22T14:15:00Z"
      }
    ];
    localStorage.setItem(STORAGE_KEY_ADMIN_SUPPLIERS, JSON.stringify(initialSuppliers));
    return initialSuppliers;
  },

  // Update supplier status (Approve / Suspend)
  async updateSupplierStatus(id, newStatus, reason = "Admin review completed") {
    try {
      await apiClient.put(`/admin/suppliers/${id}/status?status=${newStatus}&reason=${encodeURIComponent(reason)}`);
    } catch (err) {
      console.warn('Backend update supplier status failed, saving locally:', err.message);
    }

    const suppliers = await this.getSuppliers();
    const updated = suppliers.map(s => (s.id === id ? { ...s, status: newStatus } : s));
    localStorage.setItem(STORAGE_KEY_ADMIN_SUPPLIERS, JSON.stringify(updated));

    // Sync with registered users list and active session
    const targetSupplier = updated.find(s => s.id === id);
    if (targetSupplier?.email) {
      const registeredUsers = JSON.parse(localStorage.getItem('teezone_registered_users') || '[]');
      const userIdx = registeredUsers.findIndex(u => u.email.toLowerCase() === targetSupplier.email.toLowerCase());
      if (userIdx !== -1) {
        registeredUsers[userIdx].status = newStatus;
        localStorage.setItem('teezone_registered_users', JSON.stringify(registeredUsers));
      }

      // Update currently active session if this supplier is logged in
      const currentUser = JSON.parse(localStorage.getItem('teezone_user') || 'null');
      if (currentUser && currentUser.email?.toLowerCase() === targetSupplier.email.toLowerCase()) {
        currentUser.status = newStatus;
        localStorage.setItem('teezone_user', JSON.stringify(currentUser));
      }
    }

    // Record audit log
    this.recordAuditLog({
      action: newStatus === 'APPROVED' ? "SUPPLIER_VERIFIED_AND_APPROVED" : "SUPPLIER_STATUS_UPDATE",
      resourceType: "SUPPLIER",
      resourceId: String(id),
      oldValue: "PENDING",
      newValue: newStatus,
      reason: `${reason} - Verified Blue Tick Badge ${newStatus === 'APPROVED' ? 'Granted' : 'Revoked'}`,
      userEmail: "admin@teezone.com"
    });

    return updated.find(s => s.id === id);
  },

  // Record audit log
  recordAuditLog(logData) {
    const raw = localStorage.getItem(STORAGE_KEY_AUDIT_LOGS);
    const logs = raw ? JSON.parse(raw) : [];
    const entry = {
      id: 'AUD-' + Date.now(),
      ...logData,
      createdAt: new Date().toISOString()
    };
    logs.unshift(entry);
    localStorage.setItem(STORAGE_KEY_AUDIT_LOGS, JSON.stringify(logs));
    return entry;
  },

  // Get audit logs
  async getAuditLogs() {
    try {
      const res = await apiClient.get('/admin/audit-logs');
      if (res.data?.success && Array.isArray(res.data.data)) {
        return res.data.data;
      }
    } catch (err) {
      console.warn('Backend audit logs unavailable, loading local audit trail:', err.message);
    }

    const raw = localStorage.getItem(STORAGE_KEY_AUDIT_LOGS);
    if (raw) return JSON.parse(raw);

    const initialLogs = [
      {
        id: "AUD-1001",
        action: "SUPPLIER_APPROVE",
        resourceType: "SUPPLIER",
        resourceId: "1",
        oldValue: "PENDING",
        newValue: "APPROVED",
        reason: "Verified GSTIN 29AABCU9603R1Z7 on government portal",
        userEmail: "admin@teezone.com",
        createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
      },
      {
        id: "AUD-1002",
        action: "INVENTORY_ADJUST",
        resourceType: "PRODUCT_SIZE",
        resourceId: "1:M",
        oldValue: "25",
        newValue: "24",
        reason: "Damaged item written off during weekly audit",
        userEmail: "vendor@teezone.in",
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
      },
      {
        id: "AUD-1003",
        action: "SETTLEMENT_PAY",
        resourceType: "SETTLEMENT",
        resourceId: "SET-IN-2026-09A",
        oldValue: "PENDING",
        newValue: "PAID",
        reason: "Disbursed ₹75,005 via NEFT to HDFC Bank",
        userEmail: "admin@teezone.com",
        createdAt: new Date(Date.now() - 86400000).toISOString()
      }
    ];
    localStorage.setItem(STORAGE_KEY_AUDIT_LOGS, JSON.stringify(initialLogs));
    return initialLogs;
  },

  // System Settings
  getSystemSettings() {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (raw) return JSON.parse(raw);
    const defaults = {
      platformCommissionPercent: 10,
      defaultGstRate: 12,
      hsnCode: "61091000",
      freeShippingThreshold: 999,
      standardShippingFee: 99,
      codAvailable: true,
      maxCodAmount: 10000,
      allowNegativeInventory: false,
      lowStockThreshold: 5,
      autoApproveSuppliers: false
    };
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(defaults));
    return defaults;
  },

  updateSystemSettings(newSettings) {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(newSettings));
    this.recordAuditLog({
      action: "SYSTEM_SETTINGS_UPDATE",
      resourceType: "SETTINGS",
      resourceId: "GLOBAL",
      oldValue: "Previous",
      newValue: "Updated",
      reason: "Admin modified platform fee or taxation configuration",
      userEmail: "admin@teezone.com"
    });
    return newSettings;
  }
};
