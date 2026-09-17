import { apiClient } from './productService';

export const orderService = {
  // Create order
  async createOrder(orderPayload) {
    try {
      const response = await apiClient.post('/orders', orderPayload);
      return response.data;
    } catch (err) {
      console.warn('Backend order creation failed, saving locally:', err.message);
      const newOrder = {
        ...orderPayload,
        id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
        status: 'PENDING',
        createdAt: new Date().toISOString()
      };
      const stored = localStorage.getItem('teezone_orders');
      const orders = stored ? JSON.parse(stored) : [];
      orders.unshift(newOrder);
      localStorage.setItem('teezone_orders', JSON.stringify(orders));
      return newOrder;
    }
  },

  // Get current user's orders
  async getMyOrders() {
    try {
      const response = await apiClient.get('/orders');
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      }
    } catch (err) {
      console.warn('Backend /orders failed, loading locally:', err.message);
    }
    const stored = localStorage.getItem('teezone_orders');
    return stored ? JSON.parse(stored) : [];
  },

  // Get order by ID
  async getOrderById(id) {
    try {
      const response = await apiClient.get(`/orders/${id}`);
      return response.data;
    } catch (err) {
      console.warn(`Backend /orders/${id} failed:`, err.message);
      const list = await this.getMyOrders();
      const found = list.find(o => String(o.id) === String(id));
      if (!found) throw new Error(`Order #${id} not found`);
      return found;
    }
  },

  // Admin get all orders
  async getAllOrdersAdmin() {
    try {
      const response = await apiClient.get('/admin/orders');
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      }
    } catch (err) {
      console.warn('Backend /admin/orders failed, loading locally:', err.message);
    }
    const stored = localStorage.getItem('teezone_orders');
    return stored ? JSON.parse(stored) : [];
  },

  // Admin update order status
  async updateOrderStatus(id, status) {
    try {
      const response = await apiClient.put(`/admin/orders/${id}/status`, { status });
      return response.data;
    } catch (err) {
      console.warn(`Backend order status update failed:`, err.message);
      const stored = localStorage.getItem('teezone_orders');
      if (stored) {
        let orders = JSON.parse(stored);
        orders = orders.map(o => (String(o.id) === String(id) ? { ...o, status } : o));
        localStorage.setItem('teezone_orders', JSON.stringify(orders));
      }
      return { id, status };
    }
  }
};
