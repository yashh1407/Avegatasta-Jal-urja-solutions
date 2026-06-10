'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import toast, { Toaster } from 'react-hot-toast';
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
  Check
} from 'lucide-react';

interface Role {
  id: number;
  name: string;
  permissions: string[] | null;
  created_at: string;
}

interface RoleForm {
  name: string;
  permissions: string[];
}

const EMPTY_FORM: RoleForm = {
  name: '',
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

const MODULE_CATEGORIES = AVAILABLE_MODULES.reduce((acc, mod) => {
  if (!acc[mod.category]) acc[mod.category] = [];
  acc[mod.category].push(mod);
  return acc;
}, {} as Record<string, typeof AVAILABLE_MODULES>);

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

  useEffect(() => {
    if (open) {
      if (initial) {
        setForm({
          name: initial.name,
          permissions: initial.permissions || [],
        });
      } else {
        setForm(EMPTY_FORM);
      }
    }
  }, [open, initial]);

  const handlePermissionToggle = (moduleKey: string) => {
    setForm((prev) => {
      const exists = prev.permissions.includes(moduleKey);
      const newPerms = exists
        ? prev.permissions.filter((k) => k !== moduleKey)
        : [...prev.permissions, moduleKey];
      return { ...prev, permissions: newPerms };
    });
  };

  const selectAllPermissions = () => {
    const allKeys = AVAILABLE_MODULES.map((m) => m.key);
    setForm((prev) => ({ ...prev, permissions: allKeys }));
  };

  const clearAllPermissions = () => {
    setForm((prev) => ({ ...prev, permissions: [] }));
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

  const isSystemDefault = initial && (initial.name === 'employee' || initial.name === 'sales');

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
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6">
              
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">Role Name *</label>
                <input
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-slate-800 font-semibold disabled:opacity-50"
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

              {/* Permissions Checklist Area */}
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Module Access Configuration</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Select which sections of the admin panel this role can access.</p>
                  </div>
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(MODULE_CATEGORIES).map(([categoryName, modules]) => (
                    <div key={categoryName} className="border border-slate-100 rounded-2xl p-5 bg-slate-50/20">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3.5 pb-2 border-b border-slate-100">
                        {categoryName}
                      </h4>
                      <div className="space-y-3">
                        {modules.map((mod) => {
                          const active = form.permissions.includes(mod.key);
                          return (
                            <button
                              key={mod.key}
                              type="button"
                              onClick={() => handlePermissionToggle(mod.key)}
                              className={`w-full flex items-start text-left p-2.5 rounded-xl border transition-all ${
                                active
                                  ? 'bg-blue-50/30 border-blue-200/50 text-blue-900'
                                  : 'bg-white border-slate-100 hover:border-slate-200 text-slate-700'
                              }`}
                            >
                              <div
                                className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center border transition-all flex-shrink-0 mr-3 ${
                                  active
                                    ? 'bg-blue-600 border-blue-600 text-white'
                                    : 'bg-slate-50 border-slate-300'
                                }`}
                              >
                                {active && <Check size={10} className="stroke-[3]" />}
                              </div>
                              <div>
                                <span className="text-xs font-bold block leading-tight">{mod.label}</span>
                                <span className="text-[10px] text-slate-400 font-semibold block mt-0.5 leading-snug">{mod.desc}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 flex-shrink-0">
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
        <RefreshCw className="animate-spin text-blue-600" size={32} />
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

  const handleDelete = async (id: number, roleName: string) => {
    if (roleName === 'employee' || roleName === 'sales') {
      toast.error('System default roles cannot be deleted.');
      return;
    }

    if (!confirm(`Are you sure you want to delete the role "${roleName}"? All employees currently assigned to this role will be reset to the default "employee" role.`)) {
      return;
    }

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
      permissions: Array.isArray(role.permissions) ? role.permissions : [],
    });
    setModalOpen(true);
  };

  const filteredRoles = roles.filter((role) =>
    role.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Shield className="text-blue-600" size={28} />
            Roles & Access Management
          </h1>
          <p className="text-slate-500 font-semibold text-xs mt-1">
            Define dynamic roles and pre-configure module permissions for your staff.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
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
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-slate-800"
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
              <RefreshCw size={32} className="animate-spin text-blue-600 mx-auto mb-4" />
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
                <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-400">
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
                            isSystemDefault ? 'bg-slate-100 text-slate-600' : 'bg-blue-50 text-blue-600'
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
                            : 'bg-blue-50 text-blue-700 border border-blue-100/30'
                        }`}>
                          {isSystemDefault ? 'System Default' : 'Custom'}
                        </span>
                      </td>

                      {/* Authorized Access Column */}
                      <td className="px-6 py-5">
                        {permList.length === 0 ? (
                          <span className="text-slate-400 text-xs italic">No access modules allowed</span>
                        ) : (
                          <div className="flex flex-wrap gap-1 max-w-md">
                            {permList.map((p) => (
                              <span key={p} className="text-[9px] font-bold bg-slate-100 text-slate-700 border border-slate-200/50 px-1.5 py-0.5 rounded-md capitalize">
                                {p.replace('-', ' ')}
                              </span>
                            ))}
                          </div>
                        )}
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
                            className="p-2 border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 rounded-xl transition-all"
                            title="Edit Role"
                          >
                            <Edit2 size={14} />
                          </button>
                          
                          <button
                            onClick={() => handleDelete(role.id, role.name)}
                            disabled={isSystemDefault}
                            className="p-2 border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 rounded-xl transition-all disabled:opacity-30 disabled:pointer-events-none"
                            title={isSystemDefault ? 'System role cannot be deleted' : 'Delete Role'}
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
    </div>
  );
}
