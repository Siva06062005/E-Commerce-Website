import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import CustomerOrders from './pages/CustomerOrders';
import AdminDashboard from './pages/AdminDashboard';
import SupplierDashboard from './pages/supplier/SupplierDashboard';
import SupplierProductWizard from './pages/supplier/SupplierProductWizard';
import SupplierInventory from './pages/supplier/SupplierInventory';
import SupplierOrders from './pages/supplier/SupplierOrders';
import SupplierSettlements from './pages/supplier/SupplierSettlements';
import { ProtectedAdminRoute, ProtectedCustomerRoute, ProtectedSupplierRoute } from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div className="page-wrapper">
            <Navbar />
            <main className="main-content">
              <Routes>
                {/* Public Storefront Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetails />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Checkout & Customer Orders */}
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-confirmation/:id" element={<OrderConfirmation />} />
                <Route path="/orders" element={<CustomerOrders />} />

                {/* Supplier / Vendor Portal (Protected) */}
                <Route
                  path="/supplier"
                  element={
                    <ProtectedSupplierRoute>
                      <SupplierDashboard />
                    </ProtectedSupplierRoute>
                  }
                />
                <Route
                  path="/supplier/products/new"
                  element={
                    <ProtectedSupplierRoute>
                      <SupplierProductWizard />
                    </ProtectedSupplierRoute>
                  }
                />
                <Route
                  path="/supplier/inventory"
                  element={
                    <ProtectedSupplierRoute>
                      <SupplierInventory />
                    </ProtectedSupplierRoute>
                  }
                />
                <Route
                  path="/supplier/orders"
                  element={
                    <ProtectedSupplierRoute>
                      <SupplierOrders />
                    </ProtectedSupplierRoute>
                  }
                />
                <Route
                  path="/supplier/settlements"
                  element={
                    <ProtectedSupplierRoute>
                      <SupplierSettlements />
                    </ProtectedSupplierRoute>
                  }
                />

                {/* Admin Portal (Protected) */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedAdminRoute>
                      <AdminDashboard />
                    </ProtectedAdminRoute>
                  }
                />
                <Route path="/admin/products" element={<Navigate to="/admin" replace />} />
                <Route path="/admin/orders" element={<Navigate to="/admin" replace />} />

                {/* Catch-all route */}
                <Route
                  path="*"
                  element={
                    <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
                      <h1 style={{ fontSize: '3rem', fontWeight: 950, marginBottom: '1rem' }}>404</h1>
                      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Page not found.</p>
                      <a href="/" className="btn btn-primary">Return to Homepage</a>
                    </div>
                  }
                />
              </Routes>
            </main>
            <Footer />
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
