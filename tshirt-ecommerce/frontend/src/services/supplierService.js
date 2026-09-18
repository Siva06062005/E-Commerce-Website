import { apiClient, productService } from './productService';

const STORAGE_KEY_SUPPLIER_METRICS = 'teezone_supplier_metrics';
const STORAGE_KEY_INVENTORY_LEDGER = 'teezone_inventory_ledger';
const STORAGE_KEY_SETTLEMENTS = 'teezone_supplier_settlements';

export const supplierService = {
  // Get dashboard metrics
  async getMetrics(supplierId = 1) {
    try {
      const res = await apiClient.get(`/supplier/metrics?supplierId=${supplierId}`);
      if (res.data?.success && res.data.data) {
        return res.data.data;
      }
    } catch (err) {
      console.warn('Backend supplier metrics unavailable, loading local store:', err.message);
    }

    const saved = localStorage.getItem(STORAGE_KEY_SUPPLIER_METRICS);
    if (saved) {
      return JSON.parse(saved);
    }

    const defaultMetrics = {
      todaySales: 14850,
      totalOrders: 48,
      pendingOrders: 6,
      revenue: 186400,
      lowStockProducts: 2,
      outOfStockProducts: 0,
      pendingDispatch: 4,
      returns: 2,
      settlementAmount: 142500,
      commissionRate: 10
    };
    localStorage.setItem(STORAGE_KEY_SUPPLIER_METRICS, JSON.stringify(defaultMetrics));
    return defaultMetrics;
  },

  // 8-Step Product Wizard Submission
  async createProductWizard(wizardData) {
    const payload = {
      ...wizardData,
      id: Date.now(),
      slug: (wizardData.name || 'product').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      rating: 5.0,
      reviewCount: 1,
      approvalStatus: 'APPROVED',
      status: 'ACTIVE',
      hsnCode: wizardData.hsnCode || '61091000',
      gstRate: wizardData.gstRate || 12,
      vendorName: 'Bharat Cotton Mills'
    };

    try {
      const res = await apiClient.post('/supplier/products', payload);
      if (res.data?.success) return res.data.data;
    } catch (err) {
      console.warn('Backend supplier product creation failed, saving to catalog:', err.message);
    }

    // Save product to local custom products
    const stored = localStorage.getItem('teezone_custom_products');
    const list = stored ? JSON.parse(stored) : [];
    list.unshift(payload);
    localStorage.setItem('teezone_custom_products', JSON.stringify(list));

    // Record initial OPENING stock ledger transaction for each variant
    if (Array.isArray(payload.sizes)) {
      payload.sizes.forEach(s => {
        this.recordLedgerTransaction({
          productId: payload.id,
          productName: payload.name,
          sizeName: s.size,
          transactionType: 'OPENING',
          quantity: s.stock || 0,
          stockAfter: s.stock || 0,
          reason: 'Initial opening inventory for newly launched product',
          createdBy: 'vendor@teezone.in'
        });
      });
    }

    return payload;
  },

  // Audited Inventory Adjustment
  async adjustInventory(adjustmentReq) {
    const { productId, sizeName, transactionType, quantity, reason, actorEmail } = adjustmentReq;

    try {
      const res = await apiClient.post('/supplier/inventory/adjust', adjustmentReq);
      if (res.data?.success) return res.data.data;
    } catch (err) {
      console.warn('Backend inventory adjust failed, updating local ledger:', err.message);
    }

    // Update product stock in localStorage
    const stored = localStorage.getItem('teezone_custom_products');
    let newStock = 0;
    if (stored) {
      const list = JSON.parse(stored);
      const product = list.find(p => String(p.id) === String(productId));
      if (product && product.sizes) {
        const sizeObj = product.sizes.find(s => s.size === sizeName);
        if (sizeObj) {
          sizeObj.stock = Math.max(0, (sizeObj.stock || 0) + Number(quantity));
          newStock = sizeObj.stock;
        }
      }
      localStorage.setItem('teezone_custom_products', JSON.stringify(list));
    }

    // Record ledger entry
    const entry = this.recordLedgerTransaction({
      productId,
      sizeName,
      transactionType,
      quantity: Number(quantity),
      stockAfter: newStock,
      reason,
      createdBy: actorEmail || 'vendor@teezone.in'
    });

    return entry;
  },

  // Record an immutable transaction entry
  recordLedgerTransaction(tx) {
    const raw = localStorage.getItem(STORAGE_KEY_INVENTORY_LEDGER);
    const ledger = raw ? JSON.parse(raw) : [];
    const newTx = {
      id: 'TXN-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      ...tx,
      createdAt: new Date().toISOString()
    };
    ledger.unshift(newTx);
    localStorage.setItem(STORAGE_KEY_INVENTORY_LEDGER, JSON.stringify(ledger));
    return newTx;
  },

  // Get all inventory transactions
  async getInventoryTransactions(productId = null) {
    try {
      const url = productId ? `/supplier/inventory/transactions?productId=${productId}` : '/supplier/inventory/transactions';
      const res = await apiClient.get(url);
      if (res.data?.success && Array.isArray(res.data.data)) {
        return res.data.data;
      }
    } catch (err) {
      console.warn('Backend transactions unavailable, loading local ledger:', err.message);
    }

    const raw = localStorage.getItem(STORAGE_KEY_INVENTORY_LEDGER);
    let ledger = raw ? JSON.parse(raw) : [];
    if (ledger.length === 0) {
      // Seed initial transactions
      ledger = [
        {
          id: 'TXN-901',
          productId: 1,
          productName: 'Doom Black T-Shirt',
          sizeName: 'M',
          transactionType: 'OPENING',
          quantity: 30,
          stockAfter: 30,
          reason: 'Initial batch warehouse receipt',
          createdBy: 'vendor@teezone.in',
          createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
        },
        {
          id: 'TXN-902',
          productId: 1,
          productName: 'Doom Black T-Shirt',
          sizeName: 'M',
          transactionType: 'SALE',
          quantity: -6,
          stockAfter: 24,
          reason: 'Customer online order batch ORD-492',
          createdBy: 'system@teezone.in',
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
        },
        {
          id: 'TXN-903',
          productId: 1,
          productName: 'Doom Black T-Shirt',
          sizeName: 'M',
          transactionType: 'DAMAGE',
          quantity: -1,
          stockAfter: 23,
          reason: 'Water droplet dye stain discovered during quality check',
          createdBy: 'vendor@teezone.in',
          createdAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: 'TXN-904',
          productId: 1,
          productName: 'Doom Black T-Shirt',
          sizeName: 'M',
          transactionType: 'RETURN',
          quantity: 1,
          stockAfter: 24,
          reason: 'Customer size exchange - clean returned condition',
          createdBy: 'returns@teezone.in',
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem(STORAGE_KEY_INVENTORY_LEDGER, JSON.stringify(ledger));
    }

    if (productId) {
      return ledger.filter(item => String(item.productId) === String(productId));
    }
    return ledger;
  },

  // Get supplier settlements
  async getSettlements() {
    try {
      const res = await apiClient.get('/supplier/settlements');
      if (res.data?.success && Array.isArray(res.data.data)) {
        return res.data.data;
      }
    } catch (err) {
      console.warn('Backend settlements unavailable, using local ledger:', err.message);
    }

    const raw = localStorage.getItem(STORAGE_KEY_SETTLEMENTS);
    if (raw) return JSON.parse(raw);

    const initialSettlements = [
      {
        id: 'SET-9901',
        settlementNumber: 'SET-IN-2026-09A',
        period: '01 Sep 2026 – 15 Sep 2026',
        grossSales: 86400,
        commissionRate: 10,
        commissionAmount: 8640,
        refundDeductions: 1200,
        taxDeductions: 1555,
        netSettlement: 75005,
        status: 'PAID',
        payoutDate: '2026-09-16T10:30:00Z',
        paymentReference: 'NEFT-HDFC-991823719'
      },
      {
        id: 'SET-9902',
        settlementNumber: 'SET-IN-2026-09B',
        period: '16 Sep 2026 – 30 Sep 2026',
        grossSales: 67495,
        commissionRate: 10,
        commissionAmount: 6749.5,
        refundDeductions: 0,
        taxDeductions: 1214.9,
        netSettlement: 59530.6,
        status: 'PENDING',
        payoutDate: null,
        paymentReference: null
      }
    ];
    localStorage.setItem(STORAGE_KEY_SETTLEMENTS, JSON.stringify(initialSettlements));
    return initialSettlements;
  },

  // Get vendor orders with customer privacy protection
  async getSupplierOrders() {
    const raw = localStorage.getItem('teezone_orders');
    const orders = raw ? JSON.parse(raw) : [];
    
    // Mask sensitive personal info for vendor view
    return orders.map(o => {
      const maskedPhone = o.shippingPhone
        ? o.shippingPhone.replace(/(\+?91)?(\d{2})(\d{6})(\d{2})/, '$1$2******$4')
        : '+91 98******10';
      return {
        ...o,
        customerEmail: 'customer-protected@teezone.in',
        shippingPhone: maskedPhone,
        fulfillmentStatus: o.fulfillmentStatus || 'NEW'
      };
    });
  },

  // Update order item / fulfillment status
  async updateFulfillmentStatus(orderId, newStatus) {
    const raw = localStorage.getItem('teezone_orders');
    if (raw) {
      let orders = JSON.parse(raw);
      orders = orders.map(o => {
        if (String(o.id) === String(orderId)) {
          return { ...o, status: newStatus, fulfillmentStatus: newStatus };
        }
        return o;
      });
      localStorage.setItem('teezone_orders', JSON.stringify(orders));
    }
    return { orderId, status: newStatus };
  }
};
