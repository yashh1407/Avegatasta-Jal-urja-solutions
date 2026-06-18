'use client';

import React, { useEffect, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';

/**
 * Accessible, branded confirmation dialog to replace native window.confirm()
 * (which is off-brand and blocks the main thread). Controlled component:
 * render it with `open` and handle `onConfirm` / `onCancel`.
 *
 * Focus moves to Cancel on open, Escape cancels, click-outside cancels,
 * role="alertdialog" + aria wiring for screen readers.
 */
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby={message ? 'confirm-dialog-desc' : undefined}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6"
      >
        <div className="flex items-start gap-3 mb-5">
          {destructive && (
            <span className="shrink-0 w-9 h-9 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
              <AlertTriangle size={18} />
            </span>
          )}
          <div>
            <h2 id="confirm-dialog-title" className="text-base font-black text-slate-900">
              {title}
            </h2>
            {message && (
              <p id="confirm-dialog-desc" className="text-sm text-slate-500 mt-1">
                {message}
              </p>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button
            ref={cancelRef}
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-sm font-black text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-xl text-sm font-black text-white transition-colors ${
              destructive ? 'bg-red-600 hover:bg-red-700' : 'bg-brand-600 hover:bg-brand-700'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
