'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import toast, { Toaster } from 'react-hot-toast';
import dynamic from 'next/dynamic';
import {
  MapPin,
  Clock,
  LogOut,
  Camera,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  UserPlus,
  Plus,
  X,
  FileText,
  HelpCircle,
  Package,
  Map as MapIcon,
  ChevronsRight,
  User,
  RefreshCw
} from 'lucide-react';

const LeafletMap = dynamic(() => import('@/components/LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[240px] flex items-center justify-center bg-slate-50 border border-slate-200 rounded-2xl">
      <div className="w-6 h-6 border-2 border-blue-600/40 border-t-blue-600 rounded-full animate-spin"></div>
    </div>
  )
});

export default function SalesPortalPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Shift States
  const [activeShift, setActiveShift] = useState<any | null>(null);
  const [visits, setVisits] = useState<any[]>([]);
  const [todayShifts, setTodayShifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Products catalog list for lead auto-suggest
  const [productsList, setProductsList] = useState<any[]>([]);

  // Geolocation states for attendance checks
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'acquiring' | 'success' | 'error'>('idle');
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number; accuracy: number | null; method: 'gps' | 'ip'; ip: string } | null>(null);

  // Shift Timer state
  const [timerText, setTimerText] = useState('00:00:00');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Client-side address geocoding states
  const [resolvedAddress, setResolvedAddress] = useState<string | null>(null);

  const fetchAddress = useCallback(async (lat: number, lng: number) => {
    try {
      const res = await fetch(`/api/admin/sales-portal/reverse-geocode?lat=${lat}&lng=${lng}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setResolvedAddress(data.address);
        }
      }
    } catch (err) {
      console.error('Failed to resolve address:', err);
    }
  }, []);

  useEffect(() => {
    if (coords && gpsStatus === 'success') {
      fetchAddress(coords.latitude, coords.longitude);
    } else {
      setResolvedAddress(null);
    }
  }, [coords, gpsStatus, fetchAddress]);

  // Visit location geocoding states
  const [visitCoords, setVisitCoords] = useState<{ latitude: number; longitude: number; accuracy: number | null; method: 'gps'; ip: string } | null>(null);
  const [visitGpsStatus, setVisitGpsStatus] = useState<'idle' | 'acquiring' | 'success' | 'error'>('idle');
  const [visitGpsError, setVisitGpsError] = useState<string | null>(null);
  const [visitAddress, setVisitAddress] = useState<string | null>(null);

  const fetchVisitAddress = useCallback(async (lat: number, lng: number) => {
    try {
      const res = await fetch(`/api/admin/sales-portal/reverse-geocode?lat=${lat}&lng=${lng}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setVisitAddress(data.address);
        }
      }
    } catch (err) {
      console.error('Failed to resolve visit address:', err);
    }
  }, []);

  useEffect(() => {
    if (visitCoords && visitGpsStatus === 'success') {
      fetchVisitAddress(visitCoords.latitude, visitCoords.longitude);
    } else {
      setVisitAddress(null);
    }
  }, [visitCoords, visitGpsStatus, fetchVisitAddress]);

  const handleCoordsChange = useCallback((newCoords: { latitude: number; longitude: number }) => {
    setCoords(prev => prev ? { ...prev, ...newCoords } : { latitude: newCoords.latitude, longitude: newCoords.longitude, accuracy: null, method: 'gps', ip: 'local' });
  }, []);

  const handleVisitCoordsChange = useCallback((newCoords: { latitude: number; longitude: number }) => {
    setVisitCoords(prev => prev ? { ...prev, ...newCoords } : { latitude: newCoords.latitude, longitude: newCoords.longitude, accuracy: null, method: 'gps', ip: 'local' });
  }, []);

  // Marketing Visit Form States
  const [visitTitle, setVisitTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submittingVisit, setSubmittingVisit] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add Lead Form States
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [leadType, setLeadType] = useState<'general' | 'product'>('general');
  const [leadData, setLeadData] = useState({
    name: '',
    phone: '',
    email: '',
    gstin: '',
    subject: '',
    productName: '',
    message: ''
  });
  const [isSavingLead, setIsSavingLead] = useState(false);

  // Redirect if unauthenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/sales-portal/login');
    } else if (status === 'authenticated') {
      fetchStatus();
      fetchProducts();
    }
  }, [status, router]);

  // Fetch status of today's shifts and active check-ins
  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/admin/sales-portal/status', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch status');
      const data = await res.json();
      if (data.success) {
        setActiveShift(data.activeShift);
        setVisits(data.visits || []);
        setTodayShifts(data.todayShifts || []);
        if (data.activeShift && data.activeShift.check_in_address) {
          setResolvedAddress(data.activeShift.check_in_address);
        }
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to load portal status');
    } finally {
      setLoading(false);
    }
  };

  // Fetch products catalog for auto-suggest
  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setProductsList(data);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    }
  };

  // Live timer interval to calculate work duration
  useEffect(() => {
    if (activeShift && activeShift.check_in_time) {
      const checkInMs = new Date(activeShift.check_in_time).getTime();
      
      const updateTimer = () => {
        const elapsedMs = Date.now() - checkInMs;
        if (elapsedMs < 0) {
          setTimerText('00:00:00');
          return;
        }
        const hrs = Math.floor(elapsedMs / 3600000);
        const mins = Math.floor((elapsedMs % 3600000) / 60000);
        const secs = Math.floor((elapsedMs % 60000) / 1000);

        setTimerText(
          `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
        );
      };

      updateTimer();
      timerRef.current = setInterval(updateTimer, 1000);
    } else {
      setTimerText('00:00:00');
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeShift]);

  // Helper to fetch raw GPS coordinates from browser
  const getCurrentGPS = useCallback(() => {
    return new Promise<{ latitude: number; longitude: number; accuracy: number | null; method: 'gps'; ip: string }>((resolve, reject) => {
      if (!navigator.geolocation) {
        let errorMsg = 'Device GPS/Location services are not supported by this browser.';
        if (typeof window !== 'undefined' && window.location.protocol === 'http:' && window.location.hostname !== 'localhost') {
          errorMsg = 'Location access is blocked on insecure HTTP connections. Please access the portal using a secure HTTPS connection or from localhost.';
        }
        reject(new Error(errorMsg));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            method: 'gps' as const,
            ip: 'local'
          });
        },
        (error) => {
          console.warn('[Sales Portal] Browser geolocation error details:', error.code, error.message);
          let msg = 'Location access denied. Precise device GPS location is required to proceed. Please enable location permissions in your browser and device settings.';
          if (error.code === error.POSITION_UNAVAILABLE) {
            msg = 'GPS location is currently unavailable. Please ensure your device GPS/location services are turned on.';
          } else if (error.code === error.TIMEOUT) {
            msg = 'Location request timed out. Please ensure you have a clear GPS signal and try again.';
          }
          reject(new Error(msg));
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    });
  }, []);

  // Precise device-only GPS location checker (No IP fallback)
  const acquireLocation = useCallback(async () => {
    setGpsStatus('acquiring');
    setGpsError(null);
    try {
      const res = await getCurrentGPS();
      setCoords(res);
      setGpsStatus('success');
      return res;
    } catch (err: any) {
      setGpsStatus('error');
      setGpsError(err.message);
      toast.error(err.message);
      throw err;
    }
  }, [getCurrentGPS]);

  // Separate GPS location checker for Visit logging
  const acquireVisitLocation = useCallback(async () => {
    setVisitGpsStatus('acquiring');
    setVisitGpsError(null);
    try {
      const res = await getCurrentGPS();
      setVisitCoords(res);
      setVisitGpsStatus('success');
      return res;
    } catch (err: any) {
      setVisitGpsStatus('error');
      setVisitGpsError(err.message);
      toast.error(err.message);
      throw err;
    }
  }, [getCurrentGPS]);

  // Handle shift check-in
  const handleCheckIn = async () => {
    if (!coords) {
      toast.error('Please acquire and verify your check-in location first.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/admin/sales-portal/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'checkin',
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: coords.accuracy,
          ip: coords.ip,
          method: coords.method
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to check in');

      toast.success('Shift started! Checked in successfully.');
      fetchStatus();
    } catch (err: any) {
      toast.error(err.message || 'Check-in failed');
      setLoading(false);
    }
  };

  // Handle shift check-out
  const handleCheckOut = async () => {
    setLoading(true);
    try {
      // For checkout, we acquire location dynamically
      const location = await getCurrentGPS();
      
      const res = await fetch('/api/admin/sales-portal/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'checkout',
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
          ip: location.ip,
          method: location.method
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to check out');

      toast.success('Shift completed! Checked out successfully.');
      fetchStatus();
    } catch (err: any) {
      toast.error(err.message || 'Check-out failed');
      setLoading(false);
    }
  };

  // Handle Visit Image Upload
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      
      setImageUrl(data.url);
      toast.success('Photo uploaded successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload photo');
    } finally {
      setUploadingImage(false);
    }
  };

  // Submit logged marketing visit
  const handleLogVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitTitle.trim()) {
      toast.error('Please enter the customer / shop name.');
      return;
    }
    if (!imageUrl) {
      toast.error('Please take/upload a photo of the visit.');
      return;
    }
    if (!visitCoords) {
      toast.error('Please acquire and pinpoint the visit location on the map first.');
      return;
    }

    setSubmittingVisit(true);
    try {
      const res = await fetch('/api/admin/sales-portal/visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitTitle: visitTitle.trim(),
          notes: notes.trim(),
          imageUrl,
          latitude: visitCoords.latitude,
          longitude: visitCoords.longitude,
          accuracy: visitCoords.accuracy,
          method: visitCoords.method
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to log visit');

      toast.success('Visit logged successfully');
      setVisitTitle('');
      setNotes('');
      setImageUrl('');
      setVisitCoords(null);
      setVisitGpsStatus('idle');
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      // Reload shift state to include new visit in feed
      fetchStatus();
    } catch (err: any) {
      toast.error(err.message || 'Failed to log visit');
    } finally {
      setSubmittingVisit(false);
    }
  };

  // Submit Add Lead Form
  const handleSaveLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadData.name.trim()) {
      toast.error('Customer Name is required.');
      return;
    }
    if (!leadData.phone.trim()) {
      toast.error('Mobile Number is required.');
      return;
    }
    if (!leadData.message.trim()) {
      toast.error('Inquiry Requirement message is required.');
      return;
    }

    setIsSavingLead(true);
    try {
      // Capture coordinates automatically
      const location = await acquireLocation();
      
      const payload: any = {
        name: leadData.name.trim(),
        phone: leadData.phone.trim(),
        message: leadData.message.trim(),
        gstin: leadData.gstin.trim() || undefined,
        latitude: location.latitude,
        longitude: location.longitude,
        location_accuracy: location.accuracy,
      };

      let url = '/api/inquiries';
      if (leadType === 'product') {
        url = '/api/product-inquiries';
        payload.productName = leadData.productName.trim();
        const matched = productsList.find(
          (p) => p.name.toLowerCase() === leadData.productName.trim().toLowerCase()
        );
        payload.productId = matched ? String(matched.id) : undefined;
        payload.email = leadData.email.trim() || undefined;
      } else {
        payload.subject = leadData.subject.trim() || undefined;
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error ? JSON.stringify(resData.error) : 'Failed to create lead');

      toast.success('Customer Lead added successfully!');
      setIsAddLeadOpen(false);
      // Reset form
      setLeadData({
        name: '',
        phone: '',
        email: '',
        gstin: '',
        subject: '',
        productName: '',
        message: ''
      });
    } catch (err: any) {
      toast.error(err.message || 'Failed to save lead');
    } finally {
      setIsSavingLead(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-600">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={36} className="animate-spin text-blue-500" />
          <p className="text-sm font-semibold tracking-wide uppercase text-slate-400">Loading Sales Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col antialiased">
      <Toaster position="top-center" />

      {/* Header bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 py-3.5 flex items-center justify-between shadow-sm shadow-slate-100/50">
        <div className="flex items-center gap-2.5">
          <div className="bg-blue-50 p-2 rounded-xl border border-blue-100">
            <Clock className="text-blue-600 shrink-0" size={18} />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-wide uppercase text-slate-800 leading-none">Sales Portal</h1>
            <p className="text-[10px] text-slate-500 font-semibold mt-1">
              Agent: {session?.user?.name || 'Staff Member'}
            </p>
          </div>
        </div>

        <button 
          onClick={() => signOut({ callbackUrl: '/sales-portal/login' })}
          className="text-slate-400 hover:text-red-650 p-2.5 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-xl transition-all"
          title="Sign Out"
        >
          <LogOut size={16} />
        </button>
      </header>

      {/* Main content body */}
      <main className="flex-1 w-full max-w-md mx-auto p-4 flex flex-col gap-6 pb-10">
        
        {/* Geolocation Status Message (Only visible when acquiring) */}
        {gpsStatus === 'acquiring' && (
          <div className="bg-blue-50 border border-blue-100 p-3 rounded-2xl flex items-center gap-3 text-xs text-blue-600">
            <Loader2 size={16} className="animate-spin text-blue-500" />
            <span>Resolving device location...</span>
          </div>
        )}

        {/* 1. Shift Card */}
        <section className="bg-white border border-slate-100 rounded-3xl p-5.5 shadow-sm shadow-slate-100/50 flex flex-col gap-4.5">
          <div className="flex items-center justify-between">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Shift Status</h2>
            <span className={`inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
              activeShift ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-500 border border-slate-200'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${activeShift ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
              {activeShift ? 'Shift Active' : 'Off Duty'}
            </span>
          </div>

          {activeShift ? (
            <div className="flex flex-col gap-4">
              <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/50 p-5 rounded-2xl border border-blue-100/30 flex flex-col items-center justify-center">
                <span className="text-[10px] font-bold tracking-wider text-blue-600 uppercase">Elapsed Work Duration</span>
                <span className="text-3xl font-black text-slate-900 tracking-widest font-mono mt-1">{timerText}</span>
                <span className="text-[9px] text-slate-400 mt-2 font-semibold">
                  Started at {new Date(activeShift.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {coords && gpsStatus === 'success' && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-[10px] text-slate-600 flex flex-col gap-1">
                  <span>
                    <strong>Location Mode:</strong> {coords.method === 'gps' ? 'Device GPS (Precise)' : 'IP Geolocation (Approx)'}
                  </span>
                  <span>
                    <strong>Coordinates:</strong> {coords.latitude.toFixed(6)}, {coords.longitude.toFixed(6)}
                  </span>
                  {resolvedAddress && (
                    <span className="mt-1 block">
                      <strong>Resolved Address:</strong> {resolvedAddress}
                    </span>
                  )}
                </div>
              )}

              {/* Action grid (Add Lead and Check Out) */}
              <div className="grid grid-cols-2 gap-3.5 mt-1">
                <button
                  onClick={() => setIsAddLeadOpen(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase tracking-wider text-[11px] py-3.5 rounded-2xl transition-all shadow-sm hover:shadow-md shadow-blue-200 flex items-center justify-center gap-1.5"
                >
                  <Plus size={14} />
                  Add Lead
                </button>
                <button
                  onClick={handleCheckOut}
                  className="w-full bg-red-50 hover:bg-red-100 text-red-650 font-bold uppercase tracking-wider text-[11px] py-3.5 rounded-2xl transition-all border border-red-200/60 hover:text-red-700 flex items-center justify-center gap-1.5"
                >
                  <LogOut size={14} />
                  Check Out
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 py-2">
              <p className="text-xs text-slate-500 text-center leading-relaxed px-2">
                You are currently clocked out. Check-in records your timestamp and exact location.
              </p>
              
              {gpsStatus !== 'success' ? (
                <button
                  type="button"
                  onClick={acquireLocation}
                  disabled={gpsStatus === 'acquiring'}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold uppercase tracking-wider text-xs py-3.5 rounded-2xl transition-all shadow-sm hover:shadow-md shadow-blue-200 flex items-center justify-center gap-2"
                >
                  {gpsStatus === 'acquiring' ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Acquiring GPS Location...
                    </>
                  ) : (
                    <>
                      <MapIcon size={14} />
                      Acquire Location to Check In
                    </>
                  )}
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="text-xs space-y-1 bg-slate-50 border border-slate-200/60 rounded-2xl p-3.5 text-slate-600">
                    <div className="flex items-center gap-1.5 text-slate-800 font-bold mb-1">
                      <MapPin size={14} className="text-blue-600" />
                      <span>Verify Check-In Location</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Drag the marker to pinpoint your exact location.
                    </p>
                    {resolvedAddress && (
                      <div className="mt-2 text-slate-850 font-bold bg-white border border-slate-100 rounded-xl p-2.5 shadow-sm leading-relaxed">
                        {resolvedAddress}
                      </div>
                    )}
                  </div>

                  {coords && (
                    <LeafletMap
                      latitude={coords.latitude}
                      longitude={coords.longitude}
                      onChange={handleCoordsChange}
                      height="220px"
                    />
                  )}

                  <div className="flex gap-3.5">
                    <button
                      type="button"
                      onClick={acquireLocation}
                      disabled={(gpsStatus as string) === 'acquiring'}
                      className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px] rounded-2xl transition-all flex items-center justify-center"
                      title="Recenter Map"
                    >
                      Recenter
                    </button>
                    <button
                      type="button"
                      onClick={handleCheckIn}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase tracking-wider text-xs py-3.5 rounded-2xl transition-all shadow-sm hover:shadow-md shadow-blue-200 flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 size={14} />
                      Check In & Start Shift
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* 2. Marketing Visit Logger (Only when Checked In) */}
        {activeShift && (
          <section className="bg-white border border-slate-100 rounded-3xl p-5.5 shadow-sm shadow-slate-100/50 flex flex-col gap-4">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Log Marketing Visit</h2>
            
            <form onSubmit={handleLogVisit} className="flex flex-col gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Customer / Shop Name *</label>
                <input
                  type="text"
                  required
                  value={visitTitle}
                  onChange={e => setVisitTitle(e.target.value)}
                  placeholder="E.g. Shiv Electricals, Nashik"
                  className="w-full text-xs bg-slate-50/50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all font-medium text-slate-800 placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Discussion Notes / Purpose</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Summary of meeting/marketing materials shared..."
                  rows={3}
                  className="w-full text-xs bg-slate-50/50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all font-medium text-slate-800 placeholder:text-slate-400 resize-none"
                />
              </div>

              {/* Photo Proof Upload */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Visit Proof Image *</label>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                />

                {imageUrl ? (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 aspect-video w-full bg-slate-50 flex items-center justify-center">
                    <img 
                      src={imageUrl} 
                      alt="Visit proof preview" 
                      className="object-cover w-full h-full"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageUrl('');
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="absolute top-2.5 right-2.5 bg-white/95 hover:bg-white text-slate-800 p-2 rounded-xl transition-all border border-slate-200 shadow-sm text-[11px] font-bold"
                    >
                      Change Photo
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={uploadingImage}
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-7 border-2 border-dashed border-slate-200 hover:border-blue-300 bg-slate-50/50 hover:bg-blue-50/20 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all group"
                  >
                    {uploadingImage ? (
                      <Loader2 className="animate-spin text-blue-500" size={24} />
                    ) : (
                      <>
                        <div className="bg-white border border-slate-200 p-2.5 rounded-xl group-hover:bg-blue-50 transition-colors">
                          <Camera className="text-slate-400 group-hover:text-blue-600 transition-colors" size={20} />
                        </div>
                        <div className="flex flex-col items-center mt-1">
                           <span className="text-xs font-bold text-slate-600">Take Photo / Upload</span>
                           <span className="text-[10px] text-slate-400 mt-1 font-semibold">Rear camera will open automatically</span>
                        </div>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Geolocation verification for the visit */}
              <div className="space-y-3 pt-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Customer Location *</label>
                {visitGpsStatus !== 'success' ? (
                  <button
                    type="button"
                    onClick={acquireVisitLocation}
                    disabled={visitGpsStatus === 'acquiring'}
                    className="w-full bg-slate-50 hover:bg-slate-100 text-slate-755 border border-slate-200 border-dashed font-bold uppercase tracking-wider text-[11px] py-4 rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {visitGpsStatus === 'acquiring' ? (
                      <>
                        <Loader2 size={14} className="animate-spin text-blue-500" />
                        Acquiring GPS...
                      </>
                    ) : (
                      <>
                        <MapIcon size={14} className="text-slate-400" />
                        Pin Customer Location on Map
                      </>
                    )}
                  </button>
                ) : (
                  <div className="space-y-3.5">
                    <div className="text-xs space-y-1 bg-slate-50 border border-slate-200/60 rounded-2xl p-3.5 text-slate-600">
                      <div className="flex items-center gap-1.5 text-slate-800 font-bold mb-1">
                        <MapPin size={14} className="text-blue-600" />
                        <span>Verify Customer Shop Location</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Drag the marker to mark the exact shop location.
                      </p>
                      {visitAddress && (
                        <div className="mt-2 text-slate-850 font-bold bg-white border border-slate-100 rounded-xl p-2.5 shadow-sm leading-relaxed">
                          {visitAddress}
                        </div>
                      )}
                    </div>

                    {visitCoords && (
                      <LeafletMap
                        latitude={visitCoords.latitude}
                        longitude={visitCoords.longitude}
                        onChange={handleVisitCoordsChange}
                        height="200px"
                      />
                    )}

                    <button
                      type="button"
                      onClick={acquireVisitLocation}
                      disabled={(visitGpsStatus as string) === 'acquiring'}
                      className="w-full bg-slate-100 hover:bg-slate-200 text-slate-755 font-bold uppercase tracking-wider text-[9px] py-2 rounded-xl transition-all"
                    >
                      Recenter Map to Current GPS
                    </button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={submittingVisit || uploadingImage}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold uppercase tracking-wider text-xs py-3.5 rounded-2xl transition-all mt-2 shadow-sm hover:shadow-md shadow-blue-200 flex items-center justify-center gap-2"
              >
                {submittingVisit ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Saving Visit Logs...
                  </>
                ) : (
                  <>
                    <Upload size={14} />
                    Log Marketing Visit
                  </>
                )}
              </button>
            </form>
          </section>
        )}

        {/* 3. Today's Visits Feed */}
        {activeShift && (
          <section className="flex flex-col gap-3.5">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-1">Today's Visits ({visits.length})</h2>

            {visits.length === 0 ? (
              <div className="bg-white border border-slate-100 rounded-3xl p-6.5 text-center text-xs text-slate-400 shadow-sm shadow-slate-100/40">
                No visits logged during this shift yet.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {visits.map((visit, idx) => (
                  <div key={visit.id} className="bg-white border border-slate-100 rounded-3xl p-4.5 shadow-sm shadow-slate-100/40 flex flex-col gap-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2.5">
                        <div className="bg-blue-50 text-blue-600 p-2 rounded-xl border border-blue-100 font-bold text-xs min-w-[28px] text-center">
                          {visits.length - idx}
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-slate-800 leading-tight">{visit.visit_title}</h3>
                          <span className="text-[9px] text-slate-400 font-semibold block mt-1">
                            Logged at {new Date(visit.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {visit.visit_address && (
                            <span className="text-[9px] text-blue-600 font-bold block mt-1 leading-tight flex items-start gap-1">
                              <MapPin size={10} className="mt-0.5 shrink-0" />
                              {visit.visit_address}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {visit.notes && (
                      <p className="text-[11px] text-slate-655 leading-relaxed font-medium bg-slate-50/60 p-2.5 rounded-xl border border-slate-100/50">
                        {visit.notes}
                      </p>
                    )}

                    <div className="grid grid-cols-2 gap-3.5 mt-1">
                      {/* Image Thumbnail */}
                      <div className="rounded-xl overflow-hidden aspect-video border border-slate-150 bg-slate-50 relative">
                        <img 
                          src={visit.image_url} 
                          alt="Visit Proof" 
                          className="object-cover w-full h-full"
                        />
                      </div>

                      {/* Small Map Embed */}
                      <div className="rounded-xl overflow-hidden aspect-video border border-slate-150 bg-slate-50 relative">
                        <iframe
                          width="100%"
                          height="100%"
                          frameBorder="0"
                          style={{ border: 0 }}
                          src={`https://maps.google.com/maps?q=${visit.latitude},${visit.longitude}&z=13&output=embed`}
                          allowFullScreen
                          loading="lazy"
                        ></iframe>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* 4. Today's Shifts Summary (Recent History) */}
        {!activeShift && todayShifts.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-1">Today's Shifts Completed</h2>

            <div className="flex flex-col gap-2.5">
              {todayShifts.map((shift) => (
                <div key={shift.id} className="bg-white border border-slate-100 rounded-2.5xl p-4.5 flex items-center justify-between text-xs shadow-sm shadow-slate-100/30">
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-50 p-2 rounded-xl border border-emerald-100">
                      <CheckCircle2 className="text-emerald-600 shrink-0" size={16} />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">
                        {new Date(shift.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {' - '}
                        {shift.check_out_time ? new Date(shift.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Pending'}
                      </div>
                      <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">
                        Duration: {shift.work_duration_minutes ? `${Math.floor(shift.work_duration_minutes / 60)}h ${shift.work_duration_minutes % 60}m` : 'N/A'}
                      </span>
                      {shift.check_in_address && (
                        <span className="text-[9px] text-slate-400 font-semibold block mt-1 leading-tight">
                          <strong>Check-In:</strong> {shift.check_in_address}
                        </span>
                      )}
                      {shift.check_out_address && (
                        <span className="text-[9px] text-slate-400 font-semibold block mt-0.5 leading-tight">
                          <strong>Check-Out:</strong> {shift.check_out_address}
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="text-[10px] bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-100 font-bold text-emerald-700">
                    Completed
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

      </main>

      {/* Simple Add Lead Overlay Modal */}
      <AnimatePresence>
        {isAddLeadOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddLeadOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white border border-slate-100 rounded-3xl w-full max-w-sm max-h-[85vh] flex flex-col overflow-hidden shadow-xl shadow-slate-200/50 z-10 text-xs"
            >
              {/* Header */}
              <div className="p-4.5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-800">
                  <UserPlus size={16} className="text-blue-500" />
                  <span className="font-bold uppercase tracking-wider text-xs">Add Customer Lead</span>
                </div>
                <button
                  onClick={() => setIsAddLeadOpen(false)}
                  className="text-slate-400 hover:text-slate-650 p-1 hover:bg-slate-50 rounded-xl transition-all"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Form body */}
              <form onSubmit={handleSaveLead} className="flex-1 overflow-y-auto p-4.5 flex flex-col gap-4">
                
                {/* Lead Type Tabs */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Lead Type</label>
                  <div className="grid grid-cols-2 bg-slate-50 p-1 rounded-xl border border-slate-200/60 text-center text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setLeadType('general')}
                      className={`py-2 rounded-lg transition-all ${
                        leadType === 'general' ? 'bg-white text-blue-600 shadow-sm border border-slate-200/30' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      General Lead
                    </button>
                    <button
                      type="button"
                      onClick={() => setLeadType('product')}
                      className={`py-2 rounded-lg transition-all ${
                        leadType === 'product' ? 'bg-white text-blue-600 shadow-sm border border-slate-200/30' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Product Lead
                    </button>
                  </div>
                </div>

                {/* Customer Name */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={leadData.name}
                    onChange={e => setLeadData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Customer/Client name..."
                    className="w-full text-xs bg-slate-50/50 border border-slate-200 rounded-xl px-3.5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all font-medium text-slate-800 placeholder:text-slate-400"
                  />
                </div>

                {/* Mobile & Email */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Mobile Number *</label>
                    <input
                      type="text"
                      required
                      value={leadData.phone}
                      onChange={e => setLeadData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="10-digit number"
                      className="w-full text-xs bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all font-medium text-slate-800 placeholder:text-slate-400 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Email (Optional)</label>
                    <input
                      type="email"
                      value={leadData.email}
                      onChange={e => setLeadData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="client@mail.com"
                      className="w-full text-xs bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all font-medium text-slate-800 placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* GSTIN & Subject/Product Name */}
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">GSTIN (Optional)</label>
                    <input
                      type="text"
                      value={leadData.gstin}
                      onChange={e => setLeadData(prev => ({ ...prev, gstin: e.target.value.toUpperCase() }))}
                      placeholder="15-digit GST code"
                      maxLength={15}
                      className="w-full text-xs bg-slate-50/50 border border-slate-200 rounded-xl px-3.5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all font-medium text-slate-800 placeholder:text-slate-400 font-mono"
                    />
                  </div>

                  {leadType === 'general' ? (
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Subject (Optional)</label>
                      <input
                        type="text"
                        value={leadData.subject}
                        onChange={e => setLeadData(prev => ({ ...prev, subject: e.target.value }))}
                        placeholder="Purpose of requirement..."
                        className="w-full text-xs bg-slate-50/50 border border-slate-200 rounded-xl px-3.5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all font-medium text-slate-800 placeholder:text-slate-400"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Product Catalog Search *</label>
                      <input
                        type="text"
                        required
                        list="portal-products-list"
                        value={leadData.productName}
                        onChange={e => setLeadData(prev => ({ ...prev, productName: e.target.value }))}
                        placeholder="Type catalog product name..."
                        className="w-full text-xs bg-slate-50/50 border border-slate-200 rounded-xl px-3.5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all font-medium text-slate-800 placeholder:text-slate-400"
                      />
                      <datalist id="portal-products-list">
                        {productsList.map(p => (
                          <option key={p.id} value={p.name}>
                            {p.brand ? `${p.brand} • ` : ''}{p.category}
                          </option>
                        ))}
                      </datalist>
                    </div>
                  )}
                </div>

                {/* Requirement Message */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Inquiry Requirements *</label>
                  <textarea
                    required
                    value={leadData.message}
                    onChange={e => setLeadData(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Specific items, quantity, or services required..."
                    rows={3}
                    className="w-full text-xs bg-slate-50/50 border border-slate-200 rounded-xl px-3.5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all font-medium text-slate-800 placeholder:text-slate-400 resize-none"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSavingLead}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold uppercase tracking-wider text-xs py-3.5 rounded-2xl transition-all mt-2 shadow-sm hover:shadow-md shadow-blue-200 flex items-center justify-center gap-2"
                >
                  {isSavingLead ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Saving Customer Lead...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={14} />
                      Save Customer Lead
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
