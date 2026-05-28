'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Phone, MessageSquare, Clock, Trash2, RefreshCw, AlertTriangle, ChevronDown, Package, UserPlus, Lock } from 'lucide-react';
import Link from 'next/link';

// ─── Types ─────────────────────────────────────────────────────────────────

type Urgency = 'critical' | 'high' | 'medium' | 'low';
type PipelineStatus =
  | 'new'
  | 'in_progress'
  | 'resolved'
  | 'enquiry_generation'
  | 'follow_up'
  | 'wants_to_meet'
  | 'meeting_done'
  | 'quotation_sent'
  | 'quotation_followup'
  | 'order_confirmed'
  | 'delivery_in_progress'
  | 'delivered'
  | 'spam'
  | 'closed';

interface Inquiry {
  id: number;
  name: string;
  phone: string | null;
  subject: string | null;
  message: string;
  ai_category: string | null;
  ai_urgency: Urgency | null;
  ai_intent: string | null;
  status: PipelineStatus;
  agreed_price: number | null;
  meeting_date: string | null;
  meeting_time: string | null;
  meeting_type: 'office' | 'custom' | null;
  meeting_location: string | null;
  client_id: number | null;
  created_at: string;
}

interface ProductInquiry {
  id: number;
  product_id: string | null;
  product_name: string;
  name: string;
  phone: string;
  email: string | null;
  message: string;
  status: PipelineStatus;
  agreed_price: number | null;
  meeting_date: string | null;
  meeting_time: string | null;
  meeting_type: 'office' | 'custom' | null;
  meeting_location: string | null;
  client_id: number | null;
  created_at: string;
}

type Tab = 'general' | 'product';

// ─── Triage badge ────────────────────────────────────────────────────────────

const URGENCY_STYLES: Record<Urgency, string> = {
  critical: 'bg-red-50 text-red-700 border border-red-200',
  high:     'bg-orange-50 text-orange-700 border border-orange-200',
  medium:   'bg-yellow-50 text-yellow-700 border border-yellow-200',
  low:      'bg-slate-50 text-slate-600 border border-slate-200',
};

function TriageBadge({ urgency, category, intent }: { urgency: Urgency | null; category: string | null; intent: string | null }) {
  if (!urgency && !category) {
    return <span className="text-xs text-slate-300 italic">Pending triage</span>;
  }
  return (
    <div className="flex flex-wrap gap-1.5 items-center">
      {urgency && (
        <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${URGENCY_STYLES[urgency]}`}>
          {urgency === 'critical' && <AlertTriangle size={10} />}
          {urgency}
        </span>
      )}
      {category && (
        <span className="inline-flex items-center text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
          {category}
        </span>
      )}
      {intent && (
        <span className="text-[10px] text-slate-500 italic">{intent}</span>
      )}
    </div>
  );
}

const STATUS_COLORS: Record<string, string> = {
  enquiry_generation: 'bg-slate-100 text-slate-700 border border-slate-200',
  follow_up: 'bg-blue-50 text-blue-700 border border-blue-200',
  wants_to_meet: 'bg-purple-50 text-purple-700 border border-purple-200',
  meeting_done: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
  quotation_sent: 'bg-orange-50 text-orange-700 border border-orange-200',
  quotation_followup: 'bg-amber-50 text-amber-700 border border-amber-200',
  order_confirmed: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  delivery_in_progress: 'bg-cyan-50 text-cyan-700 border border-cyan-200',
  delivered: 'bg-green-100 text-green-800 border border-green-300',
  spam: 'bg-red-50 text-red-700 border border-red-200',
  closed: 'bg-slate-100 text-slate-500 border border-slate-200',
  new: 'bg-blue-100 text-blue-700 border border-blue-200',
  in_progress: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  resolved: 'bg-green-100 text-green-700 border border-green-200',
};

const STATUS_LABELS: Record<string, string> = {
  enquiry_generation: 'Enquiry Generation',
  follow_up: 'Follow Up',
  wants_to_meet: 'Wants to Meet',
  meeting_done: 'Meeting Done',
  quotation_sent: 'Quotation Sent',
  quotation_followup: 'Quotation Follow-up',
  order_confirmed: 'Order Confirmed',
  delivery_in_progress: 'Delivery in Progress',
  delivered: 'Delivered',
  spam: 'Spam',
  closed: 'Closed / Lost',
};

const ENQUIRY_GROUP = ['enquiry_generation', 'follow_up', 'wants_to_meet', 'meeting_done', 'spam', 'closed', 'new', 'in_progress', 'resolved'];
const QUOTATION_GROUP = ['quotation_sent', 'quotation_followup', 'order_confirmed'];
const DELIVERY_GROUP = ['delivery_in_progress', 'delivered'];
const INQUIRY_POLL_INTERVAL_MS = 120_000;

function PipelineDropdowns({ status, onChange, size = 'sm' }: { status: string, onChange: (newStatus: string) => void, size?: 'xs' | 'sm' }) {
  const isQuotation = QUOTATION_GROUP.includes(status);
  const isDelivery = DELIVERY_GROUP.includes(status);

  const d1Value = isQuotation || isDelivery ? 'meeting_done' : status;
  const showD2 = d1Value === 'meeting_done';
  const d2Value = isDelivery ? 'order_confirmed' : (isQuotation ? status : '');
  const showD3 = d2Value === 'order_confirmed';
  const d3Value = isDelivery ? status : '';

  const baseClass = size === 'xs' 
    ? "text-xs rounded-lg px-2 py-1.5 focus:ring-2 min-w-[120px]" 
    : "text-sm rounded-lg px-3 py-2 focus:ring-2 min-w-[140px] font-medium";

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <select 
        value={d1Value} 
        onChange={(e) => onChange(e.target.value)}
        className={`${baseClass} bg-slate-50 border border-slate-200 focus:ring-blue-500/20 text-blue-900`}
      >
        {ENQUIRY_GROUP.map(val => STATUS_LABELS[val] && (
          <option key={val} value={val}>{STATUS_LABELS[val]}</option>
        ))}
      </select>

      {showD2 && (
        <select
          value={d2Value}
          onChange={(e) => onChange(e.target.value || 'meeting_done')}
          className={`${baseClass} bg-purple-50 border border-purple-200 focus:ring-purple-500/20 text-purple-900`}
        >
          <option value="">-- Quotation Stage --</option>
          {QUOTATION_GROUP.map(val => (
            <option key={val} value={val}>{STATUS_LABELS[val]}</option>
          ))}
        </select>
      )}

      {showD3 && (
        <select
          value={d3Value}
          onChange={(e) => onChange(e.target.value || 'order_confirmed')}
          className={`${baseClass} bg-emerald-50 border border-emerald-200 focus:ring-emerald-500/20 text-emerald-900`}
        >
          <option value="">-- Delivery Stage --</option>
          {DELIVERY_GROUP.map(val => (
            <option key={val} value={val}>{STATUS_LABELS[val]}</option>
          ))}
        </select>
      )}
    </div>
  );
}

function StatusBadge({ status, meetingDate, meetingTime, meetingType }: { status: string; meetingDate?: string | null; meetingTime?: string | null; meetingType?: string | null }) {
  if (!status) status = 'new';
  return (
    <div className="flex gap-2 items-center mt-1.5 flex-wrap">
      <span className={`inline-flex items-center text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${STATUS_COLORS[status]}`}>
        {STATUS_LABELS[status]}
      </span>
      {status === 'wants_to_meet' && (meetingDate || meetingTime) && (
        <span className="text-[10px] text-purple-600 font-semibold bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100 flex items-center gap-1">
          <Clock size={10} /> 
          {meetingDate ? new Date(meetingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
          {meetingTime ? ` at ${meetingTime}` : ''}
          {meetingType ? ` (${meetingType === 'office' ? 'Office' : 'Custom'})` : ''}
        </span>
      )}
    </div>
  );
}

const inquiryToFormData = (inquiry: Inquiry) => ({
  name: inquiry.name || '',
  phone: inquiry.phone || '',
  subject: inquiry.subject || '',
  message: inquiry.message || '',
  status: inquiry.status,
  agreed_price: inquiry.agreed_price || '',
  meeting_date: inquiry.meeting_date || '',
  meeting_time: inquiry.meeting_time || '',
  meeting_type: inquiry.meeting_type || 'office',
  meeting_location: inquiry.meeting_location || '',
});

const productInquiryToFormData = (inquiry: ProductInquiry) => ({
  name: inquiry.name || '',
  phone: inquiry.phone || '',
  email: inquiry.email || '',
  message: inquiry.message || '',
  status: inquiry.status,
  agreed_price: inquiry.agreed_price || '',
  meeting_date: inquiry.meeting_date || '',
  meeting_time: inquiry.meeting_time || '',
  meeting_type: inquiry.meeting_type || 'office',
  meeting_location: inquiry.meeting_location || '',
});

const parseAgreedPrice = (value: string | number | null | undefined) => {
  if (value === '' || value === null || value === undefined) return null;
  const price = Number(value);
  return Number.isFinite(price) && price > 0 ? price : null;
};

function EditableInquiryForm({ inquiry, onSave, onDelete, onToast }: { inquiry: Inquiry, onSave: (data: Partial<Inquiry>) => void, onDelete: () => void, onToast: (msg: string, type: 'success' | 'error') => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isConverted, setIsConverted] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [formData, setFormData] = useState(() => inquiryToFormData(inquiry));

  useEffect(() => {
    if (!isEditing) setFormData(inquiryToFormData(inquiry));
  }, [inquiry, isEditing]);

  const handleConvertToClient = async () => {
    setIsConverting(true);
    try {
      const res = await fetch('/api/admin/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: inquiry.name,
          phone: inquiry.phone || '',
          email: '', // general inquiry doesn't have email in this DB schema
          notes: `Converted from General Inquiry.\nSubject: ${inquiry.subject || 'N/A'}\nMessage: ${inquiry.message}`,
          source_inquiry_id: inquiry.id,
          source_inquiry_type: 'general'
        })
      });
      if (res.ok) {
        setIsConverted(true);
        onToast('Client successfully created!', 'success');
      } else {
        const err = await res.json();
        onToast('Failed to create client. ' + (err.error?.phone?.[0] || 'Check the details.'), 'error');
      }
    } catch (e) {
      onToast('An error occurred.', 'error');
    } finally {
      setIsConverting(false);
      setShowConfirm(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleQuickStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as PipelineStatus;
    handlePipelineStatusSave(newStatus);
  };

  const handlePipelineStatusSave = (status: PipelineStatus) => {
    const updates: Partial<Inquiry> = { status };
    const currentPrice = parseAgreedPrice(formData.agreed_price) ?? parseAgreedPrice(inquiry.agreed_price);
    if (status === 'delivered' && currentPrice === null) {
      const price = window.prompt('Enter agreed price before marking this inquiry as delivered:');
      if (!price) return;
      const agreedPrice = parseAgreedPrice(price);
      if (agreedPrice === null) {
        alert('Enter a valid agreed price.');
        return;
      }
      updates.agreed_price = agreedPrice;
      setFormData(prev => ({ ...prev, status, agreed_price: agreedPrice }));
    } else {
      setFormData(prev => ({ ...prev, status }));
    }
    onSave(updates);
  };

  const buildUpdatePayload = (): Partial<Inquiry> => ({
    name: formData.name,
    phone: formData.phone || null,
    subject: formData.subject || null,
    message: formData.message,
    status: formData.status,
    agreed_price: parseAgreedPrice(formData.agreed_price),
    meeting_date: formData.meeting_date || null,
    meeting_time: formData.meeting_time || null,
    meeting_type: formData.meeting_type,
    meeting_location: formData.meeting_location || null,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.status === 'delivered' && parseAgreedPrice(formData.agreed_price) === null) {
      onToast('Enter agreed price before marking this inquiry as delivered.', 'error');
      return;
    }
    onSave(buildUpdatePayload());
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <div className="px-5 pb-5 pt-0 border-t border-slate-50 bg-slate-50/40 space-y-4">
        <p className="text-sm text-slate-700 leading-relaxed pt-4 whitespace-pre-wrap">{inquiry.message}</p>
        
        {inquiry.status === 'wants_to_meet' && (inquiry.meeting_date || inquiry.meeting_time) && (
          <div className="bg-purple-50 p-3 rounded-xl border border-purple-100 text-xs text-purple-800">
            <strong>Meeting Scheduled:</strong> {inquiry.meeting_date ? new Date(inquiry.meeting_date).toLocaleDateString('en-IN') : ''} {inquiry.meeting_time ? `at ${inquiry.meeting_time}` : ''}
            <br />
            <strong>Location:</strong> {inquiry.meeting_type === 'office' ? 'In Office' : inquiry.meeting_location || 'Custom Location'}
          </div>
        )}

        {['order_confirmed', 'delivery_in_progress', 'delivered'].includes(inquiry.status) && inquiry.agreed_price && (
          <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 text-xs text-emerald-800">
            <strong>Order Confirmed - Agreed Price:</strong> ₹{inquiry.agreed_price}
          </div>
        )}

        {inquiry.status === 'delivered' && parseAgreedPrice(inquiry.agreed_price) === null && (
          <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 text-xs text-amber-800">
            <strong>Sales Dashboard:</strong> Add agreed price to count this delivered inquiry in sales.
          </div>
        )}

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
          <div className="flex items-center gap-3">
            <PipelineDropdowns 
              status={formData.status} 
              onChange={(newStatus) => handlePipelineStatusSave(newStatus as PipelineStatus)} 
              size="xs" 
            />
          </div>
          <div className="flex items-center gap-4">
            {inquiry.client_id || isConverted ? (
              <>
                <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-600">
                  <UserPlus size={10} /> Converted to Client
                </span>
                <Link href="/admin/clients" className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-blue-600 hover:underline">
                   View Profile
                </Link>
                <button
                  onClick={onDelete}
                  className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-red-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={10} /> Delete
                </button>
              </>
            ) : (
              <>
                {!isConverted ? (
                  <div className="relative flex items-center">
                    <button
                      onClick={() => setShowConfirm(true)}
                      className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-emerald-600 transition-colors"
                      title="Add to Clients Database"
                    >
                      <UserPlus size={10} /> Convert to Client
                    </button>
                    <AnimatePresence>
                      {showConfirm && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 min-w-[160px] z-10 flex flex-col items-center gap-3"
                        >
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Are you sure?</span>
                          <div className="flex items-center gap-2 w-full">
                            <button onClick={handleConvertToClient} disabled={isConverting} className="flex-1 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-1">
                              {isConverting && <RefreshCw size={10} className="animate-spin" />} Yes
                            </button>
                            <button onClick={() => setShowConfirm(false)} disabled={isConverting} className="flex-1 py-2 bg-slate-50 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-colors disabled:opacity-50">No</button>
                          </div>
                          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-8 border-transparent border-t-slate-200"></div>
                          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[2px] border-8 border-transparent border-t-white"></div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-600">
                    <UserPlus size={10} /> Converted
                  </span>
                )}
                <button
                  onClick={() => {
                    setFormData(inquiryToFormData(inquiry));
                    setIsEditing(true);
                  }}
                  className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-blue-600 transition-colors"
                >
                   Edit Details
                </button>
                <button
                  onClick={onDelete}
                  className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-red-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={10} /> Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="px-5 pb-5 pt-0 border-t border-slate-50 bg-slate-50/40 space-y-4">
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Name</label>
          <input name="name" value={formData.name} onChange={handleChange} required className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500/20" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Phone</label>
          <input name="phone" value={formData.phone} onChange={handleChange} className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500/20" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">Subject</label>
        <input name="subject" value={formData.subject} onChange={handleChange} className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500/20" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">Message</label>
        <textarea name="message" value={formData.message} onChange={handleChange} required rows={4} className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500/20" />
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200">
        <label className="block text-xs font-semibold text-slate-600 mb-2">Sales Pipeline & Logistics</label>
        <div className="flex flex-wrap gap-4 items-center">
             <PipelineDropdowns 
               status={formData.status} 
               onChange={(newStatus) => setFormData(prev => ({ ...prev, status: newStatus as PipelineStatus }))} 
             />
          {['order_confirmed', 'delivery_in_progress', 'delivered'].includes(formData.status) && (
            <div>
              <input name="agreed_price" type="number" min="1" step="0.01" required={formData.status === 'delivered'} placeholder="Agreed Price" value={formData.agreed_price} onChange={handleChange} className="text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500/20 w-[140px] font-medium text-emerald-900" />
            </div>
          )}
          {formData.status === 'wants_to_meet' && (
            <>
              <div>
                <input type="date" name="meeting_date" value={formData.meeting_date} onChange={handleChange} className="text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <div>
                <input type="time" name="meeting_time" value={formData.meeting_time} onChange={handleChange} className="text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <div>
                <select name="meeting_type" value={formData.meeting_type} onChange={handleChange} className="text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500/20">
                  <option value="office">In Office</option>
                  <option value="custom">Custom Location</option>
                </select>
              </div>
              {formData.meeting_type === 'custom' && (
                <div className="w-full mt-2">
                   <label className="block text-xs font-semibold text-slate-600 mb-1">Meeting Location</label>
                   <input name="meeting_location" value={formData.meeting_location} onChange={handleChange} placeholder="Enter full address..." className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500/20" />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200">
        <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors">
           Save Changes
        </button>
        <button type="button" onClick={() => setIsEditing(false)} className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-slate-600 transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}

function EditableProductInquiryForm({ inquiry, onSave, onDelete, onToast }: { inquiry: ProductInquiry, onSave: (data: Partial<ProductInquiry>) => void, onDelete: () => void, onToast: (msg: string, type: 'success' | 'error') => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isConverted, setIsConverted] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [formData, setFormData] = useState(() => productInquiryToFormData(inquiry));

  useEffect(() => {
    if (!isEditing) setFormData(productInquiryToFormData(inquiry));
  }, [inquiry, isEditing]);

  const handleConvertToClient = async () => {
    setIsConverting(true);
    try {
      const res = await fetch('/api/admin/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: inquiry.name,
          phone: inquiry.phone || '',
          email: inquiry.email || '',
          product_id: inquiry.product_id,
          product_name: inquiry.product_name,
          notes: `Converted from Product Inquiry for ${inquiry.product_name}.\nMessage: ${inquiry.message}`,
          source_inquiry_id: inquiry.id,
          source_inquiry_type: 'product'
        })
      });
      if (res.ok) {
        setIsConverted(true);
        onToast('Client successfully created!', 'success');
      } else {
        const err = await res.json();
        onToast('Failed to create client. ' + (err.error?.phone?.[0] || 'Check the details.'), 'error');
      }
    } catch (e) {
      onToast('An error occurred.', 'error');
    } finally {
      setIsConverting(false);
      setShowConfirm(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleQuickStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as PipelineStatus;
    handlePipelineStatusSave(newStatus);
  };

  const handlePipelineStatusSave = (status: PipelineStatus) => {
    const updates: Partial<ProductInquiry> = { status };
    const currentPrice = parseAgreedPrice(formData.agreed_price) ?? parseAgreedPrice(inquiry.agreed_price);
    if (status === 'delivered' && currentPrice === null) {
      const price = window.prompt('Enter agreed price before marking this product inquiry as delivered:');
      if (!price) return;
      const agreedPrice = parseAgreedPrice(price);
      if (agreedPrice === null) {
        alert('Enter a valid agreed price.');
        return;
      }
      updates.agreed_price = agreedPrice;
      setFormData(prev => ({ ...prev, status, agreed_price: agreedPrice }));
    } else {
      setFormData(prev => ({ ...prev, status }));
    }
    onSave(updates);
  };

  const buildUpdatePayload = (): Partial<ProductInquiry> => ({
    name: formData.name,
    phone: formData.phone,
    email: formData.email || null,
    message: formData.message,
    status: formData.status,
    agreed_price: parseAgreedPrice(formData.agreed_price),
    meeting_date: formData.meeting_date || null,
    meeting_time: formData.meeting_time || null,
    meeting_type: formData.meeting_type,
    meeting_location: formData.meeting_location || null,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.status === 'delivered' && parseAgreedPrice(formData.agreed_price) === null) {
      onToast('Enter agreed price before marking this product inquiry as delivered.', 'error');
      return;
    }
    onSave(buildUpdatePayload());
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <div className="px-5 pb-5 pt-0 border-t border-slate-50 bg-slate-50/40 space-y-3">
        <p className="text-sm text-slate-700 leading-relaxed pt-4 whitespace-pre-wrap">{inquiry.message}</p>
        {inquiry.email && (
          <p className="text-xs text-slate-500">
            Email: <a href={`mailto:${inquiry.email}`} className="text-blue-600 hover:underline">{inquiry.email}</a>
          </p>
        )}

        {inquiry.status === 'wants_to_meet' && (inquiry.meeting_date || inquiry.meeting_time) && (
          <div className="bg-purple-50 p-3 rounded-xl border border-purple-100 text-xs text-purple-800">
            <strong>Meeting Scheduled:</strong> {inquiry.meeting_date ? new Date(inquiry.meeting_date).toLocaleDateString('en-IN') : ''} {inquiry.meeting_time ? `at ${inquiry.meeting_time}` : ''}
            <br />
            <strong>Location:</strong> {inquiry.meeting_type === 'office' ? 'In Office' : inquiry.meeting_location || 'Custom Location'}
          </div>
        )}

        {['order_confirmed', 'delivery_in_progress', 'delivered'].includes(inquiry.status) && inquiry.agreed_price && (
          <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 text-xs text-emerald-800">
            <strong>Order Confirmed - Agreed Price:</strong> ₹{inquiry.agreed_price}
          </div>
        )}

        {inquiry.status === 'delivered' && parseAgreedPrice(inquiry.agreed_price) === null && (
          <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 text-xs text-amber-800">
            <strong>Sales Dashboard:</strong> Add agreed price to count this delivered product inquiry in sales.
          </div>
        )}

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
          <div className="flex items-center gap-3">
            <PipelineDropdowns 
              status={formData.status} 
              onChange={(newStatus) => handlePipelineStatusSave(newStatus as PipelineStatus)} 
              size="xs" 
            />
          </div>
          <div className="flex items-center gap-4">
            {inquiry.client_id || isConverted ? (
              <>
                <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-600">
                  <UserPlus size={10} /> Converted to Client
                </span>
                <Link href="/admin/clients" className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-blue-600 hover:underline">
                   View Profile
                </Link>
                <button
                  onClick={onDelete}
                  className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-red-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={10} /> Delete
                </button>
              </>
            ) : (
              <>
                {!isConverted ? (
                  <div className="relative flex items-center">
                    <button
                      onClick={() => setShowConfirm(true)}
                      className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-emerald-600 transition-colors"
                      title="Add to Clients Database"
                    >
                      <UserPlus size={10} /> Convert to Client
                    </button>
                    <AnimatePresence>
                      {showConfirm && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 min-w-[160px] z-10 flex flex-col items-center gap-3"
                        >
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Are you sure?</span>
                          <div className="flex items-center gap-2 w-full">
                            <button onClick={handleConvertToClient} disabled={isConverting} className="flex-1 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-1">
                              {isConverting && <RefreshCw size={10} className="animate-spin" />} Yes
                            </button>
                            <button onClick={() => setShowConfirm(false)} disabled={isConverting} className="flex-1 py-2 bg-slate-50 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-colors disabled:opacity-50">No</button>
                          </div>
                          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-8 border-transparent border-t-slate-200"></div>
                          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[2px] border-8 border-transparent border-t-white"></div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-600">
                    <UserPlus size={10} /> Converted
                  </span>
                )}
                <button
                  onClick={() => {
                    setFormData(productInquiryToFormData(inquiry));
                    setIsEditing(true);
                  }}
                  className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-blue-600 transition-colors"
                >
                   Edit Details
                </button>
                <button
                  onClick={onDelete}
                  className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-red-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={10} /> Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="px-5 pb-5 pt-0 border-t border-slate-50 bg-slate-50/40 space-y-4">
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Name</label>
          <input name="name" value={formData.name} onChange={handleChange} required className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500/20" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Phone</label>
          <input name="phone" value={formData.phone} onChange={handleChange} required className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500/20" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
        <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500/20" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">Message</label>
        <textarea name="message" value={formData.message} onChange={handleChange} required rows={4} className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500/20" />
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200">
        <label className="block text-xs font-semibold text-slate-600 mb-2">Sales Pipeline & Logistics</label>
        <div className="flex flex-wrap gap-4 items-center">
             <PipelineDropdowns 
               status={formData.status} 
               onChange={(newStatus) => setFormData(prev => ({ ...prev, status: newStatus as PipelineStatus }))} 
             />
          {['order_confirmed', 'delivery_in_progress', 'delivered'].includes(formData.status) && (
            <div>
              <input name="agreed_price" type="number" min="1" step="0.01" required={formData.status === 'delivered'} placeholder="Agreed Price" value={formData.agreed_price} onChange={handleChange} className="text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500/20 w-[140px] font-medium text-emerald-900" />
            </div>
          )}
          {formData.status === 'wants_to_meet' && (
            <>
              <div>
                <input type="date" name="meeting_date" value={formData.meeting_date} onChange={handleChange} className="text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <div>
                <input type="time" name="meeting_time" value={formData.meeting_time} onChange={handleChange} className="text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <div>
                <select name="meeting_type" value={formData.meeting_type} onChange={handleChange} className="text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500/20">
                  <option value="office">In Office</option>
                  <option value="custom">Custom Location</option>
                </select>
              </div>
              {formData.meeting_type === 'custom' && (
                <div className="w-full mt-2">
                   <label className="block text-xs font-semibold text-slate-600 mb-1">Meeting Location</label>
                   <input name="meeting_location" value={formData.meeting_location} onChange={handleChange} placeholder="Enter full address..." className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500/20" />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200">
        <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors">
           Save Changes
        </button>
        <button type="button" onClick={() => setIsEditing(false)} className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-slate-600 transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function AdminInquiriesPage() {
  const [activeTab, setActiveTab] = useState<Tab>('general');

  // General inquiries state
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loadingGeneral, setLoadingGeneral] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState<Urgency | 'all'>('all');
  const [expanded, setExpanded] = useState<number | null>(null);

  // Product inquiries state
  const [productInquiries, setProductInquiries] = useState<ProductInquiry[]>([]);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [expandedProduct, setExpandedProduct] = useState<number | null>(null);

  // Toast state
  const [toast, setToast] = useState<{ msg: string, type: 'success' | 'error' } | null>(null);
  
  const showToast = useCallback((msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const generalTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const productTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchInquiries = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoadingGeneral(true);
    try {
      const res = await fetch('/api/inquiries');
      const data = await res.json();
      if (Array.isArray(data)) {
        setInquiries(data as Inquiry[]);
      }
    } catch (err) {
      console.error('Failed to fetch inquiries:', err);
    } finally {
      if (!isBackground) setLoadingGeneral(false);
    }
  }, []);

  const fetchProductInquiries = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoadingProduct(true);
    try {
      const res = await fetch('/api/product-inquiries');
      const data = await res.json();
      if (Array.isArray(data)) {
        setProductInquiries(data as ProductInquiry[]);
      }
    } catch (err) {
      console.error('Failed to fetch product inquiries:', err);
    } finally {
      if (!isBackground) setLoadingProduct(false);
    }
  }, []);

  // Initial fetch + polling for general inquiries
  useEffect(() => {
    fetchInquiries(false);
    generalTimerRef.current = setInterval(() => fetchInquiries(true), INQUIRY_POLL_INTERVAL_MS);
    return () => {
      if (generalTimerRef.current) clearInterval(generalTimerRef.current);
    };
  }, [fetchInquiries]);

  // Initial fetch + polling for product inquiries
  useEffect(() => {
    fetchProductInquiries(false);
    productTimerRef.current = setInterval(() => fetchProductInquiries(true), INQUIRY_POLL_INTERVAL_MS);
    return () => {
      if (productTimerRef.current) clearInterval(productTimerRef.current);
    };
  }, [fetchProductInquiries]);

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this inquiry?')) return;
    try {
      await fetch(`/api/inquiries?id=${id}`, { method: 'DELETE' });
      setInquiries((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Delete this product inquiry?')) return;
    try {
      await fetch(`/api/product-inquiries?id=${id}`, { method: 'DELETE' });
      setProductInquiries((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleStatusChange = async (id: number, updates: Partial<Inquiry>) => {
    try {
      const payload = { id, ...updates };
      const res = await fetch(`/api/inquiries`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setInquiries(prev => prev.map(i => i.id === id ? { ...i, ...updates } as Inquiry : i));
        setExpanded(null); // Optional: close on save
      } else {
        alert('Failed to save changes');
      }
    } catch (err) {
      console.error('Update status failed:', err);
    }
  };

  const handleProductStatusChange = async (id: number, updates: Partial<ProductInquiry>) => {
    try {
      const payload = { id, ...updates };
      const res = await fetch(`/api/product-inquiries`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setProductInquiries(prev => prev.map(i => i.id === id ? { ...i, ...updates } as ProductInquiry : i));
        setExpandedProduct(null); // Optional: close on save
      } else {
        alert('Failed to save changes');
      }
    } catch (err) {
      console.error('Update product status failed:', err);
    }
  };

  const filtered = inquiries.filter((i) => {
    const matchSearch =
      !searchQuery ||
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (i.subject ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (i.ai_intent ?? '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchUrgency = urgencyFilter === 'all' || i.ai_urgency === urgencyFilter;
    return matchSearch && matchUrgency;
  });

  // Sort: critical first, then high, medium, low, null
  const urgencyOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  const sorted = [...filtered].sort((a, b) => {
    const ao = a.ai_urgency ? (urgencyOrder[a.ai_urgency] ?? 4) : 4;
    const bo = b.ai_urgency ? (urgencyOrder[b.ai_urgency] ?? 4) : 4;
    return ao - bo;
  });

  const loading = activeTab === 'general' ? loadingGeneral : loadingProduct;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-6 lg:px-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-blue-950">Inquiries</h1>
            <p className="text-sm text-slate-500 font-medium mt-0.5">
              {activeTab === 'general'
                ? `${inquiries.length} general · AI-triaged by category & urgency`
                : `${productInquiries.length} product inquiries`}
            </p>
          </div>
          <button
            onClick={() => activeTab === 'general' ? fetchInquiries(false) : fetchProductInquiries(false)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:text-blue-600 hover:border-blue-200 transition-all"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white border border-slate-200 rounded-2xl p-1 w-fit">
          <button
            onClick={() => setActiveTab('general')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'general'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-blue-600'
            }`}
          >
            <MessageSquare size={14} />
            General
            {inquiries.length > 0 && (
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${activeTab === 'general' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {inquiries.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('product')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'product'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-blue-600'
            }`}
          >
            <Package size={14} />
            Product Inquiries
            {productInquiries.length > 0 && (
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${activeTab === 'product' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {productInquiries.length}
              </span>
            )}
          </button>
        </div>

        {/* General Inquiries Tab */}
        {activeTab === 'general' && (
          <>
            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-6">
              <input
                type="text"
                placeholder="Search inquiries…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all w-64"
              />
              <div className="flex gap-1.5">
                {(['all', 'critical', 'high', 'medium', 'low'] as const).map((u) => (
                  <button
                    key={u}
                    onClick={() => setUrgencyFilter(u)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                      urgencyFilter === u
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-200 hover:text-blue-600'
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            {loadingGeneral ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="skeleton h-20 rounded-2xl" />
                ))}
              </div>
            ) : sorted.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <MessageSquare size={40} className="mx-auto mb-3 opacity-30" />
                <p className="font-medium">No inquiries found</p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {sorted.map((inquiry) => (
                    <motion.div
                      key={inquiry.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
                    >
                      {/* Row */}
                      <div
                        className="flex items-start gap-4 p-5 cursor-pointer hover:bg-slate-50/50 transition-colors"
                        onClick={() => setExpanded(expanded === inquiry.id ? null : inquiry.id)}
                      >
                        {/* Urgency dot */}
                        <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                          inquiry.ai_urgency === 'critical' ? 'bg-red-500' :
                          inquiry.ai_urgency === 'high'     ? 'bg-orange-400' :
                          inquiry.ai_urgency === 'medium'   ? 'bg-yellow-400' :
                          inquiry.ai_urgency === 'low'      ? 'bg-slate-300' :
                                                              'bg-slate-200'
                        }`} />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                            <span className="font-black text-sm text-blue-950">{inquiry.name}</span>
                            {inquiry.phone && (
                              <a href={`tel:${inquiry.phone}`} className="flex items-center gap-1 text-xs text-slate-500 hover:text-blue-600 font-medium transition-colors">
                                <Phone size={11} /> {inquiry.phone}
                              </a>
                            )}
                            <span className="flex items-center gap-1 text-[10px] text-slate-400 ml-auto">
                              <Clock size={10} />
                              {new Date(inquiry.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                          {inquiry.subject && (
                            <p className="text-xs font-bold text-blue-700 mb-1.5">{inquiry.subject}</p>
                          )}
                          <p className="text-sm text-slate-600 line-clamp-1 leading-relaxed">{inquiry.message}</p>
                          <div className="mt-2 flex flex-col gap-1">
                            <TriageBadge urgency={inquiry.ai_urgency} category={inquiry.ai_category} intent={inquiry.ai_intent} />
                            <StatusBadge status={inquiry.status} meetingDate={inquiry.meeting_date} meetingTime={inquiry.meeting_time} meetingType={inquiry.meeting_type} />
                          </div>
                        </div>

                        <ChevronDown
                          size={16}
                          className={`text-slate-400 shrink-0 transition-transform mt-1 ${expanded === inquiry.id ? 'rotate-180' : ''}`}
                        />
                      </div>

                      {/* Expanded detail */}
                      <AnimatePresence>
                        {expanded === inquiry.id && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            className="overflow-hidden"
                          >
                            <EditableInquiryForm 
                              inquiry={inquiry} 
                              onSave={(data) => handleStatusChange(inquiry.id, data)} 
                              onDelete={() => handleDelete(inquiry.id)}
                              onToast={showToast}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </>
        )}

        {/* Product Inquiries Tab */}
        {activeTab === 'product' && (
          <>
            {loadingProduct ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="skeleton h-20 rounded-2xl" />
                ))}
              </div>
            ) : productInquiries.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <Package size={40} className="mx-auto mb-3 opacity-30" />
                <p className="font-medium">No product inquiries yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {productInquiries.map((inquiry) => (
                    <motion.div
                      key={inquiry.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
                    >
                      <div
                        className="flex items-start gap-4 p-5 cursor-pointer hover:bg-slate-50/50 transition-colors"
                        onClick={() => setExpandedProduct(expandedProduct === inquiry.id ? null : inquiry.id)}
                      >
                        <div className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 bg-blue-400" />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                            <span className="font-black text-sm text-blue-950">{inquiry.name}</span>
                            <a href={`tel:${inquiry.phone}`} className="flex items-center gap-1 text-xs text-slate-500 hover:text-blue-600 font-medium transition-colors">
                              <Phone size={11} /> {inquiry.phone}
                            </a>
                            <span className="flex items-center gap-1 text-[10px] text-slate-400 ml-auto">
                              <Clock size={10} />
                              {new Date(inquiry.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-blue-700 mb-1.5 flex items-center gap-1">
                            <Package size={11} /> {inquiry.product_name}
                          </p>
                          <p className="text-sm text-slate-600 line-clamp-1 leading-relaxed">{inquiry.message}</p>
                          <StatusBadge status={inquiry.status} meetingDate={inquiry.meeting_date} meetingTime={inquiry.meeting_time} meetingType={inquiry.meeting_type} />
                        </div>

                        <ChevronDown
                          size={16}
                          className={`text-slate-400 shrink-0 transition-transform mt-1 ${expandedProduct === inquiry.id ? 'rotate-180' : ''}`}
                        />
                      </div>

                      <AnimatePresence>
                        {expandedProduct === inquiry.id && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            className="overflow-hidden"
                          >
                            <EditableProductInquiryForm 
                              inquiry={inquiry} 
                              onSave={(data) => handleProductStatusChange(inquiry.id, data)} 
                              onDelete={() => handleDeleteProduct(inquiry.id)} 
                              onToast={showToast}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </>
        )}
      </div>

      {/* Global Animated Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-2xl border flex items-center gap-3 z-50 backdrop-blur-md ${
              toast.type === 'success' 
                ? 'bg-emerald-50/90 border-emerald-200 text-emerald-800' 
                : 'bg-red-50/90 border-red-200 text-red-800'
            }`}
          >
            {toast.type === 'success' ? (
              <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                <UserPlus size={12} className="text-emerald-600" />
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle size={12} className="text-red-600" />
              </div>
            )}
            <span className="text-sm font-bold">{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
