'use client';

import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Tag, 
  RefreshCw, 
  LogOut, 
  Save,
  FileDown,
  Plus, 
  Printer, 
  X, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Settings,
  Receipt
} from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';

// ─── Types ────────────────────────────────────────────────────────────────────

interface LineItem {
  id: string;
  name: string;
  brand?: string;
  qty: number;
  unit: string; // e.g. Nos, Sets, Pcs
  price: number;
  mrp: number;
  hsn_code: string;
  sac_code: string;
  description: string;
}

interface BankDetails {
  accountName: string;
  accountNo: string;
  ifsc: string;
  bankName: string;
  branch: string;
}

interface InvoiceData {
  client_id: number | null;
  invoiceNumber: string;
  date: string;
  deliveryNote: string;
  paymentMode: string;
  buyerOrderNo: string;
  workOrderNo: string;
  workOrderDate: string;
  quoteRefNo: string;
  reverseCharge: 'Yes' | 'No';
  clientCompany: string;
  clientAddress: string;
  clientAttn: string;
  clientPhone: string;
  clientGstin: string;
  consigneeSameAsBilling: boolean;
  consigneeCompany: string;
  consigneeAddress: string;
  items: LineItem[];
  discount: number;
  taxType: 'CGST_SGST' | 'IGST';
  taxRate: number; // default 18
  roundOff: boolean;
  bankDetails: BankDetails;
  includeBankDetails?: boolean;
  terms: string;
  jurisdiction: string;
  declaration: string;
}

// ─── Constants & Defaults ─────────────────────────────────────────────────────

const DEFAULT_BANK: BankDetails = {
  accountName: 'AVEGATASTA SOLUTION',
  accountNo: '04750500009935',
  ifsc: 'BARB0NASIKR',
  bankName: 'Bank of Baroda',
  branch: 'Nashik Road'
};

const bankDetailsFromSettings = (
  settings: Record<string, string | null | undefined>,
  fallback: BankDetails = DEFAULT_BANK
): BankDetails => ({
  accountName: settings.bank_account_name || fallback.accountName,
  accountNo: settings.bank_account_no || fallback.accountNo,
  ifsc: settings.bank_ifsc || fallback.ifsc,
  bankName: settings.bank_name || fallback.bankName,
  branch: settings.bank_branch || fallback.branch,
});

const DEFAULT_DECLARATION = 'Certified that the particulars given above are True & Correct';
const DEFAULT_JURISDICTION = 'Subject To Nashik Jurisdiction';
const DEFAULT_TERMS = 'Terms & Conditions - P.T.O.';

const INITIAL_DATA: InvoiceData = {
  client_id: null,
  invoiceNumber: '',
  date: new Date().toISOString().split('T')[0],
  deliveryNote: '',
  paymentMode: 'Account Pay',
  buyerOrderNo: '',
  workOrderNo: '',
  workOrderDate: '',
  quoteRefNo: '',
  reverseCharge: 'No',
  clientCompany: '',
  clientAddress: '',
  clientAttn: '',
  clientPhone: '',
  clientGstin: '',
  consigneeSameAsBilling: true,
  consigneeCompany: '',
  consigneeAddress: '',
  items: [],
  discount: 0,
  taxType: 'CGST_SGST',
  taxRate: 18,
  roundOff: true,
  bankDetails: { ...DEFAULT_BANK },
  includeBankDetails: true,
  terms: DEFAULT_TERMS,
  jurisdiction: DEFAULT_JURISDICTION,
  declaration: DEFAULT_DECLARATION
};

// ─── Number To Words Converter (Indian Numbering System) ────────────────────────

function numberToWords(num: number): string {
  const rounded = Math.round(num);
  if (rounded === 0) return 'Rupees Zero Only';

  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  function g(n: number): string {
    if (n < 20) return a[n];
    const d = n % 10;
    return b[Math.floor(n / 10)] + (d ? ' ' + a[d] : '');
  }
  
  function c(n: number): string {
    if (n < 100) return g(n);
    return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + g(n % 100) : '');
  }
  
  let result = '';
  let temp = rounded;

  const crore = Math.floor(temp / 10000000);
  temp %= 10000000;
  const lakh = Math.floor(temp / 100000);
  temp %= 100000;
  const thousand = Math.floor(temp / 1000);
  temp %= 1000;
  const hundred = Math.floor(temp / 100);
  const remaining = temp % 100;
  
  if (crore) result += c(crore) + ' Crore ';
  if (lakh) result += c(lakh) + ' Lakh ';
  if (thousand) result += c(thousand) + ' Thousand ';
  if (hundred) result += c(hundred) + ' Hundred ';
  if (remaining) {
    if (result) result += 'and ';
    result += c(remaining) + ' ';
  }
  
  return 'Rupees ' + result.trim() + ' Only';
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function InvoiceBuilderPage() {
  const { status, data: session } = useSession();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<InvoiceData>({ ...INITIAL_DATA });
  const [configuredBank, setConfiguredBank] = useState<BankDetails>({ ...DEFAULT_BANK });
  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [savedInvoices, setSavedInvoices] = useState<any[]>([]);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSavedList, setShowSavedList] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Sidebar sections accordion
  const [openSections, setOpenSections] = useState({
    client: true,
    invoiceDetails: true,
    items: true,
    taxSettings: false,
    bankDetails: false
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    if (type === 'error') toast.error(message);
    else toast.success(message);
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
      return;
    }
    setMounted(true);
    const invoiceParam = new URLSearchParams(window.location.search).get('invoice');
    // Fetch products for autocomplete
    fetch('/api/admin/pricing')
      .then(r => r.json())
      .then(res => {
        if (Array.isArray(res)) setDbProducts(res);
      })
      .catch(console.error);

    fetch('/api/admin/clients')
      .then(r => r.json())
      .then(res => {
        if (Array.isArray(res)) setClients(res);
      })
      .catch(console.error);

    fetch('/api/admin/site-settings', { cache: 'no-store' })
      .then(r => r.json())
      .then(res => {
        const bank = bankDetailsFromSettings(res?.map ?? {});
        setConfiguredBank(bank);
        if (!invoiceParam) {
          setData(prev => ({ ...prev, bankDetails: bank }));
        }
      })
      .catch(console.error);

    fetchSavedInvoices();
  }, [status, router]);

  // Deep-link support: /admin/invoices?invoice=<number> auto-loads that invoice
  // (used by the "View" link on a client's profile for GST invoices).
  useEffect(() => {
    if (status !== 'authenticated') return;
    const params = new URLSearchParams(window.location.search);
    const invoiceParam = params.get('invoice');
    if (invoiceParam) {
      loadInvoice(invoiceParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const fetchSavedInvoices = () => {
    fetch('/api/admin/invoices')
      .then(r => r.json())
      .then(res => {
        if (res.invoices) setSavedInvoices(res.invoices);
      })
      .catch(() => toast.error('Failed to load saved invoices.'));
  };

  const saveInvoice = async () => {
    if (!data.invoiceNumber) {
      showToast('Invoice Number is required.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoice_number: data.invoiceNumber,
          client_name: data.clientCompany || data.clientAttn || 'Unknown Client',
          client_id: data.client_id,
          invoice_data: data
        })
      });
      if (res.ok) {
        showToast('Invoice saved successfully!', 'success');
        fetchSavedInvoices();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to save invoice.', 'error');
      }
    } catch {
      showToast('Connection error saving invoice.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteInvoice = async (invoiceNum: string) => {
    try {
      const res = await fetch(`/api/admin/invoices/${invoiceNum}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        showToast('Invoice deleted.', 'success');
        fetchSavedInvoices();
        if (data.invoiceNumber === invoiceNum) {
          setData({ ...INITIAL_DATA, bankDetails: { ...configuredBank } });
        }
      } else {
        showToast('Failed to delete invoice.', 'error');
      }
    } catch {
      showToast('Error deleting invoice.', 'error');
    } finally {
      setShowDeleteConfirm(null);
    }
  };

  const loadInvoice = async (invoiceNum: string) => {
    try {
      const res = await fetch(`/api/admin/invoices/${invoiceNum}`);
      const resData = await res.json();
      if (resData.invoice && resData.invoice.invoice_data) {
        const parsed = JSON.parse(resData.invoice.invoice_data);

        // The client_id column is the source of truth for the link (the JSON
        // blob may predate it). Coerce to number | null and apply it last.
        const rowClientId = resData.invoice.client_id != null ? Number(resData.invoice.client_id) : null;
        const applyClientId = (content: InvoiceData) => ({ ...content, client_id: rowClientId });

        // Handle migration structure checking
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].type === '_v2_structured_data') {
          setData(applyClientId(parsed[0].content));
        } else if (parsed.invoiceNumber !== undefined) {
          setData(applyClientId(parsed));
        } else if (Array.isArray(parsed)) {
          // Fallback legacy structure wrapper
          const content = parsed.find(el => el.type === '_v2_structured_data' || el.content)?.content;
          if (content) setData(applyClientId(content));
        }
        showToast('Invoice loaded successfully!', 'success');
        setShowSavedList(false);
      }
    } catch {
      showToast('Failed to load invoice.', 'error');
    }
  };

  const addNewItem = () => {
    const newItem: LineItem = {
      id: Math.random().toString(36).substring(7),
      name: '',
      brand: '',
      qty: 1,
      unit: 'Nos',
      price: 0,
      mrp: 0,
      hsn_code: '',
      sac_code: '',
      description: ''
    };
    setData(prev => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const handlePrint = () => {
    const cleanCompanyName = data.clientCompany.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    document.title = `Invoice_${data.invoiceNumber.replace(/\//g, '_')}_${cleanCompanyName}`;
    window.print();
  };

  if (status === 'loading' || !mounted) return null;

  // ─── Calculations ───────────────────────────────────────────────────────────
  const subtotal = data.items.reduce((sum, item) => sum + (item.qty * item.price), 0);
  const taxable = subtotal; // Assume price is pre-discount or discount is factored inline
  
  // Tax Calculations
  const gstRate = Number(data.taxRate) || 18;
  const taxAmount = (taxable * gstRate) / 100;
  const rawTotal = taxable + taxAmount;
  
  const finalTotal = data.roundOff ? Math.round(rawTotal) : rawTotal;
  const roundOffDiff = data.roundOff ? (finalTotal - rawTotal) : 0;

  return (
    <div className="h-screen bg-slate-100 flex flex-col lg:flex-row overflow-hidden print:h-auto print:overflow-visible print:block">

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[99999] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 print:hidden">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center">
            <h3 className="text-xl font-black text-slate-800 mb-2">Delete Invoice</h3>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              Are you sure you want to permanently delete invoice <strong className="text-slate-800">{showDeleteConfirm}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-50 transition-all">Cancel</button>
              <button onClick={() => deleteInvoice(showDeleteConfirm)} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black transition-all">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Saved Invoices List Drawer */}
      {showSavedList && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/40 backdrop-blur-sm flex justify-end print:hidden">
          <div className="w-[400px] bg-white h-full shadow-2xl flex flex-col p-6 animate-slide-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-black text-brand-950 flex items-center gap-2">
                <Receipt size={18} /> Saved Invoices
              </h3>
              <button onClick={() => setShowSavedList(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-all" aria-label="Close saved invoices">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {savedInvoices.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-10">No invoices saved yet.</p>
              ) : (
                savedInvoices.map((inv) => (
                  <div key={inv.invoice_number} className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col justify-between hover:border-brand-200 transition-all group">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-black text-sm text-brand-900">{inv.invoice_number}</h4>
                        <p className="text-xs text-slate-500 font-bold mt-1 truncate max-w-[240px]">{inv.client_name}</p>
                        <p className="text-xs text-slate-500 mt-2">
                          Updated: {new Date(inv.updated_at).toLocaleDateString()} {new Date(inv.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="flex gap-1.5 opacity-60 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                        <button onClick={() => loadInvoice(inv.invoice_number)} className="p-2 bg-brand-50 text-brand-600 rounded-xl hover:bg-brand-600 hover:text-white transition-colors" title="Load" aria-label={`Load invoice ${inv.invoice_number}`}>
                          <Plus size={14} />
                        </button>
                        <button onClick={() => setShowDeleteConfirm(inv.invoice_number)} className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-colors" title="Delete" aria-label={`Delete invoice ${inv.invoice_number}`}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* LEFT COLUMN: EDIT PANEL */}
      <div className="w-full lg:w-[380px] bg-white border-r border-slate-200 h-full overflow-y-auto print:hidden shrink-0 flex flex-col shadow-2xl z-10">
        
        {/* Editor Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-brand-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-brand-200">
              <Receipt size={18} />
            </div>
            <div>
              <h2 className="text-sm font-black text-brand-950 uppercase tracking-wider leading-none">Invoice Builder</h2>
              <span className="text-[10px] text-slate-400 font-bold">Tax Invoice Details</span>
            </div>
          </div>
          <div className="flex gap-1.5">
            <button onClick={saveInvoice} disabled={isSaving} className="w-8 h-8 bg-emerald-600 text-white rounded-lg flex items-center justify-center hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50" title="Save Invoice" aria-label="Save invoice">
              {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
            </button>
            <button onClick={handlePrint} className="w-8 h-8 bg-brand-600 text-white rounded-lg flex items-center justify-center hover:bg-brand-700 transition-colors shadow-sm" title="Print Invoice" aria-label="Print invoice">
              <Printer size={14} />
            </button>
            <button onClick={() => setShowSavedList(true)} className="w-8 h-8 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center hover:bg-slate-200 transition-colors" title="Saved Invoices" aria-label="Saved invoices">
              <Receipt size={14} />
            </button>
            <button onClick={() => setData({ ...INITIAL_DATA, bankDetails: { ...configuredBank } })} className="w-8 h-8 bg-red-50 text-red-500 rounded-lg flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors" title="Clear/New" aria-label="Clear and start new invoice">
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Editor Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">

          {/* Section: Client Details */}
          <div className="border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/50">
            <button onClick={() => toggleSection('client')} className="w-full px-4 py-3 flex items-center justify-between text-xs font-black text-brand-950 uppercase tracking-widest bg-slate-50 border-b border-slate-100">
              Client & Billing
              {openSections.client ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            {openSections.client && (
              <div className="p-4 space-y-3">
                <div>
                  <label htmlFor="inv-client-link" className="text-[10px] font-black uppercase tracking-wider text-brand-600 block mb-1">Link to Client</label>
                  <select
                    id="inv-client-link"
                    className="w-full bg-white border border-brand-200 rounded-lg px-3 py-2 text-xs font-semibold outline-none focus:border-brand-400"
                    value={data.client_id ?? ''}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      if (!selectedId) {
                        setData(prev => ({ ...prev, client_id: null }));
                        return;
                      }
                      const selected = clients.find(c => String(c.id) === selectedId);
                      const linkedId = Number(selectedId);
                      if (!selected) {
                        setData(prev => ({ ...prev, client_id: linkedId }));
                        return;
                      }

                      // Build full address by concatenating address, city, state, pincode
                      let fullAddress = selected.address || '';
                      const cityStatePin = [selected.city, selected.state, selected.pincode].filter(Boolean).join(', ');
                      if (cityStatePin) {
                        fullAddress = fullAddress ? `${fullAddress}\n${cityStatePin}` : cityStatePin;
                      }

                      // Link the client and prefill ONLY empty fields (never overwrite typed values).
                      setData(prev => ({
                        ...prev,
                        client_id: linkedId,
                        clientCompany: prev.clientCompany || selected.company_name || selected.name || '',
                        clientAddress: prev.clientAddress || fullAddress,
                        clientAttn: prev.clientAttn || selected.name || '',
                        clientPhone: prev.clientPhone || selected.phone || '',
                        clientGstin: prev.clientGstin || selected.gstin || '',
                      }));
                    }}
                  >
                    <option value="">-- Not linked to a client --</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.company_name ? `${c.company_name} (${c.name})` : c.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-[9px] text-slate-400 font-semibold mt-1 leading-relaxed">Links this invoice to a client so it shows on their profile. Only fills empty fields below.</p>
                </div>
                <div>
                  <label htmlFor="inv-client-select" className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">Select Client (Auto-fill)</label>
                  <select
                    id="inv-client-select"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold outline-none focus:border-brand-400"
                    onChange={async (e) => {
                      const selectedId = e.target.value;
                      if (!selectedId) return;
                      const selected = clients.find(c => String(c.id) === selectedId);
                      if (selected) {
                        // Build full address by concatenating address, city, state, pincode
                        let fullAddress = selected.address || '';
                        const cityStatePin = [selected.city, selected.state, selected.pincode].filter(Boolean).join(', ');
                        if (cityStatePin) {
                          fullAddress = fullAddress ? `${fullAddress}\n${cityStatePin}` : cityStatePin;
                        }
                        
                        let clientItems: LineItem[] = [];
                        try {
                          const res = await fetch(`/api/admin/clients/${selectedId}/products`);
                          if (res.ok) {
                            const products = await res.json();
                            if (Array.isArray(products)) {
                              clientItems = products.map((p: any) => ({
                                id: Math.random().toString(36).substring(7),
                                name: p.product_name || '',
                                brand: '',
                                qty: Number(p.qty) || 1,
                                unit: 'Nos',
                                price: Number(p.price) || 0,
                                mrp: Number(p.price) || 0,
                                hsn_code: p.hsn_code || '',
                                sac_code: p.sac_code || '',
                                description: p.notes || '',
                              }));
                            }
                          }
                        } catch (err) {
                          console.error('Failed to fetch client products for invoice:', err);
                        }

                        setData(prev => ({
                          ...prev,
                          client_id: Number(selectedId),
                          clientCompany: selected.company_name || selected.name || '',
                          clientAddress: fullAddress,
                          clientAttn: selected.name || '',
                          clientPhone: selected.phone || '',
                          clientGstin: selected.gstin || '',
                          items: clientItems.length > 0 ? clientItems : prev.items
                        }));
                      }
                      e.target.value = '';
                    }}
                    defaultValue=""
                  >
                    <option value="">-- Select Client to Auto-fill --</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.company_name ? `${c.company_name} (${c.name})` : c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="inv-client-company" className="text-[9px] font-black uppercase tracking-wider text-slate-500 block mb-1">Company / Billing Client</label>
                  <input id="inv-client-company" type="text" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold outline-none focus:border-brand-400" value={data.clientCompany} onChange={e => setData({ ...data, clientCompany: e.target.value })} placeholder="e.g. Lokprabha Constructions" />
                </div>
                <div>
                  <label htmlFor="inv-client-address" className="text-[9px] font-black uppercase tracking-wider text-slate-500 block mb-1">Billing Address</label>
                  <textarea id="inv-client-address" rows={2} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold outline-none focus:border-brand-400 resize-none" value={data.clientAddress} onChange={e => setData({ ...data, clientAddress: e.target.value })} placeholder="Full address..." />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="inv-client-attn" className="text-[9px] font-black uppercase tracking-wider text-slate-500 block mb-1">Kind Attn</label>
                    <input id="inv-client-attn" type="text" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold outline-none focus:border-brand-400" value={data.clientAttn} onChange={e => setData({ ...data, clientAttn: e.target.value })} placeholder="Contact Person" />
                  </div>
                  <div>
                    <label htmlFor="inv-client-phone" className="text-[9px] font-black uppercase tracking-wider text-slate-500 block mb-1">Contact Phone</label>
                    <input id="inv-client-phone" type="text" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold outline-none focus:border-brand-400" value={data.clientPhone} onChange={e => setData({ ...data, clientPhone: e.target.value })} placeholder="Mobile Number" />
                  </div>
                </div>
                <div>
                  <label htmlFor="inv-client-gstin" className="text-[9px] font-black uppercase tracking-wider text-slate-500 block mb-1">Client GSTIN</label>
                  <input id="inv-client-gstin" type="text" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold outline-none focus:border-brand-400" value={data.clientGstin} onChange={e => setData({ ...data, clientGstin: e.target.value })} placeholder="15-character GSTIN" />
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-slate-200 text-brand-600 focus:ring-brand-500/20" checked={data.consigneeSameAsBilling} onChange={e => setData({ ...data, consigneeSameAsBilling: e.target.checked })} />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Shipped to same address</span>
                  </label>
                </div>

                {!data.consigneeSameAsBilling && (
                  <div className="pt-2 space-y-3">
                    <div>
                      <label htmlFor="inv-consignee-company" className="text-[9px] font-black uppercase tracking-wider text-slate-500 block mb-1">Consignee Name</label>
                      <input id="inv-consignee-company" type="text" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold outline-none focus:border-brand-400" value={data.consigneeCompany} onChange={e => setData({ ...data, consigneeCompany: e.target.value })} placeholder="Consignee Company Name" />
                    </div>
                    <div>
                      <label htmlFor="inv-consignee-address" className="text-[9px] font-black uppercase tracking-wider text-slate-500 block mb-1">Delivery / Fitting Address</label>
                      <textarea id="inv-consignee-address" rows={2} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold outline-none focus:border-brand-400 resize-none" value={data.consigneeAddress} onChange={e => setData({ ...data, consigneeAddress: e.target.value })} placeholder="Consignee delivery address..." />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section: Invoice Meta Details */}
          <div className="border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/50">
            <button onClick={() => toggleSection('invoiceDetails')} className="w-full px-4 py-3 flex items-center justify-between text-xs font-black text-brand-950 uppercase tracking-widest bg-slate-50 border-b border-slate-100">
              Invoice Settings
              {openSections.invoiceDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            {openSections.invoiceDetails && (
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="inv-number" className="text-[9px] font-black uppercase tracking-wider text-slate-500 block mb-1">Invoice Number *</label>
                    <input id="inv-number" type="text" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold outline-none focus:border-brand-400" value={data.invoiceNumber} onChange={e => setData({ ...data, invoiceNumber: e.target.value })} placeholder="AVG/May/05/26-27" />
                  </div>
                  <div>
                    <label htmlFor="inv-date" className="text-[9px] font-black uppercase tracking-wider text-slate-500 block mb-1">Invoice Date</label>
                    <input id="inv-date" type="date" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold outline-none focus:border-brand-400" value={data.date} onChange={e => setData({ ...data, date: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="inv-payment-mode" className="text-[9px] font-black uppercase tracking-wider text-slate-500 block mb-1">Payment Mode</label>
                    <input id="inv-payment-mode" type="text" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold outline-none focus:border-brand-400" value={data.paymentMode} onChange={e => setData({ ...data, paymentMode: e.target.value })} placeholder="Account Pay" />
                  </div>
                  <div>
                    <label htmlFor="inv-delivery-note" className="text-[9px] font-black uppercase tracking-wider text-slate-500 block mb-1">Delivery Note</label>
                    <input id="inv-delivery-note" type="text" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold outline-none focus:border-brand-400" value={data.deliveryNote} onChange={e => setData({ ...data, deliveryNote: e.target.value })} placeholder="Delivery notes..." />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="inv-buyer-order" className="text-[9px] font-black uppercase tracking-wider text-slate-500 block mb-1">Buyer's Order No.</label>
                    <input id="inv-buyer-order" type="text" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold outline-none focus:border-brand-400" value={data.buyerOrderNo} onChange={e => setData({ ...data, buyerOrderNo: e.target.value })} placeholder="Order reference..." />
                  </div>
                  <div>
                    <label htmlFor="inv-quote-ref" className="text-[9px] font-black uppercase tracking-wider text-slate-500 block mb-1">Quote/GEM Ref No.</label>
                    <input id="inv-quote-ref" type="text" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold outline-none focus:border-brand-400" value={data.quoteRefNo} onChange={e => setData({ ...data, quoteRefNo: e.target.value })} placeholder="Quote/GEM reference..." />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="inv-work-order" className="text-[9px] font-black uppercase tracking-wider text-slate-500 block mb-1">Work Order No.</label>
                    <input id="inv-work-order" type="text" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold outline-none focus:border-brand-400" value={data.workOrderNo} onChange={e => setData({ ...data, workOrderNo: e.target.value })} placeholder="Work order number..." />
                  </div>
                  <div>
                    <label htmlFor="inv-work-order-date" className="text-[9px] font-black uppercase tracking-wider text-slate-500 block mb-1">Work Order Date</label>
                    <input id="inv-work-order-date" type="date" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold outline-none focus:border-brand-400" value={data.workOrderDate} onChange={e => setData({ ...data, workOrderDate: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label htmlFor="inv-reverse-charge" className="text-[9px] font-black uppercase tracking-wider text-slate-500 block mb-1">Reverse Charge</label>
                  <select id="inv-reverse-charge" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold outline-none focus:border-brand-400" value={data.reverseCharge} onChange={e => setData({ ...data, reverseCharge: e.target.value as 'Yes' | 'No' })}>
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Section: Items Table */}
          <div className="border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/50">
            <button onClick={() => toggleSection('items')} className="w-full px-4 py-3 flex items-center justify-between text-xs font-black text-brand-950 uppercase tracking-widest bg-slate-50 border-b border-slate-100">
              Goods & Services ({data.items.length})
              {openSections.items ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            {openSections.items && (
              <div className="p-4 space-y-4">
                {data.items.map((item, idx) => (
                  <div key={item.id} className="bg-white border border-slate-200/60 rounded-xl p-4 space-y-2 relative shadow-sm">
                    
                    {/* Autocomplete Search input */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1 relative">
                        <label htmlFor={`inv-item-name-${item.id}`} className="text-[9px] font-black uppercase tracking-wider text-slate-500 block mb-1">Description of Goods</label>
                        <input
                          id={`inv-item-name-${item.id}`}
                          type="text"
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold outline-none focus:border-brand-400"
                          value={item.name}
                          onChange={(e) => {
                            const newItems = [...data.items];
                            newItems[idx].name = e.target.value;
                            setData({ ...data, items: newItems });
                            setActiveDropdown(idx);
                          }}
                          placeholder="Search or type product name..."
                        />
                        {/* Autocomplete dropdown list */}
                        {activeDropdown === idx && (
                          <div className="absolute top-full left-0 mt-1 w-full max-h-[160px] overflow-y-auto bg-white border border-slate-200 shadow-xl rounded-lg z-[999]">
                            {dbProducts.filter(p => p.name.toLowerCase().includes(item.name.toLowerCase())).length === 0 ? (
                              <div className="p-3 text-[10px] text-slate-400 italic">No matches.</div>
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
                                    setData({ ...data, items: newItems });
                                    setActiveDropdown(null);
                                  }}
                                >
                                  <div className="text-[11px] font-bold text-slate-800 leading-tight">{p.name}</div>
                                  <div className="text-[9px] text-slate-400 font-semibold mt-0.5">{p.brand} • DP: ₹{p.dp_price || 0}</div>
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
                          setData({ ...data, items: newItems });
                        }}
                        className="text-slate-400 hover:text-red-500 transition-colors ml-2 mt-5"
                        aria-label={`Remove item ${idx + 1}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label htmlFor={`inv-item-qty-${item.id}`} className="text-[9px] font-black uppercase tracking-wider text-slate-500 block mb-1">Qty</label>
                        <input id={`inv-item-qty-${item.id}`} type="number" className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-center font-bold text-slate-800 outline-none focus:border-brand-400" value={item.qty} onChange={(e) => { const newItems = [...data.items]; newItems[idx].qty = Number(e.target.value); setData({ ...data, items: newItems }); }} />
                      </div>
                      <div>
                        <label htmlFor={`inv-item-unit-${item.id}`} className="text-[9px] font-black uppercase tracking-wider text-slate-500 block mb-1">Unit</label>
                        <input id={`inv-item-unit-${item.id}`} type="text" className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-center font-bold text-slate-800 outline-none focus:border-brand-400" value={item.unit} onChange={(e) => { const newItems = [...data.items]; newItems[idx].unit = e.target.value; setData({ ...data, items: newItems }); }} placeholder="Nos" />
                      </div>
                      <div>
                        <label htmlFor={`inv-item-rate-${item.id}`} className="text-[9px] font-black uppercase tracking-wider text-emerald-600 block mb-1">Rate</label>
                        <input id={`inv-item-rate-${item.id}`} type="number" className="w-full bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1.5 text-xs text-right font-bold text-emerald-800 outline-none focus:border-emerald-400" value={item.price || ''} onChange={(e) => { const newItems = [...data.items]; newItems[idx].price = Number(e.target.value); setData({ ...data, items: newItems }); }} placeholder="0.00" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label htmlFor={`inv-item-hsn-${item.id}`} className="text-[9px] font-black uppercase tracking-wider text-slate-500 block mb-1">HSN Code</label>
                        <input id={`inv-item-hsn-${item.id}`} type="text" className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold outline-none focus:border-brand-400" value={item.hsn_code} onChange={(e) => { const newItems = [...data.items]; newItems[idx].hsn_code = e.target.value; setData({ ...data, items: newItems }); }} placeholder="Goods code" />
                      </div>
                      <div>
                        <label htmlFor={`inv-item-sac-${item.id}`} className="text-[9px] font-black uppercase tracking-wider text-slate-500 block mb-1">SAC Code</label>
                        <input id={`inv-item-sac-${item.id}`} type="text" className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold outline-none focus:border-brand-400" value={item.sac_code} onChange={(e) => { const newItems = [...data.items]; newItems[idx].sac_code = e.target.value; setData({ ...data, items: newItems }); }} placeholder="Services code" />
                      </div>
                    </div>
                  </div>
                ))}
                
                <button onClick={addNewItem} className="w-full py-2.5 border border-dashed border-brand-200 rounded-xl text-brand-600 hover:bg-brand-50/50 hover:border-brand-400 text-xs font-black transition-all flex items-center justify-center gap-1.5">
                  <Plus size={14} /> Add Invoice Item
                </button>
              </div>
            )}
          </div>

          {/* Section: Tax Settings */}
          <div className="border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/50">
            <button onClick={() => toggleSection('taxSettings')} className="w-full px-4 py-3 flex items-center justify-between text-xs font-black text-brand-950 uppercase tracking-widest bg-slate-50 border-b border-slate-100">
              Tax & Rounding
              {openSections.taxSettings ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            {openSections.taxSettings && (
              <div className="p-4 space-y-3">
                <div>
                  <label htmlFor="inv-tax-scheme" className="text-[9px] font-black uppercase tracking-wider text-slate-500 block mb-1">Tax Scheme</label>
                  <select id="inv-tax-scheme" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold outline-none focus:border-brand-400" value={data.taxType} onChange={e => setData({ ...data, taxType: e.target.value as 'CGST_SGST' | 'IGST' })}>
                    <option value="CGST_SGST">Intra-State (CGST 9% + SGST 9%)</option>
                    <option value="IGST">Inter-State (IGST 18%)</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="inv-gst-rate" className="text-[9px] font-black uppercase tracking-wider text-slate-500 block mb-1">GST Rate (%)</label>
                    <input id="inv-gst-rate" type="number" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold outline-none focus:border-brand-400" value={data.taxRate} onChange={e => setData({ ...data, taxRate: Number(e.target.value) })} />
                  </div>
                  <div className="flex flex-col justify-end pb-1 pl-1">
                    <label className="flex items-center gap-2 cursor-pointer mt-5">
                      <input type="checkbox" className="rounded border-slate-200 text-brand-600 focus:ring-brand-500/20" checked={data.roundOff} onChange={e => setData({ ...data, roundOff: e.target.checked })} />
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Round Off Total</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label htmlFor="inv-declaration" className="text-[9px] font-black uppercase tracking-wider text-slate-500 block mb-1">Declaration</label>
                  <input id="inv-declaration" type="text" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold outline-none focus:border-brand-400" value={data.declaration} onChange={e => setData({ ...data, declaration: e.target.value })} />
                </div>
                <div>
                  <label htmlFor="inv-jurisdiction" className="text-[9px] font-black uppercase tracking-wider text-slate-500 block mb-1">Jurisdiction</label>
                  <input id="inv-jurisdiction" type="text" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold outline-none focus:border-brand-400" value={data.jurisdiction} onChange={e => setData({ ...data, jurisdiction: e.target.value })} />
                </div>
                <div>
                  <label htmlFor="inv-terms" className="text-[9px] font-black uppercase tracking-wider text-slate-500 block mb-1">Terms Header</label>
                  <input id="inv-terms" type="text" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold outline-none focus:border-brand-400" value={data.terms} onChange={e => setData({ ...data, terms: e.target.value })} />
                </div>
              </div>
            )}
          </div>

          {/* Section: Bank Details */}
          <div className="border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/50">
            <button onClick={() => toggleSection('bankDetails')} className="w-full px-4 py-3 flex items-center justify-between text-xs font-black text-brand-950 uppercase tracking-widest bg-slate-50 border-b border-slate-100">
              Bank Details
              {openSections.bankDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            {openSections.bankDetails && (
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    id="inv-include-bank"
                    type="checkbox"
                    checked={data.includeBankDetails !== false}
                    onChange={e => setData({ ...data, includeBankDetails: e.target.checked })}
                    className="w-4 h-4 text-brand-650 border-slate-200 rounded focus:ring-brand-500"
                  />
                  <label htmlFor="inv-include-bank" className="text-xs font-semibold text-slate-750">
                    Include Bank Details on Invoice
                  </label>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* RIGHT COLUMN: PRINT CANVAS */}
      <div className="flex-1 overflow-auto p-4 md:p-6 bg-slate-800 print:p-0 print:bg-white print:overflow-visible print:block">
        
        {/* Printable Paper A4 Size sheet */}
        <div 
          className="relative bg-white shadow-2xl print:shadow-none mx-auto shrink-0 select-none print:select-text" 
          style={{
            width: '210mm',
            minHeight: '297mm',
            padding: '12mm 15mm 15mm 15mm',
            boxSizing: 'border-box',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}
        >
          {/* LOGO */}
          <div className="flex justify-center mb-4 print:mb-2 flex-shrink-0">
            <Image 
              src="/logo.webp"
              alt="Avegatasta Jal-Urja Solutions"
              width={180}
              height={45}
              priority
              className="object-contain w-auto h-auto max-w-[200px]"
            />
          </div>

          {/* INVOICE TITLE */}
          <div className="border-y border-slate-800 bg-slate-50/50 py-2 mb-4 text-center">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-[0.25em]">TAX INVOICE</h2>
          </div>

          {/* SELER & META DETAILS BLOCK */}
          <div className="grid grid-cols-2 border border-slate-800 mb-4 text-[12px] leading-snug">
            {/* Seller info */}
            <div className="p-3 border-r border-slate-800 space-y-2.5">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Seller Details</span>
                <strong className="text-[13px] font-black text-slate-900 mt-0.5">AVEGATASTA SOLUTION</strong>
              </div>
              <p className="text-slate-700 font-medium whitespace-pre-line text-[11px] leading-relaxed">
                FLAT NO.8, Sulochana Swapn Appt, Shivshrusthi Nagar,
                GANGAPUR ROAD, NASHIK-422222, MAHARASHTRA
              </p>
              <div className="text-[11px] text-slate-600 font-medium space-y-1">
                <div><span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider mr-1.5">Mobile:</span> +91 9689881369</div>
                <div><span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider mr-1.5">Email:</span> accounts@avegatasta.com</div>
                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[9.5px] text-slate-400 font-extrabold uppercase tracking-wider">GSTIN</span>
                  <strong className="text-[12.5px] font-black text-slate-900 tracking-wider">27ABDEA2928B1ZW</strong>
                </div>
              </div>
            </div>

            {/* Invoice Meta */}
            <div className="grid grid-cols-2">
              <div className="p-3 border-r border-b border-slate-800 flex flex-col justify-between">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Invoice No</span>
                <strong className="text-[12.5px] font-black text-slate-900 mt-0.5 truncate">{data.invoiceNumber || '—'}</strong>
              </div>
              <div className="p-3 border-b border-slate-800 flex flex-col justify-between">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Dated</span>
                <strong className="text-[12.5px] font-black text-slate-900 mt-0.5">
                  {data.date ? new Date(data.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                </strong>
              </div>

              <div className="p-3 border-r border-b border-slate-800 flex flex-col justify-between">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Delivery Note</span>
                <span className="font-bold text-slate-800 mt-0.5 text-[11.5px] truncate">{data.deliveryNote || '—'}</span>
              </div>
              <div className="p-3 border-b border-slate-800 flex flex-col justify-between">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Mode/Term of Payment</span>
                <span className="font-bold text-slate-800 mt-0.5 text-[11.5px] truncate">{data.paymentMode || '—'}</span>
              </div>

              <div className="p-3 border-r border-b border-slate-800 flex flex-col justify-between">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Buyer's Order No.</span>
                <span className="font-bold text-slate-800 mt-0.5 text-[11.5px] truncate">{data.buyerOrderNo || '—'}</span>
              </div>
              <div className="p-3 border-b border-slate-800 flex flex-col justify-between">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Quote / GEM Ref. No.</span>
                <span className="font-bold text-slate-800 mt-0.5 text-[11.5px] truncate">{data.quoteRefNo || '—'}</span>
              </div>

              <div className="p-3 col-span-2 flex flex-col justify-center">
                <div className="grid grid-cols-2 divide-x divide-slate-100">
                  <div className="flex flex-col pr-3">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Work Order No.</span>
                    <span className="font-bold text-slate-800 mt-0.5 text-[11.5px] truncate">{data.workOrderNo || '—'}</span>
                  </div>
                  <div className="flex flex-col pl-3">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Work Order Date</span>
                    <span className="font-bold text-slate-800 mt-0.5 text-[11.5px]">
                      {data.workOrderDate ? new Date(data.workOrderDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* BILLING & SHIPPING DETAILS SPLIT */}
          <div className="grid grid-cols-2 border border-slate-800 mb-4 text-[12px] leading-snug">
            {/* Buyer Billing Info */}
            <div className="p-3 border-r border-slate-800 space-y-2.5">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">To (Billing Address)</span>
              <div>
                <div className="font-black text-slate-900 text-[13px]">{data.clientCompany || '—'}</div>
                <p className="text-slate-700 font-medium text-[11px] whitespace-pre-wrap mt-1 leading-relaxed">{data.clientAddress || '—'}</p>
              </div>
              {data.clientAttn && (
                <div className="text-[11px] text-slate-650 font-medium">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mr-1.5">Kind Attn:</span>
                  {data.clientAttn} {data.clientPhone && `(Mob: ${data.clientPhone})`}
                </div>
              )}
              {data.clientGstin && (
                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[9.5px] text-slate-400 font-extrabold uppercase tracking-wider">GSTIN</span>
                  <strong className="text-[12.5px] font-black text-slate-900 tracking-wider">{data.clientGstin}</strong>
                </div>
              )}
            </div>

            {/* Consignee Shipping Info */}
            <div className="p-3 space-y-2.5 bg-slate-50/10">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Consignee (Shipped / Fitting to)</span>
              {data.consigneeSameAsBilling ? (
                <div>
                  <div className="font-black text-slate-900 text-[13px]">{data.clientCompany || '—'}</div>
                  <p className="text-slate-700 font-medium text-[11px] whitespace-pre-wrap mt-1 leading-relaxed">{data.clientAddress || '—'}</p>
                </div>
              ) : (
                <div>
                  <div className="font-black text-slate-900 text-[13px]">{data.consigneeCompany || '—'}</div>
                  <p className="text-slate-700 font-medium text-[11px] whitespace-pre-wrap mt-1 leading-relaxed">{data.consigneeAddress || '—'}</p>
                </div>
              )}
            </div>
          </div>

          {/* GOODS & SERVICES ITEMS TABLE */}
          <div className="border border-slate-800 mb-4 overflow-hidden">
            <table className="w-full text-left border-collapse table-fixed text-[12px]">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-50/80 text-slate-900">
                  <th className="py-2.5 px-2 text-center font-black text-slate-700 uppercase tracking-wider text-[9.5px] w-[6%] border-r border-slate-800">SR. No.</th>
                  <th className="py-2.5 px-3 font-black text-slate-700 uppercase tracking-wider text-[9.5px] w-[44%] border-r border-slate-800">Description of Goods & Services</th>
                  <th className="py-2.5 px-2 text-center font-black text-slate-700 uppercase tracking-wider text-[9.5px] w-[12%] border-r border-slate-800">HSN/SAC</th>
                  <th className="py-2.5 px-2 text-center font-black text-slate-700 uppercase tracking-wider text-[9.5px] w-[8%] border-r border-slate-800">QTY</th>
                  <th className="py-2.5 px-2 text-right font-black text-slate-700 uppercase tracking-wider text-[9.5px] w-[12%] border-r border-slate-800 pr-3">RATE</th>
                  <th className="py-2.5 px-2 text-center font-black text-slate-700 uppercase tracking-wider text-[9.5px] w-[8%] border-r border-slate-800">UNIT</th>
                  <th className="py-2.5 px-3 text-right font-black text-slate-700 uppercase tracking-wider text-[9.5px] w-[10%] pr-3">AMOUNT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.items.map((item, idx) => (
                  <tr key={item.id} className="align-top hover:bg-slate-50/30">
                    <td className="py-2.5 px-2 text-center font-bold text-slate-500 border-r border-slate-800 text-[11px]">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900 border-r border-slate-800 text-[11.5px] leading-relaxed">
                      <div>{item.name}</div>
                      {item.brand && <span className="inline-block mt-1 text-[9px] px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 font-extrabold tracking-wide uppercase">{item.brand}</span>}
                    </td>
                    <td className="py-2.5 px-2 text-center font-semibold text-slate-650 border-r border-slate-800 text-[11px]">
                      {item.hsn_code || item.sac_code || '—'}
                    </td>
                    <td className="py-2.5 px-2 text-center font-extrabold text-slate-800 border-r border-slate-800 text-[11px]">{item.qty}</td>
                    <td className="py-2.5 px-2 text-right font-extrabold text-slate-800 border-r border-slate-800 text-[11px] pr-3">
                      ₹{item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-2 text-center font-bold text-slate-600 border-r border-slate-800 text-[11px]">{item.unit || 'Nos'}</td>
                    <td className="py-2.5 px-3 text-right font-black text-slate-900 text-[11.5px] pr-3">
                      ₹{(item.qty * item.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
                
                {/* Pad empty rows if table is short to preserve Excel sheet aesthetic */}
                {data.items.length < 5 && Array.from({ length: 5 - data.items.length }).map((_, i) => (
                  <tr key={`pad-${i}`} className="h-9">
                    <td className="border-r border-slate-800"></td>
                    <td className="border-r border-slate-800"></td>
                    <td className="border-r border-slate-800"></td>
                    <td className="border-r border-slate-800"></td>
                    <td className="border-r border-slate-800"></td>
                    <td className="border-r border-slate-800"></td>
                    <td></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* TOTALS & TAX CALCULATIONS SPLIT */}
          <div className="flex justify-between items-start mb-4 text-[12px]">
            {/* Reverse Charge Meta block */}
            <div className="w-1/2 space-y-1 leading-snug">
              <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                Reverse Charge: <span className="text-slate-800 font-extrabold uppercase">{data.reverseCharge}</span>
              </div>
            </div>

            {/* Calculations right panel */}
            <div className="w-72 border border-slate-800 p-3 leading-snug bg-slate-50/20">
              <table className="w-full text-xs">
                <tbody>
                  <tr className="border-b border-slate-100">
                    <td className="py-1 text-slate-500 font-extrabold uppercase text-[9.5px] tracking-wider">Total (Subtotal)</td>
                    <td className="py-1 text-right font-extrabold text-slate-800 text-[11.5px]">
                      ₹{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                  
                  {data.taxType === 'CGST_SGST' ? (
                    <>
                      <tr className="border-b border-slate-100">
                        <td className="py-1 text-slate-500 font-extrabold uppercase text-[9.5px] tracking-wider">CGST ({(gstRate / 2)}%)</td>
                        <td className="py-1 text-right font-extrabold text-slate-800 text-[11.5px]">
                          ₹{(taxAmount / 2).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="py-1 text-slate-500 font-extrabold uppercase text-[9.5px] tracking-wider">SGST ({(gstRate / 2)}%)</td>
                        <td className="py-1 text-right font-extrabold text-slate-800 text-[11.5px]">
                          ₹{(taxAmount / 2).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    </>
                  ) : (
                    <tr className="border-b border-slate-100">
                      <td className="py-1 text-slate-500 font-extrabold uppercase text-[9.5px] tracking-wider">IGST ({gstRate}%)</td>
                      <td className="py-1 text-right font-extrabold text-slate-800 text-[11.5px]">
                        ₹{taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  )}

                  <tr className="border-b border-slate-100">
                    <td className="py-1 text-slate-500 font-extrabold uppercase text-[9.5px] tracking-wider">Tax Total</td>
                    <td className="py-1 text-right font-extrabold text-slate-800 text-[11.5px]">
                      ₹{taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>

                  {data.roundOff && roundOffDiff !== 0 && (
                    <tr className="border-b border-slate-100">
                      <td className="py-1 text-slate-500 font-extrabold uppercase text-[9.5px] tracking-wider">Round Off</td>
                      <td className="py-1 text-right font-extrabold text-slate-800 text-[11.5px]">
                        ₹{roundOffDiff.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  )}

                  <tr className="border-t border-slate-800 pt-2 mt-2">
                    <td className="py-2 text-[10.5px] font-black text-slate-850 uppercase tracking-widest">Total Invoice Value</td>
                    <td className="py-2 text-[14.5px] text-right font-black text-indigo-900">
                      ₹{finalTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* INVOICE TOTAL IN WORDS */}
          <div className="border border-slate-800 p-3 mb-4 text-[12px] leading-snug bg-slate-50/20">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block mb-1">Invoice Total (in Words)</span>
            <p className="font-extrabold text-slate-800 text-[12.5px] italic">{numberToWords(finalTotal)}</p>
          </div>

          {/* BOTTOM JURISDICTION, BANK & SIGNATURE GRID */}
          <div className="grid grid-cols-2 border border-slate-800 text-[12px] leading-snug">
            
            {/* Bank details, terms, jurisdiction */}
            <div className="p-3 border-r border-slate-800 space-y-3.5">
              <div>
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block mb-1.5">Bank Details</span>
                {data.includeBankDetails !== false ? (
                  <table className="w-full text-[11.5px] text-slate-600 font-medium">
                    <tbody>
                      <tr>
                        <td className="w-24 font-bold text-slate-400 uppercase text-[9.5px] tracking-wider py-0.5">Bank Name</td>
                        <td className="font-bold text-slate-800 py-0.5">{data.bankDetails.bankName || '—'}</td>
                      </tr>
                      <tr>
                        <td className="font-bold text-slate-400 uppercase text-[9.5px] tracking-wider py-0.5">Branch</td>
                        <td className="py-0.5">{data.bankDetails.branch || '—'}</td>
                      </tr>
                      <tr>
                        <td className="font-bold text-slate-400 uppercase text-[9.5px] tracking-wider py-0.5">A/C No.</td>
                        <td className="font-bold text-slate-850 py-0.5">{data.bankDetails.accountNo || '—'}</td>
                      </tr>
                      <tr>
                        <td className="font-bold text-slate-400 uppercase text-[9.5px] tracking-wider py-0.5">IFSC Code</td>
                        <td className="font-bold text-slate-850 py-0.5">{data.bankDetails.ifsc || '—'}</td>
                      </tr>
                    </tbody>
                  </table>
                ) : (
                  <p className="text-[11px] text-slate-400 italic py-1">Bank details not included</p>
                )}
              </div>

              <div className="text-[9.5px] text-slate-400 font-extrabold border-t border-slate-100 pt-2 text-center uppercase tracking-wider">
                {data.declaration}
              </div>
              <div className="text-[11px] text-slate-600 font-bold text-center italic mt-0.5">
                {data.jurisdiction}
              </div>
            </div>

            {/* Signature Area */}
            <div className="p-4 flex flex-col justify-between text-center bg-slate-50/5">
              <div className="font-black text-slate-800 text-[12px] uppercase tracking-wider">
                for, AVEGATASTA SOLUTION
              </div>
              
              <div className="mt-14">
                <div className="w-36 mx-auto border-b border-dashed border-slate-300 mb-2"></div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Authorised Signatory
                </div>
              </div>
            </div>
          </div>

          {/* Print terms jurisdiction spacer */}
          <div className="mt-2 text-right text-[9.5px] text-slate-400 font-extrabold uppercase tracking-wider">
            {data.terms}
          </div>
        </div>
      </div>
      
      {/* Styles for printing */}
      <style jsx global>{`
        @media print {
          body {
            background-color: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          nav, header, footer, .print\\:hidden {
            display: none !important;
          }
          .print\\:block {
            display: block !important;
          }
          .h-screen {
            height: auto !important;
            overflow: visible !important;
          }
          .overflow-hidden {
            overflow: visible !important;
          }
        }
      `}</style>
    </div>
  );
}
