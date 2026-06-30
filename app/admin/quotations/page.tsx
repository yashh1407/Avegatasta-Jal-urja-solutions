'use client';

import React, { useState, useEffect } from 'react';
import { Tag, RefreshCw, LogOut, Save, AlertTriangle, FileDown, Plus, Printer, X, Trash2, ChevronDown, ChevronUp, Settings } from 'lucide-react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('@/components/QuillEditor'), { ssr: false });

type LineItem = {
  id: string;
  name: string;
  qty: number;
  mrp: number;
  price: number;
  description: string;
  brand?: string;
  hsn_code?: string;
  sac_code?: string;
};

type QuotationData = {
  quoteNumber: string;
  date: string;
  clientCompany: string;
  clientName: string;
  clientPhone: string;
  items: LineItem[];
  discount: number;
  taxRate: number;
  bankDetails: {
    accountName: string;
    accountNo: string;
    ifsc: string;
    bankName: string;
    branch: string;
  };
  includeBankDetails?: boolean;
  terms: string[];
};

const BRANDS = [
  { name: 'V-Guard', value: '/brands/vguard.png' },
  { name: 'Wilo', value: '/brands/wilo.png' },
  { name: 'Zero B', value: '/brands/zerob.png' },
  { name: 'Bluewave', value: '/brands/bluewave.png' },
];

const DEFAULT_TERMS = [
  'Payment: 100% Advance along with PO.',
  'Delivery: Within 7 working days from date of PO.',
  'Warranty: 1 Year against manufacturing defects.',
  'Validity: This quotation is valid for 15 days.'
];

const DEFAULT_BANK = {
  accountName: 'Avegatasta Jal Urja Solutions',
  accountNo: '1234567890',
  ifsc: 'HDFC0001234',
  bankName: 'HDFC Bank',
  branch: 'Nashik Main Branch'
};

const generateNextQuoteNumber = (savedQuotes: any[]): string => {
  if (!savedQuotes || savedQuotes.length === 0) {
    return 'AVE-001';
  }
  
  let maxNum = 0;
  const regex = /^AVE-(\d+)$/i;
  
  savedQuotes.forEach(q => {
    if (q.quote_number) {
      const match = q.quote_number.match(regex);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) {
          maxNum = num;
        }
      }
    }
  });
  
  return `AVE-${String(maxNum + 1).padStart(3, '0')}`;
};

export default function ProposalBuilderPage() {
  const [data, setData] = useState<QuotationData>({
    quoteNumber: 'AVE-001',
    date: new Date().toISOString().split('T')[0],
    clientCompany: '',
    clientName: '',
    clientPhone: '',
    items: [],
    discount: 0,
    taxRate: 18,
    bankDetails: { ...DEFAULT_BANK },
    includeBankDetails: true,
    terms: [...DEFAULT_TERMS],
  });

  const [mounted, setMounted] = useState(false);
  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [savedQuotations, setSavedQuotations] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Accordion state
  const [openSections, setOpenSections] = useState({
    client: true,
    items: true,
    bank: false,
    terms: false
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    if (type === 'error') toast.error(message);
    else toast.success(message);
  };

  useEffect(() => {
    setMounted(true);
    fetch('/api/admin/pricing')
      .then(r => r.json())
      .then(res => {
        if (Array.isArray(res)) setDbProducts(res);
      })
      .catch(console.error);

    fetchSavedQuotations();

    const params = new URLSearchParams(window.location.search);
    const loadQuote = params.get('load');
    if (loadQuote) {
      loadQuotation(loadQuote);
    }
  }, []);

  const fetchSavedQuotations = () => {
    fetch('/api/admin/quotations')
      .then(r => r.json())
      .then(res => {
        if (res.quotations) {
          setSavedQuotations(res.quotations);
          
          const params = new URLSearchParams(window.location.search);
          const loadQuote = params.get('load');
          if (!loadQuote) {
            setData(prev => {
              if (!prev.quoteNumber || prev.quoteNumber === 'AVE-001' || prev.quoteNumber.startsWith('QT-')) {
                return { ...prev, quoteNumber: generateNextQuoteNumber(res.quotations) };
              }
              return prev;
            });
          }
        }
      })
      .catch(() => toast.error('Failed to load saved quotations.'));
  };

  const saveQuotation = async () => {
    if (!data.quoteNumber) {
      showToast('Quote # is required.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quote_number: data.quoteNumber,
          client_name: data.clientCompany || data.clientName || 'Unknown Client',
          canvas_data: [{ type: '_v2_structured_data', content: data }] 
          // We wrap it in an array to trick the DB constraint which expects JSON array, and tag it so we know it's new format.
        })
      });
      if (res.ok) {
        showToast('Quotation saved successfully!', 'success');
        fetchSavedQuotations();
      } else {
        const err = await res.json();
        showToast('Error saving: ' + err.error, 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to save', 'error');
    }
    setIsSaving(false);
  };

  const deleteQuotation = async (quote_number: string) => {
    try {
      const res = await fetch(`/api/admin/quotations/${quote_number}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Quotation deleted.', 'success');
        fetchSavedQuotations();
        // Clear the form if they just deleted the currently active quote
        if (data.quoteNumber === quote_number) {
           const remainingQuotes = savedQuotations.filter(q => q.quote_number !== quote_number);
           setData({
             quoteNumber: generateNextQuoteNumber(remainingQuotes),
             date: new Date().toISOString().split('T')[0],
             clientCompany: '',
             clientName: '',
             clientPhone: '',
             items: [],
             discount: 0,
             taxRate: 18,
             bankDetails: { ...DEFAULT_BANK },
             includeBankDetails: true,
             terms: [...DEFAULT_TERMS],
           });
        }
      } else {
        showToast('Failed to delete quotation.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error deleting quotation.', 'error');
    } finally {
      setShowDeleteConfirm(null);
    }
  };

  const loadQuotation = async (quote_number: string) => {
    try {
      const res = await fetch(`/api/admin/quotations/${quote_number}`);
      const responseData = await res.json();
      if (responseData.quotation && responseData.quotation.canvas_data) {
        const parsed = JSON.parse(responseData.quotation.canvas_data);
        
        // Check if it's the new structured format
        if (parsed.length > 0 && parsed[0].type === '_v2_structured_data') {
          setData(parsed[0].content);
          showToast('Quotation loaded successfully!', 'success');
          return;
        }

        // Backward compatibility parsing for old dragged elements
        showToast('Migrating old Drag & Drop quote to new format...', 'success');
        
        const migrated: QuotationData = {
          quoteNumber: responseData.quotation.quote_number || '',
          date: new Date().toISOString().split('T')[0],
          clientCompany: responseData.quotation.client_name || '',
          clientName: '',
          clientPhone: '',
          items: [],
          discount: 0,
          taxRate: 18,
          bankDetails: { ...DEFAULT_BANK },
          terms: [...DEFAULT_TERMS],
        };

        parsed.forEach((el: any) => {
          if (el.type === 'header' && el.content) {
            migrated.quoteNumber = el.content.quoteNumber || migrated.quoteNumber;
            migrated.date = el.content.date || migrated.date;
            migrated.clientCompany = el.content.clientCompany || migrated.clientCompany;
            migrated.clientName = el.content.clientName || '';
            migrated.clientPhone = el.content.clientPhone || '';
          }
          if (el.type === 'pricing_table' && el.content) {
            migrated.discount = el.content.discount || 0;
            migrated.taxRate = el.content.taxRate !== undefined ? el.content.taxRate : 18;
            if (Array.isArray(el.content.items)) {
              migrated.items = el.content.items.map((it: any) => ({
                id: Math.random().toString(36).substring(7),
                name: it.name,
                qty: Number(it.qty) || 1,
                mrp: Number(it.mrp) || 0,
                price: Number(it.price) || 0,
                description: it.description || '',
                hsn_code: it.hsn_code || '',
                sac_code: it.sac_code || ''
              }));
            }
          }
          if (el.type === 'bank_details' && el.content) {
            migrated.bankDetails.accountName = el.content.accountName || '';
            migrated.bankDetails.accountNo = el.content.accountNo || '';
            migrated.bankDetails.ifsc = el.content.ifsc || '';
            migrated.bankDetails.bankName = el.content.bankName || '';
            migrated.bankDetails.branch = el.content.branch || '';
          }
          if (el.type === 'terms' && el.content && Array.isArray(el.content.terms)) {
            migrated.terms = el.content.terms;
          }
        });

        setData(migrated);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load quotation', 'error');
    }
  };

  const handlePrint = () => {
    const originalTitle = document.title;
    const cleanCompanyName = (data.clientCompany || data.clientName || 'Client').replace(/[^a-zA-Z0-9]/g, '_');
    document.title = `Quotation_${data.quoteNumber}_${cleanCompanyName}`;
    window.print();
    document.title = originalTitle;
  };

  // Calculations
  const subtotal = data.items.reduce((acc, item) => acc + (item.qty * item.price), 0);
  const discountAmt = (subtotal * data.discount) / 100;
  const taxable = subtotal - discountAmt;
  const taxAmt = (taxable * data.taxRate) / 100;
  const finalTotal = taxable + taxAmt;

  if (!mounted) return <div className="p-8 text-center text-slate-500 font-bold">Loading Builder...</div>;

  return (
    <div className="h-screen bg-slate-100 flex flex-col lg:flex-row overflow-hidden print:h-auto print:overflow-visible print:block">
      
      {/* --- DELETE CONFIRMATION MODAL --- */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[99999] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 print:hidden">
          <div className="bg-white rounded-2xl shadow-2xl shadow-red-900/10 border border-slate-100 max-w-sm w-full p-6 text-center transform transition-all">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border-8 border-red-50/50">
              <AlertTriangle size={24} className="text-red-500" />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">Delete Quotation</h3>
            <p className="text-sm text-slate-500 font-medium mb-6">
              Are you sure you want to permanently delete quotation <strong className="text-slate-800">{showDeleteConfirm}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => deleteQuotation(showDeleteConfirm)}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 shadow-lg shadow-red-200 transition-colors"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- FORM PANEL (LEFT) --- */}
      <div className="w-full lg:w-[380px] bg-white border-r border-slate-200 h-full overflow-y-auto print:hidden shrink-0 flex flex-col shadow-2xl z-10">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200 sticky top-0 bg-white/90 backdrop-blur-md z-50 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-black text-slate-800 tracking-tight uppercase">Quote Editor</h1>
              <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-widest">Standard Format</p>
            </div>
            <div className="flex gap-2">
              <button onClick={saveQuotation} disabled={isSaving} className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 disabled:opacity-50" title="Save Quotation" aria-label="Save quotation">
                <Save size={18} />
              </button>
              <button onClick={handlePrint} className="w-10 h-10 bg-brand-600 text-white rounded-xl flex items-center justify-center hover:bg-brand-700 transition-colors shadow-lg shadow-brand-200" title="Print Quotation" aria-label="Print quotation">
                <Printer size={18} />
              </button>
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              aria-label="Load saved quotation"
              className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              value={data.quoteNumber}
              onChange={(e) => {
                if (e.target.value) {
                  loadQuotation(e.target.value);
                } else {
                  setData({
                    quoteNumber: generateNextQuoteNumber(savedQuotations),
                    date: new Date().toISOString().split('T')[0],
                    clientCompany: '',
                    clientName: '',
                    clientPhone: '',
                    items: [],
                    discount: 0,
                    taxRate: 18,
                    bankDetails: { ...DEFAULT_BANK },
                    includeBankDetails: true,
                    terms: [...DEFAULT_TERMS],
                  });
                }
              }}
            >
              <option value="">Start New Quotation...</option>
              {savedQuotations.map(q => (
                <option key={q.id} value={q.quote_number}>{q.quote_number} - {q.client_name}</option>
              ))}
            </select>
            {savedQuotations.some(q => q.quote_number === data.quoteNumber) && (
              <button
                onClick={() => setShowDeleteConfirm(data.quoteNumber)}
                className="w-10 h-10 bg-red-50 text-red-600 rounded-lg flex items-center justify-center hover:bg-red-100 transition-colors border border-red-200 shrink-0"
                title="Delete saved quotation"
                aria-label="Delete saved quotation"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Accordion Forms */}
        <div className="p-4 space-y-4">
          
          {/* Client Details Section */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
            <button onClick={() => toggleSection('client')} className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors font-bold text-slate-800">
              <span>Client & Quote Details</span>
              {openSections.client ? <ChevronUp size={18} className="text-slate-500"/> : <ChevronDown size={18} className="text-slate-500"/>}
            </button>
            {openSections.client && (
              <div className="p-4 space-y-4 border-t border-slate-200">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="quote-number" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Quote #</label>
                    <input id="quote-number" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:border-brand-500" value={data.quoteNumber} onChange={e => setData({...data, quoteNumber: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="quote-date" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date</label>
                    <input id="quote-date" type="date" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:border-brand-500" value={data.date} onChange={e => setData({...data, date: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="quote-company" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Company Name</label>
                  <input id="quote-company" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 outline-none focus:border-brand-500" value={data.clientCompany} onChange={e => setData({...data, clientCompany: e.target.value})} placeholder="e.g. Acme Corp" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="quote-contact-person" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Contact Person</label>
                    <input id="quote-contact-person" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 outline-none focus:border-brand-500" value={data.clientName} onChange={e => setData({...data, clientName: e.target.value})} placeholder="e.g. John Doe" />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="quote-phone" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone</label>
                    <input id="quote-phone" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 outline-none focus:border-brand-500" value={data.clientPhone} onChange={e => setData({...data, clientPhone: e.target.value})} placeholder="e.g. +91 9876543210" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Line Items Section */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white overflow-visible">
            <button onClick={() => toggleSection('items')} className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors font-bold text-slate-800">
              <span>Line Items & Pricing</span>
              {openSections.items ? <ChevronUp size={18} className="text-slate-500"/> : <ChevronDown size={18} className="text-slate-500"/>}
            </button>
            {openSections.items && (
              <div className="p-4 space-y-4 border-t border-slate-200 overflow-visible">
                {data.items.length === 0 ? (
                  <div className="text-center py-6 text-sm text-slate-500 italic bg-slate-50 rounded-lg border border-dashed border-slate-300">
                    No items added yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {data.items.map((item, idx) => (
                      <div key={item.id} className="relative bg-slate-50 border border-slate-200 p-3 rounded-lg flex flex-col gap-3 group">
                        
                        <div className="flex justify-between items-start">
                          <div className="flex-1 relative">
                            <label htmlFor={`quote-item-name-${item.id}`} className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Product Name</label>
                            <input
                              id={`quote-item-name-${item.id}`}
                              className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-sm font-bold text-slate-800 outline-none focus:border-brand-500"
                              value={item.name}
                              onFocus={() => setActiveDropdown(idx)}
                              onBlur={() => setTimeout(() => setActiveDropdown(null), 200)}
                              onChange={(e) => {
                                const newItems = [...data.items];
                                newItems[idx].name = e.target.value;
                                setData({...data, items: newItems});
                              }}
                              placeholder="Search or type product..."
                            />
                            {/* Autocomplete Dropdown */}
                            {activeDropdown === idx && (
                              <div className="absolute top-full left-0 mt-1 w-[300px] max-h-[200px] overflow-y-auto bg-white border border-slate-200 shadow-xl rounded-lg z-[99999]">
                                {dbProducts.filter(p => p.name.toLowerCase().includes(item.name.toLowerCase())).length === 0 ? (
                                  <div className="p-3 text-xs text-slate-500 italic">No exact matches.</div>
                                ) : (
                                  dbProducts.filter(p => p.name.toLowerCase().includes(item.name.toLowerCase())).map(p => (
                                    <div 
                                      key={p.product_id}
                                      className="p-2 border-b border-slate-50 hover:bg-brand-50 cursor-pointer transition-colors"
                                      onClick={() => {
                                        const newItems = [...data.items];
                                        newItems[idx].name = p.name;
                                        newItems[idx].brand = p.brand;
                                        if (p.mrp_price) newItems[idx].mrp = Number(p.mrp_price);
                                        if (p.dp_price) newItems[idx].price = Number(p.dp_price);
                                        else if (p.mrp_price) newItems[idx].price = Number(p.mrp_price);
                                        if (p.description) newItems[idx].description = p.description;
                                        newItems[idx].hsn_code = p.hsn_code || '';
                                        newItems[idx].sac_code = p.sac_code || '';
                                        setData({...data, items: newItems});
                                        setActiveDropdown(null);
                                      }}
                                    >
                                      <div className="text-xs font-bold text-slate-800">{p.name}</div>
                                      <div className="text-[10px] text-slate-500 mt-0.5">{p.brand} • DP: ₹{p.dp_price || 0}</div>
                                    </div>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                          
                          <button 
                            onClick={() => {
                              const newItems = [...data.items];
                              newItems.splice(idx, 1);
                              setData({...data, items: newItems});
                            }}
                            className="text-slate-400 hover:text-red-500 transition-colors ml-3 mt-5"
                            aria-label={`Remove item ${idx + 1}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <div className="flex gap-2">
                          <div className="flex-1">
                            <label htmlFor={`quote-item-qty-${item.id}`} className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Qty</label>
                            <input id={`quote-item-qty-${item.id}`} type="number" className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-sm text-center font-bold text-slate-800 outline-none focus:border-brand-500" value={item.qty} onChange={(e) => { const newItems = [...data.items]; newItems[idx].qty = Number(e.target.value); setData({...data, items: newItems}); }} />
                          </div>
                          <div className="flex-1">
                            <label htmlFor={`quote-item-mrp-${item.id}`} className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">MRP (Opt)</label>
                            <input id={`quote-item-mrp-${item.id}`} type="number" className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-sm text-right text-slate-600 outline-none focus:border-brand-500" value={item.mrp || ''} onChange={(e) => { const newItems = [...data.items]; newItems[idx].mrp = Number(e.target.value); setData({...data, items: newItems}); }} placeholder="0" />
                          </div>
                          <div className="flex-[1.5]">
                            <label htmlFor={`quote-item-price-${item.id}`} className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1 block">Selling Price</label>
                            <input id={`quote-item-price-${item.id}`} type="number" className="w-full bg-emerald-50 border border-emerald-300 rounded px-2 py-1.5 text-sm font-bold text-right text-emerald-800 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" value={item.price || ''} onChange={(e) => { const newItems = [...data.items]; newItems[idx].price = Number(e.target.value); setData({...data, items: newItems}); }} placeholder="0" />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label htmlFor={`quote-item-hsn-${item.id}`} className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">HSN Code</label>
                            <input id={`quote-item-hsn-${item.id}`} type="text" className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-sm text-slate-800 outline-none focus:border-brand-500" value={item.hsn_code || ''} onChange={(e) => { const newItems = [...data.items]; newItems[idx].hsn_code = e.target.value; setData({...data, items: newItems}); }} placeholder="e.g. 84191920" />
                          </div>
                          <div>
                            <label htmlFor={`quote-item-sac-${item.id}`} className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">SAC Code</label>
                            <input id={`quote-item-sac-${item.id}`} type="text" className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-sm text-slate-800 outline-none focus:border-brand-500" value={item.sac_code || ''} onChange={(e) => { const newItems = [...data.items]; newItems[idx].sac_code = e.target.value; setData({...data, items: newItems}); }} placeholder="e.g. 998719" />
                          </div>
                        </div>

                        <div className="mt-1">
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Features / Description</label>
                            {item.description && item.description.length > 50 && (
                               <button 
                                 onClick={() => { const newItems = [...data.items]; newItems[idx].description = ''; setData({...data, items: newItems}); }}
                                 className="text-[10px] font-bold text-red-500 hover:text-red-700 uppercase"
                               >
                                 Clear
                               </button>
                            )}
                          </div>
                          {item.description && (item.description.includes('<img') || item.description.length > 200) ? (
                            <div className="flex items-center gap-3 bg-brand-50 border border-brand-100 px-4 py-3 rounded-xl text-sm font-medium text-brand-700 shadow-sm">
                              <FileDown size={16} className="text-brand-500 shrink-0" />
                              <span className="truncate">
                                {item.description?.match(/^<!-- FILENAME: (.*?) -->\n/)?.[1] || 'Document specifications attached'}
                              </span>
                            </div>
                          ) : (
                            <div className="bg-white rounded-xl border border-slate-300 overflow-hidden">
                              <ReactQuill 
                                simple={true}
                                value={item.description || ''}
                                onChange={(content: string) => { const newItems = [...data.items]; newItems[idx].description = content; setData({...data, items: newItems}); }}
                                placeholder="Add bullet points or features..."
                                className="[&_.ql-container]:min-h-[80px] [&_.ql-editor]:min-h-[80px] [&_.ql-container]:max-h-[250px] [&_.ql-editor]:max-h-[250px] [&_.ql-editor]:overflow-y-auto [&_.ql-container]:text-sm [&_.ql-editor]:text-slate-700 [&_.ql-toolbar]:border-x-0 [&_.ql-toolbar]:border-t-0 [&_.ql-toolbar]:bg-slate-50 [&_.ql-container]:border-none [&_.ql-editor_img]:max-w-full [&_.ql-editor_img]:h-auto"
                              />
                            </div>
                          )}
                        </div>

                      </div>
                    ))}
                  </div>
                )}
                
                <button 
                  onClick={() => setData({...data, items: [...data.items, { id: Math.random().toString(36).substring(7), name: '', qty: 1, mrp: 0, price: 0, description: '' }]})}
                  className="w-full py-3 border-2 border-dashed border-brand-200 bg-brand-50 text-brand-600 rounded-lg flex items-center justify-center gap-2 font-bold text-sm hover:bg-brand-100 hover:border-brand-300 transition-colors"
                >
                  <Plus size={16} /> Add Product
                </button>

                <div className="pt-4 mt-4 border-t border-slate-200 grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="quote-discount" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Overall Discount (%)</label>
                    <input id="quote-discount" type="number" className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-sm text-right text-slate-600 outline-none focus:border-brand-500" value={data.discount || ''} onChange={e => setData({...data, discount: Number(e.target.value)})} placeholder="0" />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="quote-tax-rate" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">GST Rate (%)</label>
                    <input id="quote-tax-rate" type="number" className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-sm font-bold text-right text-slate-600 outline-none focus:border-brand-500" value={data.taxRate || ''} onChange={e => setData({...data, taxRate: Number(e.target.value)})} placeholder="0" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bank Details Section */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
            <button onClick={() => toggleSection('bank')} className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors font-bold text-slate-800">
              <span>Bank Details</span>
              {openSections.bank ? <ChevronUp size={18} className="text-slate-500"/> : <ChevronDown size={18} className="text-slate-500"/>}
            </button>
            {openSections.bank && (
              <div className="p-4 space-y-3 border-t border-slate-200">
                {Object.entries(data.bankDetails).map(([key, value]) => (
                  <div key={key} className="space-y-1">
                    <label htmlFor={`quote-bank-${key}`} className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{key.replace(/([A-Z])/g, ' $1').trim()}</label>
                    <input
                      id={`quote-bank-${key}`}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 outline-none focus:border-brand-500"
                      value={value}
                      onChange={(e) => setData({ ...data, bankDetails: { ...data.bankDetails, [key]: e.target.value } })}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Terms Section */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
            <button onClick={() => toggleSection('terms')} className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors font-bold text-slate-800">
              <span>Terms & Conditions</span>
              {openSections.terms ? <ChevronUp size={18} className="text-slate-500"/> : <ChevronDown size={18} className="text-slate-500"/>}
            </button>
            {openSections.terms && (
              <div className="p-4 space-y-3 border-t border-slate-200">
                {data.terms.map((term, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      aria-label={`Term ${idx + 1}`}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 outline-none focus:border-brand-500"
                      value={term}
                      onChange={(e) => {
                        const newTerms = [...data.terms];
                        newTerms[idx] = e.target.value;
                        setData({ ...data, terms: newTerms });
                      }}
                    />
                    <button
                      onClick={() => {
                        const newTerms = [...data.terms];
                        newTerms.splice(idx, 1);
                        setData({ ...data, terms: newTerms });
                      }}
                      className="text-slate-400 hover:text-red-500 transition-colors px-2"
                      aria-label={`Remove term ${idx + 1}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <button 
                  onClick={() => setData({ ...data, terms: [...data.terms, 'New Condition...'] })}
                  className="text-xs font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1"
                >
                  <Plus size={14} /> Add Term
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* --- PREVIEW PANEL (RIGHT) --- */}
      <div className="flex-1 overflow-auto p-4 md:p-6 bg-slate-800 print:p-0 print:bg-white print:overflow-visible print:block">
        
        {/* A4 Canvas Sheet */}
        <div 
          className="relative bg-white shadow-2xl print:shadow-none mx-auto shrink-0" 
          style={{ 
            width: '210mm', 
            minHeight: '297mm',
            padding: '20mm' 
          }}
        >
          
          {/* HEADER */}
          <header className="flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-8">
            <div className="max-w-[50%]">
              <Image src="/logo.webp" alt="Avegatasta" width={180} height={60} className="mb-4" />
              <h2 className="text-slate-900 font-black text-xl tracking-tight leading-tight">AVEGATASTA SOLUTION</h2>
              <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                Flat No. 2, Suryapraksh Apartment, Nashik<br/>
                Phone: +91 96898 81369<br/>
                Email: sales@avegatasta.com
              </p>
            </div>
            <div className="text-right flex flex-col items-end">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Authorized Distributor</p>
              <div className="flex gap-4 mb-6 items-center justify-end h-10">
                {(() => {
                  const itemBrands = data.items.map(i => i.brand).filter(Boolean) as string[];
                  const uniqueBrands = Array.from(new Set(itemBrands));
                  
                  // ONLY show logos for brands that are present in the items. No fallback.
                  const displayBrands = BRANDS.filter(b => 
                    uniqueBrands.some(ub => ub.toLowerCase().includes(b.name.toLowerCase()))
                  );

                  return displayBrands.map(b => (
                    <img key={b.value} src={b.value} alt={b.name} className="h-full w-auto object-contain grayscale opacity-60" />
                  ));
                })()}
              </div>
              
              <div className="mt-2 text-right">
                <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tighter mb-2">Quotation</h1>
                <table className="ml-auto text-sm">
                  <tbody>
                    <tr>
                      <td className="text-slate-500 font-medium pr-4 py-0.5 text-right">Quote #:</td>
                      <td className="font-bold text-slate-800 text-right">{data.quoteNumber}</td>
                    </tr>
                    <tr>
                      <td className="text-slate-500 font-medium pr-4 py-0.5 text-right">Date:</td>
                      <td className="font-bold text-slate-800 text-right">{data.date}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </header>

          {/* QUOTATION FOR */}
          <section className="mb-8">
            <h3 className="text-[10px] font-black text-brand-600 uppercase tracking-widest mb-2">Quotation For:</h3>
            <div className="text-slate-800">
              {data.clientCompany && <div className="font-black text-lg">{data.clientCompany}</div>}
              {data.clientName && <div className="font-bold text-slate-600">{data.clientName}</div>}
              {data.clientPhone && <div className="text-sm text-slate-500 mt-1">Phone: {data.clientPhone}</div>}
            </div>
          </section>

          {/* PRODUCT SPECIFICATIONS */}
          {data.items.some(i => i.description) && (
            <section className="mb-8">
              <h3 className="text-[10px] font-black text-brand-600 uppercase tracking-widest mb-4">Technical Specifications & Features</h3>
              <div className="space-y-6">
                {data.items.filter(i => i.description).map((item, idx) => (
                  <div key={`desc-${item.id}`} className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                    <h4 className="font-black text-slate-800 text-sm mb-3 pb-2 border-b border-slate-200">{item.name}</h4>
                    <div 
                      className="text-[12px] text-slate-700 font-normal leading-relaxed prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0.5 prose-img:max-w-full prose-img:max-h-[400px] print:prose-img:max-h-[220mm] prose-img:object-contain prose-img:break-inside-avoid prose-img:rounded-lg prose-img:border prose-img:border-slate-200"
                      dangerouslySetInnerHTML={{ __html: item.description }}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ITEMS TABLE */}
          <section className="mb-8 min-h-[200px]">
            <h3 className="text-[10px] font-black text-brand-600 uppercase tracking-widest mb-4">Commercial Details</h3>
            <table className="w-full text-left border-collapse table-fixed break-words">
              <thead>
                <tr className="border-b-2 border-slate-800 text-slate-800">
                  <th className="py-3 text-xs font-black uppercase tracking-wider w-[5%] text-center">#</th>
                  <th className="py-3 text-xs font-black uppercase tracking-wider w-[45%]">Description</th>
                  <th className="py-3 text-xs font-black uppercase tracking-wider w-[10%] text-center">Qty</th>
                  <th className="py-3 text-xs font-black uppercase tracking-wider w-[20%] text-right">Unit Price</th>
                  <th className="py-3 text-xs font-black uppercase tracking-wider w-[20%] text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item, idx) => (
                  <tr key={item.id} className="border-b border-slate-200 break-inside-avoid">
                    <td className="py-3 text-sm text-slate-500 text-center font-bold align-top">{idx + 1}</td>
                    <td className="py-3 text-sm font-bold text-slate-800 pr-4 align-top">
                      {item.name}
                      {item.mrp > item.price && (
                        <div className="text-[10px] text-slate-400 font-normal mt-0.5 mb-1">
                          MRP: <span className="line-through decoration-red-400">₹{item.mrp.toLocaleString()}</span> (You save ₹{(item.mrp - item.price).toLocaleString()})
                        </div>
                      )}
                      {(item.hsn_code || item.sac_code) && (
                        <div className="text-[11px] font-bold mt-2 flex gap-3 text-slate-700 print:text-black">
                          {item.hsn_code && (
                            <span className="inline-flex items-center bg-slate-100 print:bg-none px-2 py-0.5 rounded text-slate-700 print:text-black print:px-0">
                              HSN: {item.hsn_code}
                            </span>
                          )}
                          {item.sac_code && (
                            <span className="inline-flex items-center bg-slate-100 print:bg-none px-2 py-0.5 rounded text-slate-700 print:text-black print:px-0">
                              SAC: {item.sac_code}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="py-3 text-sm text-slate-800 text-center font-bold align-top">{item.qty}</td>
                    <td className="py-3 text-sm text-slate-800 text-right font-bold align-top">₹{item.price.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                    <td className="py-3 text-sm text-slate-800 text-right font-black align-top">₹{(item.qty * item.price).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                  </tr>
                ))}
                {data.items.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 italic text-sm">No items added to this quotation.</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* TOTALS */}
            {data.items.length > 0 && (
              <div className="flex justify-end mt-4">
                <div className="w-64">
                  <table className="w-full text-sm">
                    <tbody>
                      <tr>
                        <td className="py-1 text-slate-500">Subtotal</td>
                        <td className="py-1 text-right font-bold text-slate-800">₹{subtotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                      </tr>
                      {data.discount > 0 && (
                        <tr>
                          <td className="py-1 text-slate-500">Discount ({data.discount}%)</td>
                          <td className="py-1 text-right font-bold text-red-500">-₹{discountAmt.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                        </tr>
                      )}
                      <tr>
                        <td className="py-1 text-slate-500">Taxable Amount</td>
                        <td className="py-1 text-right font-bold text-slate-800">₹{taxable.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                      </tr>
                      {data.taxRate > 0 && (
                        <tr>
                          <td className="py-1 text-slate-500">GST ({data.taxRate}%)</td>
                          <td className="py-1 text-right font-bold text-slate-800">₹{taxAmt.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                        </tr>
                      )}
                      <tr className="border-t-2 border-slate-800">
                        <td className="py-2 text-base font-black text-slate-800 uppercase tracking-widest mt-1 block">Total</td>
                        <td className="py-2 text-xl text-right font-black text-brand-600 mt-1">₹{finalTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>

          {/* BOTTOM SECTIONS GRID */}
          <div className="grid grid-cols-2 gap-12 mt-auto pt-8">
            {/* TERMS */}
            <div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Terms & Conditions</h3>
              <ul className="text-[11px] text-slate-600 space-y-1.5 leading-relaxed">
                {data.terms.map((term, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-slate-300 font-black">•</span>
                    <span>{term}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* BANK DETAILS */}
            <div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Bank Details</h3>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-[11px] text-slate-600 space-y-1.5">
                <div className="flex justify-between"><span className="font-bold text-slate-500">Account Name:</span> <span className="font-bold text-slate-800">{data.bankDetails.accountName}</span></div>
                <div className="flex justify-between"><span className="font-bold text-slate-500">Account No:</span> <span className="font-bold text-slate-800">{data.bankDetails.accountNo}</span></div>
                <div className="flex justify-between"><span className="font-bold text-slate-500">IFSC Code:</span> <span className="font-bold text-slate-800">{data.bankDetails.ifsc}</span></div>
                <div className="flex justify-between"><span className="font-bold text-slate-500">Bank Name:</span> <span className="font-bold text-slate-800">{data.bankDetails.bankName}</span></div>
                <div className="flex justify-between"><span className="font-bold text-slate-500">Branch:</span> <span className="font-bold text-slate-800">{data.bankDetails.branch}</span></div>
              </div>
            </div>
          </div>

          {/* SIGNATURES */}
          <div className="flex justify-between items-start mt-16 pt-8">
            <div className="w-48 text-center">
              <div className="border-b border-slate-300 h-12 mb-2"></div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Client Acceptance</div>
            </div>
            <div className="w-48 text-center">
              <div className="border-b border-slate-300 h-12 mb-2 relative">
                {/* Optional Stamp Image Placeholder */}
                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                  <span className="text-xs uppercase font-black tracking-widest transform -rotate-12 border-2 border-slate-900 p-1">Authorized</span>
                </div>
              </div>
              <div className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">For Avegatasta Jal Urja Solutions</div>
              <div className="text-[9px] font-bold text-slate-400 mt-0.5">Authorized Signatory</div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
