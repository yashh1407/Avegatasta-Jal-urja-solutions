'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShoppingCart,
  Search,
  RefreshCw,
  Trash2,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  Package,
  FileText,
  Calendar,
  CheckCircle,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type OrderStatus = 'pending' | 'active' | 'completed' | 'cancelled';
type InvoiceStatus = 'draft' | 'sent' | 'paid';

interface Order {
  id: number;
  client_id: number;
  client_name: string;
  company_name: string | null;
  order_date: string;
  status: OrderStatus;
  total_amount: string;
  notes: string | null;
  item_count: number;
  invoice_number: string | null;
  invoice_status: InvoiceStatus | null;
  created_at: string;
}

interface OrderItem {
  id: number;
  order_id: number;
  product_name: string;
  quantity: number;
  unit_price: string;
  serial_number: string | null;
  install_date: string | null;
  warranty_end: string | null;
  addons: Addon[];
}

interface Addon {
  id: number;
  addon_name: string;
  price: string;
  active: number;
}

interface Invoice {
  id: number;
  order_id: number;
  invoice_number: string;
  invoice_date: string;
  due_date: string | null;
  amount: string;
  status: InvoiceStatus;
}

interface Client {
  id: number;
  name: string;
  company_name: string | null;
}

// ─── Status Badges ────────────────────────────────────────────────────────────

const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  active: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-600',
};

const INVOICE_STATUS_COLORS: Record<InvoiceStatus, string> = {
  draft: 'bg-slate-100 text-slate-600',
  sent: 'bg-orange-100 text-orange-700',
  paid: 'bg-green-100 text-green-700',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(amount: string | number) {
  return `₹${parseFloat(String(amount)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
}

function fmtDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN');
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr className="border-b border-slate-50">
      {[1, 2, 3, 4, 5].map((i) => (
        <td key={i} className="px-6 py-5">
          <div className="h-3 bg-slate-100 rounded-lg animate-pulse" style={{ width: `${50 + i * 10}%` }} />
        </td>
      ))}
    </tr>
  );
}

// ─── Order Create Modal ───────────────────────────────────────────────────────

function CreateOrderModal({
  open,
  clients,
  onClose,
  onSaved,
}: {
  open: boolean;
  clients: Client[];
  onClose: () => void;
  onSaved: (id: number) => void;
}) {
  const [clientId, setClientId] = useState('');
  const [orderDate, setOrderDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (open) { setClientId(''); setOrderDate(new Date().toISOString().slice(0, 10)); setNotes(''); setErr(''); }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setErr('');
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: parseInt(clientId, 10), order_date: orderDate, status: 'pending', total_amount: 0, notes }),
      });
      if (res.ok) { const d = await res.json(); onSaved(d.id); onClose(); }
      else { const d = await res.json(); setErr(typeof d.error === 'string' ? d.error : 'Failed to create order'); }
    } finally { setSaving(false); }
  };

  const inputClass = 'w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all';

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && onClose()}>
          <motion.div initial={{ scale: 0.96, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 10 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between px-8 pt-7 pb-5 border-b border-slate-100">
              <h2 className="text-lg font-black text-blue-950">New Order</h2>
              <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-all"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
              {err && <p className="text-sm text-red-600 font-medium">{err}</p>}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Client *</label>
                <select className={inputClass} value={clientId} onChange={(e) => setClientId(e.target.value)} required>
                  <option value="">Select client…</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}{c.company_name ? ` — ${c.company_name}` : ''}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Order Date *</label>
                <input className={inputClass} type="date" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} required />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Notes</label>
                <textarea className={`${inputClass} resize-none`} rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes…" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-black text-slate-600 hover:bg-slate-50 transition-all">Cancel</button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl text-sm font-black text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                  {saving && <RefreshCw size={14} className="animate-spin" />}
                  {saving ? 'Creating…' : 'Create Order'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Order Detail Panel ───────────────────────────────────────────────────────

function OrderDetailPanel({ orderId, onClose }: { orderId: number; onClose: () => void }) {
  const [order, setOrder] = useState<(Order & { items: OrderItem[]; invoice: Invoice | null }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingItem, setAddingItem] = useState(false);
  const [itemForm, setItemForm] = useState({ product_name: '', quantity: '1', unit_price: '', serial_number: '', install_date: '', warranty_end: '' });
  const [savingItem, setSavingItem] = useState(false);
  const [itemError, setItemError] = useState('');

  const fetchOrder = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, { cache: 'no-store' });
      const data = await res.json().catch(() => null);

      if (!res.ok || !data || !Array.isArray(data.items)) {
        throw new Error(data?.error || 'Failed to load order details');
      }

      setOrder(data);
    } catch (err) {
      console.error('Failed to load order:', err);
      setOrder((current) => current || null);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  const refreshOrderItemsOnly = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/items`, { cache: 'no-store' });
      const items = await res.json().catch(() => null);
      if (!res.ok || !Array.isArray(items)) return;

      setOrder((current) => current ? { ...current, items } : current);
    } catch (err) {
      console.error('Failed to refresh order items:', err);
    }
  }, [orderId]);

  useEffect(() => { fetchOrder(); }, [fetchOrder]);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingItem(true);
    setItemError('');

    const productName = itemForm.product_name.trim();
    const quantity = Number.parseInt(itemForm.quantity, 10);
    const unitPrice = Number.parseFloat(itemForm.unit_price);

    if (!productName) {
      setItemError('Please enter the product name.');
      setSavingItem(false);
      return;
    }

    if (!Number.isFinite(quantity) || quantity < 1) {
      setItemError('Please enter a valid quantity.');
      setSavingItem(false);
      return;
    }

    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
      setItemError('Please enter a valid unit price.');
      setSavingItem(false);
      return;
    }

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_name: productName,
          quantity,
          unit_price: unitPrice,
          serial_number: itemForm.serial_number.trim() || null,
          install_date: itemForm.install_date || null,
          warranty_end: itemForm.warranty_end || null,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const message = data?.error
          ? typeof data.error === 'string'
            ? data.error
            : Object.values(data.error).flat().filter(Boolean).join(', ')
          : 'Failed to add item. Please check the details and try again.';
        setItemError(message || 'Failed to add item. Please check the details and try again.');
        return;
      }

      const createdItem: OrderItem = {
        id: Number(data?.id || Date.now()),
        order_id: orderId,
        product_name: String(data?.product_name || productName),
        quantity: Number(data?.quantity || quantity),
        unit_price: String(data?.unit_price ?? unitPrice),
        serial_number: data?.serial_number ?? (itemForm.serial_number.trim() || null),
        install_date: data?.install_date ?? (itemForm.install_date || null),
        warranty_end: data?.warranty_end ?? (itemForm.warranty_end || null),
        addons: Array.isArray(data?.addons) ? data.addons : [],
      };

      setOrder((current) => {
        if (!current) return current;
        const existingItems = Array.isArray(current.items) ? current.items : [];
        const withoutDuplicate = existingItems.filter((item) => item.id !== createdItem.id);
        return {
          ...current,
          items: [...withoutDuplicate, createdItem],
          total_amount: String(
            [...withoutDuplicate, createdItem].reduce(
              (sum, item) => sum + Number(item.quantity || 0) * Number.parseFloat(String(item.unit_price || 0)),
              0
            )
          ),
        };
      });

      setItemForm({ product_name: '', quantity: '1', unit_price: '', serial_number: '', install_date: '', warranty_end: '' });
      setAddingItem(false);
      await fetchOrder();
      await refreshOrderItemsOnly();
    } catch {
      setItemError('Network error while adding item. Please try again.');
    } finally { setSavingItem(false); }
  };

  const handleMarkPaid = async () => {
    if (!order?.invoice) return;
    await fetch(`/api/admin/orders/${orderId}/invoice`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'paid' }),
    });
    fetchOrder();
  };

  const inputClass = 'w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <RefreshCw size={24} className="animate-spin" />
      </div>
    );
  }

  if (!order) {
    return <p className="text-center py-10 text-slate-500">Failed to load order.</p>;
  }

  const totalItems = order.items.reduce((s, i) => s + i.quantity * parseFloat(i.unit_price), 0);

  return (
    <div className="p-8 space-y-8">
      {/* Order Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-blue-950 mb-1">Order #{order.id}</h3>
          <p className="text-sm text-slate-500 font-medium">{order.client_name}{order.company_name ? ` — ${order.company_name}` : ''}</p>
          <p className="text-xs text-slate-400 mt-1">Date: {fmtDate(order.order_date)}</p>
          {order.notes && <p className="text-xs text-slate-500 mt-2 italic">{order.notes}</p>}
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <span className={`inline-flex px-3 py-1.5 rounded-xl text-xs font-black ${ORDER_STATUS_COLORS[order.status]}`}>
            {order.status}
          </span>
          <button onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Items */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-black text-blue-950 flex items-center gap-2">
            <Package size={16} className="text-blue-400" /> Order Items
          </h4>
          <button onClick={() => { setItemError(''); setAddingItem(!addingItem); }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-black transition-all">
            <Plus size={12} /> Add Item
          </button>
        </div>

        {/* Add item form */}
        <AnimatePresence>
          {addingItem && (
            <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }} onSubmit={handleAddItem}
              className="bg-slate-50 rounded-2xl p-5 mb-4 space-y-3 overflow-hidden">
              {itemError && (
                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-bold text-red-600">
                  {itemError}
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Product Name *</label>
                  <input className={inputClass} value={itemForm.product_name} onChange={(e) => setItemForm(f => ({ ...f, product_name: e.target.value }))} required placeholder="e.g. V-Guard Solar Heater 200L" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Qty *</label>
                  <input className={inputClass} type="number" min="1" value={itemForm.quantity} onChange={(e) => setItemForm(f => ({ ...f, quantity: e.target.value }))} required />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Unit Price (₹) *</label>
                  <input className={inputClass} type="number" min="0" step="0.01" value={itemForm.unit_price} onChange={(e) => setItemForm(f => ({ ...f, unit_price: e.target.value }))} required placeholder="0.00" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Serial No.</label>
                  <input className={inputClass} value={itemForm.serial_number} onChange={(e) => setItemForm(f => ({ ...f, serial_number: e.target.value }))} placeholder="Optional" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Install Date</label>
                  <input className={inputClass} type="date" value={itemForm.install_date} onChange={(e) => setItemForm(f => ({ ...f, install_date: e.target.value }))} />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Warranty End</label>
                  <input className={inputClass} type="date" value={itemForm.warranty_end} onChange={(e) => setItemForm(f => ({ ...f, warranty_end: e.target.value }))} />
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setAddingItem(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-black text-slate-600 hover:bg-white transition-all">Cancel</button>
                <button type="submit" disabled={savingItem}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black transition-all disabled:opacity-60 flex items-center gap-1.5">
                  {savingItem && <RefreshCw size={12} className="animate-spin" />} Add Item
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Items list */}
        {order.items.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">No items yet. Add the first item.</p>
        ) : (
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="bg-slate-50 rounded-2xl p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-sm text-blue-950">{item.product_name}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Qty: {item.quantity} × {fmt(item.unit_price)} = <span className="font-black text-blue-700">{fmt(item.quantity * parseFloat(item.unit_price))}</span>
                    </p>
                    {item.serial_number && <p className="text-xs text-slate-400 mt-0.5">S/N: {item.serial_number}</p>}
                    <div className="flex gap-4 mt-1">
                      {item.install_date && <p className="text-xs text-slate-400">Installed: {fmtDate(item.install_date)}</p>}
                      {item.warranty_end && <p className="text-xs text-slate-400">Warranty ends: {fmtDate(item.warranty_end)}</p>}
                    </div>
                  </div>
                </div>
                {/* Addons */}
                {item.addons && item.addons.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Addons</p>
                    <div className="space-y-1">
                      {item.addons.map((a) => (
                        <div key={a.id} className="flex items-center justify-between">
                          <span className="text-xs text-slate-600 font-medium">{a.addon_name}</span>
                          <span className="text-xs font-black text-blue-700">{fmt(a.price)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Total */}
        {order.items.length > 0 && (
          <div className="flex justify-end mt-4">
            <div className="bg-blue-50 rounded-2xl px-6 py-3 flex items-center gap-3">
              <span className="text-sm font-medium text-blue-700">Order Total</span>
              <span className="text-xl font-black text-blue-950">{fmt(totalItems)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Invoice */}
      <div>
        <h4 className="text-sm font-black text-blue-950 mb-4 flex items-center gap-2">
          <FileText size={16} className="text-blue-400" /> Invoice
        </h4>
        {order.invoice ? (
          <div className="bg-slate-50 rounded-2xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-black text-sm text-blue-950">{order.invoice.invoice_number}</p>
                <p className="text-xs text-slate-500 mt-1">Date: {fmtDate(order.invoice.invoice_date)}</p>
                {order.invoice.due_date && <p className="text-xs text-slate-400">Due: {fmtDate(order.invoice.due_date)}</p>}
                <p className="text-sm font-black text-blue-700 mt-2">{fmt(order.invoice.amount)}</p>
              </div>
              <div className="flex flex-col items-end gap-3">
                <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-black ${INVOICE_STATUS_COLORS[order.invoice.status]}`}>
                  {order.invoice.status}
                </span>
                {order.invoice.status !== 'paid' && (
                  <button onClick={handleMarkPaid}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-black transition-all">
                    <CheckCircle size={12} /> Mark Paid
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-400 text-center py-6">No invoice generated yet.</p>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OrdersPage() {
  const { status } = useSession();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/admin/login');
    else if (status === 'authenticated') { fetchOrders(); fetchClients(); }
  }, [status, router]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (statusFilter) p.set('status', statusFilter);
      if (dateFrom) p.set('date_from', dateFrom);
      if (dateTo) p.set('date_to', dateTo);
      const res = await fetch(`/api/admin/orders?${p}`);
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch { setOrders([]); }
    finally { setLoading(false); }
  }, [statusFilter, dateFrom, dateTo]);

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/admin/clients');
      const data = await res.json();
      setClients(Array.isArray(data) ? data : []);
    } catch { setClients([]); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(`Delete order #${id}? This cannot be undone.`)) return;
    await fetch(`/api/admin/orders/${id}`, { method: 'DELETE' });
    if (expandedId === id) setExpandedId(null);
    fetchOrders();
  };

  if (status === 'loading' || status === 'unauthenticated') return null;

  return (
    <div className="min-h-screen bg-slate-50 p-8 lg:p-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
              <ShoppingCart size={20} />
            </div>
            <h1 className="text-4xl font-black text-blue-950 tracking-tight">Orders</h1>
          </div>
          <p className="text-slate-500 font-medium">Client order history — invoices, products and addons.</p>
        </div>
        <button onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-2xl text-sm font-black text-white transition-all shadow-lg shadow-blue-200">
          <Plus size={16} /> New Order
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6 items-end">
        <select
          value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-slate-400" />
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
            className="px-3 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" />
          <span className="text-slate-400 text-sm">–</span>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
            className="px-3 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" />
        </div>
        <button onClick={fetchOrders}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-black transition-all">
          <Search size={14} /> Search
        </button>
        {(statusFilter || dateFrom || dateTo) && (
          <button onClick={() => { setStatusFilter(''); setDateFrom(''); setDateTo(''); }}
            className="flex items-center gap-1.5 px-3 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-black text-slate-500 hover:text-red-500 transition-all">
            <X size={12} /> Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-8 py-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Orders ({orders.length})
          </h2>
          <button onClick={fetchOrders} className="p-2 text-slate-400 hover:text-blue-600 rounded-xl hover:bg-blue-50 transition-all">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Order</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Client</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Invoice</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                      <ShoppingCart size={32} />
                    </div>
                    <p className="text-slate-500 font-medium">No orders found.</p>
                    <button onClick={() => setCreateOpen(true)} className="mt-4 text-blue-600 text-sm font-black hover:underline">
                      Create the first order →
                    </button>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <React.Fragment key={order.id}>
                    <motion.tr
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className={`border-b border-slate-50 transition-colors group ${expandedId === order.id ? 'bg-blue-50/30' : 'hover:bg-slate-50/50'}`}
                    >
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-black text-sm text-blue-950">#{order.id}</span>
                          <span className="text-xs text-slate-400">{order.item_count} item{order.item_count !== 1 ? 's' : ''}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-black text-sm text-blue-950">{order.client_name}</span>
                          {order.company_name && <span className="text-xs text-slate-400">{order.company_name}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                          <Calendar size={12} />{fmtDate(order.order_date)}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-black ${ORDER_STATUS_COLORS[order.status]}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        {order.invoice_number ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-black text-slate-600">{order.invoice_number}</span>
                            <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-black w-fit ${INVOICE_STATUS_COLORS[order.invoice_status!]}`}>
                              {order.invoice_status}
                            </span>
                          </div>
                        ) : <span className="text-xs text-slate-300">—</span>}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                            className="flex items-center gap-1 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all text-xs font-black"
                          >
                            Details {expandedId === order.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                          </button>
                          <button onClick={() => handleDelete(order.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>

                    {/* Expanded Detail */}
                    <AnimatePresence>
                      {expandedId === order.id && (
                        <tr>
                          <td colSpan={6} className="p-0 border-b border-slate-100">
                            <motion.div
                              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden bg-white"
                            >
                              <OrderDetailPanel
                                orderId={order.id}
                                onClose={() => { setExpandedId(null); fetchOrders(); }}
                              />
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CreateOrderModal
        open={createOpen}
        clients={clients}
        onClose={() => setCreateOpen(false)}
        onSaved={(id) => { fetchOrders(); setExpandedId(id); }}
      />
    </div>
  );
}
