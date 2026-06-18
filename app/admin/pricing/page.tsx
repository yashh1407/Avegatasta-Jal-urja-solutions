'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Tag, RefreshCw, LogOut, Save, AlertTriangle, FileDown, X } from 'lucide-react';
import Footer from '@/components/Footer';
import Image from 'next/image';
import toast from 'react-hot-toast';
import 'react-quill-new/dist/quill.snow.css';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PricingRow {
  product_id: string;
  name: string;
  brand: string;
  category: string;
  image: string;
  dp_price: number | null;
  mrp_price: number | null;
  description: string | null;
  hsn_code: string | null;
  sac_code: string | null;
}

interface RowState {
  dp: string;
  mrp: string;
  description: string;
  fileName?: string;
  saving: boolean;
  saved: boolean;
  dirty: boolean;
  hsn: string;
  sac: string;
  isEditing: boolean;
}

// ─── Skeleton row ─────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr className="border-b border-slate-50">
      {[1, 2, 3, 4, 5].map((i) => (
        <td key={i} className="px-6 py-5">
          <div className="h-3 bg-slate-100 rounded-lg animate-pulse" style={{ width: `${40 + i * 10}%` }} />
        </td>
      ))}
    </tr>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminPricingPage() {
  const { status } = useSession();
  const router = useRouter();

  const [products, setProducts] = useState<PricingRow[]>([]);
  const [rowState, setRowState] = useState<Record<string, RowState>>({});
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState<string | null>(null);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/admin/login');
    else if (status === 'authenticated') fetchPricing();
  }, [status, router]);

  const fetchPricing = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/pricing');
      const data: PricingRow[] = await res.json();
      setProducts(Array.isArray(data) ? data : []);
      const initial: Record<string, RowState> = {};
      for (const p of (Array.isArray(data) ? data : [])) {
        let description = p.description ?? '';
        let fileName = '';
        
        // Extract filename from HTML comment if present
        const match = description.match(/^<!-- FILENAME: (.*?) -->\n/);
        if (match) {
          fileName = match[1];
        }

        initial[p.product_id] = {
          dp: p.dp_price != null ? String(p.dp_price) : '',
          mrp: p.mrp_price != null ? String(p.mrp_price) : '',
          description: description,
          fileName: fileName,
          saving: false,
          saved: false,
          dirty: false,
          hsn: p.hsn_code ?? '',
          sac: p.sac_code ?? '',
          isEditing: false,
        };
      }
      setRowState(initial);
    } catch {
      setProducts([]);
      toast.error('Failed to load pricing. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (productId: string, field: 'dp' | 'mrp' | 'description' | 'fileName' | 'hsn' | 'sac', value: string) => {
    setRowState((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], [field]: value, dirty: true, saved: false },
    }));
  };

  const startEditing = (productId: string) => {
    setEditingProductId(productId);
  };

  const cancelEditing = (productId: string) => {
    const product = products.find((p) => p.product_id === productId);
    if (!product) return;

    let description = product.description ?? '';
    let fileName = '';
    const match = description.match(/^<!-- FILENAME: (.*?) -->\n/);
    if (match) {
      fileName = match[1];
    }

    setRowState((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        dp: product.dp_price != null ? String(product.dp_price) : '',
        mrp: product.mrp_price != null ? String(product.mrp_price) : '',
        description: description,
        fileName: fileName,
        hsn: product.hsn_code ?? '',
        sac: product.sac_code ?? '',
        isEditing: false,
        dirty: false,
      },
    }));
    setEditingProductId(null);
  };

  const handleSave = async (productId: string) => {
    const row = rowState[productId];
    if (!row) return;
    setRowState((prev) => ({ ...prev, [productId]: { ...prev[productId], saving: true } }));
    try {
      const res = await fetch('/api/admin/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          dp_price: row.dp !== '' ? Number(row.dp) : null,
          mrp_price: row.mrp !== '' ? Number(row.mrp) : null,
          description: row.description !== '' ? row.description : null,
          hsn_code: row.hsn !== '' ? row.hsn : null,
          sac_code: row.sac !== '' ? row.sac : null,
        }),
      });
      if (res.ok) {
        setRowState((prev) => ({
          ...prev,
          [productId]: { ...prev[productId], saving: false, saved: true, dirty: false, isEditing: false },
        }));
        // Update the product list to reflect saved values
        setProducts((prev) =>
          prev.map((p) =>
            p.product_id === productId
              ? {
                  ...p,
                  dp_price: row.dp !== '' ? Number(row.dp) : null,
                  mrp_price: row.mrp !== '' ? Number(row.mrp) : null,
                  description: row.description !== '' ? row.description : null,
                  hsn_code: row.hsn !== '' ? row.hsn : null,
                  sac_code: row.sac !== '' ? row.sac : null,
                }
              : p
          )
        );
        setEditingProductId(null);
        toast.success('Pricing saved.');
        setTimeout(() => {
          setRowState((prev) => ({ ...prev, [productId]: { ...prev[productId], saved: false } }));
        }, 2000);
      } else {
        setRowState((prev) => ({ ...prev, [productId]: { ...prev[productId], saving: false } }));
        toast.error('Failed to save pricing.');
      }
    } catch {
      setRowState((prev) => ({ ...prev, [productId]: { ...prev[productId], saving: false } }));
      toast.error('A network error occurred while saving.');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, productId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = ''; // Reset input
    setIsUploading(productId);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/parse-docx', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        const htmlWithFileName = `<!-- FILENAME: ${file.name} -->\n${data.text}`;
        handleChange(productId, 'description', htmlWithFileName);
        handleChange(productId, 'fileName', file.name);
        toast.success('Word document imported.');
      } else {
        toast.error('Failed to parse the Word document.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error uploading file.');
    } finally {
      setIsUploading(null);
    }
  };

  const isIncomplete = (p: PricingRow) => p.dp_price == null || p.mrp_price == null;

  const incompleteCount = products.filter(isIncomplete).length;

  if (status === 'loading' || status === 'unauthenticated') return null;

  return (
    <div className="min-h-screen bg-slate-50">

      <main className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-24 pt-8 pb-16 sm:pb-24">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-200">
                <Tag size={20} />
              </div>
              <h1 className="text-4xl font-black text-brand-950 tracking-tight">Pricing</h1>
            </div>
            <p className="text-slate-500 font-medium">Set dealer and MRP prices for all products.</p>
          </div>

          <div className="flex items-center gap-3">
            {incompleteCount > 0 && !loading && (
              <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-2xl text-sm font-black text-amber-700">
                <AlertTriangle size={14} />
                {incompleteCount} incomplete
              </div>
            )}
            <button
              onClick={fetchPricing}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm font-black text-slate-600 hover:border-brand-200 hover:text-brand-600 transition-all"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
              className="p-2.5 bg-white border border-red-200 rounded-2xl text-red-500 hover:bg-red-50 transition-all"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-8 py-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              All Products ({products.length})
            </h2>
            <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-amber-200 inline-block" />
                Incomplete pricing
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[850px] table-fixed">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[32%]">Product</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[10%]">Brand</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[16%]">Category</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[30%]">Details</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right w-[12%]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center">
                      <p className="text-slate-500 font-medium">No products found.</p>
                    </td>
                  </tr>
                ) : (
                  products.map((product) => {
                    const incomplete = isIncomplete(product);
                    return (
                      <motion.tr
                        key={product.product_id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`transition-colors group ${incomplete ? 'bg-amber-50/40 hover:bg-amber-50/70' : 'hover:bg-slate-50/50'}`}
                      >
                        <td className="px-6 py-5 w-[32%] align-middle">
                          <div className="flex items-center gap-4">
                            {product.image ? (
                              <div className="w-14 h-14 rounded-2xl overflow-hidden border border-slate-200 flex-shrink-0 bg-slate-50 shadow-sm">
                                <Image
                                  src={product.image}
                                  alt={product.name}
                                  width={56}
                                  height={56}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex-shrink-0 shadow-sm" />
                            )}
                            <span className="font-black text-sm text-brand-950 leading-snug block max-w-[260px] break-words">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 w-[10%] align-middle">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-brand-50 text-brand-700 text-xs font-black">
                            {product.brand}
                          </span>
                        </td>
                        <td className="px-6 py-5 w-[16%] align-middle">
                          <span className="text-xs text-slate-500 font-bold block max-w-[150px] break-words">{product.category}</span>
                        </td>
                        <td className="px-6 py-5 w-[30%] align-middle">
                          <div className="flex flex-col gap-1.5 text-xs text-slate-700 py-1">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500 font-semibold text-xs uppercase tracking-wider w-24">DP Price (₹):</span>
                              <span className="font-bold text-slate-800">
                                {product.dp_price != null ? `₹${Number(product.dp_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '—'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500 font-semibold text-xs uppercase tracking-wider w-24">MRP Price (₹):</span>
                              <span className="font-bold text-slate-800">
                                {product.mrp_price != null ? `₹${Number(product.mrp_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '—'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500 font-semibold text-xs uppercase tracking-wider w-24">HSN Code:</span>
                              <span className="font-semibold text-slate-700">
                                {product.hsn_code || '—'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500 font-semibold text-xs uppercase tracking-wider w-24">SAC Code:</span>
                              <span className="font-semibold text-slate-700">
                                {product.sac_code || '—'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right w-[12%] align-middle">
                          <button
                            onClick={() => startEditing(product.product_id)}
                            className="flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-black bg-brand-50 text-brand-600 hover:bg-brand-600 hover:text-white transition-all ml-auto animate-duration-200 shadow-sm hover:shadow-none"
                          >
                            Edit
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {editingProductId && (() => {
          const editingProduct = products.find((p) => p.product_id === editingProductId);
          const editingRowState = rowState[editingProductId];
          if (!editingProduct || !editingRowState) return null;
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
              onClick={(e) => e.target === e.currentTarget && cancelEditing(editingProductId)}
            >
              <motion.div
                initial={{ scale: 0.96, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.96, opacity: 0, y: 10 }}
                className="bg-white rounded-[2rem] shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]"
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between px-8 pt-7 pb-5 border-b border-slate-100">
                  <h2 className="text-lg font-black text-brand-950 flex items-center gap-2">
                    <Tag size={18} className="text-brand-600" />
                    Edit Product Details
                  </h2>
                  <button
                    onClick={() => cancelEditing(editingProductId)}
                    className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-all"
                    aria-label="Close editor"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="px-8 py-6 space-y-5 overflow-y-auto">
                  {/* Product Summary */}
                  <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100/80">
                    {editingProduct.image ? (
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0 bg-white">
                        <Image
                          src={editingProduct.image}
                          alt={editingProduct.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-slate-100 flex-shrink-0" />
                    )}
                    <div>
                      <h3 className="font-bold text-sm text-brand-950 leading-tight">
                        {editingProduct.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 text-[10px] font-black">
                          {editingProduct.brand}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          {editingProduct.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Form Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="pricing-edit-dp" className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">
                        DP Price (₹)
                      </label>
                      <input
                        id="pricing-edit-dp"
                        type="number"
                        min={0}
                        step={0.01}
                        placeholder="0.00"
                        value={editingRowState.dp}
                        onChange={(e) => handleChange(editingProductId, 'dp', e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all font-semibold"
                      />
                    </div>
                    <div>
                      <label htmlFor="pricing-edit-mrp" className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">
                        MRP Price (₹)
                      </label>
                      <input
                        id="pricing-edit-mrp"
                        type="number"
                        min={0}
                        step={0.01}
                        placeholder="0.00"
                        value={editingRowState.mrp}
                        onChange={(e) => handleChange(editingProductId, 'mrp', e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all font-semibold"
                      />
                    </div>
                    <div>
                      <label htmlFor="pricing-edit-hsn" className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">
                        HSN Code
                      </label>
                      <input
                        id="pricing-edit-hsn"
                        type="text"
                        placeholder="e.g. 84191920"
                        value={editingRowState.hsn}
                        onChange={(e) => handleChange(editingProductId, 'hsn', e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all font-semibold"
                      />
                    </div>
                    <div>
                      <label htmlFor="pricing-edit-sac" className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">
                        SAC Code
                      </label>
                      <input
                        id="pricing-edit-sac"
                        type="text"
                        placeholder="e.g. 998719"
                        value={editingRowState.sac}
                        onChange={(e) => handleChange(editingProductId, 'sac', e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all font-semibold"
                      />
                    </div>
                  </div>

                  {/* Docx Import Section */}
                  <div className="flex flex-col gap-2 pt-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">
                        Quotation Word File (.docx)
                      </label>
                      <label className={`cursor-pointer ${isUploading === editingProductId ? 'bg-slate-100 text-slate-400' : 'bg-brand-50 text-brand-600 hover:bg-brand-100'} px-3 py-1.5 rounded-xl text-xs font-black transition-colors flex items-center gap-1.5`}>
                        {isUploading === editingProductId ? (
                          <><RefreshCw size={14} className="animate-spin" /> Importing...</>
                        ) : (
                          <><FileDown size={14} /> Import .docx</>
                        )}
                        <input
                          type="file"
                          accept=".docx"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, editingProductId)}
                          disabled={isUploading === editingProductId}
                        />
                      </label>
                    </div>
                    <div className="min-h-[50px] flex items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      {editingRowState.description ? (
                        <div className="inline-flex items-center gap-3 bg-brand-50 border border-brand-100 px-4 py-2 rounded-xl text-sm font-medium text-brand-700 shadow-sm">
                          <div className="flex items-center gap-2">
                            <FileDown size={16} className="text-brand-500" />
                            <span className="font-bold text-xs max-w-[280px] truncate">{editingRowState.fileName || 'Quotation template attached'}</span>
                          </div>
                          <button
                            onClick={() => {
                              handleChange(editingProductId, 'description', '');
                              handleChange(editingProductId, 'fileName', '');
                            }}
                            className="p-1 hover:bg-brand-200 rounded-lg text-brand-500 hover:text-brand-800 transition-colors ml-2"
                            title="Remove attachment"
                          >
                            <X size={14} strokeWidth={3} />
                          </button>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic font-medium pl-1">
                          No Quotation file imported yet. Import a .docx file to parse features.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="px-8 py-5 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
                  <button
                    type="button"
                    onClick={() => cancelEditing(editingProductId)}
                    disabled={editingRowState.saving}
                    className="px-5 py-2.5 border border-slate-200 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSave(editingProductId)}
                    disabled={editingRowState.saving || isUploading === editingProductId}
                    className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 rounded-xl text-xs font-black text-white transition-all disabled:opacity-60 flex items-center gap-2 shadow-lg shadow-brand-200"
                  >
                    {editingRowState.saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                    {editingRowState.saving ? 'Saving…' : 'Save Details'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
