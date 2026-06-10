'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import toast, { Toaster } from 'react-hot-toast';
import {
  Users,
  Search,
  RefreshCw,
  Trash2,
  Plus,
  X,
  Shield,
  Key,
  Calendar,
  Lock,
  UserCheck,
  Edit2,
  Info
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Employee {
  id: number;
  name: string;
  email: string;
  mobile_number: string | null;
  role: 'admin' | 'superadmin' | 'employee' | 'sales';
  permissions: string[] | null;
  last_login: string | null;
  created_at: string;
}

interface EmployeeForm {
  name: string;
  email: string;
  mobile_number: string;
  password?: string;
  role: 'superadmin' | 'employee' | 'sales';
  permissions: string[];
}

const EMPTY_FORM: EmployeeForm = {
  name: '',
  email: '',
  mobile_number: '',
  password: '',
  role: 'employee',
  permissions: [],
};

const AVAILABLE_MODULES = [
  { key: 'quotations', label: 'Quotations', category: 'Main', desc: 'View and manage quotation requests' },
  
  { key: 'analytics', label: 'Analytics', category: 'Analytics', desc: 'Access traffic and inquiries charts' },
  
  { key: 'clients', label: 'Clients', category: 'Management', desc: 'View client database and information' },
  { key: 'products', label: 'Products', category: 'Management', desc: 'Manage products and service catalog' },
  { key: 'vendors', label: 'Vendors', category: 'Management', desc: 'Manage vendor and manufacturer records' },
  { key: 'amc', label: 'AMC', category: 'Management', desc: 'Manage Annual Maintenance Contracts' },
  { key: 'amc-plans', label: 'AMC Plans', category: 'Management', desc: 'Manage AMC pricing and plan tiers' },
  { key: 'team-members', label: 'Team Members', category: 'Management', desc: 'Manage public-facing team members list' },
  { key: 'brands', label: 'Brands', category: 'Management', desc: 'Manage partner and brand logos' },
  { key: 'orders', label: 'Orders', category: 'Management', desc: 'View and manage orders' },
  { key: 'enterprise', label: 'Enterprise', category: 'Management', desc: 'View enterprise project requests' },
  
  { key: 'sales', label: 'Sales Dashboard', category: 'Sales', desc: 'View sales progress and records' },
  { key: 'sales-team', label: 'Sales Team', category: 'Sales', desc: 'Manage sales representatives' },
  { key: 'inquiries', label: 'Customer Inquiries', category: 'Sales', desc: 'Manage product & service inquiries' },
  
  { key: 'messages', label: 'Contact Messages', category: 'Content', desc: 'Manage contact form message entries' },
  { key: 'pages', label: 'Content Pages', category: 'Content', desc: 'Configure content pages and sections data' },
  { key: 'case-studies', label: 'Case Studies', category: 'Content', desc: 'Manage case studies and success stories' },
  { key: 'testimonials', label: 'Testimonials', category: 'Content', desc: 'Manage customer reviews and feedback' },
  { key: 'pricing', label: 'Pricing Plans', category: 'Content', desc: 'Manage pricing structures' },
  { key: 'email-templates', label: 'Email Templates', category: 'Content', desc: 'View and manage outbound email layouts' },
  
  { key: 'smtp-settings', label: 'SMTP Settings', category: 'Configuration', desc: 'Configure system outbound mail servers' },
  { key: 'site-settings', label: 'Site Settings', category: 'Configuration', desc: 'Configure global metadata and contacts' },
  { key: 'employees', label: 'Employees', category: 'Configuration', desc: 'Manage other staff logins and permission access' },
];

// Group modules by category for the permissions checklist layout
const MODULE_CATEGORIES = AVAILABLE_MODULES.reduce((acc, mod) => {
  if (!acc[mod.category]) acc[mod.category] = [];
  acc[mod.category].push(mod);
  return acc;
}, {} as Record<string, typeof AVAILABLE_MODULES>);

// ─── Modal ────────────────────────────────────────────────────────────────────

function EmployeeModal({
  open,
  initial,
  onClose,
  onSaved,
  currentUserId
}: {
  open: boolean;
  initial: (EmployeeForm & { id?: number }) | null;
  onClose: () => void;
  onSaved: () => void;
  currentUserId?: string;
}) {
  const [form, setForm] = useState<EmployeeForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (initial) {
        setForm({
          name: initial.name,
          email: initial.email,
          mobile_number: initial.mobile_number || '',
          password: '',
          role: initial.role,
          permissions: initial.permissions || [],
        });
      } else {
        setForm(EMPTY_FORM);
      }
    }
  }, [open, initial]);

  const setField = (key: keyof EmployeeForm, value: any) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handlePermissionToggle = (moduleKey: string) => {
    if (form.role === 'superadmin') return; // Superadmins always have all permissions implicitly
    
    setForm((prev) => {
      const exists = prev.permissions.includes(moduleKey);
      const newPerms = exists
        ? prev.permissions.filter((k) => k !== moduleKey)
        : [...prev.permissions, moduleKey];
      return { ...prev, permissions: newPerms };
    });
  };

  const selectAllPermissions = () => {
    if (form.role === 'superadmin') return;
    const allKeys = AVAILABLE_MODULES.map((m) => m.key);
    setField('permissions', allKeys);
  };

  const clearAllPermissions = () => {
    if (form.role === 'superadmin') return;
    setField('permissions', []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const isEdit = !!initial?.id;
      const url = isEdit ? `/api/admin/employees/${initial!.id}` : '/api/admin/employees';
      
      const payload: any = {
        name: form.name,
        email: form.email,
        mobile_number: form.mobile_number || null,
        role: form.role,
        permissions: form.role === 'superadmin' ? null : form.permissions,
      };

      if (form.password) {
        payload.password = form.password;
      } else if (!isEdit) {
        toast.error('Password is required for new accounts');
        setSaving(false);
        return;
      }

      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(isEdit ? 'Employee updated successfully' : 'Employee created successfully');
        onSaved();
        onClose();
      } else {
        toast.error(data.error || 'Failed to save employee');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to save employee');
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-slate-800 font-semibold';

  const isSelf = initial?.id && String(initial.id) === String(currentUserId);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 10 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-y-auto max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 flex-shrink-0">
              <div>
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Shield size={22} className="text-blue-600" />
                  {initial?.id ? 'Edit Employee Permissions' : 'Create Employee Account'}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Configure secure access settings and module availability.
                </p>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-all">
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6">
              
              {/* Core Credentials Rows */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">Full Name *</label>
                  <input
                    className={inputClass}
                    value={form.name}
                    onChange={(e) => setField('name', e.target.value)}
                    required
                    placeholder="e.g. Rahul Sharma"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">Email Address * (Login ID)</label>
                  <input
                    className={inputClass}
                    type="email"
                    value={form.email}
                    onChange={(e) => setField('email', e.target.value)}
                    required
                    placeholder="e.g. rahul@example.com"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">Mobile Number</label>
                  <input
                    className={inputClass}
                    value={form.mobile_number}
                    onChange={(e) => setField('mobile_number', e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">
                    {initial?.id ? 'New Password (Optional)' : 'Password *'}
                  </label>
                  <input
                    className={inputClass}
                    type="password"
                    value={form.password || ''}
                    onChange={(e) => setField('password', e.target.value)}
                    required={!initial?.id}
                    placeholder={initial?.id ? 'Leave empty to keep current' : 'Min 6 characters'}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">System Role *</label>
                  <select
                    className={inputClass}
                    value={form.role}
                    onChange={(e) => {
                      const newRole = e.target.value as 'superadmin' | 'employee' | 'sales';
                      setForm((prev) => ({
                        ...prev,
                        role: newRole,
                        permissions: newRole === 'superadmin' ? AVAILABLE_MODULES.map(m => m.key) : prev.permissions
                      }));
                    }}
                    disabled={isSelf} // Prevent demoting yourself
                  >
                    {form.role === 'superadmin' && (
                      <option value="superadmin">Superadmin</option>
                    )}
                    <option value="employee">Employee</option>
                    <option value="sales">Sales</option>
                  </select>
                </div>
              </div>

              {isSelf && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 flex gap-3 text-xs">
                  <Info size={16} className="flex-shrink-0 mt-0.5" />
                  <p>You are editing your own account. For security, you cannot change your own system role or permissions checklist to prevent accidental lockouts.</p>
                </div>
              )}

              {/* Permissions Checklist Area */}
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Module Access Configuration</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Select which sections of the admin panel this user can access.</p>
                  </div>
                  {form.role !== 'superadmin' && (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={selectAllPermissions}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition-all"
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={clearAllPermissions}
                        className="text-xs font-bold text-slate-600 hover:text-slate-700 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg transition-all"
                      >
                        Clear All
                      </button>
                    </div>
                  )}
                </div>

                {form.role === 'superadmin' ? (
                  <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 text-center">
                    <Shield size={36} className="text-blue-500 mx-auto mb-3" />
                    <h4 className="text-sm font-black text-blue-900">Unrestricted Access Granted</h4>
                    <p className="text-xs text-blue-600 max-w-lg mx-auto mt-1">
                      Users designated as <strong>Superadmin</strong> automatically inherit full read and write privileges across all system configurations, databases, and administrative modules.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(MODULE_CATEGORIES).map(([categoryName, modules]) => (
                      <div key={categoryName} className="space-y-3">
                        <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-50 pb-1">
                          {categoryName}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {modules.map((mod) => {
                            const isChecked = form.permissions.includes(mod.key);
                            return (
                              <label
                                key={mod.key}
                                className={`flex items-start gap-3 p-3.5 border rounded-xl cursor-pointer hover:bg-slate-50 transition-all ${
                                  isChecked
                                    ? 'border-blue-200 bg-blue-50/20 ring-1 ring-blue-500/10'
                                    : 'border-slate-100 bg-white'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handlePermissionToggle(mod.key)}
                                  className="mt-0.5 w-4.5 h-4.5 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500/20"
                                />
                                <div>
                                  <div className="text-xs font-black text-slate-900">{mod.label}</div>
                                  <div className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{mod.desc}</div>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4 border-t border-slate-100 flex-shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 border border-slate-200 rounded-xl text-sm font-black text-slate-600 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-sm font-black text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {saving && <RefreshCw size={14} className="animate-spin" />}
                  {saving ? 'Saving Account…' : initial?.id ? 'Save Access Settings' : 'Create Account'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Main Page Component ──────────────────────────────────────────────────────

export default function EmployeesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalInitial, setModalInitial] = useState<(EmployeeForm & { id?: number }) | null>(null);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/employees');
      if (res.ok) {
        const data = await res.json();
        setEmployees(Array.isArray(data) ? data : []);
      } else {
        setEmployees([]);
      }
    } catch {
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated') {
      const userRole = (session?.user as any)?.role;
      if (userRole === 'superadmin' || userRole === 'admin') {
        fetchEmployees();
      }
    }
  }, [status, router, fetchEmployees, session]);

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <RefreshCw className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  const currentUser = session?.user as any;
  const userRole = currentUser?.role;

  // Protect against non-admin view
  if (userRole !== 'superadmin' && userRole !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 mb-6">
          <Shield size={32} />
        </div>
        <h1 className="text-2xl font-black text-slate-900 mb-2">Access Denied</h1>
        <p className="text-slate-600 max-w-md">
          You do not have the required permissions to access this page. Only Superadmins can view and manage employee accounts.
        </p>
      </div>
    );
  }

  const handleDelete = async (id: number, email: string) => {
    if (!confirm(`Are you sure you want to delete employee "${email}"? This action is permanent and cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/employees/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (res.ok) {
        toast.success(`Account "${email}" deleted successfully.`);
        fetchEmployees();
      } else {
        toast.error(data.error || 'Failed to delete employee account');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete employee account');
    }
  };

  const openAdd = () => {
    setModalInitial(null);
    setModalOpen(true);
  };

  const openEdit = (emp: Employee) => {
    const parsedPerms = Array.isArray(emp.permissions)
      ? emp.permissions
      : typeof emp.permissions === 'string'
      ? (() => {
          try { return JSON.parse(emp.permissions); }
          catch { return []; }
        })()
      : [];

    setModalInitial({
      id: emp.id,
      name: emp.name,
      email: emp.email,
      mobile_number: emp.mobile_number || '',
      role: emp.role,
      permissions: parsedPerms,
    });
    setModalOpen(true);
  };

  // Filter employees by search criteria
  const filteredEmployees = employees.filter((emp) =>
    emp.name?.toLowerCase().includes(search.toLowerCase()) ||
    emp.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 lg:p-12 min-h-screen bg-slate-50/50">
      <Toaster position="top-right" />
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl text-white flex items-center justify-center">
              <Users size={20} />
            </div>
            Employees & Access Management
          </h1>
          <p className="text-slate-500 text-sm mt-2 max-w-xl">
            Create employee logins and customize access permissions for the Avegatasta administrative control panel.
          </p>
        </div>
        
        <button
          onClick={openAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white font-black text-sm px-5 py-3 rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2 self-start md:self-auto"
        >
          <Plus size={16} />
          Create Account
        </button>
      </div>

      {/* Main Grid View */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/40 overflow-hidden">
        
        {/* Table Filters */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/30 flex flex-col md:flex-row justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-3.5 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search admin users by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-slate-800"
            />
          </div>
          <button
            onClick={fetchEmployees}
            className="flex items-center justify-center gap-2 px-4 py-3 border border-slate-200 rounded-xl text-slate-600 text-sm font-black hover:bg-slate-50 transition-all"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>

        {/* Listing Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-24 text-center">
              <RefreshCw size={32} className="animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-slate-500 text-xs font-semibold">Loading admin users list...</p>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="py-24 text-center">
              <Users size={40} className="text-slate-300 mx-auto mb-4" />
              <h3 className="text-slate-900 font-black text-sm">No admin accounts found</h3>
              <p className="text-slate-500 text-xs mt-1">Try searching for a different name/email or add a new account.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  <th className="px-6 py-4">Employee & Contact</th>
                  <th className="px-6 py-4">System Role</th>
                  <th className="px-6 py-4">Authorized Access</th>
                  <th className="px-6 py-4">Last Login</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp) => {
                  const initials = emp.name ? emp.name.slice(0, 2).toUpperCase() : 'EE';
                  const isCurrentSessionUser = String(emp.id) === String(currentUser?.id);
                  
                  return (
                    <tr key={emp.id} className="border-b border-slate-50 hover:bg-slate-50/20 transition-all group">
                      
                      {/* Identity Column */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 font-black text-xs flex items-center justify-center flex-shrink-0">
                            {initials}
                          </div>
                          <div>
                            <span className="text-xs font-black text-slate-900 block flex items-center gap-2">
                              {emp.name}
                              {isCurrentSessionUser && (
                                <span className="bg-blue-100 text-blue-700 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                                  You
                                </span>
                              )}
                            </span>
                            <span className="text-[10px] text-slate-500 block mt-0.5 font-medium">
                              {emp.email} {emp.mobile_number ? `• ${emp.mobile_number}` : ''}
                            </span>
                            <span className="text-[9px] text-slate-400 block mt-0.5 flex items-center gap-1">
                              <Calendar size={10} />
                              Created: {new Date(emp.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* System Role Column */}
                      <td className="px-6 py-5">
                        {emp.role === 'superadmin' ? (
                          <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-purple-100">
                            <Shield size={10} />
                            Superadmin
                          </span>
                        ) : emp.role === 'sales' ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-emerald-100">
                            <UserCheck size={10} />
                            Sales
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-blue-100">
                            <UserCheck size={10} />
                            Employee
                          </span>
                        )}
                      </td>

                      {/* Authorized Access Column */}
                      <td className="px-6 py-5 max-w-xs">
                        {emp.role === 'superadmin' ? (
                          <span className="text-[11px] font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-lg">
                            Full Unrestricted Access
                          </span>
                        ) : (() => {
                          const perms = Array.isArray(emp.permissions)
                            ? emp.permissions
                            : typeof emp.permissions === 'string'
                            ? (() => {
                                try { return JSON.parse(emp.permissions); }
                                catch { return []; }
                              })()
                            : [];
                          
                          if (perms.length === 0) {
                            return (
                              <span className="text-[11px] font-semibold text-slate-400 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg flex items-center gap-1.5 w-fit">
                                <Lock size={10} />
                                No Modules Authorized
                              </span>
                            );
                          }

                          return (
                            <div className="flex flex-wrap gap-1">
                              {perms.map((p) => (
                                <span key={p} className="text-[9px] font-bold bg-slate-100 text-slate-700 border border-slate-200/50 px-1.5 py-0.5 rounded-md">
                                  {p}
                                </span>
                              ))}
                            </div>
                          );
                        })()}
                      </td>

                      {/* Last Login Column */}
                      <td className="px-6 py-5">
                        <span className="text-xs font-semibold text-slate-600 block">
                          {emp.last_login ? (
                            new Date(emp.last_login).toLocaleString()
                          ) : (
                            <span className="text-slate-400 italic">Never logged in</span>
                          )}
                        </span>
                      </td>

                      {/* Actions Column */}
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(emp)}
                            className="p-2 border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 rounded-xl transition-all"
                            title="Edit Permissions"
                          >
                            <Edit2 size={14} />
                          </button>
                          
                          <button
                            onClick={() => handleDelete(emp.id, emp.email)}
                            className="p-2 border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 rounded-xl transition-all disabled:opacity-30 disabled:pointer-events-none"
                            disabled={isCurrentSessionUser || (emp.role === 'superadmin' && employees.filter(e => e.role === 'superadmin').length <= 1)}
                            title={isCurrentSessionUser ? 'Cannot delete yourself' : 'Delete Account'}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        
      </div>

      {/* Access Settings Modal */}
      <EmployeeModal
        open={modalOpen}
        initial={modalInitial}
        onClose={() => setModalOpen(false)}
        onSaved={fetchEmployees}
        currentUserId={currentUser?.id}
      />
    </div>
  );
}
