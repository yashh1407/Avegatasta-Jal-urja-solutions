'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import toast, { Toaster } from 'react-hot-toast';
import {
  Search,
  RefreshCw,
  Trash2,
  Calendar,
  User,
  Phone,
  MessageSquare,
  Database,
  Quote,
  Settings,
  ArrowRight,
  X,
  BellRing
} from 'lucide-react';

export default function AdminPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [siteSettings, setSiteSettings] = useState<Record<string, string>>({});
  const [notifications, setNotifications] = useState<any[]>([]);
  const [dismissedNotifications, setDismissedNotifications] = useState(false);
  const [stats, setStats] = useState({
    messages: 0,
    testimonials: 0,
    settings: 0,
    dbConnected: false,
  });
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated') {
      fetchData();
    }
  }, [status, router]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('error') === 'forbidden') {
        toast.error('Access Denied: You do not have permission to view that module.', {
          duration: 4000,
          id: 'forbidden-access-toast'
        });
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/dashboard', { cache: 'no-store' });
      const dashboard = await response.json();

      if (!response.ok) {
        throw new Error(dashboard?.error || 'Failed to load dashboard');
      }

      const messages = Array.isArray(dashboard.messages) ? dashboard.messages : [];
      const testimonials = Array.isArray(dashboard.testimonials) ? dashboard.testimonials : [];
      const siteSettings = dashboard.siteSettings && typeof dashboard.siteSettings === 'object'
        ? dashboard.siteSettings
        : {};

      setData(messages);
      setTestimonials(testimonials);
      setSiteSettings(siteSettings);
      setNotifications(Array.isArray(dashboard.notifications) ? dashboard.notifications : []);
      setStats(dashboard.stats ?? {
        messages: messages.length,
        testimonials: testimonials.length,
        settings: Object.keys(siteSettings).length,
        dbConnected: true,
      });
    } catch (error) {
      console.warn('Error fetching admin data:', error);
      setData([]);
      setTestimonials([]);
      setSiteSettings({});
      setStats({ messages: 0, testimonials: 0, settings: 0, dbConnected: false });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    
    try {
      const response = await fetch(`/api/contact?id=${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };


  const filteredData = Array.isArray(data) ? data.filter(item => {
    const searchStr = searchQuery.toLowerCase();
    return (
      (item.name?.toLowerCase().includes(searchStr)) ||
      (item.subject?.toLowerCase().includes(searchStr)) ||
      (item.message?.toLowerCase().includes(searchStr))
    );
  }) : [];

  if (status === 'loading' || status === 'unauthenticated') return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster position="top-right" />
      <main className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-24 py-8">
        
        {/* Notifications Banner */}
        <AnimatePresence>
          {notifications.length > 0 && !dismissedNotifications && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, marginBottom: 0, height: 0 }}
              className="relative mb-8 bg-white border border-blue-100 rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden group"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
              
              <button 
                onClick={() => setDismissedNotifications(true)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors z-10"
                aria-label="Dismiss notifications"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-5 relative z-0">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0 border border-blue-100 shadow-inner">
                  <BellRing className="text-blue-600" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-blue-950">
                    You have {notifications.length} upcoming {notifications.length === 1 ? 'meeting' : 'meetings'}
                  </h2>
                  <p className="text-slate-500 text-sm font-medium mt-1">
                    Check your schedule and prepare for your upcoming calls or visits.
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col gap-2 min-w-[280px] w-full md:w-auto relative z-0 pr-6 md:pr-10">
                {notifications.slice(0, 2).map((notif, idx) => (
                  <div key={idx} className="bg-slate-50 rounded-xl px-4 py-3 flex justify-between items-start gap-4 border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-colors">
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="font-bold text-sm text-blue-950 truncate">{notif.name}</span>
                      <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-0.5 truncate">{notif.topic || 'General Inquiry'}</span>
                      <span className="text-[10px] font-bold text-slate-500 mt-1 flex items-center gap-1 truncate">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0"></span>
                        {notif.meeting_type === 'office' ? 'Office Visit' : notif.meeting_location || 'Custom Location'}
                      </span>
                    </div>
                    <div className="text-right flex flex-col items-end shrink-0 gap-1.5">
                      <span className="block text-[13px] font-black text-white bg-blue-600 px-3 py-1.5 rounded-xl shadow-md shadow-blue-600/20">{new Date(notif.meeting_date).toLocaleDateString()}</span>
                      {notif.meeting_time && <span className="block text-xs text-blue-700 font-bold bg-blue-100 px-2.5 py-1 rounded-lg">{notif.meeting_time}</span>}
                    </div>
                  </div>
                ))}
                {notifications.length > 2 && (
                  <button onClick={() => router.push('/admin/inquiries')} className="text-xs text-blue-600 font-bold hover:text-blue-700 text-right mt-1 underline decoration-blue-200 underline-offset-4">
                    View {notifications.length - 2} more...
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                <MessageSquare size={20} />
              </div>
              <h1 className="text-4xl font-black text-blue-950 tracking-tight">Messages Dashboard</h1>
            </div>
            <p className="text-slate-500 font-medium">Manage all inquiries received via the contact form.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-full md:w-64 transition-all"
              />
            </div>
            <button 
              onClick={fetchData}
              className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:text-blue-600 hover:border-blue-100 transition-all"
              title="Refresh Data"
            >
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Database</span>
              <Database size={18} className={stats.dbConnected ? 'text-emerald-600' : 'text-red-500'} />
            </div>
            <p className={`text-sm font-black ${stats.dbConnected ? 'text-emerald-700' : 'text-red-600'}`}>
              {stats.dbConnected ? 'Connected' : 'Not Connected'}
            </p>
            <p className="text-xs text-slate-500 mt-1">Admin APIs are checked from contact, testimonials and site settings.</p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Messages</span>
              <MessageSquare size={18} className="text-blue-600" />
            </div>
            <p className="text-3xl font-black text-blue-950">{stats.messages}</p>
            <p className="text-xs text-slate-500 mt-1">Records from contact_messages table.</p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Testimonials</span>
              <Quote size={18} className="text-blue-600" />
            </div>
            <p className="text-3xl font-black text-blue-950">{stats.testimonials}</p>
            <p className="text-xs text-slate-500 mt-1">Active testimonial records available in database.</p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Site Settings</span>
              <Settings size={18} className="text-blue-600" />
            </div>
            <p className="text-3xl font-black text-blue-950">{stats.settings}</p>
            <p className="text-xs text-slate-500 mt-1">Settings loaded from the site_settings table.</p>
          </div>
        </div>



        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Testimonials</p>
                <h3 className="text-lg font-black text-blue-950 mt-1">Database-loaded website content</h3>
              </div>
              <a href="/admin/testimonials" className="inline-flex items-center gap-1 text-sm font-black text-brand-600">
                Manage
                <ArrowRight size={14} />
              </a>
            </div>
            <div className="p-6 space-y-4">
              {testimonials.length === 0 ? (
                <p className="text-sm text-slate-500">No testimonials found in database.</p>
              ) : (
                testimonials.slice(0, 3).map((item) => (
                  <div key={item.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-black text-blue-950 text-sm">{item.name}</p>
                        <p className="text-xs text-slate-500">{item.role || 'Customer'}{item.location ? ` • ${item.location}` : ''}</p>
                      </div>
                      <div className="text-xs font-black text-amber-500">{item.rating || 5}/5</div>
                    </div>
                    <p className="text-sm text-slate-600 mt-3 line-clamp-3">{item.text}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Site Settings</p>
                <h3 className="text-lg font-black text-blue-950 mt-1">Live values used on website</h3>
              </div>
              <a href="/admin/site-settings" className="inline-flex items-center gap-1 text-sm font-black text-brand-600">
                Manage
                <ArrowRight size={14} />
              </a>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.keys(siteSettings).length === 0 ? (
                <p className="text-sm text-slate-500 md:col-span-2">No site settings found in database.</p>
              ) : (
                Object.entries(siteSettings).slice(0, 8).map(([key, value]) => (
                  <div key={key} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{key.replace(/_/g, ' ')}</p>
                    <p className="text-sm font-bold text-blue-950 mt-2 break-words">{value || '—'}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
            <h2 className="text-xl font-black text-blue-950 uppercase tracking-widest text-xs">
              Recent Messages ({filteredData.length} shown of {stats.messages})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer Details</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Message Info</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center">
                      <RefreshCw className="animate-spin text-blue-600 mx-auto mb-4" size={32} />
                      <p className="text-slate-500 font-medium">Loading messages...</p>
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                        <Search size={32} />
                      </div>
                      <p className="text-slate-500 font-medium">No messages found.</p>
                      <p className="text-xs text-slate-400 mt-2">If the website is loading but this table is empty, it usually means there are no contact form submissions yet.</p>
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <User size={14} className="text-blue-600" />
                            <span className="text-sm font-bold text-blue-950">{item.name}</span>
                          </div>
                          {item.phone && (
                            <div className="flex items-center gap-2">
                              <Phone size={14} className="text-slate-400" />
                              <span className="text-xs text-slate-500 font-medium">{item.phone}</span>
                            </div>
                          )}
                          {item.email && (
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email:</span>
                              <span className="text-xs text-slate-500 font-medium">{item.email}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <MessageSquare size={14} className="text-blue-400" />
                            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Subject:</span>
                            <span className="text-xs font-bold text-blue-950">{item.subject || 'No Subject'}</span>
                          </div>
                          <div className="text-xs text-slate-500 font-medium bg-slate-100 p-3 rounded-xl border border-slate-200 max-w-md">
                            {item.message}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                          <Calendar size={14} />
                          {new Date(item.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                          title="Delete Message"
                        >
                          <Trash2 size={20} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
