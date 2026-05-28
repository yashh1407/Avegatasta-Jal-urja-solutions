'use client';

import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import {
  Mail,
  RefreshCw,
  LogOut,
  Save,
  AlertCircle,
  Check,
  Send,
} from 'lucide-react';
import Footer from '@/components/Footer';

interface SMTPSettings {
  id?: number;
  host: string;
  port: number;
  username: string;
  from_email: string;
  from_name: string;
  enabled: boolean | number;
}

export default function SMTPSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [settings, setSettings] = useState<SMTPSettings>({
    host: '',
    port: 587,
    username: '',
    from_email: '',
    from_name: 'Avegatasta',
    enabled: true,
  });

  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [passwordChanged, setPasswordChanged] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchSettings();
    }
  }, [status]);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/email-settings');
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setSettings(data);
        }
      }
    } catch (err) {
      console.error('Failed to fetch SMTP settings:', err);
      setError('Failed to load SMTP settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof SMTPSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setPasswordChanged(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload: any = { ...settings };
      if (passwordChanged && password) {
        payload.password = password;
      }

      const res = await fetch('/api/admin/email-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save settings');
      }

      const updated = await res.json();
      setSettings(updated);
      setPassword('');
      setPasswordChanged(false);
      setSuccess('SMTP settings saved successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save SMTP settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/email-settings/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to test connection');
      }

      setSuccess('SMTP connection test successful!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to test SMTP connection');
    } finally {
      setTesting(false);
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

      <main className="flex-1 container mx-auto max-w-3xl px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Mail className="text-blue-600" size={32} />
            <h1 className="text-3xl font-bold text-gray-800">SMTP Settings</h1>
          </div>
          <button
            onClick={() => signOut()}
            className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 flex items-center gap-2"
          >
            <LogOut size={18} />
            Sign Out
          </button>
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

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg border border-gray-200 p-8"
        >
          <form onSubmit={handleSave} className="space-y-6">
            {/* Enable/Disable Toggle */}
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <input
                type="checkbox"
                id="enabled"
                checked={!!settings.enabled}
                onChange={(e) => handleInputChange('enabled', e.target.checked)}
                className="w-4 h-4 cursor-pointer"
              />
              <label htmlFor="enabled" className="text-sm font-medium text-gray-700 cursor-pointer">
                Enable SMTP for email sending
              </label>
            </div>

            {/* SMTP Host */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SMTP Host *
              </label>
              <input
                type="text"
                value={settings.host}
                onChange={(e) => handleInputChange('host', e.target.value)}
                placeholder="e.g., smtp.gmail.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* SMTP Port */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Port *
                </label>
                <input
                  type="number"
                  value={settings.port}
                  onChange={(e) => handleInputChange('port', parseInt(e.target.value))}
                  placeholder="587"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">587 (TLS) or 465 (SSL)</p>
              </div>

              {/* From Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Name
                </label>
                <input
                  type="text"
                  value={settings.from_name}
                  onChange={(e) => handleInputChange('from_name', e.target.value)}
                  placeholder="Avegatasta"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* From Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Email *
              </label>
              <input
                type="email"
                value={settings.from_email}
                onChange={(e) => handleInputChange('from_email', e.target.value)}
                placeholder="noreply@avegatasta.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username / Email *
              </label>
              <input
                type="text"
                value={settings.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="Your SMTP username or email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password {!passwordChanged && '(not changed)'}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                placeholder={passwordChanged ? 'Enter new password' : 'Password will not be displayed for security'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                {!passwordChanged
                  ? 'Password is encrypted. Leave empty to keep current password.'
                  : 'New password will be encrypted.'}
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testing || !settings.host || !settings.port}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-400 flex items-center gap-2"
              >
                <Send size={18} />
                {testing ? 'Testing...' : 'Test Connection'}
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
              >
                <Save size={18} />
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t space-y-3">
            <h3 className="font-semibold text-gray-800">Connection Details</h3>
            <p className="text-sm text-gray-600">
              <strong>Current Host:</strong> {settings.host || 'Not configured'}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Current Port:</strong> {settings.port || 'Not configured'}
            </p>
            <p className="text-sm text-gray-600">
              <strong>From Email:</strong> {settings.from_email || 'Not configured'}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Status:</strong>{' '}
              <span className={!!settings.enabled ? 'text-green-600' : 'text-gray-600'}>
                {!!settings.enabled ? 'Enabled' : 'Disabled'}
              </span>
            </p>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
