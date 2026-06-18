'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mail,
  RefreshCw,
  LogOut,
  Plus,
  X,
  Trash2,
  Eye,
  Edit2,
  Check,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Footer from '@/components/Footer';

interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  html_body: string;
  text_body: string;
  variables?: string[] | null;
  is_active: boolean | number;
  created_at?: string;
  updated_at?: string;
}

interface FormData {
  name: string;
  subject: string;
  html_body: string;
  text_body: string;
  variables: string[];
  is_active: boolean;
}

const EMPTY_FORM: FormData = {
  name: '',
  subject: '',
  html_body: '',
  text_body: '',
  variables: [],
  is_active: true,
};

const AVAILABLE_VARIABLES = ['name', 'email', 'phone', 'subject', 'message', 'company_name', 'company_email', 'company_phone'];

export default function EmailTemplatesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  const [previewMode, setPreviewMode] = useState(false);
  const [previewVars, setPreviewVars] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  const fetchTemplates = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/email-templates');
      if (res.ok) {
        const data = await res.json();
        setTemplates(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch templates:', err);
      setError('Failed to load email templates');
      toast.error('Failed to load email templates.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchTemplates();
    }
  }, [status, fetchTemplates]);

  const handleEdit = (template: EmailTemplate) => {
    setEditingId(template.id);
    setFormData({
      name: template.name,
      subject: template.subject,
      html_body: template.html_body,
      text_body: template.text_body,
      variables: typeof template.variables === 'string' ? JSON.parse(template.variables) : template.variables || [],
      is_active: !!template.is_active,
    });
    setShowForm(true);
    setPreviewMode(false);
    setError(null);
  };

  const handleNew = () => {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setShowForm(true);
    setPreviewMode(false);
    setError(null);
  };

  const handleClose = () => {
    setShowForm(false);
    setPreviewMode(false);
  };

  const handleInputChange = (field: keyof Omit<FormData, 'variables'>, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleVariable = (variable: string) => {
    setFormData((prev) => ({
      ...prev,
      variables: prev.variables.includes(variable)
        ? prev.variables.filter((v) => v !== variable)
        : [...prev.variables, variable],
    }));
  };

  const renderContent = (content: string, vars: Record<string, string>): string => {
    let result = content;
    Object.entries(vars).forEach(([key, value]) => {
      result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
    });
    return result;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        name: formData.name,
        subject: formData.subject,
        html_body: formData.html_body,
        text_body: formData.text_body,
        variables: formData.variables,
        is_active: formData.is_active,
      };

      const url = editingId ? `/api/admin/email-templates/${editingId}` : '/api/admin/email-templates';
      const method = editingId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save template');
      }

      const successMsg = editingId ? 'Template updated successfully!' : 'Template created successfully!';
      setSuccess(successMsg);
      toast.success(successMsg);
      await fetchTemplates();
      handleClose();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      const message = err.message || 'Failed to save email template';
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const res = await fetch(`/api/admin/email-templates/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete');

      setSuccess('Template deleted successfully!');
      toast.success('Template deleted successfully!');
      await fetchTemplates();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to delete template');
      toast.error('Failed to delete template.');
    }
  };

  if (status === 'loading' || loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (status !== 'authenticated') {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">

      <main className="flex-1 container mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Mail className="text-brand-600" size={32} />
            <h1 className="text-3xl font-bold text-gray-800">Email Templates</h1>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                fetchTemplates();
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
              <RefreshCw size={18} />
              Refresh
            </button>
            <button
              onClick={handleNew}
              className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 flex items-center gap-2"
            >
              <Plus size={18} />
              New Template
            </button>
            <button
              onClick={() => signOut()}
              className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 flex items-center gap-2"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3"
          >
            <AlertCircle className="text-red-600" />
            <span className="text-red-800">{error}</span>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3"
          >
            <Check className="text-green-600" />
            <span className="text-green-800">{success}</span>
          </motion.div>
        )}

        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            >
              <motion.div
                className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                initial={{ y: 20 }}
                animate={{ y: 0 }}
              >
                <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {editingId ? 'Edit Template' : 'New Template'}
                  </h2>
                  <button onClick={handleClose} className="p-1 hover:bg-gray-100 rounded" aria-label="Close">
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  <div>
                    <label htmlFor="template-name" className="block text-sm font-medium text-gray-700 mb-2">
                      Template Name *
                    </label>
                    <input
                      id="template-name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="e.g., contact-auto-reply"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      required
                      disabled={editingId !== null}
                    />
                    {editingId && <p className="text-xs text-gray-500 mt-1">Template name cannot be changed</p>}
                  </div>

                  <div>
                    <label htmlFor="template-subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <input
                      id="template-subject"
                      type="text"
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      placeholder="e.g., Thank you for contacting us"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <span className="block text-sm font-medium text-gray-700 mb-2">
                      Available Variables
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {AVAILABLE_VARIABLES.map((variable) => (
                        <button
                          key={variable}
                          type="button"
                          onClick={() => toggleVariable(variable)}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                            formData.variables.includes(variable)
                              ? 'bg-brand-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {`{{${variable}}}`}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Click to toggle. Use {'{{variable}}'} in your template content.</p>
                  </div>

                  <div>
                    <label htmlFor="template-html-body" className="block text-sm font-medium text-gray-700 mb-2">
                      HTML Body *
                    </label>
                    <textarea
                      id="template-html-body"
                      value={formData.html_body}
                      onChange={(e) => handleInputChange('html_body', e.target.value)}
                      placeholder="HTML email body with {{variable}} placeholders"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent font-mono text-sm"
                      rows={8}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="template-text-body" className="block text-sm font-medium text-gray-700 mb-2">
                      Text Body *
                    </label>
                    <textarea
                      id="template-text-body"
                      value={formData.text_body}
                      onChange={(e) => handleInputChange('text_body', e.target.value)}
                      placeholder="Plain text email body with {{variable}} placeholders"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent font-mono text-sm"
                      rows={8}
                      required
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => handleInputChange('is_active', e.target.checked)}
                      className="w-4 h-4"
                    />
                    <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                      Active
                    </label>
                  </div>

                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewMode(!previewMode);
                        if (!previewMode) {
                          setPreviewVars(
                            formData.variables.reduce(
                              (acc, v) => ({ ...acc, [v]: `Sample ${v}` }),
                              {}
                            )
                          );
                        }
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <Eye size={18} />
                      {previewMode ? 'Hide' : 'Preview'}
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:bg-gray-400"
                    >
                      {submitting ? 'Saving...' : editingId ? 'Update Template' : 'Create Template'}
                    </button>
                  </div>
                </form>

                {previewMode && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border-t bg-gray-50 p-6 space-y-4"
                  >
                    <h3 className="font-bold text-gray-800">Preview</h3>

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Subject:</p>
                      <p className="p-3 bg-white border rounded text-gray-800">
                        {renderContent(formData.subject, previewVars)}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">HTML Preview:</p>
                      <div className="p-3 bg-white border rounded prose prose-sm max-w-none">
                        <div
                          dangerouslySetInnerHTML={{
                            __html: renderContent(formData.html_body, previewVars),
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Text Preview:</p>
                      <pre className="p-3 bg-white border rounded text-gray-800 whitespace-pre-wrap font-mono text-sm">
                        {renderContent(formData.text_body, previewVars)}
                      </pre>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid gap-4">
          {templates.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-gray-600">No email templates yet. Create one to get started!</p>
            </div>
          ) : (
            templates.map((template) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-800">{template.name}</h3>
                      {template.is_active ? (
                        <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                          Active
                        </span>
                      ) : (
                        <span className="inline-block px-3 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-2">{template.subject}</p>
                    {template.variables && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {(typeof template.variables === 'string'
                          ? JSON.parse(template.variables)
                          : template.variables
                        ).map((v: string) => (
                          <span key={v} className="px-2 py-1 bg-brand-100 text-brand-800 text-xs rounded">
                            {`{{${v}}}`}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(template)}
                      className="p-2 text-brand-600 hover:bg-brand-50 rounded-lg"
                      aria-label={`Edit template ${template.name}`}
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(template.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      aria-label={`Delete template ${template.name}`}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
