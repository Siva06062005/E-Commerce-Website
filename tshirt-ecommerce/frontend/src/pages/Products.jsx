import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, RotateCcw, X, Filter, Store, ShieldCheck } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { productService } from '../services/productService';
import { formatINR } from '../utils/indianCommerceUtils';
import VerifiedBadge from '../components/VerifiedBadge';

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
const COLORS = ['All', 'Black', 'Red', 'Navy', 'Heather Grey', 'White'];
const CATEGORIES_LIST = ['All', 'Developer', 'Streetwear', 'Minimalist'];
const VENDORS_LIST = ['All', 'Bharat Cotton Mills', 'Tirupur Apparel Works', 'Surat Silk & Knits'];

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [selectedVendor, setSelectedVendor] = useState('All');
  const [selectedSize, setSelectedSize] = useState('All');
  const [selectedColor, setSelectedColor] = useState('All');
  const [maxPrice, setMaxPrice] = useState(3000);
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'popular');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await productService.getAllProducts();
        setProducts(data);
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Sync category from URL param if user clicked category from Home
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      const match = CATEGORIES_LIST.find(c => c.toLowerCase() === cat.toLowerCase());
      if (match) setSelectedCategory(match);
    }
  }, [searchParams]);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products
      .filter(item => {
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = item.name.toLowerCase().includes(q);
          const matchDesc = item.description?.toLowerCase().includes(q);
          const matchCategory = item.category?.toLowerCase().includes(q);
          const matchVendor = (item.vendorName || item.supplierName || 'Bharat Cotton Mills').toLowerCase().includes(q);
          if (!matchName && !matchDesc && !matchCategory && !matchVendor) return false;
        }

        // Category filter
        if (selectedCategory !== 'All') {
          if (item.category?.toLowerCase() !== selectedCategory.toLowerCase()) return false;
        }

        // Vendor filter
        if (selectedVendor !== 'All') {
          const itemVendor = item.vendorName || item.supplierName || 'Bharat Cotton Mills';
          if (!itemVendor.toLowerCase().includes(selectedVendor.toLowerCase())) return false;
        }

        // Size filter
        if (selectedSize !== 'All') {
          const hasSize = item.sizes?.some(s => s.size === selectedSize && s.stock > 0);
          if (!hasSize) return false;
        }

        // Color filter
        if (selectedColor !== 'All') {
          if (item.color?.toLowerCase() !== selectedColor.toLowerCase()) return false;
        }

        // Price range filter
        const price = typeof item.price === 'number' ? item.price : parseFloat(item.price || 0);
        if (price > maxPrice) return false;

        return true;
      })
      .sort((a, b) => {
        const priceA = typeof a.price === 'number' ? a.price : parseFloat(a.price || 0);
        const priceB = typeof b.price === 'number' ? b.price : parseFloat(b.price || 0);

        if (sortBy === 'price-asc') return priceA - priceB;
        if (sortBy === 'price-desc') return priceB - priceA;
        if (sortBy === 'newest') return (b.id || 0) - (a.id || 0);
        // Default popular
        return (b.rating || 0) - (a.rating || 0);
      });
  }, [products, searchQuery, selectedCategory, selectedVendor, selectedSize, selectedColor, maxPrice, sortBy]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedVendor('All');
    setSelectedSize('All');
    setSelectedColor('All');
    setMaxPrice(3000);
    setSortBy('popular');
    setSearchParams({});
  };

  const hasActiveFilters = searchQuery || selectedCategory !== 'All' || selectedVendor !== 'All' || selectedSize !== 'All' || selectedColor !== 'All' || maxPrice < 3000;

  return (
    <div className="container animate-fade-in" style={{ padding: '2.5rem 1.5rem 5rem' }}>
      {/* Header Banner */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>
          All T-Shirts & Drops
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Explore our complete collection of developer prints, heavyweight boxy tees, and everyday essentials.
        </p>
      </div>

      {/* Top Controls Bar: Search & Sort */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '2rem',
        padding: '1rem',
        background: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)'
      }}>
        {/* Search Bar */}
        <div style={{ position: 'relative', flex: '1 1 300px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by name, graphic, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '2.4rem' }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Sort By:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="form-select"
            style={{ width: 'auto', minWidth: '160px', padding: '0.65rem 1rem' }}
          >
            <option value="popular">Most Popular</option>
            <option value="newest">Newest Arrivals</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>

          {/* Mobile Filter Toggle Button */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', gap: '6px' }}
          >
            <Filter size={15} /> Filters
          </button>
        </div>
      </div>

      {/* Main Layout: Sidebar Filters + Products Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2.5rem', alignItems: 'start' }}>
        {/* Desktop Filter Sidebar */}
        <aside
          className="card"
          style={{
            position: 'sticky',
            top: '90px',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.75rem',
            padding: '1.5rem'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <SlidersHorizontal size={16} /> Filters
            </h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                style={{ fontSize: '0.75rem', color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
              >
                <RotateCcw size={12} /> Reset
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div>
            <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              Category
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {CATEGORIES_LIST.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    textAlign: 'left',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    fontWeight: selectedCategory === cat ? 700 : 500,
                    background: selectedCategory === cat ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                    color: selectedCategory === cat ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {cat === 'All' ? 'All Categories' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Verified Indian Brands / Vendors Filter */}
          <div>
            <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Store size={14} /> Brand / Mill
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {VENDORS_LIST.map((vnd) => (
                <button
                  key={vnd}
                  onClick={() => setSelectedVendor(vnd)}
                  style={{
                    textAlign: 'left',
                    padding: '0.45rem 0.65rem',
                    borderRadius: '6px',
                    fontSize: '0.82rem',
                    fontWeight: selectedVendor === vnd ? 700 : 500,
                    background: selectedVendor === vnd ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                    color: selectedVendor === vnd ? '#38bdf8' : 'var(--text-secondary)',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>{vnd === 'All' ? 'All Verified Mills' : vnd}</span>
                  {vnd !== 'All' && <VerifiedBadge status="APPROVED" size="sm" />}
                </button>
              ))}
            </div>
          </div>

          {/* Size Filter */}
          <div>
            <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              Size
            </h4>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setSelectedSize('All')}
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  padding: '6px 12px',
                  borderRadius: '6px',
                  background: selectedSize === 'All' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                  color: selectedSize === 'All' ? '#ffffff' : 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                All
              </button>
              {SIZES.map((sz) => (
                <button
                  key={sz}
                  onClick={() => setSelectedSize(sz)}
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '6px 12px',
                    borderRadius: '6px',
                    background: selectedSize === sz ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                    color: selectedSize === sz ? '#ffffff' : 'var(--text-secondary)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Color Filter */}
          <div>
            <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              Color
            </h4>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {COLORS.map((col) => (
                <button
                  key={col}
                  onClick={() => setSelectedColor(col)}
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '5px 10px',
                    borderRadius: '6px',
                    background: selectedColor === col ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                    color: selectedColor === col ? '#ffffff' : 'var(--text-secondary)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  {col}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Slider in INR */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                Max Price
              </h4>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                {formatINR(maxPrice)}
              </span>
            </div>
            <input
              type="range"
              min="499"
              max="3000"
              step="100"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              <span>{formatINR(499)}</span>
              <span>{formatINR(3000)}</span>
            </div>
          </div>
        </aside>

        {/* Products Grid Content */}
        <section>
          {/* Active Chips & Count */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Showing <strong style={{ color: 'var(--text-primary)' }}>{filteredProducts.length}</strong> products
            </span>
            {hasActiveFilters && (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                {selectedCategory !== 'All' && <span className="badge badge-primary">{selectedCategory}</span>}
                {selectedVendor !== 'All' && <span className="badge badge-success">Mill: {selectedVendor}</span>}
                {selectedSize !== 'All' && <span className="badge badge-primary">Size {selectedSize}</span>}
                {selectedColor !== 'All' && <span className="badge badge-primary">{selectedColor}</span>}
                {maxPrice < 3000 && <span className="badge badge-primary">Under {formatINR(maxPrice)}</span>}
              </div>
            )}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
              Loading products...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>No T-Shirts Found</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
                We couldn't find any products matching your current filters. Try changing your search query or reset your filters.
              </p>
              <button onClick={clearFilters} className="btn btn-primary btn-sm">
                <RotateCcw size={14} /> Reset All Filters
              </button>
            </div>
          ) : (
            <div className="product-grid">
              {filteredProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Mobile Drawer Filter */}
      {mobileFilterOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.75)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <div style={{
            width: '85%',
            maxWidth: '340px',
            background: 'var(--bg-secondary)',
            height: '100%',
            padding: '2rem 1.5rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontWeight: 800 }}>Filters</h3>
              <button onClick={() => setMobileFilterOpen(false)} style={{ color: 'var(--text-secondary)' }}>
                <X size={22} />
              </button>
            </div>

            {/* Mobile Category */}
            <div>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Category</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {CATEGORIES_LIST.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      padding: '0.5rem',
                      textAlign: 'left',
                      fontWeight: selectedCategory === cat ? 700 : 500,
                      color: selectedCategory === cat ? 'var(--accent-primary)' : 'var(--text-secondary)'
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Size */}
            <div>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Size</h4>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {['All', ...SIZES].map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      background: selectedSize === sz ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                      color: selectedSize === sz ? '#fff' : 'var(--text-secondary)'
                    }}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setMobileFilterOpen(false)}
              className="btn btn-primary"
              style={{ marginTop: 'auto' }}
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
