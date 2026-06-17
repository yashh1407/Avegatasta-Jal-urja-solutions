'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Phone, MessageSquare, Clock, Trash2, RefreshCw, AlertTriangle, ChevronDown, Package, UserPlus, Lock, FileText, Plus, MapPin } from 'lucide-react';
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
  gstin?: string | null;
  quote_number?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  location_accuracy?: number | null;
  logged_by_name?: string | null;
  logged_by_email?: string | null;
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
  gstin?: string | null;
  quote_number?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  location_accuracy?: number | null;
  logged_by_name?: string | null;
  logged_by_email?: string | null;
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
  quote_number: inquiry.quote_number || '',
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
  quote_number: inquiry.quote_number || '',
});

const parseAgreedPrice = (value: string | number | null | undefined) => {
  if (value === '' || value === null || value === undefined) return null;
  const price = Number(value);
  return Number.isFinite(price) && price > 0 ? price : null;
};

function EditableInquiryForm({ inquiry, onSave, onDelete, onToast, savedQuotes }: { inquiry: Inquiry, onSave: (data: Partial<Inquiry>) => void, onDelete: () => void, onToast: (msg: string, type: 'success' | 'error') => void, savedQuotes: any[] }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isConverted, setIsConverted] = useState(false);
  const [formData, setFormData] = useState(() => inquiryToFormData(inquiry));

  useEffect(() => {
    if (!isEditing) setFormData(inquiryToFormData(inquiry));
  }, [inquiry, isEditing]);

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
    quote_number: formData.quote_number || null,
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

        {inquiry.quote_number && (
          <div className="bg-orange-50/60 p-3 rounded-xl border border-orange-100 text-xs text-orange-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText size={14} className="text-orange-500 shrink-0" />
              <span>
                <strong>Quotation Sent:</strong> <span className="font-mono bg-orange-100 px-1.5 py-0.5 rounded text-orange-950 font-bold">{inquiry.quote_number}</span>
              </span>
            </div>
            <Link 
              href={`/admin/quotations?load=${inquiry.quote_number}`} 
              target="_blank"
              className="text-orange-750 hover:text-orange-905 font-black uppercase tracking-wider text-[10px] bg-white px-2.5 py-1.5 rounded-lg border border-orange-200 shadow-sm transition-all flex items-center gap-1 hover:shadow-md shrink-0"
            >
              View/Edit Quotation
            </Link>
          </div>
        )}

        {inquiry.latitude !== null && inquiry.longitude !== null && inquiry.latitude !== undefined && inquiry.longitude !== undefined && (
          <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100 text-xs text-emerald-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-emerald-500 shrink-0" />
              <span>
                <strong>Field Location:</strong> {Number(inquiry.latitude).toFixed(6)}, {Number(inquiry.longitude).toFixed(6)}
                {inquiry.location_accuracy ? ` (accuracy: ${inquiry.location_accuracy}m)` : ''}
                {inquiry.logged_by_name ? ` · Registered by ${inquiry.logged_by_name}` : ''}
              </span>
            </div>
            <a 
              href={`https://www.google.com/maps/search/?api=1&query=${inquiry.latitude},${inquiry.longitude}`} 
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-700 hover:text-emerald-950 font-black uppercase tracking-wider text-[10px] bg-white px-2.5 py-1.5 rounded-lg border border-emerald-200 shadow-sm transition-all flex items-center gap-1 hover:shadow-md shrink-0"
            >
              View on Map
            </a>
          </div>
        )}

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Pipeline Stage:</span>
            <span className={`inline-flex items-center text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${STATUS_COLORS[inquiry.status] || 'bg-slate-100 text-slate-700'}`}>
              {STATUS_LABELS[inquiry.status] || inquiry.status}
            </span>
          </div>
          <div className="flex items-center gap-4">
            {(inquiry.client_id || isConverted) && (
              <>
                <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-600">
                  <UserPlus size={10} /> Converted to Client
                </span>
                <Link href="/admin/clients" className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-blue-600 hover:underline">
                   View Profile
                </Link>
              </>
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

             <div className="flex items-center gap-2">
               <span className="text-xs font-semibold text-slate-500">Link Quote:</span>
               <select
                 name="quote_number"
                 value={formData.quote_number || ''}
                 onChange={handleChange}
                 className="text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500/20 outline-none"
               >
                 <option value="">-- No Quote --</option>
                 {savedQuotes.map((q: any) => (
                   <option key={q.id} value={q.quote_number}>
                     {q.quote_number} ({q.client_name || 'N/A'})
                   </option>
                 ))}
               </select>
             </div>

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

function EditableProductInquiryForm({ inquiry, onSave, onDelete, onToast, savedQuotes }: { inquiry: ProductInquiry, onSave: (data: Partial<ProductInquiry>) => void, onDelete: () => void, onToast: (msg: string, type: 'success' | 'error') => void, savedQuotes: any[] }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isConverted, setIsConverted] = useState(false);
  const [formData, setFormData] = useState(() => productInquiryToFormData(inquiry));

  useEffect(() => {
    if (!isEditing) setFormData(productInquiryToFormData(inquiry));
  }, [inquiry, isEditing]);

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
    quote_number: formData.quote_number || null,
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
        {inquiry.gstin && (
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 w-fit">
            <span className="text-[9px] font-black uppercase text-slate-400">GSTIN:</span>
            <span className="font-mono">{inquiry.gstin}</span>
          </div>
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

        {inquiry.quote_number && (
          <div className="bg-orange-50/60 p-3 rounded-xl border border-orange-100 text-xs text-orange-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText size={14} className="text-orange-500 shrink-0" />
              <span>
                <strong>Quotation Sent:</strong> <span className="font-mono bg-orange-100 px-1.5 py-0.5 rounded text-orange-950 font-bold">{inquiry.quote_number}</span>
              </span>
            </div>
            <Link 
              href={`/admin/quotations?load=${inquiry.quote_number}`} 
              target="_blank"
              className="text-orange-755 hover:text-orange-905 font-black uppercase tracking-wider text-[10px] bg-white px-2.5 py-1.5 rounded-lg border border-orange-200 shadow-sm transition-all flex items-center gap-1 hover:shadow-md shrink-0"
            >
              View/Edit Quotation
            </Link>
          </div>
        )}

        {inquiry.latitude !== null && inquiry.longitude !== null && inquiry.latitude !== undefined && inquiry.longitude !== undefined && (
          <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100 text-xs text-emerald-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-emerald-500 shrink-0" />
              <span>
                <strong>Field Location:</strong> {Number(inquiry.latitude).toFixed(6)}, {Number(inquiry.longitude).toFixed(6)}
                {inquiry.location_accuracy ? ` (accuracy: ${inquiry.location_accuracy}m)` : ''}
                {inquiry.logged_by_name ? ` · Registered by ${inquiry.logged_by_name}` : ''}
              </span>
            </div>
            <a 
              href={`https://www.google.com/maps/search/?api=1&query=${inquiry.latitude},${inquiry.longitude}`} 
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-700 hover:text-emerald-950 font-black uppercase tracking-wider text-[10px] bg-white px-2.5 py-1.5 rounded-lg border border-emerald-200 shadow-sm transition-all flex items-center gap-1 hover:shadow-md shrink-0"
            >
              View on Map
            </a>
          </div>
        )}

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Pipeline Stage:</span>
            <span className={`inline-flex items-center text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${STATUS_COLORS[inquiry.status] || 'bg-slate-100 text-slate-700'}`}>
              {STATUS_LABELS[inquiry.status] || inquiry.status}
            </span>
          </div>
          <div className="flex items-center gap-4">
            {(inquiry.client_id || isConverted) && (
              <>
                <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-600">
                  <UserPlus size={10} /> Converted to Client
                </span>
                <Link href="/admin/clients" className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-blue-600 hover:underline">
                   View Profile
                </Link>
              </>
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

             <div className="flex items-center gap-2">
               <span className="text-xs font-semibold text-slate-500">Link Quote:</span>
               <select
                 name="quote_number"
                 value={formData.quote_number || ''}
                 onChange={handleChange}
                 className="text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500/20 outline-none"
               >
                 <option value="">-- No Quote --</option>
                 {savedQuotes.map((q: any) => (
                   <option key={q.id} value={q.quote_number}>
                     {q.quote_number} ({q.client_name || 'N/A'})
                   </option>
                 ))}
               </select>
             </div>

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

  // Saved quotations state
  const [savedQuotes, setSavedQuotes] = useState<any[]>([]);

  const fetchSavedQuotes = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/quotations');
      const data = await res.json();
      if (data && Array.isArray(data.quotations)) {
        setSavedQuotes(data.quotations);
      }
    } catch (err) {
      console.error('Failed to fetch saved quotations:', err);
    }
  }, []);

  useEffect(() => {
    fetchSavedQuotes();
  }, [fetchSavedQuotes]);

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

  // Add Lead Modal State
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [isSavingLead, setIsSavingLead] = useState(false);
  const [productsList, setProductsList] = useState<any[]>([]);
  const [addLeadData, setAddLeadData] = useState({
    leadType: 'general' as 'general' | 'product',
    name: '',
    phone: '',
    email: '',
    subject: '',
    productName: '',
    productId: '',
    message: '',
    gstin: '',
  });

  // Fetch product catalog for auto-suggest
  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setProductsList(data);
      })
      .catch((err) => console.error('Failed to fetch products for autocomplete:', err));
  }, []);

  // Geolocation states
  const [gpsLatitude, setGpsLatitude] = useState<number | null>(null);
  const [gpsLongitude, setGpsLongitude] = useState<number | null>(null);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'acquiring' | 'success' | 'error'>('idle');
  const [gpsError, setGpsError] = useState<string | null>(null);

  const captureLocation = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setGpsStatus('error');
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }
    setGpsStatus('acquiring');
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGpsLatitude(position.coords.latitude);
        setGpsLongitude(position.coords.longitude);
        setGpsAccuracy(position.coords.accuracy);
        setGpsStatus('success');
      },
      (error) => {
        console.error('Geolocation error:', error);
        setGpsStatus('error');
        let errMsg = 'Failed to acquire location.';
        if (error.code === error.PERMISSION_DENIED) {
          errMsg = 'Permission denied. Please enable location services in your browser settings.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errMsg = 'Location position unavailable. Please try again.';
        } else if (error.code === error.TIMEOUT) {
          errMsg = 'Location request timed out. Please try again.';
        }
        setGpsError(errMsg);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  // Automatically trigger location capture when the Add Lead modal opens
  useEffect(() => {
    if (isAddLeadOpen) {
      captureLocation();
    } else {
      setGpsLatitude(null);
      setGpsLongitude(null);
      setGpsAccuracy(null);
      setGpsStatus('idle');
      setGpsError(null);
      setAddLeadData({
        leadType: 'general',
        name: '',
        phone: '',
        email: '',
        subject: '',
        productName: '',
        productId: '',
        message: '',
        gstin: '',
      });
    }
  }, [isAddLeadOpen, captureLocation]);

  const handleAddLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingLead(true);

    const payload: any = {
      name: addLeadData.name,
      phone: addLeadData.phone || undefined,
      message: addLeadData.message,
      gstin: addLeadData.gstin || undefined,
      latitude: gpsLatitude,
      longitude: gpsLongitude,
      location_accuracy: gpsAccuracy,
    };

    let url = '/api/inquiries';
    if (addLeadData.leadType === 'product') {
      url = '/api/product-inquiries';
      payload.productName = addLeadData.productName;
      const matched = productsList.find(
        (p) => p.name.toLowerCase() === addLeadData.productName.trim().toLowerCase()
      );
      payload.productId = matched ? String(matched.id) : (addLeadData.productId || undefined);
      payload.email = addLeadData.email || undefined;
    } else {
      payload.subject = addLeadData.subject || undefined;
    }

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      if (res.ok) {
        showToast('Lead successfully created!', 'success');
        setIsAddLeadOpen(false);
        fetchInquiries(true);
        fetchProductInquiries(true);
      } else {
        showToast(resData.error ? JSON.stringify(resData.error) : 'Failed to create lead', 'error');
      }
    } catch (err) {
      console.error('Failed to save lead:', err);
      showToast('An error occurred. Please try again.', 'error');
    } finally {
      setIsSavingLead(false);
    }
  };

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
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddLeadOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-sm transition-all"
            >
              <Plus size={14} />
              Add Lead
            </button>
            <button
              onClick={() => activeTab === 'general' ? fetchInquiries(false) : fetchProductInquiries(false)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:text-blue-600 hover:border-blue-200 transition-all"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
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
                            <div className="flex flex-wrap gap-2 items-center">
                              <StatusBadge status={inquiry.status} meetingDate={inquiry.meeting_date} meetingTime={inquiry.meeting_time} meetingType={inquiry.meeting_type} />
                              {inquiry.quote_number && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                                  <FileText size={10} /> {inquiry.quote_number}
                                </span>
                              )}
                              {inquiry.latitude !== null && inquiry.longitude !== null && inquiry.latitude !== undefined && inquiry.longitude !== undefined && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200" title="Geolocation coordinates available">
                                  <MapPin size={10} /> Geo
                                </span>
                              )}
                            </div>
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
                              savedQuotes={savedQuotes}
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
                            {inquiry.gstin && (
                              <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 font-mono">
                                GST: {inquiry.gstin}
                              </span>
                            )}
                            <span className="flex items-center gap-1 text-[10px] text-slate-400 ml-auto">
                              <Clock size={10} />
                              {new Date(inquiry.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-blue-700 mb-1.5 flex items-center gap-1">
                            <Package size={11} /> {inquiry.product_name}
                          </p>
                          <p className="text-sm text-slate-600 line-clamp-1 leading-relaxed">{inquiry.message}</p>
                          <div className="flex flex-wrap gap-2 items-center">
                            <StatusBadge status={inquiry.status} meetingDate={inquiry.meeting_date} meetingTime={inquiry.meeting_time} meetingType={inquiry.meeting_type} />
                            {inquiry.quote_number && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                                <FileText size={10} /> {inquiry.quote_number}
                              </span>
                            )}
                            {inquiry.latitude !== null && inquiry.longitude !== null && inquiry.latitude !== undefined && inquiry.longitude !== undefined && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200" title="Geolocation coordinates available">
                                <MapPin size={10} /> Geo
                              </span>
                            )}
                          </div>
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
                              savedQuotes={savedQuotes}
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

      {/* Add Lead Modal */}
      <AnimatePresence>
        {isAddLeadOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSavingLead && setIsAddLeadOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="relative bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-lg w-full overflow-hidden z-10 flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h2 className="text-lg font-black text-blue-950">Create New Lead</h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Field Lead Logging Console</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddLeadOpen(false)}
                  disabled={isSavingLead}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
                >
                  <Plus className="rotate-45" size={20} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleAddLeadSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 [scrollbar-width:thin]">
                {/* Lead Type */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2">Lead Type</label>
                  <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => setAddLeadData(prev => ({ ...prev, leadType: 'general' }))}
                      className={`py-2 rounded-xl text-xs font-bold transition-all ${
                        addLeadData.leadType === 'general'
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-slate-600 hover:text-slate-950'
                      }`}
                    >
                      General Lead
                    </button>
                    <button
                      type="button"
                      onClick={() => setAddLeadData(prev => ({ ...prev, leadType: 'product' }))}
                      className={`py-2 rounded-xl text-xs font-bold transition-all ${
                        addLeadData.leadType === 'product'
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-slate-600 hover:text-slate-950'
                      }`}
                    >
                      Product Lead
                    </button>
                  </div>
                </div>

                {/* Geolocation Status Card */}
                <div className={`p-4 rounded-2xl border text-xs flex flex-col gap-2 transition-colors ${
                  gpsStatus === 'acquiring' ? 'bg-blue-50/50 border-blue-100 text-blue-800' :
                  gpsStatus === 'success'   ? 'bg-emerald-50/50 border-emerald-100 text-emerald-800' :
                  gpsStatus === 'error'     ? 'bg-red-50/50 border-red-100 text-red-800' :
                                              'bg-slate-50 border-slate-100 text-slate-600'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px]">
                      <MapPin size={12} className={gpsStatus === 'acquiring' ? 'animate-bounce text-blue-500' : gpsStatus === 'success' ? 'text-emerald-500' : gpsStatus === 'error' ? 'text-red-500' : 'text-slate-400'} />
                      GPS Tracking Status
                    </span>
                    {gpsStatus === 'error' && (
                      <button
                        type="button"
                        onClick={captureLocation}
                        className="px-2 py-1 bg-white hover:bg-red-100 border border-red-200 text-red-700 text-[10px] font-black uppercase rounded-lg transition-colors"
                      >
                        Retry Capture
                      </button>
                    )}
                    {gpsStatus === 'success' && (
                      <button
                        type="button"
                        onClick={captureLocation}
                        className="px-2 py-1 bg-white hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-[10px] font-black uppercase rounded-lg transition-colors"
                      >
                        Recapture
                      </button>
                    )}
                  </div>
                  <div>
                    {gpsStatus === 'idle' && 'Waiting for trigger...'}
                    {gpsStatus === 'acquiring' && 'Requesting device coordinates from browser...'}
                    {gpsStatus === 'success' && gpsLatitude && gpsLongitude && (
                      <span>
                        <strong>Location Captured:</strong> {gpsLatitude.toFixed(6)}, {gpsLongitude.toFixed(6)}
                        {gpsAccuracy ? ` (accurate to ${gpsAccuracy.toFixed(1)} meters)` : ''}
                      </span>
                    )}
                    {gpsStatus === 'error' && (
                      <span>
                        <strong>Warning:</strong> {gpsError || 'Device location could not be captured automatically. You can still save the lead manually.'}
                      </span>
                    )}
                  </div>
                </div>


                {/* Basic Inputs */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Customer Name *</label>
                    <input
                      type="text"
                      required
                      value={addLeadData.name}
                      onChange={e => setAddLeadData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="John Doe"
                      className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all font-medium text-blue-950 placeholder:text-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Mobile Number *</label>
                    <input
                      type="text"
                      required
                      value={addLeadData.phone}
                      onChange={e => setAddLeadData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="9876543210"
                      className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all font-medium text-blue-950 placeholder:text-slate-400 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email (Optional)</label>
                    <input
                      type="email"
                      value={addLeadData.email}
                      onChange={e => setAddLeadData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="customer@domain.com"
                      className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all font-medium text-blue-950 placeholder:text-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">GSTIN (Optional)</label>
                    <input
                      type="text"
                      value={addLeadData.gstin}
                      onChange={e => setAddLeadData(prev => ({ ...prev, gstin: e.target.value.toUpperCase() }))}
                      placeholder="15-digit code"
                      maxLength={15}
                      className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all font-medium text-blue-950 placeholder:text-slate-400 font-mono"
                    />
                  </div>
                </div>

                {/* General Specific Inputs */}
                {addLeadData.leadType === 'general' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Subject (Optional)</label>
                    <input
                      type="text"
                      value={addLeadData.subject}
                      onChange={e => setAddLeadData(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="E.g., Pumping Solutions requirements"
                      className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all font-medium text-blue-950 placeholder:text-slate-400"
                    />
                  </div>
                )}

                {/* Product Specific Inputs */}
                {addLeadData.leadType === 'product' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Product Name *</label>
                    <input
                      type="text"
                      required
                      list="products-datalist"
                      value={addLeadData.productName}
                      onChange={e => setAddLeadData(prev => ({ ...prev, productName: e.target.value }))}
                      placeholder="Type or select a product..."
                      className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all font-medium text-blue-950 placeholder:text-slate-400"
                    />
                    <datalist id="products-datalist">
                      {productsList.map((prod) => (
                        <option key={prod.id} value={prod.name}>
                          {prod.brand ? `${prod.brand} • ` : ''}{prod.category}
                        </option>
                      ))}
                    </datalist>
                  </div>
                )}

                {/* Message */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Inquiry Message / Requirement *</label>
                  <textarea
                    required
                    value={addLeadData.message}
                    onChange={e => setAddLeadData(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Write brief description of what the customer is looking for..."
                    rows={3}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all font-medium text-blue-950 placeholder:text-slate-400"
                  />
                </div>

                {/* Submit buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={isSavingLead}
                    className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSavingLead && <RefreshCw size={12} className="animate-spin" />}
                    Save Lead
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddLeadOpen(false)}
                    disabled={isSavingLead}
                    className="px-4 py-3 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
        </div>
      )}
    </AnimatePresence>

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
