'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronDown,
  Tag,
  Package,
  Plus,
  Edit,
  Trash2,
  X,
  Upload,
  Loader2,
  LogOut,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Search,
} from 'lucide-react';
import Image from 'next/image';
import { products as staticProducts } from '@/lib/data';

// ─── Constants ───────────────────────────────────────────────────────────────

const BRANDS = ['V-Guard', 'Zero B', 'Wilo', 'Bluewave India', 'Pure Energy'];

const CATEGORIES = [
  'Heat Pumps',
  'Solar Water Heaters',
  'Water Heaters',
  'Pumping Segments',
  'Water Treatment',
  'Swimming Pool',
  'On-Grid PV Inverters',
  'Solar Panels',
  'Solar Off-Grid System with Battery and Panel',
  'Solar Off-Grid Inverter',
  'Smart Energy Storage',
  'Solar Battery',
  'Inverter',
];

const SUBCATEGORIES = [
  'Domestic',
  'Commercial',
  'Pressure Pump',
  'Inline / Circulation Pump',
  'Submersible Pumpset',
  'Borewell Submersible Pumpset',
  'Borewell Submersible Pumpset Control Panel',
  'Softeners',
  'RO Purifiers',
  'Commercial RO',
  'UV Purifiers',
  'Filters',
  'Alkaline Purifiers',
  'Pool Accessories',
  'Pool Pumps & Filtration',
  'Pool Chemicals',
  'Swimming Pool',
];

interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  subCategory?: string;
  description: string;
  image: string;
  features: string[];
  specs: Record<string, string>;
  inStock: boolean;
  hsn_code?: string;
  sac_code?: string;
}

// ─── Product Card ─────────────────────────────────────────────────────────────

function ProductAdminCard({
  product,
  onEdit,
  onDelete,
}: {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:border-slate-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 gap-4">
        {/* Clickable area for expanding */}
        <div
          className="flex items-center gap-4 cursor-pointer flex-1 min-w-0"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-blue-50/50 shrink-0 border border-slate-100 flex items-center justify-center">
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-contain p-2"
                referrerPolicy="no-referrer"
                unoptimized={true}
                sizes="64px"
              />
            ) : (
              <Package size={24} className="text-slate-300" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="px-2.5 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black uppercase tracking-wider">
                {product.brand}
              </span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                ID: {product.id}
              </span>
            </div>
            <h3 className="font-bold text-sm text-blue-950 line-clamp-1 leading-snug">
              {product.name}
            </h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-[10px] text-slate-500 font-semibold">{product.category}</span>
              {product.subCategory && (
                <>
                  <span className="text-[10px] text-slate-300">/</span>
                  <span className="text-[10px] text-slate-500 font-medium">{product.subCategory}</span>
                </>
              )}
              {product.hsn_code && (
                <>
                  <span className="text-[10px] text-slate-300">·</span>
                  <span className="text-[10px] text-slate-500 font-medium">HSN: {product.hsn_code}</span>
                </>
              )}
              {product.sac_code && (
                <>
                  <span className="text-[10px] text-slate-300">·</span>
                  <span className="text-[10px] text-slate-500 font-medium">SAC: {product.sac_code}</span>
                </>
              )}
              <span className="text-[10px] text-slate-300">·</span>
              <span
                className={`text-[10px] font-black uppercase tracking-wider ${
                  product.inStock ? 'text-emerald-600' : 'text-red-500'
                }`}
              >
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <button
            onClick={onEdit}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300"
            title="Edit Product"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={onDelete}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-300"
            title="Delete Product"
          >
            <Trash2 size={16} />
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-100 transition-all duration-300"
          >
            <ChevronDown
              size={16}
              className={`transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 pt-2 border-t border-slate-50 bg-slate-50/30 space-y-4">
              {/* HSN & SAC Info */}
              {(product.hsn_code || product.sac_code) && (
                <div className="flex gap-6 border-b border-slate-100 pb-3">
                  {product.hsn_code && (
                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">HSN Code</h4>
                      <p className="text-xs font-bold text-blue-950">{product.hsn_code}</p>
                    </div>
                  )}
                  {product.sac_code && (
                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">SAC Code</h4>
                      <p className="text-xs font-bold text-blue-950">{product.sac_code}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Description */}
              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                  Description
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {product.description}
                </p>
              </div>

              {/* Highlights */}
              {product.features && product.features.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                    Highlights / Features
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {product.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 shrink-0" />
                        <span className="font-medium">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Technical Specifications */}
              {product.specs && Object.keys(product.specs).length > 0 && (
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    Specifications
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {Object.entries(product.specs).map(([key, value]) => (
                      <div key={key} className="bg-white border border-slate-100 rounded-xl p-3 shadow-sm">
                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-0.5">
                          {key}
                        </div>
                        <div className="text-xs font-bold text-blue-950">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Admin Panel ────────────────────────────────────────────────────────

export default function AdminProductsPage() {
  const { status } = useSession();
  const router = useRouter();

  // Authentication check
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  // Catalog state
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState('');

  // Search/Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [brandFilter, setBrandFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');

  // Delete Confirmation Modal State
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form Fields
  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('');
  const [formBrand, setFormBrand] = useState('V-Guard');
  const [formBrandCustom, setFormBrandCustom] = useState('');
  const [brandMode, setBrandMode] = useState<'select' | 'custom'>('select');

  const [formCategory, setFormCategory] = useState('Heat Pumps');
  const [formCategoryCustom, setFormCategoryCustom] = useState('');
  const [categoryMode, setCategoryMode] = useState<'select' | 'custom'>('select');

  const [formSubCategory, setFormSubCategory] = useState('Domestic');
  const [formSubCategoryCustom, setFormSubCategoryCustom] = useState('');
  const [subCategoryMode, setSubCategoryMode] = useState<'select' | 'custom'>('select');

  const [formDescription, setFormDescription] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formInStock, setFormInStock] = useState(true);
  const [formHsnCode, setFormHsnCode] = useState('');
  const [formSacCode, setFormSacCode] = useState('');

  // Feature entries
  const [featuresList, setFeaturesList] = useState<string[]>([]);
  const [featureInput, setFeatureInput] = useState('');

  // Spec entries
  const [specsList, setSpecsList] = useState<Array<{ key: string; val: string }>>([]);
  const [specKeyInput, setSpecKeyInput] = useState('');
  const [specValInput, setSpecValInput] = useState('');

  // Form saving status
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<any>(null);

  // File Upload state
  const [uploading, setUploading] = useState(false);

  // Fetch products
  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/products', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData.error || 'Failed to load products.');
      }
    } catch (err) {
      console.error(err);
      setError('A network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchProducts();
    }
  }, [status]);

  // Image Upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setFormImage(data.url);
      } else {
        alert(data.error || 'Failed to upload image.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred during file upload.');
    } finally {
      setUploading(false);
    }
  };

  // Features Actions
  const addFeature = () => {
    if (!featureInput.trim()) return;
    setFeaturesList((prev) => [...prev, featureInput.trim()]);
    setFeatureInput('');
  };

  const removeFeature = (idx: number) => {
    setFeaturesList((prev) => prev.filter((_, i) => i !== idx));
  };

  // Specs Actions
  const addSpec = () => {
    if (!specKeyInput.trim() || !specValInput.trim()) return;
    setSpecsList((prev) => [...prev, { key: specKeyInput.trim(), val: specValInput.trim() }]);
    setSpecKeyInput('');
    setSpecValInput('');
  };

  const removeSpec = (idx: number) => {
    setSpecsList((prev) => prev.filter((_, i) => i !== idx));
  };

  // Open modal for add
  const handleOpenAdd = () => {
    setModalMode('add');
    setFormId('');
    setFormName('');
    setFormBrand('V-Guard');
    setFormBrandCustom('');
    setBrandMode('select');
    setFormCategory('Heat Pumps');
    setFormCategoryCustom('');
    setCategoryMode('select');
    setFormSubCategory('Domestic');
    setFormSubCategoryCustom('');
    setSubCategoryMode('select');
    setFormDescription('');
    setFormImage('');
    setFormInStock(true);
    setFormHsnCode('');
    setFormSacCode('');
    setFeaturesList([]);
    setSpecsList([]);
    setFormError(null);
    setModalOpen(true);
  };

  // Open modal for edit
  const handleOpenEdit = (product: Product) => {
    setModalMode('edit');
    setFormId(product.id);
    setFormName(product.name);

    if (BRANDS.includes(product.brand)) {
      setFormBrand(product.brand);
      setBrandMode('select');
    } else {
      setFormBrandCustom(product.brand);
      setBrandMode('custom');
    }

    if (CATEGORIES.includes(product.category)) {
      setFormCategory(product.category);
      setCategoryMode('select');
    } else {
      setFormCategoryCustom(product.category);
      setCategoryMode('custom');
    }

    if (product.subCategory) {
      if (SUBCATEGORIES.includes(product.subCategory)) {
        setFormSubCategory(product.subCategory);
        setSubCategoryMode('select');
      } else {
        setFormSubCategoryCustom(product.subCategory);
        setSubCategoryMode('custom');
      }
    } else {
      setFormSubCategory('');
      setSubCategoryMode('select');
    }

    setFormDescription(product.description);
    setFormImage(product.image);
    setFormInStock(product.inStock);
    setFormHsnCode(product.hsn_code || '');
    setFormSacCode(product.sac_code || '');
    setFeaturesList(product.features || []);

    const loadedSpecs = Object.entries(product.specs || {}).map(([key, val]) => ({
      key,
      val: String(val),
    }));
    setSpecsList(loadedSpecs);

    setFormError(null);
    setModalOpen(true);
  };

  // Submit Handler
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);

    const brandVal = brandMode === 'select' ? formBrand : formBrandCustom.trim();
    const categoryVal = categoryMode === 'select' ? formCategory : formCategoryCustom.trim();
    const subCategoryVal = subCategoryMode === 'select' ? formSubCategory : formSubCategoryCustom.trim();

    if (!brandVal) {
      setFormError({ brand: ['Brand is required.'] });
      setSaving(false);
      return;
    }
    if (!categoryVal) {
      setFormError({ category: ['Category is required.'] });
      setSaving(false);
      return;
    }

    const payload = {
      id: formId.trim(),
      name: formName.trim(),
      brand: brandVal,
      category: categoryVal,
      subCategory: subCategoryVal || null,
      description: formDescription.trim(),
      image: formImage.trim(),
      features: featuresList,
      specs: specsList.reduce((acc, current) => {
        acc[current.key] = current.val;
        return acc;
      }, {} as Record<string, string>),
      inStock: formInStock,
      hsn_code: formHsnCode.trim() || null,
      sac_code: formSacCode.trim() || null,
    };

    try {
      const url = '/api/admin/products';
      const method = modalMode === 'add' ? 'POST' : 'PATCH';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setModalOpen(false);
        fetchProducts();
      } else {
        const data = await res.json();
        setFormError(data.error || 'Failed to save product.');
      }
    } catch (err) {
      console.error(err);
      setFormError('A network error occurred.');
    } finally {
      setSaving(false);
    }
  };

  // Delete Handler
  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/admin/products?id=${encodeURIComponent(deleteId)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setDeleteId(null);
        fetchProducts();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete product.');
      }
    } catch (err) {
      console.error(err);
      alert('A network error occurred.');
    }
  };

  // Memoized lists of brands/categories present in data for filter
  const filterBrands = useMemo(() => {
    const list = Array.from(new Set(products.map((p) => p.brand)));
    return list.filter(Boolean);
  }, [products]);

  const filterCategories = useMemo(() => {
    const list = Array.from(new Set(products.map((p) => p.category)));
    return list.filter(Boolean);
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchBrand = brandFilter === 'all' || p.brand === brandFilter;
      const matchCategory = categoryFilter === 'all' || p.category === categoryFilter;
      return matchSearch && matchBrand && matchCategory;
    });
  }, [products, searchQuery, brandFilter, categoryFilter]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === 'unauthenticated') return null;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 xl:px-12">
      <div className="max-w-5xl mx-auto">
        {/* ── Header ──────────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                <Package size={20} />
              </div>
              <h1 className="text-3xl font-black text-blue-950 tracking-tight">Products Catalog</h1>
            </div>
            <p className="text-slate-500 font-medium text-sm">
              Manage database catalog products, update metadata, specifications, and upload images.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={fetchProducts}
              className="flex items-center justify-center w-11 h-11 rounded-2xl bg-white border border-slate-200 hover:border-blue-200 hover:text-blue-600 transition-all duration-300 text-slate-500"
              title="Refresh Catalog"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 shadow-lg shadow-blue-200"
            >
              <Plus size={16} />
              Add Product
            </button>
            <button
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
              className="p-3 bg-white border border-red-100 text-red-500 hover:bg-red-50 rounded-2xl transition-all duration-300"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* ── Filters & Search ────────────────────────────────────────────────── */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-5 sm:p-6 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search products by ID, name, or description…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Brand filter */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Brand</span>
              <select
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                className="px-3.5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 focus:outline-none"
              >
                <option value="all">All Brands</option>
                {filterBrands.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* Category filter */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Category</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3.5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 focus:outline-none max-w-[200px]"
              >
                <option value="all">All Categories</option>
                {filterCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ── Product List ───────────────────────────────────────────────────── */}
        <div className="space-y-4">
          {error && (
            <div className="flex items-center gap-3 bg-red-50 text-red-600 px-5 py-4 rounded-2xl border border-red-100 text-sm font-medium">
              <AlertTriangle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm gap-4">
              <Loader2 size={36} className="text-blue-600 animate-spin" />
              <p className="text-slate-400 text-sm font-semibold">Loading product catalog…</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm text-slate-400">
              <Package size={48} className="mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-black text-blue-950 mb-1">No products found</h3>
              <p className="text-sm text-slate-400 font-medium">
                Try adjusting your search query or filters.
              </p>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <ProductAdminCard
                key={product.id}
                product={product}
                onEdit={() => handleOpenEdit(product)}
                onDelete={() => setDeleteId(product.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* ── ADD/EDIT PRODUCT MODAL ──────────────────────────────────────────── */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && !saving && setModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-8 pt-7 pb-5 border-b border-slate-100 sticky top-0 bg-white z-10">
                <div>
                  <h2 className="text-xl font-black text-blue-950">
                    {modalMode === 'add' ? 'Add Product' : 'Edit Product'}
                  </h2>
                  <p className="text-slate-400 text-xs font-semibold mt-0.5">
                    {modalMode === 'add'
                      ? 'Insert a new item into catalog'
                      : `Update product settings: ID ${formId}`}
                  </p>
                </div>
                <button
                  disabled={saving}
                  onClick={() => setModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all disabled:opacity-55"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleFormSubmit} className="px-8 py-6 space-y-5">
                {formError && typeof formError === 'string' && (
                  <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-xs font-medium flex items-center gap-2">
                    <AlertTriangle size={16} />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* ID */}
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5 ml-1">
                      Product ID *
                    </label>
                    <input
                      required
                      disabled={modalMode === 'edit' || saving}
                      type="text"
                      placeholder="e.g. vg-hp-vhp150"
                      value={formId}
                      onChange={(e) => setFormId(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                    {modalMode === 'add' && (
                      <span className="text-[9px] text-slate-400 font-bold ml-1 block mt-1">
                        Use lowercase letters, numbers, hyphens, and underscores only.
                      </span>
                    )}
                    {formError?.id && (
                      <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{formError.id[0]}</p>
                    )}
                  </div>

                  {/* Name */}
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5 ml-1">
                      Product Name *
                    </label>
                    <input
                      required
                      disabled={saving}
                      type="text"
                      placeholder="e.g. V-Guard Heat Pump Water Heater VHP150"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all disabled:opacity-60"
                    />
                    {formError?.name && (
                      <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{formError.name[0]}</p>
                    )}
                  </div>
                </div>

                {/* Brand */}
                <div>
                  <div className="flex items-center justify-between mb-1.5 ml-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                      Brand *
                    </label>
                    <button
                      type="button"
                      onClick={() => setBrandMode(brandMode === 'select' ? 'custom' : 'select')}
                      className="text-[9px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest"
                    >
                      {brandMode === 'select' ? 'Or Enter Custom Brand' : 'Select standard brand'}
                    </button>
                  </div>
                  {brandMode === 'select' ? (
                    <select
                      disabled={saving}
                      value={formBrand}
                      onChange={(e) => setFormBrand(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                    >
                      {BRANDS.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      required
                      disabled={saving}
                      type="text"
                      placeholder="e.g. MyBrand Solutions"
                      value={formBrandCustom}
                      onChange={(e) => setFormBrandCustom(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                    />
                  )}
                  {formError?.brand && (
                    <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{formError.brand[0]}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Category */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5 ml-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                        Category *
                      </label>
                      <button
                        type="button"
                        onClick={() => setCategoryMode(categoryMode === 'select' ? 'custom' : 'select')}
                        className="text-[9px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest"
                      >
                        {categoryMode === 'select' ? 'Custom' : 'Standard'}
                      </button>
                    </div>
                    {categoryMode === 'select' ? (
                      <select
                        disabled={saving}
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        required
                        disabled={saving}
                        type="text"
                        placeholder="e.g. Energy Audits"
                        value={formCategoryCustom}
                        onChange={(e) => setFormCategoryCustom(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                      />
                    )}
                    {formError?.category && (
                      <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{formError.category[0]}</p>
                    )}
                  </div>

                  {/* SubCategory */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5 ml-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                        Subcategory <span className="font-medium normal-case text-slate-400">(optional)</span>
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setSubCategoryMode(subCategoryMode === 'select' ? 'custom' : 'select')
                        }
                        className="text-[9px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest"
                      >
                        {subCategoryMode === 'select' ? 'Custom' : 'Standard'}
                      </button>
                    </div>
                    {subCategoryMode === 'select' ? (
                      <select
                        disabled={saving}
                        value={formSubCategory}
                        onChange={(e) => setFormSubCategory(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                      >
                        <option value="">None / Standard category level</option>
                        {SUBCATEGORIES.map((sc) => (
                          <option key={sc} value={sc}>
                            {sc}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        disabled={saving}
                        type="text"
                        placeholder="e.g. Ultrafiltration"
                        value={formSubCategoryCustom}
                        onChange={(e) => setFormSubCategoryCustom(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                      />
                    )}
                    {formError?.subCategory && (
                      <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{formError.subCategory[0]}</p>
                    )}
                  </div>
                </div>

                {/* HSN & SAC Codes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5 ml-1">
                      HSN Code
                    </label>
                    <input
                      disabled={saving}
                      type="text"
                      placeholder="e.g. 84191920"
                      value={formHsnCode}
                      onChange={(e) => setFormHsnCode(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5 ml-1">
                      SAC Code
                    </label>
                    <input
                      disabled={saving}
                      type="text"
                      placeholder="e.g. 998719"
                      value={formSacCode}
                      onChange={(e) => setFormSacCode(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5 ml-1">
                    Description *
                  </label>
                  <textarea
                    required
                    disabled={saving}
                    rows={4}
                    placeholder="Enter descriptive catalog details for the product…"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all resize-none"
                  />
                  {formError?.description && (
                    <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{formError.description[0]}</p>
                  )}
                </div>

                {/* Image upload */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5 ml-1">
                    Image URL *
                  </label>
                  <div className="flex gap-2">
                    <input
                      required
                      disabled={saving}
                      type="text"
                      placeholder="e.g. /uploads/myimage.jpg or web url"
                      value={formImage}
                      onChange={(e) => setFormImage(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                    />
                    <label className="relative shrink-0 flex items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl px-4 cursor-pointer font-bold text-xs uppercase tracking-wider select-none border border-blue-100 transition-all duration-300">
                      {uploading ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <span className="flex items-center gap-1.5">
                          <Upload size={14} /> Upload
                        </span>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading || saving}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {formImage && (
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-50 border border-slate-200 p-1 mt-3">
                      <Image
                        src={formImage}
                        alt="Product preview"
                        fill
                        className="object-contain"
                        unoptimized={true}
                      />
                    </div>
                  )}
                  {formError?.image && (
                    <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{formError.image[0]}</p>
                  )}
                </div>

                {/* In Stock */}
                <div className="flex items-center gap-3 px-1">
                  <input
                    disabled={saving}
                    type="checkbox"
                    id="formInStock"
                    checked={formInStock}
                    onChange={(e) => setFormInStock(e.target.checked)}
                    className="w-4.5 h-4.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 transition-all accent-blue-600"
                  />
                  <label htmlFor="formInStock" className="text-xs font-bold text-slate-600 cursor-pointer">
                    In Stock (Allow clients to place direct inquiries, else marked as Out of stock)
                  </label>
                </div>

                {/* Highlights / Features (Array) */}
                <div className="border-t border-slate-100 pt-4">
                  <h3 className="text-sm font-black text-blue-950 mb-3 ml-1">Highlights / Features</h3>
                  <div className="flex gap-2 mb-3">
                    <input
                      disabled={saving}
                      type="text"
                      placeholder="Add highlight line (e.g. Slim 75mm Design)"
                      value={featureInput}
                      onChange={(e) => setFeatureInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                    />
                    <button
                      type="button"
                      onClick={addFeature}
                      className="px-4 py-2 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl text-xs font-black hover:bg-blue-100 transition-all"
                    >
                      Add
                    </button>
                  </div>
                  {featuresList.length > 0 && (
                    <ul className="space-y-1.5 max-h-40 overflow-y-auto bg-slate-50/50 border border-slate-100 rounded-2xl p-4 [scrollbar-width:thin]">
                      {featuresList.map((feat, idx) => (
                        <li
                          key={idx}
                          className="flex items-center justify-between gap-4 bg-white border border-slate-100 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-700 shadow-sm"
                        >
                          <span className="line-clamp-2 leading-relaxed">{feat}</span>
                          <button
                            type="button"
                            onClick={() => removeFeature(idx)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded-lg shrink-0 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  {formError?.features && (
                    <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{formError.features[0]}</p>
                  )}
                </div>

                {/* Technical Specifications (Object) */}
                <div className="border-t border-slate-100 pt-4">
                  <h3 className="text-sm font-black text-blue-950 mb-3 ml-1">Technical Specifications</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                    <input
                      disabled={saving}
                      type="text"
                      placeholder="Spec Parameter (e.g. Flow Rate)"
                      value={specKeyInput}
                      onChange={(e) => setSpecKeyInput(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                    />
                    <div className="flex gap-2">
                      <input
                        disabled={saving}
                        type="text"
                        placeholder="Spec Value (e.g. 10 m3/h)"
                        value={specValInput}
                        onChange={(e) => setSpecValInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSpec())}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                      />
                      <button
                        type="button"
                        onClick={addSpec}
                        className="px-4 py-2 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl text-xs font-black hover:bg-blue-100 transition-all shrink-0"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                  {specsList.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto bg-slate-50/50 border border-slate-100 rounded-2xl p-4 [scrollbar-width:thin]">
                      {specsList.map((spec, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-4 bg-white border border-slate-100 rounded-xl px-3 py-2 text-xs shadow-sm"
                        >
                          <div className="min-w-0">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">
                              {spec.key}
                            </span>
                            <span className="font-bold text-blue-950 truncate block">{spec.val}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeSpec(idx)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded-lg shrink-0 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {formError?.specs && (
                    <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{formError.specs[0]}</p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <button
                    disabled={saving}
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="flex-1 py-3 border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={saving}
                    type="submit"
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-xs font-black uppercase tracking-widest text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {saving && <RefreshCw size={14} className="animate-spin" />}
                    {saving ? 'Saving…' : 'Save Product'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── DELETE CONFIRMATION MODAL ───────────────────────────────────────── */}
      <AnimatePresence>
        {deleteId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && setDeleteId(null)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 10 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 text-center"
            >
              <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
                <AlertTriangle size={28} />
              </div>
              <h3 className="text-lg font-black text-blue-950 mb-2">Delete Product</h3>
              <p className="text-slate-500 font-medium text-sm mb-6">
                Are you sure you want to delete <span className="font-bold text-blue-950">ID &apos;{deleteId}&apos;</span>?
                This action is permanent and cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 rounded-xl text-xs font-black uppercase tracking-widest text-white transition-all"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
