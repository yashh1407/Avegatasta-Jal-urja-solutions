'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { MapPin, User, Calendar, Search, RefreshCw, ChevronDown, MessageSquare, Package, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';

interface GeoLead {
  id: number;
  name: string;
  phone: string | null;
  subject?: string | null;
  product_name?: string | null;
  message: string;
  status: string;
  latitude: number;
  longitude: number;
  location_accuracy: number | null;
  logged_by_name: string | null;
  logged_by_email: string | null;
  created_at: string;
  type: 'General' | 'Product';
}

export default function MarketingTrackerPage() {
  const [geoLeads, setGeoLeads] = useState<GeoLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [agentFilter, setAgentFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchGeoLeads = useCallback(async (isBg = false) => {
    if (!isBg) setLoading(true);
    else setRefreshing(true);

    try {
      const [res1, res2] = await Promise.all([
        fetch('/api/inquiries'),
        fetch('/api/product-inquiries')
      ]);

      const data1 = await res1.json();
      const data2 = await res2.json();

      const list1 = (Array.isArray(data1) ? data1 : []).map((x: any) => ({ ...x, type: 'General' as const }));
      const list2 = (Array.isArray(data2) ? data2 : []).map((x: any) => ({ ...x, type: 'Product' as const }));

      const combined = [...list1, ...list2]
        .filter((x: any) => x.latitude !== null && x.longitude !== null && x.latitude !== undefined && x.longitude !== undefined)
        .map((x: any) => ({
          ...x,
          latitude: Number(x.latitude),
          longitude: Number(x.longitude),
          location_accuracy: x.location_accuracy ? Number(x.location_accuracy) : null
        }))
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setGeoLeads(combined);
    } catch (err) {
      console.error('Failed to fetch geo leads:', err);
      toast.error('Failed to load location data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchGeoLeads(false);
  }, [fetchGeoLeads]);

  // List of distinct agent names
  const agentsList = useMemo(() => {
    const names = geoLeads
      .map(x => x.logged_by_name)
      .filter((name): name is string => typeof name === 'string' && name.trim().length > 0);
    return Array.from(new Set(names));
  }, [geoLeads]);

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return geoLeads.filter(lead => {
      // 1. Search filter
      const sTerm = searchQuery.toLowerCase();
      const matchSearch = !searchQuery || 
        lead.name.toLowerCase().includes(sTerm) ||
        (lead.phone || '').includes(sTerm) ||
        (lead.logged_by_name || '').toLowerCase().includes(sTerm) ||
        (lead.subject || '').toLowerCase().includes(sTerm) ||
        (lead.product_name || '').toLowerCase().includes(sTerm);

      // 2. Agent filter
      const matchAgent = agentFilter === 'all' || lead.logged_by_name === agentFilter;

      // 3. Date range filter
      let matchDate = true;
      const leadDate = new Date(lead.created_at);

      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        matchDate = matchDate && leadDate >= start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchDate = matchDate && leadDate <= end;
      }

      return matchSearch && matchAgent && matchDate;
    });
  }, [geoLeads, searchQuery, agentFilter, startDate, endDate]);

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-6 lg:px-12">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-black text-brand-950 flex items-center gap-2">
              <MapPin className="text-brand-600" size={24} />
              Marketing Location Tracker
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-0.5">
              Monitor sales team lead generation coordinates and marketing visits
            </p>
          </div>
          <button
            onClick={() => fetchGeoLeads(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:text-brand-600 hover:border-brand-200 transition-all shadow-sm"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            Refresh data
          </button>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Search Box */}
            <div className="relative flex flex-col justify-center">
              <label htmlFor="mt-search" className="text-[10px] font-black uppercase text-slate-500 tracking-wider mb-1 ml-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                  id="mt-search"
                  type="text"
                  placeholder="Search leads..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all font-medium text-brand-950 placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Sales Agent Filter */}
            <div className="relative flex flex-col justify-center">
              <label htmlFor="mt-agent" className="text-[10px] font-black uppercase text-slate-500 tracking-wider mb-1 ml-1">Sales Agent</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <select
                  id="mt-agent"
                  value={agentFilter}
                  onChange={e => setAgentFilter(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all font-bold text-slate-700 outline-none appearance-none"
                >
                  <option value="all">All Sales Agents</option>
                  {agentsList.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
              </div>
            </div>

            {/* Start Date */}
            <div className="flex flex-col justify-center">
              <label htmlFor="mt-from" className="text-[10px] font-black uppercase text-slate-500 tracking-wider mb-1 ml-1">From Date</label>
              <div className="relative w-full">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                <input
                  id="mt-from"
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all font-medium text-slate-700"
                />
              </div>
            </div>

            {/* End Date */}
            <div className="flex flex-col justify-center">
              <label htmlFor="mt-to" className="text-[10px] font-black uppercase text-slate-500 tracking-wider mb-1 ml-1">To Date</label>
              <div className="relative w-full">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                <input
                  id="mt-to"
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all font-medium text-slate-700"
                />
              </div>
            </div>

          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="bg-white border border-slate-200 rounded-3xl h-[500px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <RefreshCw className="animate-spin text-brand-600" size={32} />
              <p className="text-sm font-bold text-slate-500">Loading tracking coordinates...</p>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <th className="py-4 px-6">Customer / Lead</th>
                    <th className="py-4 px-6">Type</th>
                    <th className="py-4 px-6">Details</th>
                    <th className="py-4 px-6">Logged By</th>
                    <th className="py-4 px-6">GPS Coordinates</th>
                    <th className="py-4 px-6">Date Registered</th>
                    <th className="py-4 px-6 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredLeads.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                        No location logs match your current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredLeads.map(lead => (
                      <tr key={`${lead.type}-${lead.id}`} className="hover:bg-slate-50/40 transition-colors">
                        <td className="py-4 px-6 font-bold text-brand-950">
                          <div>{lead.name}</div>
                          {lead.phone && (
                            <div className="text-xs text-slate-400 font-normal font-mono mt-0.5">{lead.phone}</div>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                            lead.type === 'General' ? 'bg-brand-50 text-brand-700' : 'bg-emerald-50 text-emerald-700'
                          }`}>
                            {lead.type === 'General' ? <MessageSquare size={10} /> : <Package size={10} />}
                            {lead.type}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-xs font-semibold text-slate-600">
                          {lead.type === 'General' ? (
                            <span className="text-brand-700">{lead.subject || 'N/A'}</span>
                          ) : (
                            <span className="text-teal-700">{lead.product_name || 'N/A'}</span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-700">{lead.logged_by_name || 'Public'}</div>
                          {lead.logged_by_email && (
                            <div className="text-[10px] text-slate-400 font-normal font-mono mt-0.5">{lead.logged_by_email}</div>
                          )}
                        </td>
                        <td className="py-4 px-6 font-mono text-xs text-slate-500">
                          <div>{lead.latitude.toFixed(6)}, {lead.longitude.toFixed(6)}</div>
                          {lead.location_accuracy && (
                            <div className="text-[9px] text-emerald-600 font-sans font-bold mt-0.5">±{lead.location_accuracy}m accuracy</div>
                          )}
                        </td>
                        <td className="py-4 px-6 text-xs text-slate-400 font-bold">
                          {new Date(lead.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${lead.latitude},${lead.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl hover:bg-brand-50 hover:text-brand-600 hover:border-brand-200 transition-colors shadow-sm"
                          >
                            <ExternalLink size={10} />
                            View Map
                          </a>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
