import React, { useState, useEffect } from 'react';
import { 
  Package, ShoppingBag, DollarSign, AlertTriangle, Plus, Edit2, Trash2, 
  Search, Check, X, ShieldAlert, Truck, Clock, RefreshCw, Eye
} from 'lucide-react';
import { productService } from '../services/productService';
import { orderService } from '../services/orderService';
import { useAuth } from '../context/AuthContext';

const INITIAL_FORM = {
  name: '',
  description: '',
  price: '',
  category: 'Developer',
  color: 'Black',
  image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
  status: 'ACTIVE',
  badge: 'NEW DROP',
  sizes: [
    { size: 'S', stock: 10 },
    { size: 'M', stock: 25 },
    { size: 'L', stock: 20 },
    { size: 'XL', stock: 15 },
    { size: 'XXL', stock: 5 }
  ]
};

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('products'); // 'products', 'orders'
  
  // Products state
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('All');

  // Orders state
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const loadAllData = async () => {
    try {
      setLoadingProducts(true);
      const prods = await productService.getAllProducts();
      setProducts(prods);
    } catch (e) {
      console.error('Failed to load admin products', e);
    } finally {
      setLoadingProducts(false);
    }

    try {
      setLoadingOrders(true);
      const ords = await orderService.getAllOrdersAdmin();
      setOrders(ords);
    } catch (e) {
      console.error('Failed to load admin orders', e);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalOrdersCount = orders.length;
  const totalProductsCount = products.length;
  const lowStockCount = products.filter(p => {
    const total = p.totalStock ?? p.sizes?.reduce((s, x) => s + x.stock, 0) ?? 0;
    return total < 15;
  }).length;

  // Filtered products
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                          p.category?.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCategory = productCategoryFilter === 'All' || p.category?.toLowerCase() === productCategoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  // Modal open helpers
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData(INITIAL_FORM);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      category: product.category || 'Developer',
      color: product.color || 'Black',
      image: product.image || '',
      status: product.status || 'ACTIVE',
      badge: product.badge || '',
      sizes: product.sizes && product.sizes.length > 0 ? product.sizes : INITIAL_FORM.sizes
    });
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        totalStock: formData.sizes.reduce((sum, s) => sum + Number(s.stock || 0), 0)
      };

      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, payload);
        showToast(`Updated "${formData.name}" successfully!`);
      } else {
        await productService.createProduct(payload);
        showToast(`Added new product "${formData.name}"!`);
      }

      setIsModalOpen(false);
      loadAllData();
    } catch (err) {
      console.error('Save product failed:', err);
      alert('Failed to save product: ' + err.message);
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      await productService.deleteProduct(id);
      setDeleteConfirmId(null);
      showToast('Product deleted from inventory.');
      loadAllData();
    } catch (err) {
      console.error('Delete product failed:', err);
      alert('Failed to delete product: ' + err.message);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      showToast(`Order #${orderId} status changed to ${newStatus}`);
      loadAllData();
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '2.5rem 1.5rem 6rem' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 9999,
          background: 'var(--accent-primary)',
          color: '#ffffff',
          padding: '12px 24px',
          borderRadius: '8px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          fontWeight: 700
        }}>
          {toastMessage}
        </div>
      )}

      {/* Admin Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2.5rem',
        flexWrap: 'wrap',
        gap: '1rem',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '1.5rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.25rem' }}>
            <span className="badge badge-primary">MANAGEMENT PORTAL</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Logged in as {user?.email}</span>
          </div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 900 }}>
            TEEZONE Admin Dashboard
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={loadAllData} className="btn btn-secondary btn-sm">
            <RefreshCw size={15} /> Refresh Data
          </button>
          <button onClick={handleOpenAddModal} className="btn btn-primary btn-sm">
            <Plus size={16} /> Add New T-Shirt
          </button>
        </div>
      </div>

      {/* KPI Metric Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2.5rem'
      }}>
        <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Sales</span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>${totalRevenue.toFixed(2)}</h3>
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShoppingBag size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Orders</span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{totalOrdersCount}</h3>
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Package size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Active T-Shirts</span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{totalProductsCount}</h3>
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Low Stock Alert</span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{lowStockCount}</h3>
          </div>
        </div>
      </div>

      {/* Main Tab Controls */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('products')}
          style={{
            padding: '0.75rem 1.5rem',
            fontWeight: 700,
            fontSize: '1rem',
            borderBottom: activeTab === 'products' ? '3px solid var(--accent-primary)' : 'none',
            color: activeTab === 'products' ? 'var(--text-primary)' : 'var(--text-secondary)'
          }}
        >
          T-Shirt Catalog ({products.length})
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          style={{
            padding: '0.75rem 1.5rem',
            fontWeight: 700,
            fontSize: '1rem',
            borderBottom: activeTab === 'orders' ? '3px solid var(--accent-primary)' : 'none',
            color: activeTab === 'orders' ? 'var(--text-primary)' : 'var(--text-secondary)'
          }}
        >
          Customer Orders ({orders.length})
        </button>
      </div>

      {/* TAB 1: PRODUCTS MANAGER */}
      {activeTab === 'products' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          {/* Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ position: 'relative', minWidth: '260px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search products..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.4rem' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {['All', 'Developer', 'Streetwear', 'Minimalist'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setProductCategoryFilter(cat)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: productCategoryFilter === cat ? 700 : 500,
                    background: productCategoryFilter === cat ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                    color: productCategoryFilter === cat ? '#ffffff' : 'var(--text-secondary)'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Product</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Category</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Color</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Price</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Stock Status</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(p => {
                  const totalStk = p.totalStock ?? p.sizes?.reduce((s, x) => s + x.stock, 0) ?? 0;
                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border-subtle)', fontSize: '0.9rem' }}>
                      <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                          src={p.image}
                          alt={p.name}
                          style={{ width: '42px', height: '42px', borderRadius: '6px', objectFit: 'cover' }}
                        />
                        <div>
                          <strong style={{ display: 'block' }}>{p.name}</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: #{p.id}</span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{p.category}</td>
                      <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{p.color}</td>
                      <td style={{ padding: '1rem', fontWeight: 700 }}>${Number(p.price).toFixed(2)}</td>
                      <td style={{ padding: '1rem' }}>
                        <span className={`badge ${totalStk < 15 ? 'badge-warning' : 'badge-success'}`}>
                          {totalStk} in stock
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span className="badge badge-primary">{p.status || 'ACTIVE'}</span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="btn-icon btn-secondary"
                            title="Edit product"
                            aria-label="Edit product"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(p.id)}
                            className="btn-icon btn-danger"
                            title="Delete product"
                            aria-label="Delete product"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ORDERS MANAGER */}
      {activeTab === 'orders' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Order ID</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Customer</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Items</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Total</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Payment</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} style={{ borderBottom: '1px solid var(--border-subtle)', fontSize: '0.9rem' }}>
                    <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                      #{order.id}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <strong style={{ display: 'block' }}>{order.customerName}</strong>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{order.customerEmail}</span>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                      {order.items?.length || 0} items
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 800 }}>
                      ${(order.totalAmount || 0).toFixed(2)}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span className="badge badge-primary">{order.paymentMethod || 'CARD'}</span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <select
                        value={order.status || 'PENDING'}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="form-select"
                        style={{ padding: '4px 8px', fontSize: '0.8rem', width: 'auto' }}
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="PROCESSING">PROCESSING</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD / EDIT PRODUCT MODAL */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
                {editingProduct ? 'Edit T-Shirt' : 'Add New T-Shirt'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ color: 'var(--text-secondary)' }}>
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct}>
              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Kubernetes Cluster T-Shirt"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea
                  rows="3"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed fabric specs, cut, and print details..."
                  className="form-textarea"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="36.00"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="form-select"
                  >
                    <option value="Developer">Developer</option>
                    <option value="Streetwear">Streetwear</option>
                    <option value="Minimalist">Minimalist</option>
                    <option value="Graphic Art">Graphic Art</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Color *</label>
                  <input
                    type="text"
                    required
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="Black, Heather Grey, Navy..."
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Badge</label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="NEW DROP, BESTSELLER, HOT..."
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Image URL *</label>
                <input
                  type="url"
                  required
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://..."
                  className="form-input"
                />
              </div>

              {/* Sizes and Stock Matrix */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
                  Available Sizes & Stock Quantities
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                  {formData.sizes.map((s, idx) => (
                    <div key={s.size} style={{ textAlign: 'center', background: 'var(--bg-secondary)', padding: '8px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                      <strong style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>{s.size}</strong>
                      <input
                        type="number"
                        min="0"
                        value={s.stock}
                        onChange={(e) => {
                          const newSizes = [...formData.sizes];
                          newSizes[idx] = { ...s, stock: parseInt(e.target.value) || 0 };
                          setFormData({ ...formData, sizes: newSizes });
                        }}
                        className="form-input"
                        style={{ padding: '4px', textAlign: 'center', fontSize: '0.85rem' }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingProduct ? 'Update Product' : 'Save & Publish Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmId && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem'
        }}>
          <div className="card" style={{ maxWidth: '440px', padding: '2rem', textAlign: 'center' }}>
            <Trash2 size={42} color="var(--accent-rose)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>Delete This Product?</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              This will immediately remove this T-shirt from the storefront and database.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button onClick={() => setDeleteConfirmId(null)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={() => handleDeleteProduct(deleteConfirmId)} className="btn btn-danger">
                Yes, Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
