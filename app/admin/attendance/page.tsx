'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import toast, { Toaster } from 'react-hot-toast';
import {
  Calendar,
  Clock,
  MapPin,
  Search,
  Filter,
  Download,
  Users,
  Eye,
  X,
  Map,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ChevronRight,
  ExternalLink,
  ChevronDown,
  RefreshCw,
  ImageIcon,
  Loader2
} from 'lucide-react';

export default function AttendanceLogsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Data states
  const [records, setRecords] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [selectedUser, setSelectedUser] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Detail Drawer
  const [selectedShift, setSelectedShift] = useState<any | null>(null);
  const [activePhoto, setActivePhoto] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated') {
      fetchRecords();
    }
  }, [status, router]);

  // Fetch attendance records from backend
  const fetchRecords = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedUser) params.append('userId', selectedUser);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (selectedStatus) params.append('status', selectedStatus);

      const res = await fetch(`/api/admin/attendance?${params.toString()}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch attendance logs');
      const data = await res.json();
      if (data.success) {
        setRecords(data.records || []);
        setUsers(data.users || []);
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to load attendance logs');
    } finally {
      setLoading(false);
    }
  };

  // Helper to format minutes into a readable string
  const formatDuration = (minutes: number | null) => {
    if (minutes === null || minutes === undefined) return '—';
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs === 0) return `${mins}m`;
    return `${hrs}h ${mins}m`;
  };

  // Helper to format dates
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Helper to format times
  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return '—';
    return new Date(timeStr).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Filter logs locally based on text search query
  const filteredRecords = records.filter(record => {
    const searchLower = searchQuery.toLowerCase();
    return (
      record.agent_name?.toLowerCase().includes(searchLower) ||
      record.agent_email?.toLowerCase().includes(searchLower) ||
      record.check_in_ip?.includes(searchLower) ||
      record.check_out_ip?.includes(searchLower) ||
      record.check_in_address?.toLowerCase().includes(searchLower) ||
      record.check_out_address?.toLowerCase().includes(searchLower) ||
      record.visits?.some((v: any) => 
        v.visit_title?.toLowerCase().includes(searchLower) || 
        v.visit_address?.toLowerCase().includes(searchLower)
      )
    );
  });

  // Export logs to CSV file
  const exportToCSV = () => {
    if (filteredRecords.length === 0) {
      toast.error('No logs available to export.');
      return;
    }

    const headers = [
      'Agent Name',
      'Agent Email',
      'Date',
      'Check-In Time',
      'Check-In Address',
      'Check-In Coords',
      'Check-In Method',
      'Check-In IP',
      'Check-Out Time',
      'Check-Out Address',
      'Check-Out Coords',
      'Check-Out Method',
      'Check-Out IP',
      'Work Duration (mins)',
      'Status',
      'Marketing Visits Count'
    ];

    const rows = filteredRecords.map(r => [
      r.agent_name,
      r.agent_email,
      formatDate(r.created_at),
      formatTime(r.check_in_time),
      r.check_in_address || 'N/A',
      r.check_in_latitude && r.check_in_longitude ? `${r.check_in_latitude},${r.check_in_longitude}` : 'N/A',
      r.check_in_method || 'N/A',
      r.check_in_ip || 'N/A',
      formatTime(r.check_out_time),
      r.check_out_address || 'N/A',
      r.check_out_latitude && r.check_out_longitude ? `${r.check_out_latitude},${r.check_out_longitude}` : 'N/A',
      r.check_out_method || 'N/A',
      r.check_out_ip || 'N/A',
      r.work_duration_minutes || '0',
      r.status,
      r.visits?.length || '0'
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Sales_Attendance_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Attendance report downloaded successfully');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col gap-6 text-slate-800">
      <Toaster position="top-center" />

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Clock className="text-blue-600" size={24} />
            Sales Team Attendance Logs
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Track shifts, check-in locations, hours worked, and field visit verification logs.
          </p>
        </div>

        <button
          onClick={exportToCSV}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase tracking-wider text-[11px] px-4 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-1.5 self-start md:self-auto"
        >
          <Download size={14} />
          Export to CSV
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
            <Users size={20} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-black text-slate-400 block tracking-wider">Total Shift Logs</span>
            <span className="text-lg font-black text-slate-900 mt-0.5">{records.length}</span>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="bg-emerald-50 p-3 rounded-xl text-emerald-600">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-black text-slate-400 block tracking-wider">Active Shifts</span>
            <span className="text-lg font-black text-slate-900 mt-0.5">
              {records.filter(r => r.status === 'checked_in').length}
            </span>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="bg-orange-50 p-3 rounded-xl text-orange-600">
            <MapPin size={20} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-black text-slate-400 block tracking-wider">Total Marketing Visits</span>
            <span className="text-lg font-black text-slate-900 mt-0.5">
              {records.reduce((acc, r) => acc + (r.visits?.length || 0), 0)}
            </span>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="bg-slate-50 p-3 rounded-xl text-slate-650">
            <Clock size={20} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-black text-slate-400 block tracking-wider">Hours Worked</span>
            <span className="text-lg font-black text-slate-900 mt-0.5">
              {formatDuration(records.reduce((acc, r) => acc + (r.work_duration_minutes || 0), 0))}
            </span>
          </div>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
        <div className="flex items-center gap-1.5 text-xs font-black uppercase text-slate-700 tracking-wider">
          <Filter size={14} className="text-slate-500" />
          Filter Logs
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search agent name, email..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all font-medium text-slate-800 placeholder:text-slate-400"
            />
          </div>

          {/* User Filter */}
          <div>
            <select
              value={selectedUser}
              onChange={e => setSelectedUser(e.target.value)}
              className="w-full py-2.5 px-3.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all font-medium text-slate-700"
            >
              <option value="">Select Employee (All)</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full py-2.5 px-3.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all font-medium text-slate-700"
            >
              <option value="">Status (All)</option>
              <option value="checked_in">Active / Checked In</option>
              <option value="completed">Completed Shifts</option>
            </select>
          </div>

          {/* Start Date */}
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">From</label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full py-2.5 px-3.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all font-medium text-slate-700"
            />
          </div>

          {/* End Date */}
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">To</label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="w-full py-2.5 px-3.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all font-medium text-slate-700"
            />
          </div>
        </div>

        {/* Clear Filters & Refresh */}
        <div className="flex items-center justify-end gap-3 mt-1.5 pt-3.5 border-t border-slate-100">
          <button
            onClick={() => {
              setSelectedUser('');
              setStartDate('');
              setEndDate('');
              setSelectedStatus('');
              setSearchQuery('');
            }}
            className="text-[10px] font-black uppercase tracking-wider text-slate-500 hover:text-slate-800 transition-colors"
          >
            Clear Filters
          </button>

          <button
            onClick={fetchRecords}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px] px-3.5 py-2 rounded-xl transition-all flex items-center gap-1 border border-slate-200"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            Apply & Refresh
          </button>
        </div>
      </div>

      {/* Attendance Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="animate-spin text-blue-600" size={30} />
            <span className="text-xs text-slate-500 font-black uppercase tracking-wider">Fetching attendance logs...</span>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="p-20 text-center text-xs text-slate-500 font-medium">
            No attendance records found matching the active filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase font-black tracking-wider text-[10px]">
                  <th className="py-4.5 px-5">Agent</th>
                  <th className="py-4.5 px-5">Date</th>
                  <th className="py-4.5 px-5">Check-In</th>
                  <th className="py-4.5 px-5">Check-Out</th>
                  <th className="py-4.5 px-5">Duration</th>
                  <th className="py-4.5 px-5 text-center">Visits</th>
                  <th className="py-4.5 px-5">Status</th>
                  <th className="py-4.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map(record => (
                  <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Agent */}
                    <td className="py-4 px-5">
                      <div className="font-bold text-slate-900">{record.agent_name}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{record.agent_email}</div>
                    </td>

                    {/* Date */}
                    <td className="py-4 px-5 font-semibold text-slate-700">
                      {formatDate(record.created_at)}
                    </td>

                    {/* Check In */}
                    <td className="py-4 px-5">
                      <div className="font-bold text-slate-800">{formatTime(record.check_in_time)}</div>
                      {record.check_in_address ? (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${record.check_in_latitude},${record.check_in_longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-600 hover:text-blue-600 mt-1 hover:underline max-w-[180px]"
                          title={record.check_in_address}
                        >
                          <MapPin size={9} className="text-blue-500 shrink-0" />
                          <span className="truncate">{record.check_in_address}</span>
                          <span className="text-[9px] text-slate-400 font-bold shrink-0">({record.check_in_method})</span>
                        </a>
                      ) : record.check_in_latitude && record.check_in_longitude && (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${record.check_in_latitude},${record.check_in_longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-0.5 text-[9px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-wide mt-1 hover:underline"
                        >
                          <MapPin size={9} />
                          {Number(record.check_in_latitude).toFixed(4)}, {Number(record.check_in_longitude).toFixed(4)}
                          <span className="text-slate-400">({record.check_in_method})</span>
                        </a>
                      )}
                    </td>

                    {/* Check Out */}
                    <td className="py-4 px-5">
                      <div className="font-bold text-slate-800">{formatTime(record.check_out_time)}</div>
                      {record.check_out_address ? (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${record.check_out_latitude},${record.check_out_longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-600 hover:text-blue-600 mt-1 hover:underline max-w-[180px]"
                          title={record.check_out_address}
                        >
                          <MapPin size={9} className="text-blue-500 shrink-0" />
                          <span className="truncate">{record.check_out_address}</span>
                          <span className="text-[9px] text-slate-400 font-bold shrink-0">({record.check_out_method})</span>
                        </a>
                      ) : record.check_out_latitude && record.check_out_longitude && (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${record.check_out_latitude},${record.check_out_longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-0.5 text-[9px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-wide mt-1 hover:underline"
                        >
                          <MapPin size={9} />
                          {Number(record.check_out_latitude).toFixed(4)}, {Number(record.check_out_longitude).toFixed(4)}
                          <span className="text-slate-400">({record.check_out_method})</span>
                        </a>
                      )}
                    </td>

                    {/* Duration */}
                    <td className="py-4 px-5 font-mono font-bold text-slate-700">
                      {formatDuration(record.work_duration_minutes)}
                    </td>

                    {/* Visits Count */}
                    <td className="py-4 px-5 text-center">
                      <span className={`inline-flex items-center justify-center font-bold px-2 py-1 rounded-lg text-[10px] min-w-[22px] ${
                        record.visits?.length > 0 ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-slate-50 text-slate-400 border border-slate-100'
                      }`}>
                        {record.visits?.length || 0}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-5">
                      <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        record.status === 'checked_in'
                          ? 'bg-blue-50 text-blue-700 border-blue-100'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${record.status === 'checked_in' ? 'bg-blue-500 animate-pulse' : 'bg-emerald-500'}`} />
                        {record.status === 'checked_in' ? 'Active' : 'Completed'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5 text-right">
                      <button
                        onClick={() => setSelectedShift(record)}
                        className="bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 font-bold uppercase tracking-wider text-[10px] px-2.5 py-1.5 rounded-xl shadow-sm transition-all inline-flex items-center gap-1.5 hover:shadow-md"
                      >
                        <Eye size={12} />
                        View Shift
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details drawer/overlay */}
      <AnimatePresence>
        {selectedShift && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedShift(null)}
              className="absolute inset-0 bg-black"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col z-10"
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="font-black text-slate-900 text-sm uppercase tracking-wider">Shift Details</h2>
                  <p className="text-[10px] text-slate-500 font-semibold mt-1">
                    {selectedShift.agent_name} · {formatDate(selectedShift.created_at)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedShift(null)}
                  className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-xl transition-all"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Drawer Body Content */}
              <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6">
                
                {/* Check In / Out Cards Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Check-In stats */}
                  <div className="bg-slate-50/80 border border-slate-150 p-4 rounded-2xl flex flex-col gap-1.5">
                    <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Check In</span>
                    <span className="text-sm font-black text-slate-800">{formatTime(selectedShift.check_in_time)}</span>
                    {selectedShift.check_in_address && (
                      <span className="text-[10px] text-slate-600 font-medium leading-tight">
                        {selectedShift.check_in_address}
                      </span>
                    )}
                    {selectedShift.check_in_latitude && (
                      <span className="text-[9px] text-slate-500 font-semibold mt-1">
                        Method: {selectedShift.check_in_method?.toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Check-Out stats */}
                  <div className="bg-slate-50/80 border border-slate-150 p-4 rounded-2xl flex flex-col gap-1.5">
                    <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Check Out</span>
                    <span className="text-sm font-black text-slate-800">
                      {selectedShift.check_out_time ? formatTime(selectedShift.check_out_time) : 'Active'}
                    </span>
                    {selectedShift.check_out_address && (
                      <span className="text-[10px] text-slate-600 font-medium leading-tight">
                        {selectedShift.check_out_address}
                      </span>
                    )}
                    {selectedShift.check_out_latitude && (
                      <span className="text-[9px] text-slate-500 font-semibold mt-1">
                        Method: {selectedShift.check_out_method?.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Duration Stats banner */}
                <div className="bg-slate-55 bg-slate-900/5 border border-slate-100 p-4.5 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-slate-500" />
                    <span className="text-xs font-semibold text-slate-700">Total Shift Work Duration</span>
                  </div>
                  <span className="text-sm font-black text-slate-900 font-mono">
                    {formatDuration(selectedShift.work_duration_minutes)}
                  </span>
                </div>

                {/* Shift Chronological Timeline */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1.5">
                    Shift Activity Timeline
                  </h3>

                  <div className="relative border-l border-slate-200 pl-5.5 flex flex-col gap-6 ml-2.5 py-1.5">
                    {/* Check In Node */}
                    <div className="relative">
                      <div className="absolute -left-[30px] top-0.5 bg-blue-600 border border-white w-4 h-4 rounded-full flex items-center justify-center shadow-sm z-10" />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Shift Started (Check In)</h4>
                        <p className="text-[10px] text-slate-500 font-medium mt-1">
                          Logged at {formatTime(selectedShift.check_in_time)}
                          {selectedShift.check_in_ip && ` via IP: ${selectedShift.check_in_ip}`}
                        </p>
                        {selectedShift.check_in_address && (
                          <p className="text-[11px] text-slate-700 font-semibold mt-1.5 bg-slate-50 border border-slate-150 p-2.5 rounded-xl leading-relaxed">
                            📍 {selectedShift.check_in_address}
                          </p>
                        )}
                        {selectedShift.check_in_latitude && (
                          <div className="mt-2.5 rounded-xl overflow-hidden border border-slate-200 h-28 w-full shadow-sm bg-white">
                            <iframe
                              width="100%"
                              height="100%"
                              frameBorder="0"
                              style={{ border: 0 }}
                              src={`https://maps.google.com/maps?q=${selectedShift.check_in_latitude},${selectedShift.check_in_longitude}&z=13&output=embed`}
                              allowFullScreen
                              loading="lazy"
                            ></iframe>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Marketing Visits Nodes */}
                    {selectedShift.visits?.map((visit: any, index: number) => (
                      <div key={visit.id} className="relative">
                        <div className="absolute -left-[30px] top-0.5 bg-orange-500 border border-white w-4 h-4 rounded-full flex items-center justify-center shadow-sm z-10 font-bold text-[9px] text-white">
                          {index + 1}
                        </div>
                        <div className="flex flex-col gap-2">
                          <div>
                            <h4 className="text-xs font-bold text-slate-900">Marketing Visit: {visit.visit_title}</h4>
                            <p className="text-[10px] text-slate-500 font-medium mt-1">
                              Logged at {formatTime(visit.created_at)}
                            </p>
                            {visit.visit_address && (
                              <p className="text-[11px] text-slate-700 font-semibold mt-1.5 bg-slate-55 bg-slate-900/5 border border-slate-150 p-2.5 rounded-xl leading-relaxed">
                                📍 {visit.visit_address}
                              </p>
                            )}
                          </div>

                          {visit.notes && (
                            <p className="text-[11px] text-slate-600 bg-slate-50 border border-slate-100 p-2.5 rounded-xl font-medium leading-relaxed">
                              {visit.notes}
                            </p>
                          )}

                          <div className="grid grid-cols-2 gap-3 mt-1">
                            {/* Photo Thumbnail with click zoom */}
                            <div 
                              onClick={() => setActivePhoto(visit.image_url)}
                              className="rounded-xl overflow-hidden aspect-video border border-slate-200 bg-slate-50 relative cursor-pointer hover:border-slate-300 transition-all flex items-center justify-center shadow-sm group"
                              title="Click to view full photo"
                            >
                              <img 
                                src={visit.image_url} 
                                alt="Visit Proof" 
                                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-200"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                <ImageIcon className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={20} />
                              </div>
                            </div>

                            {/* Small Map Embed */}
                            <div className="rounded-xl overflow-hidden aspect-video border border-slate-200 bg-slate-50 relative shadow-sm">
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
                      </div>
                    ))}

                    {/* Check Out Node */}
                    {selectedShift.status === 'completed' && (
                      <div className="relative">
                        <div className="absolute -left-[30px] top-0.5 bg-emerald-600 border border-white w-4 h-4 rounded-full flex items-center justify-center shadow-sm z-10" />
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">Shift Completed (Check Out)</h4>
                          <p className="text-[10px] text-slate-500 font-medium mt-1">
                            Logged at {formatTime(selectedShift.check_out_time)}
                            {selectedShift.check_out_ip && ` via IP: ${selectedShift.check_out_ip}`}
                          </p>
                          {selectedShift.check_out_address && (
                            <p className="text-[11px] text-slate-700 font-semibold mt-1.5 bg-slate-50 border border-slate-150 p-2.5 rounded-xl leading-relaxed">
                              📍 {selectedShift.check_out_address}
                            </p>
                          )}
                          {selectedShift.check_out_latitude && (
                            <div className="mt-2.5 rounded-xl overflow-hidden border border-slate-200 h-28 w-full shadow-sm bg-white">
                              <iframe
                                width="100%"
                                height="100%"
                                frameBorder="0"
                                style={{ border: 0 }}
                                src={`https://maps.google.com/maps?q=${selectedShift.check_out_latitude},${selectedShift.check_out_longitude}&z=13&output=embed`}
                                allowFullScreen
                                loading="lazy"
                              ></iframe>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Full screen photo modal */}
      <AnimatePresence>
        {activePhoto && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-3xl max-h-[85vh] overflow-hidden rounded-2xl border border-white/10 bg-slate-950 flex items-center justify-center shadow-2xl"
            >
              <img 
                src={activePhoto} 
                alt="Full proof photo" 
                className="object-contain max-w-full max-h-[85vh]"
              />
              
              <button
                onClick={() => setActivePhoto(null)}
                className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white p-2.5 rounded-xl border border-white/15 transition-all"
                title="Close Preview"
              >
                <X size={18} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
