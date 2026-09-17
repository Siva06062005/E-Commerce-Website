import axios from 'axios';
import { SAMPLE_PRODUCTS } from '../utils/mockData';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Create configured axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 5000
});

// Attach JWT token automatically if logged in
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('teezone_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const productService = {
  // Fetch all products (with fallback to mock)
  async getAllProducts() {
    try {
      const response = await apiClient.get('/products');
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        return response.data;
      }
    } catch (err) {
      console.warn('Backend /api/products unavailable, loading local catalog:', err.message);
    }
    // Check local storage for any admin-added local products
    const stored = localStorage.getItem('teezone_custom_products');
    if (stored) {
      try {
        const custom = JSON.parse(stored);
        return [...custom, ...SAMPLE_PRODUCTS];
      } catch (e) {
        console.error('Error parsing custom products', e);
      }
    }
    return SAMPLE_PRODUCTS;
  },

  // Fetch product by ID or Slug
  async getProductById(id) {
    try {
      const response = await apiClient.get(`/products/${id}`);
      if (response.data) {
        return response.data;
      }
    } catch (err) {
      console.warn(`Backend /api/products/${id} unavailable, using fallback:`, err.message);
    }
    const all = await this.getAllProducts();
    const found = all.find(p => String(p.id) === String(id) || p.slug === String(id));
    if (!found) {
      throw new Error(`Product #${id} not found`);
    }
    return found;
  },

  // Admin add product
  async createProduct(productData) {
    try {
      const response = await apiClient.post('/admin/products', productData);
      return response.data;
    } catch (err) {
      console.warn('Backend create product failed, saving locally:', err.message);
      const newProduct = {
        ...productData,
        id: Date.now(),
        rating: 5.0,
        reviewCount: 1,
        slug: productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        sizes: productData.sizes || [
          { size: 'S', stock: 10 },
          { size: 'M', stock: 15 },
          { size: 'L', stock: 20 },
          { size: 'XL', stock: 10 }
        ]
      };
      const stored = localStorage.getItem('teezone_custom_products');
      const list = stored ? JSON.parse(stored) : [];
      list.unshift(newProduct);
      localStorage.setItem('teezone_custom_products', JSON.stringify(list));
      return newProduct;
    }
  },

  // Admin update product
  async updateProduct(id, productData) {
    try {
      const response = await apiClient.put(`/admin/products/${id}`, productData);
      return response.data;
    } catch (err) {
      console.warn('Backend update failed, updating locally:', err.message);
      const stored = localStorage.getItem('teezone_custom_products');
      if (stored) {
        let list = JSON.parse(stored);
        list = list.map(p => (String(p.id) === String(id) ? { ...p, ...productData } : p));
        localStorage.setItem('teezone_custom_products', JSON.stringify(list));
      }
      return { id, ...productData };
    }
  },

  // Admin delete product
  async deleteProduct(id) {
    try {
      await apiClient.delete(`/admin/products/${id}`);
      return true;
    } catch (err) {
      console.warn('Backend delete failed, removing locally:', err.message);
      const stored = localStorage.getItem('teezone_custom_products');
      if (stored) {
        let list = JSON.parse(stored);
        list = list.filter(p => String(p.id) !== String(id));
        localStorage.setItem('teezone_custom_products', JSON.stringify(list));
      }
      return true;
    }
  }
};
