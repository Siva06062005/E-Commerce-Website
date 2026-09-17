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
        role: data.role // 'ROLE_ADMIN' or 'ROLE_CUSTOMER'
      };
      setUser(authenticatedUser);
      setLoading(false);
      return { success: true, user: authenticatedUser };
    } catch (err) {
      console.warn('Backend login unavailable or credentials invalid, verifying built-in credentials:', err.message);
      
      // Fallback verification for demo/testing without Spring Boot running
      if (email.toLowerCase() === 'admin@teezone.com' && password === 'AdminSecret123!') {
        const adminUser = {
          id: 1,
          name: 'Chief Admin',
          email: 'admin@teezone.com',
          role: 'ROLE_ADMIN'
        };
        const mockJwt = 'mock-jwt-admin-token-' + Date.now();
        setToken(mockJwt);
        setUser(adminUser);
        setLoading(false);
        return { success: true, user: adminUser };
      } else if (email.toLowerCase() === 'demo@example.com' && password === 'Password123!') {
        const custUser = {
          id: 2,
          name: 'Alex Johnson',
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
          const custUser = {
            id: found.id,
            name: found.name,
            email: found.email,
            role: found.role || 'ROLE_CUSTOMER'
          };
          const mockJwt = 'mock-jwt-customer-token-' + Date.now();
          setToken(mockJwt);
          setUser(custUser);
          setLoading(false);
          return { success: true, user: custUser };
        }
      }

      setError('Invalid email or password. For demo, use admin@teezone.com (AdminSecret123!) or demo@example.com (Password123!)');
      setLoading(false);
      return { success: false, message: 'Invalid credentials' };
    }
  };

  // Register handler
  const register = async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/register`, { name, email, password }, { timeout: 3000 });
      const data = res.data;
      setToken(data.token);
      const newUser = {
        id: data.id,
        name: data.name || name,
        email: data.email || email,
        role: data.role || 'ROLE_CUSTOMER'
      };
      setUser(newUser);
      setLoading(false);
      return { success: true, user: newUser };
    } catch (err) {
      console.warn('Backend register unavailable, saving locally for immediate session:', err.message);
      const newUser = {
        id: Date.now(),
        name,
        email,
        password, // For local test validation
        role: 'ROLE_CUSTOMER'
      };
      const existingList = JSON.parse(localStorage.getItem('teezone_registered_users') || '[]');
      existingList.push(newUser);
      localStorage.setItem('teezone_registered_users', JSON.stringify(existingList));

      const mockJwt = 'mock-jwt-customer-token-' + Date.now();
      setToken(mockJwt);
      setUser({ id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role });
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
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};
