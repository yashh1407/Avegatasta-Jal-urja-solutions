'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  Phone,
  MessageSquare,
  Clock,
  User,
  Trash2,
  Mail,
  Send,
  X,
  AlertCircle,
  Check,
  ChevronDown,
  ChevronUp,
  Search,
  ArrowUpDown,
  Tag,
  Calendar,
  StickyNote,
  UserCheck,
  TriangleAlert,
  Download,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

type MessageStatus = 'new' | 'in_progress' | 'resolved' | 'closed' | 'spam';
type LeadStatus =
  | 'new_lead'
  | 'contacted'
  | 'qualified'
  | 'proposal_sent'
  | 'converted'
  | 'lost'
  | 'not_a_lead';
type Priority = 'low' | 'medium' | 'high' | 'urgent';
type SortOption = 'newest' | 'oldest' | 'priority_high' | 'follow_up';
type DateRangeOption = 'all' | 'this_week' | 'this_month' | 'custom';

interface Message {
  id: number;
  name: string;
  phone: string;
  email?: string;
  subject: string;
  message: string;
  created_at: string;
  status: MessageStatus;
  lead_status: LeadStatus;
  priority?: Priority;
  is_read: number; // TINYINT — 0 or 1
  follow_up_date?: string | null;
  notes?: string | null;
  tags?: string | null;
  assigned_to?: string | null;
}

type MessagePatch = Partial<
  Pick<Message, 'status' | 'lead_status' | 'is_read' | 'priority' | 'notes' | 'follow_up_date' | 'tags' | 'assigned_to'>
>;

interface ReplyState {
  messageId: number;
  to: string;
  subject: string;
  htmlBody: string;
  textBody: string;
}

// ─── Config maps ─────────────────────────────────────────────────────────────

const MESSAGE_STATUS_CONFIG: Record<
  MessageStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  new: { label: 'New', bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
  in_progress: { label: 'In Progress', bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
  resolved: { label: 'Resolved', bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
  closed: { label: 'Closed', bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
  spam: { label: 'Spam', bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
};

const LEAD_STATUS_CONFIG: Record<
  LeadStatus,
  { label: string; bg: string; text: string }
> = {
  new_lead: { label: 'New Lead', bg: 'bg-violet-100', text: 'text-violet-700' },
  contacted: { label: 'Contacted', bg: 'bg-sky-100', text: 'text-sky-700' },
  qualified: { label: 'Qualified', bg: 'bg-teal-100', text: 'text-teal-700' },
  proposal_sent: { label: 'Proposal Sent', bg: 'bg-orange-100', text: 'text-orange-700' },
  converted: { label: 'Converted', bg: 'bg-emerald-100', text: 'text-emerald-700' },
  lost: { label: 'Lost', bg: 'bg-rose-100', text: 'text-rose-700' },
  not_a_lead: { label: 'Not a Lead', bg: 'bg-slate-100', text: 'text-slate-500' },
};

const PRIORITY_ORDER: Record<Priority, number> = { urgent: 4, high: 3, medium: 2, low: 1 };

const PRIORITY_CONFIG: Record<Priority, { label: string; bg: string; text: string; dot: string }> = {
  low: { label: 'Low', bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
  medium: { label: 'Medium', bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
  high: { label: 'High', bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500' },
  urgent: { label: 'Urgent', bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
};

const TAG_SUGGESTIONS = ['Tally', 'ERP', 'AMC', 'Website', 'Cloud', 'Custom Software'];

function parseTags(raw?: string | null): string[] {
  return raw ? raw.split(',').map((t) => t.trim()).filter(Boolean) : [];
}

// ─── Badge with inline dropdown ──────────────────────────────────────────────

function InlineBadge<T extends string>({
  value,
  config,
  options,
  onSelect,
  disabled,
}: {
  value: T;
  config: Record<T, { label: string; bg: string; text: string; dot?: string }>;
  options: T[];
  onSelect: (v: T) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const current = config[value];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (!disabled) setOpen((o) => !o);
        }}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-opacity ${current.bg} ${current.text} ${disabled ? 'cursor-default opacity-70' : 'hover:opacity-80 cursor-pointer'}`}
      >
        {current.dot && (
          <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} />
        )}
        {current.label}
        {!disabled && <ChevronDown size={10} />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.1 }}
            className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-30 min-w-[140px] py-1 overflow-hidden"
          >
            {options.map((opt) => {
              const c = config[opt];
              return (
                <button
                  key={opt}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(opt);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-left hover:bg-slate-50 transition-colors ${opt === value ? 'bg-slate-50' : ''}`}
                >
                  <span className={`w-2 h-2 rounded-full ${c.dot ?? c.bg.replace('bg-', 'bg-').replace('-100', '-500')}`} />
                  <span className={c.text}>{c.label}</span>
                  {opt === value && <Check size={10} className="ml-auto text-slate-400" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Filter Select ────────────────────────────────────────────────────────────

function FilterSelect({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 pl-3 pr-8 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer appearance-none w-full"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function AdminMessages() {
  const { status } = useSession();
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<MessageStatus | null>(null);
  const [replyModal, setReplyModal] = useState<ReplyState | null>(null);
  const [sendingReply, setSendingReply] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);
  const [replySuccess, setReplySuccess] = useState<string | null>(null);
  const [patching, setPatching] = useState<Set<number>>(new Set());

  // ── Per-card enrichment draft state ───────────────────────────────────────
  const [notesDraft, setNotesDraft] = useState<Record<number, string>>({});
  const [notesSavedAt, setNotesSavedAt] = useState<Record<number, Date>>({});
  const [assignedDraft, setAssignedDraft] = useState<Record<number, string>>({});

  // ── Bulk selection state ───────────────────────────────────────────────────
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkStatusOpen, setBulkStatusOpen] = useState(false);
  const bulkStatusRef = useRef<HTMLDivElement>(null);

  // ── Pagination state ───────────────────────────────────────────────────────
  const PAGE_SIZE = 20;
  const [currentPage, setCurrentPage] = useState(1);

  // ── Search / filter / sort state ──────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [leadFilter, setLeadFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [dateRange, setDateRange] = useState<DateRangeOption>('all');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  useEffect(() => {
    if (!bulkStatusOpen) return;
    const handler = (e: MouseEvent) => {
      if (bulkStatusRef.current && !bulkStatusRef.current.contains(e.target as Node)) {
        setBulkStatusOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [bulkStatusOpen]);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds(new Set());
  }, [debouncedSearch, statusFilter, leadFilter, priorityFilter, dateRange, customFrom, customTo, sortBy]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/admin/login');
    else if (status === 'authenticated') fetchMessages();
  }, [status, router]);

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/contact');
      const data = await res.json();
      if (Array.isArray(data)) {
        setMessages(data as Message[]);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const patchMessage = async (id: number, updates: MessagePatch) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
    setPatching((s) => new Set(s).add(id));
    try {
      const res = await fetch(`/api/contact/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const updated = (await res.json()) as Message;
        setMessages((prev) => prev.map((m) => (m.id === id ? updated : m)));
      } else {
        await fetchMessages();
      }
    } catch {
      await fetchMessages();
    } finally {
      setPatching((s) => {
        const next = new Set(s);
        next.delete(id);
        return next;
      });
    }
  };

  const handleCardClick = (msg: Message) => {
    const isExpanding = expandedId !== msg.id;
    setExpandedId(isExpanding ? msg.id : null);
    if (isExpanding) {
      if (!msg.is_read) patchMessage(msg.id, { is_read: 1 });
      setNotesDraft((prev) => ({ ...prev, [msg.id]: msg.notes ?? '' }));
      setAssignedDraft((prev) => ({ ...prev, [msg.id]: msg.assigned_to ?? '' }));
    }
  };

  const handleNoteBlur = (id: number) => {
    const draft = notesDraft[id] ?? '';
    patchMessage(id, { notes: draft || null });
    setNotesSavedAt((prev) => ({ ...prev, [id]: new Date() }));
  };

  const handleAssignedBlur = (id: number) => {
    const draft = assignedDraft[id] ?? '';
    patchMessage(id, { assigned_to: draft || null });
  };

  const handleTagToggle = (id: number, tag: string, currentTags?: string | null) => {
    const existing = parseTags(currentTags);
    const next = existing.includes(tag)
      ? existing.filter((t) => t !== tag)
      : [...existing, tag];
    patchMessage(id, { tags: next.length > 0 ? next.join(',') : null });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    try {
      const response = await fetch(`/api/contact?id=${id}`, { method: 'DELETE' });
      if (response.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== id));
        if (expandedId === id) setExpandedId(null);
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const handleReplyClick = (message: Message) => {
    if (!message.email) {
      alert('No email address available for this message');
      return;
    }
    setReplyModal({
      messageId: message.id,
      to: message.email,
      subject: `Re: ${message.subject || 'Your Inquiry'}`,
      htmlBody: `<html><body>\n<p>Hi ${message.name},</p>\n<p>Thank you for reaching out to us. We appreciate your interest and will get back to you shortly.</p>\n<p>Best regards,<br/>Avegatasta Solution Team</p>\n</body></html>`,
      textBody: `Hi ${message.name},\n\nThank you for reaching out to us. We appreciate your interest and will get back to you shortly.\n\nBest regards,\nAvegatasta Solution Team`,
    });
    setReplyError(null);
    setReplySuccess(null);
  };

  const handleSendReply = async () => {
    if (!replyModal) return;
    setSendingReply(true);
    setReplyError(null);
    try {
      const res = await fetch('/api/admin/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: replyModal.to,
          subject: replyModal.subject,
          htmlBody: replyModal.htmlBody,
          textBody: replyModal.textBody,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to send reply');
      }
      setReplySuccess('Reply sent successfully!');
      setTimeout(() => {
        setReplyModal(null);
        setReplySuccess(null);
      }, 2000);
    } catch (err: unknown) {
      setReplyError(err instanceof Error ? err.message : 'Failed to send reply');
    } finally {
      setSendingReply(false);
    }
  };

  // ── Derived data ──────────────────────────────────────────────────────────

  const statusCounts = (Object.keys(MESSAGE_STATUS_CONFIG) as MessageStatus[]).reduce(
    (acc, s) => {
      acc[s] = messages.filter((m) => (m.status ?? 'new') === s).length;
      return acc;
    },
    {} as Record<MessageStatus, number>
  );

  const unreadCount = messages.filter((m) => !m.is_read).length;

  const filteredAndSorted = useMemo(() => {
    let result = [...messages];

    // Search (debounced) — name, email, phone, subject, message
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          (m.email?.toLowerCase().includes(q) ?? false) ||
          m.phone.toLowerCase().includes(q) ||
          (m.subject?.toLowerCase().includes(q) ?? false) ||
          m.message.toLowerCase().includes(q)
      );
    }

    // Status filter (driven by summary bar)
    if (statusFilter) {
      result = result.filter((m) => (m.status ?? 'new') === statusFilter);
    }

    // Lead status filter
    if (leadFilter) {
      result = result.filter((m) => (m.lead_status ?? 'new_lead') === leadFilter);
    }

    // Priority filter
    if (priorityFilter) {
      result = result.filter((m) => (m.priority ?? 'medium') === priorityFilter);
    }

    // Date range filter
    if (dateRange !== 'all') {
      const now = new Date();
      let fromDate: Date | null = null;
      let toDate: Date | null = null;

      if (dateRange === 'this_week') {
        fromDate = new Date(now);
        fromDate.setDate(now.getDate() - 6);
        fromDate.setHours(0, 0, 0, 0);
      } else if (dateRange === 'this_month') {
        fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
      } else if (dateRange === 'custom') {
        fromDate = customFrom ? new Date(customFrom + 'T00:00:00') : null;
        toDate = customTo ? new Date(customTo + 'T23:59:59') : null;
      }

      if (fromDate) result = result.filter((m) => new Date(m.created_at) >= fromDate!);
      if (toDate) result = result.filter((m) => new Date(m.created_at) <= toDate!);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'priority_high': {
          const pa = PRIORITY_ORDER[a.priority ?? 'medium'];
          const pb = PRIORITY_ORDER[b.priority ?? 'medium'];
          return pb - pa;
        }
        case 'follow_up': {
          if (!a.follow_up_date && !b.follow_up_date) return 0;
          if (!a.follow_up_date) return 1;
          if (!b.follow_up_date) return -1;
          return new Date(a.follow_up_date).getTime() - new Date(b.follow_up_date).getTime();
        }
        default: // newest
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return result;
  }, [messages, debouncedSearch, statusFilter, leadFilter, priorityFilter, dateRange, customFrom, customTo, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / PAGE_SIZE));
  const paginatedMessages = filteredAndSorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const allPageSelected = paginatedMessages.length > 0 && paginatedMessages.every((m) => selectedIds.has(m.id));
  const somePageSelected = paginatedMessages.some((m) => selectedIds.has(m.id)) && !allPageSelected;

  const hasActiveFilters = Boolean(
    debouncedSearch || statusFilter || leadFilter || priorityFilter || dateRange !== 'all'
  );

  const clearAllFilters = () => {
    setSearchQuery('');
    setDebouncedSearch('');
    setStatusFilter(null);
    setLeadFilter('');
    setPriorityFilter('');
    setDateRange('all');
    setCustomFrom('');
    setCustomTo('');
    setSelectedIds(new Set());
    setCurrentPage(1);
  };

  const handleSelectOne = (id: number, e: React.SyntheticEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSelectAllPage = () => {
    if (allPageSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        paginatedMessages.forEach((m) => next.delete(m.id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        paginatedMessages.forEach((m) => next.add(m.id));
        return next;
      });
    }
  };

  const handleBulkMarkRead = async () => {
    const ids = Array.from(selectedIds);
    setMessages((prev) => prev.map((m) => (selectedIds.has(m.id) ? { ...m, is_read: 1 } : m)));
    setSelectedIds(new Set());
    await Promise.all(
      ids.map((id) =>
        fetch(`/api/contact/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_read: 1 }),
        })
      )
    );
  };

  const handleBulkStatusChange = async (status: MessageStatus) => {
    const ids = Array.from(selectedIds);
    setMessages((prev) => prev.map((m) => (selectedIds.has(m.id) ? { ...m, status } : m)));
    setSelectedIds(new Set());
    setBulkStatusOpen(false);
    await Promise.all(
      ids.map((id) =>
        fetch(`/api/contact/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        })
      )
    );
  };

  const handleBulkDelete = async () => {
    const count = selectedIds.size;
    if (!confirm(`Delete ${count} selected message${count > 1 ? 's' : ''}? This cannot be undone.`)) return;
    const ids = Array.from(selectedIds);
    setMessages((prev) => prev.filter((m) => !selectedIds.has(m.id)));
    if (expandedId !== null && selectedIds.has(expandedId)) setExpandedId(null);
    setSelectedIds(new Set());
    await Promise.all(ids.map((id) => fetch(`/api/contact?id=${id}`, { method: 'DELETE' })));
  };

  const handleExportCSV = (messagesToExport: Message[]) => {
    const headers: (keyof Message)[] = [
      'name', 'email', 'phone', 'subject', 'message',
      'status', 'lead_status', 'priority', 'notes',
      'follow_up_date', 'tags', 'assigned_to', 'created_at',
    ];
    const escape = (v: unknown) => {
      const s = String(v ?? '');
      return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const rows = messagesToExport.map((m) => headers.map((h) => escape(m[h])));
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `messages-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const activeFilterChips: { key: string; label: string; onClear: () => void }[] = [
    ...(debouncedSearch
      ? [{ key: 'search', label: `"${debouncedSearch}"`, onClear: () => { setSearchQuery(''); setDebouncedSearch(''); } }]
      : []),
    ...(statusFilter
      ? [{ key: 'status', label: `Status: ${MESSAGE_STATUS_CONFIG[statusFilter].label}`, onClear: () => setStatusFilter(null) }]
      : []),
    ...(leadFilter
      ? [{ key: 'lead', label: `Lead: ${LEAD_STATUS_CONFIG[leadFilter as LeadStatus].label}`, onClear: () => setLeadFilter('') }]
      : []),
    ...(priorityFilter
      ? [{ key: 'priority', label: `Priority: ${priorityFilter.charAt(0).toUpperCase() + priorityFilter.slice(1)}`, onClear: () => setPriorityFilter('') }]
      : []),
    ...(dateRange !== 'all'
      ? [{
          key: 'date',
          label: dateRange === 'this_week' ? 'This week' : dateRange === 'this_month' ? 'This month' : 'Custom range',
          onClear: () => { setDateRange('all'); setCustomFrom(''); setCustomTo(''); },
        }]
      : []),
  ];

  // ── Render ────────────────────────────────────────────────────────────────

  if (status === 'loading' || status === 'unauthenticated') return null;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 mb-1 tracking-tight">Admin Inbox</h1>
            <p className="text-slate-500 font-medium">Manage and respond to customer inquiries.</p>
          </div>
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 px-3 py-2 rounded-xl text-sm font-bold">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                {unreadCount} unread
              </div>
            )}
            {filteredAndSorted.length > 0 && (
              <button
                onClick={() => handleExportCSV(filteredAndSorted)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-colors"
                title="Export current view as CSV"
              >
                <Download size={15} />
                Export CSV
              </button>
            )}
            <div className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg shadow-blue-100">
              {messages.length} Messages
            </div>
          </div>
        </div>

        {/* Overdue follow-up alert banner */}
        {!loading && (() => {
          const today = new Date().toISOString().split('T')[0];
          const overdue = messages.filter(
            (m) =>
              m.follow_up_date &&
              m.follow_up_date <= today &&
              !['resolved', 'closed', 'spam'].includes(m.status ?? 'new')
          );
          if (overdue.length === 0) return null;
          return (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-2xl flex items-start gap-3"
            >
              <TriangleAlert size={18} className="text-orange-500 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-orange-800 mb-1">
                  {overdue.length} overdue follow-up{overdue.length > 1 ? 's' : ''}
                </p>
                <div className="flex flex-wrap gap-2">
                  {overdue.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => { setExpandedId(m.id); setNotesDraft((p) => ({ ...p, [m.id]: m.notes ?? '' })); setAssignedDraft((p) => ({ ...p, [m.id]: m.assigned_to ?? '' })); }}
                      className="text-xs font-semibold text-orange-700 bg-orange-100 hover:bg-orange-200 px-2.5 py-1 rounded-lg transition-colors"
                    >
                      {m.name} — {m.follow_up_date}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })()}

        {/* Status Summary Bar */}
        {!loading && messages.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <button
              onClick={() => setStatusFilter(null)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === null
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({messages.length})
            </button>
            {(Object.keys(MESSAGE_STATUS_CONFIG) as MessageStatus[]).map((s) => {
              const cfg = MESSAGE_STATUS_CONFIG[s];
              const count = statusCounts[s];
              if (count === 0) return null;
              return (
                <button
                  key={s}
                  onClick={() => setStatusFilter(statusFilter === s ? null : s)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    statusFilter === s
                      ? `${cfg.bg} ${cfg.text} ring-2 ring-current ring-offset-1`
                      : `${cfg.bg} ${cfg.text} opacity-70 hover:opacity-100`
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                  {cfg.label}: {count}
                </button>
              );
            })}
          </div>
        )}

        {/* Search & Filter Bar */}
        {!loading && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-4 space-y-3">
            {/* Search input */}
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, phone, subject, or message..."
                className="w-full h-10 pl-10 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(''); setDebouncedSearch(''); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Filter + Sort dropdowns */}
            <div className="flex flex-wrap gap-2 items-center">
              <FilterSelect
                value={leadFilter}
                onChange={setLeadFilter}
                placeholder="Lead Status"
                options={[
                  { value: 'new_lead', label: 'New Lead' },
                  { value: 'contacted', label: 'Contacted' },
                  { value: 'qualified', label: 'Qualified' },
                  { value: 'proposal_sent', label: 'Proposal Sent' },
                  { value: 'converted', label: 'Converted' },
                  { value: 'lost', label: 'Lost' },
                  { value: 'not_a_lead', label: 'Not a Lead' },
                ]}
              />

              <FilterSelect
                value={priorityFilter}
                onChange={setPriorityFilter}
                placeholder="Priority"
                options={[
                  { value: 'urgent', label: 'Urgent' },
                  { value: 'high', label: 'High' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'low', label: 'Low' },
                ]}
              />

              <FilterSelect
                value={dateRange === 'all' ? '' : dateRange}
                onChange={(v) => setDateRange((v || 'all') as DateRangeOption)}
                placeholder="Date Range"
                options={[
                  { value: 'this_week', label: 'This week' },
                  { value: 'this_month', label: 'This month' },
                  { value: 'custom', label: 'Custom range' },
                ]}
              />

              {/* Divider */}
              <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block" />

              {/* Sort */}
              <div className="relative flex items-center gap-1.5">
                <ArrowUpDown size={14} className="text-slate-400 shrink-0" />
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="h-10 pl-3 pr-8 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer appearance-none"
                  >
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                    <option value="priority_high">Priority: High to Low</option>
                    <option value="follow_up">Follow-up: Upcoming</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Custom date range inputs */}
            <AnimatePresence>
              {dateRange === 'custom' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-wrap gap-3 pt-1">
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-semibold text-slate-500 whitespace-nowrap">From</label>
                      <input
                        type="date"
                        value={customFrom}
                        onChange={(e) => setCustomFrom(e.target.value)}
                        className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-semibold text-slate-500 whitespace-nowrap">To</label>
                      <input
                        type="date"
                        value={customTo}
                        onChange={(e) => setCustomTo(e.target.value)}
                        className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Active filter chips */}
        <AnimatePresence>
          {hasActiveFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Filters:</span>
                {activeFilterChips.map((chip) => (
                  <span
                    key={chip.key}
                    className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold rounded-full"
                  >
                    {chip.label}
                    <button
                      onClick={chip.onClear}
                      className="text-blue-400 hover:text-blue-700 transition-colors rounded-full"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
                <button
                  onClick={clearAllFilters}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors px-2 py-1.5 rounded-lg hover:bg-slate-100"
                >
                  Clear all
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="flex justify-center py-16 sm:py-20 lg:py-24">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredAndSorted.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] p-24 text-center border border-slate-100 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="text-slate-300 w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              {hasActiveFilters ? 'No messages matching your filters' : 'No messages yet'}
            </h3>
            <p className="text-slate-500">
              {hasActiveFilters
                ? 'Try adjusting or clearing your filters to see more results.'
                : 'When customers contact you, their messages will appear here.'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="mt-6 px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-700 transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <>
          {/* Select-all row + bulk toolbar */}
          <div className="flex items-center justify-between mb-2 px-1">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={allPageSelected}
                ref={(el) => { if (el) el.indeterminate = somePageSelected; }}
                onChange={handleSelectAllPage}
                className="w-4 h-4 rounded border-slate-300 accent-blue-600 cursor-pointer"
              />
              <span className="text-xs font-bold text-slate-500">
                {selectedIds.size > 0
                  ? `${selectedIds.size} selected`
                  : `Select all on page`}
              </span>
            </label>

            <AnimatePresence>
              {selectedIds.size > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  className="flex items-center gap-2"
                >
                  <button
                    onClick={handleBulkMarkRead}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
                  >
                    Mark Read
                  </button>

                  {/* Bulk status change */}
                  <div className="relative" ref={bulkStatusRef}>
                    <button
                      onClick={() => setBulkStatusOpen((o) => !o)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
                    >
                      Set Status
                      <ChevronDown size={11} />
                    </button>
                    <AnimatePresence>
                      {bulkStatusOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -4, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -4, scale: 0.97 }}
                          transition={{ duration: 0.1 }}
                          className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-30 min-w-[140px] py-1 overflow-hidden"
                        >
                          {(Object.keys(MESSAGE_STATUS_CONFIG) as MessageStatus[]).map((s) => {
                            const c = MESSAGE_STATUS_CONFIG[s];
                            return (
                              <button
                                key={s}
                                onClick={() => handleBulkStatusChange(s)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-left hover:bg-slate-50 transition-colors"
                              >
                                <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                                <span className={c.text}>{c.label}</span>
                              </button>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <button
                    onClick={() => handleExportCSV(messages.filter((m) => selectedIds.has(m.id)))}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
                  >
                    <Download size={12} />
                    Export
                  </button>

                  <button
                    onClick={handleBulkDelete}
                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-lg transition-colors"
                  >
                    Delete
                  </button>

                  <button
                    onClick={() => setSelectedIds(new Set())}
                    className="p-1.5 hover:bg-slate-100 text-slate-400 rounded-lg transition-colors"
                    title="Clear selection"
                  >
                    <X size={14} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="grid gap-4">
            {paginatedMessages.map((msg) => {
              const isUnread = !msg.is_read;
              const isExpanded = expandedId === msg.id;
              const isPending = patching.has(msg.id);
              const msgStatus = (msg.status ?? 'new') as MessageStatus;
              const leadStatus = (msg.lead_status ?? 'new_lead') as LeadStatus;

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-white rounded-[2rem] border transition-all cursor-pointer ${
                    isUnread
                      ? 'border-blue-200 shadow-md shadow-blue-50'
                      : 'border-slate-100 shadow-sm hover:shadow-lg'
                  } ${isPending ? 'opacity-80' : ''}`}
                  onClick={() => handleCardClick(msg)}
                >
                  <div className="p-6 md:p-8">
                    {/* Top row: identity + meta */}
                    <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                      <div className="flex items-start gap-4">
                        {/* Checkbox */}
                        <div className="pt-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedIds.has(msg.id)}
                            onChange={(e) => handleSelectOne(msg.id, e)}
                            className="w-4 h-4 rounded border-slate-300 accent-blue-600 cursor-pointer"
                          />
                        </div>
                        {/* Unread dot */}
                        <div className="relative">
                          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                            <User size={24} />
                          </div>
                          {isUnread && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white" />
                          )}
                        </div>
                        <div>
                          <h3 className={`text-lg text-slate-900 ${isUnread ? 'font-black' : 'font-bold'}`}>
                            {msg.name}
                          </h3>
                          <div className="flex flex-wrap gap-3 mt-1">
                            <div className="flex items-center gap-1.5 text-sm text-slate-500 font-medium">
                              <Phone size={13} />
                              {msg.phone}
                            </div>
                            {msg.email && (
                              <div className="flex items-center gap-1.5 text-sm text-slate-500 font-medium">
                                <Mail size={13} />
                                {msg.email}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-start md:items-end gap-2">
                        <div className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-widest">
                          {msg.subject || 'General Inquiry'}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                          <Clock size={11} />
                          {new Date(msg.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Badges row */}
                    <div className="flex flex-wrap gap-2 mb-4" onClick={(e) => e.stopPropagation()}>
                      <InlineBadge<MessageStatus>
                        value={msgStatus}
                        config={MESSAGE_STATUS_CONFIG}
                        options={Object.keys(MESSAGE_STATUS_CONFIG) as MessageStatus[]}
                        onSelect={(v) => patchMessage(msg.id, { status: v })}
                        disabled={isPending}
                      />
                      <InlineBadge<LeadStatus>
                        value={leadStatus}
                        config={LEAD_STATUS_CONFIG}
                        options={Object.keys(LEAD_STATUS_CONFIG) as LeadStatus[]}
                        onSelect={(v) => patchMessage(msg.id, { lead_status: v })}
                        disabled={isPending}
                      />
                      <InlineBadge<Priority>
                        value={msg.priority ?? 'medium'}
                        config={PRIORITY_CONFIG}
                        options={Object.keys(PRIORITY_CONFIG) as Priority[]}
                        onSelect={(v) => patchMessage(msg.id, { priority: v })}
                        disabled={isPending}
                      />
                    </div>

                    {/* Message preview / expanded body */}
                    <div
                      className={`bg-slate-50 rounded-2xl p-5 text-slate-700 leading-relaxed font-medium text-sm transition-all ${
                        !isExpanded ? 'line-clamp-2' : ''
                      }`}
                    >
                      {msg.message}
                    </div>

                    {/* Expand toggle hint */}
                    <div className="mt-2 flex items-center gap-1 text-xs text-slate-400 font-medium select-none">
                      {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      {isExpanded ? 'Click to collapse' : 'Click to expand'}
                    </div>

                    {/* Enrichment panel + actions — only visible when expanded */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Enrichment grid */}
                          <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">

                            {/* Internal Notes */}
                            <div className="col-span-1 md:col-span-2">
                              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                <StickyNote size={12} />
                                Internal Notes
                                <span className="normal-case font-normal text-slate-400 ml-1">(not sent to customer)</span>
                              </label>
                              <textarea
                                value={notesDraft[msg.id] ?? ''}
                                onChange={(e) =>
                                  setNotesDraft((prev) => ({ ...prev, [msg.id]: e.target.value }))
                                }
                                onBlur={() => handleNoteBlur(msg.id)}
                                placeholder="Add internal notes..."
                                rows={3}
                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white resize-none transition-colors"
                              />
                              {notesSavedAt[msg.id] && (
                                <p className="text-xs text-slate-400 mt-1">
                                  Saved at {notesSavedAt[msg.id].toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              )}
                            </div>

                            {/* Follow-Up Date */}
                            <div>
                              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                <Calendar size={12} />
                                Follow-Up Date
                              </label>
                              <input
                                type="date"
                                value={msg.follow_up_date ?? ''}
                                onChange={(e) =>
                                  patchMessage(msg.id, { follow_up_date: e.target.value || null })
                                }
                                className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                              />
                            </div>

                            {/* Assigned To */}
                            <div>
                              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                <UserCheck size={12} />
                                Assigned To
                              </label>
                              <input
                                type="text"
                                value={assignedDraft[msg.id] ?? ''}
                                onChange={(e) =>
                                  setAssignedDraft((prev) => ({ ...prev, [msg.id]: e.target.value }))
                                }
                                onBlur={() => handleAssignedBlur(msg.id)}
                                placeholder="Admin name or email..."
                                className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                              />
                            </div>

                            {/* Tags */}
                            <div className="col-span-1 md:col-span-2">
                              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                <Tag size={12} />
                                Tags
                              </label>
                              {/* Active chips */}
                              <div className="flex flex-wrap gap-1.5 mb-2">
                                {parseTags(msg.tags).map((tag) => (
                                  <span
                                    key={tag}
                                    className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold rounded-full"
                                  >
                                    {tag}
                                    <button
                                      onClick={() => handleTagToggle(msg.id, tag, msg.tags)}
                                      className="text-blue-400 hover:text-blue-700 transition-colors"
                                    >
                                      <X size={11} />
                                    </button>
                                  </span>
                                ))}
                              </div>
                              {/* Suggestions */}
                              <div className="flex flex-wrap gap-1.5">
                                {TAG_SUGGESTIONS.filter((s) => !parseTags(msg.tags).includes(s)).map((s) => (
                                  <button
                                    key={s}
                                    onClick={() => handleTagToggle(msg.id, s, msg.tags)}
                                    className="text-xs font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-full transition-colors"
                                  >
                                    + {s}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end gap-3">
                            <button
                              onClick={() => handleDelete(msg.id)}
                              className="px-4 py-2 text-red-600 font-bold text-sm hover:bg-red-50 rounded-lg flex items-center gap-2"
                            >
                              <Trash2 size={15} />
                              Delete
                            </button>
                            {msg.email && (
                              <button
                                onClick={() => handleReplyClick(msg)}
                                className="px-5 py-2 bg-green-600 text-white font-bold text-sm rounded-xl hover:bg-green-700 shadow-lg shadow-green-100 flex items-center gap-2"
                              >
                                <Send size={15} />
                                Reply
                              </button>
                            )}
                            <a
                              href={`tel:${msg.phone}`}
                              className="px-5 py-2 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-100"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Call Customer
                            </a>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-slate-500 font-medium">
                Showing{' '}
                <span className="font-bold text-slate-800">
                  {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredAndSorted.length)}
                </span>{' '}
                of{' '}
                <span className="font-bold text-slate-800">{filteredAndSorted.length}</span>{' '}
                messages
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-700"
                >
                  <ChevronLeft size={18} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                  .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
                    if (idx > 0 && arr[idx - 1] !== p - 1) acc.push('ellipsis');
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((item, idx) =>
                    item === 'ellipsis' ? (
                      <span key={`e-${idx}`} className="px-2 text-slate-400 text-sm">…</span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => setCurrentPage(item)}
                        className={`w-9 h-9 rounded-xl text-sm font-bold transition-colors ${
                          item === currentPage
                            ? 'bg-slate-900 text-white'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {item}
                      </button>
                    )
                  )}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-xl hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-700"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
          </>
        )}

        {/* Reply Modal */}
        <AnimatePresence>
          {replyModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setReplyModal(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sticky top-0 bg-white border-b border-slate-200 px-8 py-6 flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-slate-900">Reply to Message</h2>
                  <button
                    onClick={() => setReplyModal(null)}
                    className="p-1 hover:bg-slate-100 rounded-lg"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="p-8 space-y-6">
                  {replyError && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3"
                    >
                      <AlertCircle className="text-red-600" size={20} />
                      <span className="text-red-800">{replyError}</span>
                    </motion.div>
                  )}

                  {replySuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3"
                    >
                      <Check className="text-green-600" size={20} />
                      <span className="text-green-800">{replySuccess}</span>
                    </motion.div>
                  )}

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">To</label>
                    <input
                      type="email"
                      value={replyModal.to}
                      disabled
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Subject</label>
                    <input
                      type="text"
                      value={replyModal.subject}
                      onChange={(e) => setReplyModal({ ...replyModal, subject: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">HTML Body</label>
                    <textarea
                      value={replyModal.htmlBody}
                      onChange={(e) => setReplyModal({ ...replyModal, htmlBody: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                      rows={8}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Text Body</label>
                    <textarea
                      value={replyModal.textBody}
                      onChange={(e) => setReplyModal({ ...replyModal, textBody: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                      rows={8}
                    />
                  </div>

                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      onClick={() => setReplyModal(null)}
                      className="px-6 py-2 border border-slate-300 rounded-lg text-slate-700 font-bold hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSendReply}
                      disabled={sendingReply}
                      className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:bg-slate-400 flex items-center justify-center gap-2"
                    >
                      <Send size={18} />
                      {sendingReply ? 'Sending...' : 'Send Reply'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
