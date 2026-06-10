'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function FAQManager() {
  const params = useParams();
  const pageId = params.id as string;
  const router = useRouter();

  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingFaq, setEditingFaq] = useState<any | null>(null);

  useEffect(() => {
    fetchFaqs();
  }, [pageId]);

  const fetchFaqs = async () => {
    try {
      const res = await fetch(`/api/admin/content/pages/${pageId}/faqs`);
      if (res.ok) setFaqs(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const saveFaq = async (faqData: any) => {
    try {
      if (faqData.id) {
        await fetch(`/api/admin/content/pages/${pageId}/faqs/${faqData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(faqData)
        });
      } else {
        await fetch(`/api/admin/content/pages/${pageId}/faqs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(faqData)
        });
      }
      setEditingFaq(null);
      fetchFaqs();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const deleteFaq = async (id: number) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;
    try {
      await fetch(`/api/admin/content/pages/${pageId}/faqs/${id}`, { method: 'DELETE' });
      fetchFaqs();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const moveFaq = async (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === faqs.length - 1)
    ) return;

    const newFaqs = [...faqs];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    [newFaqs[index], newFaqs[targetIndex]] = [newFaqs[targetIndex], newFaqs[index]];
    setFaqs(newFaqs);

    const order = newFaqs.map(f => f.id);
    try {
      await fetch(`/api/admin/content/pages/${pageId}/faqs/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const toggleFaq = async (faq: any) => {
    try {
      await fetch(`/api/admin/content/pages/${pageId}/faqs/${faq.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...faq, is_active: !faq.is_active })
      });
      fetchFaqs();
    } catch (e: any) {
      alert(e.message);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-[1200px] mx-auto min-h-screen bg-gray-50/30">
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link href="/admin/content/pages" className="text-[#1B3636] hover:underline">&larr; Back to Pages</Link>
            <span className="text-gray-300">|</span>
            <Link href={`/admin/content/pages/${pageId}`} className="text-[#1B3636] hover:underline">Page Builder</Link>
          </div>
          <h1 className="text-4xl font-semibold text-[#1B3636]">FAQ Management</h1>
        </div>
        <button 
          onClick={() => setEditingFaq({ is_active: true })}
          className="bg-[#FFB800] hover:bg-[#F0A800] text-black font-medium py-2 px-6 rounded-md shadow-sm transition-colors"
        >
          + Add FAQ
        </button>
      </div>

      <div className="space-y-4">
        {faqs.length === 0 ? (
          <div className="bg-white p-8 text-center rounded-xl border border-gray-100 text-gray-400">
            No FAQs added yet.
          </div>
        ) : (
          faqs.map((faq, idx) => (
            <div key={faq.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex gap-4 transition-all hover:shadow-md">
              <div className="flex flex-col gap-1 text-gray-300 pt-1">
                <button onClick={() => moveFaq(idx, 'up')} disabled={idx === 0} className="hover:text-gray-600 disabled:opacity-30">▲</button>
                <button onClick={() => moveFaq(idx, 'down')} disabled={idx === faqs.length - 1} className="hover:text-gray-600 disabled:opacity-30">▼</button>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-[#1B3636] font-medium text-lg mb-1">{faq.question}</h3>
                <p className="text-gray-500 text-sm line-clamp-2">{faq.answer}</p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <label className="relative inline-flex items-center cursor-pointer mr-2">
                  <input type="checkbox" checked={faq.is_active} onChange={() => toggleFaq(faq)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1B3636]"></div>
                </label>

                <button onClick={() => setEditingFaq(faq)} className="bg-[#1B3636] hover:bg-[#122626] text-white text-xs font-medium px-4 py-1.5 rounded transition-colors">Edit</button>
                <button onClick={() => deleteFaq(faq.id)} className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 text-xs font-medium px-4 py-1.5 rounded transition-colors">Del</button>
              </div>
            </div>
          ))
        )}
      </div>

      {editingFaq && (
        <FaqModal 
          faq={editingFaq} 
          onSave={saveFaq} 
          onClose={() => setEditingFaq(null)} 
        />
      )}
    </div>
  );
}

function FaqModal({ faq, onSave, onClose }: { faq: any; onSave: (data: any) => void; onClose: () => void }) {
  const [formData, setFormData] = useState({
    id: faq.id,
    question: faq.question || '',
    answer: faq.answer || '',
    is_active: faq.is_active !== false
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-[#1B3636]">{faq.id ? 'Edit FAQ' : 'Add New FAQ'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Question *</label>
            <input 
              value={formData.question} 
              onChange={e => setFormData({ ...formData, question: e.target.value })} 
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#1B3636]/20 outline-none" 
              required 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Answer *</label>
            <textarea 
              value={formData.answer} 
              onChange={e => setFormData({ ...formData, answer: e.target.value })} 
              rows={4} 
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#1B3636]/20 outline-none" 
              required 
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1B3636]"></div>
            </label>
            <span className="text-sm font-medium text-gray-700">Active (Visible on frontend)</span>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
          <button onClick={onClose} className="px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
          <button onClick={() => onSave(formData)} className="px-5 py-2 text-sm font-medium text-white bg-[#1B3636] hover:bg-[#122626] rounded-lg shadow-sm transition-colors">Save FAQ</button>
        </div>
      </div>
    </div>
  );
}
