'use client';

import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { MapPin, User, Calendar, Search, RefreshCw, ChevronDown, MessageSquare, Package, ExternalLink, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';

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
  const [activeTab, setActiveTab] = useState<'map' | 'table'>('map');
  const [geoLeads, setGeoLeads] = useState<GeoLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [agentFilter, setAgentFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const mapInstanceRef = useRef<any>(null);

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

      // 3. Date filter
      let matchDate = true;
      if (dateFilter !== 'all') {
        const leadDate = new Date(lead.created_at);
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        if (dateFilter === 'today') {
          matchDate = leadDate >= startOfDay;
        } else if (dateFilter === 'week') {
          const oneWeekAgo = new Date(startOfDay.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchDate = leadDate >= oneWeekAgo;
        } else if (dateFilter === 'month') {
          const oneMonthAgo = new Date(startOfDay.getFullYear(), startOfDay.getMonth() - 1, startOfDay.getDate());
          matchDate = leadDate >= oneMonthAgo;
        }
      }

      return matchSearch && matchAgent && matchDate;
    });
  }, [geoLeads, searchQuery, agentFilter, dateFilter]);

  // Leaflet integration
  useEffect(() => {
    if (activeTab !== 'map' || loading) return;

    // Load CDN resources if not already present
    let isCancelled = false;

    const initMap = () => {
      if (isCancelled) return;
      const L = (window as any).L;
      if (!L) return;

      const container = document.getElementById('marketing-tracker-map');
      if (!container) return;

      // Clean up previous map instance
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Center map on average coords or default to center of India
      const validCoords = filteredLeads.map(l => [l.latitude, l.longitude]);
      const center = validCoords.length > 0
        ? [
            validCoords.reduce((acc, c) => acc + c[0], 0) / validCoords.length,
            validCoords.reduce((acc, c) => acc + c[1], 0) / validCoords.length
          ]
        : [20.5937, 78.9629];

      const zoom = validCoords.length > 0 ? 8 : 5;

      const map = L.map('marketing-tracker-map').setView(center, zoom);
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      // Custom marker icon colors if possible, otherwise Leaflet default
      filteredLeads.forEach(lead => {
        const marker = L.marker([lead.latitude, lead.longitude]).addTo(map);
        
        const popupHtml = `
          <div style="font-family: inherit; font-size: 11px; padding: 4px; min-width: 180px;">
            <div style="font-weight: 800; color: #1e3a8a; font-size: 13px; margin-bottom: 3px;">${lead.name}</div>
            <div style="margin-bottom: 4px;">
              <span style="font-weight: 900; text-transform: uppercase; font-size: 9px; padding: 2px 6px; border-radius: 9999px; ${
                lead.type === 'General' ? 'background-color: #eff6ff; color: #2563eb; border: 1px solid #dbeafe;' : 'background-color: #f0fdf4; color: #16a34a; border: 1px solid #dcfce7;'
              }">
                ${lead.type} Lead
              </span>
            </div>
            ${lead.phone ? `<div style="font-weight: 500; color: #475569; margin-bottom: 2px;">Phone: <strong>${lead.phone}</strong></div>` : ''}
            ${lead.subject ? `<div style="font-weight: 600; color: #334155; margin-bottom: 2px;">Subj: ${lead.subject}</div>` : ''}
            ${lead.product_name ? `<div style="font-weight: 600; color: #0f766e; margin-bottom: 2px;">Prod: ${lead.product_name}</div>` : ''}
            <div style="border-top: 1px solid #f1f5f9; margin-top: 6px; padding-top: 4px; color: #94a3b8; font-size: 9px;">
              By: <strong>${lead.logged_by_name || 'N/A'}</strong><br/>
              On: ${new Date(lead.created_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
            </div>
            <a href="https://www.google.com/maps/search/?api=1&query=${lead.latitude},${lead.longitude}" target="_blank" rel="noopener noreferrer" style="display: block; text-align: center; color: white; background-color: #2563eb; font-weight: 800; font-size: 9px; text-transform: uppercase; text-decoration: none; padding: 6px; border-radius: 8px; margin-top: 8px;">
              Google Maps navigation
            </a>
          </div>
        `;
        marker.bindPopup(popupHtml);
      });
    };

    // Load leaflet CSS
    let css = document.querySelector('link[href*="leaflet.css"]') as HTMLLinkElement;
    if (!css) {
      css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(css);
    }

    // Load leaflet JS
    let script = document.querySelector('script[src*="leaflet.js"]') as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = initMap;
      document.head.appendChild(script);
    } else {
      // Script is loaded, check if window.L is ready, otherwise wait
      const checkL = setInterval(() => {
        if ((window as any).L) {
          clearInterval(checkL);
          initMap();
        }
      }, 50);
      setTimeout(() => clearInterval(checkL), 5000);
    }

    return () => {
      isCancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [activeTab, loading, filteredLeads]);

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-6 lg:px-12">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-black text-blue-950 flex items-center gap-2">
              <MapPin className="text-blue-600" size={24} />
              Marketing Location Tracker
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-0.5">
              Monitor sales team lead generation coordinates and marketing visits
            </p>
          </div>
          <button
            onClick={() => fetchGeoLeads(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            Refresh data
          </button>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Search Box */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search leads..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all font-medium text-blue-950 placeholder:text-slate-400"
              />
            </div>

            {/* Sales Agent Filter */}
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <select
                value={agentFilter}
                onChange={e => setAgentFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all font-bold text-slate-700 outline-none appearance-none"
              >
                <option value="all">All Sales Agents</option>
                {agentsList.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
            </div>

            {/* Date Filter */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <select
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all font-bold text-slate-700 outline-none appearance-none"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="week">Past 7 Days</option>
                <option value="month">Past 30 Days</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
            </div>

            {/* View Switch Tabs */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('map')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'map'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                Interactive Map
              </button>
              <button
                onClick={() => setActiveTab('table')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'table'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                Location Logs
              </button>
            </div>

          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="bg-white border border-slate-200 rounded-3xl h-[500px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <RefreshCw className="animate-spin text-blue-600" size={32} />
              <p className="text-sm font-bold text-slate-500">Loading tracking coordinates...</p>
            </div>
          </div>
        ) : (
          <div className="relative">
            {/* Map Tab */}
            {activeTab === 'map' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-3 shadow-sm overflow-hidden">
                {filteredLeads.length === 0 ? (
                  <div className="h-[500px] flex flex-col items-center justify-center text-slate-400">
                    <ShieldAlert size={40} className="mb-2 opacity-30" />
                    <p className="font-bold">No geo-tagged leads found matching current filters</p>
                  </div>
                ) : (
                  <div 
                    id="marketing-tracker-map" 
                    className="w-full h-[550px] rounded-2xl z-10 border border-slate-100 shadow-inner"
                  />
                )}
              </div>
            )}

            {/* Table Tab */}
            {activeTab === 'table' && (
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
                            <td className="py-4 px-6 font-bold text-blue-950">
                              <div>{lead.name}</div>
                              {lead.phone && (
                                <div className="text-xs text-slate-400 font-normal font-mono mt-0.5">{lead.phone}</div>
                              )}
                            </td>
                            <td className="py-4 px-6">
                              <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                                lead.type === 'General' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'
                              }`}>
                                {lead.type === 'General' ? <MessageSquare size={10} /> : <Package size={10} />}
                                {lead.type}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-xs font-semibold text-slate-600">
                              {lead.type === 'General' ? (
                                <span className="text-blue-700">{lead.subject || 'N/A'}</span>
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
                                className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors shadow-sm"
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
        )}

      </div>
    </div>
  );
}
