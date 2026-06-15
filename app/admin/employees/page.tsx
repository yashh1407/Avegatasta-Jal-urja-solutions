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
  Info,
  Check,
  Layout,
  BarChart2,
  FolderLock,
  TrendingUp,
  Activity,
  Settings
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Employee {
  id: number;
  name: string;
  email: string;
  mobile_number: string | null;
  role: 'admin' | 'superadmin' | 'employee' | 'sales';
  permissions: Record<string, { view: boolean; add: boolean; edit: boolean; delete: boolean }> | string[] | null;
  last_login: string | null;
  created_at: string;
  failed_login_attempts?: number;
  lockout_until?: string | null;
}

interface EmployeeForm {
  name: string;
  email: string;
  mobile_number: string;
  password?: string;
  role: 'admin' | 'superadmin' | 'employee' | 'sales';
  permissions: Record<string, { view: boolean; add: boolean; edit: boolean; delete: boolean }>;
  failed_login_attempts?: number;
  lockout_until?: string | null;
  is_locked?: boolean;
}

const EMPTY_FORM: EmployeeForm = {
  name: '',
  email: '',
  mobile_number: '',
  password: '',
  role: 'employee',
  permissions: {},
  failed_login_attempts: 0,
  lockout_until: null,
  is_locked: false,
};

function normalizePermissions(permissions: any): Record<string, { view: boolean; add: boolean; edit: boolean; delete: boolean }> {
  const normalized: Record<string, { view: boolean; add: boolean; edit: boolean; delete: boolean }> = {};
  
  AVAILABLE_MODULES.forEach((mod) => {
    normalized[mod.key] = { view: false, add: false, edit: false, delete: false };
  });

  if (!permissions) return normalized;

  if (Array.isArray(permissions)) {
    // Old format: string array
    permissions.forEach((key) => {
      if (normalized[key]) {
        normalized[key] = { view: true, add: true, edit: true, delete: true };
      }
    });
  } else if (typeof permissions === 'object') {
    // New format: action flags
    Object.keys(permissions).forEach((key) => {
      const p = permissions[key];
      if (normalized[key]) {
        normalized[key] = {
          view: p && typeof p === 'object' ? !!p.view : false,
          add: p && typeof p === 'object' ? (p.add !== undefined ? !!p.add : !!p.edit) : false,
          edit: p && typeof p === 'object' ? !!p.edit : false,
          delete: p && typeof p === 'object' ? !!p.delete : false,
        };
      }
    });
  }

  return normalized;
}

const AVAILABLE_MODULES = [
  { 
    key: 'analytics', 
    label: 'Analytics', 
    category: 'Analytics', 
    desc: 'Access traffic and inquiries charts',
    supportedActions: ['view']
  },
  
  { 
    key: 'clients', 
    label: 'Clients', 
    category: 'Management', 
    desc: 'View client database and information',
    supportedActions: ['view', 'add', 'edit', 'delete']
  },
  { 
    key: 'products', 
    label: 'Products', 
    category: 'Products', 
    desc: 'Manage products, pricing, and quotations',
    supportedActions: ['view', 'add', 'edit', 'delete']
  },
  { 
    key: 'vendors', 
    label: 'Vendors', 
    category: 'Management', 
    desc: 'Manage vendor and manufacturer records',
    supportedActions: ['view', 'add', 'edit', 'delete']
  },
  { 
    key: 'amc', 
    label: 'AMC', 
    category: 'Management', 
    desc: 'Manage Annual Maintenance Contracts',
    supportedActions: ['view', 'add', 'edit', 'delete']
  },
  { 
    key: 'amc-plans', 
    label: 'AMC Plans', 
    category: 'Management', 
    desc: 'Manage AMC pricing and plan tiers',
    supportedActions: ['view', 'add', 'edit', 'delete']
  },
  { 
    key: 'team-members', 
    label: 'Team Members', 
    category: 'Management', 
    desc: 'Manage public-facing team members list',
    supportedActions: ['view', 'add', 'edit', 'delete']
  },
  { 
    key: 'brands', 
    label: 'Brands', 
    category: 'Management', 
    desc: 'Manage partner and brand logos',
    supportedActions: ['view', 'add', 'edit', 'delete']
  },
  { 
    key: 'orders', 
    label: 'Orders', 
    category: 'Management', 
    desc: 'View and manage orders',
    supportedActions: ['view', 'add', 'edit', 'delete']
  },
  { 
    key: 'enterprise', 
    label: 'Enterprise', 
    category: 'Management', 
    desc: 'View enterprise project requests',
    supportedActions: ['view', 'edit', 'delete']
  },
  
  { 
    key: 'sales', 
    label: 'Sales Dashboard', 
    category: 'Sales', 
    desc: 'View sales progress and records',
    supportedActions: ['view', 'add', 'edit', 'delete']
  },
  { 
    key: 'sales-team', 
    label: 'Sales Team', 
    category: 'Sales', 
    desc: 'Manage sales representatives',
    supportedActions: ['view', 'add', 'edit', 'delete']
  },
  { 
    key: 'inquiries', 
    label: 'Customer Inquiries', 
    category: 'Sales', 
    desc: 'Manage product & service inquiries',
    supportedActions: ['view', 'add', 'edit', 'delete']
  },
  
  { 
    key: 'messages', 
    label: 'Contact Messages', 
    category: 'Content', 
    desc: 'Manage contact form message entries',
    supportedActions: ['view', 'delete']
  },
  { 
    key: 'pages', 
    label: 'Content Pages', 
    category: 'Content', 
    desc: 'Configure content pages and sections data',
    supportedActions: ['view', 'edit']
  },
  { 
    key: 'case-studies', 
    label: 'Case Studies', 
    category: 'Content', 
    desc: 'Manage case studies and success stories',
    supportedActions: ['view', 'add', 'edit', 'delete']
  },
  { 
    key: 'testimonials', 
    label: 'Testimonials', 
    category: 'Content', 
    desc: 'Manage customer reviews and feedback',
    supportedActions: ['view', 'add', 'edit', 'delete']
  },

  { 
    key: 'email-templates', 
    label: 'Email Templates', 
    category: 'Content', 
    desc: 'View and manage outbound email layouts',
    supportedActions: ['view', 'add', 'edit', 'delete']
  },
  
  { 
    key: 'smtp-settings', 
    label: 'SMTP Settings', 
    category: 'Configuration', 
    desc: 'Configure system outbound mail servers',
    supportedActions: ['view', 'edit']
  },
  { 
    key: 'site-settings', 
    label: 'Site Settings', 
    category: 'Configuration', 
    desc: 'Configure global metadata and contacts',
    supportedActions: ['view', 'edit']
  },
  { 
    key: 'employees', 
    label: 'Employees', 
    category: 'Staff', 
    desc: 'Manage other staff logins and permission access',
    supportedActions: ['view', 'add', 'edit', 'delete']
  },
];

// Group modules by category for the permissions checklist layout
const MODULE_CATEGORIES = AVAILABLE_MODULES.reduce((acc, mod) => {
  if (!acc[mod.category]) acc[mod.category] = [];
  acc[mod.category].push(mod);
  return acc;
}, {} as Record<string, typeof AVAILABLE_MODULES>);

const CATEGORIES = [
  { id: 'Main', label: 'Main Modules', icon: Layout, desc: 'Core request flows' },
  { id: 'Analytics', label: 'Analytics', icon: BarChart2, desc: 'Data & statistics' },
  { id: 'Management', label: 'Management', icon: FolderLock, desc: 'Clients, products & AMC' },
  { id: 'Sales', label: 'Sales & CRM', icon: TrendingUp, desc: 'Sales pipeline and CRM' },
  { id: 'Content', label: 'Content Pages', icon: Activity, desc: 'Dynamic site content' },
  { id: 'Staff', label: 'Staff Management', icon: Users, desc: 'Employees & access roles' },
  { id: 'Configuration', label: 'System Configuration', icon: Settings, desc: 'SMTP, staff & site settings' },
];

// ─── Modal ────────────────────────────────────────────────────────────────────

function EmployeeModal({
  open,
  initial,
  onClose,
  onSaved,
  currentUserId,
  roles
}: {
  open: boolean;
  initial: (EmployeeForm & { id?: number }) | null;
  onClose: () => void;
  onSaved: () => void;
  currentUserId?: string;
  roles: any[];
}) {
  const [form, setForm] = useState<EmployeeForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Account');

  useEffect(() => {
    if (open) {
      if (initial) {
        setForm({
          name: initial.name,
          email: initial.email,
          mobile_number: initial.mobile_number || '',
          password: '',
          role: initial.role,
          permissions: normalizePermissions(initial.permissions),
          failed_login_attempts: initial.failed_login_attempts || 0,
          lockout_until: initial.lockout_until || null,
          is_locked: initial.lockout_until ? new Date(initial.lockout_until) > new Date() : false,
        });
      } else {
        setForm(EMPTY_FORM);
      }
      setActiveCategory('Account');
    }
  }, [open, initial]);

  const setField = (key: keyof EmployeeForm, value: any) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handlePermissionActionToggle = (moduleKey: string, action: 'view' | 'add' | 'edit' | 'delete') => {
    if (form.role === 'superadmin') return; // Superadmins always have all permissions implicitly
    
    setForm((prev) => {
      const current = prev.permissions[moduleKey] || { view: false, add: false, edit: false, delete: false };
      const updatedModulePerms = {
        ...current,
        [action]: !current[action],
      };
      return {
        ...prev,
        permissions: {
          ...prev.permissions,
          [moduleKey]: updatedModulePerms,
        },
      };
    });
  };

  const selectAllPermissions = () => {
    if (form.role === 'superadmin') return;
    const allPerms: Record<string, { view: boolean; add: boolean; edit: boolean; delete: boolean }> = {};
    AVAILABLE_MODULES.forEach((m: any) => {
      allPerms[m.key] = {
        view: m.supportedActions.includes('view'),
        add: m.supportedActions.includes('add'),
        edit: m.supportedActions.includes('edit'),
        delete: m.supportedActions.includes('delete'),
      };
    });
    setField('permissions', allPerms);
  };

  const clearAllPermissions = () => {
    if (form.role === 'superadmin') return;
    const emptyPerms: Record<string, { view: boolean; add: boolean; edit: boolean; delete: boolean }> = {};
    AVAILABLE_MODULES.forEach((m) => {
      emptyPerms[m.key] = { view: false, add: false, edit: false, delete: false };
    });
    setField('permissions', emptyPerms);
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
        is_locked: !!form.is_locked,
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

  const isSelf = !!(initial?.id && String(initial.id) === String(currentUserId));

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
            className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl h-[85vh] min-h-[600px] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 flex-shrink-0 bg-slate-50/50">
              <div>
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Shield size={22} className="text-blue-600" />
                  {initial?.id ? 'Edit Employee Access Settings' : 'Create Employee Account'}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Configure secure access settings and override module availability.
                </p>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-all">
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
              {/* Sidebar + Content Container */}
              <div className="flex flex-1 overflow-hidden bg-slate-50/50 min-h-0">
                {/* Left Sidebar - Categories */}
                <div className="w-80 bg-white border-r border-slate-100 flex flex-col flex-shrink-0 overflow-y-auto no-scrollbar p-4 space-y-2">
                  <div className="px-3 py-1 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Navigation</span>
                  </div>

                  {/* Account Tab */}
                  <button
                    type="button"
                    onClick={() => setActiveCategory('Account')}
                    className={`w-full flex items-center justify-between text-left p-3 rounded-2xl transition-all border ${
                      activeCategory === 'Account'
                        ? 'bg-blue-50/70 border-blue-100 text-blue-900 shadow-sm shadow-blue-50/50'
                        : 'bg-white border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2 rounded-xl flex-shrink-0 ${
                        activeCategory === 'Account' ? 'bg-blue-600 text-white shadow-md shadow-blue-200/50' : 'bg-slate-100 text-slate-500'
                      }`}>
                        <UserCheck size={16} />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-black block leading-none">Account Info</span>
                        <span className="text-[10px] text-slate-400 block mt-1 truncate max-w-[150px] font-medium">
                          Credentials & Role
                        </span>
                      </div>
                    </div>
                  </button>

                  <div className="px-3 py-1 my-2 border-t border-slate-100 pt-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Permissions Overrides</span>
                  </div>

                  {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const isActive = activeCategory === cat.id;
                    
                    // Count how many permissions are active in this category
                    const categoryModules = MODULE_CATEGORIES[cat.id] || [];
                    const activeInCatCount = categoryModules.reduce((acc, mod) => {
                      const perms = form.permissions[mod.key] || { view: false, edit: false, delete: false };
                      let count = 0;
                      if (perms.view) count++;
                      if (perms.edit) count++;
                      if (perms.delete) count++;
                      return acc + count;
                    }, 0);
                    const totalPossible = categoryModules.length * 3;

                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setActiveCategory(cat.id)}
                        disabled={form.role === 'superadmin'}
                        className={`w-full flex items-center justify-between text-left p-3 rounded-2xl transition-all border disabled:opacity-50 ${
                          isActive
                            ? 'bg-blue-50/70 border-blue-100 text-blue-900 shadow-sm shadow-blue-50/50'
                            : 'bg-white border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`p-2 rounded-xl flex-shrink-0 ${
                            isActive ? 'bg-blue-600 text-white shadow-md shadow-blue-200/50' : 'bg-slate-100 text-slate-500'
                          }`}>
                            <Icon size={16} />
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-black block leading-none">{cat.label}</span>
                            <span className="text-[10px] text-slate-400 block mt-1 truncate max-w-[150px] font-medium">
                              {cat.desc}
                            </span>
                          </div>
                        </div>
                        {form.role !== 'superadmin' && activeInCatCount > 0 && (
                          <div className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold flex-shrink-0 ${
                            isActive ? 'bg-blue-200/60 text-blue-800' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {activeInCatCount}/{totalPossible}
                          </div>
                        )}
                      </button>
                    );
                  })}
                  
                  {/* Global settings buttons at the bottom of the sidebar */}
                  {form.role !== 'superadmin' && (
                    <div className="pt-4 mt-auto border-t border-slate-100 flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={selectAllPermissions}
                        className="w-full text-xs font-extrabold text-blue-600 hover:text-blue-700 bg-blue-50/80 hover:bg-blue-100/80 py-2.5 rounded-xl transition-all border border-blue-100/50 text-center"
                      >
                        Enable All Modules
                      </button>
                      <button
                        type="button"
                        onClick={clearAllPermissions}
                        className="w-full text-xs font-extrabold text-slate-500 hover:text-slate-600 bg-slate-50 hover:bg-slate-100/80 py-2.5 rounded-xl transition-all border border-slate-200/50 text-center"
                      >
                        Disable All Modules
                      </button>
                    </div>
                  )}
                </div>

                {/* Right Content Area */}
                <div className="flex-1 overflow-y-auto no-scrollbar p-6 flex flex-col">
                  {activeCategory === 'Account' ? (
                    <div className="space-y-6 max-w-3xl">
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                        <UserCheck size={18} className="text-blue-600" />
                        <h3 className="text-sm font-black text-slate-900">Account Credentials & System Role</h3>
                      </div>

                      {isSelf && (
                        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-4 flex gap-3 text-xs font-semibold">
                          <Info size={16} className="flex-shrink-0 mt-0.5" />
                          <p>You are editing your own account. For security, you cannot change your own system role or access level to prevent accidental lockout.</p>
                        </div>
                      )}

                      {form.is_locked && form.role !== 'superadmin' && (
                        <div className="bg-red-50 border border-red-200 text-red-800 rounded-2xl p-4 flex gap-3 text-xs font-semibold">
                          <Lock size={16} className="flex-shrink-0 mt-0.5 text-red-600" />
                          <div>
                            <p className="font-bold">🔒 Account Locked Out</p>
                            <p className="mt-1 font-medium">This account is currently locked. To unlock it, toggle the <strong>Account Lockout Status</strong> switch below to active/unlocked and save settings.</p>
                          </div>
                        </div>
                      )}

                      {/* Lock / Unlock Toggle (Only for existing accounts, not self, and not superadmins) */}
                      {initial?.id && !isSelf && form.role !== 'superadmin' && (
                        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl flex-shrink-0 ${
                              form.is_locked ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                            }`}>
                              {form.is_locked ? <Lock size={16} /> : <UserCheck size={16} />}
                            </div>
                            <div>
                              <span className="text-xs font-black block leading-none">Account Lockout Status</span>
                              <span className="text-[10px] text-slate-500 block mt-1 font-medium">
                                {form.is_locked 
                                  ? `Locked (${form.failed_login_attempts || 5} failed attempts). User cannot log in.` 
                                  : 'Active / Unlocked. User can log in.'
                                }
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setField('is_locked', !form.is_locked)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                              form.is_locked ? 'bg-red-500' : 'bg-emerald-500'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                form.is_locked ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">Full Name *</label>
                          <input
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-slate-800 font-semibold"
                            value={form.name}
                            onChange={(e) => setField('name', e.target.value)}
                            required
                            placeholder="e.g. Rahul Sharma"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">Email Address * (Login ID)</label>
                          <input
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-slate-800 font-semibold"
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
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-slate-800 font-semibold"
                            value={form.mobile_number}
                            onChange={(e) => setField('mobile_number', e.target.value)}
                            placeholder="e.g. +91 98765 43210"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">System Role *</label>
                          <select
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-slate-800 font-semibold cursor-pointer disabled:opacity-50"
                            value={form.role}
                            onChange={(e) => {
                              const newRole = e.target.value;
                              let rolePermissions = form.permissions;
                              if (newRole === 'superadmin') {
                                const allPerms: Record<string, { view: boolean; add: boolean; edit: boolean; delete: boolean }> = {};
                                AVAILABLE_MODULES.forEach((m: any) => {
                                  allPerms[m.key] = {
                                    view: m.supportedActions.includes('view'),
                                    add: m.supportedActions.includes('add'),
                                    edit: m.supportedActions.includes('edit'),
                                    delete: m.supportedActions.includes('delete'),
                                  };
                                });
                                rolePermissions = allPerms;
                              } else {
                                const matchedRole = roles.find((r) => r.name === newRole);
                                if (matchedRole) {
                                  rolePermissions = normalizePermissions(matchedRole.permissions);
                                }
                              }
                              setForm((prev) => ({
                                ...prev,
                                role: newRole as any,
                                permissions: rolePermissions
                              }));
                            }}
                            disabled={isSelf} // Prevent demoting yourself
                          >
                            {form.role === 'superadmin' && (
                              <option value="superadmin">Superadmin</option>
                            )}
                            {roles.map((r) => (
                              <option key={r.id} value={r.name}>
                                {r.name.charAt(0).toUpperCase() + r.name.slice(1)}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="md:col-span-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">
                            {initial?.id ? 'New Password (Optional)' : 'Password *'}
                          </label>
                          <input
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-slate-800 font-semibold"
                            type="password"
                            value={form.password || ''}
                            onChange={(e) => setField('password', e.target.value)}
                            required={!initial?.id}
                            placeholder={initial?.id ? 'Leave empty to keep current password' : 'Min 6 characters'}
                          />
                        </div>
                      </div>
                    </div>
                  ) : form.role === 'superadmin' ? (
                    <div className="bg-blue-50 border border-blue-100 rounded-3xl p-8 text-center my-auto max-w-xl mx-auto">
                      <Shield size={42} className="text-blue-500 mx-auto mb-4" />
                      <h4 className="text-base font-black text-blue-900">Unrestricted Access Role</h4>
                      <p className="text-xs text-blue-600 max-w-lg mx-auto mt-2 leading-relaxed font-semibold">
                        Users designated as <strong>Superadmin</strong> automatically inherit full read and write privileges across all system configurations, databases, and administrative modules. Individual permission override presets cannot be modified.
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Category Header Controls */}
                      {(() => {
                        const catInfo = CATEGORIES.find(c => c.id === activeCategory);
                        const categoryModules = MODULE_CATEGORIES[activeCategory] || [];
                        
                        return (
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-5">
                            <div>
                              <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                                {catInfo?.label}
                              </h3>
                              <p className="text-xs text-slate-500 mt-0.5">{catInfo?.desc}</p>
                            </div>
                            
                            {/* Category specific select/clear */}
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setForm(prev => {
                                    const updated = { ...prev.permissions };
                                    categoryModules.forEach((mod: any) => {
                                      updated[mod.key] = {
                                        view: mod.supportedActions.includes('view'),
                                        add: mod.supportedActions.includes('add'),
                                        edit: mod.supportedActions.includes('edit'),
                                        delete: mod.supportedActions.includes('delete'),
                                      };
                                    });
                                    return { ...prev, permissions: updated };
                                  });
                                }}
                                className="text-[10px] font-black uppercase tracking-wider text-blue-600 hover:bg-blue-50/60 px-3 py-2 border border-blue-100 rounded-xl transition-all bg-white"
                              >
                                Select Category
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setForm(prev => {
                                    const updated = { ...prev.permissions };
                                    categoryModules.forEach(mod => {
                                      updated[mod.key] = { view: false, add: false, edit: false, delete: false };
                                    });
                                    return { ...prev, permissions: updated };
                                  });
                                }}
                                className="text-[10px] font-black uppercase tracking-wider text-slate-500 hover:bg-slate-100 px-3 py-2 border border-slate-200 rounded-xl transition-all bg-white"
                              >
                                Clear Category
                              </button>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Modules Cards list */}
                      <div className="space-y-4">
                        {(MODULE_CATEGORIES[activeCategory] || []).map((mod: any) => {
                          const perms = form.permissions[mod.key] || { view: false, add: false, edit: false, delete: false };
                          return (
                            <div
                              key={mod.key}
                              className="bg-white border border-slate-200/60 rounded-3xl p-5 hover:border-blue-200 hover:shadow-md hover:shadow-blue-50/10 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                            >
                              <div className="max-w-md">
                                <span className="text-sm font-black block leading-none text-slate-900">{mod.label}</span>
                                <span className="text-xs text-slate-500 block mt-1.5 leading-normal font-medium">{mod.desc}</span>
                              </div>
                              
                              {/* Premium Action Pill Toggles */}
                              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                                {/* View Pill */}
                                {mod.supportedActions.includes('view') && (
                                  <button
                                    type="button"
                                    onClick={() => handlePermissionActionToggle(mod.key, 'view')}
                                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all border ${
                                      perms.view
                                        ? 'bg-blue-50/80 border-blue-200 text-blue-700 shadow-sm shadow-blue-100/30'
                                        : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                                    }`}
                                  >
                                    <Check size={14} className={`transition-transform duration-250 ${perms.view ? 'scale-100' : 'scale-0 w-0'}`} />
                                    <span>View</span>
                                  </button>
                                )}

                                {/* Add Pill */}
                                {mod.supportedActions.includes('add') && (
                                  <button
                                    type="button"
                                    onClick={() => handlePermissionActionToggle(mod.key, 'add')}
                                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all border ${
                                      perms.add
                                        ? 'bg-emerald-50/80 border-emerald-200 text-emerald-700 shadow-sm shadow-emerald-100/30'
                                        : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                                    }`}
                                  >
                                    <Check size={14} className={`transition-transform duration-250 ${perms.add ? 'scale-100' : 'scale-0 w-0'}`} />
                                    <span>Add</span>
                                  </button>
                                )}

                                {/* Edit Pill */}
                                {mod.supportedActions.includes('edit') && (
                                  <button
                                    type="button"
                                    onClick={() => handlePermissionActionToggle(mod.key, 'edit')}
                                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all border ${
                                      perms.edit
                                        ? 'bg-amber-50/80 border-amber-200 text-amber-700 shadow-sm shadow-amber-100/30'
                                        : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                                    }`}
                                  >
                                    <Check size={14} className={`transition-transform duration-250 ${perms.edit ? 'scale-100' : 'scale-0 w-0'}`} />
                                    <span>Edit</span>
                                  </button>
                                )}

                                {/* Delete Pill */}
                                {mod.supportedActions.includes('delete') && (
                                  <button
                                    type="button"
                                    onClick={() => handlePermissionActionToggle(mod.key, 'delete')}
                                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all border ${
                                      perms.delete
                                        ? 'bg-rose-50/80 border-rose-200 text-rose-700 shadow-sm shadow-rose-100/30'
                                        : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                                    }`}
                                  >
                                    <Check size={14} className={`transition-transform duration-250 ${perms.delete ? 'scale-100' : 'scale-0 w-0'}`} />
                                    <span>Delete</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-3 px-8 py-5 border-t border-slate-100 bg-white flex-shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : initial?.id ? 'Save Access Settings' : 'Create Account'}
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
  const [roles, setRoles] = useState<any[]>([]);

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

  const fetchRoles = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/roles');
      if (res.ok) {
        const data = await res.json();
        setRoles(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    }
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated') {
      const userRole = (session?.user as any)?.role;
      if (userRole === 'superadmin' || userRole === 'admin') {
        fetchEmployees();
        fetchRoles();
      }
    }
  }, [status, router, fetchEmployees, fetchRoles, session]);

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
    setModalInitial({
      id: emp.id,
      name: emp.name,
      email: emp.email,
      mobile_number: emp.mobile_number || '',
      role: emp.role,
      permissions: normalizePermissions(emp.permissions),
      failed_login_attempts: emp.failed_login_attempts,
      lockout_until: emp.lockout_until,
      is_locked: emp.lockout_until ? new Date(emp.lockout_until) > new Date() : false,
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
                              {emp.lockout_until && new Date(emp.lockout_until) > new Date() && (
                                <span className="bg-red-50 text-red-600 text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-red-100 flex items-center gap-1">
                                  <Lock size={8} /> Locked
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
                          const normalized = normalizePermissions(emp.permissions);
                          const activeModules = Object.entries(normalized).filter(
                            ([_, actions]) => actions.view || actions.edit || actions.delete
                          );
                          
                          if (activeModules.length === 0) {
                            return (
                              <span className="text-[11px] font-semibold text-slate-400 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg flex items-center gap-1.5 w-fit">
                                <Lock size={10} />
                                  No Modules Authorized
                              </span>
                            );
                          }

                          return (
                            <div className="flex flex-wrap gap-1.5">
                              {activeModules.map(([moduleKey, actions]) => {
                                const mod = AVAILABLE_MODULES.find((m) => m.key === moduleKey);
                                const label = mod ? mod.label : moduleKey;
                                const actionList = [];
                                if (actions.view) actionList.push('V');
                                if (actions.edit) actionList.push('E');
                                if (actions.delete) actionList.push('D');
                                return (
                                  <span
                                    key={moduleKey}
                                    className="text-[9px] font-bold bg-slate-100 text-slate-700 border border-slate-200/50 px-1.5 py-0.5 rounded-md flex items-center gap-1 capitalize animate-fadeIn"
                                  >
                                    <span>{label}</span>
                                    <span className="text-slate-400 font-extrabold">({actionList.join(',')})</span>
                                  </span>
                                );
                              })}
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
        roles={roles}
      />
    </div>
  );
}
