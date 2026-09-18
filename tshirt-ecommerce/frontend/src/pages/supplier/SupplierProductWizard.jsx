import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Upload,
  Layers,
  IndianRupee,
  Package,
  Truck,
  Sparkles,
  Info,
  Trash2,
  Star,
  ShieldCheck
} from 'lucide-react';
import { supplierService } from '../../services/supplierService';
import { formatINR } from '../../utils/indianCommerceUtils';

const STEPS = [
  { step: 1, title: "Basic Info", subtitle: "Name & Details" },
  { step: 2, title: "Category", subtitle: "Tax Classification" },
  { step: 3, title: "Variants", subtitle: "Sizes & Colors" },
  { step: 4, title: "Pricing & GST", subtitle: "HSN & Rates" },
  { step: 5, title: "Inventory", subtitle: "Opening Ledger" },
  { step: 6, title: "Images", subtitle: "Product Gallery" },
  { step: 7, title: "Shipping", subtitle: "Weight & Pack" },
  { step: 8, title: "Review", subtitle: "Submit Catalog" }
];

const CATEGORIES = [
  { id: "Streetwear", name: "Streetwear Drops", hsn: "61091000", desc: "Heavyweight boxy cuts & oversized graphic tees" },
  { id: "Developer", name: "Developer Edition", hsn: "61091000", desc: "Terminal syntax, Linux & DevOps apparel" },
  { id: "Minimalist", name: "Minimalist Essentials", hsn: "61091000", desc: "100% Supima combed cotton clean silhouettes" },
  { id: "Graphic Art", name: "Graphic Art Series", hsn: "61091000", desc: "Limited edition screen printed artwork" }
];

const SupplierProductWizard = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form State across the 8 steps
  const [formData, setFormData] = useState({
    // Step 1: Basic Information
    name: '',
    brand: 'TEEZONE Studio',
    description: '',
    color: 'Black',
    badge: 'NEW DROP',

    // Step 2: Category
    category: 'Streetwear',
    hsnCode: '61091000',

    // Step 3: Variants
    selectedSizes: ['S', 'M', 'L', 'XL'],

    // Step 4: Pricing & GST
    price: 34.00, // Stored as INR equivalent or base price
    originalPrice: 44.00,
    gstRate: 12, // 5%, 12%, 18%

    // Step 5: Inventory
    stocks: {
      S: 15,
      M: 30,
      L: 25,
      XL: 15,
      XXL: 10
    },
    lowStockThreshold: 5,

    // Step 6: Images
    images: [
      {
        url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
        isPrimary: true,
        altText: "Front view on deep black fabric"
      },
      {
        url: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80",
        isPrimary: false,
        altText: "Back graphic detail"
      }
    ],
    newImageUrl: '',

    // Step 7: Shipping
    weightGrams: 240,
    lengthCm: 30,
    widthCm: 25,
    heightCm: 2
  });

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSizeToggle = (size) => {
    const list = [...formData.selectedSizes];
    if (list.includes(size)) {
      if (list.length === 1) return; // Keep at least one
      updateField('selectedSizes', list.filter(s => s !== size));
    } else {
      updateField('selectedSizes', [...list, size]);
    }
  };

  const handleStockChange = (size, qty) => {
    setFormData(prev => ({
      ...prev,
      stocks: {
        ...prev.stocks,
        [size]: Math.max(0, parseInt(qty) || 0)
      }
    }));
  };

  const handleAddImage = () => {
    if (!formData.newImageUrl.trim()) return;
    const newImg = {
      url: formData.newImageUrl.trim(),
      isPrimary: formData.images.length === 0,
      altText: formData.name || "Product shot"
    };
    updateField('images', [...formData.images, newImg]);
    updateField('newImageUrl', '');
  };

  const handleSetPrimaryImage = (index) => {
    const updated = formData.images.map((img, i) => ({
      ...img,
      isPrimary: i === index
    }));
    updateField('images', updated);
  };

  const handleRemoveImage = (index) => {
    if (formData.images.length <= 1) return;
    const filtered = formData.images.filter((_, i) => i !== index);
    if (!filtered.some(img => img.isPrimary) && filtered.length > 0) {
      filtered[0].isPrimary = true;
    }
    updateField('images', filtered);
  };

  const validateStep = () => {
    setError('');
    if (currentStep === 1) {
      if (!formData.name.trim()) {
        setError('Please enter a product name');
        return false;
      }
      if (!formData.description.trim()) {
        setError('Please enter product description');
        return false;
      }
    } else if (currentStep === 4) {
      if (!formData.price || formData.price <= 0) {
        setError('Please provide a valid selling price');
        return false;
      }
    } else if (currentStep === 6) {
      if (formData.images.length === 0) {
        setError('At least one product image is required');
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep()) {
      setCurrentStep(prev => Math.min(8, prev + 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setError('');
    setCurrentStep(prev => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError('');

      const primaryImg = formData.images.find(img => img.isPrimary)?.url || formData.images[0]?.url;

      const payload = {
        name: formData.name,
        brand: formData.brand,
        description: formData.description,
        price: Number(formData.price),
        originalPrice: Number(formData.originalPrice || formData.price * 1.2),
        image: primaryImg,
        category: formData.category,
        color: formData.color,
        badge: formData.badge,
        hsnCode: formData.hsnCode,
        gstRate: Number(formData.gstRate),
        weightGrams: Number(formData.weightGrams),
        dimensionsCm: `${formData.lengthCm}x${formData.widthCm}x${formData.heightCm}`,
        sizes: formData.selectedSizes.map(s => ({
          size: s,
          stock: formData.stocks[s] || 10
        }))
      };

      await supplierService.createProductWizard(payload);
      navigate('/supplier');
    } catch (err) {
      console.error('Failed to submit product:', err);
      setError('Error publishing product. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Calculated values for Step 4 pricing
  const gstAmount = ((formData.price * formData.gstRate) / 100).toFixed(2);
  const totalStockCount = formData.selectedSizes.reduce((sum, s) => sum + (formData.stocks[s] || 0), 0);

  return (
    <div className="container animate-fade-in" style={{ padding: '2.5rem 1.5rem 6rem', maxWidth: '960px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <Link to="/supplier" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            <ArrowLeft size={16} /> Back to Supplier Dashboard
          </Link>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 900 }}>New Product Launch Wizard</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Step-by-step compliant catalog onboarding for Indian multi-vendor commerce
          </p>
        </div>
        <div className="badge badge-primary">
          Step {currentStep} of 8
        </div>
      </div>

      {/* Step Tracker Pills */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(8, 1fr)',
        gap: '0.4rem',
        marginBottom: '2rem',
        overflowX: 'auto',
        paddingBottom: '0.5rem'
      }}>
        {STEPS.map(s => {
          const isCompleted = s.step < currentStep;
          const isCurrent = s.step === currentStep;
          return (
            <div
              key={s.step}
              onClick={() => s.step < currentStep && setCurrentStep(s.step)}
              style={{
                background: isCurrent ? 'var(--accent-primary)' : isCompleted ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-secondary)',
                border: `1px solid ${isCurrent ? 'var(--accent-primary)' : isCompleted ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-subtle)'}`,
                color: isCurrent ? '#ffffff' : isCompleted ? 'var(--accent-emerald)' : 'var(--text-muted)',
                borderRadius: '8px',
                padding: '0.6rem 0.4rem',
                textAlign: 'center',
                cursor: isCompleted ? 'pointer' : 'default',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 800 }}>
                {isCompleted ? <Check size={12} style={{ display: 'inline' }} /> : s.step}
              </div>
              <div style={{ fontSize: '0.68rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {s.title}
              </div>
            </div>
          );
        })}
      </div>

      {error && (
        <div style={{
          padding: '1rem',
          borderRadius: '8px',
          background: 'rgba(244, 63, 94, 0.12)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          color: 'var(--accent-rose)',
          marginBottom: '1.5rem',
          fontSize: '0.9rem'
        }}>
          {error}
        </div>
      )}

      {/* Wizard Card Body */}
      <div className="card" style={{ padding: '2.5rem 2rem', marginBottom: '2rem' }}>
        {/* STEP 1: Basic Information */}
        {currentStep === 1 && (
          <div className="animate-fade-in">
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.35rem' }}>Step 1: Basic Information</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
              Define product title, brand identity, and descriptive attributes.
            </p>

            <div className="form-group">
              <label className="form-label">Product Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Bangalore Cyber Noir Oversized Tee"
                value={formData.name}
                onChange={e => updateField('name', e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Brand Label</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.brand}
                  onChange={e => updateField('brand', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Primary Fabric Color</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Jet Black, Heather Grey, Indigo"
                  value={formData.color}
                  onChange={e => updateField('color', e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Promotional Badge Tag</label>
              <select
                className="form-select"
                value={formData.badge}
                onChange={e => updateField('badge', e.target.value)}
              >
                <option value="NEW DROP">NEW DROP</option>
                <option value="BESTSELLER">BESTSELLER</option>
                <option value="LIMITED">LIMITED</option>
                <option value="ESSENTIAL">ESSENTIAL</option>
                <option value="ORGANIC">ORGANIC COTTON</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Product Description *</label>
              <textarea
                className="form-textarea"
                rows={4}
                placeholder="Describe fabric weight (GSM), weave, silhouette, neckline, and wash care instructions..."
                value={formData.description}
                onChange={e => updateField('description', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* STEP 2: Category */}
        {currentStep === 2 && (
          <div className="animate-fade-in">
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.35rem' }}>Step 2: Category Classification</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
              Assign to a curated department and verify Indian HSN tax mapping.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              {CATEGORIES.map(cat => {
                const isSelected = formData.category === cat.id;
                return (
                  <div
                    key={cat.id}
                    onClick={() => {
                      updateField('category', cat.id);
                      updateField('hsnCode', cat.hsn);
                    }}
                    style={{
                      padding: '1.25rem',
                      borderRadius: 'var(--radius-md)',
                      background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-secondary)',
                      border: `2px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)', marginBottom: '0.35rem' }}>
                      {cat.name}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                      {cat.desc}
                    </div>
                    <span className="badge badge-primary">HSN: {cat.hsn}</span>
                  </div>
                );
              })}
            </div>

            <div className="form-group">
              <label className="form-label">HSN Code (Harmonized System of Nomenclature)</label>
              <input
                type="text"
                className="form-input"
                value={formData.hsnCode}
                onChange={e => updateField('hsnCode', e.target.value)}
                placeholder="61091000"
              />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Chapter 61: Articles of apparel and clothing accessories, knitted or crocheted (Cotton T-shirts).
              </span>
            </div>
          </div>
        )}

        {/* STEP 3: Variants */}
        {currentStep === 3 && (
          <div className="animate-fade-in">
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.35rem' }}>Step 3: Manage Variants</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
              Select all sizes offered for this style. SKUs will be automatically mapped.
            </p>

            <label className="form-label" style={{ marginBottom: '0.75rem', display: 'block' }}>Available Size Variants</label>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
              {['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'].map(size => {
                const active = formData.selectedSizes.includes(size);
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => handleSizeToggle(size)}
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '12px',
                      fontWeight: 800,
                      fontSize: '1rem',
                      background: active ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                      color: active ? '#ffffff' : 'var(--text-secondary)',
                      border: `1px solid ${active ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {size}
                  </button>
                );
              })}
            </div>

            <div className="card" style={{ background: 'var(--bg-secondary)', padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-cyan)', marginBottom: '0.5rem' }}>
                <Info size={16} />
                <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>Automated SKU Generation</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                {formData.selectedSizes.length} variant SKUs will be initialized in the catalog (e.g. TEE-{formData.category.toUpperCase().slice(0, 3)}-{formData.selectedSizes[0] || 'M'}).
              </p>
            </div>
          </div>
        )}

        {/* STEP 4: Pricing & GST */}
        {currentStep === 4 && (
          <div className="animate-fade-in">
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.35rem' }}>Step 4: Pricing & GST Slab</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
              Configure base selling price, retail MRP, and applicable GST taxation.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">Selling Price (INR / ₹) *</label>
                <input
                  type="number"
                  step="1"
                  className="form-input"
                  value={formData.price}
                  onChange={e => updateField('price', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Original MRP (INR / ₹)</label>
                <input
                  type="number"
                  step="1"
                  className="form-input"
                  value={formData.originalPrice}
                  onChange={e => updateField('originalPrice', e.target.value)}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.75rem' }}>
              <label className="form-label">GST Tax Slab (Apparel)</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                {[5, 12, 18].map(slab => (
                  <div
                    key={slab}
                    onClick={() => updateField('gstRate', slab)}
                    style={{
                      padding: '1rem',
                      borderRadius: '8px',
                      background: formData.gstRate === slab ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-secondary)',
                      border: `2px solid ${formData.gstRate === slab ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: formData.gstRate === slab ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                      {slab}% GST
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {slab === 5 ? 'Under ₹1000' : slab === 12 ? 'Standard Apparel' : 'Luxury / Premium'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* GST Invoice Preview Card */}
            <div className="card" style={{ background: 'var(--bg-secondary)', border: '1px dashed var(--border-glass)' }}>
              <div style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--accent-emerald)' }}>
                GST Breakdown Estimation (Per Unit)
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Taxable Value:</span>
                <span>{formatINR(formData.price)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Intra-State CGST ({formData.gstRate / 2}%):</span>
                <span>{formatINR(gstAmount / 2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Intra-State SGST ({formData.gstRate / 2}%):</span>
                <span>{formatINR(gstAmount / 2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 800, borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                <span>Final Invoiced Price:</span>
                <span style={{ color: 'var(--accent-primary)' }}>{formatINR(Number(formData.price) + Number(gstAmount))}</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Inventory */}
        {currentStep === 5 && (
          <div className="animate-fade-in">
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.35rem' }}>Step 5: Initial Inventory Ledger</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
              Opening units for each size variant will be recorded directly into the auditable transaction ledger.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              {formData.selectedSizes.map(size => (
                <div key={size} className="card" style={{ background: 'var(--bg-secondary)', padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>Size {size}</span>
                    <span className="badge badge-primary">SKU-{size}</span>
                  </div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Opening Stock Units</label>
                  <input
                    type="number"
                    min="0"
                    className="form-input"
                    value={formData.stocks[size] || 0}
                    onChange={e => handleStockChange(size, e.target.value)}
                  />
                </div>
              ))}
            </div>

            <div className="form-group">
              <label className="form-label">Low-Stock Alert Threshold</label>
              <input
                type="number"
                min="1"
                className="form-input"
                style={{ maxWidth: '200px' }}
                value={formData.lowStockThreshold}
                onChange={e => updateField('lowStockThreshold', parseInt(e.target.value) || 5)}
              />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Supplier dashboard will trigger an alert when any size variant falls below this number.
              </span>
            </div>
          </div>
        )}

        {/* STEP 6: Images */}
        {currentStep === 6 && (
          <div className="animate-fade-in">
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.35rem' }}>Step 6: Product Images Gallery</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
              Add high-resolution product photography. Select the primary thumbnail image.
            </p>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <input
                type="url"
                className="form-input"
                placeholder="Paste public image URL (Unsplash, CDN, or Cloudinary)"
                value={formData.newImageUrl}
                onChange={e => updateField('newImageUrl', e.target.value)}
              />
              <button type="button" className="btn btn-primary" onClick={handleAddImage}>
                <Upload size={16} /> Add Image
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1.25rem' }}>
              {formData.images.map((img, idx) => (
                <div
                  key={idx}
                  style={{
                    position: 'relative',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    border: `2px solid ${img.isPrimary ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                    background: 'var(--bg-secondary)'
                  }}
                >
                  <img
                    src={img.url}
                    alt={img.altText}
                    style={{ width: '100%', height: '180px', objectFit: 'cover' }}
                  />
                  {img.isPrimary && (
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      left: '8px',
                      background: 'var(--accent-primary)',
                      color: 'white',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      fontWeight: 800
                    }}>
                      PRIMARY
                    </div>
                  )}
                  <div style={{
                    padding: '0.65rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'var(--bg-card)'
                  }}>
                    {!img.isPrimary && (
                      <button
                        type="button"
                        onClick={() => handleSetPrimaryImage(idx)}
                        style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600 }}
                      >
                        Make Primary
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      style={{ color: 'var(--accent-rose)', marginLeft: 'auto' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 7: Shipping */}
        {currentStep === 7 && (
          <div className="animate-fade-in">
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.35rem' }}>Step 7: Shipping & Logistics Specs</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
              Package weight and volumetric dimensions for courier rate calculation across Indian pin codes.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">Dead Weight (Grams) *</label>
                <input
                  type="number"
                  min="50"
                  className="form-input"
                  value={formData.weightGrams}
                  onChange={e => updateField('weightGrams', parseInt(e.target.value) || 240)}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Standard heavyweight combed cotton T-shirt: ~240g
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Package Length (cm)</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.lengthCm}
                  onChange={e => updateField('lengthCm', parseInt(e.target.value) || 30)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Package Width (cm)</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.widthCm}
                  onChange={e => updateField('widthCm', parseInt(e.target.value) || 25)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Package Height (cm)</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.heightCm}
                  onChange={e => updateField('heightCm', parseInt(e.target.value) || 2)}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 8: Review & Submit */}
        {currentStep === 8 && (
          <div className="animate-fade-in">
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.35rem' }}>Step 8: Review & Publish Catalog</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
              Verify product details, GST compliance, and opening stock ledger before submitting.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <img
                src={formData.images.find(img => img.isPrimary)?.url || formData.images[0]?.url}
                alt="Product"
                style={{ width: '120px', height: '140px', objectFit: 'cover', borderRadius: '10px' }}
              />
              <div>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span className="badge badge-primary">{formData.category}</span>
                  <span className="badge badge-success">HSN: {formData.hsnCode}</span>
                  <span className="badge badge-sale">{formData.badge}</span>
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '0.5rem' }}>{formData.name}</h3>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>
                  {formatINR(formData.price)} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>{formatINR(formData.originalPrice)}</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {formData.description}
                </p>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              padding: '1.25rem',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)'
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>VARIANTS</div>
                <div style={{ fontWeight: 700 }}>{formData.selectedSizes.join(', ')}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>OPENING STOCK</div>
                <div style={{ fontWeight: 700, color: 'var(--accent-emerald)' }}>{totalStockCount} units</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>GST SLAB</div>
                <div style={{ fontWeight: 700 }}>{formData.gstRate}% (CGST {formData.gstRate / 2}% + SGST {formData.gstRate / 2}%)</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SHIPPING WEIGHT</div>
                <div style={{ fontWeight: 700 }}>{formData.weightGrams}g ({formData.lengthCm}x{formData.widthCm}x{formData.heightCm} cm)</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Wizard Footer Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {currentStep > 1 ? (
          <button type="button" className="btn btn-secondary" onClick={prevStep}>
            <ArrowLeft size={16} /> Previous Step
          </button>
        ) : <div />}

        {currentStep < 8 ? (
          <button type="button" className="btn btn-primary" onClick={nextStep}>
            Continue to {STEPS[currentStep].title} <ArrowRight size={16} />
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={submitting}
            style={{ padding: '0.9rem 2.5rem', fontSize: '1rem' }}
          >
            {submitting ? 'Publishing...' : <><ShieldCheck size={18} /> Publish to Multi-Vendor Catalog</>}
          </button>
        )}
      </div>
    </div>
  );
};

export default SupplierProductWizard;
