'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  BarChart2,
  TrendingUp,
  Eye,
  Search,
  RefreshCw,
  Download,
  ChevronDown,
  ChevronUp,
  User,
  Calendar,
  X,
  Package,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

// ─── Types ───────────────────────────────────────────────────────────────────

interface TopSearch {
  query: string;
  count: number;
}

interface TopViewed {
  product_id: number;
  view_count: number;
}

interface ClientSummary {
  id: number;
  name: string;
  email: string | null;
}

interface ClientEvent {
  id: number;
  event_type: 'view' | 'search';
  entity_id: number | null;
  query: string | null;
  created_at: string;
}

interface ClientBehavior {
  summary: {
    total_events: number;
    total_views: number;
    total_searches: number;
    first_event: string | null;
    last_event: string | null;
  };
  events: ClientEvent[];
}

type DateRange = '7' | '30' | '90' | 'custom';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function exportToCSV(
  topSearches: TopSearch[],
  topViewed: TopViewed[],
  days: string
) {
  const lines: string[] = [];

  lines.push(`"Analytics Export — Last ${days} days"`);
  lines.push('');
  lines.push('"TOP SEARCHED TERMS"');
  lines.push('"Query","Search Count"');
  topSearches.forEach((r) => lines.push(`"${r.query}",${r.count}`));

  lines.push('');
  lines.push('"MOST VIEWED PRODUCTS"');
  lines.push('"Product ID","View Count"');
  topViewed.forEach((r) => lines.push(`${r.product_id},${r.view_count}`));

  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `analytics-${days}d-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function fmtDate(str: string | null) {
  if (!str) return '—';
  return new Date(str).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonBar() {
  return (
    <div className="space-y-2">
      {[80, 65, 55, 45, 35, 28, 20].map((w, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="h-3 bg-slate-100 rounded-full animate-pulse" style={{ width: `${w}%` }} />
          <div className="h-3 bg-slate-100 rounded-full animate-pulse w-8" />
        </div>
      ))}
    </div>
  );
}

// ─── Custom Tooltip ──────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-lg px-4 py-3">
      <p className="text-xs font-black text-blue-950 mb-1">{label}</p>
      <p className="text-sm font-black text-blue-600">{payload[0].value} searches</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminAnalyticsPage() {
  const { status } = useSession();
  const router = useRouter();

  // Date range
  const [range, setRange] = useState<DateRange>('30');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  // Data
  const [topSearches, setTopSearches] = useState<TopSearch[]>([]);
  const [topViewed, setTopViewed] = useState<TopViewed[]>([]);
  const [clients, setClients] = useState<ClientSummary[]>([]);
  const [selectedClient, setSelectedClient] = useState<ClientSummary | null>(null);
  const [clientBehavior, setClientBehavior] = useState<ClientBehavior | null>(null);
  const [clientSearch, setClientSearch] = useState('');
  const [clientPickerOpen, setClientPickerOpen] = useState(false);

  // Loading
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingViewed, setLoadingViewed] = useState(false);
  const [loadingClients, setLoadingClients] = useState(false);
  const [loadingBehavior, setLoadingBehavior] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/admin/login');
    else if (status === 'authenticated') {
      fetchAll();
      fetchClients();
    }
  }, [status, router]);

  // Resolve days param
  const getDays = useCallback((): string => {
    if (range !== 'custom') return range;
    if (customFrom && customTo) {
      const diff = Math.ceil(
        (new Date(customTo).getTime() - new Date(customFrom).getTime()) / 86_400_000
      );
      return String(Math.max(1, diff));
    }
    return '30';
  }, [range, customFrom, customTo]);

  const fetchAll = useCallback(async () => {
    const days = getDays();
    setLoadingSearch(true);
    setLoadingViewed(true);

    fetch(`/api/admin/analytics/top-searches?days=${days}&limit=15`)
      .then((r) => r.json())
      .then((d) => setTopSearches(Array.isArray(d) ? d : []))
      .catch(() => setTopSearches([]))
      .finally(() => setLoadingSearch(false));

    fetch(`/api/admin/analytics/top-viewed?days=${days}&limit=15`)
      .then((r) => r.json())
      .then((d) => setTopViewed(Array.isArray(d) ? d : []))
      .catch(() => setTopViewed([]))
      .finally(() => setLoadingViewed(false));
  }, [getDays]);

  const fetchClients = useCallback(async () => {
    setLoadingClients(true);
    try {
      const res = await fetch('/api/admin/clients');
      const data = await res.json();
      setClients(
        Array.isArray(data)
          ? data.map((c: any) => ({ id: c.id, name: c.name, email: c.email }))
          : []
      );
    } catch {
      setClients([]);
    } finally {
      setLoadingClients(false);
    }
  }, []);

  const fetchClientBehavior = useCallback(
    async (clientId: number) => {
      const days = getDays();
      setLoadingBehavior(true);
      setClientBehavior(null);
      try {
        const res = await fetch(
          `/api/admin/analytics/client-behavior/${clientId}?days=${days}&limit=100`
        );
        const data = await res.json();
        setClientBehavior(data);
      } catch {
        setClientBehavior(null);
      } finally {
        setLoadingBehavior(false);
      }
    },
    [getDays]
  );

  const handleRangeChange = (r: DateRange) => {
    setRange(r);
    if (r !== 'custom') {
      setTimeout(() => fetchAll(), 0);
    }
  };

  const handleApplyCustom = () => {
    if (customFrom && customTo) fetchAll();
  };

  const handleSelectClient = (c: ClientSummary) => {
    setSelectedClient(c);
    setClientPickerOpen(false);
    setClientSearch('');
    fetchClientBehavior(c.id);
  };

  const handleExport = () => {
    setExporting(true);
    exportToCSV(topSearches, topViewed, getDays());
    setTimeout(() => setExporting(false), 800);
  };

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
      (c.email ?? '').toLowerCase().includes(clientSearch.toLowerCase())
  );

  if (status === 'loading' || status === 'unauthenticated') return null;

  const loading = loadingSearch || loadingViewed;

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-24 py-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                <BarChart2 size={20} />
              </div>
              <h1 className="text-4xl font-black text-blue-950 tracking-tight">
                Client Behavior Analytics
              </h1>
            </div>
            <p className="text-slate-500 font-medium">
              Understand what clients search for and which products they view.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleExport}
              disabled={exporting || loading}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm font-black text-slate-600 hover:border-blue-200 hover:text-blue-600 transition-all disabled:opacity-60"
            >
              {exporting ? <RefreshCw size={16} className="animate-spin" /> : <Download size={16} />}
              Export CSV
            </button>
            <button
              onClick={fetchAll}
              disabled={loading}
              className="p-2.5 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-all disabled:opacity-60"
              title="Refresh"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Date Range Selector */}
        <div className="flex flex-wrap items-center gap-3 mb-10">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">
            Period:
          </span>
          {(['7', '30', '90'] as DateRange[]).map((r) => (
            <button
              key={r}
              onClick={() => handleRangeChange(r)}
              className={`px-4 py-2 rounded-2xl text-sm font-black transition-all ${
                range === r
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-200 hover:text-blue-600'
              }`}
            >
              Last {r} days
            </button>
          ))}
          <button
            onClick={() => setRange('custom')}
            className={`px-4 py-2 rounded-2xl text-sm font-black transition-all ${
              range === 'custom'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-200 hover:text-blue-600'
            }`}
          >
            Custom
          </button>

          <AnimatePresence>
            {range === 'custom' && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                className="flex items-center gap-2"
              >
                <Calendar size={14} className="text-slate-400" />
                <input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
                <span className="text-slate-400 text-sm">–</span>
                <input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
                <button
                  onClick={handleApplyCustom}
                  disabled={!customFrom || !customTo}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-black transition-all disabled:opacity-50"
                >
                  Apply
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Charts grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">

          {/* Top Searched Terms */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-50 flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                <Search size={16} />
              </div>
              <div>
                <h2 className="text-base font-black text-blue-950">Top Searched Terms</h2>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                  Most frequent search queries from clients
                </p>
              </div>
            </div>

            <div className="p-8">
              {loadingSearch ? (
                <SkeletonBar />
              ) : topSearches.length === 0 ? (
                <div className="flex flex-col items-center py-12 text-slate-300">
                  <Search size={40} className="mb-3" />
                  <p className="text-sm font-medium text-slate-400">No search data for this period.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart
                    data={topSearches}
                    layout="vertical"
                    margin={{ top: 4, right: 24, left: 8, bottom: 4 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 700 }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="query"
                      width={120}
                      tick={{ fontSize: 11, fill: '#1e3a5f', fontWeight: 700 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => (v.length > 16 ? v.slice(0, 15) + '…' : v)}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
                    <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={24}>
                      {topSearches.map((_, i) => (
                        <Cell
                          key={i}
                          fill={i === 0 ? '#2563eb' : i === 1 ? '#3b82f6' : '#93c5fd'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Most Viewed Products */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-50 flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                <Eye size={16} />
              </div>
              <div>
                <h2 className="text-base font-black text-blue-950">Most Viewed Products</h2>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                  Products with the highest client view counts
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              {loadingViewed ? (
                <div className="p-8">
                  <SkeletonBar />
                </div>
              ) : topViewed.length === 0 ? (
                <div className="flex flex-col items-center py-12 text-slate-300">
                  <Package size={40} className="mb-3" />
                  <p className="text-sm font-medium text-slate-400">No view data for this period.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Rank
                      </th>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Product ID
                      </th>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                        Views
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {topViewed.map((row, i) => (
                      <tr key={row.product_id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-4">
                          {i === 0 ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-[10px] font-black">
                              1
                            </span>
                          ) : (
                            <span className="text-xs font-black text-slate-400">{i + 1}</span>
                          )}
                        </td>
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-2">
                            <Package size={13} className="text-blue-400" />
                            <span className="text-sm font-black text-blue-950">
                              #{row.product_id}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div
                              className="h-2 bg-blue-100 rounded-full overflow-hidden"
                              style={{ width: '80px' }}
                            >
                              <div
                                className="h-full bg-blue-600 rounded-full"
                                style={{
                                  width: `${Math.round(
                                    (row.view_count / (topViewed[0]?.view_count || 1)) * 100
                                  )}%`,
                                }}
                              />
                            </div>
                            <span className="text-sm font-black text-blue-950 w-8 text-right">
                              {row.view_count}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Per-Client Behavior */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                <TrendingUp size={16} />
              </div>
              <div>
                <h2 className="text-base font-black text-blue-950">Per-Client Behavior</h2>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                  Recent searches and product views for a selected client
                </p>
              </div>
            </div>

            {/* Client selector */}
            <div className="relative">
              <button
                onClick={() => setClientPickerOpen((o) => !o)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm font-black text-slate-600 hover:border-blue-200 hover:text-blue-600 transition-all min-w-[200px] justify-between"
              >
                <div className="flex items-center gap-2">
                  <User size={14} />
                  <span className="truncate max-w-[140px]">
                    {selectedClient ? selectedClient.name : 'Select a client…'}
                  </span>
                </div>
                {clientPickerOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              <AnimatePresence>
                {clientPickerOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute right-0 top-full mt-2 w-72 bg-white border border-slate-200 rounded-3xl shadow-2xl z-20 overflow-hidden"
                  >
                    <div className="p-3 border-b border-slate-50">
                      <div className="relative">
                        <Search
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                          size={14}
                        />
                        <input
                          autoFocus
                          type="text"
                          placeholder="Search clients…"
                          value={clientSearch}
                          onChange={(e) => setClientSearch(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
                        {clientSearch && (
                          <button
                            onClick={() => setClientSearch('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                          >
                            <X size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="max-h-56 overflow-y-auto">
                      {loadingClients ? (
                        <div className="flex items-center justify-center py-8">
                          <RefreshCw size={18} className="animate-spin text-blue-600" />
                        </div>
                      ) : filteredClients.length === 0 ? (
                        <p className="text-sm text-slate-400 text-center py-8 font-medium">
                          No clients found.
                        </p>
                      ) : (
                        filteredClients.map((c) => (
                          <button
                            key={c.id}
                            onClick={() => handleSelectClient(c)}
                            className={`w-full text-left px-5 py-3 hover:bg-blue-50 transition-colors flex items-center gap-3 ${
                              selectedClient?.id === c.id ? 'bg-blue-50' : ''
                            }`}
                          >
                            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-[10px] font-black flex-shrink-0">
                              {c.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-black text-blue-950 truncate">
                                {c.name}
                              </p>
                              {c.email && (
                                <p className="text-[11px] text-slate-400 font-medium truncate">
                                  {c.email}
                                </p>
                              )}
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Behavior content */}
          {!selectedClient ? (
            <div className="flex flex-col items-center py-20 text-slate-300">
              <User size={48} className="mb-4" />
              <p className="text-sm font-medium text-slate-400">
                Select a client above to view their activity.
              </p>
            </div>
          ) : loadingBehavior ? (
            <div className="flex flex-col items-center py-20">
              <RefreshCw size={32} className="animate-spin text-blue-600 mb-4" />
              <p className="text-sm text-slate-500 font-medium">Loading activity…</p>
            </div>
          ) : !clientBehavior ? (
            <div className="flex flex-col items-center py-20 text-slate-300">
              <TrendingUp size={48} className="mb-4" />
              <p className="text-sm font-medium text-slate-400">No data available.</p>
            </div>
          ) : (
            <>
              {/* Summary stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-slate-100 border-b border-slate-100">
                {[
                  { label: 'Total Events', value: clientBehavior.summary.total_events ?? 0 },
                  { label: 'Views', value: clientBehavior.summary.total_views ?? 0 },
                  { label: 'Searches', value: clientBehavior.summary.total_searches ?? 0 },
                  {
                    label: 'Last Active',
                    value: clientBehavior.summary.last_event
                      ? new Date(clientBehavior.summary.last_event).toLocaleDateString('en-IN')
                      : '—',
                  },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white px-8 py-5">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-black text-blue-950">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Event timeline */}
              {clientBehavior.events.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-slate-300">
                  <Calendar size={40} className="mb-3" />
                  <p className="text-sm font-medium text-slate-400">No events in this period.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50">
                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Type
                        </th>
                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Detail
                        </th>
                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Date &amp; Time
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {clientBehavior.events.map((ev) => (
                        <tr
                          key={ev.id}
                          className="hover:bg-slate-50/50 transition-colors"
                        >
                          <td className="px-8 py-4">
                            {ev.event_type === 'search' ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-violet-50 text-violet-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                                <Search size={10} /> Search
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                                <Eye size={10} /> View
                              </span>
                            )}
                          </td>
                          <td className="px-8 py-4">
                            {ev.event_type === 'search' ? (
                              <span className="text-sm font-medium text-slate-700">
                                &ldquo;{ev.query}&rdquo;
                              </span>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <Package size={13} className="text-blue-400" />
                                <span className="text-sm font-medium text-slate-700">
                                  Product #{ev.entity_id}
                                </span>
                              </div>
                            )}
                          </td>
                          <td className="px-8 py-4">
                            <span className="text-xs font-medium text-slate-400">
                              {fmtDate(ev.created_at)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
