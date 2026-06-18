'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, parseISO, isToday, isTomorrow } from 'date-fns';
import { useRouter } from 'next/navigation';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/admin/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(Array.isArray(data) ? data : []);
      } else {
        setNotifications([]);
      }
    } catch (err) {
      console.warn('Failed to fetch notifications', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60_000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const formatMeetingDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const d = new Date(dateString);
      if (isToday(d)) return 'Today';
      if (isTomorrow(d)) return 'Tomorrow';
      return format(d, 'MMM d, yyyy');
    } catch {
      return dateString;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-brand-600 hover:border-brand-200 transition-all relative shadow-sm"
      >
        <Bell size={20} />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white items-center justify-center text-[8px] font-bold text-white">
              {notifications.length}
            </span>
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute right-0 mt-3 w-80 bg-white border border-slate-100 rounded-[2rem] shadow-xl overflow-hidden z-50"
          >
            <div className="p-5 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
              <h3 className="font-black text-brand-950">Notifications</h3>
              <span className="text-[10px] font-bold bg-white px-2 py-1 rounded-full text-slate-500 border border-slate-100">
                {notifications.length} upcoming
              </span>
            </div>
            <div className="max-h-[400px] overflow-y-auto p-3 space-y-2">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Bell size={32} className="mx-auto mb-2 opacity-20" />
                  <p className="text-sm font-medium">All caught up!</p>
                </div>
              ) : (
                notifications.map((notif, idx) => (
                  <div
                    key={`${notif.type}-${notif.id}-${idx}`}
                    onClick={() => {
                      setIsOpen(false);
                      router.push('/admin/inquiries');
                    }}
                    className="p-3 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 hover:border-slate-200 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center shrink-0 mt-0.5 text-brand-600 group-hover:scale-110 transition-transform">
                        <Calendar size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-brand-950 truncate">
                          Meeting with {notif.name}
                        </p>
                        <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                          {notif.topic || 'General Inquiry'}
                        </p>
                        <div className="flex flex-col gap-1.5 mt-2">
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[11px] font-black text-white bg-brand-600 px-2.5 py-1 rounded-lg shadow-sm">{formatMeetingDate(notif.meeting_date)}</span>
                            {notif.meeting_time && <span className="text-[11px] font-bold text-brand-700 bg-brand-100 px-2 py-1 rounded-lg">{notif.meeting_time}</span>}
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 bg-slate-50 w-fit px-2 py-1 rounded-md max-w-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0"></span>
                            <span className="truncate">{notif.meeting_type === 'office' ? 'Office Visit' : notif.meeting_location || 'Custom Location'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
