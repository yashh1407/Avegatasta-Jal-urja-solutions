'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import {
  Shield,
  Search,
  RefreshCw,
  Trash2,
  Plus,
  X,
  Lock,
  Edit2,
  Info,
  Check,
  Layout,
  BarChart2,
  FolderLock,
  TrendingUp,
  Activity,
  Settings,
  Users
} from 'lucide-react';

interface Role {
  id: number;
  name: string;
  permissions: Record<string, { view: boolean; add: boolean; edit: boolean; delete: boolean }> | string[] | null;
  created_at: string;
}

interface RoleForm {
  name: string;
  permissions: Record<string, { view: boolean; add: boolean; edit: boolean; delete: boolean }>;
}

const EMPTY_FORM: RoleForm = {
  name: '',
  permissions: {},
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

// ─── Modal Component ─────────────────────────────────────────────────────────

function RoleModal({
  open,
  initial,
  onClose,
  onSaved,
}: {
  open: boolean;
  initial: (RoleForm & { id?: number }) | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<RoleForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Main');

  useEffect(() => {
    if (open) {
      if (initial) {
        setForm({
          name: initial.name,
          permissions: normalizePermissions(initial.permissions),
        });
      } else {
        setForm(EMPTY_FORM);
      }
      setActiveCategory('Main');
    }
  }, [open, initial]);

  const handlePermissionActionToggle = (moduleKey: string, action: 'view' | 'add' | 'edit' | 'delete') => {
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
    const allPerms: Record<string, { view: boolean; add: boolean; edit: boolean; delete: boolean }> = {};
    AVAILABLE_MODULES.forEach((m: any) => {
      allPerms[m.key] = {
        view: m.supportedActions.includes('view'),
        add: m.supportedActions.includes('add'),
        edit: m.supportedActions.includes('edit'),
        delete: m.supportedActions.includes('delete'),
      };
    });
    setForm((prev) => ({ ...prev, permissions: allPerms }));
  };

  const clearAllPermissions = () => {
    const emptyPerms: Record<string, { view: boolean; add: boolean; edit: boolean; delete: boolean }> = {};
    AVAILABLE_MODULES.forEach((m) => {
      emptyPerms[m.key] = { view: false, add: false, edit: false, delete: false };
    });
    setForm((prev) => ({ ...prev, permissions: emptyPerms }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const isEdit = !!initial?.id;
      const url = isEdit ? `/api/admin/roles/${initial!.id}` : '/api/admin/roles';
      
      const payload = {
        name: form.name,
        permissions: form.permissions,
      };

      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(isEdit ? 'Role updated successfully' : 'Role created successfully');
        onSaved();
        onClose();
      } else {
        toast.error(data.error || 'Failed to save role');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to save role');
    } finally {
      setSaving(false);
    }
  };

  const isSystemDefault = !!(initial && (initial.name === 'employee' || initial.name === 'sales'));

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
                  <Shield size={22} className="text-brand-600" />
                  {initial?.id ? 'Edit Role Details' : 'Create Custom Role'}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Configure role-wide module availability and permission presets.
                </p>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-all">
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
              <div className="p-6 border-b border-slate-100 bg-white flex-shrink-0">
                <label htmlFor="role-name" className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">Role Name *</label>
                <input
                  id="role-name"
                  className="w-full max-w-md px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all text-slate-800 font-semibold disabled:opacity-50"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  placeholder="e.g. Sales Manager"
                  disabled={isSystemDefault}
                />
                {isSystemDefault && (
                  <p className="text-slate-400 text-xs mt-1 font-semibold">The name of system default roles cannot be changed.</p>
                )}
              </div>

              {/* Sidebar + Content Container */}
              <div className="flex flex-1 overflow-hidden bg-slate-50/50 min-h-0">
                {/* Left Sidebar - Categories */}
                <div className="w-80 bg-white border-r border-slate-100 flex flex-col flex-shrink-0 overflow-y-auto no-scrollbar p-4 space-y-2">
                  <div className="px-3 py-1 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Categories</span>
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
                        className={`w-full flex items-center justify-between text-left p-3 rounded-2xl transition-all border ${
                          isActive
                            ? 'bg-brand-50/70 border-brand-100 text-brand-900 shadow-sm shadow-brand-50/50'
                            : 'bg-white border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`p-2 rounded-xl flex-shrink-0 ${
                            isActive ? 'bg-brand-600 text-white shadow-md shadow-brand-200/50' : 'bg-slate-100 text-slate-500'
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
                        {activeInCatCount > 0 && (
                          <div className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold flex-shrink-0 ${
                            isActive ? 'bg-brand-200/60 text-brand-800' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {activeInCatCount}/{totalPossible}
                          </div>
                        )}
                      </button>
                    );
                  })}
                  
                  {/* Global settings buttons at the bottom of the sidebar */}
                  <div className="pt-4 mt-auto border-t border-slate-100 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={selectAllPermissions}
                      className="w-full text-xs font-extrabold text-brand-600 hover:text-brand-700 bg-brand-50/80 hover:bg-brand-100/80 py-2.5 rounded-xl transition-all border border-brand-100/50 text-center"
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
                </div>

                {/* Right Content Area */}
                <div className="flex-1 overflow-y-auto no-scrollbar p-6 flex flex-col">
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
                            className="text-[10px] font-black uppercase tracking-wider text-brand-600 hover:bg-brand-50/60 px-3 py-2 border border-brand-100 rounded-xl transition-all bg-white"
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
                          className="bg-white border border-slate-200/60 rounded-3xl p-5 hover:border-brand-200 hover:shadow-md hover:shadow-brand-50/10 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
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
                                    ? 'bg-brand-50/80 border-brand-200 text-brand-700 shadow-sm shadow-brand-100/30'
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
                  className="px-6 py-3 bg-brand-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-brand-700 transition-all shadow-lg shadow-brand-100 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Role'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Main Page Component ─────────────────────────────────────────────────────

export default function RolesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalInitial, setModalInitial] = useState<(RoleForm & { id?: number }) | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/roles');
      if (res.ok) {
        const data = await res.json();
        setRoles(Array.isArray(data) ? data : []);
      } else {
        setRoles([]);
      }
    } catch {
      setRoles([]);
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
        fetchRoles();
      }
    }
  }, [status, router, fetchRoles, session]);

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <RefreshCw className="animate-spin text-brand-600" size={32} />
      </div>
    );
  }

  const currentUser = session?.user as any;
  const userRole = currentUser?.role;

  // Access protection
  if (userRole !== 'superadmin' && userRole !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 mb-6">
          <Shield size={32} />
        </div>
        <h1 className="text-2xl font-black text-slate-900 mb-2">Access Denied</h1>
        <p className="text-slate-600 max-w-md">
          You do not have the required permissions to access this page. Only Superadmins can manage access roles.
        </p>
      </div>
    );
  }

  const handleDelete = (id: number, roleName: string) => {
    if (roleName === 'employee' || roleName === 'sales') {
      toast.error('System default roles cannot be deleted.');
      return;
    }
    setDeleteTarget({ id, name: roleName });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { id, name: roleName } = deleteTarget;
    setDeleteTarget(null);

    try {
      const res = await fetch(`/api/admin/roles/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (res.ok) {
        toast.success(`Role "${roleName}" deleted successfully.`);
        fetchRoles();
      } else {
        toast.error(data.error || 'Failed to delete role');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete role');
    }
  };

  const openAdd = () => {
    setModalInitial(null);
    setModalOpen(true);
  };

  const openEdit = (role: Role) => {
    setModalInitial({
      id: role.id,
      name: role.name,
      permissions: normalizePermissions(role.permissions),
    });
    setModalOpen(true);
  };

  const filteredRoles = roles.filter((role) =>
    role.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Shield className="text-brand-600" size={28} />
            Roles & Access Management
          </h1>
          <p className="text-slate-500 font-semibold text-xs mt-1">
            Define dynamic roles and pre-configure module permissions for your staff.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-brand-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-brand-700 transition-all shadow-lg shadow-brand-100"
        >
          <Plus size={16} />
          Create Role
        </button>
      </div>

      {/* Main Table View */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/40 overflow-hidden">
        
        {/* Table Filters */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/30 flex flex-col md:flex-row justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-3.5 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search roles by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all text-slate-800"
            />
          </div>
          <button
            onClick={fetchRoles}
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
              <RefreshCw size={32} className="animate-spin text-brand-600 mx-auto mb-4" />
              <p className="text-slate-500 text-xs font-semibold">Loading system roles...</p>
            </div>
          ) : filteredRoles.length === 0 ? (
            <div className="py-24 text-center">
              <Shield size={40} className="text-slate-300 mx-auto mb-4" />
              <h3 className="text-slate-900 font-black text-sm">No roles found</h3>
              <p className="text-slate-500 text-xs mt-1">Try searching for a different role name or create a new one.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-xs font-black uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4">Role Name</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Authorized Access Modules</th>
                  <th className="px-6 py-4">Created Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRoles.map((role) => {
                  const isSystemDefault = role.name === 'employee' || role.name === 'sales';
                  const permList = Array.isArray(role.permissions) ? role.permissions : [];

                  return (
                    <tr key={role.id} className="border-b border-slate-100 hover:bg-slate-50/30 transition-all group">
                      
                      {/* Name Column */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                            isSystemDefault ? 'bg-slate-100 text-slate-600' : 'bg-brand-50 text-brand-600'
                          }`}>
                            {role.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-black text-slate-900 text-sm block capitalize">{role.name}</span>
                          </div>
                        </div>
                      </td>

                      {/* Type Column */}
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          isSystemDefault 
                            ? 'bg-slate-100 text-slate-600 border border-slate-200/30' 
                            : 'bg-brand-50 text-brand-700 border border-brand-100/30'
                        }`}>
                          {isSystemDefault ? 'System Default' : 'Custom'}
                        </span>
                      </td>

                      {/* Authorized Access Column */}
                      <td className="px-6 py-5">
                        {(() => {
                          const normalized = normalizePermissions(role.permissions);
                          const activeModules = Object.entries(normalized).filter(
                            ([_, actions]) => actions.view || actions.add || actions.edit || actions.delete
                          );
                          
                          if (activeModules.length === 0) {
                            return <span className="text-slate-400 text-xs italic">No access modules allowed</span>;
                          }

                          return (
                            <div className="flex flex-wrap gap-1.5 max-w-md">
                              {activeModules.map(([moduleKey, actions]) => {
                                const mod = AVAILABLE_MODULES.find((m) => m.key === moduleKey);
                                const label = mod ? mod.label : moduleKey;
                                const actionList = [];
                                if (actions.view) actionList.push('V');
                                if (actions.add) actionList.push('A');
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

                      {/* Created Date Column */}
                      <td className="px-6 py-5">
                        <span className="text-xs font-semibold text-slate-600 block">
                          {new Date(role.created_at).toLocaleDateString()}
                        </span>
                      </td>

                      {/* Actions Column */}
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(role)}
                            className="p-2 border border-slate-200 text-slate-600 hover:text-brand-600 hover:bg-brand-50 hover:border-brand-200 rounded-xl transition-all"
                            title="Edit Role"
                            aria-label={`Edit role ${role.name}`}
                          >
                            <Edit2 size={14} />
                          </button>

                          <button
                            onClick={() => handleDelete(role.id, role.name)}
                            disabled={isSystemDefault}
                            className="p-2 border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 rounded-xl transition-all disabled:opacity-30 disabled:pointer-events-none"
                            title={isSystemDefault ? 'System role cannot be deleted' : 'Delete Role'}
                            aria-label={isSystemDefault ? `System role ${role.name} cannot be deleted` : `Delete role ${role.name}`}
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

      {/* Role Management Modal */}
      <RoleModal
        open={modalOpen}
        initial={modalInitial}
        onClose={() => setModalOpen(false)}
        onSaved={fetchRoles}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title={`Delete role "${deleteTarget?.name ?? ''}"?`}
        message={`All employees currently assigned to this role will be reset to the default "employee" role. This cannot be undone.`}
        confirmLabel="Delete Role"
        destructive
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
