import React from 'react';

export type StatusVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const VARIANT_CLASSES: Record<StatusVariant, string> = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  danger: 'bg-red-50 text-red-700 border-red-200',
  info: 'bg-brand-50 text-brand-700 border-brand-200',
  neutral: 'bg-slate-100 text-slate-600 border-slate-200',
};

/**
 * Shared status pill so success/warning/danger/info colors stay consistent
 * across admin modules (orders, invoices, AMC, quotations, inquiries, …)
 * instead of being redefined as ad-hoc Tailwind color maps per page.
 */
export default function StatusBadge({
  variant = 'neutral',
  children,
  icon,
  className = '',
}: {
  variant?: StatusVariant;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-black uppercase tracking-wider ${VARIANT_CLASSES[variant]} ${className}`}
    >
      {icon}
      {children}
    </span>
  );
}
